import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Articles & Publications',
  description: 'Explore the latest research articles, journals, and publications from Lurnexa Publications. Covering technology, management, and innovation.',
  openGraph: {
    title: 'Research Articles | Lurnexa Publications',
    description: 'Browse our collection of academic journals and research papers.',
    url: 'https://lurnexa.in/Articles',
  },
  alternates: {
    canonical: '/Articles',
  },
};

export default function ArticlesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
