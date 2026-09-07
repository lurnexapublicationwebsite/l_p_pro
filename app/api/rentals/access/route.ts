import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { generateSessionToken, isRentalExpired } from "@/lib/data/rentals";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rentalId, userEmail } = body;

    if (!rentalId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required parameters: rentalId, userEmail." },
        { status: 400 }
      );
    }

    // Query rental record
    const res = await pool.query(
      `SELECT * FROM book_rentals WHERE rental_id = $1 AND LOWER(user_email) = LOWER($2)`,
      [rentalId, userEmail.trim()]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: "Access denied. Rental record not found for this user." },
        { status: 403 }
      );
    }

    const rental = res.rows[0];

    // Check status
    if (rental.status !== 'active') {
      return NextResponse.json(
        { error: `Rental is not active (Status: ${rental.status}). Please renew your rental.` },
        { status: 403 }
      );
    }

    // Check expiry
    if (rental.expires_at && isRentalExpired(rental.expires_at)) {
      // Auto-update status to expired
      await pool.query(`UPDATE book_rentals SET status = 'expired' WHERE rental_id = $1`, [rentalId]);
      return NextResponse.json(
        { error: "Rental period has expired. Please renew to continue reading.", isExpired: true },
        { status: 403 }
      );
    }

    // Find book details
    const book = PUBLISHED_BOOKS_DATA.find(b => b.id === rental.book_id);
    if (!book) {
      return NextResponse.json({ error: "Book metadata not found." }, { status: 404 });
    }

    // Single active session enforcement: delete prior sessions for this rental
    await pool.query(`DELETE FROM rental_sessions WHERE rental_id = $1`, [rentalId]);

    // Create new session token valid for 2 hours
    const sessionToken = generateSessionToken();
    const sessionExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    const headers = req.headers;
    const ipAddress = headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = headers.get("user-agent") || "";

    await pool.query(
      `INSERT INTO rental_sessions (rental_id, session_token, user_email, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        rentalId,
        sessionToken,
        userEmail.trim().toLowerCase(),
        ipAddress,
        userAgent,
        sessionExpiresAt.toISOString()
      ]
    );

    // Generate pre-signed S3 URL for PDF viewer
    const bucketName = process.env.S3_BUCKET_NAME || "lurnexa-textbooks";
    // Fallback when S3 isn't configured — textbook files live under portal_textbooks,
    // the same public path purchased-book reading uses (public/pdfs is unrelated research papers).
    let pdfUrl = `/portal_textbooks/${book.pdfFileName}`;

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: `textbooks/${book.pdfFileName}`
        });
        pdfUrl = await getSignedUrl(s3Client, command, { expiresIn: 7200 }); // 2 hours
      } catch (s3Err) {
        console.warn("S3 signed URL generation failed, falling back to local route:", s3Err);
      }
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
        isbn: book.isbnDigital || book.isbn,
        startedAt: rental.started_at,
        expiresAt: rental.expires_at,
        planCode: rental.plan_code
      },
      pdfUrl,
      watermarkText: `${userEmail} • Rental #${rental.rental_id.slice(-6)} • Lurnexa Protected`
    });

  } catch (err: any) {
    console.error("❌ Error in rental access API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
