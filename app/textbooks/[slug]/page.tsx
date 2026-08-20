import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBooks, getBookBySlug } from '@/lib/data/books';
import { ArrowLeft } from 'lucide-react';
import BookDetailClient from '@/components/Textbooks/BookDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const books = getAllBooks();
  const paramsList: { slug: string }[] = [];
  books.forEach((book) => {
    paramsList.push({ slug: book.slug });
    if (book.shortSlug) {
      paramsList.push({ slug: book.shortSlug });
    }
  });
  return paramsList;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    return {
      title: 'Book Not Found | Lurnexa Publications',
    };
  }

  const primaryKeyword = book.shortSlug
    ? book.shortSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : book.code;
  const pageUrl = `https://lurnexa.in/textbooks/${book.slug}`;
  const ogImageUrl = `https://lurnexa.in${book.coverImg}`;

  return {
    title: `${primaryKeyword} Book - ${book.title} (ISBN: ${book.isbn}) | Lurnexa Publications`,
    description: `Official ${primaryKeyword} textbook by ${book.authors}. Covers core algorithms, theory and practical implementations. Buy Paperback (₹${book.price}) or Digital PDF (₹${book.digitalPrice}) online on Lurnexa. Paperback ISBN: ${book.isbn}. Digital ISBN: ${book.isbnDigital}.`,
    keywords: book.keywords,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${primaryKeyword} Textbook | ${book.title} | Lurnexa`,
      description: book.description,
      url: pageUrl,
      siteName: 'Lurnexa Publications',
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 1000,
          alt: book.title,
        },
      ],
      locale: 'en_IN',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${primaryKeyword} Book | ${book.title}`,
      description: book.description,
      images: [ogImageUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) {
    notFound();
  }

  const allBooks = getAllBooks();
  const relatedBooks = allBooks.filter((b) => b.id !== book.id).slice(0, 3);
  const pageUrl = `https://lurnexa.in/textbooks/${book.slug}`;

  // Structured Data Schema.org JSON-LD for Google Rich Results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Book',
        '@id': `${pageUrl}#book`,
        'name': book.title,
        'isbn': book.isbn,
        'workExample': [
          {
            '@type': 'Book',
            'isbn': book.isbn,
            'bookFormat': 'https://schema.org/Paperback',
          },
          {
            '@type': 'Book',
            'isbn': book.isbnDigital,
            'bookFormat': 'https://schema.org/EBook',
          },
        ],
        'numberOfPages': book.pages,
        'inLanguage': 'en',
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
        'genre': book.domain,
        'datePublished': book.publishedDate,
        'offers': [
          {
            '@type': 'Offer',
            'name': 'Paperback Edition',
            'price': book.price,
            'priceCurrency': 'INR',
            'availability': 'https://schema.org/InStock',
            'url': `${pageUrl}?format=physical`,
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
            'url': `${pageUrl}?format=soft`,
            'seller': {
              '@type': 'Organization',
              'name': 'Lurnexa Publications',
            },
          }
        ],
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': 'https://lurnexa.in',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Textbooks Store',
            'item': 'https://lurnexa.in/textbooks/store',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': book.title,
            'item': pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* Google Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] pb-16">
        {/* Navigation Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
            <Link
              href="/textbooks/store"
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-fuchsia-600 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Textbook Store
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200/50 rounded-full">
                Paperback & Digital PDF Available
              </span>
            </div>
          </div>
        </header>

        {/* Breadcrumb Header */}
        <div className="bg-white border-b border-slate-100 py-3">
          <div className="max-w-6xl mx-auto px-4 text-xs text-slate-500 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:underline">Home</Link>
            <span>/</span>
            <Link href="/textbooks/store" className="hover:underline">Textbooks</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-md">{book.title}</span>
          </div>
        </div>

        {/* Client Interactive Area */}
        <main className="max-w-6xl mx-auto px-4 pt-8">
          <BookDetailClient book={book} relatedBooks={relatedBooks} />
        </main>
      </div>
    </>
  );
}
