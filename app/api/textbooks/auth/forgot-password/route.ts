import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { sendMail } from "@/lib/mailService";
import crypto from "crypto";

// Step 1 of self-service password recovery: emails a 6-digit code to the account's own
// email address. Step 2 (verifying the code and setting a new password) is reset-password.
// Exists so a locked-out student/faculty/admin account never again needs a one-off recovery
// endpoint built by hand — see reset-admin-password/route.ts, which this generalizes.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // Same migration pattern used elsewhere (e.g. signup/route.ts) — safe to run on every
    // request since IF NOT EXISTS makes it a no-op once the columns are already there.
    try {
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP`);
    } catch (e) {
      // Ignore migration errors if already applied
    }

    const res = await pool.query(
      `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1`,
      [cleanEmail]
    );
    const user = res.rows && res.rows.length > 0 ? res.rows[0] : null;

    if (!user) {
      return NextResponse.json({ error: "No account found for this email address." }, { status: 404 });
    }

    const code = String(crypto.randomInt(100000, 1000000)); // 6-digit, zero-safe (randomInt lower bound is inclusive)
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // Matched by email, not id — the local mock database's user records don't carry a
    // reliable "id" field (see change-password/route.ts for the same fix and why).
    await pool.query(
      `UPDATE textbooks_users SET reset_token = $1, reset_token_expires_at = $2 WHERE LOWER(email) = $3 OR LOWER(college_email) = $3`,
      [codeHash, expiresAt, cleanEmail]
    );

    await sendMail({
      to: cleanEmail,
      subject: "Your Lurnexa Password Reset Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #0f172a;">Password Reset Request</h2>
          <p>Hello ${user.name || "there"},</p>
          <p>Use this code to reset your Lurnexa account password:</p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #db2777;">${code}</span>
          </div>
          <p style="color: #64748b; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email — your password won't change.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, message: "A password reset code has been sent to your email." });
  } catch (err: any) {
    console.error("❌ Error in forgot-password API route:", err);
    return NextResponse.json({ error: "Failed to send reset code. Please try again." }, { status: 500 });
  }
}
