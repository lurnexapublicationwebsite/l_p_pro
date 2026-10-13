// Turnitin (Crossref Similarity Check) crawler access to paid full text.
// Crossref lists the crawler's addresses on
// https://www.crossref.org/documentation/similarity-check/participate (user agent TurnitinBot/ContentIngest).
const TURNITIN_RANGES: Array<[string, string]> = [
  ["199.47.87.132", "199.47.87.135"],
  ["199.47.82.0", "199.47.82.15"],
];

const ipv4ToInt = (ip: string): number | null => {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some((n, i) => !/^\d{1,3}$/.test(parts[i]) || n > 255)) return null;
  return ((nums[0] << 24) >>> 0) + (nums[1] << 16) + (nums[2] << 8) + nums[3];
};

const inRange = (ip: number, [from, to]: [string, string]) => ip >= ipv4ToInt(from)! && ip <= ipv4ToInt(to)!;

// Private, loopback, link-local and carrier-grade NAT addresses belong to AWS's own proxies.
const PRIVATE_V4: Array<[string, string]> = [
  ["10.0.0.0", "10.255.255.255"],
  ["172.16.0.0", "172.31.255.255"],
  ["192.168.0.0", "192.168.255.255"],
  ["127.0.0.0", "127.255.255.255"],
  ["169.254.0.0", "169.254.255.255"],
  ["100.64.0.0", "100.127.255.255"],
];

function normalize(raw: string): string {
  let ip = raw.trim().replace(/^\[|\]$/g, "");
  const v4WithPort = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (v4WithPort) ip = v4WithPort[1];
  return ip.replace(/^::ffff:/i, "");
}

const isPrivateV6 = (ip: string) => /^(::1$|f[cd][0-9a-f]{2}:|fe[89ab][0-9a-f]:)/i.test(ip);

// True only when every public address the request passed through is Turnitin's.
// x-forwarded-for can be pre-filled by the sender, but CloudFront always appends the address it
// actually saw, so a spoofed Turnitin entry is still followed by the sender's real (non-Turnitin) one.
export function isTurnitinRequest(headers: Headers): boolean {
  const viewer = headers.get("cloudfront-viewer-address")?.replace(/:\d+$/, "");
  const raw = [
    ...(headers.get("x-forwarded-for") || "").split(","),
    headers.get("x-real-ip") || "",
    viewer || "",
  ];
  const publicIps = raw
    .map(normalize)
    .filter(Boolean)
    .filter((ip) => {
      const n = ipv4ToInt(ip);
      if (n === null) return !isPrivateV6(ip);
      return !PRIVATE_V4.some((r) => inRange(n, r));
    });

  if (publicIps.length === 0) return false;
  return publicIps.every((ip) => {
    const n = ipv4ToInt(ip);
    return n !== null && TURNITIN_RANGES.some((r) => inRange(n, r));
  });
}
