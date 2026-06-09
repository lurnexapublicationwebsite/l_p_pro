import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const result = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Request not found" }, { status: 404 });
      }
      return NextResponse.json({ request: result.rows[0] });
    }

    const result = await pool.query(
      "SELECT * FROM quotation_requests WHERE status = 'Pending' ORDER BY created_at DESC"
    );

    return NextResponse.json({ requests: result.rows });
  } catch (error: any) {
    console.error("❌ Fetch Pending Requests Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
    }

    await pool.query("DELETE FROM quotation_requests WHERE id = $1", [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Delete Quotation Request Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
