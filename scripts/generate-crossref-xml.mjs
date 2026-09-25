// Builds Crossref deposit XML (schema 5.3.1) from lib/data/articles.ts and lib/data/books.ts.
//
// Usage:  npm run crossref:xml -- --prefix 10.12345
//         (or set DOI_PREFIX in lib/crossref.ts and run: npm run crossref:xml)
//
// Output: crossref-deposits/articles-<journal>-v<vol>i<issue>.xml and crossref-deposits/books.xml
// Upload each file at https://doi.crossref.org -> Submissions -> Upload -> type "Metadata"
// (try https://test.crossref.org first). Requires Node 22.18+ (imports .ts files directly).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { allArticles } from '../lib/data/articles.ts';
import { PUBLISHED_BOOKS_DATA } from '../lib/data/books.ts';
import { CROSSREF, DOI_PREFIX, buildDoi, parsePublishedDate, splitAuthors, splitPersonName } from '../lib/crossref.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../crossref-deposits');

const prefixArg = process.argv.indexOf('--prefix');
const prefix = prefixArg !== -1 ? process.argv[prefixArg + 1] : DOI_PREFIX;
if (!prefix || !/^10\.\d{4,9}$/.test(prefix)) {
  console.error('Missing or invalid DOI prefix. Run: npm run crossref:xml -- --prefix 10.xxxxx');
  process.exit(1);
}

const warnings = [];
const now = new Date();
const timestamp = now.toISOString().replace(/\D/g, '').slice(0, 14); // YYYYMMDDhhmmss, must grow on each re-deposit

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const indent = (xml, spaces) => xml.split('\n').map((line) => (line ? ' '.repeat(spaces) + line : line)).join('\n');

function dateXml(date, mediaType = 'online') {
  return [
    `<publication_date media_type="${mediaType}">`,
    date.month ? `  <month>${date.month}</month>` : null,
    date.day ? `  <day>${date.day}</day>` : null,
    `  <year>${date.year}</year>`,
    '</publication_date>',
  ].filter(Boolean).join('\n');
}

function contributorsXml(authors, label) {
  const people = splitAuthors(authors).map((name, i) => {
    const { given, surname } = splitPersonName(name);
    console.log(`  ${label}: "${name}" -> given="${given ?? ''}" surname="${surname}"`);
    return [
      `  <person_name sequence="${i === 0 ? 'first' : 'additional'}" contributor_role="author">`,
      given ? `    <given_name>${esc(given)}</given_name>` : null,
      `    <surname>${esc(surname)}</surname>`,
      '  </person_name>',
    ].filter(Boolean).join('\n');
  });
  return ['<contributors>', ...people, '</contributors>'].join('\n');
}

const licenseXml = [
  '<ai:program name="AccessIndicators">',
  `  <ai:license_ref>${esc(CROSSREF.licenseUrl)}</ai:license_ref>`,
  '</ai:program>',
].join('\n');

function doiDataXml(doi, url) {
  return ['<doi_data>', `  <doi>${esc(doi)}</doi>`, `  <resource>${esc(url)}</resource>`, '</doi_data>'].join('\n');
}

function batchXml(batchId, bodyXml) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="5.3.1" xmlns="http://www.crossref.org/schema/5.3.1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:jats="http://www.ncbi.nlm.nih.gov/JATS1"
  xmlns:ai="http://www.crossref.org/AccessIndicators.xsd"
  xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 https://www.crossref.org/schemas/crossref5.3.1.xsd">
  <head>
    <doi_batch_id>${esc(batchId)}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${esc(CROSSREF.depositorName)}</depositor_name>
      <email_address>${esc(CROSSREF.depositorEmail)}</email_address>
    </depositor>
    <registrant>${esc(CROSSREF.registrant)}</registrant>
  </head>
  <body>
${indent(bodyXml, 4)}
  </body>
