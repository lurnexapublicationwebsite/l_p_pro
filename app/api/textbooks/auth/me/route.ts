import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Missing email parameter" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user record
    const res = await pool.query(
      `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1`,
      [cleanEmail]
    );

    let user = res.rows && res.rows.length > 0 ? res.rows[0] : null;

    // Active rentals are reported separately — they're time-limited and must never be
    // treated as permanently owned. The portal fetches full rental details itself via
    // /api/rentals/my-rentals; rentedBooks here is just a lightweight id list.
    const rentalsRes = await pool.query(
      `SELECT DISTINCT book_id FROM book_rentals WHERE LOWER(user_email) = $1 AND status = 'active'`,
      [cleanEmail]
    );
    const rentedBookIds = (rentalsRes.rows || []).map((r: any) => r.book_id);

    let dbPurchased: string[] = [];
    if (user) {
      try {
        if (typeof user.purchased_books === "string") {
          dbPurchased = JSON.parse(user.purchased_books);
        } else if (Array.isArray(user.purchased_books)) {
          dbPurchased = user.purchased_books;
        }
      } catch (e) {
        dbPurchased = [];
      }
    }

    const purchasedBookIds = dbPurchased.length > 0 ? dbPurchased : (user?.book_id ? [user.book_id] : []);

    return NextResponse.json({
      success: true,
      user: {
        name: user?.name || cleanEmail.split("@")[0],
        email: cleanEmail,
        mobileNumber: user?.mobile_number || "",
        accessId: user?.access_id || "",
        role: user?.role || "student",
        purchasedBooks: Array.from(new Set(purchasedBookIds.filter(Boolean))),
        rentedBooks: rentedBookIds
      }
    });

  } catch (err: any) {
    console.error("❌ Error in auth/me route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
