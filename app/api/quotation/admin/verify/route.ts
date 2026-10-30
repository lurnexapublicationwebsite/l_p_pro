import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { signQuotationToken } from "@/lib/quotationAuth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    // Retrieve OTP from quotation_otps
    const otpResult = await pool.query(
      "SELECT * FROM quotation_otps WHERE email = $1 ORDER BY id DESC LIMIT 1",
      [cleanEmail]
    );

    if (otpResult.rows.length === 0) {
      return NextResponse.json({ error: "No verification code requested for this email." }, { status: 400 });
    }

    const otpRecord = otpResult.rows[0];

    // Check if expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return NextResponse.json({ error: "Verification code has expired. Please log in again." }, { status: 400 });
    }

    // Check if code matches
    if (String(otpRecord.otp_code).trim() !== cleanOtp) {
      // Increment attempts
      await pool.query("UPDATE quotation_otps SET attempts = attempts + 1 WHERE id = $1", [otpRecord.id]);
      return NextResponse.json({ error: "Invalid security code. Please try again." }, { status: 400 });
    }

    // Valid OTP! Delete OTP record
    await pool.query("DELETE FROM quotation_otps WHERE id = $1", [otpRecord.id]);

    // Generate JWT
    const token = signQuotationToken({ email: cleanEmail, role: "admin" });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("quotation_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60, // 8 hours
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ OTP Verify Error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification", details: error.message },
      { status: 500 }
    );
  }
}
