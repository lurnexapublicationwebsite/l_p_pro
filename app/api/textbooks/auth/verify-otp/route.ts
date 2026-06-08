import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool, initDbTables } from "@/lib/dbPool";

export async function POST(req: NextRequest) {
  try {
    const { accessId, target, code } = await req.json();

    if (!accessId || !target || !code) {
      return NextResponse.json(
        { error: "Access ID, target, and verification code are required." },
        { status: 400 }
      );
    }

    // Auto-create table if not exists
    await initDbTables();

    const cleanAccessId = accessId.trim().toUpperCase();
    const cleanTarget = target.trim();
    const cleanCode = code.trim();

    // Retrieve latest OTP record
    const otpResult = await pool.query(
      `SELECT * FROM textbooks_otps 
       WHERE access_id = $1 AND target = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [cleanAccessId, cleanTarget]
    );

    if (otpResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No active verification request found for this account." },
        { status: 400 }
      );
    }

    const otpRecord = otpResult.rows[0];

    // Check brute-force attempts
    if (otpRecord.attempts >= 3) {
      return NextResponse.json(
        { error: "This verification code has been locked due to too many invalid attempts. Please request a new one." },
        { status: 429 }
      );
    }

    // Increment attempts
    await pool.query(
      `UPDATE textbooks_otps SET attempts = attempts + 1 WHERE id = $1`,
      [otpRecord.id]
    );

    // Check expiration
    const expiry = new Date(otpRecord.expires_at).getTime();
    if (Date.now() > expiry) {
      return NextResponse.json(
        { error: "This verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Compare hashed code
    const incomingHash = crypto.createHash("sha256").update(cleanCode).digest("hex");
    if (incomingHash !== otpRecord.otp_hash) {
      return NextResponse.json(
        { error: `Invalid verification code. ${2 - otpRecord.attempts} attempts remaining.` },
        { status: 400 }
      );
    }

    // Clean up validated OTPs
    await pool.query(
      `DELETE FROM textbooks_otps WHERE access_id = $1 AND target = $2`,
      [cleanAccessId, cleanTarget]
    );

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "lurnexa_textbooks_default_jwt_secret_2026";
    const sessionToken = jwt.sign(
      {
        accessId: cleanAccessId,
        target: cleanTarget,
        verifiedAt: new Date().toISOString()
      },
      jwtSecret,
      { expiresIn: "8h" }
    );

    return NextResponse.json({
      success: true,
      token: sessionToken,
      message: "Verification successful."
    });
  } catch (err: any) {
    console.error("❌ Error in /api/textbooks/auth/verify-otp route:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
