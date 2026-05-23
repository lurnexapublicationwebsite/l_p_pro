import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IAEES Editorial Board & Electrical Engineering Board | Lurnexa',
  description: 'Meet the distinguished members of the Editorial Board for Institute of Advanced Electrical & Electronics Studies (IAEES) at Lurnexa Publications, featuring Dr. Umesh Chandra Pati (Professor, NIT Rourkela), Dr. Arvind R. Singh (China), Dr. CH. Naga Sai Kalyan (VVIT Guntur), and other electrical engineering experts.',
  keywords: [
    'IAEES Editorial Board',
    'Dr Umesh Chandra Pati NIT Rourkela',
    'Dr Arvind R Singh',
    'Dr CH Naga Sai Kalyan',
    'NIT Rourkela Electronics Faculty',
    'VVIT Guntur Electrical Department',
    'Electrical Engineering Editorial Board',
    'Peer Review Panel IAEES',
    'Academic Board Members Lurnexa'
  ],
  openGraph: {
    title: 'IAEES Editorial Board | Lurnexa Publications',
    description: 'Distinguished academic editors and electronics engineering research experts steering the peer-review panel at IAEES.',
    url: 'https://lurnexa.in/EditorialBoard/IAEES',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/EditorialBoard/IAEES',
  },
};

export default function IAEESBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
