import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conflict of Interest Policy',
  description: 'Our policies on disclosing and managing potential conflicts of interest in academic publishing.',
  openGraph: {
    title: 'Conflict of Interest Policy | Lurnexa Publications',
    description: 'Ensuring transparency and objectivity in research reporting.',
    url: 'https://lurnexa.in/conflict-of-interest-policy',
  },
};

export default function COIPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
