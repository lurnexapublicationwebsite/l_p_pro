import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { isRentalExpired, generateExpiryWarningEmail, generateRentalExpiredEmail } from "@/lib/data/rentals";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { sendMail } from "@/lib/mailService";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Optional secret check if RENTAL_EXPIRY_CHECK_SECRET is set
    const expectedSecret = process.env.RENTAL_EXPIRY_CHECK_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized cron execution." }, { status: 401 });
    }

    // 1. Fetch active rentals
    const res = await pool.query(`SELECT * FROM book_rentals WHERE status = 'active'`);
    const activeRentals = res.rows;

    let expiredCount = 0;
    let warning7dCount = 0;
    let warning1dCount = 0;

    const now = new Date();

    for (const r of activeRentals) {
      if (!r.expires_at) continue;

      const expiry = new Date(r.expires_at);
      const book = PUBLISHED_BOOKS_DATA.find(b => b.id === r.book_id);
      const bookTitle = book?.title || "Academic Book";

      const rentalRecord = {
        rentalId: r.rental_id,
        userEmail: r.user_email,
        userName: r.user_name,
        bookId: r.book_id,
        planCode: r.plan_code,
        expiresAt: r.expires_at,
        status: r.status,
        totalAmount: r.total_amount,
        amountPaid: r.amount_paid,
        gstAmount: r.gst_amount,
        paymentStatus: r.payment_status,
        isRenewal: r.is_renewal,
        renewalCount: r.renewal_count,
        expiry7dSent: r.expiry_7d_sent,
        expiry1dSent: r.expiry_1d_sent,
        expirySent: r.expiry_sent,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      };

      // Case A: Rental has expired
      if (now > expiry) {
        await pool.query(`UPDATE book_rentals SET status = 'expired', updated_at = NOW() WHERE rental_id = $1`, [r.rental_id]);
        expiredCount++;

        // Send expired email if not sent
        if (!r.expiry_sent) {
          try {
            const email = generateRentalExpiredEmail(rentalRecord as any, bookTitle);
            await sendMail({ to: r.user_email, subject: email.subject, html: email.html });
            await pool.query(`UPDATE book_rentals SET expiry_sent = TRUE WHERE rental_id = $1`, [r.rental_id]);
          } catch (err) {
            console.error(`Failed to send expiry email to ${r.user_email}:`, err);
          }
        }
        continue;
      }

      // Case B: Expiring within 1 day (24 hours)
      const diffMs = expiry.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 24 && !r.expiry_1d_sent) {
        try {
          const email = generateExpiryWarningEmail(rentalRecord as any, bookTitle, 1);
          await sendMail({ to: r.user_email, subject: email.subject, html: email.html });
          await pool.query(`UPDATE book_rentals SET expiry_1d_sent = TRUE WHERE rental_id = $1`, [r.rental_id]);
          warning1dCount++;
        } catch (err) {
          console.error(`Failed to send 1d warning email to ${r.user_email}:`, err);
        }
      }
      // Case C: Expiring within 7 days
      else if (diffHours <= 168 && !r.expiry_7d_sent) {
        const daysRemaining = Math.ceil(diffHours / 24);
        try {
          const email = generateExpiryWarningEmail(rentalRecord as any, bookTitle, daysRemaining);
          await sendMail({ to: r.user_email, subject: email.subject, html: email.html });
          await pool.query(`UPDATE book_rentals SET expiry_7d_sent = TRUE WHERE rental_id = $1`, [r.rental_id]);
          warning7dCount++;
        } catch (err) {
          console.error(`Failed to send 7d warning email to ${r.user_email}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: activeRentals.length,
      expiredCount,
      warning7dCount,
      warning1dCount,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("❌ Error in check-expiry cron API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
