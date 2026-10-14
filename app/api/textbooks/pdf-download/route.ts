import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { getSessionUser } from "@/lib/textbookSession";
import { ownsBook, signedPdfUrl } from "@/lib/protectedPdf";

// One-time PDF download for buyers, offered on the book page that the Crossref
// full-text link (/fulltext/books/<file>) sends visitors to.
// POST { bookId, action: "status" | "download" } with "Authorization: Bearer <session token>".
// The first "download" opens a 30-minute window (so a failed download can be retried);
// after that the purchase's download is used up.
const RETRY_WINDOW_MS = 30 * 60 * 1000;

async function ensureTable() {
  await pool.query(`CREATE TABLE IF NOT EXISTS textbook_downloads (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    book_id VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_email, book_id)
  )`);
}

export async function POST(req: Request) {
  try {
    const { bookId, action } = await req.json();
    const book = PUBLISHED_BOOKS_DATA.find((b) => b.id === String(bookId || ""));
    if (!book) return NextResponse.json({ error: "Book not found." }, { status: 404 });

    const user = await getSessionUser(req);
    if (!user || user.emails.length === 0) {
      return NextResponse.json({ status: "login_required", error: "Please log in to download your book." }, { status: 401 });
    }
    if (!ownsBook(user, book.id)) {
      return NextResponse.json({ status: "not_purchased", error: "Buy this book to download it." }, { status: 403 });
    }

    await ensureTable();
    const existing = await pool.query(
      `SELECT created_at FROM textbook_downloads WHERE book_id = $1 AND LOWER(user_email) = ANY($2) ORDER BY created_at LIMIT 1`,
      [book.id, user.emails]
    );
    const startedAt = existing.rows[0] ? new Date(existing.rows[0].created_at).getTime() : null;
    const windowOpen = startedAt !== null && Date.now() - startedAt < RETRY_WINDOW_MS;

    if (startedAt !== null && !windowOpen) {
      return NextResponse.json({ status: "used", downloadedAt: new Date(startedAt).toISOString() });
    }
    if (action !== "download") {
      return NextResponse.json({ status: "available" });
    }

    if (startedAt === null) {
      await pool.query(
        `INSERT INTO textbook_downloads (user_email, book_id) VALUES ($1, $2) ON CONFLICT (user_email, book_id) DO NOTHING`,
        [user.emails[0], book.id]
      );
    }
    const remainingSeconds = startedAt === null ? RETRY_WINDOW_MS / 1000 : Math.ceil((startedAt + RETRY_WINDOW_MS - Date.now()) / 1000);
    const pdfUrl = await signedPdfUrl("textbooks", book.pdfFileName, Math.max(60, remainingSeconds), book.title);
    if (!pdfUrl) {
      return NextResponse.json({ error: "Downloads are temporarily unavailable. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ status: "available", pdfUrl });
  } catch (err) {
    console.error("❌ Error in /api/textbooks/pdf-download:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
