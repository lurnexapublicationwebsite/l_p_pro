import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced Research in Economics & Social Sciences (ARESS) | Journal',
  description: 'Advanced Research in Economics & Social Sciences (ARESS) by Lurnexa Publications is a premier double-blind peer-reviewed open-access journal. We publish original research in economics, finance, climate risk, green trade policies, gig economy, platform work, digital financial literacy, and contemporary social studies.',
  keywords: [
    'ARESS Journal',
    'Advanced Research in Economics',
    'Social Sciences Publication',
    'Climate Finance and Green Trade',
    'EU Carbon Border Adjustment Mechanism',
    'Digital Financial Literacy Gen Z',
    'Gig Economy and Social Security Deficits',
    'Public Policy Research Paper',
    'Applied Economics Journal',
    'Fintech and Financial Behavior Studies',
    'Peer Reviewed Social Sciences',
    'Lurnexa Publications ARESS'
  ],
  openGraph: {
    title: 'ARESS Journal | Lurnexa Publications',
    description: 'Engaging with impactful, evidence-based research in economics, climate finance, and social security policies.',
    url: 'https://lurnexa.in/journal/aress',
    siteName: 'Lurnexa Publications',
    images: [
      {
        url: '/Aress.png',
        width: 600,
        height: 800,
        alt: 'ARESS Journal Cover',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARESS Journal | Advanced Economics & Social Sciences Research',
    description: 'Fostering excellence and critical inquiry in international economics, green trade transitions, and inclusive social systems.',
    images: ['/Aress.png'],
  },
  alternates: {
    canonical: '/journal/aress',
  },
};

export default function ARESSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
