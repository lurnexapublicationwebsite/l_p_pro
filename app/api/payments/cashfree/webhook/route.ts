import { NextResponse } from "next/server";
import crypto from "crypto";
import { pool } from "@/lib/dbPool";
import { sendOrderConfirmationEmails } from "@/lib/mailService";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headers = req.headers;
    const signature = headers.get("x-webhook-signature") || "";
    const timestamp = headers.get("x-webhook-timestamp") || "";
    const secretKey = process.env.CASHFREE_SECRET_KEY || "";

    if (!secretKey) {
      console.error("❌ Cashfree API secret key configuration is missing.");
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }

    // Verify signature
    const signatureString = timestamp + rawBody;
    const calculatedSignature = crypto
      .createHmac("sha256", secretKey)
      .update(signatureString)
      .digest("base64");

    if (calculatedSignature !== signature) {
      console.warn("⚠️ Invalid webhook signature detected.");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Parse payload
    const payload = JSON.parse(rawBody);
    const data = payload.data || {};
    const order = data.order || {};
    const orderId = order.order_id;
    const payment = data.payment || {};
    const paymentStatus = payment.payment_status;
    const transactionId = payment.cf_payment_id || `CF_${orderId}`;

    if (paymentStatus === "SUCCESS") {
      // Check if order already processed in database
      const prevOrderRes = await pool.query(
        "SELECT status FROM textbooks_purchases WHERE order_id = $1",
        [orderId]
      );

      const isAlreadyPaid = prevOrderRes.rows.length > 0 && prevOrderRes.rows[0].status === "PAID";
      if (isAlreadyPaid) {
        return NextResponse.json({ success: true, message: "Order already verified and updated" });
      }

      // Order tags are sent inside order_tags from creation payload
      const tags = order.order_tags || {};
      const amount = order.order_amount || 499;
      const bookId = tags.book_id || "1";
      const customerDetails = order.customer_details || {};
      const customerPhone = customerDetails.customer_phone || tags.customer_phone || "9999999999";
      const customerName = customerDetails.customer_name || tags.customer_name || "Customer";
      const customerEmail = customerDetails.customer_email || tags.customer_email || "customer@lurnexa.in";
      const shippingAddress = tags.shipping_address || "";
      const postalCode = tags.postal_code || tags.shipping_pincode || "";
      const couponCode = tags.coupon_code || "";
      const discountAmount = Number(tags.discount_amount || 0);
      const gstAmount = Number(tags.gst_amount || 0);
      const shippingAmount = Number(tags.shipping_amount || 0);
      const city = tags.city || "";
      const state = tags.state || "";
      const country = tags.country || "India";
      const quantity = Number(tags.quantity || 1);
      const subtotal = Number(tags.subtotal || amount);

      const orderObj = {
        order_id: orderId,
        user_identifier: customerPhone,
        book_id: bookId,
        amount,
        status: "PAID",
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress,
        shipping_pincode: postalCode,
        coupon_code: couponCode,
        discount_amount: discountAmount,
        gst_amount: gstAmount,
        shipping_amount: shippingAmount,
        city,
        state,
        country,
        quantity,
        subtotal,
        cashfree_order_id: orderId,
        cashfree_payment_id: transactionId,
        payment_status: "PAID",
        order_status: "CONFIRMED",
        purchase_format: tags.purchase_format || (shippingAddress === "Soft Copy Access" ? "soft" : "physical"),
        purchase_plan: tags.purchase_plan || "physical",
        access_id: tags.access_id || ""
      };

      // Insert order details
      await pool.query(
        `INSERT INTO textbooks_purchases (
          order_id, user_identifier, book_id, amount, status,
          customer_name, customer_email, customer_phone, shipping_address, shipping_pincode,
          coupon_code, discount_amount, gst_amount, shipping_amount,
          city, state, country, quantity, subtotal,
          cashfree_order_id, cashfree_payment_id, payment_status, order_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          orderObj.order_id,
          orderObj.user_identifier,
          orderObj.book_id,
          orderObj.amount,
          orderObj.status,
          orderObj.customer_name,
          orderObj.customer_email,
          orderObj.customer_phone,
          orderObj.shipping_address,
          orderObj.shipping_pincode,
          orderObj.coupon_code,
          orderObj.discount_amount,
          orderObj.gst_amount,
          orderObj.shipping_amount,
          orderObj.city,
          orderObj.state,
          orderObj.country,
          orderObj.quantity,
          orderObj.subtotal,
          orderObj.cashfree_order_id,
          orderObj.cashfree_payment_id,
          orderObj.payment_status,
          orderObj.order_status
        ]
      );

      // Always update user's plan and add the purchased book to their profile if they have an account
      const userCheck = await pool.query(
        "SELECT plan, purchased_books FROM textbooks_users WHERE mobile_number = $1",
        [customerPhone]
      );
      if (userCheck.rows.length > 0) {
        const currentUser = userCheck.rows[0];
        let pBooks = Array.isArray(currentUser.purchased_books) ? currentUser.purchased_books : [];
        if (!pBooks.includes(bookId)) {
          pBooks.push(bookId);
        }
        const targetPlan = tags.purchase_plan || "complete";
        await pool.query(
          `UPDATE textbooks_users SET plan = $1, purchased_books = $2 WHERE mobile_number = $3`,
          [targetPlan, JSON.stringify(pBooks), customerPhone]
        );
      }

      const accessId = tags.access_id || "";
      const plan = tags.purchase_plan || "physical";
      if (accessId) {
        // Pre-approve the access ID (unassigned)
        await pool.query(
          `INSERT INTO textbooks_allowed_access_ids (access_id, book_id, role, assigned_to, plan)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (access_id) DO UPDATE SET plan = EXCLUDED.plan`,
          [accessId, bookId, 'student', null, plan]
        );
      }

      // Send emails
      try {
        await sendOrderConfirmationEmails(orderObj);
      } catch (err) {
        console.error("❌ Failed to send webhook order emails:", err);
      }
      return NextResponse.json({ success: true, message: "Order processed successfully" });
    }

    return NextResponse.json({ success: true, message: "Webhook ignored" });

  } catch (err: any) {
    console.error("❌ Error in webhook API handler:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
