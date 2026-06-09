import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const resetRes = await pool.query(
      "SELECT * FROM quotation_password_resets WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (resetRes.rows.length === 0) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  } catch (error: any) {
    console.error("❌ Reset Password Token Check Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Check token
    const resetRes = await pool.query(
      "SELECT * FROM quotation_password_resets WHERE token = $1 AND expires_at > NOW()",
      [token]
    );

    if (resetRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const { email } = resetRes.rows[0];

    // Hash the password using SHA-256
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    // Update password
    await pool.query(
      "UPDATE quotation_users SET password_hash = $1 WHERE email = $2",
      [passwordHash, email]
    );

    // Delete token
    await pool.query(
      "DELETE FROM quotation_password_resets WHERE token = $1",
      [token]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Reset Password Update Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
