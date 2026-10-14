import { NextResponse } from "next/server";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { signedPdfUrl } from "@/lib/protectedPdf";
import { findBookIdByToken } from "@/lib/bookLinks";

// Unique full-text download link per book, listed only in the Crossref XML
// (see lib/bookLinks.ts). Anyone with the link downloads the PDF.
const NO_INDEX = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

async function handle(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const secret = process.env.BOOK_DOWNLOAD_LINK_SECRET;
  const bookId = secret
    ? findBookIdByToken(token.replace(/\.pdf$/i, ""), PUBLISHED_BOOKS_DATA.map((b) => b.id), secret)
    : null;
  const book = bookId ? PUBLISHED_BOOKS_DATA.find((b) => b.id === bookId) : undefined;
  if (!book) return new NextResponse("Not found", { status: 404, headers: NO_INDEX });

  const url = await signedPdfUrl("textbooks", book.pdfFileName, 10 * 60, book.title);
  if (!url) return new NextResponse("Temporarily unavailable", { status: 503, headers: NO_INDEX });
  return NextResponse.redirect(url, { status: 302, headers: NO_INDEX });
}

export const GET = handle;
export const HEAD = handle;
