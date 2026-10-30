import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { signSessionToken, findSessionUser } from "@/lib/textbookSession";
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
      await pool.query(
        `ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS email VARCHAR(255)`
      );
      await pool.query(
        `ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`
      );
      await pool.query(
        `ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS purchased_books JSONB`
      );
      await pool.query(
        `ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`
      );
      await pool.query(
        `ALTER TABLE textbooks_users ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP`
      );
    } catch (e) {
      // Ignore migration errors if handled
    }

    // Query all matching user records by email, college_email, access_id, or mobile_number
    let res: any = { rows: [] };
    try {
      res = await pool.query(
        `SELECT * FROM textbooks_users WHERE LOWER(email) = $1 OR LOWER(college_email) = $1 OR LOWER(access_id) = $1 OR mobile_number = $1`,
        [cleanEmail]
      );
    } catch (dbErr) {
      console.error("❌ Error querying textbooks_users in login route:", dbErr);
    }

    // Prefer a row that has a password_hash set if multiple rows exist for the same email/phone
    const rows: any[] = res.rows || [];
    const user =
      rows.find((r) => Boolean(r.password_hash)) ||
      (rows.length > 0 ? rows[0] : null);

    if (!user) {
      // Check if user has active rentals in book_rentals
      try {
        const rentalCheck = await pool.query(
          `SELECT * FROM book_rentals WHERE LOWER(user_email) = $1 LIMIT 1`,
          [cleanEmail]
        );
        if (rentalCheck.rows && rentalCheck.rows.length > 0) {
          return NextResponse.json(
            {
              error:
                "No password found for this account. Please sign up to create your password.",
            },
            { status: 400 }
          );
        }
      } catch (e) {
        // Ignore if book_rentals table doesn't exist
      }

      return NextResponse.json(
        {
          error:
            "No account found with this credential. Please check your email/access ID or sign up first.",
        },
        { status: 404 }
      );
    }

    // Check password
    const passwordHash = hashPassword(password);
    if (!user.password_hash) {
      return NextResponse.json(
        {
          error:
            "No password set for this account. Please sign up to create your password.",
        },
        { status: 400 }
      );
    }
    if (user.password_hash !== passwordHash) {
      return NextResponse.json(
        {
          error:
            "Invalid password. Please check your credentials and try again.",
        },
        { status: 401 }
      );
    }

    const userEmailVal = (
      user.email ||
      user.college_email ||
      cleanEmail
    ).toLowerCase();

    // Aggregate entitlements across all matching user rows + textbooks_purchases
    const sessionUser = await findSessionUser(userEmailVal);
    const purchasedBookIds = sessionUser?.purchasedBookIds || [];

    // Active rentals check
    let rentedBookIds: string[] = [];
    try {
      const rentalsRes = await pool.query(
        `SELECT DISTINCT book_id FROM book_rentals
         WHERE status = 'active'
           AND (LOWER(user_email) = ANY($1)
                OR ($2 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(user_phone, ''), '\\D', '', 'g'), 10) = $2))`,
        [
          sessionUser?.emails?.length ? sessionUser.emails : [userEmailVal],
          sessionUser?.phone || "",
        ]
      );
      rentedBookIds = (rentalsRes.rows || []).map((r: any) => String(r.book_id));
    } catch (e) {
      // Ignore if book_rentals table doesn't exist
    }

    const userData = {
      name: user.name || userEmailVal.split("@")[0],
      email: userEmailVal,
      collegeEmail: user.college_email || userEmailVal,
      mobileNumber: user.mobile_number || sessionUser?.phone || "",
      accessId: user.access_id || sessionUser?.accessIds?.[0] || `USR_${Date.now()}`,
      role: user.role || "student",
      plan: user.plan || sessionUser?.plans?.[0] || "complete",
      purchasedBooks: Array.from(new Set(purchasedBookIds.filter(Boolean))),
      rentedBooks: rentedBookIds,
    };

    return NextResponse.json({
      success: true,
      message: "Logged in successfully!",
      user: userData,
      token: signSessionToken(userEmailVal, user.access_id || "USER"),
    });
  } catch (err: any) {
    console.error("❌ Error in login API route:", err);
    return NextResponse.json(
      {
        error:
          "Login failed. Please check your credentials or try again later.",
      },
      { status: 500 }
    );
  }
}
