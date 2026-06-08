import { Pool } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;

// Create pg Pool
const pgPool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1")
    ? { rejectUnauthorized: false }
    : false,
});

// A flag to indicate whether we should fall back to JSON storage
let useLocalFallback = !connectionString;

// Local JSON File Database Path (inside workspace scratch directory)
const fallbackDir = path.join(process.cwd(), "scratch");
const fallbackPath = path.join(fallbackDir, "otps.json");

interface OtpRecord {
  id: number;
  access_id: string;
  target: string;
  otp_hash: string;
  created_at: string;
  expires_at: string;
  ip_address: string;
  device_info: string;
  attempts: number;
}

// Ensure the local JSON database exists
function readLocalDb(): OtpRecord[] {
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    if (!fs.existsSync(fallbackPath)) {
      fs.writeFileSync(fallbackPath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(fallbackPath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("❌ Error reading local database file:", err);
    return [];
  }
}

function writeLocalDb(data: OtpRecord[]): void {
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    fs.writeFileSync(fallbackPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error writing local database file:", err);
  }
}

const purchasesPath = path.join(fallbackDir, "purchases.json");

interface PurchaseRecord {
  id: number;
  order_id: string;
  user_identifier: string;
  book_id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: string;
  shipping_pincode?: string;
  coupon_code?: string;
  discount_amount?: number;
  gst_amount?: number;
  shipping_amount?: number;
  city?: string;
  state?: string;
  country?: string;
  quantity?: number;
  subtotal?: number;
  cashfree_order_id?: string;
  cashfree_payment_id?: string;
  payment_status?: string;
  order_status?: string;
}

function readPurchasesDb(): PurchaseRecord[] {
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    if (!fs.existsSync(purchasesPath)) {
      fs.writeFileSync(purchasesPath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(purchasesPath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("❌ Error reading local purchases database file:", err);
    return [];
  }
}

function writePurchasesDb(data: PurchaseRecord[]): void {
  try {
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    fs.writeFileSync(purchasesPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error writing local purchases database file:", err);
  }
}

// Wrapper for query execution
export const pool = {
  async query(sql: string, params: any[] = []): Promise<{ rows: any[] }> {
    if (!useLocalFallback) {
      try {
        // Attempt real PG query
        return await pgPool.query(sql, params);
      } catch (err: any) {
        console.warn("⚠️ PostgreSQL connection failed, switching to local file database fallback:", err.message || err);
        useLocalFallback = true;
      }
    }

    // Fallback: Mock queries locally using JSON file
    const cleanSql = sql.trim().replace(/\s+/g, " ").toUpperCase();

    // Handle Textbooks Purchases fallbacks
    if (cleanSql.includes("TEXTBOOKS_PURCHASES")) {
      const purchases = readPurchasesDb();

      // INSERT INTO textbooks_purchases
      if (cleanSql.startsWith("INSERT INTO TEXTBOOKS_PURCHASES")) {
        const [
          order_id,
          user_identifier,
          book_id,
          amount,
          status,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_pincode,
          coupon_code,
          discount_amount,
          gst_amount,
          shipping_amount,
          city,
          state,
          country,
          quantity,
          subtotal,
          cashfree_order_id,
          cashfree_payment_id,
          payment_status,
          order_status
        ] = params;
        const newRecord: PurchaseRecord & Record<string, any> = {
          id: purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1,
          order_id,
          user_identifier,
          book_id,
          amount: Number(amount),
          status,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_pincode,
          coupon_code,
          discount_amount: discount_amount ? Number(discount_amount) : 0,
          gst_amount: gst_amount ? Number(gst_amount) : 0,
          shipping_amount: shipping_amount ? Number(shipping_amount) : 0,
          city: city || "",
          state: state || "",
          country: country || "",
          quantity: quantity ? Number(quantity) : 1,
          subtotal: subtotal ? Number(subtotal) : 0,
          cashfree_order_id: cashfree_order_id || order_id,
          cashfree_payment_id: cashfree_payment_id || "",
          payment_status: payment_status || "PENDING_PAYMENT",
          order_status: order_status || "PENDING_PAYMENT",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        purchases.push(newRecord);
        writePurchasesDb(purchases);
        return { rows: [newRecord] };
      }

      // SELECT FROM textbooks_purchases BY user_identifier
      if (cleanSql.includes("SELECT * FROM TEXTBOOKS_PURCHASES") && cleanSql.includes("USER_IDENTIFIER = $1")) {
        const [user_identifier] = params;
        const filtered = purchases.filter(p => p.user_identifier === user_identifier);
        return { rows: filtered };
      }

      // SELECT FROM textbooks_purchases BY order_id
      if (cleanSql.includes("SELECT * FROM TEXTBOOKS_PURCHASES") && cleanSql.includes("ORDER_ID = $1")) {
        const [order_id] = params;
        const filtered = purchases.filter(p => p.order_id === order_id);
        return { rows: filtered };
      }

      // UPDATE textbooks_purchases status BY order_id
      if (cleanSql.includes("UPDATE TEXTBOOKS_PURCHASES SET STATUS = $1") && cleanSql.includes("ORDER_ID = $2")) {
        const [status, order_id] = params;
        const index = purchases.findIndex(p => p.order_id === order_id);
        if (index !== -1) {
          purchases[index].status = status;
          purchases[index].payment_status = status;
          purchases[index].updated_at = new Date().toISOString();
          writePurchasesDb(purchases);
          return { rows: [purchases[index]] };
        }
        return { rows: [] };
      }

      return { rows: [] };
    }

    const db = readLocalDb();

    // 1. CREATE TABLE
    if (cleanSql.startsWith("CREATE TABLE")) {
      return { rows: [] };
    }

    // 2. INSERT
    if (cleanSql.startsWith("INSERT INTO TEXTBOOKS_OTPS")) {
      const [access_id, target, otp_hash, expires_at, ip_address, device_info] = params;
      const newRecord: OtpRecord = {
        id: db.length > 0 ? Math.max(...db.map(r => r.id)) + 1 : 1,
        access_id,
        target,
        otp_hash,
        created_at: new Date().toISOString(),
        expires_at: new Date(expires_at).toISOString(),
        ip_address: ip_address || "127.0.0.1",
        device_info: device_info || "unknown",
        attempts: 0
      };
      db.push(newRecord);
      writeLocalDb(db);
      return { rows: [newRecord] };
    }

    // 3. SELECT (COOLDOWN) - ORDER BY created_at DESC LIMIT 1
    if (cleanSql.includes("SELECT CREATED_AT FROM TEXTBOOKS_OTPS") && cleanSql.includes("ACCESS_ID = $1 OR TARGET = $2")) {
      const [access_id, target] = params;
      const filtered = db
        .filter(r => r.access_id === access_id || r.target === target)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { rows: filtered.slice(0, 1) };
    }

    // 4. SELECT (VERIFY / RETRIEVE LATEST)
    if (cleanSql.includes("SELECT * FROM TEXTBOOKS_OTPS") && cleanSql.includes("ACCESS_ID = $1 AND TARGET = $2")) {
      const [access_id, target] = params;
      const filtered = db
        .filter(r => r.access_id === access_id && r.target === target)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { rows: filtered.slice(0, 1) };
    }

    // 5. UPDATE ATTEMPTS
    if (cleanSql.includes("UPDATE TEXTBOOKS_OTPS SET ATTEMPTS = ATTEMPTS + 1 WHERE ID = $1")) {
      const [id] = params;
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].attempts += 1;
        db[index].attempts += 1;
        writeLocalDb(db);
        return { rows: [db[index]] };
      }
      return { rows: [] };
    }

    // 6. DELETE (CLEAN UP / EXPIRE)
    if (cleanSql.includes("DELETE FROM TEXTBOOKS_OTPS WHERE ACCESS_ID = $1 AND TARGET = $2")) {
      const [access_id, target] = params;
      const updated = db.filter(r => !(r.access_id === access_id && r.target === target));
      writeLocalDb(updated);
      return { rows: [] };
    }

    // Catch-all empty rows
    return { rows: [] };
  }
};

// Helper function to auto-initialize db tables
export async function initDbTables() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS textbooks_otps (
          id SERIAL PRIMARY KEY,
          access_id VARCHAR(50) NOT NULL,
          target VARCHAR(100) NOT NULL,
          otp_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          ip_address VARCHAR(50),
          device_info VARCHAR(255),
          attempts INT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS textbooks_purchases (
          id SERIAL PRIMARY KEY,
          order_id VARCHAR(100) NOT NULL UNIQUE,
          user_identifier VARCHAR(100) NOT NULL,
          book_id VARCHAR(50) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all the new delivery/price columns exist
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS shipping_address TEXT;");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(10);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10, 2) DEFAULT 0;");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10, 2) DEFAULT 0;");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS city VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS state VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS country VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1;");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2) DEFAULT 0;");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS cashfree_order_id VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS cashfree_payment_id VARCHAR(255);");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING_PAYMENT';");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'PENDING_PAYMENT';");
  } catch (err) {
    console.error("❌ Error initializing database tables in PostgreSQL:", err);
  }
}
