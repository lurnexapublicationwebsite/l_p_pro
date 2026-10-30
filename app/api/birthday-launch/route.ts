import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { pool } from "@/lib/dbPool";
import {
  BIRTHDAY_LAUNCH_EVENT_KEY,
  BirthdayLaunchState,
  DEFAULT_HASINI_LAUNCH_BOOKS,
  normalizeLaunchBook
} from "@/lib/birthdayLaunch";
import { getMergedCatalogBooks, saveCatalogBookOverride } from "@/lib/bookCatalogStore";

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

async function ensureLaunchTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS birthday_book_launch (
        event_key VARCHAR(100) PRIMARY KEY,
        is_launched BOOLEAN DEFAULT FALSE,
        launched_at VARCHAR(100),
        books_data JSONB,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch {
    // Ignore when running on local fallback
  }
}

async function getLaunchState(): Promise<BirthdayLaunchState> {
  await ensureLaunchTable();

  const local = readLocalState();

  try {
    const res = await pool.query(
      "SELECT * FROM birthday_book_launch WHERE event_key = $1",
      [BIRTHDAY_LAUNCH_EVENT_KEY]
    );
    if (res.rows && res.rows.length > 0) {
      const row = res.rows[0];
      const rawBooks = Array.isArray(row.books_data)
        ? row.books_data
        : DEFAULT_HASINI_LAUNCH_BOOKS;
      const books = DEFAULT_HASINI_LAUNCH_BOOKS.map((fallback, idx) =>
        normalizeLaunchBook(rawBooks[idx] || {}, fallback)
      );
      return {
        eventKey: BIRTHDAY_LAUNCH_EVENT_KEY,
        honoreeName: "Hasini",
        eventDate: "2026-10-30",
        isLaunched: Boolean(row.is_launched),
        launchedAt: row.launched_at || null,
        books
      };
    }
  } catch {
    // Fall back to local file state
  }

  if (local) {
    const rawBooks = Array.isArray(local.books)
      ? local.books
      : DEFAULT_HASINI_LAUNCH_BOOKS;
    const books = DEFAULT_HASINI_LAUNCH_BOOKS.map((fallback, idx) =>
      normalizeLaunchBook(rawBooks[idx] || {}, fallback)
    );
    return {
      eventKey: BIRTHDAY_LAUNCH_EVENT_KEY,
      honoreeName: "Hasini",
      eventDate: "2026-10-30",
      isLaunched: Boolean(local.isLaunched),
      launchedAt: local.launchedAt || null,
      books
    };
  }

  return {
    eventKey: BIRTHDAY_LAUNCH_EVENT_KEY,
    honoreeName: "Hasini",
    eventDate: "2026-10-30",
    isLaunched: false,
    launchedAt: null,
    books: DEFAULT_HASINI_LAUNCH_BOOKS
  };
}

