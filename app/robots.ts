import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: 'Googlebot',
        allow: ['/', '/Articles/', '/pdfs/', '/htm/'],
        disallow: [
          '/dashboard/',
          '/EditoralLogins/',
          '/Editorial_profile/',
          '/api/',
          '/resetPassword',
          '/set-password',
          '/reset-password',
        ],
      },
      {
        userAgent: 'Googlebot-Scholar',
        allow: ['/', '/Articles/', '/pdfs/', '/htm/'],
        disallow: [
          '/dashboard/',
          '/EditoralLogins/',
          '/Editorial_profile/',
          '/api/',
          '/resetPassword',
          '/set-password',
          '/reset-password',
        ],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/EditoralLogins/',
          '/Editorial_profile/',
          '/api/',
          '/resetPassword',
          '/set-password',
          '/reset-password',
        ],
      },
    ],
    sitemap: 'https://lurnexa.in/sitemap.xml',
  };
}
