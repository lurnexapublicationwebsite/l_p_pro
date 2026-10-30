import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { slugifyBookTitle } from "@/lib/data/books";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bookId = (formData.get("bookId") as string) || "new";
    const title = (formData.get("title") as string) || "";
    const type = (formData.get("type") as string) || "full"; // "full" | "preview"

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided." }, { status: 400 });
    }

    const originalName = file.name || "textbook.pdf";
    if (!originalName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only .pdf files are permitted." }, { status: 400 });
    }

    // Determine clean safe file name based on book title slug or file name
    const slug = slugifyBookTitle(title || `book-${bookId}`);
    const safeBase = slug || path.basename(originalName, ".pdf").replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
    const targetFileName = type === "preview" ? `${safeBase}_preview.pdf` : `${safeBase}.pdf`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (type === "preview") {
      const previewDir = path.join(process.cwd(), "public", "published_books", "previews");
      if (!fs.existsSync(previewDir)) {
        fs.mkdirSync(previewDir, { recursive: true });
      }
      fs.writeFileSync(path.join(previewDir, targetFileName), buffer);
    } else {
      // Softcopy / Full book PDF for bookstore and reader
      const portalDir = path.join(process.cwd(), "public", "portal_textbooks");
      if (!fs.existsSync(portalDir)) {
        fs.mkdirSync(portalDir, { recursive: true });
      }
      fs.writeFileSync(path.join(portalDir, targetFileName), buffer);

      const s3Dir = path.join(process.cwd(), "s3-upload", "textbooks");
      if (fs.existsSync(s3Dir)) {
        fs.writeFileSync(path.join(s3Dir, targetFileName), buffer);
      }
    }

    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    return NextResponse.json({
      success: true,
      fileName: targetFileName,
      originalName,
      fileSize: file.size,
      fileSizeFormatted,
      fileUrl: type === "preview" ? `/published_books/previews/${targetFileName}` : `/portal_textbooks/${targetFileName}`,
      message: `PDF file uploaded successfully as ${targetFileName}`,
    });
  } catch (err: any) {
    console.error("Error uploading textbook PDF:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload textbook PDF." },
      { status: 500 }
    );
  }
}

