import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Sub Division Journals | Lurnexa Publications',
  description: 'Explore the multidisciplinary peer-reviewed open-access journal subdivisions under Lurnexa Publications, spanning advanced computational intelligence, modern business management, applied economics, and electronics studies.',
  keywords: [
    'Explore Academic Journals',
    'Lurnexa Journal Subdivisions',
    'Open Access Scholarly Publishing',
    'Scientific Research Papers Index',
    'ACIET Aress Cims Iaees Journals',
    'Peer Reviewed Research Directories',
    'Techno-Management Journals India'
  ],
  openGraph: {
    title: 'Explore Journals | Lurnexa Publications',
    description: 'Browse our specialized open-access peer-reviewed scientific journals across engineering, computing, management, and social sciences.',
    url: 'https://lurnexa.in/journal/explore',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/journal/explore',
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
