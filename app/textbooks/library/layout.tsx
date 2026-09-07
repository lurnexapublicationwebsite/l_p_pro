import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Digital Library | Lurnexa Publications',
  description: 'Access your rented and purchased digital academic textbooks online. Read seamlessly in browser.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LibraryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
