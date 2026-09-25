// Behind Amplify/CloudFront, x-forwarded-for is a comma-separated chain
// ("<client>, <cloudfront edge>, ..."). Storing it raw overflows the VARCHAR ip_address
// columns (an IPv6 client plus one proxy is already > 50 chars), which made inserts fail.
// Only the first entry is the actual client.
export function getClientIp(headers: Headers, fallback = "127.0.0.1"): string {
  const first = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (first || headers.get("x-real-ip") || fallback).slice(0, 45);
}
