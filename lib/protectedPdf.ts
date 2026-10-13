import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { pool } from "@/lib/dbPool";
import { s3, s3HasCredentials, BUCKET_NAME } from "@/lib/s3";
import type { SessionUser } from "@/lib/textbookSession";

// Paid textbook and caselet PDFs live privately in S3 (bucket "lurnexa"):
//   textbooks/<pdfFileName>   caselets/<caselet pdf>
// They are never served from public/. Readers get a short-lived signed link after
// the server has checked the logged-in user's purchase or rental.

const LINK_TTL_SECONDS = 30 * 60;

export async function signedPdfUrl(
  folder: "textbooks" | "caselets",
  fileName: string,
  expiresIn = LINK_TTL_SECONDS
): Promise<string | null> {
  if (!s3HasCredentials) return null;
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `${folder}/${fileName}`,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: "inline",
  });
  return getSignedUrl(s3, command, { expiresIn });
}

export function ownsBook(user: SessionUser, bookId: string): boolean {
  return user.purchasedBookIds.includes(String(bookId));
}

export async function hasActiveRental(user: SessionUser, bookId: string): Promise<boolean> {
  if (user.emails.length === 0) return false;
  const res = await pool.query(
    `SELECT 1 FROM book_rentals
     WHERE book_id = $1 AND status = 'active' AND (expires_at IS NULL OR expires_at > NOW())
       AND LOWER(user_email) = ANY($2)
     LIMIT 1`,
    [String(bookId), user.emails]
  );
  return res.rows.length > 0;
}

// Mirrors the portal's caselet list: a caselet is readable with an owned book bought on a
// caselet plan, or with an active rental of that book.
export async function canReadCaselet(user: SessionUser, bookId: string): Promise<boolean> {
  if (ownsBook(user, bookId)) {
    const identifiers = [...user.emails, ...(user.phone ? [user.phone] : [])];
    const res = await pool.query(
      `SELECT 1 FROM textbooks_purchases
       WHERE book_id = $1 AND purchase_plan IN ('caselet', 'book_caselet')
         AND (LOWER(user_identifier) = ANY($2) OR LOWER(customer_email) = ANY($2)
              OR RIGHT(REGEXP_REPLACE(COALESCE(customer_phone, ''), '\\D', '', 'g'), 10) = $3)
       LIMIT 1`,
      [String(bookId), identifiers, user.phone || "-"]
    );
    if (res.rows.length > 0) return true;
  }
  return hasActiveRental(user, bookId);
}
