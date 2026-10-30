import fs from "fs";
import path from "path";
import { pool } from "@/lib/dbPool";
import { Book, PUBLISHED_BOOKS_DATA, slugifyBookTitle } from "@/lib/data/books";
import {
  BIRTHDAY_LAUNCH_EVENT_KEY,
  BirthdayLaunchState,
  DEFAULT_HASINI_LAUNCH_BOOKS,
  normalizeLaunchBook
} from "@/lib/birthdayLaunch";

const localDir =
  typeof process !== "undefined" && (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL)
    ? "/tmp"
    : path.join(process.cwd(), "scratch");

const catalogFilePath = path.join(localDir, "textbooks_catalog.json");
const birthdayFilePath = path.join(localDir, "birthday_book_launch.json");

export interface CatalogStoreState {
  overrides: Record<string, Book>;
  deletedIds: string[];
}

function readLocalCatalogState(): CatalogStoreState {
  try {
    if (!fs.existsSync(catalogFilePath)) {
      return { overrides: {}, deletedIds: [] };
    }
    const raw = JSON.parse(fs.readFileSync(catalogFilePath, "utf-8"));
    return {
      overrides: raw?.overrides && typeof raw.overrides === "object" ? raw.overrides : {},
      deletedIds: Array.isArray(raw?.deletedIds) ? raw.deletedIds.map(String) : []
    };
  } catch {
    return { overrides: {}, deletedIds: [] };
  }
}

function writeLocalCatalogState(state: CatalogStoreState): void {
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(catalogFilePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local catalog state:", err);
  }
}

function readLocalBirthdayState(): BirthdayLaunchState | null {
  try {
    if (!fs.existsSync(birthdayFilePath)) return null;
    const raw = JSON.parse(fs.readFileSync(birthdayFilePath, "utf-8"));
    if (!raw || typeof raw !== "object") return null;
    return raw as BirthdayLaunchState;
  } catch {
    return null;
  }
}

function writeLocalBirthdayState(state: BirthdayLaunchState): void {
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    fs.writeFileSync(birthdayFilePath, JSON.stringify(state, null, 2), "utf-8");
  } catch {
    // Ignore
  }
}

export async function ensureCatalogTables(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS textbooks_catalog_overrides (
        book_id VARCHAR(50) PRIMARY KEY,
        book_data JSONB,
        is_deleted BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
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
    // Ignore when DB is offline
  }
}

