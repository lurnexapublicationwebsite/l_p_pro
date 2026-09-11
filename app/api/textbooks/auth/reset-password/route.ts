import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import crypto from "crypto";

// Step 2 of self-service password recovery — see forgot-password/route.ts for step 1.
function hashPassword(password: string): string {
  const salt = "lurnexa_pub_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// Same rules enforced client-side and at signup/change-password — re-checked here too,
// since a client-side check alone can always be bypassed by calling this endpoint directly.
function getPasswordStrengthError(password: string): string | null {
  if (!password || password.length < 8) return "New password must be at least 8 characters long.";
  if (!/[A-Z]/.test(password)) return "New password must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "New password must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "New password must contain at least one number.";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "New password must contain at least one special character (!@#$%^&* etc.).";
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code, and new password are required." }, { status: 400 });
    }

    const strengthError = getPasswordStrengthError(newPassword);
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Auto migration check
    try {
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP`);
    } catch (e) {}

    const res = await pool.query(
      `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1 OR LOWER(access_id) = $1 OR mobile_number = $1`,
      [cleanEmail]
    );
    const user = res.rows && res.rows.length > 0 ? res.rows[0] : null;

    if (!user) {
      return NextResponse.json({ error: "No account found for this email address or access ID." }, { status: 404 });
    }
    if (!user.reset_token || !user.reset_token_expires_at) {
      return NextResponse.json(
        { error: "No reset code was requested for this account. Please request a new one." },
        { status: 400 }
      );
    }
    if (new Date(user.reset_token_expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset code has expired. Please request a new one." }, { status: 400 });
    }

    const codeHash = crypto.createHash("sha256").update(String(code).trim()).digest("hex");
    if (codeHash !== user.reset_token) {
      return NextResponse.json({ error: "Incorrect reset code." }, { status: 401 });
    }

    await pool.query(
      `UPDATE textbooks_users SET password_hash = $1, reset_token = $2, reset_token_expires_at = $3 WHERE LOWER(email) = $4 OR LOWER(college_email) = $4 OR LOWER(access_id) = $4 OR mobile_number = $4`,
      [hashPassword(newPassword), null, null, cleanEmail]
    );

    return NextResponse.json({ success: true, message: "Password reset successfully! You can now log in with your new password." });
  } catch (err: any) {
    console.error("❌ Error in reset-password API route:", err);
    return NextResponse.json({ error: "Failed to reset password. Please try again." }, { status: 500 });
  }
}
