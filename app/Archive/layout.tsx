import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Research Archive',
  description: 'Explore the full history of published volumes and issues at Lurnexa Publications. Preserving knowledge for the future.',
  openGraph: {
    title: 'Research Archive | Lurnexa Publications',
    description: 'Browse our complete catalog of scholarly publications.',
    url: 'https://lurnexa.in/Archive',
  },
};

export default function ArchiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
