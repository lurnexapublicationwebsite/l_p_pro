import { NextResponse } from "next/server";
import { getTransporter } from "@/lib/mailService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizCode, quizTitle, teacherName, startTime, endTime, students = [] } = body;

    if (!quizCode || !students || students.length === 0) {
      return NextResponse.json({ error: "Missing required fields: quizCode, students" }, { status: 400 });
    }

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@lurnexa.in";
    const host = request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const loginLink = `${origin}/textbooks/portal/login`;

    const transporter = getTransporter();
    const formattedStart = new Date(startTime).toLocaleString();
    const formattedEnd = new Date(endTime).toLocaleString();

    const emailPromises = students.map(async (student: { name: string; email: string }) => {
      if (!student.email || student.email === "(no email)") {
        console.warn(`[Quiz Notification] Skipping student ${student.name} due to missing email.`);
        return { student: student.name, success: false, reason: "No email address" };
      }

      const mailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div style="text-align: center; border-bottom: 2px solid #db2777; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #0f172a; margin: 0; font-size: 24px;">New Quiz Scheduled</h2>
            <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Quiz Code: <strong>${quizCode}</strong></p>
          </div>

          <p style="color: #334155; font-size: 15px;">Dear ${student.name},</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your instructor, <strong>${teacherName || "Instructor"}</strong>, has scheduled a new quiz <strong>"${quizTitle || "Untitled Quiz"}"</strong>.
          </p>

          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Quiz Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #475569; width: 120px;">Quiz Code:</td>
                <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-weight: bold; font-size: 15px;">${quizCode}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #475569;">Title:</td>
                <td style="padding: 6px 0; color: #0f172a;">${quizTitle || "Untitled Quiz"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #475569;">Start Time:</td>
                <td style="padding: 6px 0; color: #0f172a;">${formattedStart}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #475569;">End Time:</td>
                <td style="padding: 6px 0; color: #0f172a;">${formattedEnd}</td>
              </tr>
            </table>
          </div>

          <p style="color: #475569; font-size: 14px; text-align: center;">
            Please log in to your account and write the quiz within the scheduled time.
          </p>

          <div style="text-align: center; margin: 30px 0 10px 0;">
            <a href="${loginLink}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: bold; color: #ffffff; background-color: #db2777; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 6px rgba(219,39,119,0.2); transition: background-color 0.2s;">
              Go to Lurnexa Portal Login
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 35px; text-align: center;">
            Lurnexa Publications &copy; 2026. All rights reserved.
          </p>
        </div>
      `;

      const mailOptions = {
        from,
        to: student.email,
        subject: `[Lurnexa] New Quiz Scheduled: ${quizCode} - ${quizTitle || "Untitled Quiz"}`,
        html: mailHtml,
      };

      if (!transporter) {
        console.warn(`[MAIL FALLBACK LOG] SMTP Transporter not configured. Outputting student notification locally:`);
        console.log(`To Student (${student.email}):`, mailOptions.subject);
        return { student: student.name, email: student.email, logged: true };
      }

      await transporter.sendMail(mailOptions);
      return { student: student.name, email: student.email, sent: true };
    });

    const results = await Promise.all(emailPromises);
    console.log(`✅ Student notifications processed for quiz: ${quizCode}`);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("❌ Error notifying students of new quiz:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
