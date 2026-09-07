import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { RENTAL_PLANS } from "@/lib/data/rentals";

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT * FROM book_rental_plans WHERE is_active = TRUE ORDER BY sort_order ASC`
    );

    const plans = res.rows.length > 0 ? res.rows.map(r => ({
      planCode: r.plan_code,
      displayName: r.display_name,
      durationDays: r.duration_days,
      price: Number(r.price),
      currency: r.currency || 'INR',
      perMonthPrice: Number((Number(r.price) / (r.duration_days / 30)).toFixed(2)),
      savingsPercent: r.duration_days === 90 ? 44 : (r.duration_days === 180 ? 58 : 0),
      badge: r.duration_days === 90 ? 'Most Popular' : (r.duration_days === 180 ? 'Best Value' : undefined),
      isActive: r.is_active,
      sortOrder: r.sort_order
    })) : RENTAL_PLANS;

    return NextResponse.json({ success: true, plans });
  } catch (err: any) {
    console.error("Error fetching rental plans:", err);
    return NextResponse.json({ success: true, plans: RENTAL_PLANS });
  }
}
