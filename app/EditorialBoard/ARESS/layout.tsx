import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ARESS Editorial Board & Social Sciences Review Panel | Lurnexa',
  description: 'Meet the distinguished members of the Editorial Board for Advanced Research in Economics & Social Sciences (ARESS) at Lurnexa Publications, featuring Dr. Badri Narayanan Gopalakrishnan (NITI Aayog / Boston College), Dr. Aruna Kumar Dash (IBS Hyderabad), Dr. Sumeet Gupta (UPES), and other leading scholars.',
  keywords: [
    'ARESS Editorial Board',
    'Dr Badri Narayanan Gopalakrishnan Lurnexa',
    'Dr Aruna Kumar Dash',
    'Dr Sumeet Gupta UPES',
    'NITI Aayog Fellow Economics',
    'Boston College Economics Faculty',
    'Social Sciences Review Committee',
    'Economics Journal Editors',
    'Peer Review Panel ARESS',
    'Academic Board Members Lurnexa'
  ],
  openGraph: {
    title: 'ARESS Editorial Board | Lurnexa Publications',
    description: 'Distinguished economic scholars and social science researchers steering peer-review standards at Lurnexa Publications.',
    url: 'https://lurnexa.in/EditorialBoard/ARESS',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/EditorialBoard/ARESS',
  },
};

export default function ARESSBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
