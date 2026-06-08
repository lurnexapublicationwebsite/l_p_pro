import { NextRequest, NextResponse } from "next/server";
import { addNumberToTwilioCallerIds } from "@/lib/otpService";

export async function POST(req: NextRequest) {
  try {
    const { mobileNumber, name } = await req.json();

    if (!mobileNumber || !name) {
      return NextResponse.json(
        { error: "Mobile number and name are required." },
        { status: 400 }
      );
    }

    const result = await addNumberToTwilioCallerIds(mobileNumber, name);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to initiate Twilio verification." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      validationCode: result.validationCode,
      message: "Twilio caller ID verification initiated."
    });
  } catch (err: any) {
    console.error("❌ Error in /api/textbooks/auth/add-caller-id route:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
