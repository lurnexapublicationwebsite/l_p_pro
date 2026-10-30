import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_HASINI_LAUNCH_BOOKS } from "@/lib/birthdayLaunch";
import { getMergedCatalogBooks } from "@/lib/bookCatalogStore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = String(searchParams.get("bookId") || "").trim();

    let book = DEFAULT_HASINI_LAUNCH_BOOKS.find((b) => String(b.id) === bookId);
    try {
      const { allAdminBooks } = await getMergedCatalogBooks();
      const adminBook = allAdminBooks.find((b) => String(b.id) === bookId);
      if (adminBook) book = adminBook;
    } catch {}

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const candidateFiles = [
      book.pdfFileName ? path.basename(book.pdfFileName) : null,
      bookId === "10" ? "deep_learning.pdf" : null,
      bookId === "10" ? "ai.pdf" : null,
      bookId === "11" ? "cloud_computing.pdf" : null,
      bookId === "11" ? "data_streaming.pdf" : null
    ].filter(Boolean) as string[];

    const searchDirs = [
      path.join(process.cwd(), "s3-upload", "textbooks"),
      path.join(process.cwd(), "public", "portal_textbooks")
    ];

    let foundPath: string | null = null;
    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      for (const name of candidateFiles) {
        const candidate = path.join(dir, name);
        if (fs.existsSync(candidate)) {
          try {
            const stats = fs.statSync(candidate);
            if (stats.size > 1000) {
              foundPath = candidate;
              break;
            }
          } catch {}
        }
      }
      if (foundPath) break;
    }

    if (!foundPath) {
      return NextResponse.json(
        { error: "Book softcopy PDF not yet uploaded on this server" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(foundPath);
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(book.pdfFileName || "book.pdf")}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=600"
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load reader PDF" },
      { status: 500 }
    );
  }
}

