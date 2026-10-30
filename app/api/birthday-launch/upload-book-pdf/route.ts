import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pool } from "@/lib/dbPool";
import {
  BIRTHDAY_LAUNCH_EVENT_KEY,
  DEFAULT_HASINI_LAUNCH_BOOKS,
  normalizeLaunchBook,
  BirthdayLaunchState
} from "@/lib/birthdayLaunch";
import { saveCatalogBookOverride } from "@/lib/bookCatalogStore";

const localDir =
  typeof process !== "undefined" && (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL)
    ? "/tmp"
    : path.join(process.cwd(), "scratch");
const localFilePath = path.join(localDir, "birthday_book_launch.json");

function readLocalState(): BirthdayLaunchState | null {
  try {
    if (!fs.existsSync(localFilePath)) return null;
    const raw = fs.readFileSync(localFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as BirthdayLaunchState;
  } catch {
    return null;
  }
}

function writeLocalState(state: BirthdayLaunchState): void {
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(localFilePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local birthday launch state:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bookId = String(formData.get("bookId") || "").trim();
    const uploadType = String(formData.get("type") || "full").trim(); // "full" or "preview"

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    // Determine safe file name
    const rawName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const safeName = rawName.toLowerCase().endsWith(".pdf") ? rawName : `${rawName}.pdf`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save directories
    const s3UploadTextbooksDir = path.join(process.cwd(), "s3-upload", "textbooks");
    const portalTextbooksDir = path.join(process.cwd(), "public", "portal_textbooks");
    const previewsDir = path.join(process.cwd(), "public", "published_books", "previews");

    // Ensure folders exist
    for (const dir of [s3UploadTextbooksDir, portalTextbooksDir, previewsDir]) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      } catch {}
    }

    // Write file to s3-upload/textbooks and public/portal_textbooks
    try {
      fs.writeFileSync(path.join(s3UploadTextbooksDir, safeName), buffer);
    } catch (e) {
      console.warn("Could not write to s3-upload/textbooks:", e);
    }

    try {
      fs.writeFileSync(path.join(portalTextbooksDir, safeName), buffer);
    } catch (e) {
      console.warn("Could not write to public/portal_textbooks:", e);
    }

    if (uploadType === "preview") {
      try {
        fs.writeFileSync(path.join(previewsDir, safeName), buffer);
      } catch (e) {
        console.warn("Could not write to public/published_books/previews:", e);
      }
    }

    // Update launch state
    let state = readLocalState();
    if (!state) {
      state = {
        eventKey: BIRTHDAY_LAUNCH_EVENT_KEY,
        honoreeName: "Hasini",
        eventDate: "2026-10-30",
        isLaunched: false,
        launchedAt: null,
        books: DEFAULT_HASINI_LAUNCH_BOOKS
      };
    }

    const bookIdx = state.books.findIndex((b) => String(b.id) === bookId);
    if (bookIdx >= 0) {
      const targetBook = state.books[bookIdx];
      if (uploadType === "full") {
        state.books[bookIdx] = {
          ...targetBook,
          pdfFileName: safeName,
          fullBookPdfSize: buffer.length,
          fullBookPdfUploadedAt: new Date().toISOString()
        };
      } else {
        state.books[bookIdx] = {
          ...targetBook,
          pdfFileName: safeName
        };
      }
      writeLocalState(state);

      // Save catalog override so bookstores and e-reader recognize the updated book
      try {
        await saveCatalogBookOverride(state.books[bookIdx]);
      } catch {}

      // If DB is connected, update DB
      try {
        await pool.query(
          `UPDATE birthday_book_launch SET books_data = $1::jsonb, updated_at = CURRENT_TIMESTAMP WHERE event_key = $2`,
          [JSON.stringify(state.books), BIRTHDAY_LAUNCH_EVENT_KEY]
        );
      } catch {}
    }

    return NextResponse.json({
      success: true,
      fileName: safeName,
      fileSize: buffer.length,
      fileSizeFormatted: `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`,
      message:
        uploadType === "full"
          ? "Full textbook PDF uploaded successfully! Softcopy buyers can now read it in Reading Mode."
          : "Sample preview PDF uploaded successfully!"
    });
  } catch (err: any) {
    console.error("Error uploading book PDF:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload PDF file" },
      { status: 500 }
    );
  }
}

