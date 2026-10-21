import fs from 'fs';
import path from 'path';

const envVars = [
  'CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY', 'CASHFREE_ENV', 'NEXT_PUBLIC_CASHFREE_ENV',
  'DATABASE_URL', 'JWT_SECRET',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM',
  'QUOTATION_SMTP_HOST', 'QUOTATION_SMTP_PORT', 'QUOTATION_SMTP_USER', 'QUOTATION_SMTP_PASS', 'QUOTATION_SMTP_FROM',
  'TEXTBOOK_SMTP_HOST', 'TEXTBOOK_SMTP_PORT', 'TEXTBOOK_SMTP_USER', 'TEXTBOOK_SMTP_PASS', 'TEXTBOOK_SMTP_FROM', 'TEXTBOOK_ADMIN_EMAIL',
  'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY',
  'RENTAL_EXPIRY_CHECK_SECRET', 'ADMIN_SEED_SECRET',
  'BOOK_DOWNLOAD_LINK_SECRET'
];

// Without these the live site breaks (e.g. JWT_SECRET missing => "Login is temporarily unavailable.").
const requiredVars = ['JWT_SECRET', 'DATABASE_URL'];

try {
  let lines = [];
  const missing = [];
  for (const key of envVars) {
    if (process.env[key]) {
      lines.push(`${key}=${process.env[key]}`);
    } else {
      missing.push(key);
    }
  }
  fs.writeFileSync(path.join(process.cwd(), '.env.production'), lines.join('\n'));
  console.log(`✅ Successfully injected ${lines.length} environment variables into .env.production`);
  if (missing.length) {
    console.warn(`⚠️ Not set in the hosting environment: ${missing.join(', ')}`);
  }
  const missingRequired = requiredVars.filter((key) => !process.env[key]);
  if (missingRequired.length) {
    console.error(`❌ Required environment variables missing: ${missingRequired.join(', ')}. Add them in Amplify Console > Hosting > Environment variables and redeploy.`);
    process.exit(1);
  }
} catch (err) {
  console.error("⚠️ Warning injecting environment variables:", err);
}
