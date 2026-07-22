import fs from 'fs';
import path from 'path';

const envVars = [
  'CASHFREE_APP_ID', 'CASHFREE_SECRET_KEY', 'CASHFREE_ENV', 'NEXT_PUBLIC_CASHFREE_ENV',
  'DATABASE_URL', 'JWT_SECRET',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM',
  'QUOTATION_SMTP_HOST', 'QUOTATION_SMTP_PORT', 'QUOTATION_SMTP_USER', 'QUOTATION_SMTP_PASS', 'QUOTATION_SMTP_FROM',
  'TEXTBOOK_SMTP_HOST', 'TEXTBOOK_SMTP_PORT', 'TEXTBOOK_SMTP_USER', 'TEXTBOOK_SMTP_PASS', 'TEXTBOOK_SMTP_FROM', 'TEXTBOOK_ADMIN_EMAIL',
  'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'
];

try {
  let lines = [];
  for (const key of envVars) {
    if (process.env[key]) {
      lines.push(`${key}=${process.env[key]}`);
    }
  }
  fs.writeFileSync(path.join(process.cwd(), '.env.production'), lines.join('\n'));
  console.log(`✅ Successfully injected ${lines.length} environment variables into .env.production`);
} catch (err) {
  console.error("⚠️ Warning injecting environment variables:", err);
}
