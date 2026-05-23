import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced Computational Intelligence & Emerging Technologies (ACIET) | Journal',
  description: 'Advanced Computational Intelligence & Emerging Technologies (ACIET) by Lurnexa Publications is a premier, double-blind peer-reviewed open-access journal. We publish state-of-the-art research in Artificial Intelligence (AI), Machine Learning (ML), Robotics, Cybersecurity, and Cognitive Computing.',
  keywords: [
    'ACIET Journal',
    'Advanced Computational Intelligence',
    'Emerging Technologies Research',
    'Artificial Intelligence Publication',
    'Machine Learning Research Paper',
    'Deep Learning Systems',
    'Cognitive Computing',
    'Cybersecurity and Blockchain',
    'Internet of Things IoT',
    'Edge and Cloud Computing',
    'Quantum Computing',
    'Computer Science Peer Reviewed Journal',
    'Submit Artificial Intelligence Paper',
    'Lurnexa Publications ACIET'
  ],
  openGraph: {
    title: 'ACIET Journal | Lurnexa Publications',
    description: 'Pioneering intelligence and emerging digital technologies through high-impact research publishing.',
    url: 'https://lurnexa.in/journal/aciet',
    siteName: 'Lurnexa Publications',
    images: [
      {
        url: '/Aciet2.png',
        width: 600,
        height: 800,
        alt: 'ACIET Journal Cover',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ACIET Journal | Advanced Computational Intelligence Research',
    description: 'Fostering excellence and innovation in artificial intelligence, machine learning, and emerging digital technologies.',
    images: ['/Aciet2.png'],
  },
  alternates: {
    canonical: '/journal/aciet',
  },
};

export default function ACIETLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