async function saveLaunchState(state: BirthdayLaunchState): Promise<BirthdayLaunchState> {
  writeLocalState(state);

  // If custom preview or full book PDFs were uploaded, write them to disk for reading mode & preview
  try {
    const previewsDir = path.join(process.cwd(), "public", "published_books", "previews");
    const s3UploadTextbooksDir = path.join(process.cwd(), "s3-upload", "textbooks");
    const portalTextbooksDir = path.join(process.cwd(), "public", "portal_textbooks");

    for (const dir of [previewsDir, s3UploadTextbooksDir, portalTextbooksDir]) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      } catch {}
    }

    for (const b of state.books) {
      if (b.pdfFileName) {
        const safeBaseName = path.basename(b.pdfFileName);

        // Preview PDF
        if (
          b.customPreviewPdfDataUrl &&
          b.customPreviewPdfDataUrl.startsWith("data:application/pdf;base64,")
        ) {
          const base64 = b.customPreviewPdfDataUrl.replace("data:application/pdf;base64,", "");
          fs.writeFileSync(
            path.join(previewsDir, safeBaseName),
            Buffer.from(base64, "base64")
          );
        }

        // Full Book Softcopy PDF for Reading Mode
        if (
          b.customFullBookPdfDataUrl &&
          b.customFullBookPdfDataUrl.startsWith("data:application/pdf;base64,")
        ) {
          const base64 = b.customFullBookPdfDataUrl.replace("data:application/pdf;base64,", "");
          const buf = Buffer.from(base64, "base64");
          fs.writeFileSync(path.join(s3UploadTextbooksDir, safeBaseName), buf);
          fs.writeFileSync(path.join(portalTextbooksDir, safeBaseName), buf);
        }
      }
    }
  } catch {
    // Ignore on read-only fs
  }

  await ensureLaunchTable();
  try {
    await pool.query(
      `INSERT INTO birthday_book_launch (event_key, is_launched, launched_at, books_data, updated_at)
       VALUES ($1, $2, $3, $4::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (event_key) DO UPDATE SET
         is_launched = EXCLUDED.is_launched,
         launched_at = EXCLUDED.launched_at,
         books_data = EXCLUDED.books_data,
         updated_at = CURRENT_TIMESTAMP`,
      [
        state.eventKey,
        state.isLaunched,
        state.launchedAt,
        JSON.stringify(state.books)
      ]
    );

    // Always sync birthday books & their chapter/module counts into textbooks_textbooks, textbooks_book_chapters, and catalog overrides so Admin Textbooks Manager can view & edit them
    for (const b of state.books) {
      const chaptersCount = Array.isArray(b.tableOfContents) && b.tableOfContents.length > 0
        ? b.tableOfContents.length
        : 6;
      try {
        await saveCatalogBookOverride(b);
      } catch {
        // Ignore
      }
      try {
        await pool.query(
          `INSERT INTO textbooks_textbooks (id, title, code)
           VALUES ($1, $2, $3)
           ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, code = EXCLUDED.code`,
          [String(b.id), b.title, b.code || "BK"]
        );
        await pool.query(
          `INSERT INTO textbooks_book_chapters (book_id, chapters_count)
           VALUES ($1, $2)
           ON CONFLICT (book_id) DO UPDATE SET chapters_count = EXCLUDED.chapters_count`,
          [String(b.id), chaptersCount]
        );
      } catch {
        // Ignore if textbooks tables not yet created
      }
    }
  } catch {
    // Local file already saved
  }
  return state;
}

export async function GET() {
  const state = await getLaunchState();
  try {
    const { allAdminBooks, deletedIds } = await getMergedCatalogBooks();
    const deletedSet = new Set((deletedIds || []).map(String));
    const mergedBooks = state.books
      .filter((b) => !deletedSet.has(String(b.id)))
      .map((b) => {
        const adminOverride = allAdminBooks.find((ab) => String(ab.id) === String(b.id));
        return adminOverride ? normalizeLaunchBook(adminOverride, b) : b;
      });
    return NextResponse.json(
      { ...state, books: mergedBooks, deletedIds: Array.from(deletedSet) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch {
    return NextResponse.json(state, {
      headers: { "Cache-Control": "no-store, max-age=0" }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action || "launch";
    const current = await getLaunchState();

    if (action === "launch") {
      const updated: BirthdayLaunchState = {
        ...current,
        isLaunched: true,
        launchedAt: current.launchedAt || new Date().toISOString()
      };
      await saveLaunchState(updated);
      return NextResponse.json(updated);
    }

    if (action === "reset") {
      const updated: BirthdayLaunchState = {
        ...current,
        isLaunched: false,
        launchedAt: null
      };
      await saveLaunchState(updated);
      return NextResponse.json(updated);
    }

    if (action === "update_books" && Array.isArray(body.books)) {
      const normalized = DEFAULT_HASINI_LAUNCH_BOOKS.map((fallback, idx) =>
        normalizeLaunchBook(body.books[idx] || {}, fallback)
      );
      const updated: BirthdayLaunchState = {
        ...current,
        books: normalized
      };
      await saveLaunchState(updated);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update launch state" },
      { status: 500 }
    );
  }
}

