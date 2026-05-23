import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Retraction Policy',
  description: 'Procedures for retracting or correcting published scholarly work in accordance with ethical standards.',
  openGraph: {
    title: 'Retraction Policy | Lurnexa Publications',
    description: 'Guidelines for correcting the scholarly record.',
    url: 'https://lurnexa.in/retraction-policy',
  },
};

export default function RetractionPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
