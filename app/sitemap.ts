import { MetadataRoute } from 'next';
import { allArticles, slugify } from '@/lib/data/articles';
import { getAllBooks } from '@/lib/data/books';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lurnexa.in';

  // Map to deduplicate routes by their path
  const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

  const defaultSiteImages = [
    `${baseUrl}/Logo.png`,
    `${baseUrl}/founder.jpeg`,
  ];

  // 1. Dynamically generate all static routes from the app folder structure
  const walk = (dir: string, prefix = '') => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip special folders, auth/private routes, and dynamic parameter routes
        if ([
          'api', 'providers', 'components', 'styles', 'public',
          'dashboard', 'EditoralLogins', 'login', 'signup',
          'forgot-password', 'reset-password', 'resetPassword', 'set-password'
        ].includes(entry.name)) continue;
        if (entry.name.startsWith('[') || entry.name.endsWith(']')) continue;
        walk(path.join(dir, entry.name), `${prefix}/${entry.name}`);
      } else if (entry.isFile()) {
        // Consider only page files (exclude layout, loading, not-found, globals.css, etc.)
        if (/\.tsx?$/.test(entry.name) && !/^(layout|loading|not-found)\.tsx?$/.test(entry.name)) {
          // Remove .tsx extension and any index/page file handling
          const routePath = `${prefix}/${entry.name.replace(/\.tsx?$/, '')}`;
          // Normalize route: replace /page with '' and clean up duplicate slashes
          const cleanRoute = routePath
            .replace(/\/page$/, '')
            .replace(/\/index$/, '')
            .replace(/\/+/g, '/');
          
          const finalRoute = cleanRoute === '' ? '/' : cleanRoute;
          
          sitemapMap.set(finalRoute, {
            url: `${baseUrl}${finalRoute}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: finalRoute === '/' ? 1.0 : 0.8,
            images: defaultSiteImages,
          });
        }
      }
    }
  };

  const appDir = path.join(process.cwd(), 'app');
  walk(appDir);

  // Ensure root route is in map
  if (!sitemapMap.has('/')) {
    sitemapMap.set('/', {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      images: defaultSiteImages,
    });
  }

  // 2. High-importance Journal routes with specific journal cover images
  const journalConfig: Record<string, { title: string; image: string }> = {
    '/journal': { title: 'Lurnexa Journals Directory', image: '/Logo.png' },
    '/journal/aciet': { title: 'ACIET Journal', image: '/Aciet.png' },
    '/journal/aress': { title: 'ARESS Journal', image: '/Aress.png' },
    '/journal/cims': { title: 'CIMS Journal', image: '/Cimms.png' },
    '/journal/explore': { title: 'Explore Research Journals', image: '/Logo.png' },
    '/journal/iaees': { title: 'IAEES Journal', image: '/iaees.png' },
  };

  Object.entries(journalConfig).forEach(([route, info]) => {
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: route === '/journal' ? 0.9 : 0.85,
      images: [`${baseUrl}${info.image}`, ...defaultSiteImages],
    });
  });

  // 3. Editorial Board routes
  const boards: Record<string, string> = {
    '/EditorialBoard/ACIET': '/Aciet.png',
    '/EditorialBoard/ARESS': '/Aress.png',
    '/EditorialBoard/CIMS': '/Cimms.png',
    '/EditorialBoard/GJPIR': '/Gjpir.png',
    '/EditorialBoard/IAEES': '/iaees.png',
  };

  Object.entries(boards).forEach(([route, coverImg]) => {
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [`${baseUrl}${coverImg}`, ...defaultSiteImages],
    });
  });

  // 5. Dynamic article routes (ensures all research works and their titles are discoverable)
  allArticles.forEach((article) => {
    const route = `/Articles/${slugify(article.title)}`;
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
      images: [`${baseUrl}/Logo.png`],
    });
  });

  // 6. Dynamic textbook routes (Maximum priority for search engine indexing and short-keyword ranking)
  const books = getAllBooks();
  books.forEach((book) => {
    const bookImages = [`${baseUrl}${book.coverImg}`, ...defaultSiteImages];

    // Full URL slug (e.g. /textbooks/principles-of-microeconomics-for-business-and-management)
    const route = `/textbooks/${book.slug}`;
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      images: bookImages,
    });

    // Short URL alias slug if exists (e.g. /textbooks/microeconomics)
    if (book.shortSlug) {
      const shortRoute = `/textbooks/${book.shortSlug}`;
      sitemapMap.set(shortRoute, {
        url: `${baseUrl}${shortRoute}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
        images: bookImages,
      });

      // Exact-match root alias (e.g. /microeconomics)
      const rootAliasRoute = `/${book.shortSlug}`;
      sitemapMap.set(rootAliasRoute, {
        url: `${baseUrl}${rootAliasRoute}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
        images: bookImages,
      });
    }
  });

  // Return the unique list of sitemap URLs as an array
  return Array.from(sitemapMap.values());
}

