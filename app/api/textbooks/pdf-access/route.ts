import { NextResponse } from "next/server";
import { PUBLISHED_BOOKS_DATA, CASELET_PDF_FILES } from "@/lib/data/books";
import { getSessionUser } from "@/lib/textbookSession";
import { canReadCaselet, ownsBook, signedPdfUrl } from "@/lib/protectedPdf";

// POST { kind: "book", bookId } or { kind: "caselet", bookId, caseletIndex }
// with "Authorization: Bearer <session token>". Returns a short-lived signed PDF link.
export async function POST(req: Request) {
  try {
    const { kind, bookId, caseletIndex } = await req.json();
    const id = String(bookId || "");

    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Your session has expired. Please log out and log in again to read this book.", sessionExpired: true },
        { status: 401 }
      );
    }

    let folder: "textbooks" | "caselets";
    let fileName: string | undefined;

    if (kind === "book") {
      fileName = PUBLISHED_BOOKS_DATA.find((b) => b.id === id)?.pdfFileName;
      if (!fileName) return NextResponse.json({ error: "Book not found." }, { status: 404 });
      if (!ownsBook(user, id)) {
        return NextResponse.json({ error: "You have not purchased this book." }, { status: 403 });
      }
      folder = "textbooks";
    } else if (kind === "caselet") {
      fileName = CASELET_PDF_FILES[id]?.[Number(caseletIndex) || 0];
      if (!fileName) return NextResponse.json({ error: "Caselet not found." }, { status: 404 });
      if (!(await canReadCaselet(user, id))) {
        return NextResponse.json({ error: "You do not have access to this caselet." }, { status: 403 });
      }
      folder = "caselets";
    } else {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const pdfUrl = await signedPdfUrl(folder, fileName);
    if (!pdfUrl) {
      console.error("pdf-access: S3 credentials are not configured");
      return NextResponse.json({ error: "Reading is temporarily unavailable. Please try again later." }, { status: 503 });
    }
    return NextResponse.json({ pdfUrl });
  } catch (err) {
    console.error("❌ Error in /api/textbooks/pdf-access:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
