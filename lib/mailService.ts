import nodemailer from "nodemailer";

export const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const getQuotationTransporter = () => {
  const host = process.env.QUOTATION_SMTP_HOST;
  const port = parseInt(process.env.QUOTATION_SMTP_PORT || "587", 10);
  const user = process.env.QUOTATION_SMTP_USER;
  const pass = process.env.QUOTATION_SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};


export async function sendOrderConfirmationEmails(order: {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_pincode: string;
  coupon_code: string;
  discount_amount: number;
  gst_amount: number;
  shipping_amount: number;
  amount: number;
  book_id: string;
  cashfree_payment_id?: string;
}) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@lurnexa.in";

  // Map book_id to book titles
  const bookTitles: Record<string, string> = {
    "1": "Indian Mineral Import Policy Options",
    "2": "Machine Learning: A Structured Approach",
    "3": "Database Management Systems: Concepts & Design",
    "4": "Entrepreneurship Development: Concepts to Creation"
  };
  const bookTitle = bookTitles[order.book_id] || `Textbook ID: ${order.book_id}`;

  const customerMailOptions = {
    from,
    to: order.customer_email,
    subject: `Order Confirmed – Lurnexa Publications`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Order Confirmed!</h2>
        <p>Dear ${order.customer_name || 'Customer'},</p>
        <p>Thank you for your purchase from Lurnexa Publications! Your online payment was successful and your printed textbook is being prepared for shipment.</p>
        <p><strong>Payment Status:</strong> Paid Online (Prepaid via Cashfree)</p>
        ${order.cashfree_payment_id ? `<p><strong>Transaction ID:</strong> ${order.cashfree_payment_id}</p>` : ''}
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #334155;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Order ID:</td>
              <td style="padding: 6px 0; color: #0f172a;">${order.order_id}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Book Title:</td>
              <td style="padding: 6px 0; color: #0f172a;">${bookTitle}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Amount Paid:</td>
              <td style="padding: 6px 0; color: #4F46E5; font-weight: bold;">₹${order.amount}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #334155;">Shipping Address</h3>
          <p style="margin: 0; font-size: 14px; color: #0f172a; line-height: 1.5;">
            ${order.shipping_address}<br/>
            <strong>Pincode:</strong> ${order.shipping_pincode}
          </p>
        </div>

        <p style="font-size: 14px; color: #475569;">
          Your physical printed copy of the textbook will be packed and shipped to the address provided within 24–48 hours. You will receive tracking details once the shipment is processed.
        </p>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          Lurnexa Publications &copy; 2026. All rights reserved.
        </p>
      </div>
    `
  };

  const adminMailOptions = {
    from,
    to: "lurnexapublication@gmail.com",
    subject: `New Paid Order Received`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #f8fafc;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; margin-top: 0;">New Prepaid Order Received</h2>
        <p>A new prepaid order has been successfully processed on the Lurnexa Bookstore via Cashfree.</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 14px; margin-bottom: 20px;">
          <tr style="background-color: #f1f5f9;">
            <th colspan="2" style="padding: 10px; text-align: left; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Order Information</th>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; width: 150px; border-bottom: 1px solid #f1f5f9;">Order ID</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${order.order_id}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Cashfree Pay ID</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${order.cashfree_payment_id || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Book Ordered</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${bookTitle} (ID: ${order.book_id})</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Total Amount Paid</td>
            <td style="padding: 10px; color: #10B981; font-weight: bold; border-bottom: 1px solid #f1f5f9;">₹${order.amount}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">GST Amount</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">₹${order.gst_amount}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Shipping Amount</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">₹${order.shipping_amount}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Discount / Coupon</td>
            <td style="padding: 10px; color: #dc2626; border-bottom: 1px solid #f1f5f9;">₹${order.discount_amount} (${order.coupon_code || 'None'})</td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 14px;">
          <tr style="background-color: #f1f5f9;">
            <th colspan="2" style="padding: 10px; text-align: left; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Shipping & Customer Details</th>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; width: 150px; border-bottom: 1px solid #f1f5f9;">Customer Name</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${order.customer_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Customer Email</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${order.customer_email}">${order.customer_email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Customer Phone</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${order.customer_phone}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Shipping Address</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${order.shipping_address}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b;">Pincode</td>
            <td style="padding: 10px; color: #0f172a; font-weight: bold;">${order.shipping_pincode}</td>
          </tr>
        </table>
      </div>
    `
  };

  if (!transporter) {
    console.warn(`[MAIL FALLBACK LOG] SMTP Transporter not configured. Outputting order emails locally:`);
    console.log(`To Customer (${order.customer_email}):`, customerMailOptions.subject);
    console.log(`To Admin (lurnexapublication@gmail.com):`, adminMailOptions.subject);
    return;
  }

  try {
    await transporter.sendMail(customerMailOptions);
    console.log(`✅ Order confirmation email sent to customer: ${order.customer_email}`);
  } catch (err) {
    console.error("❌ Error sending customer confirmation email:", err);
  }

  try {
    await transporter.sendMail(adminMailOptions);
    console.log("✅ Order notification email sent to admin: lurnexapublication@gmail.com");
  } catch (err) {
    console.error("❌ Error sending admin notification email:", err);
  }
}

export async function sendFailedPaymentEmail(order: {
  order_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  book_title: string;
  error_message?: string;
}) {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@lurnexa.in";

  const mailOptions = {
    from,
    to: order.customer_email,
    subject: `Payment Unsuccessful – Lurnexa Bookstore`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f87171; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Payment Unsuccessful</h2>
        <p>Dear ${order.customer_name || 'Customer'},</p>
        <p>We encountered an issue processing your payment for order ID <strong>${order.order_id}</strong> on Lurnexa Bookstore.</p>
        <p>Your payment attempt of <strong>₹${order.amount}</strong> for <strong>${order.book_title}</strong> could not be completed.</p>
        
        ${order.error_message ? `
        <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fca5a5; color: #991b1b; font-size: 14px;">
          <strong>Decline Reason:</strong> ${order.error_message}
        </div>
        ` : ''}

        <p style="font-size: 14px; color: #475569;">
          Don't worry, if any money was deducted from your account, it will be refunded automatically by your bank within 5-7 business days. You can try the checkout process again using a different payment option.
        </p>

        <div style="margin: 25px 0; text-align: center;">
          <a href="https://lurnexa.in/textbooks/store" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Return to Bookstore</a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          Lurnexa Publications &copy; 2026. All rights reserved.
        </p>
      </div>
    `
  };

  if (!transporter) {
    console.warn(`[MAIL FALLBACK LOG] Failed payment email not sent because SMTP is unconfigured. Order ID: ${order.order_id}`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Failed payment email sent to customer: ${order.customer_email}`);
  } catch (err) {
    console.error("❌ Error sending failed payment email:", err);
  }
}
