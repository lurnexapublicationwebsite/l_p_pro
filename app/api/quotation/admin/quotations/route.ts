import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";
import { generateClientQuotationPdf } from "@/lib/pdfService";
import { getQuotationTransporter } from "@/lib/mailService";

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      // Fetch specific quotation and its request
      const quoteRes = await pool.query("SELECT * FROM quotations WHERE id = $1", [id]);
      if (quoteRes.rows.length === 0) {
        return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
      }
      const quote = quoteRes.rows[0];
      const reqRes = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [quote.quotation_request_id]);
      
      return NextResponse.json({ 
        quotation: quote, 
        request: reqRes.rows[0] 
      });
    }

    const result = await pool.query(
      `SELECT q.*, r.institution_name, r.authorized_person, r.email, r.contact_number 
       FROM quotations q
       JOIN quotation_requests r ON q.quotation_request_id::uuid = r.id
       WHERE q.is_confirmed = FALSE 
       ORDER BY q.created_at DESC`
    );

    return NextResponse.json({ quotations: result.rows });
  } catch (error: any) {
    console.error("❌ Fetch Sent Quotations Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, items } = await request.json();

    if (!id || !items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch existing quotation
    const quoteRes = await pool.query("SELECT * FROM quotations WHERE id = $1", [id]);
    if (quoteRes.rows.length === 0) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    const quote = quoteRes.rows[0];

    // 2. Fetch original request details
    const reqRes = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [quote.quotation_request_id]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: "Original request not found" }, { status: 404 });
    }
    const quotationRequest = reqRes.rows[0];

    // 3. Re-calculate totals
    let totalAmount = 0;
    const updatedItems = items.map((item: any) => {
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

    const now = new Date();
    const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

    // 4. Update quotations table
    await pool.query(
      `UPDATE quotations 
       SET total_amount = $1, items = $2, sent_date = $3
       WHERE id = $4`,
      [totalAmount, JSON.stringify(updatedItems), now.toISOString(), id]
    );

    // 5. Generate updated PDF
    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateClientQuotationPdf({
        quotation_number: quote.quotation_number,
        created_at: formatDate(now),
        valid_until: formatDate(validUntil),
        institution_name: quotationRequest.institution_name,
        authorized_person: quotationRequest.authorized_person,
        email: quotationRequest.email,
        contact_number: quotationRequest.contact_number,
        items: updatedItems,
        total_amount: totalAmount,
        is_confirmed_letter: false,
      });
    } catch (pdfErr: any) {
      console.error("❌ PDF Generation Error:", pdfErr);
      return NextResponse.json({ error: "Failed to generate updated PDF" }, { status: 500 });
    }

    // 6. Send Email to Client
    const transporter = getQuotationTransporter();
    const smtpFrom = process.env.QUOTATION_SMTP_FROM || process.env.QUOTATION_SMTP_USER || "noreply@lurnexa.in";
    
    // Construct confirmation URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const confirmUrl = `${appUrl}/quotation/confirm/${id}`;

    const subject = `Updated Book Quotation – ${quote.quotation_number}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; margin-top: 0;">Updated Quotation</h2>
        <p>Dear ${quotationRequest.authorized_person},</p>
        <p>Please find attached the updated formal quotation (Quote No: <strong>${quote.quotation_number}</strong>) for <strong>${quotationRequest.institution_name}</strong>.</p>
        <p>To confirm this updated quotation and place the order, please click the secure link below to upload your official stamp or signature:</p>
        
        <div style="margin: 25px 0; text-align: center;">
          <a href="${confirmUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Confirm Quotation</a>
        </div>
        
        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
          If you have any questions or require further adjustments, feel free to reply directly to this email.<br/><br/>
          Best regards,<br/>
          Lurnexa Publications
        </p>
      </div>
    `;

    if (transporter) {
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: quotationRequest.email,
          subject,
          html: emailHtml,
          attachments: [
            {
              filename: `${quote.quotation_number}_Updated.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        console.log(`✅ Updated quotation sent to client: ${quotationRequest.email}`);
      } catch (mailError) {
        console.error("❌ Error sending updated email:", mailError);
      }
    } else {
      console.warn(`[MAIL FALLBACK LOG] Transporter not configured. Confirm Link: ${confirmUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Update Quotation Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
