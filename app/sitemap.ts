import { MetadataRoute } from 'next';
import { allArticles, slugify } from '@/lib/data/articles';
import { getAllBooks } from '@/lib/data/books';
import fs from 'fs';
import path from 'path';

// Journal cover image mapping for reuse
const journalCoverMap: Record<string, string> = {
  'ACIET': '/Aciet.png',
  'ARESS': '/Aress.png',
  'CIMS': '/Cimss.png',
  'GJPIR': '/Gjpir.png',
  'IAEES': '/Iaees.png',
};

// Routes that should never appear in the sitemap
const EXCLUDED_ROUTES = new Set([
  '/comingsoon',
  '/textbooks/portal',
  '/textbooks/portal/login',
  '/textbooks/portal/signup',
  '/textbooks/store/checkout',
  '/feedback-form',
  '/quotation/admin',
  '/quotation/admin/books',
  '/quotation/admin/dashboard',
  '/quotation/admin/forgot-password',
  '/quotation/admin/login',
  '/quotation/admin/login/verify',
  '/quotation/admin/orders',
  '/quotation/admin/quotations',
  '/quotation/admin/requests',
  '/quotation/admin/settings',
  '/quotation/login',
  '/quotation/success',
]);

// Routes already excluded by folder-name skip in walk()
// (dashboard, EditoralLogins, login, signup, forgot-password, reset-password, resetPassword, set-password, api, providers)

/**
 * Scan a directory for image files and return their public URLs.
 */
