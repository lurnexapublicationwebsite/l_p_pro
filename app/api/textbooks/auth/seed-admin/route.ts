import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import crypto from "crypto";

// One-time bootstrap: creates the first admin account when a fresh database has none yet.
// Locally this never mattered because the mock JSON database already had an admin row sitting
// in scratch/textbooks_users.json from earlier testing — but that file never existed against
// the real production Postgres database, so the live site had no admin account to log in with
// at all. Visit this URL once (with the correct secret) to create one; it refuses to run again
// once any admin account already exists, so it can't be used to reset a real admin's password.
function hashPassword(password: string): string {
  const salt = "lurnexa_pub_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// Guarantees at least one of each required character class (matches the site's own
// password-strength rule: 8+ chars, upper, lower, number, special) regardless of the random draw.
function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%^&*";
  const pick = (s: string) => s[crypto.randomInt(s.length)];
  const all = upper + lower + digits;

  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 8; i++) chars.push(pick(all));

  // Fisher-Yates shuffle so the fixed positions above don't leak the password's structure.
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

    // Fetched unfiltered and checked in JS rather than "WHERE role = 'admin'" — the local
    // mock database's SQL fallback only pattern-matches WHERE clauses bound to $-params, so a
    // literal-only WHERE here would silently return every row instead of filtering. Fetching
    // everything and filtering here works identically against the mock DB and real Postgres.
    const existing = await pool.query(`SELECT * FROM textbooks_users`, []);
    const hasAdmin = (existing.rows || []).some((u: any) => u.role === "admin");

    if (hasAdmin) {
      return NextResponse.json(
        { error: "An admin account already exists. This endpoint refuses to run again — use Change Password from the Admin Profile tab instead." },
        { status: 409 }
      );
    }

    const email = "lurnexapublication@gmail.com";
    const tempPassword = generateTempPassword();
    const passwordHash = hashPassword(tempPassword);
    const accessId = "LURNEXA";

    await pool.query(
      `INSERT INTO textbooks_users (
        mobile_number, name, email, college_email, password_hash, role, is_active, access_id, plan, purchased_books
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        "",
        "Administrator",
        email,
        email,
        passwordHash,
        "admin",
        true,
        accessId,
        "complete",
        JSON.stringify([])
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Admin account created. Save this password now — it is shown only once. Log in immediately and set your own password from Admin Profile → Change Password.",
      email,
      temporaryPassword: tempPassword,
    });
  } catch (err: any) {
    console.error("❌ Error in seed-admin API route:", err);
    return NextResponse.json({ error: "Failed to seed admin account. Please try again." }, { status: 500 });
  }
}
