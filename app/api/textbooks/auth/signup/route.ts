import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getSessionTarget, signSessionToken } from "@/lib/textbookSession";
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

    // The caller must prove they control this email (token from /api/textbooks/auth/verify-otp)
    // before an account is created or an existing password-less account is claimed.
    if (getSessionTarget(req) !== cleanEmail) {
      return NextResponse.json(
        { error: "Please verify your email address with the code we sent you before creating an account.", emailVerificationRequired: true },
        { status: 403 }
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
        const requestedMobile = mobileNumber ? mobileNumber.trim() : "";

        // mobile_number is the table's primary key: only move this row to the new phone
        // if no other row already uses it, otherwise keep the current key.
        let rowKey = existingUser.mobile_number;
        if (requestedMobile && requestedMobile !== existingUser.mobile_number) {
          const taken = await pool.query(`SELECT 1 FROM textbooks_users WHERE mobile_number = $1 LIMIT 1`, [requestedMobile]);
          if (taken.rows.length === 0) rowKey = requestedMobile;
        }
        if (!rowKey) rowKey = cleanEmail;
        const cleanMobile = rowKey.includes("@") ? existingMobile : rowKey;

        await pool.query(
          `UPDATE textbooks_users SET password_hash = $1, name = $2, mobile_number = $3, email = $4 WHERE LOWER(email) = $5 OR LOWER(college_email) = $5`,
          [passwordHash, name.trim(), rowKey, cleanEmail, cleanEmail]
        );

        let rentedBookIds: string[] = [];
        try {
          const rentalsRes = await pool.query(
            `SELECT DISTINCT book_id FROM book_rentals WHERE LOWER(user_email) = $1 AND status = 'active'`,
            [cleanEmail]
          );
          rentedBookIds = (rentalsRes.rows || []).map((r: any) => r.book_id);
        } catch (e) {
          // Ignore if book_rentals table doesn't exist
        }
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
          token: signSessionToken(cleanEmail)
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

    // mobile_number is the table's primary key. An empty phone (or one already used by
    // another row) would collide with existing rows and fail the insert, so the email is
    // used as the row key in that case.
    let rowKey = cleanMobile || cleanEmail;
    if (cleanMobile) {
      const taken = await pool.query(`SELECT 1 FROM textbooks_users WHERE mobile_number = $1 LIMIT 1`, [cleanMobile]);
      if (taken.rows.length > 0) rowKey = cleanEmail;
    }

    await pool.query(
      `INSERT INTO textbooks_users (
        mobile_number, name, email, college_email, password_hash, role, is_active, access_id, plan, purchased_books
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        rowKey,
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
      token: signSessionToken(cleanEmail)
    });

  } catch (err: any) {
    console.error("❌ Error in signup API route:", err);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
