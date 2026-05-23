import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Peer Review Policy',
  description: 'Our commitment to a rigorous double-blind peer-review process to ensure the highest academic standards.',
  openGraph: {
    title: 'Peer Review Policy | Lurnexa Publications',
    description: 'A transparent and rigorous evaluation process for research.',
    url: 'https://lurnexa.in/peer-review-policy',
  },
};

export default function PeerReviewPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
