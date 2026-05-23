import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Editorial Board',
  description: 'Meet the distinguished members of the Editorial Board at Lurnexa Publications. Our board consists of experts from various technology and management domains.',
  openGraph: {
    title: 'Editorial Board | Lurnexa Publications',
    description: 'Expert editorial oversight for high-quality research publications.',
    url: 'https://lurnexa.in/EditorialBoard',
  },
};

export default function EditorialBoardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
