import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Author Guidelines',
  description: 'Comprehensive guidelines for authors submitting research papers to Lurnexa Publications. Includes formatting, structure, and ethical requirements.',
  openGraph: {
    title: 'Author Guidelines | Lurnexa Publications',
    description: 'Prepare your manuscript with our detailed author instructions.',
    url: 'https://lurnexa.in/author-guidelines',
  },
};

export default function AuthorGuidelinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
