import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Publication Ethics Policy',
  description: 'Standards of ethical behavior for authors, editors, and reviewers at Lurnexa Publications.',
  openGraph: {
    title: 'Publication Ethics | Lurnexa Publications',
    description: 'Upholding the highest standards of integrity in scholarly publishing.',
    url: 'https://lurnexa.in/publications-ethics-policy',
  },
};

export default function EthicsPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
