import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentifier = searchParams.get("user");

    if (!userIdentifier) {
      return NextResponse.json({ purchased: [] });
    }

    const { rows } = await pool.query(
      "SELECT book_id FROM textbooks_purchases WHERE user_identifier = $1 AND status = 'PAID'",
      [userIdentifier]
    );

    const purchasedIds = rows.map((r: any) => r.book_id);
    return NextResponse.json({ purchased: purchasedIds });

  } catch (err: any) {
    console.error("❌ Error in my-purchases route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
