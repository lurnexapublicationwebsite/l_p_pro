import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GJPIR Editorial Board & Flagship Journal Committee | Lurnexa',
  description: 'Meet the distinguished members of the Editorial Board for Lurnexa Publications flagship Global Journal for Progressive Innovation and Research (GJPIR), featuring Dr. Anand Shukla (Editor-in-Chief, LPU) and Dr. Badri Narayanan Gopalakrishnan (Co-Editor-in-Chief, NITI Aayog / Boston College).',
  keywords: [
    'GJPIR Editorial Board',
    'Global Journal for Progressive Innovation and Research (GJPIR) Editorial',
    'Dr Anand Shukla Editor in Chief',
    'Dr Badri Narayanan Gopalakrishnan',
    'NITI Aayog Fellow Lurnexa',
    'LPU Dean Computer Applications',
    'Progressive Innovation Research Editors',
    'Flagship Journal Review Committee',
    'Peer Review Panel GJPIR',
    'Lurnexa Publications Flagship Board'
  ],
  openGraph: {
    title: 'GJPIR Editorial Board | Lurnexa Publications',
    description: 'The premier steering committee and peer-review board for our flagship journal GJPIR, bridging technology, science, economics, and management.',
    url: 'https://lurnexa.in/EditorialBoard/GJPIR',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/EditorialBoard/GJPIR',
  },
};

export default function GJPIRBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
