import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getRentalPlanByCode, calculateExpiryDate, generateRentalActivationEmail, calculateRenewalExpiry, generateRenewalConfirmationEmail } from "@/lib/data/rentals";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";
import { sendMail } from "@/lib/mailService";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rentalId, cashfreeOrderId, paymentId } = body;

    if (!rentalId && !cashfreeOrderId) {
      return NextResponse.json({ error: "Missing rentalId or cashfreeOrderId" }, { status: 400 });
    }

    // Query rental record
    const sql = rentalId
      ? `SELECT * FROM book_rentals WHERE rental_id = $1`
      : `SELECT * FROM book_rentals WHERE cashfree_order_id = $1`;
    const param = rentalId || cashfreeOrderId;
    const res = await pool.query(sql, [param]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Rental record not found" }, { status: 404 });
    }

    const rental = res.rows[0];

    if (rental.status === 'active') {
      return NextResponse.json({
        success: true,
        message: "Rental is already active",
        rental
      });
    }

    // Verify Cashfree payment status if API keys are configured
    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const env = process.env.CASHFREE_ENV || "TEST";

    let paymentVerified = true; // Default true in dev / test mode

    if (appId && secretKey && rental.cashfree_order_id) {
      const cashfreeUrl = env.toUpperCase() === "PRODUCTION"
        ? `https://api.cashfree.com/pg/orders/${rental.cashfree_order_id}`
        : `https://sandbox.cashfree.com/pg/orders/${rental.cashfree_order_id}`;

      try {
        const cfRes = await fetch(cashfreeUrl, {
          method: "GET",
          headers: {
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2023-08-01",
          }
        });
        const cfData = await cfRes.json();
        if (cfRes.ok && cfData.order_status !== "PAID") {
          paymentVerified = false;
        }
      } catch (e) {
        console.error("Cashfree verification call failed, proceeding with fallback:", e);
      }
    }

    if (!paymentVerified) {
      return NextResponse.json({ error: "Payment verification failed. Order is not paid." }, { status: 400 });
    }

    // Calculate dates
    const plan = getRentalPlanByCode(rental.plan_code);
    const durationDays = plan?.durationDays || 30;

    let startDate = new Date();
    let expiryDate: Date;

    if (rental.is_renewal && rental.parent_rental_id) {
      // Find parent rental to check if renewal is early
      const parentRes = await pool.query(`SELECT * FROM book_rentals WHERE rental_id = $1`, [rental.parent_rental_id]);
      const parentRental = parentRes.rows[0];
      const renewalInfo = calculateRenewalExpiry(parentRental?.expires_at, rental.plan_code);
      startDate = renewalInfo.newStartDate;
      expiryDate = renewalInfo.newExpiryDate;
    } else {
      expiryDate = calculateExpiryDate(startDate, durationDays);
    }

    // Update rental record to ACTIVE
    await pool.query(
      `UPDATE book_rentals
       SET status = $1, started_at = $2, expires_at = $3, payment_status = $4, cashfree_payment_id = $5, updated_at = NOW()
       WHERE rental_id = $6`,
      [
        'active',
        startDate.toISOString(),
        expiryDate.toISOString(),
        'paid',
        paymentId || 'CF_PAID',
        rental.rental_id
      ]
    );

    // Send confirmation email
    const book = PUBLISHED_BOOKS_DATA.find(b => b.id === rental.book_id);
    const bookTitle = book?.title || "Academic Book";

    const updatedRentalRecord = {
      ...rental,
      status: 'active',
      startedAt: startDate.toISOString(),
      expiresAt: expiryDate.toISOString(),
      totalAmount: rental.total_amount,
      userName: rental.user_name,
      planCode: rental.plan_code,
      rentalId: rental.rental_id
    };

    // Fire the activation email in the background — must never block the "rental activated"
    // response the customer is waiting on (SMTP delivery can take many seconds).
    const emailContent = rental.is_renewal
      ? generateRenewalConfirmationEmail(updatedRentalRecord as any, bookTitle)
      : generateRentalActivationEmail(updatedRentalRecord as any, bookTitle);

    sendMail({
      to: rental.user_email,
      subject: emailContent.subject,
      html: emailContent.html
    }).catch((emailErr) => {
      console.error("Failed to send rental activation email:", emailErr);
    });

    return NextResponse.json({
      success: true,
      message: "Rental activated successfully!",
      rental: updatedRentalRecord
    });

  } catch (err: any) {
    console.error("❌ Error in rental verify API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
