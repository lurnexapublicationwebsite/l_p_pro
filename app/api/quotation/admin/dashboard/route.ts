import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booksRes = await pool.query("SELECT COUNT(*) FROM quotation_books");
    const pendingRes = await pool.query(
      "SELECT COUNT(*) FROM quotation_requests WHERE status = 'Pending'"
    );
    const sentRes = await pool.query(
      "SELECT COUNT(*) FROM quotations WHERE is_confirmed = FALSE"
    );
    const confirmedRes = await pool.query("SELECT COUNT(*) FROM quotation_orders");

    return NextResponse.json({
      total_books: parseInt(booksRes.rows[0].count || "0", 10),
      pending_quotations: parseInt(pendingRes.rows[0].count || "0", 10),
      sent_quotations: parseInt(sentRes.rows[0].count || "0", 10),
      confirmed_orders: parseInt(confirmedRes.rows[0].count || "0", 10),
    });
  } catch (error: any) {
    console.error("❌ Dashboard Info Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
