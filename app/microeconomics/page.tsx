import BookDetailPage, { generateMetadata as baseGenerateMetadata } from '../textbooks/[slug]/page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return baseGenerateMetadata({
    params: Promise.resolve({ slug: 'microeconomics' }),
  });
}

export default async function MicroeconomicsPage() {
  return <BookDetailPage params={Promise.resolve({ slug: 'microeconomics' })} />;
}
