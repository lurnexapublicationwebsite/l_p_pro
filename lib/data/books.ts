export interface Book {
  id: string;
  slug: string;
  shortSlug?: string;
  title: string;
  authors: string;
  domain: string;
  isbn: string;
  pages: number;
  price: number; // Paperback / Physical price
  digitalPrice: number; // Digital / PDF price
  code: string;
  pdfFileName: string;
  coverImg: string;
  publishedDate: string;
  description: string;
  longDescription?: string;
  tag?: string;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  keywords: string[];
  tableOfContents?: string[];
  hasCaselet?: boolean;
}

export function bookHasCaselet(bookId?: string): boolean {
  if (!bookId) return false;
  return ["3", "5"].includes(bookId);
}

export function getPhysicalPrice(plan: string, bookId?: string, defaultPrice?: number): number {
  if (bookId === "3") {
    if (plan === "caselet") return 99;
    if (plan === "book_caselet") return 739;
    return 649;
  }
  if (bookId === "5") {
    if (plan === "caselet") return 99;
    if (plan === "book_caselet") return 689;
    return 599;
  }
  const basePrice = defaultPrice || 649;
  if (plan === "caselet") return 99;
  if (plan === "book_caselet") return basePrice + 90;
  return basePrice;
}

export function getSoftCopyPrice(plan: string, bookId?: string, defaultDigitalPrice?: number): number {
  if (bookId === "1") {
    return 499;
  }
  if (bookId === "3") {
    if (plan === "caselet") return 49;
    if (plan === "book_caselet") return 339;
    return 299;
  }
  if (bookId === "5") {
    if (plan === "caselet") return 49;
    if (plan === "book_caselet") return 339;
    return 299;
  }
  if (bookId === "2") {
    return 249;
  }
  if (bookId === "7") {
    return 219;
  }
  if (bookId === "6") {
    if (plan === "caselet") return 60;
    if (plan === "book_caselet") return 295;
    return 199;
  }
  const basePrice = defaultDigitalPrice || 299;
  if (plan === "caselet") return 49;
  if (plan === "book_caselet") return basePrice + 40;
  return basePrice;
}