</doi_batch>
`;
}

function articleXml(article) {
  const doi = buildDoi(article.doiSuffix, prefix);
  const date = parsePublishedDate(article.publishedDate);
  const pages = article.pages.match(/(\d+)\s*-\s*(\d+)/);
  const abstract = article.abstract?.trim();
  if (!abstract) warnings.push(`Article ${article.id}: no abstract in articles.ts, so none was sent. Add one to improve indexing.`);
  return [
    '<journal_article publication_type="full_text">',
    `  <titles><title>${esc(article.title)}</title></titles>`,
    indent(contributorsXml(article.author, `Article ${article.id}`), 2),
    abstract ? `  <jats:abstract><jats:p>${esc(abstract)}</jats:p></jats:abstract>` : null,
    indent(dateXml(date), 2),
    pages ? `  <pages><first_page>${pages[1]}</first_page><last_page>${pages[2]}</last_page></pages>` : null,
    indent(licenseXml, 2),
    indent(doiDataXml(doi, `${CROSSREF.siteUrl}/Articles/${article.slug}`), 2),
    '</journal_article>',
  ].filter(Boolean).join('\n');
}

function writeArticles() {
  const groups = new Map();
  for (const article of allArticles) {
    if (!article.doiSuffix) continue;
    if (!parsePublishedDate(article.publishedDate)) {
      warnings.push(`Article ${article.id}: publishedDate "${article.publishedDate}" not understood - skipped.`);
      continue;
    }
    const key = `${article.journal}|${article.volume}|${article.issue}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(article);
  }

  for (const [key, articles] of groups) {
    const [journalKey, volume, issue] = key.split('|');
    const journal = CROSSREF.journals[journalKey];
    if (!journal) {
      warnings.push(`Journal "${journalKey}" is not configured in lib/crossref.ts - ${articles.length} article(s) skipped.`);
      continue;
    }
    console.log(`\n${journalKey} Vol. ${volume} Issue ${issue}: ${articles.length} article(s)`);
    const issueDate = articles
      .map((a) => parsePublishedDate(a.publishedDate))
      .sort((a, b) => `${a.year}${a.month ?? ''}`.localeCompare(`${b.year}${b.month ?? ''}`))[0];
    const body = [
      '<journal>',
      '  <journal_metadata language="en">',
      `    <full_title>${esc(journal.fullTitle)}</full_title>`,
      `    <abbrev_title>${esc(journal.abbrevTitle)}</abbrev_title>`,
      `    <issn media_type="${journal.issnMediaType}">${esc(journal.issn)}</issn>`,
      '  </journal_metadata>',
      '  <journal_issue>',
      indent(dateXml({ year: issueDate.year, month: issueDate.month }), 4),
      `    <journal_volume><volume>${esc(volume)}</volume></journal_volume>`,
      `    <issue>${esc(issue)}</issue>`,
      '  </journal_issue>',
      ...articles.map((a) => indent(articleXml(a), 2)),
      '</journal>',
    ].join('\n');
    const name = `articles-${journalKey.toLowerCase()}-v${volume}i${issue}`;
    fs.writeFileSync(path.join(outDir, `${name}.xml`), batchXml(`${name}-${timestamp}`, body));
    console.log(`  -> crossref-deposits/${name}.xml`);
  }
}

function bookXml(book) {
  const doi = buildDoi(book.doiSuffix, prefix);
  const date = parsePublishedDate(book.publishedDate);
  const isbns = [];
  const addIsbn = (value, mediaType) => {
    if (!value || value === 'N/A') return;
    if (isbns.some((i) => i.value === value)) {
      warnings.push(`Book ${book.id} "${book.title}": paperback and digital ISBN are the same (${value}). Sent once as ${isbns[0].mediaType}; fix books.ts and re-run.`);
      return;
    }
    isbns.push({ value, mediaType });
  };
  addIsbn(book.isbn, 'print');
  addIsbn(book.isbnDigital, 'electronic');
  return [
    '<book book_type="monograph">',
    '  <book_metadata language="en">',
    indent(contributorsXml(book.authors, `Book ${book.id}`), 4),
    `    <titles><title>${esc(book.title)}</title></titles>`,
    `    <jats:abstract><jats:p>${esc(book.description)}</jats:p></jats:abstract>`,
    indent(dateXml(date), 4),
    ...(isbns.length
      ? isbns.map((i) => `    <isbn media_type="${i.mediaType}">${esc(i.value)}</isbn>`)
      : ['    <noisbn reason="monograph"/>']),
    '    <publisher>',
    `      <publisher_name>${esc(CROSSREF.publisherName)}</publisher_name>`,
    `      <publisher_place>${esc(CROSSREF.publisherPlace)}</publisher_place>`,
    '    </publisher>',
    indent(licenseXml, 4),
    indent(doiDataXml(doi, `${CROSSREF.siteUrl}/textbooks/${book.slug}`), 4),
    '  </book_metadata>',
    '</book>',
  ].join('\n');
}

function writeBooks() {
  console.log('\nBooks');
  const books = PUBLISHED_BOOKS_DATA.filter((book) => {
    if (!book.doiSuffix) return false;
    if (!parsePublishedDate(book.publishedDate)) {
      warnings.push(`Book ${book.id}: publishedDate "${book.publishedDate}" not understood - skipped.`);
      return false;
    }
    return true;
  });
  const body = books.map(bookXml).join('\n');
  fs.writeFileSync(path.join(outDir, 'books.xml'), batchXml(`books-${timestamp}`, body));
  console.log(`  -> crossref-deposits/books.xml (${books.length} book(s))`);
}

fs.mkdirSync(outDir, { recursive: true });
console.log(`DOI prefix: ${prefix}`);
writeArticles();
writeBooks();

if (warnings.length) {
  console.log('\nCheck before uploading:');
  warnings.forEach((w) => console.log(`  ! ${w}`));
}
console.log('\nAlso check the given/surname splits above - fix a name in the data file if it is wrong.');
