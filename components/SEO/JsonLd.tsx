import React from 'react';

export default function JsonLd() {
  const schemaData = [
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
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
