import { NextResponse } from "next/server";
import { getTransporter } from "@/lib/mailService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quizCode, quizTitle, teacherEmail, teacherName, attempts = [] } = body;

    if (!quizCode || !teacherEmail) {
      return NextResponse.json({ error: "Missing required fields: quizCode and teacherEmail" }, { status: 400 });
    }

    // Sort attempts by score descending
    const sortedAttempts = [...attempts].sort((a, b) => b.score - a.score);

    const from = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@lurnexa.in";
    const host = request.headers.get("host") || "localhost:3000";
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const accessLink = `${origin}/textbooks/portal/login?view=results&quizCode=${quizCode}`;

    const transporter = getTransporter();

    // Render HTML table rows
    const tableRows = sortedAttempts.map((attempt, index) => {
      let scoreDisplay = attempt.score;
      if (attempt.status === 'pending') {
        scoreDisplay = "Pending Grading";
      }
      return `
        <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'}; text-align: left; border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 16px; color: #0f172a; font-weight: bold;">#${index + 1}</td>
          <td style="padding: 12px 16px; color: #0f172a;">${attempt.studentName}</td>
          <td style="padding: 12px 16px; color: #475569; font-family: monospace;">${attempt.studentMobile}</td>
          <td style="padding: 12px 16px; color: #0f172a; font-weight: bold;">${scoreDisplay} / ${attempt.totalQuestions}</td>
          <td style="padding: 12px 16px;">
            <span style="display: inline-block; padding: 4px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; ${
              attempt.status === 'pending' ? 'background-color: #fef3c7; color: #d97706;' : 'background-color: #dcfce7; color: #15803d;'
            }">${attempt.status === 'pending' ? 'Pending' : 'Graded'}</span>
          </td>
        </tr>
      `;
    }).join("");

    const mailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <div style="text-align: center; border-bottom: 2px solid #f43f5e; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px;">Quiz Time Over</h2>
          <p style="color: #64748b; margin: 5px 0 0 0; font-size: 14px;">Results report for Quiz Code: <strong>${quizCode}</strong></p>
        </div>

        <p style="color: #334155; font-size: 15px;">Dear ${teacherName || "Professor"},</p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          The scheduled time for your quiz <strong>"${quizTitle || "Untitled Quiz"}"</strong> has completed. Below is the list of attempts submitted by your students, sorted from <strong>highest marks to lowest marks</strong>.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 14px;">
          <thead>
            <tr style="background-color: #f1f5f9; border-bottom: 2px solid #e2e8f0; color: #475569; text-align: left; font-weight: bold;">
              <th style="padding: 12px 16px;">Rank</th>
              <th style="padding: 12px 16px;">Student Name</th>
              <th style="padding: 12px 16px;">Mobile</th>
              <th style="padding: 12px 16px;">Score</th>
              <th style="padding: 12px 16px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #64748b; font-style: italic;">No student attempts were submitted for this quiz.</td></tr>`}
          </tbody>
        </table>

        <div style="text-align: center; margin: 30px 0 10px 0;">
          <a href="${accessLink}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: bold; color: #ffffff; background-color: #db2777; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 6px rgba(219,39,119,0.2); transition: background-color 0.2s;">
            Access Full Results on Portal
          </a>
        </div>
        <p style="text-align: center; margin: 0; font-size: 11px; color: #94a3b8;">
          If the button does not work, copy and paste this link in your browser:<br/>
          <a href="${accessLink}" style="color: #db2777; font-family: monospace;">${accessLink}</a>
        </p>

        <p style="font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 35px; text-align: center;">
          Lurnexa Publications &copy; 2026. All rights reserved.
        </p>
      </div>
    `;

    const mailOptions = {
      from,
      to: teacherEmail,
      subject: `[Lurnexa] Quiz Results: ${quizCode} - ${quizTitle || "Untitled Quiz"}`,
      html: mailHtml
    };

    if (!transporter) {
      console.warn(`[MAIL FALLBACK LOG] SMTP Transporter not configured. Outputting quiz results email locally:`);
      console.log(`To Teacher (${teacherEmail}):`, mailOptions.subject);
      return NextResponse.json({ success: true, emailLogged: true });
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Quiz results email sent successfully to teacher: ${teacherEmail}`);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error sending quiz results email:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
