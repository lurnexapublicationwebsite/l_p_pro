import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 🧠 Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // ⚙️ Cognito environment variables
    const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN;
    const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
    const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

    if (!COGNITO_DOMAIN || !CLIENT_ID || !CLIENT_SECRET) {
      console.error("❌ Missing environment variables for Cognito.");
      return NextResponse.json(
        { error: "Server misconfiguration. Contact admin." },
        { status: 500 }
      );
    }

    // 🔹 Token endpoint
    const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;

    // 🔹 Request body (Resource Owner Password flow)
    const body = new URLSearchParams({
      grant_type: "password",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: email,
      password: password,
    });

    // 🔹 Send request to Cognito
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    // 🧾 Get raw text to inspect even if it’s not JSON
    const text = await response.text();

    // 🔍 Try to parse JSON safely
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Cognito returned non-JSON response:", text.slice(0, 300));
      return NextResponse.json(
        { error: "Invalid response from Cognito. Please check credentials." },
        { status: 502 }
      );
    }

    // 🚫 Handle errors from Cognito
    if (!response.ok) {
      console.error("❌ Cognito login failed:", data);
      return NextResponse.json(
        { error: data.error_description || "Invalid email or password." },
        { status: 401 }
      );
    }

    // ✅ Success
    console.log("✅ Cognito login success:", {
      access_token: !!data.access_token,
      id_token: !!data.id_token,
    });

    // Return tokens to frontend
    return NextResponse.json({
      id_token: data.id_token,
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
    });
  } catch (err: any) {
    console.error("❌ /api/auth/login route error:", err);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
