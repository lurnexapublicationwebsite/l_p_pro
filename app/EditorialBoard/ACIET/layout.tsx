import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACIET Editorial Board & Review Committee | Lurnexa Publications',
  description: 'Meet the distinguished members of the Editorial Board for Advanced Computational Intelligence & Emerging Technologies (ACIET) at Lurnexa Publications, featuring Dr. Anand Shukla (LPU), Dr. Chandrashekar Jatoth (NIT Raipur), and other global experts.',
  keywords: [
    'ACIET Editorial Board',
    'Dr Anand Shukla Lurnexa',
    'Dr Chandrashekar Jatoth',
    'ACIET Editors in Chief',
    'Lovely Professional University Computer Applications',
    'NIT Raipur Information Technology',
    'Computer Science Editorial Board',
    'Peer Review Panel ACIET',
    'Scientific Review Committee',
    'Scholarly Journal Editors',
    'Lurnexa Publications Board'
  ],
  openGraph: {
    title: 'ACIET Editorial Board | Lurnexa Publications',
    description: 'Distinguished expert review panel and board of editors driving high standards of academic research in emerging technologies and computing.',
    url: 'https://lurnexa.in/EditorialBoard/ACIET',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/EditorialBoard/ACIET',
  },
};

export default function ACIETBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
