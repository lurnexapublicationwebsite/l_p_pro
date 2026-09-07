import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { generateRentalId, getRentalPlanByCode, getRentalGST, getRentalTotal } from "@/lib/data/rentals";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rentalId, newPlanCode } = body;

    if (!rentalId || !newPlanCode) {
      return NextResponse.json(
        { error: "Missing required fields: rentalId, newPlanCode." },
        { status: 400 }
      );
    }

    // Fetch existing rental
    const res = await pool.query(`SELECT * FROM book_rentals WHERE rental_id = $1`, [rentalId]);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Rental record not found." }, { status: 404 });
    }

    const parentRental = res.rows[0];

    // Check new plan
    const newPlan = getRentalPlanByCode(newPlanCode);
    if (!newPlan) {
      return NextResponse.json({ error: "Invalid renewal plan code." }, { status: 400 });
    }

    const basePrice = newPlan.price;
    const gstAmount = getRentalGST(basePrice);
    const totalAmount = getRentalTotal(basePrice);

    const renewalRentalId = generateRentalId();
    const cashfreeOrderId = `RENEW_CF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const headers = req.headers;
    const ipAddress = headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headers.get("user-agent") || "";

    const newRenewalCount = (parentRental.renewal_count || 0) + 1;

    // Create pending renewal rental record
    await pool.query(
      `INSERT INTO book_rentals (
        rental_id, user_email, user_phone, user_name, book_id, plan_code,
        status, amount_paid, gst_amount, total_amount, cashfree_order_id,
        payment_status, is_renewal, parent_rental_id, renewal_count,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        renewalRentalId,
        parentRental.user_email,
        parentRental.user_phone || '',
        parentRental.user_name || '',
        parentRental.book_id,
        newPlanCode,
        'pending',
        basePrice,
        gstAmount,
        totalAmount,
        cashfreeOrderId,
        'pending',
        true,
        rentalId,
        newRenewalCount,
        ipAddress,
        userAgent
      ]
    );

    // Call Cashfree if configured. A mock session is used ONLY when no credentials are
    // configured at all — if real credentials are set but the call fails, that must
    // surface as a real error, never a silent fallback session id Cashfree will reject.
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "TEST";

    let paymentSessionId: string;

    if (!appId || !secretKey) {
      paymentSessionId = `session_mock_renew_${Date.now()}`;
    } else {
      const host = headers.get("host") || "localhost:3000";
      const protocol = env.toUpperCase() === "PRODUCTION" ? "https" : (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      const returnUrl = `${protocol}://${host}/textbooks/store/checkout?order_id={order_id}&rental_id=${renewalRentalId}&format=rental&is_renewal=true`;

      const cashfreeUrl = env.toUpperCase() === "PRODUCTION"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

      try {
        const cfRes = await fetch(cashfreeUrl, {
          method: "POST",
          headers: {
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2023-08-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_amount: totalAmount,
            order_currency: "INR",
            order_id: cashfreeOrderId,
            customer_details: {
              customer_id: `cust_${Date.now()}`,
              customer_name: parentRental.user_name || "Reader",
              customer_email: parentRental.user_email,
              customer_phone: parentRental.user_phone || "9999999999"
            },
            order_meta: {
              return_url: returnUrl
            },
            order_tags: {
              rental_id: renewalRentalId,
              parent_rental_id: rentalId,
              book_id: parentRental.book_id,
              plan_code: newPlanCode,
              is_renewal: "true"
            }
          })
        });

        if (!cfRes.ok) {
          const errBody = await cfRes.text();
          console.error(`❌ Cashfree order-create failed (${cfRes.status}) for renewal ${renewalRentalId}:`, errBody.slice(0, 500));
          return NextResponse.json(
            { error: "The payment gateway is temporarily unavailable. Please try again in a moment." },
            { status: 502 }
          );
        }

        const cfData = await cfRes.json();
        if (!cfData.payment_session_id) {
          console.error(`❌ Cashfree order-create returned no payment_session_id for renewal ${renewalRentalId}:`, JSON.stringify(cfData).slice(0, 500));
          return NextResponse.json(
            { error: "The payment gateway did not return a valid session. Please try again." },
            { status: 502 }
          );
        }
        paymentSessionId = cfData.payment_session_id;
      } catch (cfErr: any) {
        console.error(`❌ Cashfree order-create request failed for renewal ${renewalRentalId}:`, cfErr?.message || cfErr);
        return NextResponse.json(
          { error: "Could not reach the payment gateway. Please check your connection and try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      renewalRentalId,
      orderId: cashfreeOrderId,
      paymentSessionId,
      amount: totalAmount,
      currency: "INR"
    });

  } catch (err: any) {
    console.error("❌ Error in rental renew API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
