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

    // Validate billing details
    if (!bookId || !price || !customerPhone || !customerEmail || !customerName || !shippingAddress || !postalCode) {
      return NextResponse.json({ error: "Missing required booking and shipping details." }, { status: 400 });
    }

    const orderId = `LURN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Generate sequential Access ID on the server
    let finalAccessId = "";
    if (format === "upgrade") {
      finalAccessId = accessId || "";
    } else if (format === "soft" || plan !== "physical") {
      const subjectCode = getBookCode(bookId) || "GEN";
      const cleanCollegeCode = (collegeCode && collegeCode !== "others") ? collegeCode.toUpperCase() : "OT";
      const prefix = `LS${subjectCode}${cleanCollegeCode}`;

      // Query database for matching IDs to get next sequence number
      const existingRes = await pool.query(
        `SELECT access_id FROM textbooks_allowed_access_ids 
         WHERE UPPER(access_id) LIKE $1`,
        [`${prefix}%`]
      );

      const matches = existingRes.rows
        .filter(row => row.access_id.toUpperCase().startsWith(prefix.toUpperCase()))
        .map(row => {
          const numPart = row.access_id.slice(prefix.length);
          const parsed = parseInt(numPart, 10);
          return isNaN(parsed) ? 0 : parsed;
        });

      const nextNum = matches.length > 0 ? Math.max(...matches) + 1 : 26001;
      finalAccessId = `${prefix}${nextNum}`;
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

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cashfree order creation failed:", data);
      return NextResponse.json({ error: data.message || "Failed to create Cashfree order." }, { status: 500 });
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
