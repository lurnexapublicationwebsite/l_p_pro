import { MetadataRoute } from 'next';
import { allArticles, slugify } from '@/lib/data/articles';
import fs from 'fs';
import path from 'path';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lurnexa.in';

  // Map to deduplicate routes by their path
  const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

  // 1. Dynamically generate all static routes from the app folder structure
  const walk = (dir: string, prefix = '') => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Skip special folders that do not map to static routes or contain dynamic parameters
        if (['api', 'providers', 'components', 'styles', 'public'].includes(entry.name)) continue;
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
    });
  }

  // 2. High-importance Journal routes
  const journals = ['', '/aciet', '/aress', '/cims', '/explore', '/iaees'];
  journals.forEach((subRoute) => {
    const route = `/journal${subRoute}`;
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: subRoute === '' ? 0.9 : 0.85,
    });
  });

  // 3. Editorial Board routes
  const boards = ['/ACIET', '/ARESS', '/CIMS', '/GJPIR', '/IAEES'];
  boards.forEach((subRoute) => {
    const route = `/EditorialBoard${subRoute}`;
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  });

  // 4. Auth & User routes (low importance for SEO indexing but good to keep in sitemap)
  const auths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/resetPassword',
    '/set-password',
    '/dashboard',
    '/EditoralLogins',
  ];
  auths.forEach((route) => {
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    });
  });

  // 5. Dynamic article routes (ensures all research works are discoverable immediately)
  allArticles.forEach((article) => {
    const route = `/Articles/${slugify(article.title)}`;
    sitemapMap.set(route, {
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  });

  // Return the unique list of sitemap URLs as an array
  return Array.from(sitemapMap.values());
}
