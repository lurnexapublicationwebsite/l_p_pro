import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";
import crypto from "crypto";

// GET: Fetch all books (public/client and admin)
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, book_name, description, created_at FROM quotation_books ORDER BY book_name ASC"
    );
    return NextResponse.json({ books: result.rows });
  } catch (error: any) {
    console.error("❌ Error fetching quotation books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books", details: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new book (admin only)
export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { book_name, description } = await req.json();
    if (!book_name) {
      return NextResponse.json({ error: "Book name is required" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    await pool.query(
      "INSERT INTO quotation_books (id, book_name, description) VALUES ($1, $2, $3)",
      [id, book_name, description || ""]
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("❌ Error creating quotation book:", error);
    return NextResponse.json(
      { error: "Failed to add book", details: error.message },
      { status: 500 }
    );
  }
}

// PUT: Edit an existing book (admin only)
export async function PUT(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, book_name, description } = await req.json();
    if (!id || !book_name) {
      return NextResponse.json({ error: "ID and Book name are required" }, { status: 400 });
    }

    const res = await pool.query(
      "UPDATE quotation_books SET book_name = $1, description = $2 WHERE id = $3",
      [book_name, description || "", id]
    );

    if ((res as any).rowCount === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error updating quotation book:", error);
    return NextResponse.json(
      { error: "Failed to update book", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a book (admin only)
export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Book ID is required" }, { status: 400 });
    }

    const res = await pool.query("DELETE FROM quotation_books WHERE id = $1", [id]);
    if ((res as any).rowCount === 0) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error deleting quotation book:", error);
    return NextResponse.json(
      { error: "Failed to delete book", details: error.message },
      { status: 500 }
    );
  }
}
