import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import type { DocReadingState, HighlightRect, PageHighlights, ReadingSummary } from "@/lib/readingProgress";

// Reading progress + highlights for the secure textbook reader, stored per user as one JSON
// object in textbooks_users.reading_data: { [docKey]: DocReadingState }.
// POST { action: "get", email, doc } | { action: "summary", email } | { action: "save", email, doc, state }

const DOC_KEY = /^(book|caselet|rental):[A-Za-z0-9_-]{1,64}(:\d{1,4})?$/;
const COLORS = new Set(["yellow", "green", "pink", "blue"]);
const MAX_PAGE = 20000;
const MAX_HIGHLIGHTS_PER_PAGE = 200;
const MAX_HIGHLIGHTS_PER_DOC = 3000;
const MAX_DOCS_PER_USER = 300;

const round4 = (n: number) => Math.round(n * 10000) / 10000;
const clamp01 = (n: unknown) => {
  const v = Number(n);
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
};

function sanitizeState(raw: any): DocReadingState | null {
  if (!raw || typeof raw !== "object") return null;
  const lastPage = Math.floor(Number(raw.lastPage));
  if (!Number.isFinite(lastPage) || lastPage < 1 || lastPage > MAX_PAGE) return null;

  const totalPagesRaw = Math.floor(Number(raw.totalPages));
  const totalPages = Number.isFinite(totalPagesRaw) && totalPagesRaw >= 1 && totalPagesRaw <= MAX_PAGE ? totalPagesRaw : undefined;

  const highlights: PageHighlights = {};
  let total = 0;
  if (raw.highlights && typeof raw.highlights === "object") {
    for (const [pageKey, list] of Object.entries(raw.highlights)) {
      const page = Math.floor(Number(pageKey));
      if (!(page >= 1 && page <= MAX_PAGE) || !Array.isArray(list)) continue;
      const clean: HighlightRect[] = [];
      for (const h of list.slice(0, MAX_HIGHLIGHTS_PER_PAGE) as any[]) {
        if (total >= MAX_HIGHLIGHTS_PER_DOC) break;
        if (!h || typeof h !== "object" || !COLORS.has(h.c)) continue;
        const x = clamp01(h.x);
        const y = clamp01(h.y);
        const w = Math.min(clamp01(h.w), 1 - x);
        const hh = Math.min(clamp01(h.h), 1 - y);
        if (w <= 0 || hh <= 0) continue;
        clean.push({
          id: String(h.id || "").slice(0, 40) || `${page}-${clean.length}`,
          x: round4(x),
          y: round4(y),
          w: round4(w),
          h: round4(hh),
          c: h.c,
        });
        total++;
      }
      if (clean.length) highlights[String(page)] = clean;
    }
  }

  const updatedAtRaw = Number(raw.updatedAt);
  const updatedAt = Number.isFinite(updatedAtRaw) && updatedAtRaw > 0 ? Math.min(updatedAtRaw, Date.now() + 60_000) : Date.now();

  return { lastPage, totalPages, highlights, updatedAt };
}

function parseReadingData(value: unknown): Record<string, DocReadingState> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? (value as Record<string, DocReadingState>) : {};
}

async function findUser(email: string) {
  const res = await pool.query(
    `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1`,
    [email]
  );
  return res.rows && res.rows.length > 0 ? res.rows[0] : null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const action = String(body?.action || "");
    const email = String(body?.email || "").trim().toLowerCase();
    const doc = body?.doc ? String(body.doc) : "";

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    if ((action === "get" || action === "save") && !DOC_KEY.test(doc)) {
      return NextResponse.json({ error: "Invalid document." }, { status: 400 });
    }

    const user = await findUser(email);
    if (!user) {
      return NextResponse.json({ error: "No account found for this user." }, { status: 404 });
    }
    const data = parseReadingData(user.reading_data);

    if (action === "get") {
      return NextResponse.json({ state: data[doc] || null });
    }

    if (action === "summary") {
      const summary: ReadingSummary = {};
      Object.entries(data).forEach(([key, state]) => {
        if (state && typeof state.lastPage === "number") {
          summary[key] = { lastPage: state.lastPage, totalPages: state.totalPages, updatedAt: state.updatedAt || 0 };
        }
      });
      return NextResponse.json({ summary });
    }

    if (action === "save") {
      const incoming = sanitizeState(body?.state);
      if (!incoming) {
        return NextResponse.json({ error: "Invalid reading state." }, { status: 400 });
      }

      // Last write wins by updatedAt, so a stale device can't roll back progress made elsewhere.
      const existing = data[doc];
      if (existing && Number(existing.updatedAt) > incoming.updatedAt) {
        return NextResponse.json({ success: true, state: existing });
      }
      data[doc] = incoming;

      const keys = Object.keys(data);
      if (keys.length > MAX_DOCS_PER_USER) {
        keys
          .sort((a, b) => (data[a]?.updatedAt || 0) - (data[b]?.updatedAt || 0))
          .slice(0, keys.length - MAX_DOCS_PER_USER)
          .forEach((key) => delete data[key]);
      }

      try {
        await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reading_data JSONB`);
      } catch (e) {
        // Column already exists
      }
      // Matched by email rather than id — see change-password/route.ts for why.
      await pool.query(
        `UPDATE textbooks_users SET reading_data = $1 WHERE LOWER(email) = $2 OR LOWER(college_email) = $2`,
        [JSON.stringify(data), email]
      );
      return NextResponse.json({ success: true, state: incoming });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    console.error("❌ Error in reading progress API route:", err);
    return NextResponse.json({ error: "Failed to sync reading progress." }, { status: 500 });
  }
}
