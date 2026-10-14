import crypto from "crypto";

// Unguessable per-book full-text download links, deposited only in the Crossref XML
// (never in the sitemap or on the site): https://lurnexa.in/fulltext/<token>
// The token is an HMAC of the book id with BOOK_DOWNLOAD_LINK_SECRET, so the server can check
// it without a database and the XML script can produce the same links.
// To revoke every link: change BOOK_DOWNLOAD_LINK_SECRET (in Amplify and your local .env),
// then regenerate and re-upload books.xml.
// Keep this file free of "@/" imports: scripts/generate-crossref-xml.mjs imports it directly.

export function bookDownloadToken(bookId: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(`book-fulltext:v1:${bookId}`).digest("base64url").slice(0, 32);
}

export function findBookIdByToken(token: string, bookIds: string[], secret: string): string | null {
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) return null;
  const given = Buffer.from(token);
  for (const id of bookIds) {
    const expected = Buffer.from(bookDownloadToken(id, secret));
    if (crypto.timingSafeEqual(given, expected)) return id;
  }
  return null;
}
