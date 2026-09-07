import BookDetailPage, { generateMetadata as baseGenerateMetadata } from '../textbooks/[slug]/page';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return baseGenerateMetadata({
    params: Promise.resolve({ slug: 'nosql-mongodb' }),
  });
}

export default async function NosqlMongodbPage() {
  return <BookDetailPage params={Promise.resolve({ slug: 'nosql-mongodb' })} />;
}
