import { NextResponse } from "next/server";
import { pool } from "@/lib/dbPool";

// GET - Fetch user's saved address book
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdentifier = searchParams.get("user");

    if (!userIdentifier || !userIdentifier.trim()) {
      return NextResponse.json({ addresses: [] });
    }

    const cleanUser = userIdentifier.trim().toLowerCase();
    const res = await pool.query(
      `SELECT * FROM textbooks_addresses 
       WHERE LOWER(user_identifier) = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [cleanUser]
    );

    const addresses = res.rows.map((row: any) => ({
      id: row.id,
      userIdentifier: row.user_identifier,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2 || "",
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      country: row.country || "India",
      addressType: row.address_type || "Home",
      isDefault: Boolean(row.is_default),
      createdAt: row.created_at
    }));

    return NextResponse.json({ addresses });
  } catch (err: any) {
    console.error("❌ Error fetching user addresses:", err);
    return NextResponse.json({ error: "Failed to fetch address book", addresses: [] }, { status: 500 });
  }
}

// POST - Add new address or edit existing address
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      userIdentifier,
      fullName,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      country = "India",
      addressType = "Home",
      isDefault = false
    } = body;

    if (!userIdentifier || !fullName || !phoneNumber || !addressLine1 || !city || !state || !pincode) {
      return NextResponse.json({ error: "All required address fields must be provided." }, { status: 400 });
    }

    const cleanUser = userIdentifier.trim().toLowerCase();

    // If setting as default, unmark other defaults for this user
    if (isDefault) {
      await pool.query(
        "UPDATE textbooks_addresses SET is_default = false WHERE LOWER(user_identifier) = $1",
        [cleanUser]
      );
    }

    if (id) {
      // Edit Existing Address
      const updateRes = await pool.query(
        `UPDATE textbooks_addresses 
         SET full_name = $1, phone_number = $2, address_line1 = $3, address_line2 = $4,
             city = $5, state = $6, pincode = $7, country = $8, address_type = $9, is_default = $10,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11 AND LOWER(user_identifier) = $12
         RETURNING *`,
        [fullName, phoneNumber, addressLine1, addressLine2 || "", city, state, pincode, country, addressType, isDefault, id, cleanUser]
      );

      return NextResponse.json({ success: true, address: updateRes.rows[0] });
    } else {
      // Insert New Address
      const insertRes = await pool.query(
        `INSERT INTO textbooks_addresses 
         (user_identifier, full_name, phone_number, address_line1, address_line2, city, state, pincode, country, address_type, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [cleanUser, fullName, phoneNumber, addressLine1, addressLine2 || "", city, state, pincode, country, addressType, isDefault]
      );

      return NextResponse.json({ success: true, address: insertRes.rows[0] });
    }
  } catch (err: any) {
    console.error("❌ Error saving address:", err);
    return NextResponse.json({ error: "Failed to save address." }, { status: 500 });
  }
}

// PUT - Set an address as default
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userIdentifier = searchParams.get("user");

    if (!id || !userIdentifier) {
      return NextResponse.json({ error: "Address ID and User are required." }, { status: 400 });
    }

    const cleanUser = userIdentifier.trim().toLowerCase();

    // Reset all to false first
    await pool.query(
      "UPDATE textbooks_addresses SET is_default = false WHERE LOWER(user_identifier) = $1",
      [cleanUser]
    );

    // Set selected as true
    await pool.query(
      "UPDATE textbooks_addresses SET is_default = true WHERE id = $1 AND LOWER(user_identifier) = $2",
      [id, cleanUser]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error setting default address:", err);
    return NextResponse.json({ error: "Failed to update default address." }, { status: 500 });
  }
}

// DELETE - Remove an address
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userIdentifier = searchParams.get("user");

    if (!id || !userIdentifier) {
      return NextResponse.json({ error: "Address ID and User are required." }, { status: 400 });
    }

    const cleanUser = userIdentifier.trim().toLowerCase();
    await pool.query(
      "DELETE FROM textbooks_addresses WHERE id = $1 AND LOWER(user_identifier) = $2",
      [id, cleanUser]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Error deleting address:", err);
    return NextResponse.json({ error: "Failed to delete address." }, { status: 500 });
  }
}