export function normalizeFullBook(input: Partial<Book>, fallback?: Book): Book {
  const base: Book = fallback || {
    id: String(input.id || "1"),
    slug: slugifyBookTitle(input.title || "textbook"),
    shortSlug: slugifyBookTitle(input.title || "textbook").slice(0, 32),
    title: input.title || "UNTITLED TEXTBOOK",
    authors: input.authors || "Lurnexa Academic Press",
    domain: input.domain || "Computer Science & Engineering",
    isbn: input.isbn || "978-81-903315-0-0",
    isbnDigital: input.isbnDigital || "978-81-903315-0-1",
    pages: Number(input.pages) || 220,
    price: Number(input.price) || 599,
    digitalPrice: Number(input.digitalPrice) || 299,
    code: (input.code || "BK").toUpperCase().slice(0, 2),
    pdfFileName: input.pdfFileName || "minerals.pdf",
    coverImg: input.coverImg || "/portal_coverpages/ml.jpeg",
    publishedDate: input.publishedDate || "October 30, 2026",
    description:
      input.description ||
      "Peer-reviewed academic textbook published by Lurnexa Publications.",
    longDescription:
      input.longDescription ||
      input.description ||
      "Peer-reviewed academic textbook published by Lurnexa Publications.",
    tag: input.tag ?? "New Release",
    stockStatus: input.stockStatus || "in-stock",
    keywords: Array.isArray(input.keywords) ? input.keywords : [],
    tableOfContents: Array.isArray(input.tableOfContents)
      ? input.tableOfContents
      : [
          "Chapter 1: Foundations & Core Principles",
          "Chapter 2: Theoretical Models & Architecture",
          "Chapter 3: Design Patterns & Algorithms",
          "Chapter 4: Practical Implementation & Case Studies",
          "Chapter 5: Advanced Applications & Future Directions"
        ],
    rentalEnabled: input.rentalEnabled ?? true
  };

  const id = String(input.id || base.id).trim();
  const title = (input.title ?? base.title).trim();
  const code = ((input.code ?? base.code) || "BK").trim().toUpperCase().slice(0, 2);
  const toc =
    Array.isArray(input.tableOfContents)
      ? input.tableOfContents.map((c) => String(c).trim()).filter(Boolean)
      : base.tableOfContents || [];

  const customPreviewPdfDataUrl =
    typeof input.customPreviewPdfDataUrl === "string"
      ? input.customPreviewPdfDataUrl
      : base.customPreviewPdfDataUrl;

  const pdfFileName = (input.pdfFileName ?? base.pdfFileName).trim() || "minerals.pdf";

  let previewPdfUrl = input.previewPdfUrl ?? base.previewPdfUrl;
  if (customPreviewPdfDataUrl) {
    previewPdfUrl = `/api/birthday-launch/preview-pdf?bookId=${encodeURIComponent(id)}`;
  } else {
    // Check if an authentic original preview PDF exists in public/published_books/previews/
    const previewsDir = path.join(process.cwd(), "public", "published_books", "previews");
    const candidates = [
      path.basename(pdfFileName),
      pdfFileName === "data_streaming.pdf" ? "data_streaming_and_analysis.pdf" : null,
      pdfFileName === "data_streaming_and_analysis.pdf" ? "data_streaming.pdf" : null
    ].filter(Boolean) as string[];

    let foundStaticPreview: string | null = null;
    for (const c of candidates) {
      const p = path.join(previewsDir, c);
      if (fs.existsSync(p)) {
        try {
          if (fs.statSync(p).size > 10000) {
            foundStaticPreview = `/published_books/previews/${c}`;
            break;
          }
        } catch {
          // Continue
        }
      }
    }

    if (foundStaticPreview) {
      previewPdfUrl = foundStaticPreview;
    } else if (!previewPdfUrl) {
      previewPdfUrl = `/api/birthday-launch/preview-pdf?bookId=${encodeURIComponent(id)}`;
    }
  }

  return {
    ...base,
    ...input,
    id,
    slug: (input.slug || base.slug || slugifyBookTitle(title)).trim(),
    shortSlug: (input.shortSlug || base.shortSlug || slugifyBookTitle(title).slice(0, 32)).trim(),
    title,
    authors: (input.authors ?? base.authors).trim(),
    domain: (input.domain ?? base.domain).trim(),
    isbn: (input.isbn ?? base.isbn).trim(),
    isbnDigital: (input.isbnDigital ?? base.isbnDigital).trim(),
    pages: Number.isFinite(Number(input.pages)) && Number(input.pages) > 0 ? Number(input.pages) : base.pages,
    price: Number.isFinite(Number(input.price)) && Number(input.price) >= 0 ? Number(input.price) : base.price,
    digitalPrice:
      Number.isFinite(Number(input.digitalPrice)) && Number(input.digitalPrice) >= 0
        ? Number(input.digitalPrice)
        : base.digitalPrice,
    code,
    pdfFileName,
    coverImg: (input.coverImg ?? base.coverImg).trim(),
    publishedDate: (input.publishedDate ?? base.publishedDate).trim(),
    description: (input.description ?? base.description).trim(),
    longDescription: (input.longDescription ?? input.description ?? base.longDescription ?? base.description).trim(),
    tag: input.tag !== undefined ? input.tag : base.tag,
    stockStatus: input.stockStatus || base.stockStatus || "in-stock",
    tableOfContents: toc,
    previewPdfUrl,
    customPreviewPdfDataUrl
  };
}

