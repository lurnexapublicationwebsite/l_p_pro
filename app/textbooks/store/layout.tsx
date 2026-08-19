import { Metadata } from 'next';
import { getAllBooks } from '@/lib/data/books';

export const metadata: Metadata = {
  title: 'Lurnexa Bookstore | Buy Academic Textbooks Online India',
  description: 'Browse, preview, and purchase peer-reviewed academic textbooks published by Lurnexa Publications. Machine Learning, DBMS, AI, Microeconomics, Data Streaming & more. Paperback & Digital PDF available.',
  keywords: [
    'Academic Textbooks',
    'Lurnexa Publications',
    'Buy textbooks online India',
    'Machine Learning Book',
    'DBMS Book',
    'Database Management Systems Book',
    'Artificial Intelligence Book',
    'Microeconomics Book',
    'Data Streaming Book',
    'Indian Mineral Import Policy',
    'University textbooks India',
    'Engineering textbooks online',
    'MBA textbooks India',
    'Lurnexa bookstore',
  ],
  openGraph: {
    title: 'Lurnexa Bookstore | Buy Academic Textbooks Online',
    description: 'Browse, preview, and purchase peer-reviewed academic textbooks published by Lurnexa Publications. Paperback & Digital PDF available.',
    url: 'https://lurnexa.in/textbooks/store',
    siteName: 'Lurnexa Publications',
    type: 'website',
    images: [
      {
        url: '/portal_coverpages/ml.jpeg',
        width: 800,
        height: 1000,
        alt: 'Lurnexa Bookstore - Academic Textbooks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lurnexa Bookstore | Buy Academic Textbooks',
    description: 'Browse, preview, and purchase peer-reviewed academic textbooks published by Lurnexa Publications.',
    images: ['/portal_coverpages/ml.jpeg'],
  },
  alternates: {
    canonical: '/textbooks/store',
  },
};

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  // Build ItemList JSON-LD for Google Product Carousel rich results
  const books = getAllBooks();
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Lurnexa Publications Academic Textbooks',
    'description': 'Complete catalog of academic textbooks published by Lurnexa Publications',
    'url': 'https://lurnexa.in/textbooks/store/',
    'numberOfItems': books.length,
    'itemListElement': books.map((book, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'item': {
        '@type': 'Book',
        '@id': `https://lurnexa.in/textbooks/${book.slug}#book`,
        'name': book.title,
        'isbn': book.isbn,
        'author': book.authors.split(',').map((name) => ({
          '@type': 'Person',
          'name': name.trim(),
        })),
        'publisher': {
          '@type': 'Organization',
          'name': 'Lurnexa Publications',
          'url': 'https://lurnexa.in',
        },
        'image': `https://lurnexa.in${book.coverImg}`,
        'description': book.description,
        'numberOfPages': book.pages,
        'inLanguage': 'en',
        'datePublished': book.publishedDate,
        'url': `https://lurnexa.in/textbooks/${book.shortSlug || book.slug}/`,
        'offers': [
          {
            '@type': 'Offer',
            'name': 'Paperback Edition',
            'price': book.price,
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock',
            'seller': {
              '@type': 'Organization',
              'name': 'Lurnexa Publications',
            },
          },
          {
            '@type': 'Offer',
            'name': 'Digital PDF Edition',
            'price': book.digitalPrice,
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock',
            'seller': {
              '@type': 'Organization',
              'name': 'Lurnexa Publications',
            },
          },
        ],
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      {children}
    </>
  );
}
