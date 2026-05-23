import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const DB_HOST = process.env.DB_HOST;
const DB_PORT = 5432;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

// Create connection pool (recommended over single connection)
const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // required for AWS RDS unless using CA bundle
  },
});

/**
 * Fetch user by id
 */
async function fetchUserById(id) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT * FROM editorial_board WHERE subid = $1",
      [id]
    );
    return result.rows;
  } finally {
    client.release();
  }
}

// Example usage
(async () => {
  try {
    const id = "41834dca-50b1-7054-1c64-fedabb82fc87";
    const data = await fetchUserById(id);
    console.log(data);
  } catch (err) {
    console.error("DB error:", err);
  } finally {
    await pool.end();
  }
})();