function scanImages(dirPath: string, publicPrefix: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  const images: string[] = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile() && /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(entry.name)) {
      images.push(`${publicPrefix}/${entry.name}`);
    } else if (entry.isDirectory()) {
      // Recurse into subdirectories
      images.push(...scanImages(path.join(dirPath, entry.name), `${publicPrefix}/${entry.name}`));
    }
  }
  return images;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lurnexa.in';
  const publicDir = path.join(process.cwd(), 'public');

  // Map to deduplicate routes by their path
  const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

  // ── Global site images (appear on every major page) ──
  const defaultSiteImages = [
    `${baseUrl}/Logo.png`,
    `${baseUrl}/founder.jpeg`,
    `${baseUrl}/co-founder.jpg`,
  ];

  // ── All public images for comprehensive discovery ──
  const allPublicImages = scanImages(publicDir, baseUrl).filter(
    (img) => !img.includes('/media/') && !img.includes('/portal_textbooks/')
  );

  // ── 1. Dynamic static route discovery from app folder ──
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
          const routePath = `${prefix}/${entry.name.replace(/\.tsx?$/, '')}`;
          const cleanRoute = routePath
            .replace(/\/page$/, '')
            .replace(/\/index$/, '')
            .replace(/\/+/g, '/');
          
          const finalRoute = cleanRoute === '' ? '/' : cleanRoute;

          // Skip excluded routes
          if (EXCLUDED_ROUTES.has(finalRoute)) continue;

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

  // ── Ensure root route is in map ──
  if (!sitemapMap.has('/')) {
    sitemapMap.set('/', {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [...allPublicImages.slice(0, 20), ...defaultSiteImages],
    });
  } else {
    // Enrich root with all major images
    sitemapMap.set('/', {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
      images: [...allPublicImages.slice(0, 20), ...defaultSiteImages],
    });
  }

  // ── 2. Journal routes with specific journal cover images ──
  const journalConfig: Record<string, { title: string; image: string }> = {
    '/journal': { title: 'Lurnexa Journals Directory', image: '/Logo.png' },
    '/journal/aciet': { title: 'ACIET Journal - Advanced Computational Intelligence & Emerging Technologies', image: '/Aciet.png' },
    '/journal/aress': { title: 'ARESS Journal - Advanced Research in Economics & Social Sciences', image: '/Aress.png' },
    '/journal/cims': { title: 'CIMS Journal - Center for Innovative Management Studies', image: '/Cimss.png' },
    '/journal/explore': { title: 'Explore Research Journals - GJPIR', image: '/Logo.png' },
    '/journal/iaees': { title: 'IAEES Journal - Institute of Advanced Electrical & Electronics Studies', image: '/Iaees.png' },
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

  // ── 3. Editorial Board routes (all 6 including GJPIR) ──
  const boards: Record<string, string> = {
    '/EditorialBoard/ACIET': '/Aciet.png',
    '/EditorialBoard/ARESS': '/Aress.png',
    '/EditorialBoard/CIMS': '/Cimss.png',
    '/EditorialBoard/GJPIR': '/Gjpir.png',
    '/EditorialBoard/IAEES': '/Iaees.png',
  };

  Object.entries(boards).forEach(([route, coverImg]) => {
    // Scan editorial member images for this board
    const boardKey = route.split('/').pop()!.toLowerCase();
    const editorialImagesDir = path.join(publicDir, 'editorial-images', boardKey);
    const memberImages = scanImages(editorialImagesDir, `${baseUrl}/editorial-images/${boardKey}`);

    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
      images: [
        `${baseUrl}${coverImg}`,
        ...memberImages.map(img => img.startsWith('http') ? img : `${baseUrl}${img}`),
        ...defaultSiteImages,
      ],
    });
  });

  // ── 4. Gallery page with ALL gallery images ──
  const galleryDir = path.join(publicDir, 'gallery');
  const galleryImages = scanImages(galleryDir, `${baseUrl}/gallery`);
  // Also include standalone editorial-images photos
  const editorialRootImages = scanImages(
    path.join(publicDir, 'editorial-images'),
    `${baseUrl}/editorial-images`
  );

  sitemapMap.set('/gallery', {
    url: `${baseUrl}/gallery`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
    images: [...galleryImages, ...editorialRootImages, ...defaultSiteImages],
  });

  // ── 5. Dynamic article routes with journal-specific images ──
  allArticles.forEach((article) => {
    const route = `/Articles/${slugify(article.title)}`;
    const journalImage = journalCoverMap[article.subJournal] || '/Logo.png';

    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.85,
      images: [
        `${baseUrl}${journalImage}`,
        `${baseUrl}/Logo.png`,
      ],
    });
  });

  // ── 6. Articles listing page ──
  const articleListImages = Object.values(journalCoverMap).map(img => `${baseUrl}${img}`);
  sitemapMap.set('/Articles', {
    url: `${baseUrl}/Articles`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
    images: [...articleListImages, ...defaultSiteImages],
  });

  // ── 7. Dynamic textbook routes (maximum priority) ──
  const books = getAllBooks();
  const allBookCoverImages = books.map(b => `${baseUrl}${b.coverImg}`);

  books.forEach((book) => {
    const bookImages = [`${baseUrl}${book.coverImg}`, ...defaultSiteImages];

    // Full URL slug
    const route = `/textbooks/${book.slug}`;
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
      images: bookImages,
    });

    // Short URL alias slug if exists
    if (book.shortSlug) {
      const shortRoute = `/textbooks/${book.shortSlug}`;
      sitemapMap.set(shortRoute, {
        url: `${baseUrl}${shortRoute}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
        images: bookImages,
      });

      // Exact-match root alias
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

  // ── 8. Textbook Store page with all book covers ──
  sitemapMap.set('/textbooks/store', {
    url: `${baseUrl}/textbooks/store`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.95,
    images: [...allBookCoverImages, ...defaultSiteImages],
  });

  // ── 9. Textbooks listing page ──
  sitemapMap.set('/textbooks', {
    url: `${baseUrl}/textbooks`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.95,
    images: [...allBookCoverImages, ...defaultSiteImages],
  });

  // ── 10. Archive page ──
  sitemapMap.set('/Archive', {
    url: `${baseUrl}/Archive`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: [...articleListImages, ...defaultSiteImages],
  });

  // ── 11. About Us page with founder/Co-Founder images ──
  sitemapMap.set('/aboutus', {
    url: `${baseUrl}/aboutus`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
    images: [
      `${baseUrl}/founder.jpeg`,
      `${baseUrl}/co-founder.jpg`,
      `${baseUrl}/Logo.png`,
    ],
  });

  // ── 12. Contact page ──
  sitemapMap.set('/contact', {
    url: `${baseUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
    images: defaultSiteImages,
  });

  // ── 13. Services page ──
  sitemapMap.set('/services', {
    url: `${baseUrl}/services`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
    images: defaultSiteImages,
  });

  // ── 14. Submit Your Article page ──
  sitemapMap.set('/submityourarticle', {
    url: `${baseUrl}/submityourarticle`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.85,
    images: defaultSiteImages,
  });

  // ── 15. Policy pages (important for trust signals) ──
  const policyPages = [
    '/privacy-policy',
    '/terms-and-conditions',
    '/terms-of-service',
    '/refund-policy',
    '/shipping-policy',
    '/peer-review-policy',
    '/plagiarism-policy',
    '/archiving-policy',
    '/article-processing-charges',
    '/author-guidelines',
    '/conflict-of-interest-policy',
    '/copyright-licensing-policy',
    '/publications-ethics-policy',
    '/retraction-policy',
  ];

  policyPages.forEach((route) => {
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
      images: [`${baseUrl}/Logo.png`],
    });
  });

  // ── 16. Subject-specific textbook landing pages ──
  const subjectPages = [
    { route: '/machine-learning', image: '/portal_coverpages/ml.jpeg' },
    { route: '/dbms', image: '/portal_coverpages/dbms.jpeg' },
    { route: '/artificial-intelligence', image: '/portal_coverpages/ai.jpeg' },
  ];

  subjectPages.forEach(({ route, image }) => {
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      images: [`${baseUrl}${image}`, ...defaultSiteImages],
    });
  });

  // ── 17. Company page ──
  sitemapMap.set('/company', {
    url: `${baseUrl}/company`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
    images: defaultSiteImages,
  });

  // ── Remove excluded routes that may have been added by walk() ──
  EXCLUDED_ROUTES.forEach((route) => sitemapMap.delete(route));

  // Return the unique list of sitemap URLs as an array
  return Array.from(sitemapMap.values());
}
