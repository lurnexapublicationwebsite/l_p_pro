import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getQuotationTransporter } from "@/lib/mailService";
import { generateQuotationRequestPdf } from "@/lib/pdfService";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { institution_name, authorized_person, contact_number, email, items } = body;

    if (!institution_name || !authorized_person || !contact_number || !email || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields or invalid items format" }, { status: 400 });
    }

    const requestId = crypto.randomUUID();
    const uniqueToken = crypto.randomBytes(16).toString("hex");
    const status = "Pending";
    const createdAt = new Date().toISOString();

    // 1. Insert into database
    await pool.query(
      `INSERT INTO quotation_requests (id, institution_name, authorized_person, contact_number, email, unique_token, status, created_at, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        requestId,
        institution_name,
        authorized_person,
        contact_number,
        email,
        uniqueToken,
        status,
        createdAt,
        JSON.stringify(items),
      ]
    );

    // 2. Generate PDF summary
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateQuotationRequestPdf({
        id: requestId,
        institution_name,
        authorized_person,
        contact_number,
        email,
        created_at: new Date(createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        items,
      });
    } catch (pdfError) {
      console.error("❌ PDF Generation Error:", pdfError);
      return NextResponse.json({ error: "Failed to generate request PDF" }, { status: 500 });
    }

    // 3. Send emails
    const transporter = getQuotationTransporter();
    const smtpFrom = process.env.QUOTATION_SMTP_FROM || process.env.QUOTATION_SMTP_USER || "noreply@lurnexa.in";
    const adminEmail = "lurnexaquotations@gmail.com";

    const hostHeader = request.headers.get("host") || "localhost:3000";
    const protocol = hostHeader.includes("localhost") || hostHeader.includes("127.0.0.1") ? "http" : "https";
    const appUrl = `${protocol}://${hostHeader}`;
    const loginUrl = `${appUrl}/quotation/admin/login`;

    const emailSubjectClient = `Quotation Request Received – Lurnexa Publications`;
    const emailHtmlClient = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Quotation Request Received</h2>
        <p>Dear ${authorized_person},</p>
        <p>Thank you for submitting a quotation request to Lurnexa Publications. We have received your request, and it is currently under review by our administration team.</p>
        <p>A summary of your request has been generated and is attached to this email as a PDF.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #334155;">Request Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 150px;">Reference ID:</td>
              <td style="padding: 6px 0; color: #0f172a;">${requestId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Institution Name:</td>
              <td style="padding: 6px 0; color: #0f172a;">${institution_name}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-weight: bold; color: #475569;">Status:</td>
              <td style="padding: 6px 0; color: #4F46E5; font-weight: bold;">${status}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 14px; color: #475569;">
          We will send you the formal quotation document soon. If you have any immediate questions, feel free to reply directly to this email.
        </p>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center;">
          Lurnexa Publications &copy; 2026. All rights reserved.
        </p>
      </div>
    `;

    const emailSubjectAdmin = `New Quotation Request – ${institution_name}`;
    const emailHtmlAdmin = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
        <h2 style="color: #4F46E5; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; margin-top: 0;">New Quotation Request</h2>
        <p>A new quotation request has been submitted on the Lurnexa Platform.</p>
        
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; font-size: 14px; margin-bottom: 20px;">
          <tr style="background-color: #f1f5f9;">
            <th colspan="2" style="padding: 10px; text-align: left; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0;">Details</th>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; width: 150px; border-bottom: 1px solid #f1f5f9;">Reference ID</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${requestId}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Institution</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${institution_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Authorized Person</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${authorized_person}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Contact Number</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;">${contact_number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: bold; color: #64748b; border-bottom: 1px solid #f1f5f9;">Email</td>
            <td style="padding: 10px; color: #0f172a; border-bottom: 1px solid #f1f5f9;"><a href="mailto:${email}">${email}</a></td>
          </tr>
        </table>

        <div style="margin: 25px 0; text-align: center;">
          <a href="${loginUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">Go to Quotations Admin Login</a>
        </div>

        <p>The generated PDF request summary is attached to this email.</p>
      </div>
    `;

    if (!transporter) {
      console.warn("⚠️ SMTP Transporter not configured. Outputting quotation emails locally:");
      console.log(`To Customer (${email}):`, emailSubjectClient);
      console.log(`To Admin (${adminEmail}):`, emailSubjectAdmin);
    } else {
      // Send Client Email
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: email,
          subject: emailSubjectClient,
          html: emailHtmlClient,
          attachments: [
            {
              filename: `Quotation_Request_${requestId}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        console.log(`✅ Quotation request confirmation email sent to client: ${email}`);
      } catch (clientMailError) {
        console.error("❌ Error sending quotation request email to client:", clientMailError);
      }

      // Send Admin Email
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: adminEmail,
          subject: emailSubjectAdmin,
          html: emailHtmlAdmin,
          attachments: [
            {
              filename: `Quotation_Request_${requestId}.pdf`,
              content: pdfBuffer,
            },
          ],
        });
        console.log(`✅ Quotation request notification email sent to admin: ${adminEmail}`);
      } catch (adminMailError) {
        console.error("❌ Error sending quotation request email to admin:", adminMailError);
      }
    }

    return NextResponse.json({ success: true, requestId, uniqueToken });
  } catch (error: any) {
    console.error("❌ Error submitting quotation request:", error);
    return NextResponse.json(
      { error: "Failed to submit request", details: error.message },
      { status: 500 }
    );
  }
}
