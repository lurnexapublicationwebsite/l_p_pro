import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import crypto from "crypto";

function hashPassword(password: string): string {
  const salt = "lurnexa_pub_salt_2026";
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email address and Password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Auto migration check
    try {
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS purchased_books JSONB`);
    } catch (e) {
      // Ignore migration errors if handled
    }

    // Query user record by email
    const res = await pool.query(
      `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1`,
      [cleanEmail]
    );

    let user = res.rows && res.rows.length > 0 ? res.rows[0] : null;

    if (!user) {
      // Check if user has active rentals in book_rentals
      const rentalCheck = await pool.query(
        `SELECT * FROM book_rentals WHERE LOWER(user_email) = $1 LIMIT 1`,
        [cleanEmail]
      );
      if (rentalCheck.rows && rentalCheck.rows.length > 0) {
        return NextResponse.json(
          { error: "No password found for this account. Please sign up to create your password." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "No account found with this email. Please sign up first." },
        { status: 404 }
      );
    }

    // Check password
    const passwordHash = hashPassword(password);
    if (!user.password_hash) {
      return NextResponse.json(
        { error: "No password set for this account. Please sign up to create your password." },
        { status: 400 }
      );
    }
    if (user.password_hash !== passwordHash) {
      return NextResponse.json(
        { error: "Invalid password. Please check your credentials and try again." },
        { status: 401 }
      );
    }

    // Active rentals are reported separately from purchasedBooks — they are time-limited
    // and must never be treated as permanently owned (that's what drove the "rental shows
    // as Permanent Access" bug). The portal fetches full rental details itself via
    // /api/rentals/my-rentals; rentedBooks here is just a lightweight id list for callers
    // that only need to know "does this account have access to book X right now".
    const rentalsRes = await pool.query(
      `SELECT DISTINCT book_id FROM book_rentals WHERE LOWER(user_email) = $1 AND status = 'active'`,
      [cleanEmail]
    );
    const rentedBookIds = (rentalsRes.rows || []).map((r: any) => r.book_id);

    let dbPurchased: string[] = [];
    try {
      if (typeof user.purchased_books === "string") {
        dbPurchased = JSON.parse(user.purchased_books);
      } else if (Array.isArray(user.purchased_books)) {
        dbPurchased = user.purchased_books;
      }
    } catch (e) {
      dbPurchased = [];
    }

    const purchasedBookIds = dbPurchased.length > 0 ? dbPurchased : (user.book_id ? [user.book_id] : []);

    const userData = {
      name: user.name || cleanEmail.split("@")[0],
      email: cleanEmail,
      mobileNumber: user.mobile_number || "",
      accessId: user.access_id || `USR_${Date.now()}`,
      role: user.role || "student",
      purchasedBooks: Array.from(new Set(purchasedBookIds.filter(Boolean))),
      rentedBooks: rentedBookIds
    };

    return NextResponse.json({
      success: true,
      message: "Logged in successfully!",
      user: userData,
      token: Buffer.from(`${cleanEmail}:${Date.now()}`).toString("base64")
    });

  } catch (err: any) {
    console.error("❌ Error in login API route:", err);
    return NextResponse.json(
      { error: "Login failed. Please check your credentials or try again later." },
      { status: 500 }
    );
  }
}
