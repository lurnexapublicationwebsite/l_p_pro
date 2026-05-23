import { Metadata } from 'next';
import { getArticleBySlug } from '@/lib/data/articles';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | Lurnexa Publications',
      description: 'The requested academic research article could not be found on Lurnexa Publications.',
    };
  }

  const title = `${article.title} | Research Article`;
  const description = `Read the research paper: "${article.title}" by ${article.author}. Published in ${article.journal} (${article.subJournal}) under Lurnexa Publications. ${article.pages}.`;
  
  // Create targeted keywords for this article
  const keywords = [
    article.title,
    article.author,
    article.category,
    article.subJournal,
    article.journal,
    'Lurnexa Publications',
    'Scholarly Paper',
    'Research Article',
    'Academic Manuscript',
    'Open Access Journal',
    'Scientific Publication'
  ];

  // Parse individual authors for Google Scholar compliance (requires a tag per author)
  const authors = article.author
    .split(/[,;&]/)
    .map((a: string) => a.trim())
    .filter((a: string) => a.length > 0);

  // Infer the journal title
  const journalTitle = article.journal === 'GJPIR' 
    ? 'Global Journal for Progressive Innovation and Research (GJPIR)' 
    : article.journal;

  // Infer page numbers if available (e.g. "1-19 Pages" -> pageStart = 1, pageEnd = 19)
  const pagesMatch = article.pages.match(/(\d+)\s*-\s*(\d+)/);
  const pageStart = pagesMatch ? pagesMatch[1] : '1';
  const pageEnd = pagesMatch ? pagesMatch[2] : '1';

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: `https://lurnexa.in/Articles/${slug}`,
      type: 'article',
      authors: [article.author],
      siteName: 'Lurnexa Publications',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `/Articles/${slug}`,
    },
    other: {
      // Google Scholar / Academic Citation Metadata
      'citation_title': article.title,
      'citation_author': authors, // Generates a separate meta tag for each author element in the array
      'citation_publication_date': '2026/01/01', // Conforms to standard Google Scholar date formatting YYYY/MM/DD
      'citation_journal_title': journalTitle,
      'citation_pdf_url': `https://lurnexa.in${article.downloadUrl}`,
      'citation_abstract': article.description || article.title,
      'citation_keywords': keywords.join(', '),
      'citation_firstpage': pageStart,
      'citation_lastpage': pageEnd,
    },
  };
}

export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return <>{children}</>;
  }

  // Parse individual authors for Schema JSON-LD representation
  const authors = article.author
    .split(/[,;&]/)
    .map((a: string) => a.trim())
    .filter((a: string) => a.length > 0)
    .map((a: string) => ({
      '@type': 'Person',
      'name': a,
    }));

  const pagesMatch = article.pages.match(/(\d+)\s*-\s*(\d+)/);
  const pageStart = pagesMatch ? pagesMatch[1] : '1';
  const pageEnd = pagesMatch ? pagesMatch[2] : '1';

  // Schema.org ScholarlyArticle JSON-LD structured data for Google Rich Snippets
  const scholarlyArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    '@id': `https://lurnexa.in/Articles/${slug}#scholarlyarticle`,
    'headline': article.title,
    'description': article.description || article.title,
    'author': authors,
    'datePublished': '2026-01-01',
    'isPartOf': {
      '@type': 'Periodical',
      'name': article.journal === 'GJPIR' 
        ? 'Global Journal for Progressive Innovation and Research (GJPIR)' 
        : article.journal,
    },
    'pageStart': pageStart,
    'pageEnd': pageEnd,
    'mainEntityOfPage': `https://lurnexa.in/Articles/${slug}`,
    'url': `https://lurnexa.in/Articles/${slug}`,
    'keywords': article.category,
    'publisher': {
      '@type': 'Organization',
      '@id': 'https://lurnexa.in/#organization',
      'name': 'Lurnexa Publications',
      'logo': 'https://lurnexa.in/7.svg',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarlyArticleSchema) }}
      />
      {children}
    </>
  );
}
