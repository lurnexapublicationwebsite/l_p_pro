import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Article Processing Charges (APC)',
  description: 'Information regarding the article processing charges for publishing in Lurnexa Journals. Transparent and fair pricing for academic excellence.',
  openGraph: {
    title: 'Article Processing Charges | Lurnexa Publications',
    description: 'Details on publication fees and transparent APC policies.',
    url: 'https://lurnexa.in/article-processing-charges',
  },
};

export default function APCPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
