import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Center for Innovative Management Studies (CIMS) | Journal',
  description: 'Center for Innovative Management Studies (CIMS) by Lurnexa Publications is a premier double-blind peer-reviewed open-access journal. We publish groundbreaking research in management theory, phygital consumer engagement, smart retailing, organizational leadership, global trade fragmentation, supply chain relocation, and platform economy solutions.',
  keywords: [
    'CIMS Journal',
    'Center for Innovative Management Studies',
    'Phygital Consumer Engagement Marketing',
    'Smart Retailing Strategies',
    'Organizational Leadership Research',
    'Supply Chain Relocation India',
    'Global Trade Fragmentation Impacts',
    'US Tariff Wars and Export Impacts',
    'Business Administration and Management',
    'Innovative Corporate Strategy',
    'Peer Reviewed Management Paper',
    'Lurnexa Publications CIMS'
  ],
  openGraph: {
    title: 'CIMS Journal | Lurnexa Publications',
    description: 'Discover pioneering research in innovative management, phygital marketing strategies, and leadership paradigms.',
    url: 'https://lurnexa.in/journal/cims',
    siteName: 'Lurnexa Publications',
    images: [
      {
        url: '/Cimss.png',
        width: 600,
        height: 800,
        alt: 'CIMS Journal Cover',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CIMS Journal | Advanced Management Studies Research',
    description: 'Fostering innovation and sustainable excellence in phygital marketing, corporate governance, and organizational transformation.',
    images: ['/Cimss.png'],
  },
  alternates: {
    canonical: '/journal/cims',
  },
};

export default function CIMSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
