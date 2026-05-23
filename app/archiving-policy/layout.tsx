import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archiving Policy',
  description: 'Our policy on long-term digital preservation and accessibility of scholarly content at Lurnexa Publications.',
  openGraph: {
    title: 'Archiving Policy | Lurnexa Publications',
    description: 'Ensuring the long-term preservation and integrity of research data.',
    url: 'https://lurnexa.in/archiving-policy',
  },
};

export default function ArchivingPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
