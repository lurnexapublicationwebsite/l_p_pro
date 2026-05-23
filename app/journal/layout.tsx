import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Global Journals & Publications',
  description: 'Explore our flagship journal GJPIR and other academic publications at Lurnexa. Bridging technology, management, and research.',
  openGraph: {
    title: 'Journal | Lurnexa Publications',
    description: 'Academic journals and research publications hub.',
    url: 'https://lurnexa.in/journal',
  },
};

export default function PublicationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
