import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  DEFAULT_HASINI_LAUNCH_BOOKS
} from "@/lib/birthdayLaunch";
import { Book } from "@/lib/data/books";
import { getMergedCatalogBooks } from "@/lib/bookCatalogStore";

async function getCurrentBook(bookIdOrFile: string): Promise<Book> {
  try {
    const { allAdminBooks } = await getMergedCatalogBooks();
    const found = allAdminBooks.find(
      (b) =>
        String(b.id) === String(bookIdOrFile) ||
        b.pdfFileName === bookIdOrFile ||
        b.slug === bookIdOrFile
    );
    if (found) return found;
  } catch {
    // Fallback below
  }

  const foundDefault = DEFAULT_HASINI_LAUNCH_BOOKS.find(
    (b) =>
      String(b.id) === String(bookIdOrFile) ||
      b.pdfFileName === bookIdOrFile ||
      b.slug === bookIdOrFile
  );
  return foundDefault || DEFAULT_HASINI_LAUNCH_BOOKS[0];
}

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxCharsPerLine) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

async function generateBookPreviewPdfBuffer(book: Book): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primary = rgb(0.06, 0.09, 0.16);
  const accent = rgb(0.64, 0.11, 0.69);
  const gold = rgb(0.71, 0.33, 0.04);
  const muted = rgb(0.28, 0.33, 0.41);
  const lightBorder = rgb(0.82, 0.86, 0.91);

  // =========================================================================
  // PAGE 1: TITLE & EDITORIAL OVERVIEW PAGE
  // =========================================================================
  const page1 = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  page1.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: lightBorder,
    borderWidth: 1.5
  });

  page1.drawRectangle({
    x: 42,
    y: 42,
    width: width - 84,
    height: height - 84,
    borderColor: gold,
    borderWidth: 0.75
  });

  let y = height - 85;

  page1.drawText("LURNEXA PUBLICATIONS  |  PEER-REVIEWED ACADEMIC TEXTBOOK", {
    x: 64,
    y,
    size: 10.5,
    font: fontBold,
    color: accent
  });

  y -= 20;
  page1.drawText(
    `SPECIAL EDITION  |  OFFICIALLY LAUNCHED ON ${(book.publishedDate || "OCTOBER 30, 2026").toUpperCase()}`,
    {
      x: 64,
      y,
      size: 9.5,
      font: fontBold,
      color: gold
    }
  );

  y -= 42;
  const titleLines = wrapText((book.title || "").toUpperCase(), 46);
  for (const line of titleLines) {
    page1.drawText(line, {
      x: 64,
      y,
      size: 17,
      font: fontBold,
      color: primary
    });
    y -= 24;
  }

  y -= 10;
  page1.drawText(`Academic Domain: ${book.domain || "Computer Science & Engineering"}`, {
    x: 64,
    y,
    size: 11,
    font: fontBold,
    color: muted
  });

  y -= 22;
  page1.drawText(`Authors: ${book.authors || "Lurnexa Academic Press"}`, {
    x: 64,
    y,
    size: 12,
    font: fontBold,
    color: primary
  });

  y -= 24;
  page1.drawLine({
    start: { x: 64, y },
    end: { x: width - 64, y },
    thickness: 1,
    color: lightBorder
  });

  y -= 28;
  page1.drawText("ABOUT THIS TEXTBOOK", {
    x: 64,
    y,
    size: 12,
    font: fontBold,
    color: primary
  });

  y -= 20;
  const descLines = wrapText(book.description || "", 76);
  for (const line of descLines) {
    page1.drawText(line, {
      x: 64,
      y,
      size: 10.5,
      font: fontRegular,
      color: muted
    });
    y -= 16;
  }

  if (book.longDescription && book.longDescription !== book.description) {
    y -= 10;
    const longLines = wrapText(book.longDescription, 76);
    for (const line of longLines) {
      if (y < 150) break;
      page1.drawText(line, {
        x: 64,
        y,
        size: 10,
        font: fontRegular,
        color: muted
      });
      y -= 15;
    }
  }

  // Editorial Specs Box at bottom of Page 1
  page1.drawLine({
    start: { x: 64, y: 125 },
    end: { x: width - 64, y: 125 },
    thickness: 1,
    color: lightBorder
  });

  page1.drawText(
    `Paperback ISBN: ${book.isbn || "N/A"}     |     Digital ISBN: ${book.isbnDigital || "N/A"}`,
    {
      x: 64,
      y: 100,
      size: 10,
      font: fontBold,
      color: primary
    }
  );

  page1.drawText(
    `Pages: ${book.pages || 240} Pages     |     Paperback Price: Rs. ${book.price}     |     Digital Edition: Rs. ${book.digitalPrice}`,
    {
      x: 64,
      y: 80,
      size: 9.5,
      font: fontRegular,
      color: muted
    }
  );

  // =========================================================================
  // PAGE 2: COMPLETE TABLE OF CONTENTS (CHAPTERS & MODULES) + SAMPLE EXCERPT
  // =========================================================================
  const page2 = pdfDoc.addPage([595.28, 841.89]);

  page2.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: lightBorder,
    borderWidth: 1.5
  });

  let y2 = height - 75;

  page2.drawText("LURNEXA PUBLICATIONS  |  COMPLETE CHAPTERS & MODULES", {
    x: 64,
    y: y2,
    size: 10,
    font: fontBold,
    color: accent
  });

  y2 -= 24;
  page2.drawText("TABLE OF CONTENTS (CHAPTERS / MODULES)", {
    x: 64,
    y: y2,
    size: 15,
    font: fontBold,
    color: primary
  });

  y2 -= 14;
  page2.drawLine({
    start: { x: 64, y: y2 },
    end: { x: width - 64, y: y2 },
    thickness: 1,
    color: lightBorder
  });

  y2 -= 26;

  const chapters =
    Array.isArray(book.tableOfContents) && book.tableOfContents.length > 0
      ? book.tableOfContents
      : [
          "Chapter 1: Foundations & Core Concepts",
          "Chapter 2: Theoretical Framework & Architecture",
          "Chapter 3: Algorithms, Models & Design Patterns",
          "Chapter 4: Practical Implementation & Case Studies",
          "Chapter 5: Advanced Topics & Future Directions"
        ];

  chapters.forEach((chapter, idx) => {
    if (y2 < 230) return;
    const estPage = 1 + idx * Math.max(16, Math.floor((book.pages || 240) / (chapters.length + 1)));
    const chLines = wrapText(chapter, 66);
    chLines.forEach((line, lIdx) => {
      page2.drawText(line, {
        x: 64,
        y: y2,
        size: 10.5,
        font: fontBold,
        color: primary
      });
      if (lIdx === chLines.length - 1) {
        page2.drawText(`Page ${estPage}`, {
          x: width - 115,
          y: y2,
          size: 9.5,
          font: fontRegular,
          color: muted
        });
      }
      y2 -= 16;
    });
    y2 -= 8;
  });

  y2 -= 10;
  page2.drawLine({
    start: { x: 64, y: y2 },
    end: { x: width - 64, y: y2 },
    thickness: 1,
    color: lightBorder
  });

  y2 -= 26;
  const firstChapter = chapters[0] || "Chapter 1: Introduction";
  page2.drawText("SAMPLE MODULE PREVIEW", {
    x: 64,
    y: y2,
    size: 10,
    font: fontBold,
    color: accent
  });

  y2 -= 20;
  for (const line of wrapText(firstChapter, 64)) {
    page2.drawText(line, {
      x: 64,
      y: y2,
      size: 12.5,
      font: fontBold,
      color: primary
    });
    y2 -= 18;
  }

  y2 -= 6;
  const sampleParagraph = `This sample preview introduces "${firstChapter}" from "${book.title}". Across ${chapters.length} structured chapters/modules, this textbook combines rigorous theoretical foundations with real-world case studies and hands-on exercises tailored for university students, educators, and professionals.`;
  for (const line of wrapText(sampleParagraph, 76)) {
    if (y2 < 85) break;
    page2.drawText(line, {
      x: 64,
      y: y2,
      size: 10,
      font: fontRegular,
      color: muted
    });
    y2 -= 15;
  }

  page2.drawText(
    "Protected Sample Preview  |  Full textbook & student portal resources available in the Lurnexa Bookstore.",
    {
      x: 64,
      y: 56,
      size: 9,
      font: fontOblique,
      color: muted
    }
  );

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId") || "10";
    const book = await getCurrentBook(bookId);

    // 1. Custom base64 uploaded preview PDF
    const customPdfDataUrl = book.customPreviewPdfDataUrl;
    if (customPdfDataUrl && customPdfDataUrl.startsWith("data:application/pdf;base64,")) {
      const base64 = customPdfDataUrl.replace("data:application/pdf;base64,", "");
      const buf = Buffer.from(base64, "base64");
      return new NextResponse(new Uint8Array(buf), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "inline",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "public, max-age=3600"
        }
      });
    }

    // 2. Check for authentic original preview PDF or textbook file on disk
    const previewsDir = path.join(process.cwd(), "public", "published_books", "previews");
    const s3Dir = path.join(process.cwd(), "s3-upload", "textbooks");

    const candidateNames = [
      book.pdfFileName ? path.basename(book.pdfFileName) : null,
      book.slug ? `${book.slug}.pdf` : null,
      book.pdfFileName === "data_streaming.pdf" ? "data_streaming_and_analysis.pdf" : null,
      book.pdfFileName === "data_streaming_and_analysis.pdf" ? "data_streaming.pdf" : null,
      book.id ? `book_${book.id}_preview.pdf` : null
    ].filter(Boolean) as string[];

    // Check previews directory first
    for (const name of candidateNames) {
      const p = path.join(previewsDir, name);
      if (fs.existsSync(p)) {
        try {
          const stats = fs.statSync(p);
          // Ensure it is an authentic preview file (> 10KB)
          if (stats.size > 10000) {
            const buf = fs.readFileSync(p);
            return new NextResponse(new Uint8Array(buf), {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=3600"
              }
            });
          }
        } catch {
          // Continue to next candidate
        }
      }
    }

    // Check s3-upload textbooks directory as secondary source
    for (const name of candidateNames) {
      const p = path.join(s3Dir, name);
      if (fs.existsSync(p)) {
        try {
          const stats = fs.statSync(p);
          if (stats.size > 10000) {
            const buf = fs.readFileSync(p);
            return new NextResponse(new Uint8Array(buf), {
              headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
                "X-Content-Type-Options": "nosniff",
                "Cache-Control": "public, max-age=3600"
              }
            });
          }
        } catch {
          // Continue to next candidate
        }
      }
    }

    // 3. Fallback: dynamically generate placeholder preview only if no authentic file exists anywhere
    const pdfBuffer = await generateBookPreviewPdfBuffer(book);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate preview PDF" },
      { status: 500 }
    );
  }
}
