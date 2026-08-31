import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Institute of Advanced Electrical & Electronics Studies (IAEES) | Journal',
  description: 'Institute of Advanced Electrical & Electronics Studies (IAEES) by Lurnexa Publications is a premier double-blind peer-reviewed open-access journal. We publish original research in electrical systems, electronics engineering, NFC mobile payment systems, IoT integrations, smart retail infrastructures, power systems, and signal processing.',
  keywords: [
    'IAEES Journal',
    'Institute of Advanced Electrical and Electronics Studies',
    'NFC Mobile Payment Systems',
    'Internet of Things IoT Applications',
    'Smart Retail Infrastructure Research',
    'Electrical Systems Engineering',
    'Power Grid and Energy Technologies',
    'Signal Processing and Telecommunication',
    'Peer Reviewed Electronics Journal',
    'Electronic Automation Systems Paper',
    'Lurnexa Publications IAEES'
  ],
  openGraph: {
    title: 'IAEES Journal | Lurnexa Publications',
    description: 'Explore the latest advancements, applied research, and engineering innovations in electrical and electronics studies.',
    url: 'https://lurnexa.in/journal/iaees',
    siteName: 'Lurnexa Publications',
    images: [
      {
        url: '/Iaees.png',
        width: 600,
        height: 800,
        alt: 'IAEES Journal Cover',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IAEES Journal | Advanced Electrical & Electronics Research',
    description: 'Fostering excellence, scientific depth, and global impact in next-generation electrical grids, smart retail NFC systems, and IoT.',
    images: ['/Iaees.png'],
  },
  alternates: {
    canonical: '/journal/iaees',
  },
};

export default function IAEESLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
