import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getRentalPlanByCode } from "@/lib/data/rentals";

const PORTAL_BOOKS: Record<string, { title: string; coverImg: string; author: string }> = {
  "1": { title: "INDIAN MINERAL IMPORT POLICY OPTIONS: AN ECONOMYWIDE ANALYSIS", coverImg: "/portal_coverpages/minerals.jpeg", author: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar" },
  "2": { title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS", coverImg: "/portal_coverpages/ml.jpeg", author: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B" },
  "3": { title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION", coverImg: "/portal_coverpages/dbms.jpeg", author: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B" },
  "5": { title: "PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT", coverImg: "/portal_coverpages/microeconomics.jpeg", author: "Dr. Aruna Kumar Dash" },
  "6": { title: "FOUNDATIONS OF ARTIFICIAL INTELLIGENCE: CONCEPTS, TECHNIQUES AND APPLICATIONS", coverImg: "/portal_coverpages/ai.jpeg", author: "Dr. P. Manikandan, Dr. P. Renukadevi, Dr. J. Nashreen Begum, Dr. D. Banumathy" },
  "7": { title: "DATA STREAMING AND ANALYSIS", coverImg: "/portal_coverpages/data_streaming.jpeg", author: "Dr. P. Renukadevi, Dr. Chinmaya Kumar Swain, Dr. Archana Sasi, Mr. Shahad P" },
  "8": { title: "PYTHON PROGRAMMING: PRINCIPLES AND PRACTICE", coverImg: "/portal_coverpages/python_programming.jpeg", author: "Dr. Prakash Shanmurthy, Dr. J. Somasekar, Mr. Vaibhav Prabhakar Raibole, Mr. Shiva Prasad Munukuntla" },
  "9": { title: "NOSQL DATABASES USING MONGODB", coverImg: "/portal_coverpages/nosql.jpeg", author: "Dr. Sujeet S. Jagtap" }
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentifier = searchParams.get("user");

    if (!userIdentifier || !userIdentifier.trim()) {
      return NextResponse.json({ orders: [] });
    }

    const cleanUser = userIdentifier.trim().toLowerCase();

    // Query textbooks_purchases for matching email or mobile number or user_identifier
    const purchasesRes = await pool.query(
      `SELECT * FROM textbooks_purchases 
       WHERE LOWER(user_identifier) = $1 
          OR (customer_email IS NOT NULL AND LOWER(customer_email) = $1)
          OR (customer_phone IS NOT NULL AND customer_phone = $1)
       ORDER BY created_at DESC`,
      [cleanUser]
    );

    const purchaseOrders = purchasesRes.rows.map((row: any) => {
      const bookMeta = PORTAL_BOOKS[row.book_id] || {
        title: `Textbook Edition (ID: ${row.book_id})`,
        coverImg: "/portal_coverpages/minerals.jpeg",
        author: "Academic Author"
      };

      return {
        id: row.id,
        orderId: row.order_id,
        userIdentifier: row.user_identifier,
        bookId: row.book_id,
        bookTitle: bookMeta.title,
        bookCover: bookMeta.coverImg,
        bookAuthor: bookMeta.author,
        amount: Number(row.amount || 0),
        subtotal: Number(row.subtotal || row.amount || 0),
        discountAmount: Number(row.discount_amount || 0),
        gstAmount: Number(row.gst_amount || 0),
        shippingAmount: Number(row.shipping_amount || 0),
        quantity: Number(row.quantity || 1),
        couponCode: row.coupon_code || "",
        status: row.status || "PENDING",
        paymentStatus: row.payment_status || row.status || "PENDING_PAYMENT",
        orderStatus: row.order_status || row.status || "PENDING_PAYMENT",
        purchaseFormat: row.purchase_format || "Digital / Physical",
        purchasePlan: row.purchase_plan || "Full Access",
        customerName: row.customer_name || "",
        customerEmail: row.customer_email || "",
        customerPhone: row.customer_phone || "",
        shippingAddress: row.shipping_address || "",
        shippingPincode: row.shipping_pincode || "",
        city: row.city || "",
        state: row.state || "",
        country: row.country || "India",
        cashfreeOrderId: row.cashfree_order_id || "",
        accessId: row.access_id || "",
        createdAt: row.created_at || new Date().toISOString(),
        isRental: false,
      };
    });

    // Rentals live in their own table (book_rentals) — merge them into the same
    // unified order history so "Order History" actually shows everything a
    // customer has bought, permanent or time-limited.
    const rentalsRes = await pool.query(
      `SELECT * FROM book_rentals
       WHERE LOWER(user_email) = $1 OR user_phone = $1
       ORDER BY created_at DESC`,
      [cleanUser]
    );

    const rentalOrders = rentalsRes.rows.map((row: any) => {
      const bookMeta = PORTAL_BOOKS[row.book_id] || {
        title: `Textbook Edition (ID: ${row.book_id})`,
        coverImg: "/portal_coverpages/minerals.jpeg",
        author: "Academic Author"
      };
      const plan = getRentalPlanByCode(row.plan_code);
      // "active"/"renewed" only ever happen after payment is verified — same meaning
      // as a paid purchase order, so map onto the same PAID/status vocabulary the UI uses.
      const isPaid = row.status === "active" || row.status === "renewed";

      return {
        id: `rental_${row.id}`,
        orderId: row.rental_id,
        userIdentifier: row.user_email,
        bookId: row.book_id,
        bookTitle: bookMeta.title,
        bookCover: bookMeta.coverImg,
        bookAuthor: bookMeta.author,
        amount: Number(row.total_amount || 0),
        subtotal: Number(row.amount_paid || 0),
        discountAmount: 0,
        gstAmount: Number(row.gst_amount || 0),
        shippingAmount: 0,
        quantity: 1,
        couponCode: "",
        status: isPaid ? "PAID" : String(row.status || "PENDING").toUpperCase(),
        paymentStatus: isPaid ? "SUCCESS" : String(row.payment_status || "PENDING").toUpperCase(),
        orderStatus: isPaid ? "CONFIRMED" : String(row.status || "PENDING").toUpperCase(),
        purchaseFormat: "rental",
        purchasePlan: plan?.displayName || row.plan_code,
        customerName: row.user_name || "",
        customerEmail: row.user_email || "",
        customerPhone: row.user_phone || "",
        shippingAddress: "",
        shippingPincode: "",
        city: "",
        state: "",
        country: "India",
        cashfreeOrderId: row.cashfree_order_id || "",
        accessId: "",
        createdAt: row.created_at || new Date().toISOString(),
        isRental: true,
        rentalStatus: row.status,
        rentalStartedAt: row.started_at,
        rentalExpiresAt: row.expires_at,
      };
    });

    const orders = [...purchaseOrders, ...rentalOrders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ orders });
  } catch (err: any) {
    console.error("❌ Error fetching user order history:", err);
    return NextResponse.json({ error: "Failed to fetch order history", orders: [] }, { status: 500 });
  }
}
