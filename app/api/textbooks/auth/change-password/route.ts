import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = "lurnexa_pub_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// Same rules enforced client-side at signup — re-checked here too, since a client-side
// check alone can always be bypassed by calling this endpoint directly.
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
    const { email, oldPassword, newPassword } = body;

    if (!email || !oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required." },
        { status: 400 }
      );
    }

    const strengthError = getPasswordStrengthError(newPassword);
    if (strengthError) {
      return NextResponse.json({ error: strengthError }, { status: 400 });
    }

    if (newPassword === oldPassword) {
      return NextResponse.json(
        { error: "New password must be different from your current password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const res = await pool.query(
      `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1`,
      [cleanEmail]
    );
    const user = res.rows && res.rows.length > 0 ? res.rows[0] : null;

    if (!user) {
      return NextResponse.json({ error: "No account found for this user." }, { status: 404 });
    }
    if (!user.password_hash) {
      return NextResponse.json(
        { error: "No password is set on this account yet. Please use Sign Up to create one." },
        { status: 400 }
      );
    }
    if (user.password_hash !== hashPassword(oldPassword)) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    // Matched by email rather than id: the local JSON mock DB's user records don't carry
    // a reliable "id" field (only real Postgres guarantees one), so WHERE id = $2 would
    // silently match nothing there.
    await pool.query(
      `UPDATE textbooks_users SET password_hash = $1 WHERE LOWER(email) = $2 OR LOWER(college_email) = $2`,
      [hashPassword(newPassword), cleanEmail]
    );

    return NextResponse.json({ success: true, message: "Password changed successfully!" });
  } catch (err: any) {
    console.error("❌ Error in change-password API route:", err);
    return NextResponse.json({ error: "Failed to change password. Please try again." }, { status: 500 });
  }
}
