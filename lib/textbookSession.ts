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
  target: string;
  emails: string[]; // lower-cased email and college email
  phone: string | null; // last 10 digits
  accessIds: string[];
  purchasedBookIds: string[];
  plans: string[];
  isAdmin: boolean;
}

const lastTenDigits = (value: string) => value.replace(/\D/g, "").slice(-10);

function parseBookIdList(raw: unknown): string[] {
  if (!raw) return [];
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      arr = Array.isArray(parsed) ? parsed : raw.split(",");
    } catch {
      arr = raw.split(",");
    }
  }
  return arr
    .flatMap((item) => String(item || "").split(","))
    .map((s) => s.trim())
    .filter((s) => Boolean(s) && s !== "CART" && s !== "ADMIN");
}

export async function findSessionUser(target: string): Promise<SessionUser | null> {
  const cleanTarget = target.trim().toLowerCase();
  if (!cleanTarget) return null;

  const digits = cleanTarget.includes("@") ? "" : lastTenDigits(cleanTarget);
  const validDigits = digits.length === 10 ? digits : "";

  const emailSet = new Set<string>();
  const accessIdSet = new Set<string>();
  const bookIdSet = new Set<string>();
  const planSet = new Set<string>();
  let phone: string | null = validDigits || null;
  let isAdmin =
    cleanTarget === "lurnexa" ||
    cleanTarget === "admin" ||
    cleanTarget === "lurnexapublication@gmail.com";

  if (cleanTarget.includes("@")) {
    emailSet.add(cleanTarget);
  }

  try {
    const res = await pool.query(
      `SELECT email, college_email, mobile_number, purchased_books, book_id, access_id, role, plan FROM textbooks_users
       WHERE LOWER(email) = $1 OR LOWER(college_email) = $1 OR LOWER(access_id) = $1 OR LOWER(mobile_number) = $1
          OR ($2 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(mobile_number, ''), '\\D', '', 'g'), 10) = $2)`,
      [cleanTarget, validDigits]
    );

    for (const row of res.rows || []) {
      if (typeof row.email === "string" && row.email.includes("@")) {
        emailSet.add(row.email.trim().toLowerCase());
      }
      if (typeof row.college_email === "string" && row.college_email.includes("@")) {
        emailSet.add(row.college_email.trim().toLowerCase());
      }
      if (row.mobile_number) {
        const rowDigits = lastTenDigits(String(row.mobile_number));
        if (rowDigits.length === 10 && !String(row.mobile_number).includes("@")) {
          phone = phone || rowDigits;
        }
      }
      if (row.access_id) {
        accessIdSet.add(String(row.access_id).trim().toUpperCase());
      }
      if (row.role === "admin" || String(row.access_id || "").toUpperCase() === "LURNEXA") {
        isAdmin = true;
      }
      if (row.plan) {
        planSet.add(String(row.plan).trim().toLowerCase());
      }
      for (const id of parseBookIdList(row.purchased_books)) {
        bookIdSet.add(id);
      }
      if (row.book_id) {
        for (const id of parseBookIdList(row.book_id)) {
          bookIdSet.add(id);
        }
      }
    }
  } catch (err) {
    console.warn("findSessionUser: error querying textbooks_users:", err);
  }

  // Also include books from verified PAID purchases in textbooks_purchases so buyers whose
  // webhook/verify order wasn't mirrored into textbooks_users.purchased_books can still read.
  try {
    const identifiers = Array.from(new Set([...emailSet, cleanTarget, ...(phone ? [phone] : [])]));
    const accessIds = Array.from(accessIdSet);
    const purchasesRes = await pool.query(
      `SELECT book_id, customer_email, customer_phone, purchase_plan, purchase_format FROM textbooks_purchases
       WHERE status = 'PAID'
         AND (LOWER(user_identifier) = ANY($1)
              OR LOWER(customer_email) = ANY($1)
              OR ($2 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(customer_phone, ''), '\\D', '', 'g'), 10) = $2)
              OR (UPPER(COALESCE(access_id, '')) = ANY($3)))`,
      [identifiers, phone || "", accessIds]
    );
    for (const p of purchasesRes.rows || []) {
      if (p.purchase_format === "rental") continue;
      for (const id of parseBookIdList(p.book_id)) {
        bookIdSet.add(id);
      }
      if (typeof p.customer_email === "string" && p.customer_email.includes("@")) {
        emailSet.add(p.customer_email.trim().toLowerCase());
      }
      if (p.purchase_plan) {
        planSet.add(String(p.purchase_plan).trim().toLowerCase());
      }
    }
  } catch (err) {
    console.warn("findSessionUser: error querying textbooks_purchases:", err);
  }

  return {
    target: cleanTarget,
    emails: Array.from(emailSet),
    phone,
    accessIds: Array.from(accessIdSet),
    purchasedBookIds: Array.from(bookIdSet),
    plans: Array.from(planSet),
    isAdmin,
  };
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const target = getSessionTarget(req);
  return target ? findSessionUser(target) : null;
}
