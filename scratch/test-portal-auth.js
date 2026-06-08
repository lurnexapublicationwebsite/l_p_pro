import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';


const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function getLatestOtpFromDb(accessId, target) {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    console.log("Connecting to PostgreSQL to fetch OTP hash...");
    const client = new Client({
      connectionString,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
    });
    await client.connect();
    try {
      const res = await client.query(
        `SELECT otp_hash FROM textbooks_otps 
         WHERE access_id = $1 AND target = $2 
         ORDER BY created_at DESC LIMIT 1`,
        [accessId, target]
      );
      if (res.rows.length > 0) {
        return res.rows[0].otp_hash;
      }
    } finally {
      await client.end();
    }
  } else {
    console.log("Reading scratch/otps.json fallback to fetch OTP hash...");
    const fallbackPath = path.join(process.cwd(), 'scratch', 'otps.json');
    if (fs.existsSync(fallbackPath)) {
      const db = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      const records = db
        .filter(r => r.access_id === accessId && r.target === target)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (records.length > 0) {
        return records[0].otp_hash;
      }
    }
  }
  return null;
}

// Clear any existing OTPs for the test user to reset test environment
async function clearOtpsFromDb(accessId, target) {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    const client = new Client({
      connectionString,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
    });
    await client.connect();
    try {
      await client.query(
        `DELETE FROM textbooks_otps WHERE access_id = $1 AND target = $2`,
        [accessId, target]
      );
    } finally {
      await client.end();
    }
  } else {
    const fallbackPath = path.join(process.cwd(), 'scratch', 'otps.json');
    if (fs.existsSync(fallbackPath)) {
      const db = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
      const updated = db.filter(r => !(r.access_id === accessId && r.target === target));
      fs.writeFileSync(fallbackPath, JSON.stringify(updated, null, 2));
    }
  }
}

function findPlaintextOtp(hash) {
  console.log("Brute-forcing SHA-256 hash to find plaintext 6-digit code...");
  for (let i = 100000; i <= 999999; i++) {
    const code = i.toString();
    const candidateHash = crypto.createHash("sha256").update(code).digest("hex");
    if (candidateHash === hash) {
      console.log(`Successfully brute-forced! Plaintext OTP code is: ${code}`);
      return code;
    }
  }
  return null;
}

async function runTests() {
  const accessId = "LSML26001";
  const target = "student@college.edu";

  console.log("--- 1. Resetting test environment ---");
  await clearOtpsFromDb(accessId, target);

  console.log("\n--- 2. Requesting OTP ---");
  const requestRes = await fetch(`${BASE_URL}/api/textbooks/auth/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessId, target })
  });

  const requestData = await requestRes.json();
  console.log("Request OTP status:", requestRes.status);
  console.log("Request OTP response:", requestData);

  if (!requestRes.ok) {
    throw new Error(`Failed to request OTP: ${requestData.error}`);
  }

  console.log("\n--- 3. Fetching OTP from DB ---");
  // Wait 1.5s to ensure async operations write to database
  await new Promise(resolve => setTimeout(resolve, 1500));
  const otpHash = await getLatestOtpFromDb(accessId, target);
  if (!otpHash) {
    throw new Error("Could not find OTP hash in database!");
  }
  console.log("Found OTP SHA-256 hash in DB:", otpHash);

  const plaintextOtp = findPlaintextOtp(otpHash);
  if (!plaintextOtp) {
    throw new Error("Could not brute force OTP!");
  }

  console.log("\n--- 4. Verifying OTP ---");
  const verifyRes = await fetch(`${BASE_URL}/api/textbooks/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessId, target, code: plaintextOtp })
  });

  const verifyData = await verifyRes.json();
  console.log("Verify OTP status:", verifyRes.status);
  console.log("Verify OTP response:", verifyData);

  if (!verifyRes.ok) {
    throw new Error(`Failed to verify OTP: ${verifyData.error}`);
  }

  if (verifyData.success && verifyData.token) {
    console.log("\n🎉 SUCCESS: E2E API OTP auth verification test completed successfully!");
  } else {
    throw new Error("Verification response did not return success or token.");
  }
}

runTests().catch(err => {
  console.error("\n❌ TEST FAILED:", err.message || err);
  process.exit(1);
});
