// Reading progress ("continue where you stopped") and highlights for the secure textbook
// reader. Kept per user per document: instantly in localStorage on this device, and synced to
// the account (textbooks_users.reading_data) so it follows the user to other devices.

export type HighlightColor = "yellow" | "green" | "pink" | "blue";

export interface HighlightRect {
  id: string;
  // Normalized to the page (0..1), so highlights stay aligned at any zoom level or screen size.
  x: number;
  y: number;
  w: number;
  h: number;
  c: HighlightColor;
}

// Page number (as a string key) -> highlights on that page.
export type PageHighlights = Record<string, HighlightRect[]>;

export interface DocReadingState {
  lastPage: number;
  totalPages?: number;
  highlights: PageHighlights;
  updatedAt: number;
}

export type ReadingSummary = Record<string, { lastPage: number; totalPages?: number; updatedAt: number }>;

export const HIGHLIGHT_COLORS: Record<HighlightColor, { fill: string; swatch: string; label: string }> = {
  yellow: { fill: "rgba(250, 204, 21, 0.40)", swatch: "#facc15", label: "Yellow" },
  green: { fill: "rgba(74, 222, 128, 0.38)", swatch: "#4ade80", label: "Green" },
  pink: { fill: "rgba(244, 114, 182, 0.36)", swatch: "#f472b6", label: "Pink" },
  blue: { fill: "rgba(96, 165, 250, 0.36)", swatch: "#60a5fa", label: "Blue" },
};

export const bookDocKey = (bookId: string | number) => `book:${bookId}`;
export const caseletDocKey = (bookId: string | number, index: number) => `caselet:${bookId}:${index}`;

const cacheKey = (email: string, docKey: string) => `lurnexa_reading:${email.toLowerCase()}:${docKey}`;

export function readCachedState(email: string, docKey: string): DocReadingState | null {
  try {
    const raw = localStorage.getItem(cacheKey(email, docKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.lastPage === "number" ? { highlights: {}, updatedAt: 0, ...parsed } : null;
  } catch {
    return null;
  }
}

export function writeCachedState(email: string, docKey: string, state: DocReadingState): void {
  try {
    localStorage.setItem(cacheKey(email, docKey), JSON.stringify(state));
  } catch {
    // Storage full or blocked — the account copy still gets saved.
  }
}

// Union by highlight id, keeping `primary` entries when both sides have the same id.
export function mergeHighlights(primary: PageHighlights, secondary: PageHighlights): PageHighlights {
  const merged: PageHighlights = {};
  const pages = new Set([...Object.keys(primary || {}), ...Object.keys(secondary || {})]);
  pages.forEach((page) => {
    const seen = new Set<string>();
    const list: HighlightRect[] = [];
    [...(primary?.[page] || []), ...(secondary?.[page] || [])].forEach((h) => {
      if (seen.has(h.id)) return;
      seen.add(h.id);
      list.push(h);
    });
    if (list.length) merged[page] = list;
  });
  return merged;
}

export function mergeSummaries(a: ReadingSummary, b: ReadingSummary): ReadingSummary {
  const merged: ReadingSummary = { ...a };
  Object.entries(b || {}).forEach(([key, entry]) => {
    if (!merged[key] || entry.updatedAt >= merged[key].updatedAt) merged[key] = entry;
  });
  return merged;
}

async function postReading(body: Record<string, unknown>, keepalive = false) {
  const res = await fetch("/api/textbooks/reading/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    keepalive,
  });
  if (!res.ok) throw new Error(`Reading sync failed (${res.status})`);
  return res.json();
}

export async function fetchReadingState(email: string, docKey: string): Promise<DocReadingState | null> {
  const data = await postReading({ action: "get", email, doc: docKey });
  return data?.state || null;
}

export async function fetchReadingSummary(email: string): Promise<ReadingSummary> {
  const data = await postReading({ action: "summary", email });
  return data?.summary || {};
}

export async function saveReadingState(email: string, docKey: string, state: DocReadingState): Promise<void> {
  // keepalive so a save fired while the reader is closing or the tab is being hidden still lands.
  await postReading({ action: "save", email, doc: docKey, state }, true);
}