export async function getBirthdayLaunchData(): Promise<BirthdayLaunchState> {
  await ensureCatalogTables();
  const local = readLocalBirthdayState();
  const localCatalog = readLocalCatalogState();
  const deletedSet = new Set<string>(localCatalog.deletedIds || []);

  try {
    const dbRes = await pool.query("SELECT book_id FROM textbooks_catalog_overrides WHERE is_deleted = TRUE");
    for (const r of dbRes.rows) {
      deletedSet.add(String(r.book_id));
    }
  } catch {
    // Ignore
  }

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
      const books = DEFAULT_HASINI_LAUNCH_BOOKS.map((fb, i) =>
        normalizeLaunchBook(rawBooks[i] || {}, fb)
      ).filter((b) => !deletedSet.has(String(b.id)));
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
    // Fallback to local
  }

  if (local) {
    const rawBooks = Array.isArray(local.books)
      ? local.books
      : DEFAULT_HASINI_LAUNCH_BOOKS;
    const books = DEFAULT_HASINI_LAUNCH_BOOKS.map((fb, i) =>
      normalizeLaunchBook(rawBooks[i] || {}, fb)
    ).filter((b) => !deletedSet.has(String(b.id)));
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
    books: DEFAULT_HASINI_LAUNCH_BOOKS.filter((b) => !deletedSet.has(String(b.id)))
  };
}

export async function getMergedCatalogBooks(): Promise<{
  allAdminBooks: Book[];
  publicBooks: Book[];
  deletedIds: string[];
  isBirthdayLaunched: boolean;
  launchedAt: string | null;
}> {
  await ensureCatalogTables();

  const localState = readLocalCatalogState();
  const overridesMap: Record<string, Book> = { ...localState.overrides };
  const deletedSet = new Set<string>(localState.deletedIds);

  // Merge DB overrides
  try {
    const dbRes = await pool.query("SELECT * FROM textbooks_catalog_overrides");
    for (const row of dbRes.rows) {
      const bid = String(row.book_id);
      if (row.is_deleted) {
        deletedSet.add(bid);
      } else if (row.book_data && typeof row.book_data === "object") {
        deletedSet.delete(bid);
        overridesMap[bid] = row.book_data as Book;
      }
    }
  } catch {
    // Ignore DB error, use localState
  }

  // Also check textbooks_textbooks for any simple books added via legacy addTextbook
  const dbSimpleBooks: Array<{ id: string; title: string; code: string }> = [];
  try {
    const tbRes = await pool.query("SELECT * FROM textbooks_textbooks");
    for (const r of tbRes.rows) {
      dbSimpleBooks.push({
        id: String(r.id),
        title: String(r.title || ""),
        code: String(r.code || "BK")
      });
    }
  } catch {
    // Ignore
  }

  const birthdayState = await getBirthdayLaunchData();

  // Base map of all books by ID
  const baseById = new Map<string, Book>();

  // 1. Standard Published Books (IDs 1..9)
  for (const b of PUBLISHED_BOOKS_DATA) {
    baseById.set(String(b.id), normalizeFullBook(b, b));
  }

  // 2. Birthday Launch Books (IDs 10, 11)
  for (const b of birthdayState.books) {
    baseById.set(String(b.id), normalizeFullBook(b, b));
  }

  // 3. Any additional books from textbooks_textbooks not yet in baseById
  for (const sb of dbSimpleBooks) {
    if (!baseById.has(sb.id) && !deletedSet.has(sb.id)) {
      baseById.set(
        sb.id,
        normalizeFullBook({
          id: sb.id,
          title: sb.title,
          code: sb.code
        })
      );
    } else if (baseById.has(sb.id) && !overridesMap[sb.id]) {
      const existing = baseById.get(sb.id)!;
      baseById.set(
        sb.id,
        normalizeFullBook(
          {
            ...existing,
            title: sb.title || existing.title,
            code: sb.code || existing.code
          },
          existing
        )
      );
    }
  }

  // 4. Apply Admin Catalog Overrides (from textbooks_catalog_overrides & scratch/textbooks_catalog.json)
  for (const [bookId, overrideBook] of Object.entries(overridesMap)) {
    if (deletedSet.has(bookId)) continue;
    const existing = baseById.get(bookId);
    baseById.set(bookId, normalizeFullBook(overrideBook, existing));
  }

  // Filter out deleted books
  const allAdminBooks: Book[] = [];
  for (const [bookId, book] of baseById.entries()) {
    if (!deletedSet.has(bookId)) {
      allAdminBooks.push(book);
    }
  }

  // Sort by numeric ID for clean Admin display (1, 2, 3... 10, 11)
  allAdminBooks.sort((a, b) => {
    const na = Number(a.id);
    const nb = Number(b.id);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.id.localeCompare(b.id);
  });

  // Public books: include birthday books (10, 11) when birthdayState.isLaunched is true
  const birthdayIds = new Set(birthdayState.books.map((b) => String(b.id)));
  const publicBooks = allAdminBooks.filter((b) => {
    if (birthdayIds.has(String(b.id))) {
      return birthdayState.isLaunched;
    }
    return true;
  });

  // Put newly launched birthday books first in publicBooks when launched
  if (birthdayState.isLaunched) {
    publicBooks.sort((a, b) => {
      const aIsBday = birthdayIds.has(String(a.id)) ? 0 : 1;
      const bIsBday = birthdayIds.has(String(b.id)) ? 0 : 1;
      if (aIsBday !== bIsBday) return aIsBday - bIsBday;
      return 0;
    });
  }

  return {
    allAdminBooks,
    publicBooks,
    deletedIds: Array.from(deletedSet),
    isBirthdayLaunched: birthdayState.isLaunched,
    launchedAt: birthdayState.launchedAt
  };
}

