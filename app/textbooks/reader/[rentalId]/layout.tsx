import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Secure eBook Reader | Lurnexa Publications',
  description: 'Read your rented digital textbook securely online.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
