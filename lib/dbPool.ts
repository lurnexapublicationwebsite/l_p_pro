import { Pool } from "pg";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;

// Create pg Pool. Tuned for serverless (Amplify/Lambda): many concurrent function
// instances each hold their own small pool against the same database, so `max` is kept
// low to avoid exhausting the database's total connection limit, and idle connections are
// released quickly rather than held open across invocations. connectionTimeoutMillis is
// long enough to tolerate a cold Lambda container's normal connection latency without
// falsely triggering the "database unreachable" path below.
const pgPool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes("localhost") && !connectionString.includes("127.0.0.1")
    ? { rejectUnauthorized: false }
    : false,
  connectionTimeoutMillis: 8000,
  max: 5,
  idleTimeoutMillis: 10_000,
});

// A flag to indicate whether we should fall back to JSON storage
const isPlaceholderUrl = connectionString && (
  connectionString.includes("db_user") || 
  connectionString.includes("db_host") || 
  connectionString.includes("db_password") ||
  connectionString.includes("your_")
);
const useLocalFallback = !connectionString || isPlaceholderUrl;

// Local JSON File Database Path (inside workspace scratch directory or AWS Lambda /tmp)
const fallbackDir = typeof process !== 'undefined' && process.env.AWS_LAMBDA_FUNCTION_NAME 
  ? "/tmp" 
  : path.join(process.cwd(), "scratch");
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
  purchase_format?: string;
  purchase_plan?: string;
  access_id?: string;
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

function readJSONTable(name: string): any[] {
  const p = path.join(fallbackDir, `${name}.json`);
  if (!fs.existsSync(p)) {
    if (name === "quotation_users") {
      const crypto = require("crypto");
      const defaultHash = crypto.createHash("sha256").update("admin123").digest("hex");
      const initialUsers = [
        { email: "lurnexaquotations@gmail.com", password_hash: defaultHash }
      ];
      try {
        if (!fs.existsSync(fallbackDir)) {
          fs.mkdirSync(fallbackDir, { recursive: true });
        }
        fs.writeFileSync(p, JSON.stringify(initialUsers, null, 2));
      } catch (e) {}
      return initialUsers;
    }
    try {
      if (!fs.existsSync(fallbackDir)) {
        fs.mkdirSync(fallbackDir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify([]));
    } catch (e) {}
    return [];
  }
  try {
    const data = fs.readFileSync(p, "utf-8");
    const parsed = JSON.parse(data || "[]");
    if (!parsed) return [];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    return [];
  }
}

function writeJSONTable(name: string, data: any[]): void {
  try {
    const p = path.join(fallbackDir, `${name}.json`);
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`❌ Error writing JSON table ${name}:`, err);
  }
}

// A flag to track PostgreSQL failure with a retry cooldown (30s)
let pgFailedAt: number | null = null;
const PG_RETRY_COOLDOWN_MS = 30_000;

