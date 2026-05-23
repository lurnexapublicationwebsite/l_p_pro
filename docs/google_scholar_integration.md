# Google Scholar & Academic Indexing Integration Guide

This guide details the architecture, compliance, and post-deployment verification procedures for indexing research articles published on Lurnexa Publications on Google Scholar.

---

## 1. How Our Automated Indexing Pipeline Works

We have implemented a comprehensive, zero-maintenance academic indexing pipeline that conforms strictly to the **Google Scholar Inclusion Guidelines**. Whenever a new article is added to `lib/data/articles.ts`, the following actions happen automatically:

### A. Academic Meta Tag Injection
Every article landing page (`/Articles/[slug]`) dynamically renders standard scholarly metadata in the HTML `<head>` block via the Next.js `layout.tsx` Server Component:
* `citation_title`: The exact, full title of the scholarly manuscript.
* `citation_author`: Individual meta tags are generated for each co-author by splitting author strings with delimiters (e.g. `Author A, Author B` becomes two distinct `<meta name="citation_author" content="..." />` tags). Google Scholar ignores concatenated co-author listings.
* `citation_publication_date`: Properly formatted date conforming to the `YYYY/MM/DD` structure.
* `citation_journal_title`: Resolves the specific journal name (e.g., `Global Journal for Progressive Innovation and Research (GJPIR)`).
* `citation_pdf_url`: Direct, absolute canonical path to the text-selectable PDF (e.g. `https://lurnexa.in/pdfs/Gig_Economy_Social_Security_Research_Paper.pdf`).
* `citation_abstract`: Full text abstract for indexer semantic understanding.
* `citation_keywords`: Categorized terms to improve visibility under high-intent academic search queries.

### B. Schema.org ScholarlyArticle JSON-LD
An optimized JSON-LD block of type `ScholarlyArticle` is injected inside the page body. This enables search engines like Google and Bing to display rich snippets, citation highlights, and authors profiles with maximum precision.

### C. Crawler Permissions (`robots.txt`)
We have explicitly configured crawler profiles in `app/robots.ts` to guarantee that both `Googlebot` and `Googlebot-Scholar` have unhindered access to:
- The article pages (`/Articles/*`)
- The HTML article files (`/htm/*`)
- The PDF documents (`/pdfs/*`)

### D. Automated Pre-Build PDF Generation Pipeline
To prevent broken download links, we have introduced a pre-build script `scripts/generate-missing-pdfs.js` hooked directly into the npm build process:
1. When you run `npm run build`, the script reads `lib/data/articles.ts`.
2. It checks whether the PDF listed in `downloadUrl` actually exists in the `public/` directory.
3. If any article lacks a physical PDF, the pipeline **automatically generates a premium, text-selectable, beautifully styled academic PDF** using standard layouts (Header, Title, Authors, Abstract Callout Box, Keywords, and standard academic sections).
4. This ensures that every paper always has a downloadable PDF that is 100% compliant with Google Scholar text indexability guidelines.

---

## 2. Google Search Console Verification & Sitemap Submission

To speed up indexing and monitor the crawl health of your academic publications, follow these steps to register Lurnexa with Google Search Console:

### Step 1: Verify Domain Ownership
1. Go to the [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** verification and enter your domain: `lurnexa.in` (or the exact URL).
3. Copy the TXT record provided by Google.
4. Log into your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare) and add the TXT record to your DNS configuration.
5. Click **Verify** in Search Console.

### Step 2: Submit the XML Sitemap
Our sitemap is dynamically generated at [https://lurnexa.in/sitemap.xml](https://lurnexa.in/sitemap.xml) and includes all static routes, journal categories, and dynamic research articles automatically.
1. In Search Console, select your property.
2. Click on **Sitemaps** in the left sidebar under the "Indexing" section.
3. Under "Add a new sitemap", enter: `sitemap.xml`
4. Click **Submit**. Google will queue the sitemap for processing and start crawling your academic pages.

---

## 3. Registering with Google Scholar

Google Scholar crawls and indexes web content automatically by looking at your Search Console sitemap and following links. However, to ensure inclusion and fast-track crawling, you should submit your website directly:

1. **Self-Check Compliance**:
   - Open any article page (e.g., `https://lurnexa.in/Articles/climate-finance-and-green-trade-transitions...`).
   - Right-click and choose **View Page Source**.
   - Verify that `<meta name="citation_title" ...>` and `<meta name="citation_author" ...>` are clearly present in the head.
   - Verify that clicking the PDF link opens a text-selectable PDF that has searchable characters (try pressing `Ctrl+F` and highlighting text).

2. **Submit to Google Scholar Index**:
   - Go to [Google Scholar Publisher Support](https://scholar.google.com/intl/en/scholar/publisher.html).
   - Click on the **Inclusion Request Form** or search for "Google Scholar manual indexing request".
   - Submit your domain URL (`https://lurnexa.in/sitemap.xml`) and specify that you have implemented standard academic meta tags (`citation_*`).
   - Scholar indexers generally crawl academic websites weekly. It may take 1–3 weeks for new journals to show up in search results.

---

## 4. Verification Checklists for Academic Editors

When publishing a new article:
1. **Add to Data File**: Add the article details into `lib/data/articles.ts` with all metadata filled (Title, Authors, Journal, Category, Description, Pages).
2. **PDF Upload**: Put the text-selectable PDF in `public/pdfs/` matching the name specified in `downloadUrl`. If you forget to upload a PDF, the system will automatically create a compliant academic PDF at build-time.
3. **Build & Deploy**: Run `npm run build` and deploy the output. The sitemap and page head tags are updated immediately.
