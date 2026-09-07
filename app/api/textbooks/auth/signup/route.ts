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
    const { name, email, password, mobileNumber = "" } = body;

    // Validate inputs
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Full Name, Email Address, and Password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid Gmail / Email address." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter." },
        { status: 400 }
      );
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter." },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number." },
        { status: 400 }
      );
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character (!@#$%^&* etc.)." },
        { status: 400 }
      );
    }

    // Auto ensure table columns exist
    try {
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
      await pool.query(`ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS purchased_books JSONB`);
    } catch (e) {
      // Ignore migration errors if handled
    }

    // Check if user already exists
    const existing = await pool.query(
      `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1`,
      [cleanEmail]
    );

    if (existing.rows && existing.rows.length > 0) {
      const existingUser = existing.rows[0];

      // If account exists but has no password set yet (e.g. from purchase/rental), update password & complete setup
      if (!existingUser.password_hash) {
        const passwordHash = hashPassword(password);
        const existingMobile = existingUser.mobile_number && !String(existingUser.mobile_number).includes("@")
          ? existingUser.mobile_number
          : "";
        const cleanMobile = mobileNumber ? mobileNumber.trim() : existingMobile;

        await pool.query(
          `UPDATE textbooks_users SET password_hash = $1, name = $2, mobile_number = $3, email = $4 WHERE id = $5`,
          [passwordHash, name.trim(), cleanMobile, cleanEmail, existingUser.id]
        );

        // Active rentals are reported separately — time-limited access must never be
        // merged into purchasedBooks (that field means permanently owned).
        const rentalsRes = await pool.query(
          `SELECT DISTINCT book_id FROM book_rentals WHERE LOWER(user_email) = $1 AND status = 'active'`,
          [cleanEmail]
        );
        const rentedBookIds = (rentalsRes.rows || []).map((r: any) => r.book_id);
        let dbPurchased: string[] = [];
        try {
          if (typeof existingUser.purchased_books === "string") {
            dbPurchased = JSON.parse(existingUser.purchased_books);
          } else if (Array.isArray(existingUser.purchased_books)) {
            dbPurchased = existingUser.purchased_books;
          }
        } catch (e) {}

        const purchasedBookIds = dbPurchased.length > 0 ? dbPurchased : (existingUser.book_id ? [existingUser.book_id] : []);

        const userData = {
          name: name.trim(),
          email: cleanEmail,
          collegeEmail: cleanEmail,
          mobileNumber: cleanMobile,
          accessId: existingUser.access_id || `USR_${Date.now()}`,
          role: existingUser.role || "student",
          purchasedBooks: Array.from(new Set(purchasedBookIds.filter(Boolean))),
          rentedBooks: rentedBookIds
        };

        return NextResponse.json({
          success: true,
          message: "Password created and account activated successfully!",
          user: userData,
          token: Buffer.from(`${cleanEmail}:${Date.now()}`).toString("base64")
        });
      }

      // If account already exists and HAS a password set, block signup and instruct user to log in
      return NextResponse.json(
        { error: "An account with this Email address already exists. Please switch to the Log In tab to log in." },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);
    const accessId = `USR_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const cleanMobile = mobileNumber ? mobileNumber.trim() : "";

    await pool.query(
      `INSERT INTO textbooks_users (
        mobile_number, name, email, college_email, password_hash, role, is_active, access_id, plan, purchased_books
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        cleanMobile,
        name.trim(),
        cleanEmail,
        cleanEmail,
        passwordHash,
        "student",
        true,
        accessId,
        "complete",
        JSON.stringify([])
      ]
    );

    const userData = {
      name: name.trim(),
      email: cleanEmail,
      collegeEmail: cleanEmail,
      mobileNumber: cleanMobile,
      accessId,
      role: "student",
      purchasedBooks: [],
      rentedBooks: []
    };

    return NextResponse.json({
      success: true,
      message: "Account created successfully!",
      user: userData,
      token: Buffer.from(`${cleanEmail}:${Date.now()}`).toString("base64")
    });

  } catch (err: any) {
    console.error("❌ Error in signup API route:", err);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
