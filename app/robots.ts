import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/textbooks/',
          '/Articles/',
          '/journal/',
          '/EditorialBoard/',
          '/gallery/',
          '/Archive/',
          '/aboutus/',
          '/contact/',
          '/services/',
          '/submityourarticle/',
        ],
        disallow: [
          '/dashboard',
          '/EditoralLogins',
          '/Editorial_profile',
          '/api/',
          '/resetPassword',
          '/set-password',
          '/reset-password',
          '/forgot-password',
          '/login',
          '/signup',
          '/comingsoon',
          '/textbooks/portal/login',
          '/textbooks/portal/signup',
          '/textbooks/portal/',
          '/textbooks/store/checkout',
          '/feedback-form',
          '/quotation/admin/',
          '/quotation/login',
          '/quotation/success',
          '/quotation/confirm/',
        ],
      },
      {
        // Explicitly allow image crawling for all bots
        userAgent: 'Googlebot-Image',
        allow: '/',
        disallow: ['/api/', '/dashboard'],
      },
    ],
    sitemap: 'https://lurnexa.in/sitemap.xml',
  };
}
