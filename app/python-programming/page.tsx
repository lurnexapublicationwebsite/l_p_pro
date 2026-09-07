import BookDetailPage, { generateMetadata as baseGenerateMetadata } from '../textbooks/[slug]/page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return baseGenerateMetadata({
    params: Promise.resolve({ slug: 'python-programming' }),
  });
}

export default async function PythonProgrammingPage() {
  return <BookDetailPage params={Promise.resolve({ slug: 'python-programming' })} />;
}
