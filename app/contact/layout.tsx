import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Lurnexa Publications | Support & Partnerships',
  description: 'Connect with Lurnexa Publications for scholarly publishing inquiries, author support, or partnership opportunities. Our team is dedicated to providing excellence in academic communication and collaboration.',
  keywords: ['Contact Lurnexa', 'Scholarly Support', 'Journal Inquiry', 'Lurnexa Publications Help', 'Academic Partnerships'],
  openGraph: {
    title: 'Contact Lurnexa Publications | Support & Partnerships',
    description: 'Connect with Lurnexa Publications for scholarly publishing inquiries, author support, or research collaboration.',
    url: 'https://lurnexa.in/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
