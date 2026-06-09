import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";
import { getAuthenticatedAdmin } from "@/lib/quotationAuth";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { current_password, new_password } = await request.json();

    if (!current_password || !new_password) {
      return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
    }

    const currentHash = crypto.createHash("sha256").update(current_password).digest("hex");
    const newHash = crypto.createHash("sha256").update(new_password).digest("hex");

    // Fetch and check current user
    const userResult = await pool.query(
      "SELECT * FROM quotation_users WHERE email = $1 AND password_hash = $2",
      [admin.email, currentHash]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Update password
    await pool.query(
      "UPDATE quotation_users SET password_hash = $1 WHERE email = $2",
      [newHash, admin.email]
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("❌ Update Password Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
