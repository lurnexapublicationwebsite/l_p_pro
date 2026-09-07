import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getBookCode } from "@/lib/dbClient";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      bookId, 
      bookTitle, 
      price, 
      customerName, 
      customerEmail, 
      customerPhone,
      shippingAddress,
      city,
      state,
      country,
      postalCode,
      couponCode,
      discountAmount,
      gstAmount,
      shippingAmount,
      quantity = 1,
      subtotal,
      format,
      plan,
      collegeCode,
      accessId
    } = body;

    const isDigitalFormat = format === "soft" || format === "rental" || format === "upgrade";
    const finalShippingAddress = shippingAddress || (isDigitalFormat ? (format === "rental" ? "Digital Rental eBook Access" : "Digital Delivery (Email & Portal Access)") : "");
    const finalPostalCode = postalCode || (isDigitalFormat ? "000000" : "");

    // Validate billing details
    if (!bookId || !price || !customerPhone || !customerEmail || !customerName || !finalShippingAddress || !finalPostalCode) {
      return NextResponse.json({ error: "Missing required booking and customer contact details." }, { status: 400 });
    }

    // Backend restriction for ML book (id 2) and AI book (id 6) softcopy plans
    if ((bookId === "2" || bookId === "6") && format === "soft" && ["caselet", "book_caselet", "book_caselet_portal"].includes(plan)) {
      return NextResponse.json({ error: "Selected soft copy plan is not available for this textbook." }, { status: 400 });
    }

    const orderId = `LURN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Determine Access ID: Reuse existing user Access ID if user already exists, or generate a single unique Access ID
    let finalAccessId = accessId || "";

    if (!finalAccessId && (customerEmail || customerPhone)) {
      try {
        const existingUserRes = await pool.query(
          "SELECT access_id FROM textbooks_users WHERE (college_email IS NOT NULL AND LOWER(college_email) = $1) OR mobile_number = $2",
          [customerEmail ? customerEmail.trim().toLowerCase() : "", customerPhone ? customerPhone.trim() : ""]
        );
        if (existingUserRes.rows.length > 0 && existingUserRes.rows[0].access_id) {
          finalAccessId = existingUserRes.rows[0].access_id;
        } else {
          const existingPurchaseRes = await pool.query(
            "SELECT access_id FROM textbooks_purchases WHERE (customer_email IS NOT NULL AND LOWER(customer_email) = $1) OR customer_phone = $2",
            [customerEmail ? customerEmail.trim().toLowerCase() : "", customerPhone ? customerPhone.trim() : ""]
          );
          if (existingPurchaseRes.rows.length > 0 && existingPurchaseRes.rows[0].access_id) {
            finalAccessId = existingPurchaseRes.rows[0].access_id;
          }
        }
      } catch (err) {
        console.error("Error looking up existing user access ID:", err);
      }
    }

    if (!finalAccessId) {
      const cleanCollegeCode = (collegeCode && collegeCode !== "others") ? collegeCode.toUpperCase() : "OT";
      const prefix = `LURN${cleanCollegeCode}`;

      try {
        const allowedRes = await pool.query("SELECT access_id FROM textbooks_allowed_access_ids WHERE UPPER(access_id) LIKE $1", [`${prefix}%`]);
        const usersRes = await pool.query("SELECT access_id FROM textbooks_users WHERE UPPER(access_id) LIKE $1", [`${prefix}%`]);
        const purchasesRes = await pool.query("SELECT access_id FROM textbooks_purchases WHERE UPPER(access_id) LIKE $1", [`${prefix}%`]);

        const existingSet = new Set([
          ...allowedRes.rows.map(r => String(r.access_id).toUpperCase()),
          ...usersRes.rows.map(r => String(r.access_id).toUpperCase()),
          ...purchasesRes.rows.map(r => String(r.access_id).toUpperCase())
        ]);

        let randomDigits = Math.floor(10000 + Math.random() * 90000);
        let candidate = `${prefix}${randomDigits}`;
        while (existingSet.has(candidate.toUpperCase())) {
          randomDigits = Math.floor(10000 + Math.random() * 90000);
          candidate = `${prefix}${randomDigits}`;
        }
        finalAccessId = candidate;
      } catch (e) {
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        finalAccessId = `${prefix}${randomDigits}`;
      }
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "TEST";

    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree API configuration is missing." }, { status: 500 });
    }

    // Setup fallback redirect/return URL
    const headers = req.headers;
    const host = headers.get("host") || "localhost:3000";
    // Cashfree Production environment strictly requires HTTPS for return_url
    const protocol = env.toUpperCase() === "PRODUCTION" ? "https" : (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    let returnUrl = `${protocol}://${host}/textbooks/store/checkout?order_id={order_id}&bookId=${bookId}`;
    if (format === "upgrade") {
      returnUrl = `${protocol}://${host}/textbooks/portal/login?order_id={order_id}`;
    }

    // Call Cashfree API directly to create the order
    const cashfreeUrl = env.toUpperCase() === "PRODUCTION"
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    let data: any;
    try {
      const response = await fetch(cashfreeUrl, {
        method: "POST",
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2023-08-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_amount: price,
          order_currency: "INR",
          order_id: orderId,
          customer_details: {
            customer_id: `cust_${Date.now()}`,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone
          },
          order_meta: {
            return_url: returnUrl
          },
          order_tags: {
            book_id: bookId,
            quantity: String(quantity),
            shipping_address: shippingAddress,
            city: city || "",
            state: state || "",
            postal_code: postalCode,
            subtotal: String(subtotal || price),
            discount_amount: String(discountAmount || 0),
            gst_amount: String(gstAmount || 0),
            shipping_amount: String(shippingAmount || 0),
            coupon_code: couponCode || "",
            purchase_format: format || "physical",
            purchase_plan: plan || "physical",
            access_id: finalAccessId || ""
          }
        })
      });

      if (!response.ok) {
        // Cashfree can return a non-JSON error page (e.g. a gateway timeout HTML page) —
        // read as text first so that case doesn't throw an opaque JSON-parse error instead
        // of a clear message.
        const errBody = await response.text();
        console.error(`❌ Cashfree order creation failed (${response.status}):`, errBody.slice(0, 500));
        return NextResponse.json(
          { error: "The payment gateway is temporarily unavailable. Please try again in a moment." },
          { status: 502 }
        );
      }

      data = await response.json();
      if (!data.payment_session_id) {
        console.error("❌ Cashfree order creation returned no payment_session_id:", JSON.stringify(data).slice(0, 500));
        return NextResponse.json(
          { error: "The payment gateway did not return a valid session. Please try again." },
          { status: 502 }
        );
      }
    } catch (cfErr: any) {
      console.error("❌ Cashfree order-create request failed:", cfErr?.message || cfErr);
      return NextResponse.json(
        { error: "Could not reach the payment gateway. Please check your connection and try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      order_id: data.order_id,
      payment_session_id: data.payment_session_id
    });

  } catch (err: any) {
    console.error("❌ Error in create-order API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
