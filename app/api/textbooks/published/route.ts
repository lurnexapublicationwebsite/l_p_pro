import { NextResponse } from "next/server";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";

// Lists the PDF file names of published textbooks. The PDFs themselves are private in S3,
// so this comes from the book data rather than a public folder.
export async function GET() {
  return NextResponse.json({ files: PUBLISHED_BOOKS_DATA.map((b) => b.pdfFileName) });
}
