import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* ===========================
   GET PROFILE
=========================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const subid = searchParams.get("subid");

    if (!subid) {
      return NextResponse.json(
        { error: "subid is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT * FROM editorial_board WHERE subid = $1`,
      [subid]
    );

    // ✅ ALWAYS return JSON
    return NextResponse.json(result.rows[0] ?? {});
  } catch (error) {
    console.error("GET /api/dashboard error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===========================
   UPDATE PROFILE
=========================== */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.subid) {
      return NextResponse.json(
        { error: "subid is required" },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE editorial_board SET
        name = $1,
        role = $2,
        college_id = $3,
        organization_name = $4,
        contact_no = $5,
        area_of_expertise = $6,
        recent_work = $7,
        ongoing_work = $8,
        description = $9
       WHERE subid = $10`,
      [
        body.name ?? null,
        body.role ?? null,
        body.college_id ?? null,
        body.organization_name ?? null,
        body.contact_no ?? null,
        body.area_of_expertise ?? null,
        body.recent_work ?? null,
        body.ongoing_work ?? null,
        body.description ?? null,
        body.subid,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/dashboard error:", error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
