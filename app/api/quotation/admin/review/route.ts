import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";
import { generateClientQuotationPdf } from "@/lib/pdfService";
import { getQuotationTransporter } from "@/lib/mailService";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { request_id, items } = await request.json();

    if (!request_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Request ID and items are required" }, { status: 400 });
    }

    // Fetch quotation request from DB
    const requestResult = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [request_id]);
    if (requestResult.rows.length === 0) {
      return NextResponse.json({ error: "Quotation request not found" }, { status: 404 });
    }
    const quotationRequest = requestResult.rows[0];

    // Calculate item prices and total amount
    let totalAmount = 0;
    const itemsWithPrices = items.map((item: any) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const totalPrice = quantity * unitPrice;
      totalAmount += totalPrice;
      return {
        book_name: item.book_name,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      };
    });

    const quotationId = crypto.randomUUID();
    const quotationNumber = `QT-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

    // 1. Insert into quotations table
    await pool.query(
      `INSERT INTO quotations (id, quotation_request_id, quotation_number, total_amount, sent_date, created_at, items, is_confirmed)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        quotationId,
        request_id,
        quotationNumber,
        totalAmount,
        now.toISOString(),
        now.toISOString(),
        JSON.stringify(itemsWithPrices),
        false,
      ]
    );

    // 2. Update quotation_requests status to 'Sent'
    await pool.query("UPDATE quotation_requests SET status = 'Sent' WHERE id = $1", [request_id]);

    // 3. Generate PDF
    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateClientQuotationPdf({
        quotation_number: quotationNumber,
        created_at: formatDate(now),
        valid_until: formatDate(validUntil),
        institution_name: quotationRequest.institution_name,
        authorized_person: quotationRequest.authorized_person,
        email: quotationRequest.email,
        contact_number: quotationRequest.contact_number,
        items: itemsWithPrices,
        total_amount: totalAmount,
        is_confirmed_letter: false,
      });
    } catch (pdfErr: any) {
      console.error("❌ PDF Generation Error:", pdfErr);
      return NextResponse.json({ error: "Failed to generate quotation PDF" }, { status: 500 });
    }

    // 4. Send email
    const transporter = getQuotationTransporter();
    const smtpFrom = process.env.QUOTATION_SMTP_FROM || process.env.QUOTATION_SMTP_USER || "noreply@lurnexa.in";
    const adminEmail = "lurnexapublication@gmail.com";
    
    // Construct confirmation URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmUrl = `${appUrl}/quotation/confirm/${quotationId}`;

    const subject = `Formal Book Quotation – ${quotationNumber}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; margin-top: 0;">Formal Book Quotation</h2>
        <p>Dear ${quotationRequest.authorized_person},</p>
        <p>We are pleased to send you our formal quotation (<strong>${quotationNumber}</strong>) for the books you requested for <strong>${quotationRequest.institution_name}</strong>.</p>
        <p>A breakdown of the quotation is attached to this email as a PDF. The total amount is <strong>Rs. ${totalAmount.toFixed(2)}</strong>.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e2e8f0; text-align: center;">
          <p style="margin-top: 0; font-size: 15px; color: #475569;">To review and officially confirm this quotation with your digital signature or stamp, please click the button below:</p>
          <a href="${confirmUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block; margin-top: 10px;">Review and Confirm Quotation</a>
        </div>

        <p style="font-size: 14px; color: #475569;">
          If you have any questions or require modifications, feel free to reply directly to this email.
        </p>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          Lurnexa Publications &copy; 2026. All rights reserved.
        </p>
      </div>
    `;

    if (!transporter) {
      console.warn("⚠️ SMTP Transporter not configured. Outputting quotation review locally:");
      console.log(`[QUOTE REVIEW] Client Email: ${quotationRequest.email}, Confirm Link: ${confirmUrl}`);
    } else {
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: quotationRequest.email,
          bcc: adminEmail,
          subject,
          html: emailHtml,
          attachments: [
            {
              filename: `Quotation_${quotationNumber}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        console.log(`✅ Quotation email sent successfully to ${quotationRequest.email} (BCC admin)`);
      } catch (mailError) {
        console.error("❌ Error sending quotation email:", mailError);
        return NextResponse.json({ error: "Failed to send email to client" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, quotationId, quotationNumber });
  } catch (error: any) {
    console.error("❌ Review Quotation Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
