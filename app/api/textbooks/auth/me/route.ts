import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import {
  findSessionUser,
  getSessionTarget,
  signSessionToken,
} from "@/lib/textbookSession";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenTarget = getSessionTarget(req);
    const queryIdent =
      searchParams.get("email") || searchParams.get("user") || "";
    const target = (tokenTarget || queryIdent).trim().toLowerCase();

    if (!target) {
      return NextResponse.json(
        { error: "Missing email or user parameter" },
        { status: 400 }
      );
    }

    const sessionUser = await findSessionUser(target);
    const emails = sessionUser?.emails || (target.includes("@") ? [target] : []);
    const phone = sessionUser?.phone || "";

    // Query user record for profile metadata
    const res = await pool.query(
      `SELECT * FROM textbooks_users
       WHERE LOWER(email) = $1
          OR LOWER(college_email) = $1
          OR LOWER(access_id) = $1
          OR mobile_number = $1
          OR ($2 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(mobile_number, ''), '\\D', '', 'g'), 10) = $2)`,
      [target, phone]
    );

    const user = res.rows && res.rows.length > 0 ? res.rows[0] : null;

    // Active rentals are reported separately — they're time-limited and must never be
    // treated as permanently owned.
    let rentedBookIds: string[] = [];
    try {
      const rentalsRes = await pool.query(
        `SELECT DISTINCT book_id FROM book_rentals
         WHERE status = 'active'
           AND (LOWER(user_email) = ANY($1)
                OR ($2 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(user_phone, ''), '\\D', '', 'g'), 10) = $2))`,
        [emails, phone]
      );
      rentedBookIds = (rentalsRes.rows || []).map((r: any) => String(r.book_id));
    } catch (e) {}

    const purchasedBookIds = sessionUser?.purchasedBookIds || [];
    const primaryEmail =
      user?.email ||
      user?.college_email ||
      emails[0] ||
      (target.includes("@") ? target : "");
    const primaryAccessId =
      user?.access_id || sessionUser?.accessIds?.[0] || "USER";

    // Only issue a fresh session token if the caller already presented a valid session token
    // OR if the user record exists in textbooks_users/purchases/rentals.
    const token =
      tokenTarget || user || purchasedBookIds.length > 0 || rentedBookIds.length > 0
        ? signSessionToken(primaryEmail || target, primaryAccessId)
        : undefined;

    return NextResponse.json({
      success: true,
      token,
      user: {
        name: user?.name || (primaryEmail ? primaryEmail.split("@")[0] : "Reader"),
        email: primaryEmail,
        collegeEmail: user?.college_email || primaryEmail,
        mobileNumber: user?.mobile_number || phone || "",
        accessId: user?.access_id || sessionUser?.accessIds?.[0] || "",
        role: user?.role || "student",
        purchasedBooks: Array.from(new Set(purchasedBookIds.filter(Boolean))),
        rentedBooks: rentedBookIds,
      },
    });
  } catch (err: any) {
    console.error("❌ Error in auth/me route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
