import { NextResponse } from "next/server";
import { pool, initDbTables } from "@/lib/dbPool";
import { generateRentalId, getRentalPlanByCode, getRentalGST, getRentalTotal } from "@/lib/data/rentals";
import { getBookBySlug, PUBLISHED_BOOKS_DATA } from "@/lib/data/books";

export async function POST(req: Request) {
  try {
    try {
      await initDbTables();
    } catch (tblErr) {
      console.warn("⚠️ Warning initializing DB tables in rental create route:", tblErr);
    }

    const body = await req.json();
    const {
      bookId,
      planCode,
      customerEmail,
      customerPhone,
      customerName,
      isRenewal = false,
      parentRentalId = null
    } = body;

    // Validation
    if (!bookId || !planCode || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: bookId, planCode, customerEmail." },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = PUBLISHED_BOOKS_DATA.find(b => b.id === bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }

    // Check rental plan
    const plan = getRentalPlanByCode(planCode);
    if (!plan) {
      return NextResponse.json({ error: "Invalid rental plan code." }, { status: 400 });
    }

    // Pricing calculation
    const basePrice = plan.price;
    const gstAmount = getRentalGST(basePrice);
    const totalAmount = getRentalTotal(basePrice);

    const rentalId = generateRentalId();
    const cashfreeOrderId = `RENT_CF_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const headers = req.headers;
    const ipAddress = headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headers.get("user-agent") || "";

    // Save initial pending rental record
    await pool.query(
      `INSERT INTO book_rentals (
        rental_id, user_email, user_phone, user_name, book_id, plan_code,
        status, amount_paid, gst_amount, total_amount, cashfree_order_id,
        payment_status, is_renewal, parent_rental_id, renewal_count,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        rentalId,
        customerEmail.trim().toLowerCase(),
        customerPhone || '',
        customerName || '',
        bookId,
        planCode,
        'pending',
        basePrice,
        gstAmount,
        totalAmount,
        cashfreeOrderId,
        'pending',
        isRenewal,
        parentRentalId,
        0,
        ipAddress,
        userAgent
      ]
    );

    // Call Cashfree API directly to create the order. A mock session is used ONLY when
    // no Cashfree credentials are configured at all (local dev convenience) — if real
    // credentials are set but the call itself fails, that must surface as a real error,
    // never a silent fallback to a session id Cashfree's checkout widget will just reject.
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "TEST";

    let paymentSessionId: string;

    if (!appId || !secretKey) {
      paymentSessionId = `session_mock_${Date.now()}`;
    } else {
      const host = headers.get("host") || "localhost:3000";
      const protocol = env.toUpperCase() === "PRODUCTION" ? "https" : (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
      const returnUrl = `${protocol}://${host}/textbooks/store/checkout?order_id={order_id}&rental_id=${rentalId}&format=rental`;

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
              customer_name: customerName || "Reader",
              customer_email: customerEmail,
              customer_phone: customerPhone || "9999999999"
            },
            order_meta: {
              return_url: returnUrl
            },
            order_tags: {
              rental_id: rentalId,
              book_id: bookId,
              plan_code: planCode,
              purchase_format: "rental"
            }
          })
        });

        if (!cfRes.ok) {
          const errBody = await cfRes.text();
          console.error(`❌ Cashfree order-create failed (${cfRes.status}) for rental ${rentalId}:`, errBody.slice(0, 500));
          return NextResponse.json(
            { error: "The payment gateway is temporarily unavailable. Please try again in a moment." },
            { status: 502 }
          );
        }

        const cfData = await cfRes.json();
        if (!cfData.payment_session_id) {
          console.error(`❌ Cashfree order-create returned no payment_session_id for rental ${rentalId}:`, JSON.stringify(cfData).slice(0, 500));
          return NextResponse.json(
            { error: "The payment gateway did not return a valid session. Please try again." },
            { status: 502 }
          );
        }
        paymentSessionId = cfData.payment_session_id;
      } catch (cfErr: any) {
        console.error(`❌ Cashfree order-create request failed for rental ${rentalId}:`, cfErr?.message || cfErr);
        return NextResponse.json(
          { error: "Could not reach the payment gateway. Please check your connection and try again." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      rentalId,
      orderId: cashfreeOrderId,
      paymentSessionId,
      amount: totalAmount,
      currency: "INR"
    });

  } catch (err: any) {
    console.error("❌ Error in rental create API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
