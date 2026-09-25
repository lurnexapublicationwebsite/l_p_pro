// Crossref DOI settings for articles and books.
// Keep this file free of imports: scripts/generate-crossref-xml.mjs imports it directly with Node.

// Your Crossref DOI prefix, e.g. '10.12345'.
// Leave empty until your first deposit succeeds - while empty, no DOI is shown on the website.
export const DOI_PREFIX = '';

export const CROSSREF = {
  depositorName: 'Lurnexa Publications',
  depositorEmail: 'lurnexapublication@gmail.com',
  registrant: 'Lurnexa Publications',
  publisherName: 'Lurnexa Publications',
  publisherPlace: 'India',
  siteUrl: 'https://lurnexa.in',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  journals: {
    GJPIR: {
      fullTitle: 'Global Journal for Progressive Innovation and Research',
      abbrevTitle: 'GJPIR',
      issn: '3139-9126',
      issnMediaType: 'electronic' as 'electronic' | 'print',
    },
  } as Record<string, { fullTitle: string; abbrevTitle: string; issn: string; issnMediaType: 'electronic' | 'print' }>,
};

export function buildDoi(doiSuffix?: string, prefix: string = DOI_PREFIX): string | null {
  if (!prefix || !doiSuffix) return null;
  return `${prefix}/${doiSuffix}`;
}

export function doiUrl(doi: string): string {
  return `https://doi.org/${doi}`;
}

export interface PartialDate {
  year: string;
  month?: string;
  day?: string;
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

// Accepts '2026-04', '2026-04-15', 'May 18, 2026' and 'August 2026'.
export function parsePublishedDate(value: string): PartialDate | null {
  const iso = value.trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
  if (iso) {
    return { year: iso[1], month: iso[2]?.padStart(2, '0'), day: iso[3]?.padStart(2, '0') };
  }
  const text = value.trim().match(/^([A-Za-z]+)\s+(?:(\d{1,2}),?\s+)?(\d{4})$/);
  if (text) {
    const monthIndex = MONTHS.indexOf(text[1].toLowerCase());
    if (monthIndex === -1) return null;
    return { year: text[3], month: String(monthIndex + 1).padStart(2, '0'), day: text[2]?.padStart(2, '0') };
  }
  return null;
}

// Google Scholar wants YYYY/MM/DD, or just YYYY when the full date is unknown.
export function toScholarDate(date: PartialDate | null): string | undefined {
  if (!date) return undefined;
  return date.month && date.day ? `${date.year}/${date.month}/${date.day}` : date.year;
}

// Schema.org accepts partial ISO dates: YYYY, YYYY-MM or YYYY-MM-DD.
export function toIsoDate(date: PartialDate | null): string | undefined {
  if (!date) return undefined;
  return [date.year, date.month, date.month && date.day].filter(Boolean).join('-');
}

// Splits "Dr. P. Manikandan" into { given: 'P.', surname: 'Manikandan' } for Crossref.
export function splitPersonName(fullName: string): { given?: string; surname: string } {
  const cleaned = fullName.replace(/^((dr|mr|mrs|ms|prof)\.?\s+)+/i, '').trim();
  const parts = cleaned.split(/\s+/);
  const surname = parts.pop() as string;
  return parts.length ? { given: parts.join(' '), surname } : { surname };
}

export function splitAuthors(authors: string): string[] {
  return authors
    .split(/[,;&]/)
    .map((a) => a.trim())
    .filter((a) => a.length > 0);
}