export async function saveCatalogBookOverride(inputBook: Partial<Book>): Promise<Book> {
  await ensureCatalogTables();

  const { allAdminBooks } = await getMergedCatalogBooks();
  const id = String(inputBook.id || "").trim();
  if (!id) {
    throw new Error("Book ID is required");
  }

  const existing = allAdminBooks.find((b) => String(b.id) === id);
  const normalized = normalizeFullBook(inputBook, existing);

  // If a custom preview PDF base64 was uploaded, also write to public/published_books/previews when possible
  try {
    if (
      normalized.customPreviewPdfDataUrl &&
      normalized.customPreviewPdfDataUrl.startsWith("data:application/pdf;base64,")
    ) {
      const previewsDir = path.join(process.cwd(), "public", "published_books", "previews");
      if (fs.existsSync(previewsDir)) {
        const base64 = normalized.customPreviewPdfDataUrl.replace(
          "data:application/pdf;base64,",
          ""
        );
        const targetFile = path.basename(normalized.pdfFileName || `book_${id}_preview.pdf`);
        fs.writeFileSync(path.join(previewsDir, targetFile), Buffer.from(base64, "base64"));
      }
      normalized.previewPdfUrl = `/api/birthday-launch/preview-pdf?bookId=${encodeURIComponent(id)}`;
    }
  } catch {
    // Ignore on read-only fs
  }

  // 1. Save to local scratch/textbooks_catalog.json
  const localCatalog = readLocalCatalogState();
  localCatalog.overrides[id] = normalized;
  localCatalog.deletedIds = localCatalog.deletedIds.filter((d) => d !== id);
  writeLocalCatalogState(localCatalog);

  // 2. Save to PostgreSQL textbooks_catalog_overrides, textbooks_textbooks, textbooks_book_chapters
  try {
    await pool.query(
      `INSERT INTO textbooks_catalog_overrides (book_id, book_data, is_deleted, updated_at)
       VALUES ($1, $2::jsonb, FALSE, CURRENT_TIMESTAMP)
       ON CONFLICT (book_id) DO UPDATE SET
         book_data = EXCLUDED.book_data,
         is_deleted = FALSE,
         updated_at = CURRENT_TIMESTAMP`,
      [id, JSON.stringify(normalized)]
    );

    await pool.query(
      `INSERT INTO textbooks_textbooks (id, title, code)
       VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, code = EXCLUDED.code`,
      [id, normalized.title, normalized.code]
    );

    const chaptersCount =
      Array.isArray(normalized.tableOfContents) && normalized.tableOfContents.length > 0
        ? normalized.tableOfContents.length
        : 6;

    await pool.query(
      `INSERT INTO textbooks_book_chapters (book_id, chapters_count)
       VALUES ($1, $2)
       ON CONFLICT (book_id) DO UPDATE SET chapters_count = EXCLUDED.chapters_count`,
      [id, chaptersCount]
    );
  } catch {
    // Local catalog file is already saved
  }

  // 3. If this book is one of the birthday launch books (10 or 11), also sync birthday_book_launch
  const birthdayState = await getBirthdayLaunchData();
  const bdayIdx = birthdayState.books.findIndex((b) => String(b.id) === id);
  if (bdayIdx !== -1) {
    const nextBdayBooks = [...birthdayState.books];
    nextBdayBooks[bdayIdx] = normalizeLaunchBook(normalized, nextBdayBooks[bdayIdx]);
    const updatedBdayState: BirthdayLaunchState = {
      ...birthdayState,
      books: nextBdayBooks
    };
    writeLocalBirthdayState(updatedBdayState);
    try {
      await pool.query(
        `INSERT INTO birthday_book_launch (event_key, is_launched, launched_at, books_data, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT (event_key) DO UPDATE SET
           books_data = EXCLUDED.books_data,
           updated_at = CURRENT_TIMESTAMP`,
        [
          updatedBdayState.eventKey,
          updatedBdayState.isLaunched,
          updatedBdayState.launchedAt,
          JSON.stringify(updatedBdayState.books)
        ]
      );
    } catch {
      // Ignore
    }
  }

  return normalized;
}

