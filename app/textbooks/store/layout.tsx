import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lurnexa Bookstore | Buy Academic Textbooks',
  description: 'Browse, preview, and purchase peer-reviewed academic textbooks and educational resources published by Lurnexa Publications.',
  keywords: ['Academic Textbooks', 'Lurnexa Publications', 'Machine Learning Book', 'Database Management Systems Book', 'Indian Mineral Import Policy'],
  openGraph: {
    title: 'Lurnexa Bookstore | Buy Academic Textbooks',
    description: 'Browse, preview, and purchase peer-reviewed academic textbooks and educational resources published by Lurnexa Publications.',
    url: 'https://lurnexa.in/textbooks/store',
    siteName: 'Lurnexa Publications',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lurnexa Bookstore | Buy Academic Textbooks',
    description: 'Browse, preview, and purchase peer-reviewed academic textbooks and educational resources published by Lurnexa Publications.',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
