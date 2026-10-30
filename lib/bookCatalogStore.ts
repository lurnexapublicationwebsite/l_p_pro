import fs from "fs";
import path from "path";
import { pool } from "@/lib/dbPool";
import { Book, PUBLISHED_BOOKS_DATA, slugifyBookTitle } from "@/lib/data/books";

const localDir =
  typeof process !== "undefined" && (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL)
    ? "/tmp"
    : path.join(process.cwd(), "scratch");

const catalogFilePath = path.join(localDir, "textbooks_catalog.json");

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
  } catch {
    // Ignore when DB is offline
  }
}

export function normalizeFullBook(input: Partial<Book>, fallback?: Book): Book {
  const base: Book = fallback || {
    id: String(input.id || "1"),
    slug: slugifyBookTitle(input.title || "textbook"),
    title: input.title || "Untitled Textbook",
    authors: input.authors || "Lurnexa Academic Press",
    domain: input.domain || "Computer Science & Engineering",
    isbn: input.isbn || "978-81-903315-0-0",
    isbnDigital: input.isbnDigital || "978-81-903315-0-1",
    pages: Number(input.pages) || 240,
    price: Number(input.price) || 599,
    digitalPrice: Number(input.digitalPrice) || 279,
    code: input.code || "BK",
    pdfFileName: input.pdfFileName || "minerals.pdf",
    coverImg: input.coverImg || "/portal_coverpages/minerals.jpeg",
    publishedDate: input.publishedDate || "October 2026",
    tag: input.tag || "Academic Edition",
    stockStatus: input.stockStatus || "in-stock",
    rentalEnabled: true,
    description: input.description || "",
    longDescription: input.longDescription || input.description || "",
    keywords: Array.isArray(input.keywords) ? input.keywords : [],
    tableOfContents: Array.isArray(input.tableOfContents) ? input.tableOfContents : []
  };

  const id = String(input.id || base.id).trim();
  const title = (input.title || base.title).trim();
  const code = (input.code || base.code || "BK").trim().toUpperCase();

  const toc: string[] =
    Array.isArray(input.tableOfContents)
      ? input.tableOfContents.map((s) => String(s).trim()).filter(Boolean)
      : Array.isArray(base.tableOfContents)
      ? base.tableOfContents.map((s) => String(s).trim()).filter(Boolean)
      : [];

  const customPreviewPdfDataUrl =
    typeof input.customPreviewPdfDataUrl === "string" &&
    input.customPreviewPdfDataUrl.startsWith("data:application/pdf;base64,")
      ? input.customPreviewPdfDataUrl
      : base.customPreviewPdfDataUrl;

  const pdfFileName = (input.pdfFileName ?? base.pdfFileName).trim() || "minerals.pdf";

  let previewPdfUrl = input.previewPdfUrl ?? base.previewPdfUrl;
  if (customPreviewPdfDataUrl) {
    previewPdfUrl = `/api/textbooks/preview-pdf?bookId=${encodeURIComponent(id)}`;
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
      previewPdfUrl = `/api/textbooks/preview-pdf?bookId=${encodeURIComponent(id)}`;
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
    customPreviewPdfDataUrl,
    customFullBookPdfDataUrl: input.customFullBookPdfDataUrl ?? base.customFullBookPdfDataUrl,
    fullBookPdfSize: input.fullBookPdfSize ?? base.fullBookPdfSize,
    fullBookPdfUploadedAt: input.fullBookPdfUploadedAt ?? base.fullBookPdfUploadedAt,
    format: input.format ?? base.format ?? "both"
  };
}

export async function getMergedCatalogBooks(): Promise<{
  allAdminBooks: Book[];
  publicBooks: Book[];
  deletedIds: string[];
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

  // Base map of all books by ID
  const baseById = new Map<string, Book>();

  // 1. Standard Published Books (IDs 1..11)
  for (const b of PUBLISHED_BOOKS_DATA) {
    baseById.set(String(b.id), normalizeFullBook(b, b));
  }

  // 2. Any additional books from textbooks_textbooks not yet in baseById
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

  // 3. Apply Admin Catalog Overrides (from textbooks_catalog_overrides & scratch/textbooks_catalog.json)
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

  const publicBooks = [...allAdminBooks];

  return {
    allAdminBooks,
    publicBooks,
    deletedIds: Array.from(deletedSet)
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
      normalized.previewPdfUrl = `/api/textbooks/preview-pdf?bookId=${encodeURIComponent(id)}`;
    }
  } catch {
    // Ignore on read-only fs
  }


  // If a custom full book PDF base64 was uploaded, write to portal_textbooks and s3-upload/textbooks
  try {
    if (
      normalized.customFullBookPdfDataUrl &&
      normalized.customFullBookPdfDataUrl.startsWith("data:application/pdf;base64,")
    ) {
      const base64 = normalized.customFullBookPdfDataUrl.replace(
        "data:application/pdf;base64,",
        ""
      );
      const safeFileName = path.basename(
        normalized.pdfFileName || `${normalized.slug || `book_${id}`}.pdf`
      );
      normalized.pdfFileName = safeFileName;

      const portalDir = path.join(process.cwd(), "public", "portal_textbooks");
      if (!fs.existsSync(portalDir)) {
        fs.mkdirSync(portalDir, { recursive: true });
      }
      fs.writeFileSync(path.join(portalDir, safeFileName), Buffer.from(base64, "base64"));

      const s3UploadDir = path.join(process.cwd(), "s3-upload", "textbooks");
      if (fs.existsSync(s3UploadDir)) {
        fs.writeFileSync(path.join(s3UploadDir, safeFileName), Buffer.from(base64, "base64"));
      }
    }
  } catch (err) {
    console.warn("Failed to write custom full book PDF to disk:", err);
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
