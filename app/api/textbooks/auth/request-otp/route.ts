import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { pool, initDbTables } from "@/lib/dbPool";
import { sendOtpEmail, sendOtpSms } from "@/lib/otpService";

export async function POST(req: NextRequest) {
  try {
    const { accessId, target } = await req.json();

    if (!accessId || !target) {
      return NextResponse.json(
        { error: "Access ID and verification target (email or phone number) are required." },
        { status: 400 }
      );
    }

    // Auto-create table if not exists
    await initDbTables();

    const cleanAccessId = accessId.trim().toUpperCase();
    const cleanTarget = target.trim();

    // Check resend cooldown (60 seconds)
    const cooldownResult = await pool.query(
      `SELECT created_at FROM textbooks_otps 
       WHERE access_id = $1 OR target = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [cleanAccessId, cleanTarget]
    );

    if (cooldownResult.rows.length > 0) {
      const lastSent = new Date(cooldownResult.rows[0].created_at).getTime();
      const now = Date.now();
      const elapsed = (now - lastSent) / 1000;
      if (elapsed < 60) {
        return NextResponse.json(
          { error: `Please wait ${Math.ceil(60 - elapsed)} seconds before requesting a new verification code.` },
          { status: 429 }
        );
      }
    }

    // Generate secure 6-digit OTP
    const otp = Math.floor(100000 + crypto.randomInt(900000)).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration
    const ipAddress = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    const deviceInfo = req.headers.get("user-agent") || "unknown";

    // Store hashed OTP in database
    await pool.query(
      `INSERT INTO textbooks_otps (access_id, target, otp_hash, expires_at, ip_address, device_info)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [cleanAccessId, cleanTarget, otpHash, expiresAt, ipAddress, deviceInfo]
    );

    // Route delivery based on target coordinate format
    let sentSuccessfully = false;
    if (cleanTarget.includes("@")) {
      sentSuccessfully = await sendOtpEmail(cleanTarget, otp);
    } else {
      sentSuccessfully = await sendOtpSms(cleanTarget, otp);
    }

    if (!sentSuccessfully) {
      return NextResponse.json(
        { error: "Failed to dispatch verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Verification code sent successfully." });
  } catch (err: any) {
    console.error("❌ Error in /api/textbooks/auth/request-otp route:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
