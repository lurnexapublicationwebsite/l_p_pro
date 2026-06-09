import { NextResponse } from "next/server";
import { pool, initDbTables } from "@/lib/dbPool";
import { getQuotationTransporter } from "@/lib/mailService";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    // Ensure tables are initialized (this also seeds the default admin user)
    await initDbTables();

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    // Fetch user from quotation_users
    const userResult = await pool.query(
      "SELECT * FROM quotation_users WHERE email = $1 AND password_hash = $2",
      [email.toLowerCase().trim(), passwordHash]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials. Please try again." }, { status: 401 });
    }

    // Credentials match, generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // Upsert or insert OTP into quotation_otps
    // Check if OTP already exists for this email
    const otpExist = await pool.query("SELECT * FROM quotation_otps WHERE email = $1", [email]);
    if (otpExist.rows.length > 0) {
      await pool.query(
        "UPDATE quotation_otps SET otp_code = $1, expires_at = $2, attempts = 0 WHERE email = $3",
        [otp, expiresAt, email]
      );
    } else {
      await pool.query(
        "INSERT INTO quotation_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)",
        [email, otp, expiresAt]
      );
    }

    // Send OTP email
    const transporter = getQuotationTransporter();
    const smtpFrom = process.env.QUOTATION_SMTP_FROM || process.env.QUOTATION_SMTP_USER || "noreply@lurnexa.in";

    const subject = "Your Admin Login Security Code";
    const message = `Hello,

A login attempt was made for your administrative account.
Your 6-digit security code is: ${otp}

If you did not attempt to log in, please secure your account immediately.

Best regards,
Lurnexa Security`;

    if (!transporter) {
      console.warn("⚠️ SMTP Transporter not configured. Outputting OTP locally:");
      console.log(`[OTP] Email: ${email}, Code: ${otp}`);
    } else {
      try {
        await transporter.sendMail({
          from: smtpFrom,
          to: email,
          subject,
          text: message,
        });
        console.log(`✅ Admin OTP sent successfully to: ${email}`);
      } catch (mailError) {
        console.error("❌ Error sending admin OTP email:", mailError);
        return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, email });
  } catch (error: any) {
    console.error("❌ Login Error:", error);
    return NextResponse.json(
      { error: "An error occurred during login", details: error.message },
      { status: 500 }
    );
  }
}
