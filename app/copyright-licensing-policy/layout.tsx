import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright & Licensing Policy',
  description: 'Details on copyright ownership and open access licensing (Creative Commons) for publications at Lurnexa.',
  openGraph: {
    title: 'Copyright & Licensing | Lurnexa Publications',
    description: 'Protecting author rights and promoting open access.',
    url: 'https://lurnexa.in/copyright-licensing-policy',
  },
};

export default function CopyrightPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
