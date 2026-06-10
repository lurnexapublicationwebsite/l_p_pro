import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { uploadFileToS3 } from "@/lib/s3";
import { generateClientQuotationPdf } from "@/lib/pdfService";
import { getQuotationTransporter } from "@/lib/mailService";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quote_id");

    if (!quoteId) {
      return NextResponse.json({ error: "Quotation ID is required" }, { status: 400 });
    }

    // Fetch quotation
    const quoteRes = await pool.query("SELECT * FROM quotations WHERE id = $1", [quoteId]);
    if (quoteRes.rows.length === 0) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    const quote = quoteRes.rows[0];

    // Fetch request
    const reqRes = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [
      quote.quotation_request_id,
    ]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: "Associated quotation request not found" }, { status: 404 });
    }
    const reqDetails = reqRes.rows[0];

    return NextResponse.json({ quotation: quote, request: reqDetails });
  } catch (error: any) {
    console.error("❌ Confirm GET Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const quoteId = formData.get("quote_id") as string;
    const stampFile = formData.get("stamp") as File | null;

    if (!quoteId || !stampFile) {
      return NextResponse.json({ error: "Quotation ID and stamp file are required" }, { status: 400 });
    }

    // 1. Fetch quotation and request
    const quoteRes = await pool.query("SELECT * FROM quotations WHERE id = $1", [quoteId]);
    if (quoteRes.rows.length === 0) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }
    const quote = quoteRes.rows[0];

    if (quote.is_confirmed) {
      return NextResponse.json({ error: "Quotation has already been confirmed" }, { status: 400 });
    }

    const reqRes = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [
      quote.quotation_request_id,
    ]);
    if (reqRes.rows.length === 0) {
      return NextResponse.json({ error: "Associated quotation request not found" }, { status: 404 });
    }
    const reqDetails = reqRes.rows[0];

    // 2. Upload file to S3 with local fallback
    const bytes = await stampFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const scratchDir = path.join(process.cwd(), "scratch");
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }

    // Sanitize filename
    const safeName = stampFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const tempFilePath = path.join(scratchDir, `${quoteId}-${safeName}`);
    fs.writeFileSync(tempFilePath, buffer);

    let clientStampUrl: string;
    try {
      clientStampUrl = await uploadFileToS3(tempFilePath, quoteId, "client_stamps");
    } catch (s3Error) {
      console.warn("⚠️ S3 Upload failed, copying to local directory:", s3Error);
      // Fallback
      const localMediaDir = path.join(process.cwd(), "public", "media", "client_stamps");
      if (!fs.existsSync(localMediaDir)) {
        fs.mkdirSync(localMediaDir, { recursive: true });
      }
      const localFilePath = path.join(localMediaDir, `${quoteId}-${safeName}`);
      fs.copyFileSync(tempFilePath, localFilePath);
      clientStampUrl = `/media/client_stamps/${quoteId}-${safeName}`;
    } finally {
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }

    const now = new Date();

    // 3. Update quotations
    await pool.query(
      `UPDATE quotations 
       SET is_confirmed = TRUE, client_stamp = $1, confirmed_date = $2 
       WHERE id = $3`,
      [clientStampUrl, now.toISOString(), quoteId]
    );

    // 4. Update quotation_requests
    await pool.query(
      "UPDATE quotation_requests SET status = 'Confirmed' WHERE id = $1",
      [quote.quotation_request_id]
    );

    // 5. Insert into quotation_orders
    const orderId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO quotation_orders (id, quotation_id, institution_name, authorized_person, email, contact_number, stamp_file_path, total_amount, order_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        orderId,
        quoteId,
        reqDetails.institution_name,
        reqDetails.authorized_person,
        reqDetails.email,
        reqDetails.contact_number,
        clientStampUrl,
        quote.total_amount,
        now.toISOString(),
        "Confirmed",
      ]
    );

    // 6. Generate the Confirmed Order Letter PDF
    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const validUntil = new Date(new Date(quote.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateClientQuotationPdf({
        quotation_number: quote.quotation_number,
        created_at: formatDate(new Date(quote.created_at)),
        valid_until: formatDate(validUntil),
        institution_name: reqDetails.institution_name,
        authorized_person: reqDetails.authorized_person,
        email: reqDetails.email,
        contact_number: reqDetails.contact_number,
        items: typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items,
        total_amount: parseFloat(quote.total_amount),
        is_confirmed_letter: true,
        client_stamp: clientStampUrl,
      });
    } catch (pdfErr) {
      console.error("❌ Confirmed PDF Generation Error:", pdfErr);
      return NextResponse.json({ error: "Failed to generate confirmation PDF" }, { status: 500 });
    }

    // 7. Send Emails
    const transporter = getQuotationTransporter();
    const smtpFrom = process.env.QUOTATION_SMTP_FROM || process.env.QUOTATION_SMTP_USER || "noreply@lurnexa.in";
    const adminEmail = "lurnexaquotations@gmail.com";

    const hostHeader = request.headers.get("host") || "localhost:3000";
    const protocol = hostHeader.includes("localhost") || hostHeader.includes("127.0.0.1") ? "http" : "https";
    const appUrl = `${protocol}://${hostHeader}`;
    const loginUrl = `${appUrl}/quotation/admin/login`;

    const subject = `Confirmed Book Quotation Order – ${quote.quotation_number}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #10B981; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #10B981; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 0;">Order Confirmed Successfully!</h2>
        <p>Dear ${reqDetails.authorized_person},</p>
        <p>Thank you! Your quotation <strong>${quote.quotation_number}</strong> for <strong>${reqDetails.institution_name}</strong> has been successfully confirmed and signed.</p>
        <p>The officially signed Confirmed Quotation document is attached to this email as a PDF for your records.</p>
        
        <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0;">
          <h3 style="margin-top: 0; color: #065f46;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #065f46; width: 150px;">Order ID:</td>
              <td style="padding: 6px 0; color: #0f172a;">${orderId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #065f46;">Quote Number:</td>
              <td style="padding: 6px 0; color: #0f172a;">${quote.quotation_number}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #065f46;">Total Value:</td>
              <td style="padding: 6px 0; color: #10B981; font-weight: bold;">Rs. ${parseFloat(quote.total_amount).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #475569;">
          Our delivery team will compile the books and initiate dispatch shortly. You will receive tracking details once shipped.
        </p>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          Lurnexa Publications &copy; 2026. All rights reserved.
        </p>
      </div>
    `;

    const adminSubject = `Confirmed Order Notification – ${quote.quotation_number}`;
    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #10B981; border-radius: 12px; background-color: #f8fafc;">
        <h2 style="color: #065f46; border-bottom: 2px solid #10B981; padding-bottom: 10px; margin-top: 0;">New Confirmed Quotation Order!</h2>
        <p>Quotation <strong>${quote.quotation_number}</strong> for <strong>${reqDetails.institution_name}</strong> has been successfully confirmed and signed by the client.</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 14px; margin-bottom: 20px;">
          <tr style="background-color: #f1f5f9;">
            <th colspan="2" style="padding: 10px; text-align: left; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Order Information</th>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; width: 150px; border-bottom: 1px solid #f1f5f9;">Order ID</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Quote Number</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${quote.quotation_number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Institution</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${reqDetails.institution_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Total Value</td>
            <td style="padding: 10px; color: #10B981; font-weight: bold; border-bottom: 1px solid #f1f5f9;">Rs. ${parseFloat(quote.total_amount).toFixed(2)}</td>
          </tr>
        </table>

        <div style="margin: 25px 0; text-align: center;">
          <a href="${loginUrl}" style="background-color: #065f46; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Go to Quotations Admin Login</a>
        </div>

        <p>The officially signed Confirmed Quotation PDF is attached.</p>
      </div>
    `;

    if (!transporter) {
      console.warn("⚠️ SMTP Transporter not configured. Outputting confirmation email locally:");
      console.log(`[CONFIRMED ORDER] Client: ${reqDetails.email}, Admin: ${adminEmail}`);
    } else {
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: reqDetails.email,
          subject,
          html: emailHtml,
          attachments: [
            {
              filename: `Confirmed_Quotation_${quote.quotation_number}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        console.log(`✅ Order confirmation email sent to client ${reqDetails.email}`);
      } catch (mailError) {
        console.error("❌ Error sending client order confirmation email:", mailError);
      }

      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: adminEmail,
          subject: adminSubject,
          html: adminHtml,
          attachments: [
            {
              filename: `Confirmed_Quotation_${quote.quotation_number}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        console.log(`✅ Order confirmation email sent to admin: ${adminEmail}`);
      } catch (mailError) {
        console.error("❌ Error sending admin order confirmation email:", mailError);
      }
    }

    return NextResponse.json({ success: true, orderId });
  } catch (error: any) {
    console.error("❌ Confirm POST Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
