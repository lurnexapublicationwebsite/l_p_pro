import React from 'react';

export default function JsonLd() {
  const schemaData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://lurnexa.in/#organization',
      'name': 'Lurnexa Publications',
      'url': 'https://lurnexa.in',
      'logo': 'https://lurnexa.in/7.svg',
      'description': 'A techno-management hub of knowledge and innovation, bridging technology, research, management, and publishing.',
      'address': {
        '@type': 'PostalAddress',
        'addressCountry': 'India',
      },
      'founder': {
        '@type': 'Person',
        '@id': 'https://lurnexa.in/#founder',
        'name': 'Narendra Kumar Kurakula',
        'jobTitle': 'Founder & Director',
        'image': 'https://lurnexa.in/founder.jpeg',
      },
      'ceo': {
        '@type': 'Person',
        '@id': 'https://lurnexa.in/#ceo',
        'name': 'Rushik Burla',
        'jobTitle': 'Chief Executive Officer',
        'image': 'https://lurnexa.in/ceo.jpg',
      }
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
        'name': 'Lurnexa Publications'
      },
      'url': 'https://lurnexa.in'
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
        'name': 'Lurnexa Publications'
      },
      'url': 'https://lurnexa.in'
    }
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
