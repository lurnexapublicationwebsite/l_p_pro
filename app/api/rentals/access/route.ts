import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { generateSessionToken, isRentalExpired } from "@/lib/data/rentals";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { getClientIp } from "@/lib/clientIp";
import { getSessionUser } from "@/lib/textbookSession";
import { signedPdfReaderUrl, signedPdfUrl } from "@/lib/protectedPdf";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rentalId } = body;

    if (!rentalId) {
      return NextResponse.json(
        { error: "Missing required parameter: rentalId." },
        { status: 400 }
      );
    }

    // Identify the reader from the signed session token, not from the request body.
    const user = await getSessionUser(req);
    if (!user || (user.emails.length === 0 && !user.phone && !user.isAdmin)) {
      return NextResponse.json(
        {
          error:
            "Your session has expired. Please log out and log in again to read this book.",
          sessionExpired: true,
        },
        { status: 401 }
      );
    }

    // Query rental record matching any of the user's emails, phone, or admin status
    const res = await pool.query(
      `SELECT * FROM book_rentals
       WHERE rental_id = $1
         AND ($4 = true
              OR LOWER(user_email) = ANY($2)
              OR ($3 <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(user_phone, ''), '\\D', '', 'g'), 10) = $3))`,
      [rentalId, user.emails, user.phone || "", user.isAdmin]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: "Access denied. Rental record not found for this user." },
        { status: 403 }
      );
    }

    const rental = res.rows[0];

    // Check status
    if (rental.status !== "active") {
      return NextResponse.json(
        {
          error: `Rental is not active (Status: ${rental.status}). Please renew your rental.`,
        },
        { status: 403 }
      );
    }

    // Check expiry
    if (rental.expires_at && isRentalExpired(rental.expires_at)) {
      // Auto-update status to expired
      await pool.query(
        `UPDATE book_rentals SET status = 'expired' WHERE rental_id = $1`,
        [rentalId]
      );
      return NextResponse.json(
        {
          error: "Rental period has expired. Please renew to continue reading.",
          isExpired: true,
        },
        { status: 403 }
      );
    }

    // Find book details
    const book = PUBLISHED_BOOKS_DATA.find((b) => b.id === rental.book_id);
    if (!book) {
      return NextResponse.json(
        { error: "Book metadata not found." },
        { status: 404 }
      );
    }

    // Single active session enforcement: delete prior sessions for this rental
    await pool.query(`DELETE FROM rental_sessions WHERE rental_id = $1`, [
      rentalId,
    ]);

    // Create new session token valid for 2 hours
    const sessionToken = generateSessionToken();
    const sessionExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const headers = req.headers;
    const ipAddress = getClientIp(headers);
    const userAgent = headers.get("user-agent") || "";
    const rentalUserEmail = String(
      rental.user_email || user.emails[0] || user.phone || user.target
    )
      .trim()
      .toLowerCase();

    await pool.query(
      `INSERT INTO rental_sessions (rental_id, session_token, user_email, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        rentalId,
        sessionToken,
        rentalUserEmail,
        ipAddress,
        userAgent,
        sessionExpiresAt.toISOString(),
      ]
    );

    // Short-lived signed same-origin stream link to the private PDF (textbooks/<pdfFileName>).
    const pdfUrl =
      signedPdfReaderUrl("textbooks", book.pdfFileName) ||
      (await signedPdfUrl("textbooks", book.pdfFileName));
    if (!pdfUrl) {
      console.error("rentals/access: Neither PDF stream token nor S3 URL available");
      return NextResponse.json(
        { error: "Reading is temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionToken,
      sessionExpiresAt: sessionExpiresAt.toISOString(),
      rental: {
        rentalId: rental.rental_id,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthors: book.authors,
        bookCoverImg: book.coverImg,
        pages: book.pages,
        isbn:
          book.isbnDigital && book.isbnDigital !== "N/A"
            ? book.isbnDigital
            : book.isbn,
        startedAt: rental.started_at,
        expiresAt: rental.expires_at,
        planCode: rental.plan_code,
      },
      pdfUrl,
      watermarkText: `${rentalUserEmail} • Rental #${String(rental.rental_id).slice(-6)} • Lurnexa Protected`,
    });
  } catch (err: any) {
    console.error("❌ Error in rental access API route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
