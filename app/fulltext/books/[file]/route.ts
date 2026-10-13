import { NextResponse } from "next/server";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { signedPdfUrl } from "@/lib/protectedPdf";
import { isTurnitinRequest } from "@/lib/turnitin";

// Full-text link deposited with Crossref for Similarity Check (crawler "iParadigms").
// Only Turnitin's crawler addresses get the paid PDF; everyone else is refused.
async function handle(req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const book = PUBLISHED_BOOKS_DATA.find((b) => b.pdfFileName === file);
  if (!book) return new NextResponse("Not found", { status: 404 });

  if (!isTurnitinRequest(req.headers)) {
    return new NextResponse("This full text is available to Crossref Similarity Check only.", {
      status: 403,
      headers: { "X-Robots-Tag": "noindex" },
    });
  }

  const url = await signedPdfUrl("textbooks", book.pdfFileName, 10 * 60);
  if (!url) return new NextResponse("Temporarily unavailable", { status: 503 });
  console.log(`Similarity Check crawler fetched ${book.pdfFileName}`);
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}

export const GET = handle;
export const HEAD = handle;
