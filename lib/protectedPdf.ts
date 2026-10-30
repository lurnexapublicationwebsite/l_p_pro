import { GetObjectCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { pool } from "@/lib/dbPool";
import { s3, s3HasCredentials, BUCKET_NAME } from "@/lib/s3";
import type { SessionUser } from "@/lib/textbookSession";

// Paid textbook and caselet PDFs live privately in S3 (bucket "lurnexa"):
//   textbooks/<pdfFileName>   caselets/<caselet pdf>
// They are never served from public/. Readers get a short-lived signed link after
// the server has checked the logged-in user's purchase or rental.

const LINK_TTL_SECONDS = 30 * 60;

let corsConfigured = false;
function ensureS3BucketCors(): void {
  if (corsConfigured || !s3HasCredentials) return;
  corsConfigured = true;
  s3.send(
    new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["Accept-Ranges", "Content-Range", "Content-Length", "ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  ).catch(() => {
    // Ignore if IAM user lacks s3:PutBucketCors; /api/textbooks/pdf-stream proxies server-side anyway.
  });
}

export function resolveLocalProtectedPdfPath(
  folder: "textbooks" | "caselets",
  fileName: string
): string | null {
  const safeName = path.basename(fileName);
  if (!safeName || safeName !== fileName) return null;
  const candidates = [
    path.join(process.cwd(), "s3-upload", folder, safeName),
    path.join(
      process.cwd(),
      "public",
      folder === "textbooks" ? "portal_textbooks" : "portal_caselets",
      safeName
    ),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export async function signedPdfUrl(
  folder: "textbooks" | "caselets",
  fileName: string,
  expiresIn = LINK_TTL_SECONDS
): Promise<string | null> {
  if (!s3HasCredentials) return null;
  ensureS3BucketCors();
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${folder}/${fileName}`,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: "inline",
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export function signedPdfReaderUrl(
  folder: "textbooks" | "caselets",
  fileName: string,
  expiresIn = LINK_TTL_SECONDS
): string | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  const safeName = path.basename(fileName);
  if (!safeName || safeName !== fileName) return null;
  if (!s3HasCredentials && !resolveLocalProtectedPdfPath(folder, safeName)) {
    return null;
  }
  ensureS3BucketCors();
  const token = jwt.sign(
    { purpose: "pdf_stream", folder, fileName: safeName },
    secret,
    { expiresIn }
  );
  return `/api/textbooks/pdf-stream?token=${encodeURIComponent(token)}`;
}

export function verifyPdfStreamToken(
  token: string
): { folder: "textbooks" | "caselets"; fileName: string } | null {
  const secret = process.env.JWT_SECRET;
  if (!secret || !token) return null;
  try {
    const payload = jwt.verify(token, secret) as {
      purpose?: unknown;
      folder?: unknown;
      fileName?: unknown;
    };
    if (payload.purpose !== "pdf_stream") return null;
    if (payload.folder !== "textbooks" && payload.folder !== "caselets") return null;
    if (typeof payload.fileName !== "string" || !payload.fileName) return null;
    const safeName = path.basename(payload.fileName);
    if (safeName !== payload.fileName) return null;
    return { folder: payload.folder, fileName: safeName };
  } catch {
    return null;
  }
}

export function ownsBook(user: SessionUser, bookId: string): boolean {
  if (user.isAdmin) return true;
  return user.purchasedBookIds.includes(String(bookId));
}

export async function hasActiveRental(user: SessionUser, bookId: string): Promise<boolean> {
  if (user.isAdmin) return true;
  if (user.emails.length === 0 && !user.phone) return false;
  const res = await pool.query(
    `SELECT 1 FROM book_rentals
     WHERE book_id = $1 AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
       AND (LOWER(user_email) = ANY($2)
            OR ($3 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(user_phone, ''), '\\D', '', 'g'), 10) = $3))
     LIMIT 1`,
    [String(bookId), user.emails, user.phone || ""]
  );
  return res.rows.length > 0;
}

// Mirrors the portal's caselet list: a caselet is readable with an owned book bought on a
// caselet plan, or with an active rental of that book.
export async function canReadCaselet(user: SessionUser, bookId: string): Promise<boolean> {
  if (user.isAdmin) return true;
  if (ownsBook(user, bookId)) {
    if (
      user.plans?.some((p) =>
        ["caselet", "book_caselet", "book_caselet_portal", "complete"].includes(p)
      )
    ) {
      return true;
    }
    const identifiers = [...user.emails, ...(user.phone ? [user.phone] : [])];
    const res = await pool.query(
      `SELECT 1 FROM textbooks_purchases
       WHERE book_id = $1 AND purchase_plan IN ('caselet', 'book_caselet', 'book_caselet_portal', 'complete')
         AND (LOWER(user_identifier) = ANY($2) OR LOWER(customer_email) = ANY($2)
              OR RIGHT(REGEXP_REPLACE(COALESCE(customer_phone, ''), '\\D', '', 'g'), 10) = $3)
       LIMIT 1`,
      [String(bookId), identifiers, user.phone || "-"]
    );
    if (res.rows.length > 0) return true;
  }
  return hasActiveRental(user, bookId);
}
