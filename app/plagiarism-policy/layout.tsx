import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plagiarism Policy',
  description: 'Zero tolerance policy towards plagiarism. How we detect and handle cases of research misconduct.',
  openGraph: {
    title: 'Plagiarism Policy | Lurnexa Publications',
    description: 'Ensuring originality and intellectual honesty in scholarly work.',
    url: 'https://lurnexa.in/plagiarism-policy',
  },
};

export default function PlagiarismPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
