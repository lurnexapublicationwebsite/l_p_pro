import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Feedback Form',
  description: 'Provide your feedback to help us improve our publishing services at Lurnexa Publications.',
  openGraph: {
    title: 'Feedback Form | Lurnexa Publications',
    description: 'We value your input. Share your thoughts with us.',
    url: 'https://lurnexa.in/feedback-form',
  },
};

export default function FeedbackFormLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
