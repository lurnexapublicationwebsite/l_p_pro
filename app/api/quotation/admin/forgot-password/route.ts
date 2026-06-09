import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getQuotationTransporter } from "@/lib/mailService";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email belongs to admin
    const userRes = await pool.query(
      "SELECT * FROM quotation_users WHERE email = $1",
      [email]
    );

    if (userRes.rows.length === 0) {
      // For security, do not reveal if the email exists or not. Just return success.
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

    // Save token
    await pool.query(
      "INSERT INTO quotation_password_resets (email, token, expires_at) VALUES ($1, $2, $3)",
      [email, token, expiresAt]
    );

    // Send email
    const hostHeader = req.headers.get("host") || "localhost:3000";
    const protocol = hostHeader.includes("localhost") || hostHeader.includes("127.0.0.1") ? "http" : "https";
    const appUrl = `${protocol}://${hostHeader}`;
    const resetUrl = `${appUrl}/quotation/admin/reset-password/${token}`;

    const transporter = getQuotationTransporter();
    const from = process.env.QUOTATION_SMTP_FROM || process.env.QUOTATION_SMTP_USER || "noreply@lurnexa.in";

    const mailOptions = {
      from,
      to: email,
      subject: "Book Quotation System - Password Reset Request",
      text: `Someone asked for a password reset for the Book Quotation System administrative account associated with this email.

If you did not request this password reset, please ignore this email and your password will remain unchanged.

To set your new password, please click the secure link below:

${resetUrl}

For security reasons, this link will expire in 1 hour.

Best regards,
Lurnexa Publications`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #8a2be2; border-bottom: 2px solid #8a2be2; padding-bottom: 10px;">Reset Password</h2>
          <p>Someone asked for a password reset for the Book Quotation System administrative account associated with this email.</p>
          <p>If you did not request this password reset, please ignore this email and your password will remain unchanged.</p>
          <p>To set your new password, please click the secure link below:</p>
          <div style="margin: 25px 0; text-align: center;">
            <a href="${resetUrl}" style="background-color: #8a2be2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Set New Password</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px;">
            For security reasons, this link will expire in 1 hour.<br/><br/>
            Best regards,<br/>
            Lurnexa Publications
          </p>
        </div>
      `
    };

    if (transporter) {
      await transporter.sendMail(mailOptions);
    } else {
      console.warn(`[MAIL FALLBACK LOG] Transporter not configured. Reset Link: ${resetUrl}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Forgot Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
