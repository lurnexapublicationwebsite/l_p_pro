import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getRentalTimeRemaining, getRentalPlanByCode } from "@/lib/data/rentals";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const accessId = searchParams.get("accessId");
    const queryTerm = (email || phone || accessId || "").trim();

    if (!queryTerm) {
      return NextResponse.json({ error: "Missing email/phone/accessId parameter." }, { status: 400 });
    }

    const res = await pool.query(
      `SELECT * FROM book_rentals 
       WHERE LOWER(user_email) = LOWER($1) OR user_phone = $1 OR LOWER(rental_id) = LOWER($1) 
       ORDER BY created_at DESC`,
      [queryTerm]
    );

    const rentals = res.rows.map(r => {
      const book = PUBLISHED_BOOKS_DATA.find(b => b.id === r.book_id);
      const plan = getRentalPlanByCode(r.plan_code);
      const timeRemaining = r.expires_at ? getRentalTimeRemaining(r.expires_at) : null;

      // Auto-compute status if expired
      let effectiveStatus = r.status;
      if (r.status === 'active' && r.expires_at && new Date() > new Date(r.expires_at)) {
        effectiveStatus = 'expired';
      }

      return {
        id: r.id,
        rentalId: r.rental_id,
        userEmail: r.user_email,
        userName: r.user_name,
        userPhone: r.user_phone,
        bookId: r.book_id,
        bookTitle: book?.title || "Academic Book",
        bookAuthors: book?.authors || "",
        bookCoverImg: book?.coverImg || "/portal_coverpages/ml.jpeg",
        pdfFileName: book?.pdfFileName || "",
        planCode: r.plan_code,
        planDisplayName: plan?.displayName || r.plan_code,
        durationDays: plan?.durationDays || 30,
        status: effectiveStatus,
        startedAt: r.started_at,
        expiresAt: r.expires_at,
        amountPaid: Number(r.amount_paid),
        gstAmount: Number(r.gst_amount),
        totalAmount: Number(r.total_amount),
        paymentStatus: r.payment_status,
        isRenewal: r.is_renewal,
        renewalCount: r.renewal_count,
        timeRemaining,
        createdAt: r.created_at
      };
    });

    // Grouping
    const active = rentals.filter(r => r.status === 'active');
    const expired = rentals.filter(r => r.status === 'expired');
    const pending = rentals.filter(r => r.status === 'pending');

    return NextResponse.json({
      success: true,
      totalCount: rentals.length,
      rentals,
      grouped: {
        active,
        expired,
        pending
      }
    });

  } catch (err: any) {
    console.error("❌ Error in my-rentals API route:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
