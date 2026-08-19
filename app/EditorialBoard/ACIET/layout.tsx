import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ACIET Editorial Board & Review Committee | Lurnexa Publications',
  description: 'Meet the distinguished members of the Editorial Board for Advanced Computational Intelligence & Emerging Technologies (ACIET) at Lurnexa Publications: Dr. Anand Shukla, Dr. Chandrashekar Jatoth, Dr. Easwar Krishna Iyer, Dr. Chinmaya Kumar Swain, Dr. Rishi Chopra, Dr. T.V. Rajini Kanth, Dr. Shaik Mahaboob Basha, Dr. Uma Rani Vanamala, Dr. Balaji Halavath, and Dr. Kranthi Kumar Singamaneni.',
  keywords: [
    'ACIET Editorial Board',
    'Dr Anand Shukla',
    'Dr Anand Shukla Lurnexa',
    'Dr Chandrashekar Jatoth',
    'Dr Easwar Krishna Iyer',
    'Dr Chinmaya Kumar Swain',
    'Dr Rishi Chopra',
    'Dr TV Rajini Kanth',
    'Dr Shaik Mahaboob Basha',
    'Dr Uma Rani Vanamala',
    'Dr Balaji Halavath',
    'Dr Kranthi Kumar Singamaneni',
    'ACIET Editors in Chief',
    'Lovely Professional University Computer Applications',
    'NIT Raipur Information Technology',
    'IIM Jammu Faculty',
    'Computer Science Editorial Board',
    'Peer Review Panel ACIET',
    'Scientific Review Committee',
    'Scholarly Journal Editors',
    'Lurnexa Publications Board'
  ],
  openGraph: {
    title: 'ACIET Editorial Board | Lurnexa Publications',
    description: 'Distinguished expert review panel and board of editors driving high standards of academic research in emerging technologies and computing.',
    url: 'https://lurnexa.in/EditorialBoard/ACIET',
    siteName: 'Lurnexa Publications',
  },
  alternates: {
    canonical: '/EditorialBoard/ACIET',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  'name': 'ACIET Editorial Board Members - Lurnexa Publications',
  'description': 'Editorial Board and Review Committee for Advanced Computational Intelligence & Emerging Technologies (ACIET)',
  'url': 'https://lurnexa.in/EditorialBoard/ACIET',
  'itemListElement': [
    { '@type': 'Person', 'name': 'Dr. Anand Shukla', 'jobTitle': 'Sub Division-Editor in Chief', 'worksFor': { '@type': 'Organization', 'name': 'Lovely Professional University' } },
    { '@type': 'Person', 'name': 'Dr. Chandrashekar Jatoth', 'jobTitle': 'Deputy Editor in Chief', 'worksFor': { '@type': 'Organization', 'name': 'National Institute of Technology, Raipur' } },
    { '@type': 'Person', 'name': 'Dr. Easwar Krishna Iyer', 'jobTitle': 'Sr Associate Editor', 'worksFor': { '@type': 'Organization', 'name': 'Indus Business Academy (IBA), Bengaluru' } },
    { '@type': 'Person', 'name': 'Dr. Chinmaya Kumar Swain', 'jobTitle': 'Associate Editor', 'worksFor': { '@type': 'Organization', 'name': 'IIM Jammu' } },
    { '@type': 'Person', 'name': 'Dr. Rishi Chopra', 'jobTitle': 'Managing Editor', 'worksFor': { '@type': 'Organization', 'name': 'Lovely Professional University' } },
    { '@type': 'Person', 'name': 'Dr. T.V. Rajini Kanth', 'jobTitle': 'Associate Managing Editor', 'worksFor': { '@type': 'Organization', 'name': 'MGIT Hyderabad' } },
    { '@type': 'Person', 'name': 'Dr. Shaik Mahaboob Basha', 'jobTitle': 'Sr Review Editor', 'worksFor': { '@type': 'Organization', 'name': 'Sree Dattha Institute of Engineering and Science' } },
    { '@type': 'Person', 'name': 'Dr. Uma Rani Vanamala', 'jobTitle': 'Review Editor', 'worksFor': { '@type': 'Organization', 'name': 'JNTUH' } },
    { '@type': 'Person', 'name': 'Dr. Balaji Halavath', 'jobTitle': 'Domain Editor', 'worksFor': { '@type': 'Organization', 'name': 'Sreenidhi Institute of Science & Technology' } },
    { '@type': 'Person', 'name': 'Dr. Kranthi Kumar Singamaneni', 'jobTitle': 'Editorial Executive', 'worksFor': { '@type': 'Organization', 'name': 'Symbiosis Institute of Technology' } },
  ],
};

export default function ACIETBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