export function slugifyBookTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/:/g, '')
    .replace(/,/g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const PUBLISHED_BOOKS_DATA: Book[] = [
  {
    id: "2",
    slug: "machine-learning-a-structured-approach-to-algorithms-and-intelligent-systems",
    shortSlug: "machine-learning",
    title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS",
    authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    domain: "Computer Science & Engineering / Machine Learning",
    isbn: "978-81-685077-3-9",
    pages: 231,
    price: 599,
    digitalPrice: 249,
    code: "ML",
    pdfFileName: "ml.pdf",
    coverImg: "/portal_coverpages/ml.jpeg",
    publishedDate: "May 18, 2026",
    tag: "Best Seller",
    stockStatus: "in-stock",
    description: "This book offers a systematic and in-depth exploration of machine learning, designed to help readers build a strong foundation while progressing toward advanced applications. It begins by introducing the core principles of machine learning, including data representation, statistical thinking, and the fundamental paradigms of supervised, unsupervised, and reinforcement learning.",
    longDescription: `MACHINE LEARNING: A Structured Approach to Algorithms and Intelligent Systems is an essential textbook designed for university students, researchers, and software engineers. Authored by esteemed computer science educators Dr. Halavath Balaji, Jogu Saritha, and Pallavi B, this comprehensive guide delivers mathematical rigor alongside real-world Python implementation.

The textbook thoroughly covers regression models, decision trees, neural networks, deep learning architectures, support vector machines, clustering algorithms, and reinforcement learning framework. Ideal for undergraduate and postgraduate courses in Computer Science, Data Science, and Artificial Intelligence.`,
    keywords: [
      "Machine Learning",
      "Machine Learning book",
      "Machine Learning textbook",
      "Machine Learning algorithms",
      "Machine Learning PDF",
      "Machine learning course book",
      "Best Machine Learning book",
      "Machine Learning textbook India",
      "Dr Halavath Balaji Machine Learning",
      "Jogu Saritha machine learning",
      "Pallavi B machine learning textbook",
      "Intelligent Systems textbook",
      "Supervised Unsupervised learning book",
      "978-81-685077-3-9",
      "Buy Machine Learning book online India",
      "Lurnexa machine learning textbook",
      "CSE machine learning reference book"
    ],
    tableOfContents: [
      "Chapter 1: Foundations of Machine Learning & Statistical Learning Theory",
      "Chapter 2: Data Preprocessing, Feature Engineering & Dimensionality Reduction",
      "Chapter 3: Supervised Learning - Regression & Classification Paradigms",
      "Chapter 4: Tree-Based Methods, Ensemble Learning & Random Forests",
      "Chapter 5: Support Vector Machines & Kernel Methods",
      "Chapter 6: Unsupervised Learning - Clustering & Association Rule Mining",
      "Chapter 7: Neural Networks, Deep Learning & Optimization Techniques",
      "Chapter 8: Reinforcement Learning & Intelligent Autonomous Systems",
      "Chapter 9: Model Evaluation, Validation Metrics & Ethics in AI"
    ]
  },
  {
    id: "3",
    slug: "database-management-systems-concepts-design-and-implementation",
    shortSlug: "dbms",
    title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION",
    authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    domain: "Computer Science & Engineering / DBMS",
    isbn: "978-81-685077-5-3",
    pages: 248,
    price: 649,
    digitalPrice: 299,
    code: "DB",
    pdfFileName: "dbms.pdf",
    coverImg: "/portal_coverpages/dbms.jpeg",
    publishedDate: "May 18, 2026",
    tag: "Staff Pick",
    stockStatus: "in-stock",
    hasCaselet: true,
    description: "This textbook provides a comprehensive and structured introduction to the fundamental concepts, design principles, and implementation techniques of Database Management Systems (DBMS). It is designed to guide learners from foundational topics such as data models and relational theory to advanced areas including SQL, schema refinement (normalization), and transaction management.",
    longDescription: `Database Management Systems: Concepts, Design and Implementation serves as a definitive textbook for mastering relational databases, SQL queries, ER diagram modeling, indexing strategies, transaction processing, and modern NoSQL architectures.`,
    keywords: [
      "DBMS",
      "DBMS book",
      "Database Management Systems",
      "DBMS textbook",
      "Database Management Systems book",
      "SQL book",
      "Relational Database textbook",
      "Dr Halavath Balaji DBMS",
      "Jogu Saritha DBMS textbook",
      "978-81-685077-5-3",
      "SQL and Relational Database textbook India",
      "Lurnexa DBMS textbook"
    ],
    tableOfContents: [
      "Chapter 1: Overview of Database Systems & Architecture",
      "Chapter 2: Data Modeling Using Entity-Relationship (ER) Model",
      "Chapter 3: Relational Model & Relational Algebra",
      "Chapter 4: Structured Query Language (SQL) & Advanced Queries",
      "Chapter 5: Schema Refinement & Normalization (1NF to 5NF, BCNF)",
      "Chapter 6: Transaction Processing, Concurrency Control & Recovery Systems",
      "Chapter 7: Indexing Structures, B-Trees & Hash Indexing",
      "Chapter 8: Modern NoSQL Databases & Distributed Data Systems"
    ]
  },
  {
    id: "6",
    slug: "foundations-of-artificial-intelligence-concepts-techniques-and-applications",
    shortSlug: "artificial-intelligence",
    title: "FOUNDATIONS OF ARTIFICIAL INTELLIGENCE: CONCEPTS, TECHNIQUES AND APPLICATIONS",
    authors: "Dr. P. Manikandan, Dr. P. Renukadevi, Dr. J. Nashreen Begum, Dr. D. Banumathy",
    domain: "Computer Science & Engineering / Artificial Intelligence",
    isbn: "978-81-685077-4-6",
    pages: 142,
    price: 399,
    digitalPrice: 199,
    code: "AI",
    pdfFileName: "ai.pdf",
    coverImg: "/portal_coverpages/ai.jpeg",
    publishedDate: "August 6, 2026",
    tag: "New Release",
    stockStatus: "in-stock",
    description: "This book provides a comprehensive foundation in Artificial Intelligence, exploring intelligent agents, state-space search algorithms, knowledge representation, machine learning paradigms, reasoning systems, and ethical AI implications for next-generation intelligent applications.",
    longDescription: `Foundations of Artificial Intelligence: Concepts, Techniques and Applications provides a detailed academic introduction to state-space search, heuristic optimization, logic reasoning, knowledge graphs, and ethical AI considerations.`,
    keywords: [
      "Artificial Intelligence",
      "Artificial Intelligence book",
      "AI book",
      "AI textbook",
      "Artificial Intelligence textbook",
      "Foundations of AI book",
      "Dr P Manikandan AI book",
      "Dr P Renukadevi AI textbook",
      "978-81-685077-4-6",
      "Buy AI textbook online India",
      "Lurnexa AI textbook"
    ],
    tableOfContents: [
      "Chapter 1: Introduction to Artificial Intelligence & Agent Architectures",
      "Chapter 2: Problem Solving by Searching & Heuristic Strategies",
      "Chapter 3: Knowledge Representation & First-Order Logic Reasoning",
      "Chapter 4: Probabilistic Reasoning & Uncertainty Management",
      "Chapter 5: Introduction to Natural Language Processing & Computer Vision",
      "Chapter 6: AI Ethics, Bias Mitigation & Governance"
    ]
  },
  {
    id: "7",
    slug: "data-streaming-and-analysis",
    shortSlug: "data-streaming",
    title: "DATA STREAMING AND ANALYSIS",
    authors: "Dr. P. Renukadevi, Dr. Chinmaya Kumar Swain, Dr. Archana Sasi, Mr. Shahad P",
    domain: "Data Science / Analytics",
    isbn: "978-81-685077-8-4",
    pages: 199,
    price: 449,
    digitalPrice: 219,
    code: "DS",
    pdfFileName: "data_streaming_and_analysis.pdf",
    coverImg: "/portal_coverpages/data_streaming.jpeg",
    publishedDate: "August 18, 2026",
    tag: "Trending",
    stockStatus: "in-stock",
    description: "This textbook offers an in-depth exploration of real-time data streaming architectures, processing engines, and advanced analytics methods essential for modern data-driven ecosystems. It covers foundational stream processing concepts, distributed messaging systems, event-driven architectures, and scalable analytics algorithms.",
    longDescription: `Data Streaming and Analysis provides cutting-edge insights into real-time stream processing frameworks, Apache Kafka, Apache Flink, distributed event streams, and scalable stream analytics for big data applications.`,
    keywords: [
      "Data Streaming",
      "Data Streaming book",
      "Data Streaming and Analysis textbook",
      "Real-time Data Streaming book",
      "Stream processing book",
      "Dr P Renukadevi Data Streaming",
      "Dr Chinmaya Kumar Swain Data Streaming",
      "978-81-685077-8-4",
      "Stream processing textbook India",
      "Lurnexa data streaming book"
    ],
    tableOfContents: [
      "Chapter 1: Fundamentals of Real-Time Data Streaming",
      "Chapter 2: Distributed Event Messaging Systems & Architecture",
      "Chapter 3: Stream Processing Frameworks (Kafka, Flink, Spark Streaming)",
      "Chapter 4: Windowing, Event Time & Stateful Stream Computation",
      "Chapter 5: Real-Time Stream Analytics & Machine Learning on Streams",
      "Chapter 6: Scalability, Fault Tolerance & Enterprise Streaming Systems"
    ]
  },
  {
    id: "1",
    slug: "indian-mineral-import-policy-options-an-economywide-analysis",
    shortSlug: "mineral-policy",
    title: "Indian Mineral Import Policy Options: An Economywide Analysis",
    authors: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar",
    domain: "Economics / Trade Policy",
    isbn: "978-81-685077-7-7",
    pages: 88,
    price: 699,
    digitalPrice: 499,
    code: "MP",
    pdfFileName: "minerals.pdf",
    coverImg: "/portal_coverpages/minerals.jpeg",
    publishedDate: "August 2026",
    tag: "Policy Study",
    stockStatus: "in-stock",
    description: "This study presents a comprehensive and data-driven examination of India's mineral import landscape, offering a distinctive economy-wide perspective. By integrating long-term trade trends with advanced simulation and modelling techniques, it evaluates the real economic implications of mineral import decisions on output, employment, prices, and trade dynamics.",
    longDescription: `Indian Mineral Import Policy Options: An Economywide Analysis is a seminal economic policy research book authored by Dr. Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, and Kannan Kumar.`,
    keywords: [
      "Indian Mineral Import Policy Options",
      "Mineral Policy book",
      "Trade policy India book",
      "Dr Badri Narayanan Gopalakrishnan",
      "Vishnu Dasgupta economics book",
      "Kannan Kumar mineral import analysis",
      "978-81-685077-7-7",
      "Economywide analysis India trade policy",
      "Lurnexa Economics publications"
    ],
    tableOfContents: [
      "Chapter 1: India's Mineral Import Ecosystem - Overview & Trends",
      "Chapter 2: Computational General Equilibrium (CGE) Modeling Framework",
      "Chapter 3: Policy Simulations & Tariff Sensitivity Analysis",
      "Chapter 4: Economic Impact on Output, Employment & Prices",
      "Chapter 5: Strategic Mineral Reserves & Policy Recommendations"
    ]
  },
  {
    id: "5",
    slug: "principles-of-microeconomics-for-business-and-management",
    shortSlug: "microeconomics",
    title: "PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT",
    authors: "Dr. Aruna Kumar Dash",
    domain: "Economics / Management",
    isbn: "978-81-685077-1-5",
    pages: 277,
    price: 599,
    digitalPrice: 299,
    code: "PM",
    pdfFileName: "microeconomics.pdf",
    coverImg: "/portal_coverpages/microeconomics.jpg",
    publishedDate: "May 18, 2026",
    tag: "Academic Choice",
    stockStatus: "in-stock",
    hasCaselet: true,
    description: "This textbook provides a comprehensive and structured introduction to the core principles of microeconomics tailored for business and management. It covers demand and supply analysis, consumer behavior, production theory, market structures, factor pricing, and real-world managerial decision making.",
    longDescription: `Principles of Microeconomics for Business and Management by Dr. Aruna Kumar Dash is a core university textbook for MBA, BBA, and Commerce students covering microeconomic principles and managerial economics.`,
    keywords: [
      "Microeconomics",
      "Microeconomics book",
      "Principles of Microeconomics textbook",
      "Principles of Microeconomics",
      "principles of micro economics",
      "micro economics",
      "Principles of Microeconomics for Business and Management",
      "MBA Microeconomics book",
      "Dr Aruna Kumar Dash microeconomics",
      "978-81-685077-1-5",
      "MBA Managerial Economics textbook India",
      "Lurnexa Microeconomics book"
    ],
    tableOfContents: [
      "Chapter 1: Introduction to Microeconomics & Managerial Decision Making",
      "Chapter 2: Demand, Supply & Market Equilibrium",
      "Chapter 3: Consumer Behavior & Utility Theory",
      "Chapter 4: Production Analysis & Cost Functions",
      "Chapter 5: Market Structures - Perfect Competition, Monopoly & Oligopoly",
      "Chapter 6: Factor Pricing & Strategic Pricing Models"
    ]
  }
];

export function getAllBooks(): Book[] {
  return PUBLISHED_BOOKS_DATA;
}

export function getBookBySlug(slug: string): Book | undefined {
  const normalized = slug.toLowerCase();
  return PUBLISHED_BOOKS_DATA.find(
    (b) =>
      b.slug === normalized ||
      (b.shortSlug && b.shortSlug.toLowerCase() === normalized) ||
      slugifyBookTitle(b.title) === normalized ||
      b.id === normalized ||
      b.code.toLowerCase() === normalized
  );
}

export function getBookByIsbn(isbn: string): Book | undefined {
  const clean = isbn.replace(/-/g, '');
  return PUBLISHED_BOOKS_DATA.find((b) => b.isbn.replace(/-/g, '') === clean);
}
