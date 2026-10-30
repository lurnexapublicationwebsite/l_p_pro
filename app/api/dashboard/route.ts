import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";

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

    const userRow = result.rows[0] ?? null;

    // ✅ ALWAYS return JSON (supports both direct row fields and { data: [...] } format)
    return NextResponse.json(
      userRow ? { ...userRow, data: result.rows } : { data: [] }
    );
  } catch (error) {
    console.warn("GET /api/dashboard warning:", error);

    return NextResponse.json(
      { data: [], error: "Internal server error" },
      { status: 500 }
    );
  }
}

/* ===========================
   UPDATE OR FETCH PROFILE
=========================== */
export async function POST(req: Request) {
  try {
    const rawText = await req.text();
    let body: any = {};
    if (rawText) {
      try {
        body = JSON.parse(rawText);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON payload" },
          { status: 400 }
        );
      }
    }

    const payload = body?.data && typeof body.data === "object" ? { ...body, ...body.data } : body;
    const subid = payload?.subid;

    if (!subid) {
      return NextResponse.json(
        { error: "subid is required" },
        { status: 400 }
      );
    }

    // If POST only requests profile by subid (e.g., /get_users style), return the profile
    const hasUpdateFields =
      payload.name !== undefined ||
      payload.role !== undefined ||
      payload.college_id !== undefined ||
      payload.organization_name !== undefined ||
      payload.organisation_name !== undefined ||
      payload.contact_no !== undefined ||
      payload.area_of_expertise !== undefined ||
      payload.recent_work !== undefined ||
      payload.ongoing_work !== undefined ||
      payload.description !== undefined;

    if (!hasUpdateFields) {
      const result = await pool.query(
        `SELECT * FROM editorial_board WHERE subid = $1`,
        [subid]
      );
      const userRow = result.rows[0] ?? null;
      return NextResponse.json(
        userRow ? { ...userRow, data: result.rows } : { data: [] }
      );
    }

    const orgName = payload.organization_name ?? payload.organisation_name ?? null;
    const expertise = Array.isArray(payload.area_of_expertise)
      ? payload.area_of_expertise[0] ?? null
      : payload.area_of_expertise ?? null;

    await pool.query(
      `UPDATE editorial_board SET
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        college_id = $3,
        organization_name = $4,
        contact_no = $5,
        area_of_expertise = $6,
        recent_work = $7,
        ongoing_work = $8,
        description = $9
       WHERE subid = $10`,
      [
        payload.name ?? null,
        payload.role ?? null,
        payload.college_id ?? null,
        orgName,
        payload.contact_no ?? null,
        expertise,
        payload.recent_work ?? null,
        payload.ongoing_work ?? null,
        payload.description ?? null,
        subid,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.warn("POST /api/dashboard warning:", error);

    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
