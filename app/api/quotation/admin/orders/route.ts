import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";
import { generateClientQuotationPdf } from "@/lib/pdfService";

export async function GET(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get("order_id");

    if (orderId) {
      // 1. Fetch order
      const orderRes = await pool.query("SELECT * FROM quotation_orders WHERE id = $1", [orderId]);
      if (orderRes.rows.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      const order = orderRes.rows[0];

      // 2. Fetch quotation
      const quoteRes = await pool.query("SELECT * FROM quotations WHERE id = $1", [order.quotation_id]);
      if (quoteRes.rows.length === 0) {
        return NextResponse.json({ error: "Associated quotation not found" }, { status: 404 });
      }
      const quote = quoteRes.rows[0];

      // 3. Fetch request
      const reqRes = await pool.query("SELECT * FROM quotation_requests WHERE id = $1", [quote.quotation_request_id]);
      if (reqRes.rows.length === 0) {
        return NextResponse.json({ error: "Associated request not found" }, { status: 404 });
      }
      const reqDetails = reqRes.rows[0];

      const formatDate = (date: Date) =>
        date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      const validUntil = new Date(new Date(quote.created_at).getTime() + 30 * 24 * 60 * 60 * 1000);

      // 4. Generate PDF on the fly
      const pdfBuffer = await generateClientQuotationPdf({
        quotation_number: quote.quotation_number,
        created_at: formatDate(new Date(quote.created_at)),
        valid_until: formatDate(validUntil),
        institution_name: reqDetails.institution_name,
        authorized_person: reqDetails.authorized_person,
        email: reqDetails.email,
        contact_number: reqDetails.contact_number,
        items: typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items,
        total_amount: parseFloat(quote.total_amount),
        is_confirmed_letter: true,
        client_stamp: order.stamp_file_path,
      });

      return new Response(new Uint8Array(pdfBuffer), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="Confirmed_Order_${quote.quotation_number}.pdf"`,
        },
      });
    }

    const result = await pool.query(
      `SELECT o.*, q.quotation_number 
       FROM quotation_orders o
       JOIN quotations q ON o.quotation_id::uuid = q.id
       ORDER BY o.order_date DESC`
    );

    return NextResponse.json({ orders: result.rows });
  } catch (error: any) {
    console.error("❌ Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
