import { NextRequest, NextResponse } from "next/server";

const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN!;
const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET!;
const COGNITO_REDIRECT_URI = process.env.COGNITO_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
    }

    // Build the token request body
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: COGNITO_CLIENT_ID,
      client_secret: COGNITO_CLIENT_SECRET,
      redirect_uri: COGNITO_REDIRECT_URI,
      code,
    });

    const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;

    // Exchange code for tokens
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const responseText = await tokenRes.text();

    // Try parsing the response safely
    let tokens: any;
    try {
      tokens = JSON.parse(responseText);
    } catch {
      console.error("❌ Cognito returned non-JSON response:\n", responseText.slice(0, 200));
      return NextResponse.json(
        { error: "Invalid response from Cognito (not JSON)" },
        { status: 500 }
      );
    }

    // If Cognito responded with an error (invalid_client, invalid_grant, etc.)
    if (!tokenRes.ok) {
      console.error("❌ Cognito token error:", tokens);
      return NextResponse.json(
        { error: tokens.error_description || "Failed to exchange authorization code" },
        { status: 400 }
      );
    }

    console.log("✅ Token exchange success:", {
      hasIdToken: !!tokens.id_token,
      hasAccessToken: !!tokens.access_token,
    });

    // Return the tokens
    return NextResponse.json(tokens);
  } catch (err: any) {
    console.error("❌ /api/auth/callback route error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", message: err.message },
      { status: 500 }
    );
  }
}
