import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { signedPdfUrl } from "@/lib/protectedPdf";

// One-time PDF download shown on the checkout success screen right after payment.
// POST { orderId }: for a PAID digital order, the download links are issued exactly once.
// Any later request for the same order (page refresh, reopening the page) gets status "used",
// so the download button never appears again.
const LINK_TTL_SECONDS = 30 * 60;
const DIGITAL_FORMATS = ["soft", "upgrade"];

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "Missing order." }, { status: 400 });
    }

    const orderRes = await pool.query(
      `SELECT book_id, purchase_format FROM textbooks_purchases WHERE order_id = $1 AND status = 'PAID' LIMIT 1`,
      [orderId]
    );
    const order = orderRes.rows[0];
    if (!order) return NextResponse.json({ status: "unavailable" }, { status: 404 });
    if (!DIGITAL_FORMATS.includes(String(order.purchase_format || "").toLowerCase())) {
      return NextResponse.json({ status: "not_digital" });
    }

    const books = String(order.book_id || "")
      .split(",")
      .map((id) => PUBLISHED_BOOKS_DATA.find((b) => b.id === id.trim()))
      .filter((b): b is (typeof PUBLISHED_BOOKS_DATA)[number] => Boolean(b));
    if (books.length === 0) return NextResponse.json({ status: "unavailable" }, { status: 404 });

    await pool.query(`CREATE TABLE IF NOT EXISTS textbook_download_links (
      order_id VARCHAR(255) PRIMARY KEY,
      issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    // Atomic claim: only the first request for this order inserts the row and gets the links.
    const claim = await pool.query(
      `INSERT INTO textbook_download_links (order_id) VALUES ($1) ON CONFLICT (order_id) DO NOTHING RETURNING order_id`,
      [orderId]
    );
    if (claim.rows.length === 0) {
      return NextResponse.json({ status: "used" });
    }

    const downloads = [];
    for (const book of books) {
      const pdfUrl = await signedPdfUrl("textbooks", book.pdfFileName, LINK_TTL_SECONDS, book.title);
      if (!pdfUrl) {
        // Release the claim so the buyer can try again once storage is reachable.
        await pool.query(`DELETE FROM textbook_download_links WHERE order_id = $1`, [orderId]);
        return NextResponse.json({ error: "Downloads are temporarily unavailable. Please refresh in a minute." }, { status: 503 });
      }
      downloads.push({ bookId: book.id, title: book.title, pdfUrl });
    }
    return NextResponse.json({ status: "available", downloads });
  } catch (err) {
    console.error("❌ Error in /api/textbooks/pdf-download:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
