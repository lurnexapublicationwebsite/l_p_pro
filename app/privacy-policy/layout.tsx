import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy & Terms',
  description: 'Learn about how Lurnexa Publications handles your data and the terms governing our services.',
  openGraph: {
    title: 'Privacy & Terms | Lurnexa Publications',
    description: 'Our commitment to user data protection and service excellence.',
    url: 'https://lurnexa.in/privacy-policy',
  },
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
