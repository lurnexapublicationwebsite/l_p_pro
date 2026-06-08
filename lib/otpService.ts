import nodemailer from "nodemailer";
import twilio from "twilio";

// Configure Nodemailer SMTP transporter
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

// Send real OTP email via Nodemailer
export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@lurnexa.in";

  if (!transporter) {
    console.warn(`[OTP FALLBACK LOG] Nodemailer not configured. Email OTP code for ${email} is: ${otp}`);
    return true; // Return true to allow demo/testing without credentials
  }

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject: "Lurnexa Textbook Portal - Login OTP Verification Code",
      text: `Your Lurnexa verification code is: ${otp}\n\nThis code will expire in 5 minutes. Please do not share it with anyone.`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 24px; max-width: 550px; margin: auto; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 24px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03);">
          <!-- Logo / Brand Header -->
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #c026d3; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">LURNEXA</h1>
            <p style="color: #64748b; margin: 4px 0 0 0; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">PUBLICATIONS PORTAL</p>
          </div>

          <!-- Email Content Box -->
          <div style="border-top: 3px solid #c026d3; padding-top: 32px;">
            <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 700; line-height: 1.3;">Verify Your Identity</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
              Hello,
              <br/><br/>
              You requested a secure login verification code for your Lurnexa Textbooks Portal account. Please use the following One-Time Password (OTP) to complete your verification:
            </p>

            <!-- OTP Code Display -->
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 16px; border: 1px dashed #e9d5ff; text-align: center; margin: 24px 0;">
              <span style="color: #c026d3; font-size: 32px; font-weight: 800; letter-spacing: 6px; font-family: monospace;">${otp}</span>
            </div>

            <p style="color: #334155; font-size: 13px; line-height: 1.6; margin: 0 0 32px 0;">
              <strong>Important Note:</strong> This OTP code is valid for exactly <strong>5 minutes</strong>. For security reasons, please do not share this verification code with anyone.
            </p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 24px; text-align: center;">
              <p style="font-size: 12px; color: #94a3b8; margin: 0 0 8px 0; line-height: 1.5;">
                If you did not request this login code, please secure your account credentials or ignore this email.
              </p>
              <p style="font-size: 11px; color: #cbd5e1; margin: 0;">
                © 2026 Lurnexa Publications. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error("❌ Error sending OTP email via Nodemailer:", err);
    // Fallback to log in case of SMTP server error during testing
    console.warn(`[OTP FALLBACK LOG] Failed to send email. Code for ${email} is: ${otp}`);
    return false;
  }
}

// Send real OTP SMS via Twilio
export async function sendOtpSms(mobileNumber: string, otp: string): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn(`[OTP FALLBACK LOG] Twilio SMS client not configured. Mobile OTP code for ${mobileNumber} is: ${otp}`);
    return true; // Return true to allow demo/testing without credentials
  }

  try {
    const client = twilio(accountSid, authToken);
    // Ensure mobile number is properly formatted with country code prefix (e.g. +91 for India if not already present)
    let formattedNumber = mobileNumber.trim();
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = `+91${formattedNumber}`; // Default to India country prefix
    }

    await client.messages.create({
      body: `Your Lurnexa verification code is: ${otp}. Valid for 5 minutes.`,
      from: fromNumber,
      to: formattedNumber,
    });
    return true;
  } catch (err: any) {
    console.error("❌ Error sending OTP SMS via Twilio:", err);
    console.warn(`[OTP FALLBACK LOG] Failed to send SMS. Code for ${mobileNumber} is: ${otp}`);
    
    // If it's a Twilio Trial Account restriction (unverified caller ID 21608 or invalid number 21614), 
    // allow the transaction to succeed in development so they can test with the console-logged code.
    if (err && (err.code === 21608 || err.code === 21614)) {
      console.warn(`\n[DEVELOPMENT BYPASS] Twilio Trial account restriction detected.\nRecipient number is not verified in Twilio console.\n➔ USE THIS CODE TO VERIFY: ${otp}\n`);
      return true;
    }
    return false;
  }
}

// Programmatically request Twilio to verify a caller ID
export async function addNumberToTwilioCallerIds(mobileNumber: string, name: string): Promise<{ success: boolean; error?: string; validationCode?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return { success: false, error: "Twilio credentials are not configured." };
  }

  try {
    const client = twilio(accountSid, authToken);
    let formattedNumber = mobileNumber.trim();
    if (!formattedNumber.startsWith("+")) {
      formattedNumber = `+91${formattedNumber}`; // Default to India country prefix
    }

    console.log(`[TWILIO CALLER ID] Requesting verification for: ${formattedNumber}`);
    const validationRequest = await client.validationRequests.create({
      friendlyName: name,
      phoneNumber: formattedNumber
    });

    console.log(`[TWILIO CALLER ID] Verification initiated. Validation Code: ${validationRequest.validationCode}`);
    return { 
      success: true, 
      validationCode: validationRequest.validationCode 
    };
  } catch (err: any) {
    console.error("❌ Error adding Caller ID to Twilio:", err);
    return { 
      success: false, 
      error: err.message || err.toString() 
    };
  }
}

