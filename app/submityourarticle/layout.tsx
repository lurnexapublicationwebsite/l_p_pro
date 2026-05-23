import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Your Article',
  description: 'Submit your research paper to Lurnexa Publications. Our streamlined submission portal ensures a smooth process for authors.',
  openGraph: {
    title: 'Submit Article | Lurnexa Publications',
    description: 'Call for papers: Submit your original research for publication.',
    url: 'https://lurnexa.in/submityourarticle',
  },
};

export default function SubmitArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
