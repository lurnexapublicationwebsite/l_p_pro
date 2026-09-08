import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import crypto from "crypto";

// Recovery endpoint: resets the existing admin account's password to a fresh random
// temporary one when it was seeded (via seed-admin) but never actually logged in — that
// endpoint refuses to run a second time once an admin exists, so this is the way back in.
// Reuses ADMIN_SEED_SECRET rather than a new env var, since that one is already confirmed
// working in production (getting past the seed-admin secret check is what surfaced this
// need in the first place).
function hashPassword(password: string): string {
  const salt = "lurnexa_pub_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const pick = (s: string) => s[crypto.randomInt(s.length)];
  const all = upper + lower + digits;

  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 8; i++) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    if (!process.env.ADMIN_SEED_SECRET || secret !== process.env.ADMIN_SEED_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetched unfiltered and checked in JS — see seed-admin/route.ts for why a literal-only
    // WHERE clause can't be relied on against the local mock database fallback.
    const existing = await pool.query(`SELECT * FROM textbooks_users`, []);
    const admin = (existing.rows || []).find((u: any) => u.role === "admin");

    if (!admin) {
      return NextResponse.json(
        { error: "No admin account exists yet. Use /api/textbooks/auth/seed-admin instead." },
        { status: 404 }
      );
    }

    const email = String(admin.email || admin.college_email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "The existing admin account has no email on file — cannot reset by email." }, { status: 500 });
    }

    const tempPassword = generateTempPassword();

    // Matched by email, not id — the local mock database's user records don't carry a
    // reliable "id" field (see change-password/route.ts for the same fix and why).
    await pool.query(
      `UPDATE textbooks_users SET password_hash = $1 WHERE LOWER(email) = $2 OR LOWER(college_email) = $2`,
      [hashPassword(tempPassword), email]
    );

    return NextResponse.json({
      success: true,
      message: "Admin password reset. Save this password now — it is shown only once. Log in immediately and set your own password from Admin Profile → Change Password.",
      email,
      temporaryPassword: tempPassword,
    });
  } catch (err: any) {
    console.error("❌ Error in reset-admin-password API route:", err);
    return NextResponse.json({ error: "Failed to reset admin password. Please try again." }, { status: 500 });
  }
}
