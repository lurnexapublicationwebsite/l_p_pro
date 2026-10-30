import { NextRequest, NextResponse } from "next/server";
import {
  getMergedCatalogBooks,
  saveCatalogBookOverride,
  deleteCatalogBook
} from "@/lib/bookCatalogStore";

export async function GET() {
  try {
    const data = await getMergedCatalogBooks();
    return NextResponse.json(
      {
        success: true,
        ...data
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" }
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to load textbook catalog" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body?.action || "save_book";

    if (action === "save_book" && body?.book) {
      const savedBook = await saveCatalogBookOverride(body.book);
      const updated = await getMergedCatalogBooks();
      return NextResponse.json({
        success: true,
        book: savedBook,
        ...updated
      });
    }

    if (action === "delete_book" && body?.bookId) {
      await deleteCatalogBook(String(body.bookId));
      const updated = await getMergedCatalogBooks();
      return NextResponse.json({
        success: true,
        ...updated
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update textbook catalog" },
      { status: 500 }
    );
  }
}

