import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "lurnexa-quotation-secret-key-2026";

export interface QuotationJWTPayload {
  email: string;
  role: string;
}

export function signQuotationToken(payload: QuotationJWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });
}

export async function verifyQuotationToken(token: string): Promise<QuotationJWTPayload | null> {
  try {
    return jwt.verify(token, JWT_SECRET) as QuotationJWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getAuthenticatedAdmin(): Promise<QuotationJWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("quotation_token")?.value;
  if (!token) return null;
  return verifyQuotationToken(token);
}

export async function clearQuotationToken() {
  const cookieStore = await cookies();
  cookieStore.set("quotation_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(0),
  });
}
