import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academic Textbooks',
  description: 'Manage and track the editorial progress of upcoming academic textbooks at Lurnexa Publications.',
  openGraph: {
    title: 'Textbooks | Lurnexa Publications',
    description: 'Upcoming academic textbooks and educational resources.',
    url: 'https://lurnexa.in/textbooks',
  },
};

export default function TextbooksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
