import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { sendOrderConfirmationEmails } from "@/lib/mailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, isDemo, mockDetails } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId parameter" }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "TEST";

    // Check if order is already created and paid in the database
    const prevOrderRes = await pool.query(
      "SELECT status, order_status FROM textbooks_purchases WHERE order_id = $1",
      [orderId]
    );

    const isAlreadyPaid = prevOrderRes.rows.length > 0 && prevOrderRes.rows[0].status === "PAID";

    if (isAlreadyPaid) {
      return NextResponse.json({ success: true, status: "PAID", message: "Order already verified and created." });
    }

    let targetStatus = "PENDING";
    let tags: Record<string, string> = {};
    let transactionId = "";

    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree API configuration is missing." }, { status: 500 });
    }

    // Production/Sandbox Cashfree Verification flow
    const cashfreeUrl = env.toUpperCase() === "PRODUCTION" 
      ? `https://api.cashfree.com/pg/orders/${orderId}` 
      : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

    const response = await fetch(cashfreeUrl, {
      method: "GET",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Cashfree verify API error:", data);
      return NextResponse.json({ error: data.message || "Failed to verify order on Cashfree" }, { status: 500 });
    }

    targetStatus = data.order_status; // e.g. "PAID", "ACTIVE", "FAILED"
    tags = data.order_tags || {};
    
    // Attempt to retrieve a payment transaction ID
    if (data.payments && data.payments.length > 0) {
      transactionId = data.payments[0].cf_payment_id || "";
    } else {
      transactionId = `CF_${orderId}`;
    }

    if (targetStatus === "PAID") {
      // Calculate amounts
      const amount = Number(data.order_amount || tags.total_amount || tags.subtotal || 499);
      const bookId = tags.book_id || "1";
      const customerPhone = data.customer_details?.customer_phone || tags.customer_phone || "9999999999";
      const customerName = data.customer_details?.customer_name || tags.customer_name || "Customer";
      const customerEmail = data.customer_details?.customer_email || tags.customer_email || "customer@lurnexa.in";
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
      let accessId = tags.access_id || "";
      const plan = tags.purchase_plan || "physical";

      if (!accessId && (customerEmail || customerPhone)) {
        try {
          const existingUserRes = await pool.query(
            "SELECT access_id FROM textbooks_users WHERE (email IS NOT NULL AND LOWER(email) = $1) OR (college_email IS NOT NULL AND LOWER(college_email) = $1) OR mobile_number = $2",
            [customerEmail ? customerEmail.trim().toLowerCase() : "", customerPhone ? customerPhone.trim() : ""]
          );
          if (existingUserRes.rows.length > 0 && existingUserRes.rows[0].access_id) {
            accessId = existingUserRes.rows[0].access_id;
          } else {
            const existingPurchaseRes = await pool.query(
              "SELECT access_id FROM textbooks_purchases WHERE ((customer_email IS NOT NULL AND LOWER(customer_email) = $1) OR customer_phone = $2) AND access_id != '' AND access_id != 'LURNEXA'",
              [customerEmail ? customerEmail.trim().toLowerCase() : "", customerPhone ? customerPhone.trim() : ""]
            );
            if (existingPurchaseRes.rows.length > 0 && existingPurchaseRes.rows[0].access_id) {
              accessId = existingPurchaseRes.rows[0].access_id;
            }
          }
        } catch (err) {
          console.error("Error looking up accessId fallback in verify route:", err);
        }
      }

      if (!accessId) {
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        accessId = `LURNOT${randomDigits}`;
      }

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
        purchase_format: tags.purchase_format || (shippingAddress.includes("Digital") || shippingAddress === "Soft Copy Access" ? "soft" : "physical"),
        purchase_plan: tags.purchase_plan || "physical",
        access_id: accessId
      };

      // Create order ONLY AFTER successful payment verification
      await pool.query(
        `INSERT INTO textbooks_purchases (
          order_id, user_identifier, book_id, amount, status,
          customer_name, customer_email, customer_phone, shipping_address, shipping_pincode,
          coupon_code, discount_amount, gst_amount, shipping_amount,
          city, state, country, quantity, subtotal,
          cashfree_order_id, cashfree_payment_id, payment_status, order_status,
          purchase_format, purchase_plan, access_id
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
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
          orderObj.order_status,
          orderObj.purchase_format,
          orderObj.purchase_plan,
          orderObj.access_id
        ]
      );

      // Always update user's plan and add the purchased book(s) to their profile under their 1 Access ID
      const userCheck = await pool.query(
        "SELECT access_id, plan, purchased_books FROM textbooks_users WHERE mobile_number = $1 OR (email IS NOT NULL AND LOWER(email) = $2) OR (college_email IS NOT NULL AND LOWER(college_email) = $2)",
        [customerPhone, customerEmail.toLowerCase()]
      );

      const newBookIds = bookId.includes(",") ? bookId.split(",").map(b => b.trim()) : [bookId];

      if (userCheck.rows.length > 0) {
        const currentUser = userCheck.rows[0];
        if (currentUser.access_id) {
          accessId = currentUser.access_id;
          orderObj.access_id = currentUser.access_id;
          // Update order record with exact user access ID
          try {
            await pool.query("UPDATE textbooks_purchases SET access_id = $1 WHERE order_id = $2", [accessId, orderId]);
          } catch (e) {}
        }
        let pBooks = Array.isArray(currentUser.purchased_books) ? currentUser.purchased_books : [];
        newBookIds.forEach(id => {
          if (id && id !== "CART" && !pBooks.includes(id)) {
            pBooks.push(id);
          }
        });
        const targetPlan = tags.purchase_plan || "complete";
        await pool.query(
          `UPDATE textbooks_users SET plan = $1, purchased_books = $2 WHERE mobile_number = $3 OR (email IS NOT NULL AND LOWER(email) = $4) OR (college_email IS NOT NULL AND LOWER(college_email) = $4)`,
          [targetPlan, JSON.stringify(pBooks), customerPhone, customerEmail.toLowerCase()]
        );
      } else if (accessId) {
        // Create user record for new customer with their single unique Access ID
        const initialBooks = newBookIds.filter(id => id && id !== "CART");
        await pool.query(
          `INSERT INTO textbooks_users (name, mobile_number, book_id, role, college_name, college_email, email, is_active, access_id, plan, purchased_books)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            customerName,
            customerPhone,
            bookId,
            'student',
            tags.college_name || 'General',
            customerEmail,
            customerEmail,
            true,
            accessId,
            plan,
            JSON.stringify(initialBooks)
          ]
        );
      }

      if (accessId) {
        // Pre-approve/assign the access ID
        await pool.query(
          `INSERT INTO textbooks_allowed_access_ids (access_id, book_id, role, assigned_to, plan)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (access_id) DO UPDATE SET plan = EXCLUDED.plan, assigned_to = EXCLUDED.assigned_to`,
          [accessId, bookId, 'student', customerPhone, plan]
        );
      }

      // Dispatch order confirmation email notifications in the background — email delivery
      // (SMTP handshake, provider latency) must never block the customer's "payment succeeded"
      // response, which otherwise leaves them staring at a spinner for many seconds.
      sendOrderConfirmationEmails(orderObj).catch((err) => {
        console.error("❌ Failed to send order emails:", err);
      });

      return NextResponse.json({
        success: true,
        status: "PAID",
        order: orderObj
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        status: targetStatus, 
        message: `Payment status is ${targetStatus}` 
      });
    }

  } catch (err: any) {
    console.error("❌ Error in verify-order route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
