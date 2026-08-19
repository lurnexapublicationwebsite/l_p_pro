import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/EditoralLogins',
          '/Editorial_profile',
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
