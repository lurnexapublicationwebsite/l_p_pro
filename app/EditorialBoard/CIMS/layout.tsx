import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CIMS Editorial Board & Management Studies Board | Lurnexa',
  description: 'Meet the distinguished members of the Editorial Board for Center for Innovative Management Studies (CIMS) at Lurnexa Publications, featuring Dr. Modekurti Venkata Surya Kameshwar Rao (IBS Hyderabad), Dr. Srikanth Potharla (IBS Hyderabad), Dr. Susanta K Mishra (Centurion University), Dr. Muhammed Shafi M K (NIT Warangal), and other global management experts.',
  keywords: [
    'CIMS Editorial Board',
    'Dr Modekurti Venkata Surya Kameshwar Rao',
    'Dr Srikanth Potharla Lurnexa',
    'Dr Susanta K Mishra Centurion University',
    'Dr Muhammed Shafi M K NIT Warangal',
    'IBS Hyderabad Management Faculty',
    'NIT Warangal Management Studies',
    'Management Editorial Board',
    'Peer Review Panel CIMS',
    'Academic Board Members Lurnexa'
  ],
  openGraph: {
    title: 'CIMS Editorial Board | Lurnexa Publications',
    description: 'Distinguished academic editors and business administration research experts steering the peer-review panel at CIMS.',
    url: 'https://lurnexa.in/EditorialBoard/CIMS',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/EditorialBoard/CIMS',
  },
};

export default function CIMSBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
