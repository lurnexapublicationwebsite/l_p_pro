import React from 'react';

export default function JsonLd() {
  const schemaData = [
    // ── 1. Organization ──
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://lurnexa.in/#organization',
      'name': 'Lurnexa Publications',
      'alternateName': ['LURNEXA PUBLICATIONS', 'Lurnexa'],
      'url': 'https://lurnexa.in',
      'logo': 'https://lurnexa.in/Logo.png',
      'image': 'https://lurnexa.in/Logo.png',
      'description': 'Lurnexa Publications is a premier scholarly publisher and techno-management hub, publishing peer-reviewed academic journals, university textbooks, and research monographs.',
      'email': 'lurnexapublication@gmail.com',
      'telephone': '+91-9133521829',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '130-187, Ramulavari Gudi Centre, Gorantla',
        'addressLocality': 'Guntur',
        'addressRegion': 'Andhra Pradesh',
        'postalCode': '522034',
        'addressCountry': 'IN',
      },
      'contactPoint': [
        {
          '@type': 'ContactPoint',
          'telephone': '+91-9133521829',
          'contactType': 'customer service',
          'email': 'lurnexapublication@gmail.com',
          'areaServed': 'IN',
          'availableLanguage': ['English', 'Hindi', 'Telugu'],
        },
        {
          '@type': 'ContactPoint',
          'telephone': '+91-9347375817',
          'contactType': 'editorial & publishing support',
          'email': 'lurnexapublication@gmail.com',
          'areaServed': 'IN',
          'availableLanguage': ['English'],
        },
      ],
      'founder': {
        '@type': 'Person',
        '@id': 'https://lurnexa.in/#founder',
        'name': 'Narendra Kumar Kurakula',
        'jobTitle': 'Founder & Director',
        'image': 'https://lurnexa.in/founder.jpeg',
        'worksFor': {
          '@type': 'Organization',
          '@id': 'https://lurnexa.in/#organization',
        },
      },
      'ceo': {
        '@type': 'Person',
        '@id': 'https://lurnexa.in/#ceo',
        'name': 'Rushik Burla',
        'jobTitle': 'Chief Executive Officer',
        'image': 'https://lurnexa.in/ceo.jpg',
        'worksFor': {
          '@type': 'Organization',
          '@id': 'https://lurnexa.in/#organization',
        },
      },
    },

    // ── 2. Founder Person ──
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://lurnexa.in/#founder',
      'name': 'Narendra Kumar Kurakula',
      'jobTitle': 'Founder & Director',
      'image': 'https://lurnexa.in/founder.jpeg',
      'worksFor': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
        'name': 'Lurnexa Publications',
      },
      'url': 'https://lurnexa.in',
    },

    // ── 3. CEO Person ──
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': 'https://lurnexa.in/#ceo',
      'name': 'Rushik Burla',
      'jobTitle': 'Chief Executive Officer',
      'image': 'https://lurnexa.in/ceo.jpg',
      'worksFor': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
        'name': 'Lurnexa Publications',
      },
      'url': 'https://lurnexa.in',
    },

    // ── 4. WebSite ──
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': 'https://lurnexa.in/#website',
      'url': 'https://lurnexa.in',
      'name': 'Lurnexa Publications',
      'description': 'Scholarly Academic Publishing, Research Journals & University Textbooks',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'potentialAction': {
        '@type': 'SearchAction',
        'target': {
          '@type': 'EntryPoint',
          'urlTemplate': 'https://lurnexa.in/textbooks/store?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },

    // ── 5. SiteNavigationElement (helps Google build rich sitelinks) ──
    {
      '@context': 'https://schema.org',
      '@type': 'SiteNavigationElement',
      '@id': 'https://lurnexa.in/#navigation',
      'name': 'Main Navigation',
      'hasPart': [
        {
          '@type': 'SiteNavigationElement',
          'name': 'Home',
          'url': 'https://lurnexa.in/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Journals',
          'url': 'https://lurnexa.in/journal/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'ACIET Journal',
          'url': 'https://lurnexa.in/journal/aciet/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'ARESS Journal',
          'url': 'https://lurnexa.in/journal/aress/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'CIMS Journal',
          'url': 'https://lurnexa.in/journal/cims/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'IAEES Journal',
          'url': 'https://lurnexa.in/journal/iaees/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Research Articles',
          'url': 'https://lurnexa.in/Articles/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Textbooks Store',
          'url': 'https://lurnexa.in/textbooks/store/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Machine Learning Textbook',
          'url': 'https://lurnexa.in/textbooks/machine-learning/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'DBMS Textbook',
          'url': 'https://lurnexa.in/textbooks/dbms/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'AI Textbook',
          'url': 'https://lurnexa.in/textbooks/artificial-intelligence/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Microeconomics Textbook',
          'url': 'https://lurnexa.in/textbooks/microeconomics/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Data Streaming Textbook',
          'url': 'https://lurnexa.in/textbooks/data-streaming/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Python Programming Textbook',
          'url': 'https://lurnexa.in/textbooks/python-programming/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'NoSQL Databases Using MongoDB',
          'url': 'https://lurnexa.in/textbooks/nosql-mongodb/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Gallery',
          'url': 'https://lurnexa.in/gallery/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Archive',
          'url': 'https://lurnexa.in/Archive/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'About Us',
          'url': 'https://lurnexa.in/aboutus/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Contact',
          'url': 'https://lurnexa.in/contact/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Services',
          'url': 'https://lurnexa.in/services/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Submit Your Article',
          'url': 'https://lurnexa.in/submityourarticle/',
        },
        {
          '@type': 'SiteNavigationElement',
          'name': 'Author Guidelines',
          'url': 'https://lurnexa.in/author-guidelines/',
        },
      ],
    },

    // ── 6. ImageGallery (makes gallery discoverable as a collection) ──
    {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      '@id': 'https://lurnexa.in/gallery/#imagegallery',
      'name': 'Lurnexa Publications Gallery',
      'description': 'Photo gallery capturing milestones, celebrations, and distinguished visitors at Lurnexa Publications.',
      'url': 'https://lurnexa.in/gallery/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
    },

    // ── 7. CollectionPage for Textbook Store (product listing) ──
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': 'https://lurnexa.in/textbooks/store/#collectionpage',
      'name': 'Lurnexa Bookstore - Academic Textbooks',
      'description': 'Browse, preview, and purchase peer-reviewed academic textbooks published by Lurnexa Publications. Available in paperback and digital PDF.',
      'url': 'https://lurnexa.in/textbooks/store/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'mainEntity': {
        '@type': 'ItemList',
        'numberOfItems': 8,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'MACHINE LEARNING: A Structured Approach to Algorithms and Intelligent Systems',
            'url': 'https://lurnexa.in/textbooks/machine-learning/',
            'image': 'https://lurnexa.in/portal_coverpages/ml.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'DATABASE MANAGEMENT SYSTEMS: Concepts, Design and Implementation',
            'url': 'https://lurnexa.in/textbooks/dbms/',
            'image': 'https://lurnexa.in/portal_coverpages/dbms.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 3,
            'name': 'FOUNDATIONS OF ARTIFICIAL INTELLIGENCE: Concepts, Techniques and Applications',
            'url': 'https://lurnexa.in/textbooks/artificial-intelligence/',
            'image': 'https://lurnexa.in/portal_coverpages/ai.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 4,
            'name': 'DATA STREAMING AND ANALYSIS',
            'url': 'https://lurnexa.in/textbooks/data-streaming/',
            'image': 'https://lurnexa.in/portal_coverpages/data_streaming.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 5,
            'name': 'Indian Mineral Import Policy Options: An Economywide Analysis',
            'url': 'https://lurnexa.in/textbooks/mineral-policy/',
            'image': 'https://lurnexa.in/portal_coverpages/minerals.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 6,
            'name': 'PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT',
            'url': 'https://lurnexa.in/textbooks/microeconomics/',
            'image': 'https://lurnexa.in/portal_coverpages/microeconomics.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 7,
            'name': 'PYTHON PROGRAMMING: PRINCIPLES AND PRACTICE',
            'url': 'https://lurnexa.in/textbooks/python-programming/',
            'image': 'https://lurnexa.in/portal_coverpages/python_programming.jpeg',
          },
          {
            '@type': 'ListItem',
            'position': 8,
            'name': 'NOSQL DATABASES USING MONGODB',
            'url': 'https://lurnexa.in/textbooks/nosql-mongodb/',
            'image': 'https://lurnexa.in/portal_coverpages/NoSQL.jpeg',
          },
        ],
      },
    },

    // ── 8. Periodical schemas for each journal ──
    {
      '@context': 'https://schema.org',
      '@type': 'Periodical',
      '@id': 'https://lurnexa.in/journal/#gjpir',
      'name': 'Global Journal for Progressive Innovation and Research (GJPIR)',
      'alternateName': 'GJPIR',
      'url': 'https://lurnexa.in/journal/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'image': 'https://lurnexa.in/gjpir1.png',
      'description': 'GJPIR is a peer-reviewed multidisciplinary academic journal by Lurnexa Publications covering engineering, economics, management, and social sciences.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Periodical',
      '@id': 'https://lurnexa.in/journal/aciet/#periodical',
      'name': 'Advanced Computational Intelligence & Emerging Technologies (ACIET)',
      'alternateName': 'ACIET',
      'url': 'https://lurnexa.in/journal/aciet/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'image': 'https://lurnexa.in/Aciet.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Periodical',
      '@id': 'https://lurnexa.in/journal/aress/#periodical',
      'name': 'Advanced Research in Economics & Social Sciences (ARESS)',
      'alternateName': 'ARESS',
      'url': 'https://lurnexa.in/journal/aress/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'image': 'https://lurnexa.in/Aress.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Periodical',
      '@id': 'https://lurnexa.in/journal/cims/#periodical',
      'name': 'Center for Innovative Management Studies (CIMS)',
      'alternateName': 'CIMS',
      'url': 'https://lurnexa.in/journal/cims/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'image': 'https://lurnexa.in/Cimms.png',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Periodical',
      '@id': 'https://lurnexa.in/journal/iaees/#periodical',
      'name': 'Institute of Advanced Electrical & Electronics Studies (IAEES)',
      'alternateName': 'IAEES',
      'url': 'https://lurnexa.in/journal/iaees/',
      'publisher': {
        '@type': 'Organization',
        '@id': 'https://lurnexa.in/#organization',
      },
      'image': 'https://lurnexa.in/iaees.png',
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