export const pool = {
  async query(sql: string, params: any[] = [], _isRetry = false): Promise<{ rows: any[] }> {
    if (!useLocalFallback) {
      // A real database is configured (production) — this branch never falls through to
      // the local JSON fallback below. It used to: any transient Postgres hiccup (a brief
      // network blip, a cold connection) would silently switch that request to the local
      // JSON files as if that were a real database. On Lambda (Amplify's SSR runtime)
      // those files live in /tmp, which is empty and freshly ephemeral for every separate
      // container — so different concurrent requests would randomly see fabricated empty
      // data instead of the real data ("sometimes loading, sometimes not"), and any write
      // that happened to land during that window was silently lost forever the moment the
      // Lambda container recycled, never reaching the real database at all. Now a genuine
      // failure is surfaced as an honest error instead of masquerading as success.
      const pgFailed = pgFailedAt !== null && (Date.now() - pgFailedAt < PG_RETRY_COOLDOWN_MS);
      if (pgFailed) {
        throw new Error("Database temporarily unavailable. Please try again in a moment.");
      }
      try {
        const result = await pgPool.query(sql, params);
        pgFailedAt = null; // reset on success
        return result;
      } catch (err: any) {
        // Most production failures are a transient blip rather than the database actually
        // being down, so retry once before giving up.
        if (!_isRetry) {
          console.error("⚠️ PostgreSQL query failed, retrying once:", err.message || err);
          await new Promise((r) => setTimeout(r, 300));
          return pool.query(sql, params, true);
        }
        console.error("❌ PostgreSQL query failed after retry:", err.message || err);
        pgFailedAt = Date.now();
        throw new Error("Database temporarily unavailable. Please try again in a moment.");
      }
    }

    // Fallback: Mock queries locally using JSON file — local dev only (DATABASE_URL is a
    // placeholder or unset). Never reached once a real database is configured; see above.
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
          order_status,
          purchase_format,
          purchase_plan,
          access_id
        ] = params;
        const existingIdx = purchases.findIndex(p => p.order_id === order_id);
        const newRecord: PurchaseRecord & Record<string, any> = {
          id: existingIdx !== -1 ? purchases[existingIdx].id : (purchases.length > 0 ? Math.max(...purchases.map(p => p.id)) + 1 : 1),
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
          purchase_format: purchase_format || "",
          purchase_plan: purchase_plan || "",
          access_id: access_id || "",
          created_at: existingIdx !== -1 ? purchases[existingIdx].created_at : new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        if (existingIdx !== -1) {
          purchases[existingIdx] = newRecord;
        } else {
          purchases.push(newRecord);
        }
        writePurchasesDb(purchases);
        return { rows: [newRecord] };
      }

      // SELECT FROM textbooks_purchases (all purchases)
      if (cleanSql.includes("SELECT * FROM TEXTBOOKS_PURCHASES") && !cleanSql.includes("WHERE")) {
        return { rows: purchases };
      }

      // SELECT ... WHERE LOWER(user_identifier) = $1 OR LOWER(customer_email) = $1 OR customer_phone = $1
      // — used by /api/textbooks/user/orders (Order History). The LOWER() wrapping means this
      // must be matched before the plain "USER_IDENTIFIER = $1" branch below, which won't see it.
      if (cleanSql.includes("FROM TEXTBOOKS_PURCHASES") && cleanSql.includes("CUSTOMER_EMAIL") && cleanSql.includes("CUSTOMER_PHONE")) {
        const needle = String(params[0] || "").toLowerCase();
        const filtered = purchases.filter((p: any) =>
          (p.user_identifier && p.user_identifier.toLowerCase() === needle) ||
          (p.customer_email && p.customer_email.toLowerCase() === needle) ||
          (p.customer_phone && p.customer_phone === params[0])
        );
        filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows: filtered };
      }

      // SELECT FROM textbooks_purchases BY user_identifier
      if (cleanSql.includes("FROM TEXTBOOKS_PURCHASES") && cleanSql.includes("USER_IDENTIFIER = $1")) {
        const [user_identifier] = params;
        const filtered = purchases.filter(p => p.user_identifier === user_identifier);
        return { rows: filtered };
      }

      // SELECT FROM textbooks_purchases BY order_id (column list varies — e.g. the "already
      // paid?" check only selects status/order_status — so match on FROM+WHERE, not SELECT *)
      if (cleanSql.includes("FROM TEXTBOOKS_PURCHASES") && cleanSql.includes("ORDER_ID = $1")) {
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
      const cleanAccessId = String(access_id).trim().toUpperCase();
      const cleanTarget = String(target).trim().toLowerCase();
      const newRecord: OtpRecord = {
        id: db.length > 0 ? Math.max(...db.map(r => r.id)) + 1 : 1,
        access_id: cleanAccessId,
        target: cleanTarget,
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
    if (cleanSql.includes("SELECT CREATED_AT FROM TEXTBOOKS_OTPS")) {
      const [access_id, target] = params;
      const cleanAccessId = String(access_id).trim().toUpperCase();
      const cleanTarget = String(target).trim().toLowerCase();
      const filtered = db
        .filter(r => r.access_id.toUpperCase() === cleanAccessId && r.target.trim().toLowerCase() === cleanTarget)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { rows: filtered.slice(0, 1) };
    }

    // 4. SELECT (VERIFY / RETRIEVE LATEST)
    if (cleanSql.includes("SELECT * FROM TEXTBOOKS_OTPS")) {
      const [access_id, target] = params;
      const cleanAccessId = String(access_id).trim().toUpperCase();
      const cleanTarget = String(target).trim().toLowerCase();
      const filtered = db
        .filter(r => r.access_id.toUpperCase() === cleanAccessId && r.target.trim().toLowerCase() === cleanTarget)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      return { rows: filtered.slice(0, 1) };
    }

    // 5. UPDATE ATTEMPTS
    if (cleanSql.includes("UPDATE TEXTBOOKS_OTPS SET ATTEMPTS = ATTEMPTS + 1 WHERE ID = $1")) {
      const [id] = params;
      const index = db.findIndex(r => r.id === id);
      if (index !== -1) {
        db[index].attempts += 1;
        writeLocalDb(db);
        return { rows: [db[index]] };
      }
      return { rows: [] };
    }

    // 6. DELETE (CLEAN UP / EXPIRE)
    if (cleanSql.includes("DELETE FROM TEXTBOOKS_OTPS")) {
      const [access_id, target] = params;
      const cleanAccessId = String(access_id).trim().toUpperCase();
      const cleanTarget = String(target).trim().toLowerCase();
      const updated = db.filter(r => !(r.access_id.toUpperCase() === cleanAccessId && r.target.trim().toLowerCase() === cleanTarget));
      writeLocalDb(updated);
      return { rows: [] };
    }

    // === QUOTATION FALLBACKS ===

    // COUNT SELECTS
    if (cleanSql.includes("SELECT COUNT(*) FROM QUOTATION_BOOKS")) {
      return { rows: [{ count: readJSONTable("quotation_books").length.toString() }] };
    }
    if (cleanSql.includes("SELECT COUNT(*) FROM QUOTATION_REQUESTS")) {
      const requests = readJSONTable("quotation_requests");
      if (cleanSql.includes("STATUS = $1")) {
        const [status] = params;
        return { rows: [{ count: requests.filter(r => r.status === status).length.toString() }] };
      }
      if (cleanSql.includes("STATUS = 'PENDING'")) {
        return { rows: [{ count: requests.filter(r => r.status === "Pending").length.toString() }] };
      }
      return { rows: [{ count: requests.length.toString() }] };
    }
    if (cleanSql.includes("SELECT COUNT(*) FROM QUOTATIONS")) {
      const quotations = readJSONTable("quotations");
      if (cleanSql.includes("IS_CONFIRMED = FALSE") || cleanSql.includes("IS_CONFIRMED = $1")) {
        const filterVal = cleanSql.includes("IS_CONFIRMED = $1") ? params[0] : false;
        return { rows: [{ count: quotations.filter(q => q.is_confirmed === filterVal || !q.is_confirmed).length.toString() }] };
      }
      return { rows: [{ count: quotations.length.toString() }] };
    }
    if (cleanSql.includes("SELECT COUNT(*) FROM QUOTATION_ORDERS")) {
      return { rows: [{ count: readJSONTable("quotation_orders").length.toString() }] };
    }
    if (cleanSql.includes("SELECT COUNT(*) FROM QUOTATION_USERS")) {
      return { rows: [{ count: readJSONTable("quotation_users").length.toString() }] };
    }

    // QUOTATION_USERS SELECT / INSERT / UPDATE
    if (cleanSql.includes("SELECT * FROM QUOTATION_USERS WHERE EMAIL = $1 AND PASSWORD_HASH = $2")) {
      const users = readJSONTable("quotation_users");
      const filtered = users.filter(u => u.email === params[0].toLowerCase().trim() && u.password_hash === params[1]);
      return { rows: filtered };
    }
    if (cleanSql.includes("SELECT * FROM QUOTATION_USERS WHERE EMAIL = $1")) {
      const users = readJSONTable("quotation_users");
      const filtered = users.filter(u => u.email === params[0].toLowerCase().trim());
      return { rows: filtered };
    }
    if (cleanSql.includes("INSERT INTO QUOTATION_USERS")) {
      const users = readJSONTable("quotation_users");
      const newU = { email: params[0].toLowerCase().trim(), password_hash: params[1] };
      if (!users.some(u => u.email === newU.email)) {
        users.push(newU);
        writeJSONTable("quotation_users", users);
      }
      return { rows: [newU] };
    }
    if (cleanSql.includes("UPDATE QUOTATION_USERS SET PASSWORD_HASH = $1 WHERE EMAIL = $2")) {
      const users = readJSONTable("quotation_users");
      const idx = users.findIndex(u => u.email === params[1].toLowerCase().trim());
      if (idx !== -1) {
        users[idx].password_hash = params[0];
        writeJSONTable("quotation_users", users);
      }
      return { rows: [] };
    }

    // QUOTATION_OTPS SELECT / INSERT / UPDATE / DELETE
    if (cleanSql.includes("SELECT * FROM QUOTATION_OTPS WHERE EMAIL = $1 AND OTP_CODE = $2")) {
      const otps = readJSONTable("quotation_otps");
      const filtered = otps.filter(o => o.email === params[0] && o.otp_code === params[1]);
      return { rows: filtered };
    }
    if (cleanSql.includes("SELECT * FROM QUOTATION_OTPS WHERE EMAIL = $1")) {
      const otps = readJSONTable("quotation_otps");
      const filtered = otps.filter(o => o.email === params[0]);
      return { rows: filtered };
    }
    if (cleanSql.includes("UPDATE QUOTATION_OTPS SET OTP_CODE = $1, EXPIRES_AT = $2, ATTEMPTS = 0 WHERE EMAIL = $3")) {
      const otps = readJSONTable("quotation_otps");
      const idx = otps.findIndex(o => o.email === params[2]);
      if (idx !== -1) {
        otps[idx].otp_code = params[0];
        otps[idx].expires_at = params[1];
        otps[idx].attempts = 0;
      } else {
        otps.push({ id: otps.length + 1, email: params[2], otp_code: params[0], expires_at: params[1], attempts: 0 });
      }
      writeJSONTable("quotation_otps", otps);
      return { rows: [] };
    }
    if (cleanSql.includes("INSERT INTO QUOTATION_OTPS")) {
      const otps = readJSONTable("quotation_otps");
      otps.push({ id: otps.length + 1, email: params[0], otp_code: params[1], expires_at: params[2], attempts: 0 });
      writeJSONTable("quotation_otps", otps);
      return { rows: [] };
    }
    if (cleanSql.includes("UPDATE QUOTATION_OTPS SET ATTEMPTS = ATTEMPTS + 1 WHERE ID = $1")) {
      const otps = readJSONTable("quotation_otps");
      const idx = otps.findIndex(o => o.id === params[0]);
      if (idx !== -1) {
        otps[idx].attempts += 1;
        writeJSONTable("quotation_otps", otps);
      }
      return { rows: [] };
    }
    if (cleanSql.includes("DELETE FROM QUOTATION_OTPS WHERE ID = $1")) {
      const otps = readJSONTable("quotation_otps");
      const updated = otps.filter(o => o.id !== params[0]);
      writeJSONTable("quotation_otps", updated);
      return { rows: [] };
    }

    // QUOTATION_BOOKS SELECT / INSERT / UPDATE / DELETE
    if (cleanSql.includes("FROM QUOTATION_BOOKS")) {
      const books = readJSONTable("quotation_books");
      if (cleanSql.includes("ORDER BY BOOK_NAME")) {
        books.sort((a, b) => a.book_name.localeCompare(b.book_name));
      }
      return { rows: books };
    }
    if (cleanSql.includes("INSERT INTO QUOTATION_BOOKS")) {
      const books = readJSONTable("quotation_books");
      books.push({ id: params[0], book_name: params[1], description: params[2] });
      writeJSONTable("quotation_books", books);
      return { rows: [], rowCount: 1 } as any;
    }
    if (cleanSql.includes("UPDATE QUOTATION_BOOKS SET")) {
      const books = readJSONTable("quotation_books");
      const [book_name, description, id] = params;
      const idx = books.findIndex(b => b.id === id);
      let rowCount = 0;
      if (idx !== -1) {
        books[idx].book_name = book_name;
        books[idx].description = description || "";
        writeJSONTable("quotation_books", books);
        rowCount = 1;
      }
      return { rows: [], rowCount } as any;
    }
    if (cleanSql.includes("DELETE FROM QUOTATION_BOOKS WHERE ID = $1")) {
      const books = readJSONTable("quotation_books");
      const updated = books.filter(b => b.id !== params[0]);
      const rowCount = books.length - updated.length;
      writeJSONTable("quotation_books", updated);
      return { rows: [], rowCount } as any;
    }

    // QUOTATION_REQUESTS SELECT / INSERT / UPDATE / DELETE
    if (cleanSql.includes("SELECT * FROM QUOTATION_REQUESTS")) {
      let requests = readJSONTable("quotation_requests");
      if (cleanSql.includes("WHERE ID = $1")) {
        return { rows: requests.filter(r => r.id === params[0]) };
      }
      if (cleanSql.includes("STATUS = 'PENDING'")) {
        requests = requests.filter(r => r.status === "Pending");
      }
      if (cleanSql.includes("ORDER BY CREATED_AT DESC")) {
        requests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      return { rows: requests };
    }
    if (cleanSql.includes("INSERT INTO QUOTATION_REQUESTS")) {
      const requests = readJSONTable("quotation_requests");
      requests.push({
        id: params[0],
        institution_name: params[1],
        authorized_person: params[2],
        contact_number: params[3],
        email: params[4],
        unique_token: params[5],
        status: params[6] || 'Pending',
        items: typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8],
        created_at: params[7] || new Date().toISOString()
      });
      writeJSONTable("quotation_requests", requests);
      return { rows: [] };
    }
    if (cleanSql.includes("UPDATE QUOTATION_REQUESTS")) {
      const requests = readJSONTable("quotation_requests");
      const idx = requests.findIndex(r => r.id === params[0]);
      if (idx !== -1) {
        if (cleanSql.includes("STATUS = 'SENT'") || cleanSql.includes("STATUS = 'SENT'")) {
          requests[idx].status = 'Sent';
        } else if (cleanSql.includes("STATUS = 'PENDING'") || cleanSql.includes("STATUS = 'PENDING'")) {
          requests[idx].status = 'Pending';
        }
        writeJSONTable("quotation_requests", requests);
      }
      return { rows: [] };
    }
    if (cleanSql.includes("DELETE FROM QUOTATION_REQUESTS")) {
      const requests = readJSONTable("quotation_requests");
      const updated = requests.filter(r => r.id !== params[0]);
      writeJSONTable("quotation_requests", updated);
      return { rows: [] };
    }

    // JOIN queries check first
    if (cleanSql.includes("FROM QUOTATIONS") && cleanSql.includes("JOIN QUOTATION_REQUESTS")) {
      const quotations = readJSONTable("quotations");
      const requests = readJSONTable("quotation_requests");
      const joined = quotations
        .filter(q => q.is_confirmed === false || !q.is_confirmed)
        .map(q => {
          const req = requests.find(r => r.id === q.quotation_request_id);
          return {
            ...q,
            institution_name: req?.institution_name || "",
            authorized_person: req?.authorized_person || "",
            email: req?.email || "",
            contact_number: req?.contact_number || "",
          };
        });
      joined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return { rows: joined };
    }

    if (cleanSql.includes("FROM QUOTATION_ORDERS") && cleanSql.includes("JOIN QUOTATIONS")) {
      const orders = readJSONTable("quotation_orders");
      const quotations = readJSONTable("quotations");
      const joined = orders.map(o => {
        const quote = quotations.find(q => q.id === o.quotation_id);
        return {
          ...o,
          quotation_number: quote?.quotation_number || "",
        };
      });
      joined.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
      return { rows: joined };
    }

    // QUOTATIONS SELECT / INSERT / UPDATE
    if (cleanSql.includes("SELECT * FROM QUOTATIONS")) {
      const quotations = readJSONTable("quotations");
      if (cleanSql.includes("WHERE ID = $1")) {
        return { rows: quotations.filter(q => q.id === params[0]) };
      }
      if (cleanSql.includes("ORDER BY CREATED_AT DESC")) {
        quotations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      return { rows: quotations };
    }
    if (cleanSql.includes("INSERT INTO QUOTATIONS")) {
      const quotations = readJSONTable("quotations");
      quotations.push({
        id: params[0],
        quotation_request_id: params[1],
        quotation_number: params[2],
        total_amount: Number(params[3]),
        pdf_file_path: "", // Not specified in INSERT columns, defaults to empty/null
        sent_date: params[4],
        created_at: params[5] || new Date().toISOString(),
        items: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
        is_confirmed: params[7] === true || params[7] === "true" || false
      });
      writeJSONTable("quotations", quotations);
      return { rows: [] };
    }
    if (cleanSql.includes("UPDATE QUOTATIONS")) {
      const quotations = readJSONTable("quotations");
      if (cleanSql.includes("SET TOTAL_AMOUNT = $1")) {
        const [total_amount, items, sent_date, id] = params;
        const idx = quotations.findIndex(q => q.id === id);
        if (idx !== -1) {
          quotations[idx].total_amount = Number(total_amount);
          quotations[idx].items = typeof items === "string" ? JSON.parse(items) : items;
          quotations[idx].sent_date = sent_date;
          writeJSONTable("quotations", quotations);
        }
      } else if (cleanSql.includes("SET IS_CONFIRMED = TRUE")) {
        const idx = quotations.findIndex(q => q.id === params[2]);
        if (idx !== -1) {
          quotations[idx].is_confirmed = true;
          quotations[idx].client_stamp = params[0];
          quotations[idx].confirmed_date = params[1];
          writeJSONTable("quotations", quotations);
        }
      } else if (cleanSql.includes("IS_CONFIRMED = FALSE")) {
        const idx = quotations.findIndex(q => q.id === params[0]);
        if (idx !== -1) {
          quotations[idx].is_confirmed = false;
          quotations[idx].client_stamp = null;
          quotations[idx].confirmed_date = null;
          writeJSONTable("quotations", quotations);
        }
      }
      return { rows: [] };
    }
    if (cleanSql.includes("DELETE FROM QUOTATIONS")) {
      const quotations = readJSONTable("quotations");
      const updated = quotations.filter(q => q.id !== params[0]);
      writeJSONTable("quotations", updated);
      return { rows: [] };
    }
    if (cleanSql.includes("DELETE FROM QUOTATION_ORDERS")) {
      const orders = readJSONTable("quotation_orders");
      let updated = orders;
      if (cleanSql.includes("QUOTATION_ID = $1")) {
        updated = orders.filter(o => o.quotation_id !== params[0]);
      } else {
        updated = orders.filter(o => o.id !== params[0]);
      }
      writeJSONTable("quotation_orders", updated);
      return { rows: [] };
    }

    // QUOTATION_ORDERS SELECT / INSERT
    if (cleanSql.includes("SELECT * FROM QUOTATION_ORDERS")) {
      const orders = readJSONTable("quotation_orders");
      if (cleanSql.includes("WHERE ID = $1") || cleanSql.includes("WHERE ID::TEXT = $1")) {
        return { rows: orders.filter(o => o.id === params[0]) };
      }
      if (cleanSql.includes("ORDER BY ORDER_DATE DESC")) {
        orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
      }
      return { rows: orders };
    }
    if (cleanSql.includes("INSERT INTO QUOTATION_ORDERS")) {
      const orders = readJSONTable("quotation_orders");
      orders.push({
        id: params[0],
        quotation_id: params[1],
        institution_name: params[2],
        authorized_person: params[3],
        email: params[4],
        contact_number: params[5],
        stamp_file_path: params[6],
        total_amount: Number(params[7]),
        order_date: new Date().toISOString(),
        status: 'Confirmed'
      });
      writeJSONTable("quotation_orders", orders);
      return { rows: [] };
    }

    // QUOTATION_PASSWORD_RESETS SELECT / INSERT / DELETE
    if (cleanSql.includes("SELECT * FROM QUOTATION_PASSWORD_RESETS")) {
      const resets = readJSONTable("quotation_password_resets");
      if (cleanSql.includes("TOKEN = $1")) {
        return { rows: resets.filter(r => r.token === params[0]) };
      }
      return { rows: resets };
    }
    if (cleanSql.includes("INSERT INTO QUOTATION_PASSWORD_RESETS")) {
      const resets = readJSONTable("quotation_password_resets");
      resets.push({
        email: params[0],
        token: params[1],
        expires_at: params[2],
        created_at: new Date().toISOString()
      });
      writeJSONTable("quotation_password_resets", resets);
      return { rows: [] };
    }
    if (cleanSql.includes("DELETE FROM QUOTATION_PASSWORD_RESETS WHERE EMAIL = $1")) {
      const resets = readJSONTable("quotation_password_resets");
      const updated = resets.filter(r => r.email !== params[0]);
      writeJSONTable("quotation_password_resets", updated);
      return { rows: [] };
    }
    if (cleanSql.includes("DELETE FROM QUOTATION_PASSWORD_RESETS WHERE TOKEN = $1")) {
      const resets = readJSONTable("quotation_password_resets");
      const updated = resets.filter(r => r.token !== params[0]);
      writeJSONTable("quotation_password_resets", updated);
      return { rows: [] };
    }

    // === TEXTBOOKS TABLES FALLBACKS ===
    if (cleanSql.includes("TEXTBOOKS_INTERVIEW_QUESTIONS")) {
      const list = readJSONTable("textbooks_interview_questions");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [id, company, role, question_text, answer_text, difficulty, created_at] = params;
        const record = { id, company, role, question_text, answer_text, difficulty, created_at };
        const idx = list.findIndex((x: any) => x.id === id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_interview_questions", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("NOT IN")) {
          const activeIds = params;
          const updated = list.filter((x: any) => activeIds.includes(x.id));
          writeJSONTable("textbooks_interview_questions", updated);
        } else {
          writeJSONTable("textbooks_interview_questions", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_COMPANY_UPDATES")) {
      const list = readJSONTable("textbooks_company_updates");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [id, company, updatesVal, created_at] = params;
        const updates = typeof updatesVal === "string" ? JSON.parse(updatesVal) : updatesVal;
        const record = { id, company, updates, created_at };
        const idx = list.findIndex((x: any) => x.id === id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_company_updates", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("NOT IN")) {
          const activeIds = params;
          const updated = list.filter((x: any) => activeIds.includes(x.id));
          writeJSONTable("textbooks_company_updates", updated);
        } else {
          writeJSONTable("textbooks_company_updates", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_USERS")) {
      // Handle ALTER TABLE silently (used by login route for migration)
      if (cleanSql.startsWith("ALTER TABLE")) {
        return { rows: [] };
      }
      const list = readJSONTable("textbooks_users");
      if (cleanSql.startsWith("SELECT")) {
        if (cleanSql.includes("WHERE") && params.length > 0) {
          const paramVal = String(params[0] || "").trim().toLowerCase();
          if (paramVal) {
            const filtered = list.filter((u: any) =>
              (u.email && u.email.toLowerCase() === paramVal) ||
              (u.college_email && u.college_email.toLowerCase() === paramVal) ||
              (u.mobile_number && u.mobile_number.toLowerCase() === paramVal) ||
              (u.access_id && u.access_id.toLowerCase() === paramVal) ||
              (u.id && String(u.id).toLowerCase() === paramVal)
            );
            return { rows: filtered };
          }
        }
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const match = cleanSql.match(/INSERT\s+INTO\s+TEXTBOOKS_USERS\s*\(([^)]+)\)/i);
        const record: Record<string, any> = {};
        if (match) {
          const colNames = match[1].split(",").map(c => c.trim().toLowerCase());
          colNames.forEach((col, idx) => {
            let val = params[idx];
            if (col === "purchased_books" && typeof val === "string") {
              try { val = JSON.parse(val); } catch (e) {}
            }
            record[col] = val;
          });
        } else {
          const [
            mobile_number, name, book_id, role, college_name, college_id, faculty_id,
            college_email, department, faculty_role, subject_teaching, is_active,
            access_id, teaching_faculty_access_id, profile_picture, plan, purchased_books
          ] = params;
          Object.assign(record, {
            mobile_number, name, book_id, role, college_name, college_id, faculty_id,
            college_email, department, faculty_role, subject_teaching, is_active,
            access_id, teaching_faculty_access_id, profile_picture, plan,
            purchased_books: typeof purchased_books === "string" ? JSON.parse(purchased_books) : purchased_books
          });
        }

        const userEmail = (record.email || record.college_email || record.mobile_number || "").toLowerCase();
        const idx = list.findIndex((x: any) => {
          const xEmail = (x.email || x.college_email || x.mobile_number || "").toLowerCase();
          return (userEmail && xEmail === userEmail) || (record.access_id && x.access_id === record.access_id);
        });

        if (idx !== -1) {
          list[idx] = { ...list[idx], ...record };
        } else {
          list.push(record);
        }
        writeJSONTable("textbooks_users", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("UPDATE")) {
        const setMatch = cleanSql.match(/SET\s+(.*?)\s+WHERE/i);
        const updatedList = list.map((u: any) => {
          const isMatch = params.some((p: any) => {
            if (p === undefined || p === null) return false;
            const strP = String(p).trim().toLowerCase();
            if (!strP) return false;
            const uEmail = (u.email || "").toLowerCase();
            const uCollegeEmail = (u.college_email || "").toLowerCase();
            const uMobile = (u.mobile_number || "").toLowerCase();
            const uId = String(u.id || "").toLowerCase();
            const uAccessId = (u.access_id || "").toLowerCase();
            return strP === uEmail || strP === uCollegeEmail || strP === uMobile || strP === uId || strP === uAccessId;
          });

          if (isMatch && setMatch) {
            const setPart = setMatch[1];
            const assignments = setPart.split(",");
            assignments.forEach((assign, idx) => {
              const eqIdx = assign.indexOf("=");
              if (eqIdx !== -1) {
                const col = assign.substring(0, eqIdx).trim().toLowerCase();
                let val = params[idx];
                if (col === "purchased_books" && typeof val === "string") {
                  try { val = JSON.parse(val); } catch (e) {}
                }
                u[col] = val;
              }
            });
          }
          return u;
        });

        writeJSONTable("textbooks_users", updatedList);
        return { rows: [] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("WHERE MOBILE_NUMBER = $1")) {
          const updated = list.filter((x: any) => x.mobile_number !== params[0]);
          writeJSONTable("textbooks_users", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeMobiles = params;
          const updated = list.filter((x: any) => activeMobiles.includes(x.mobile_number));
          writeJSONTable("textbooks_users", updated);
        } else {
          writeJSONTable("textbooks_users", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_ALLOWED_ACCESS_IDS")) {
      const list = readJSONTable("textbooks_allowed_access_ids");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const colStart = cleanSql.indexOf("(");
        const colEnd = cleanSql.indexOf(")");
        const record: Record<string, any> = {};
        
        if (colStart !== -1 && colEnd !== -1 && colEnd > colStart) {
          const colsStr = cleanSql.substring(colStart + 1, colEnd);
          const columns = colsStr.split(",").map(c => c.trim().toLowerCase());
          
          columns.forEach((col, idx) => {
            record[col] = params[idx] !== undefined ? params[idx] : null;
          });
        } else {
          const [access_id, book_id, role, assigned_to, college_code, plan] = params;
          Object.assign(record, { access_id, book_id, role, assigned_to, college_code, plan });
        }

        const access_id = record.access_id;
        const idx = list.findIndex((x: any) => x.access_id === access_id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...record };
        } else {
          list.push(record);
        }
        writeJSONTable("textbooks_allowed_access_ids", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("BOOK_ID = $1")) {
          const updated = list.filter((x: any) => x.book_id !== params[0]);
          writeJSONTable("textbooks_allowed_access_ids", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeAccessIds = params;
          const updated = list.filter((x: any) => activeAccessIds.includes(x.access_id));
          writeJSONTable("textbooks_allowed_access_ids", updated);
        } else {
          writeJSONTable("textbooks_allowed_access_ids", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_COLLEGES")) {
      const list = readJSONTable("textbooks_colleges");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [code, name] = params;
        const record = { code, name };
        const idx = list.findIndex((x: any) => x.code === code);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_colleges", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("CODE = $1")) {
          const updated = list.filter((x: any) => x.code !== params[0]);
          writeJSONTable("textbooks_colleges", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeCodes = params;
          const updated = list.filter((x: any) => activeCodes.includes(x.code));
          writeJSONTable("textbooks_colleges", updated);
        } else {
          writeJSONTable("textbooks_colleges", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_TEXTBOOKS")) {
      const list = readJSONTable("textbooks_textbooks");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [id, title, code] = params;
        const record = { id, title, code };
        const idx = list.findIndex((x: any) => x.id === id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_textbooks", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("ID = $1")) {
          const updated = list.filter((x: any) => x.id !== params[0]);
          writeJSONTable("textbooks_textbooks", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeBookIds = params;
          const updated = list.filter((x: any) => activeBookIds.includes(x.id));
          writeJSONTable("textbooks_textbooks", updated);
        } else {
          writeJSONTable("textbooks_textbooks", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_COUPONS")) {
      const list = readJSONTable("textbooks_coupons");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [code, discount_percentage, book_id, applicable_format, soft_discount_percentage, hard_discount_percentage] = params;
        const record = { code, discount_percentage, book_id, applicable_format, soft_discount_percentage, hard_discount_percentage };
        const idx = list.findIndex((x: any) => x.code === code);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_coupons", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("CODE = $1")) {
          const updated = list.filter((x: any) => x.code !== params[0]);
          writeJSONTable("textbooks_coupons", updated);
        } else {
          writeJSONTable("textbooks_coupons", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_QUIZZES")) {
      const list = readJSONTable("textbooks_quizzes");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [quiz_code, title, book_id, created_by, type, duration, questions, chapters, created_at, start_time, end_time] = params;
        const record = {
          quiz_code, title, book_id, created_by, type, duration,
          questions: typeof questions === "string" ? JSON.parse(questions) : questions,
          chapters: typeof chapters === "string" ? JSON.parse(chapters) : chapters,
          created_at, start_time, end_time
        };
        const idx = list.findIndex((x: any) => x.quiz_code === quiz_code);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_quizzes", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("BOOK_ID = $1")) {
          const updated = list.filter((x: any) => x.book_id !== params[0]);
          writeJSONTable("textbooks_quizzes", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeQuizCodes = params;
          const updated = list.filter((x: any) => activeQuizCodes.includes(x.quiz_code));
          writeJSONTable("textbooks_quizzes", updated);
        } else {
          writeJSONTable("textbooks_quizzes", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_ATTEMPTS")) {
      const list = readJSONTable("textbooks_attempts");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [id, quiz_code, student_mobile, student_name, answers, question_scores, score, total_questions, attempted_at, type, status] = params;
        const record = {
          id, quiz_code, student_mobile, student_name,
          answers: typeof answers === "string" ? JSON.parse(answers) : answers,
          question_scores: typeof question_scores === "string" ? JSON.parse(question_scores) : question_scores,
          score, total_questions, attempted_at, type, status
        };
        const idx = list.findIndex((x: any) => x.id === id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_attempts", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("NOT IN")) {
          const activeAttemptIds = params;
          const updated = list.filter((x: any) => activeAttemptIds.includes(x.id));
          writeJSONTable("textbooks_attempts", updated);
        } else {
          writeJSONTable("textbooks_attempts", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_BOOK_CHAPTERS")) {
      const list = readJSONTable("textbooks_book_chapters");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [book_id, chapters_count] = params;
        const record = { book_id, chapters_count };
        const idx = list.findIndex((x: any) => x.book_id === book_id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_book_chapters", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("BOOK_ID = $1")) {
          const updated = list.filter((x: any) => x.book_id !== params[0]);
          writeJSONTable("textbooks_book_chapters", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeBookIds = params;
          const updated = list.filter((x: any) => activeBookIds.includes(x.book_id));
          writeJSONTable("textbooks_book_chapters", updated);
        } else {
          writeJSONTable("textbooks_book_chapters", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_PRACTICE_CONFIGS")) {
      const list = readJSONTable("textbooks_practice_configs");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [book_id, duration, question_limit] = params;
        const record = { book_id, duration, question_limit };
        const idx = list.findIndex((x: any) => x.book_id === book_id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_practice_configs", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("NOT IN")) {
          const activeBookIds = params;
          const updated = list.filter((x: any) => activeBookIds.includes(x.book_id));
          writeJSONTable("textbooks_practice_configs", updated);
        } else {
          writeJSONTable("textbooks_practice_configs", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_PRACTICE_ATTEMPTS")) {
      const list = readJSONTable("textbooks_practice_attempts");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [id, student_mobile, book_id, answers, score, total_questions, completed_at, practice_test_id] = params;
        const record = {
          id, student_mobile, book_id,
          answers: typeof answers === "string" ? JSON.parse(answers) : answers,
          score, total_questions, completed_at, practice_test_id
        };
        const idx = list.findIndex((x: any) => x.id === id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_practice_attempts", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("BOOK_ID = $1")) {
          const updated = list.filter((x: any) => x.book_id !== params[0]);
          writeJSONTable("textbooks_practice_attempts", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeAttemptIds = params;
          const updated = list.filter((x: any) => activeAttemptIds.includes(x.id));
          writeJSONTable("textbooks_practice_attempts", updated);
        } else {
          writeJSONTable("textbooks_practice_attempts", []);
        }
        return { rows: [] };
      }
    }

    if (cleanSql.includes("TEXTBOOKS_PRACTICE_TESTS")) {
      const list = readJSONTable("textbooks_practice_tests");
      if (cleanSql.startsWith("SELECT")) {
        return { rows: list };
      }
      if (cleanSql.startsWith("INSERT")) {
        const [id, title, book_id, duration, question_limit, start_time, end_time, created_at, selected_question_ids] = params;
        const record = {
          id, title, book_id, duration, question_limit, start_time, end_time, created_at,
          selected_question_ids: typeof selected_question_ids === "string" ? JSON.parse(selected_question_ids) : selected_question_ids
        };
        const idx = list.findIndex((x: any) => x.id === id);
        if (idx !== -1) list[idx] = record;
        else list.push(record);
        writeJSONTable("textbooks_practice_tests", list);
        return { rows: [record] };
      }
      if (cleanSql.startsWith("DELETE")) {
        if (cleanSql.includes("ID = $1")) {
          const updated = list.filter((x: any) => x.id !== params[0]);
          writeJSONTable("textbooks_practice_tests", updated);
        } else if (cleanSql.includes("NOT IN")) {
          const activeTestIds = params;
          const updated = list.filter((x: any) => activeTestIds.includes(x.id));
          writeJSONTable("textbooks_practice_tests", updated);
        } else {
          writeJSONTable("textbooks_practice_tests", []);
        }
        return { rows: [] };
      }
    }

    // ─── BOOK RENTAL PLANS FALLBACK ───
    if (cleanSql.includes("BOOK_RENTAL_PLANS")) {
      const plans = readJSONTable("book_rental_plans");
      if (plans.length === 0) {
        // Auto-seed default plans
        const defaults = [
          { id: 1, plan_code: '1_month', display_name: '1 Month', duration_days: 30, price: 59, currency: 'INR', is_active: true, sort_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 2, plan_code: '3_months', display_name: '3 Months', duration_days: 90, price: 99, currency: 'INR', is_active: true, sort_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: 3, plan_code: '6_months', display_name: '6 Months', duration_days: 180, price: 149, currency: 'INR', is_active: true, sort_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        writeJSONTable("book_rental_plans", defaults);
      }
      const currentPlans = readJSONTable("book_rental_plans");

      if (cleanSql.includes("SELECT")) {
        if (cleanSql.includes("IS_ACTIVE = TRUE") || cleanSql.includes("IS_ACTIVE")) {
          return { rows: currentPlans.filter((p: any) => p.is_active).sort((a: any, b: any) => a.sort_order - b.sort_order) };
        }
        if (cleanSql.includes("PLAN_CODE = $1")) {
          return { rows: currentPlans.filter((p: any) => p.plan_code === params[0]) };
        }
        return { rows: currentPlans.sort((a: any, b: any) => a.sort_order - b.sort_order) };
      }
      if (cleanSql.startsWith("INSERT")) {
        if (!currentPlans.some((p: any) => p.plan_code === params[0])) {
          const newPlan = {
            id: currentPlans.length > 0 ? Math.max(...currentPlans.map((p: any) => p.id)) + 1 : 1,
            plan_code: params[0], display_name: params[1], duration_days: params[2],
            price: params[3], sort_order: params[4] || 0, currency: 'INR',
            is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
          };
          currentPlans.push(newPlan);
          writeJSONTable("book_rental_plans", currentPlans);
          return { rows: [newPlan] };
        }
        return { rows: [] };
      }
      return { rows: [] };
    }

    // ─── BOOK RENTALS FALLBACK ───
    if (cleanSql.includes("BOOK_RENTALS") && !cleanSql.includes("BOOK_RENTAL_PLANS")) {
      const rentals = readJSONTable("book_rentals");

      // INSERT — column order must mirror the real schema exactly:
      // rental_id, user_email, user_phone, user_name, book_id, plan_code, status,
      // amount_paid, gst_amount, total_amount, cashfree_order_id, payment_status,
      // is_renewal, parent_rental_id, renewal_count, ip_address, user_agent (17 cols).
      // started_at/expires_at are NOT set at insert time — they're written later by
      // the "activate" UPDATE once payment is verified.
      if (cleanSql.startsWith("INSERT INTO BOOK_RENTALS")) {
        const newRental: any = {
          id: rentals.length > 0 ? Math.max(...rentals.map((r: any) => r.id || 0)) + 1 : 1,
          rental_id: params[0], user_email: params[1], user_phone: params[2] || '',
          user_name: params[3] || '', book_id: params[4], plan_code: params[5],
          status: params[6] || 'pending', started_at: null, expires_at: null,
          amount_paid: Number(params[7] || 0), gst_amount: Number(params[8] || 0),
          total_amount: Number(params[9] || 0), cashfree_order_id: params[10] || '',
          payment_status: params[11] || 'pending', is_renewal: Boolean(params[12]),
          parent_rental_id: params[13] || null, renewal_count: Number(params[14] || 0),
          ip_address: params[15] || '', user_agent: params[16] || '',
          expiry_7d_sent: false, expiry_1d_sent: false, expiry_sent: false,
          cashfree_payment_id: '', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
        };
        rentals.push(newRental);
        writeJSONTable("book_rentals", rentals);
        return { rows: [newRental] };
      }

      // SELECT by user_email OR user_phone OR rental_id (case-insensitive) — used by
      // /api/rentals/my-rentals to list everything a customer has rented.
      if (cleanSql.includes("SELECT") && cleanSql.includes("LOWER(USER_EMAIL)") && cleanSql.includes("USER_PHONE = $1") && cleanSql.includes("RENTAL_ID)")) {
        const needle = String(params[0] || "").toLowerCase();
        const filtered = rentals.filter((r: any) =>
          r.user_email?.toLowerCase() === needle ||
          r.user_phone === params[0] ||
          r.rental_id?.toLowerCase() === needle
        );
        filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows: filtered };
      }
      // SELECT by user_email OR user_phone (case-insensitive email) — used by
      // /api/textbooks/user/orders to fold rentals into unified order history.
      if (cleanSql.includes("SELECT") && cleanSql.includes("LOWER(USER_EMAIL)") && cleanSql.includes("USER_PHONE = $1") && !cleanSql.includes("RENTAL_ID)")) {
        const needle = String(params[0] || "").toLowerCase();
        const filtered = rentals.filter((r: any) => r.user_email?.toLowerCase() === needle || r.user_phone === params[0]);
        filtered.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return { rows: filtered };
      }
      // SELECT by rental_id (with or without an additional email ownership check)
      if (cleanSql.includes("SELECT") && cleanSql.includes("RENTAL_ID = $1")) {
        let filtered = rentals.filter((r: any) => r.rental_id === params[0]);
        if (cleanSql.includes("LOWER(USER_EMAIL)") && params[1] !== undefined) {
          const needle = String(params[1] || "").toLowerCase();
          filtered = filtered.filter((r: any) => r.user_email?.toLowerCase() === needle);
        }
        return { rows: filtered };
      }
      // SELECT by user_email
      if (cleanSql.includes("SELECT") && cleanSql.includes("USER_EMAIL = $1") && !cleanSql.includes("RENTAL_ID")) {
        const filtered = rentals.filter((r: any) => r.user_email?.toLowerCase() === params[0]?.toLowerCase());
        return { rows: filtered };
      }
      // SELECT by user_email + book_id + status active
      if (cleanSql.includes("SELECT") && cleanSql.includes("USER_EMAIL = $1") && cleanSql.includes("BOOK_ID = $2") && cleanSql.includes("STATUS = $3")) {
        const filtered = rentals.filter((r: any) =>
          r.user_email?.toLowerCase() === params[0]?.toLowerCase() &&
          r.book_id === params[1] &&
          r.status === params[2]
        );
        return { rows: filtered };
      }
      // SELECT DISTINCT book_id ... WHERE LOWER(user_email) = $1 AND status = 'active'
      // — used by login/signup/me to report which books this one account has rented.
      // Must be checked before the bare status-only branch below, or every user's
      // rentedBooks would leak every other user's active rentals.
      if (cleanSql.includes("SELECT") && cleanSql.includes("LOWER(USER_EMAIL)") && cleanSql.includes("STATUS = 'ACTIVE'")) {
        const needle = String(params[0] || "").toLowerCase();
        const active = rentals.filter((r: any) => r.user_email?.toLowerCase() === needle && r.status === 'active');
        return { rows: active };
      }
      // SELECT active rentals — no user filter (expiry cron sweep, "expiring soon" listings)
      if (cleanSql.includes("SELECT") && cleanSql.includes("STATUS = 'ACTIVE'")) {
        const active = rentals.filter((r: any) => r.status === 'active');
        return { rows: active };
      }
      // SELECT all
      if (cleanSql.includes("SELECT * FROM BOOK_RENTALS") && !cleanSql.includes("WHERE")) {
        return { rows: rentals };
      }
      // SELECT by cashfree_order_id
      if (cleanSql.includes("SELECT") && cleanSql.includes("CASHFREE_ORDER_ID = $1")) {
        return { rows: rentals.filter((r: any) => r.cashfree_order_id === params[0]) };
      }

      // UPDATE status = 'expired' (status is a literal in the SQL, not a bound param —
      // the only param is the rental_id to match on)
      if (cleanSql.includes("SET STATUS = 'EXPIRED'")) {
        const rentalId = params[0];
        const idx = rentals.findIndex((r: any) => r.rental_id === rentalId);
        if (idx !== -1) {
          rentals[idx].status = 'expired';
          rentals[idx].updated_at = new Date().toISOString();
          writeJSONTable("book_rentals", rentals);
          return { rows: [rentals[idx]] };
        }
        return { rows: [] };
      }

      // UPDATE status (status passed as a bound param — rental activation)
      if (cleanSql.includes("UPDATE BOOK_RENTALS SET STATUS")) {
        const rentalId = params[params.length - 1];
        const idx = rentals.findIndex((r: any) => r.rental_id === rentalId);
        if (idx !== -1) {
          rentals[idx].status = params[0];
          if (params[1]) rentals[idx].started_at = params[1];
          if (params[2]) rentals[idx].expires_at = params[2];
          if (params[3]) rentals[idx].payment_status = params[3];
          if (params[4] !== undefined) rentals[idx].cashfree_payment_id = params[4];
          rentals[idx].updated_at = new Date().toISOString();
          writeJSONTable("book_rentals", rentals);
          return { rows: [rentals[idx]] };
        }
        return { rows: [] };
      }

      // UPDATE notification flags
      if (cleanSql.includes("UPDATE BOOK_RENTALS SET EXPIRY")) {
        const rentalId = params[params.length - 1];
        const idx = rentals.findIndex((r: any) => r.rental_id === rentalId);
        if (idx !== -1) {
          if (cleanSql.includes("EXPIRY_7D_SENT")) rentals[idx].expiry_7d_sent = true;
          if (cleanSql.includes("EXPIRY_1D_SENT")) rentals[idx].expiry_1d_sent = true;
          if (cleanSql.includes("EXPIRY_SENT")) rentals[idx].expiry_sent = true;
          rentals[idx].updated_at = new Date().toISOString();
          writeJSONTable("book_rentals", rentals);
          return { rows: [rentals[idx]] };
        }
        return { rows: [] };
      }

      // Generic UPDATE
      if (cleanSql.startsWith("UPDATE BOOK_RENTALS")) {
        const rentalId = params[params.length - 1];
        const idx = rentals.findIndex((r: any) => r.rental_id === rentalId);
        if (idx !== -1) {
          rentals[idx].updated_at = new Date().toISOString();
          writeJSONTable("book_rentals", rentals);
          return { rows: [rentals[idx]] };
        }
        return { rows: [] };
      }

      return { rows: [] };
    }

    // ─── RENTAL SESSIONS FALLBACK ───
    if (cleanSql.includes("RENTAL_SESSIONS")) {
      const sessions = readJSONTable("rental_sessions");

      if (cleanSql.startsWith("INSERT INTO RENTAL_SESSIONS")) {
        const newSession: any = {
          id: sessions.length > 0 ? Math.max(...sessions.map((s: any) => s.id || 0)) + 1 : 1,
          rental_id: params[0], session_token: params[1], user_email: params[2],
          ip_address: params[3] || '', user_agent: params[4] || '',
          last_active_at: new Date().toISOString(), expires_at: params[5],
          created_at: new Date().toISOString()
        };
        sessions.push(newSession);
        writeJSONTable("rental_sessions", sessions);
        return { rows: [newSession] };
      }
      if (cleanSql.includes("SELECT") && cleanSql.includes("SESSION_TOKEN = $1")) {
        return { rows: sessions.filter((s: any) => s.session_token === params[0]) };
      }
      if (cleanSql.includes("SELECT") && cleanSql.includes("RENTAL_ID = $1")) {
        return { rows: sessions.filter((s: any) => s.rental_id === params[0]) };
      }
      if (cleanSql.includes("DELETE") && cleanSql.includes("RENTAL_ID = $1")) {
        const updated = sessions.filter((s: any) => s.rental_id !== params[0]);
        writeJSONTable("rental_sessions", updated);
        return { rows: [] };
      }
      if (cleanSql.includes("DELETE") && cleanSql.includes("SESSION_TOKEN = $1")) {
        const updated = sessions.filter((s: any) => s.session_token !== params[0]);
        writeJSONTable("rental_sessions", updated);
        return { rows: [] };
      }
      if (cleanSql.includes("UPDATE") && cleanSql.includes("LAST_ACTIVE_AT")) {
        const token = params[params.length - 1];
        const idx = sessions.findIndex((s: any) => s.session_token === token);
        if (idx !== -1) {
          sessions[idx].last_active_at = new Date().toISOString();
          writeJSONTable("rental_sessions", sessions);
          return { rows: [sessions[idx]] };
        }
        return { rows: [] };
      }
      return { rows: [] };
    }

    // ─── TEXTBOOKS ADDRESSES FALLBACK ───
    if (cleanSql.includes("TEXTBOOKS_ADDRESSES")) {
      const addresses = readJSONTable("textbooks_addresses");

      if (cleanSql.startsWith("INSERT INTO TEXTBOOKS_ADDRESSES")) {
        const isDefault = Boolean(params[10]);
        if (isDefault) {
          addresses.forEach((a: any) => {
            if (a.user_identifier?.toLowerCase() === String(params[0]).toLowerCase()) {
              a.is_default = false;
            }
          });
        }
        const newAddress: any = {
          id: addresses.length > 0 ? Math.max(...addresses.map((a: any) => Number(a.id) || 0)) + 1 : 1,
          user_identifier: params[0],
          full_name: params[1],
          phone_number: params[2],
          address_line1: params[3],
          address_line2: params[4] || '',
          city: params[5],
          state: params[6],
          pincode: params[7],
          country: params[8] || 'India',
          address_type: params[9] || 'Home',
          is_default: isDefault,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        addresses.push(newAddress);
        writeJSONTable("textbooks_addresses", addresses);
        return { rows: [newAddress] };
      }

      if (cleanSql.includes("SELECT") && cleanSql.includes("USER_IDENTIFIER")) {
        const user = String(params[0]).toLowerCase();
        const filtered = addresses.filter((a: any) => a.user_identifier?.toLowerCase() === user);
        filtered.sort((a: any, b: any) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
        return { rows: filtered };
      }

      if (cleanSql.includes("UPDATE TEXTBOOKS_ADDRESSES") && cleanSql.includes("SET IS_DEFAULT = FALSE")) {
        const user = String(params[0]).toLowerCase();
        addresses.forEach((a: any) => {
          if (a.user_identifier?.toLowerCase() === user) {
            a.is_default = false;
          }
        });
        writeJSONTable("textbooks_addresses", addresses);
        return { rows: [] };
      }

      if (cleanSql.includes("UPDATE TEXTBOOKS_ADDRESSES") && cleanSql.includes("SET IS_DEFAULT = TRUE")) {
        const id = Number(params[0]);
        const user = String(params[1]).toLowerCase();
        addresses.forEach((a: any) => {
          if (a.user_identifier?.toLowerCase() === user) {
            a.is_default = (a.id === id);
          }
        });
        writeJSONTable("textbooks_addresses", addresses);
        return { rows: [] };
      }

      if (cleanSql.includes("UPDATE TEXTBOOKS_ADDRESSES")) {
        const id = Number(params[params.length - 1]);
        const idx = addresses.findIndex((a: any) => a.id === id);
        if (idx !== -1) {
          addresses[idx].full_name = params[0];
          addresses[idx].phone_number = params[1];
          addresses[idx].address_line1 = params[2];
          addresses[idx].address_line2 = params[3] || '';
          addresses[idx].city = params[4];
          addresses[idx].state = params[5];
          addresses[idx].pincode = params[6];
          addresses[idx].country = params[7] || 'India';
          addresses[idx].address_type = params[8] || 'Home';
          if (params[9] !== undefined) addresses[idx].is_default = Boolean(params[9]);
          addresses[idx].updated_at = new Date().toISOString();
          writeJSONTable("textbooks_addresses", addresses);
          return { rows: [addresses[idx]] };
        }
        return { rows: [] };
      }

      if (cleanSql.includes("DELETE FROM TEXTBOOKS_ADDRESSES")) {
        const id = Number(params[0]);
        const user = String(params[1]).toLowerCase();
        const updated = addresses.filter((a: any) => !(a.id === id && a.user_identifier?.toLowerCase() === user));
        writeJSONTable("textbooks_addresses", updated);
        return { rows: [] };
      }

      return { rows: addresses };
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
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS purchase_format VARCHAR(50) DEFAULT '';");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS purchase_plan VARCHAR(50) DEFAULT '';");
    await pool.query("ALTER TABLE textbooks_purchases ADD COLUMN IF NOT EXISTS access_id VARCHAR(100) DEFAULT '';");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS textbooks_addresses (
          id SERIAL PRIMARY KEY,
          user_identifier VARCHAR(100) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          phone_number VARCHAR(50) NOT NULL,
          address_line1 TEXT NOT NULL,
          address_line2 TEXT DEFAULT '',
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          pincode VARCHAR(20) NOT NULL,
          country VARCHAR(100) DEFAULT 'India',
          address_type VARCHAR(20) DEFAULT 'Home',
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ─── Rental System Tables ───────────────────────────────
    await pool.query(`
      CREATE TABLE IF NOT EXISTS book_rental_plans (
          id SERIAL PRIMARY KEY,
          plan_code VARCHAR(20) UNIQUE NOT NULL,
          display_name VARCHAR(50) NOT NULL,
          duration_days INTEGER NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'INR',
          is_active BOOLEAN DEFAULT TRUE,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default rental plans (upsert to avoid duplicates)
    const rentalPlansSeed = [
      { code: '1_month',  name: '1 Month',  days: 30,  price: 59,  sort: 1 },
      { code: '3_months', name: '3 Months', days: 90,  price: 99,  sort: 2 },
      { code: '6_months', name: '6 Months', days: 180, price: 149, sort: 3 }
    ];
    for (const plan of rentalPlansSeed) {
      await pool.query(
        `INSERT INTO book_rental_plans (plan_code, display_name, duration_days, price, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (plan_code) DO NOTHING`,
        [plan.code, plan.name, plan.days, plan.price, plan.sort]
      );
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS book_rentals (
          id SERIAL PRIMARY KEY,
          rental_id VARCHAR(50) UNIQUE NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          user_phone VARCHAR(20),
          user_name VARCHAR(255),
          book_id VARCHAR(20) NOT NULL,
          plan_code VARCHAR(20) NOT NULL,
          status VARCHAR(20) DEFAULT 'pending',
          started_at TIMESTAMP WITH TIME ZONE,
          expires_at TIMESTAMP WITH TIME ZONE,
          amount_paid DECIMAL(10, 2) NOT NULL,
          gst_amount DECIMAL(10, 2) DEFAULT 0,
          total_amount DECIMAL(10, 2) NOT NULL,
          cashfree_order_id VARCHAR(100),
          cashfree_payment_id VARCHAR(100),
          payment_status VARCHAR(20) DEFAULT 'pending',
          is_renewal BOOLEAN DEFAULT FALSE,
          parent_rental_id VARCHAR(50),
          renewal_count INTEGER DEFAULT 0,
          expiry_7d_sent BOOLEAN DEFAULT FALSE,
          expiry_1d_sent BOOLEAN DEFAULT FALSE,
          expiry_sent BOOLEAN DEFAULT FALSE,
          ip_address VARCHAR(50),
          user_agent TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for fast rental queries
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_rentals_user_email ON book_rentals(user_email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_rentals_status ON book_rentals(status);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_rentals_expires ON book_rentals(expires_at);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_rentals_book ON book_rentals(book_id);`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS rental_sessions (
          id SERIAL PRIMARY KEY,
          rental_id VARCHAR(50) NOT NULL,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          ip_address VARCHAR(50),
          user_agent TEXT,
          last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Book Quotation Tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_books (
          id UUID PRIMARY KEY,
          book_name VARCHAR(255) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_requests (
          id UUID PRIMARY KEY,
          institution_name VARCHAR(255) NOT NULL,
          authorized_person VARCHAR(255) NOT NULL,
          contact_number VARCHAR(50) NOT NULL,
          email VARCHAR(255) NOT NULL,
          unique_token VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'Pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          items JSONB DEFAULT '[]'::jsonb
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotations (
          id UUID PRIMARY KEY,
          quotation_request_id VARCHAR(255) NOT NULL,
          quotation_number VARCHAR(100) NOT NULL,
          total_amount DECIMAL(12, 2) DEFAULT 0.00,
          pdf_file_path VARCHAR(500),
          sent_date TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          items JSONB DEFAULT '[]'::jsonb,
          is_confirmed BOOLEAN DEFAULT FALSE,
          client_stamp VARCHAR(500),
          confirmed_date TIMESTAMP WITH TIME ZONE
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_orders (
          id UUID PRIMARY KEY,
          quotation_id VARCHAR(255) NOT NULL,
          institution_name VARCHAR(255) NOT NULL,
          authorized_person VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          contact_number VARCHAR(50) NOT NULL,
          stamp_file_path VARCHAR(500) NOT NULL,
          total_amount DECIMAL(12, 2) NOT NULL,
          order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(50) DEFAULT 'Confirmed'
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_otps (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          otp_code VARCHAR(10) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          attempts INT DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS quotation_password_resets (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          token VARCHAR(255) NOT NULL UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      );
    `);


    const crypto = require("crypto");
    const defaultHash = crypto.createHash("sha256").update("admin123").digest("hex");
    const adminCheck = await pool.query("SELECT * FROM quotation_users WHERE email = $1", ["lurnexaquotations@gmail.com"]);
    if (adminCheck.rows.length === 0) {
      await pool.query(
        "INSERT INTO quotation_users (email, password_hash) VALUES ($1, $2)",
        ["lurnexaquotations@gmail.com", defaultHash]
      );
    } else {
      await pool.query(
        "UPDATE quotation_users SET password_hash = $1 WHERE email = $2",
        [defaultHash, "lurnexaquotations@gmail.com"]
      );
    }
    // Delete any other users so that only lurnexaquotations@gmail.com remains
    await pool.query("DELETE FROM quotation_users WHERE email != $1", ["lurnexaquotations@gmail.com"]);

  } catch (err) {
    console.error("❌ Error initializing database tables in PostgreSQL:", err);
  }
}
