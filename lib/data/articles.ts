export const allArticles = [
  {
    id: '1',
    category: 'ARESS',
    subJournal: 'ARESS',
    journal: 'GJPIR',
    title: 'CLIMATE FINANCE AND GREEN TRADE TRANSITIONS: EU CARBON BORDER ADJUSTMENT MECHANISM, GREEN BOND MARKETS, AND CLIMATE RISK IN BANK LENDING PORTFOLIOS',
    description: 'An analysis of EU Carbon Border Adjustment Mechanism, green bond markets, and climate risk management in banking.',
    author: 'Dr. Sofia Ahmed Sait',
    pages: '1-19 Pages',
    pdfUrl: '/htm/climate_paper.html',
    downloadUrl: '/climate_paper.pdf'
  },
  {
    id: '2',
    category: 'CIMS',
    journal: 'GJPIR',
    subJournal: 'CIMS',
    title: 'Bridging the Protection Gap: A Systematic Analysis of Social Security Deficits in the Gig Economy and Organisational–Governmental Pathways Toward Inclusive Platform Work',
    description: 'Bridging the Protection Gap: A Systematic Analysis of Social Security Deficits in the Gig Economy and Organisational–Governmental Pathways Toward Inclusive Platform Work',
    author: 'Dr. Sofia Ahmed Sait',
    pages: '20-44 Pages',
    pdfUrl: '/htm/Gig_Economy_Social_Security_Research_Paper.html',
    downloadUrl: '/pdfs/Gig_Economy_Social_Security_Research_Paper.pdf'
  },
  {
    id: '3',
    category: 'IAEES',
    journal: 'GJPIR',
    subJournal: 'IAEES',
    title: 'A Framework for Smart Retailing and NFC Mobile Payment Services',
    description: 'A Framework for Smart Retailing and NFC Mobile Payment Services',
    author: 'Dr. Bijeta Shaw',
    pages: '45-55 Pages',
    pdfUrl: '/htm/Internet of things & NFC.html',
    downloadUrl: '/pdfs/Internet of things & NFC.pdf'
  },
  {
    id: '4',
    category: 'ARESS',
    journal: 'GJPIR',
    subJournal: 'ARESS',
    title: 'External Blockholder Concentration and Real Earnings Management in India: Re-evaluating the Private Benefit Hypothesis in Group-Affiliated Firms',
    description: 'External Blockholder Concentration and Real Earnings Management in India: Re-evaluating the Private Benefit Hypothesis in Group-Affiliated Firms',
    author: 'Srikanth Potharla',
    pages: '56-78 Pages',
    pdfUrl: '/htm/PBH&REM_Manuscript_updated_11.12.2025.html',
    downloadUrl: '/pdfs/PBH&REM_Manuscript_updated_11.12.2025.pdf'
  },
  {
    id: '5',
    category: 'CIMS',
    journal: 'GJPIR',
    subJournal: 'CIMS',
    title: 'PHYGITAL CONSUMER ENGAGEMENT: INTEGRATING PHYSICAL AND DIGITAL REALITIES IN MODERN MARKETING STRATEGY',
    description: 'PHYGITAL CONSUMER ENGAGEMENT: INTEGRATING PHYSICAL AND DIGITAL REALITIES IN MODERN MARKETING STRATEGY',
    author: 'Dr. Sofia Ahmed Sait',
    pages: '79-97 Pages',
    pdfUrl: '/htm/Phygital Omnichannel.html',
    downloadUrl: '/pdfs/Phygital Omnichannel.pdf'
  },
  {
    id: '6',
    category: 'ARESS',
    journal: 'GJPIR',
    subJournal: 'ARESS',
    title: 'The Impact of Digital Financial Literacy on Financial Behavior among Generation Z in Sri Lanka',
    description: 'The Impact of Digital Financial Literacy on Financial Behavior among Generation Z in Sri Lanka',
    author: 'Shanika Wijerathne, Hiranya Dissanayake',
    pages: '98-111 Pages',
    pdfUrl: '/htm/The Impact of Digital Financial Literacy on Financial Behavior among Generation Z in Sri Lanka.html',
    downloadUrl: '/pdfs/The Impact of Digital Financial Literacy on Financial Behavior among Generation Z in Sri Lanka.pdf'
  },
  {
    id: '7',
    category: 'CIMS',
    journal: 'GJPIR',
    subJournal: 'CIMS',
    title: 'US TARIFF WARS AND GLOBAL TRADE FRAGMENTATION:EMERGING MARKET EXPORT IMPACTS, SUPPLY CHAIN RELOCATION, AND TRADE DIVERSION EFFECTS IN INDIA, VIETNAM, AND BANGLADESH',
    description: 'US TARIFF WARS AND GLOBAL TRADE FRAGMENTATION: EMERGING MARKET EXPORT IMPACTS, SUPPLY CHAIN RELOCATION, AND TRADE DIVERSION EFFECTS IN INDIA, VIETNAM, AND BANGLADESH',
    author: 'Dr. Sofia Ahmed Sait',
    pages: '112-135 Pages',
    pdfUrl: '/htm/US_Tariff_Wars_Global_Trade_Fragmentation_Q1_Paper.html',
    downloadUrl: '/pdfs/US_Tariff_Wars_Global_Trade_Fragmentation_Q1_Paper.pdf'
  }
];

export function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")             // split an accented letter in the base letter and the accent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')         // replace spaces with -
    .replace(/[^\w\-]+/g, '')     // remove all non-word chars
    .replace(/\-\-+/g, '-');      // replace multiple - with single -
}

export function getArticleBySlug(slug: string) {
  return allArticles.find(a => slugify(a.title) === slug) || null;
}
