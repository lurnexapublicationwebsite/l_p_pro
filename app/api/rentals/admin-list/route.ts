import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getRentalPlanByCode } from "@/lib/data/rentals";

// Admin-only: every rental across every customer, shaped exactly like PurchaseRecord
// (lib/dbClient.ts) so the Bookstore Payments table can just concatenate this with
// adminPurchases and reuse all of its existing filter/search/render logic unchanged.
export async function GET() {
  try {
    const res = await pool.query(`SELECT * FROM book_rentals ORDER BY created_at DESC`);
    // Sorted explicitly rather than relying solely on the SQL ORDER BY — the local mock
    // DB fallback's "select all, no WHERE" branch doesn't apply it.
    const sortedRows = [...res.rows].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const rentals = sortedRows.map((row: any) => {
      const plan = getRentalPlanByCode(row.plan_code);
      // "active"/"renewed" only ever happen after payment is verified — same meaning as
      // a paid purchase order.
      const isPaid = row.status === "active" || row.status === "renewed";

      return {
        id: row.id,
        orderId: row.rental_id,
        userIdentifier: row.user_email,
        bookId: row.book_id,
        amount: Number(row.total_amount || 0),
        status: isPaid ? "PAID" : String(row.status || "PENDING").toUpperCase(),
        customerName: row.user_name || "",
        customerEmail: row.user_email || "",
        customerPhone: row.user_phone || "",
        shippingAddress: "",
        shippingPincode: "",
        couponCode: "",
        discountAmount: 0,
        // amount_paid is the plan's base price (pre-GST) — kept separate from gstAmount so
        // the UI's existing "subtotal + gst + 2% online fee" formula reconstructs the real
        // charged total exactly, the same way it already does for soft-copy purchases.
        gstAmount: Number(row.gst_amount || 0),
        shippingAmount: 0,
        city: "",
        state: "",
        country: "India",
        quantity: 1,
        subtotal: Number(row.amount_paid || 0),
        cashfreeOrderId: row.cashfree_order_id || "",
        cashfreePaymentId: row.cashfree_payment_id || "",
        paymentStatus: isPaid ? "SUCCESS" : String(row.payment_status || "PENDING").toUpperCase(),
        orderStatus: isPaid ? "CONFIRMED" : String(row.status || "PENDING").toUpperCase(),
        purchaseFormat: "rental",
        purchasePlan: plan?.displayName || row.plan_code,
        accessId: "",
        createdAt: row.created_at || new Date().toISOString(),
        // Extra fields beyond PurchaseRecord — harmless for the admin table (it only reads
        // the fields above), useful if a future admin view wants rental-specific detail.
        isRental: true,
        rentalStatus: row.status,
        rentalExpiresAt: row.expires_at,
        isRenewal: !!row.is_renewal,
        renewalCount: Number(row.renewal_count || 0)
      };
    });

    return NextResponse.json({ rentals });
  } catch (err: any) {
    console.error("❌ Error in rentals admin-list API route:", err);
    return NextResponse.json({ error: "Internal server error", rentals: [] }, { status: 500 });
  }
}
