import jwt from "jsonwebtoken";
import { pool } from "@/lib/dbPool";

// Signed portal session tokens. The browser sends them as "Authorization: Bearer <token>";
// routes that hand out paid content must identify the user from this token, never from
// an email or phone number supplied in the request body.

const SESSION_TTL = "7d";

function getJwtSecret(): string | null {
  return process.env.JWT_SECRET || null;
}

export function signSessionToken(target: string, accessId = "USER"): string {
  const secret = getJwtSecret();
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { accessId, target: target.trim().toLowerCase(), verifiedAt: new Date().toISOString() },
    secret,
    { expiresIn: SESSION_TTL }
  );
}

// Returns the email or phone the token was issued for, or null if missing/invalid/expired.
// Accepts tokens from signSessionToken and from /api/textbooks/auth/verify-otp (same payload shape).
export function getSessionTarget(req: Request): string | null {
  const secret = getJwtSecret();
  const header = req.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!secret || !match) return null;
  try {
    const payload = jwt.verify(match[1], secret) as { target?: unknown };
    return typeof payload.target === "string" && payload.target ? payload.target.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

export interface SessionUser {
  emails: string[]; // lower-cased email and college email
  phone: string | null; // last 10 digits
  purchasedBookIds: string[];
}

const lastTenDigits = (value: string) => value.replace(/\D/g, "").slice(-10);

export async function findSessionUser(target: string): Promise<SessionUser | null> {
  const digits = target.includes("@") ? "" : lastTenDigits(target);
  const res = await pool.query(
    `SELECT email, college_email, mobile_number, purchased_books, book_id FROM textbooks_users
     WHERE LOWER(email) = $1 OR LOWER(college_email) = $1
        OR ($2 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(mobile_number, ''), '\\D', '', 'g'), 10) = $2)
     LIMIT 1`,
    [target, digits]
  );
  const row = res.rows[0];
  if (!row) return null;

  let purchased: unknown[] = [];
  try {
    purchased = typeof row.purchased_books === "string" ? JSON.parse(row.purchased_books) : row.purchased_books || [];
  } catch {
    purchased = [];
  }
  const purchasedBookIds = (Array.isArray(purchased) && purchased.length > 0 ? purchased : row.book_id ? [row.book_id] : [])
    .filter(Boolean)
    .map(String);

  const emails = [row.email, row.college_email, target.includes("@") ? target : null]
    .filter((e): e is string => typeof e === "string" && e.includes("@"))
    .map((e) => e.trim().toLowerCase());

  const phone = row.mobile_number ? lastTenDigits(String(row.mobile_number)) || null : digits || null;

  return { emails: Array.from(new Set(emails)), phone, purchasedBookIds: Array.from(new Set(purchasedBookIds)) };
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const target = getSessionTarget(req);
  return target ? findSessionUser(target) : null;
}
