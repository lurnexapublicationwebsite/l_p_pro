import BookDetailPage, { generateMetadata as baseGenerateMetadata } from '../textbooks/[slug]/page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return baseGenerateMetadata({
    params: Promise.resolve({ slug: 'machine-learning' }),
  });
}

export default async function MachineLearningPage() {
  return <BookDetailPage params={Promise.resolve({ slug: 'machine-learning' })} />;
}