export async function deleteCatalogBook(bookId: string): Promise<void> {
  await ensureCatalogTables();
  const id = String(bookId).trim();
  if (!id) return;

  const localCatalog = readLocalCatalogState();
  delete localCatalog.overrides[id];
  if (!localCatalog.deletedIds.includes(id)) {
    localCatalog.deletedIds.push(id);
  }
  writeLocalCatalogState(localCatalog);

  // Also filter this deleted book out of birthday launch state so it cannot resurface in bookstore
  const bdayState = readLocalBirthdayState();
  if (bdayState && Array.isArray(bdayState.books)) {
    const filteredBdayBooks = bdayState.books.filter((b) => String(b.id) !== id);
    const updatedBdayState: BirthdayLaunchState = {
      ...bdayState,
      books: filteredBdayBooks
    };
    writeLocalBirthdayState(updatedBdayState);
    try {
      await pool.query(
        `INSERT INTO birthday_book_launch (event_key, is_launched, launched_at, books_data, updated_at)
         VALUES ($1, $2, $3, $4::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT (event_key) DO UPDATE SET
           books_data = EXCLUDED.books_data,
           updated_at = CURRENT_TIMESTAMP`,
        [
          updatedBdayState.eventKey,
          updatedBdayState.isLaunched,
          updatedBdayState.launchedAt,
          JSON.stringify(updatedBdayState.books)
        ]
      );
    } catch {
      // Ignore DB errors
    }
  }

  try {
    await pool.query(
      `INSERT INTO textbooks_catalog_overrides (book_id, book_data, is_deleted, updated_at)
       VALUES ($1, NULL, TRUE, CURRENT_TIMESTAMP)
       ON CONFLICT (book_id) DO UPDATE SET
         is_deleted = TRUE,
         updated_at = CURRENT_TIMESTAMP`,
      [id]
    );
    await pool.query("DELETE FROM textbooks_textbooks WHERE id = $1", [id]);
    await pool.query("DELETE FROM textbooks_book_chapters WHERE book_id = $1", [id]);
  } catch {
    // Ignore
  }
}

