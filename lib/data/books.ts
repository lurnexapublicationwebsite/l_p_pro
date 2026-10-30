export interface Book {
  id: string;
  slug: string;
  shortSlug?: string;
  title: string;
  authors: string;
  domain: string;
  isbn: string; // Paperback ISBN
  isbnDigital: string; // Digital copy ISBN
  pages: number;
  price: number; // Paperback / Physical price
  digitalPrice: number; // Digital / PDF price
  code: string;
  pdfFileName: string;
  coverImg: string;
  publishedDate: string;
  doiSuffix?: string; // Full DOI = <DOI_PREFIX>/<doiSuffix>, see lib/crossref.ts. Never change once registered.
  description: string;
  longDescription?: string;
  tag?: string;
  stockStatus: "in-stock" | "low-stock" | "out-of-stock";
  keywords: string[];
  tableOfContents?: string[];
  previewPdfUrl?: string;
  customPreviewPdfDataUrl?: string;
  customFullBookPdfDataUrl?: string;
  fullBookPdfSize?: number;
  fullBookPdfUploadedAt?: string;
  hasCaselet?: boolean;
  rentalEnabled?: boolean; // Whether this book is available for rental
  rentalPriceOverride?: { [planCode: string]: number }; // Per-book custom rental pricing
  format?: "both" | "soft" | "physical"; // Supported book formats
}

export function bookHasCaselet(bookId?: string): boolean {
  if (!bookId) return false;
  return ["3", "5"].includes(bookId);
}

// Caselet PDFs per book id, in the same order as the portal's caselet list. Stored privately in S3 under caselets/.
export const CASELET_PDF_FILES: Record<string, string[]> = {
  "3": ["dbms_caselet.pdf"],
  "5": ["microeconomics_caselet.pdf"],
};

export function getPhysicalPrice(plan: string, bookId?: string, defaultPrice?: number): number {
  const basePrice =
    defaultPrice !== undefined && defaultPrice > 0
      ? defaultPrice
      : bookId === "3"
      ? 649
      : bookId === "5"
      ? 599
      : 649;
  if (plan === "caselet") return 99;
  if (plan === "book_caselet") return basePrice + 90;
  return basePrice;
}

export function getSoftCopyPrice(plan: string, bookId?: string, defaultDigitalPrice?: number): number {
  let basePrice = defaultDigitalPrice;
  if (basePrice === undefined || basePrice <= 0) {
    if (bookId === "1") basePrice = 499;
    else if (bookId === "3" || bookId === "5") basePrice = 299;
    else if (bookId === "2") basePrice = 249;
    else if (bookId === "7") basePrice = 219;
    else if (bookId === "6") basePrice = 199;
    else if (bookId === "8" || bookId === "9") basePrice = 299;
    else if (bookId === "4") basePrice = 269;
    else if (bookId === "12") basePrice = 200;
    else if (bookId === "13") basePrice = 299;
    else basePrice = 299;
  }
  if (plan === "caselet") return bookId === "6" ? 60 : 49;
  if (plan === "book_caselet") return bookId === "6" ? basePrice + 96 : basePrice + 40;
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
    doiSuffix: "lp.book.002",
    slug: "machine-learning-a-structured-approach-to-algorithms-and-intelligent-systems",
    shortSlug: "machine-learning",
    title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS",
    authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    domain: "Computer Science & Engineering / Machine Learning",
    isbn: "978-81-685077-3-9",
    isbnDigital: "978-81-903315-7-9",
    pages: 231,
    price: 599,
    digitalPrice: 249,
    code: "ML",
    pdfFileName: "ml.pdf",
    coverImg: "/portal_coverpages/ml.jpeg",
    publishedDate: "May 18, 2026",
    tag: "Best Seller",
    stockStatus: "in-stock",
    rentalEnabled: true,
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
    doiSuffix: "lp.book.003",
    slug: "database-management-systems-concepts-design-and-implementation",
    shortSlug: "dbms",
    title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION",
    authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    domain: "Computer Science & Engineering / DBMS",
    isbn: "978-81-685077-5-3",
    isbnDigital: "978-81-903315-4-8",
    pages: 248,
    price: 649,
    digitalPrice: 299,
    code: "DB",
    pdfFileName: "dbms.pdf",
    coverImg: "/portal_coverpages/dbms.jpeg",
    publishedDate: "May 18, 2026",
    tag: "Staff Pick",
    stockStatus: "in-stock",
    rentalEnabled: true,
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
    doiSuffix: "lp.book.006",
    slug: "foundations-of-artificial-intelligence-concepts-techniques-and-applications",
    shortSlug: "artificial-intelligence",
    title: "FOUNDATIONS OF ARTIFICIAL INTELLIGENCE: CONCEPTS, TECHNIQUES AND APPLICATIONS",
    authors: "Dr. P. Manikandan, Dr. P. Renukadevi, Dr. J. Nashreen Begum, Dr. D. Banumathy",
    domain: "Computer Science & Engineering / Artificial Intelligence",
    isbn: "978-81-685077-4-6",
    isbnDigital: "978-81-903315-3-1",
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
    doiSuffix: "lp.book.007",
    slug: "data-streaming-and-analysis",
    shortSlug: "data-streaming",
    title: "DATA STREAMING AND ANALYSIS",
    authors: "Dr. P. Renukadevi, Dr. Chinmaya Kumar Swain, Dr. Archana Sasi, Mr. Shahad P",
    domain: "Data Science / Analytics",
    isbn: "978-81-685077-8-4",
    isbnDigital: "978-81-903315-1-7",
    pages: 199,
    price: 449,
    digitalPrice: 219,
    code: "DS",
    pdfFileName: "data_streaming.pdf",
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
    doiSuffix: "lp.book.001",
    slug: "indian-mineral-import-policy-options-an-economywide-analysis",
    shortSlug: "mineral-policy",
    title: "Indian Mineral Import Policy Options: An Economywide Analysis",
    authors: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar",
    domain: "Economics / Trade Policy",
    isbn: "978-81-685077-7-7",
    isbnDigital: "N/A",
    pages: 88,
    price: 699,
    digitalPrice: 499,
    code: "MP",
    pdfFileName: "minerals.pdf",
    coverImg: "/portal_coverpages/minerals.jpeg",
    publishedDate: "August 2026",
    tag: "Policy Study",
    stockStatus: "in-stock",
    rentalEnabled: true,
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
    doiSuffix: "lp.book.005",
    slug: "principles-of-microeconomics-for-business-and-management",
    shortSlug: "microeconomics",
    title: "PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT",
    authors: "Dr. Aruna Kumar Dash",
    domain: "Economics / Management",
    isbn: "978-81-685077-1-5",
    isbnDigital: "978-81-903315-5-5",
    pages: 277,
    price: 599,
    digitalPrice: 299,
    code: "PM",
    pdfFileName: "microeconomics.pdf",
    coverImg: "/portal_coverpages/microeconomics.jpeg",
    publishedDate: "May 18, 2026",
    tag: "Academic Choice",
    stockStatus: "in-stock",
    rentalEnabled: true,
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
  },
  {
    id: "8",
    doiSuffix: "lp.book.008",
    slug: "python-programming-principles-and-practice",
    shortSlug: "python-programming",
    title: "PYTHON PROGRAMMING: PRINCIPLES AND PRACTICE",
    authors: "Dr. Prakash Shanmurthy, Dr. J. Somasekar, Mr. Vaibhav Prabhakar Raibole, Mr. Shiva Prasad Munukuntla",
    domain: "Computer Science & Engineering / Programming",
    isbn: "978-81-685077-2-2",
    isbnDigital: "978-81-903315-6-2",
    pages: 355,
    price: 599,
    digitalPrice: 299,
    code: "PY",
    pdfFileName: "python_programming.pdf",
    coverImg: "/portal_coverpages/python_programming.jpeg",
    publishedDate: "August 2026",
    tag: "New Release",
    stockStatus: "in-stock",
    rentalEnabled: true,
    description: "This book provides a comprehensive and hands-on foundation in Python programming, designed for students, educators, and software development professionals. It covers essential syntax, core data structures, object-oriented concepts, and practical problem-solving techniques. Emphasizing real-world applications, industry coding standards, and algorithmic thinking, the text guides readers through structured examples and project-oriented learning to build proficiency in modern Python software development.",
    longDescription: `PYTHON PROGRAMMING: PRINCIPLES AND PRACTICE is an essential textbook designed for university students, researchers, and software engineers. Authored by Dr. Prakash Shanmurthy, Dr. J. Somasekar, Mr. Vaibhav Prabhakar Raibole, and Mr. Shiva Prasad Munukuntla, this comprehensive guide delivers theoretical rigor alongside real-world Python implementation and hands-on programming projects.`,
    keywords: [
      "Python Programming",
      "Python Programming book",
      "Python Programming textbook",
      "Python Programming principles and practice",
      "Dr Prakash Shanmurthy Python book",
      "Dr J Somasekar Python textbook",
      "978-81-685077-2-2",
      "Buy Python Programming book online India",
      "Lurnexa Python textbook",
      "CSE Python programming reference book"
    ],
    tableOfContents: [
      "Chapter 1: Introduction to Python & Algorithmic Problem Solving",
      "Chapter 2: Control Structures, Functions & Modular Programming",
      "Chapter 3: Data Structures - Lists, Tuples, Sets & Dictionaries",
      "Chapter 4: Object-Oriented Programming (OOP) in Python",
      "Chapter 5: File Handling, Exception Management & Modules",
      "Chapter 6: Advanced Python - Functional Programming & Data Analysis Libraries"
    ]
  },
  {
    id: "9",
    doiSuffix: "lp.book.009",
    slug: "nosql-databases-using-mongodb",
    shortSlug: "nosql-mongodb",
    title: "NOSQL DATABASES USING MONGODB",
    authors: "Dr. Sujeet S. Jagtap",
    domain: "Computer Science & Engineering / Databases",
    isbn: "N/A",
    isbnDigital: "978-81-903315-8-6",
    pages: 197,
    price: 299,
    digitalPrice: 299,
    code: "NS",
    pdfFileName: "nosql.pdf",
    coverImg: "/portal_coverpages/nosql.jpeg",
    publishedDate: "August 2026",
    tag: "Digital Exclusive",
    stockStatus: "in-stock",
    rentalEnabled: true,
    description: "This textbook provides a comprehensive and practical exploration of NoSQL database systems with a primary focus on MongoDB. It covers foundational document store concepts, schema design strategies, CRUD operations, aggregation frameworks, indexing, and enterprise scalability.",
    longDescription: `NOSQL DATABASES USING MONGODB is a definitive academic and practical guide authored by Dr. Sujeet S. Jagtap. Designed for computer science students, database administrators, and software architects, this book covers modern document-oriented database paradigms, high-performance querying, and distributed database deployment.`,
    keywords: [
      "NoSQL Databases",
      "MongoDB book",
      "NoSQL Databases Using MongoDB",
      "Dr Sujeet S Jagtap NoSQL",
      "978-81-903315-8-6",
      "MongoDB textbook India",
      "Lurnexa NoSQL book"
    ],
    tableOfContents: [
      "Chapter 1: Introduction to NoSQL & Document-Oriented Databases",
      "Chapter 2: MongoDB Architecture & Core Data Models",
      "Chapter 3: CRUD Operations & Query Optimization",
      "Chapter 4: Aggregation Pipeline & Complex Analytics",
      "Chapter 5: Indexing, Sharding & High Availability Replica Sets",
      "Chapter 6: Enterprise Security, Backup & Database Administration"
    ]
  },
  {
    id: "4",
    doiSuffix: "lp.book.004",
    slug: "entrepreneurship-development-concepts-to-creation",
    shortSlug: "entrepreneurship",
    title: "ENTREPRENEURSHIP DEVELOPMENT: CONCEPTS TO CREATION",
    authors: "Dr. V Padmaja, Dr. C Udaya Kumar, Dr. Archan Mitra",
    domain: "Management / Entrepreneurship",
    isbn: "978-81-903315-0-0",
    isbnDigital: "978-81-903315-2-4",
    pages: 172,
    price: 549,
    digitalPrice: 269,
    code: "ED",
    pdfFileName: "entrepreneurship.pdf",
    coverImg: "/portal_coverpages/entrepreneurship.jpeg",
    publishedDate: "September 2026",
    tag: "New Release",
    stockStatus: "in-stock",
    rentalEnabled: true,
    description: "This book provides a comprehensive and practical roadmap for aspiring entrepreneurs, students, and professionals who aim to transform ideas into successful ventures. It begins by building a strong conceptual foundation of entrepreneurship—covering key theories, traits of successful entrepreneurs, and the evolving role of innovation in today's dynamic business environment.",
    longDescription: `Entrepreneurship Development: Concepts to Creation is a definitive academic textbook that systematically guides readers through the entrepreneurial journey—from opportunity identification and idea validation to business model development and resource mobilization. It emphasizes real-world applicability by integrating case studies, contemporary examples, and structured frameworks that help bridge the gap between academic knowledge and practical execution.`,
    keywords: [
      "Entrepreneurship",
      "Entrepreneurship book",
      "Entrepreneurship Development textbook",
      "Entrepreneurship Development: Concepts to Creation",
      "Dr V Padmaja entrepreneurship",
      "Dr C Udaya Kumar entrepreneurship",
      "Dr Archan Mitra entrepreneurship",
      "978-81-903315-0-0",
      "MBA Entrepreneurship textbook India",
      "Lurnexa Entrepreneurship book",
      "Business Management textbook",
      "Startup textbook"
    ],
    tableOfContents: [
      "Chapter 1: Foundations of Entrepreneurship & Innovation",
      "Chapter 2: Opportunity Identification & Idea Validation",
      "Chapter 3: Business Model Development & Canvas",
      "Chapter 4: Resource Mobilization & Startup Financing",
      "Chapter 5: Venture Creation & Growth Strategies",
      "Chapter 6: Corporate Sustainability, ESG & Circular Economy"
    ]
  },
  {
    id: "12",
    doiSuffix: "lp.book.012",
    slug: "c-programming-in-24-days",
    shortSlug: "c-programming",
    title: "C PROGRAMMING In 24 Days",
    authors: "Dr. M. Sayeekumar, Dr. C. Poongodi",
    domain: "Computer Science & Engineering / Programming",
    isbn: "978-81-180403-5-4",
    isbnDigital: "N/A",
    pages: 139,
    price: 350,
    digitalPrice: 200,
    code: "CP",
    pdfFileName: "CPROGRAMMING.pdf",
    coverImg: "/portal_coverpages/CPROGRAMMING.jpeg",
    previewPdfUrl: "/published_books/previews/CPROGRAMMING.pdf",
    publishedDate: "October 2026",
    tag: "New Release",
    stockStatus: "in-stock",
    rentalEnabled: true,
    hasCaselet: false,
    description:
      "This textbook presents the fundamentals of the C programming language in a structured, classroom-tested format designed for beginners. It covers program structure, tokens, operators, expressions, control flow, arrays, strings, functions, structures, pointers, and preprocessor directives through practical examples.",
    longDescription:
      "C PROGRAMMING In 24 Days: A Foundational Textbook for Beginners is an authoritative, classroom-tested guide authored by Dr. M. Sayeekumar and Dr. C. Poongodi. Designed for undergraduate students and novice programmers, this book builds solid computational thinking and coding discipline.\n\nCovering fundamental syntax to advanced memory concepts, each chapter provides clear explanations, worked example programs with expected outputs, and review questions. Topics include control structures, modular programming with functions, array manipulation, structures, pointers, and preprocessor directives.",
    keywords: [
      "C Programming",
      "C Programming in 24 Days",
      "C Programming textbook",
      "Learn C language",
      "Dr M Sayeekumar",
      "Dr C Poongodi",
      "C programming beginners",
      "Structured programming in C",
      "Pointers and functions in C",
      "978-81-180403-5-4",
      "Lurnexa C programming textbook"
    ],
    tableOfContents: [
      "Day 1: Introduction to C Programming",
      "Day 2: Structure of a C Program",
      "Day 3: C Tokens: Character Set, Keywords and Identifiers",
      "Day 4: Operators",
      "Day 5: Expressions",
      "Day 6: Input and Output Statements",
      "Day 7: Formatted Output Statements",
      "Day 8: Decision Making: if, if-else and switch",
      "Day 9: Nested if and else-if Ladder",
      "Day 10: Looping Statements: the for Loop",
      "Day 11: The while Loop",
      "Day 12: The do-while Loop",
      "Day 13: Unconditional Control Statements: break, continue and goto",
      "Day 14: Arrays",
      "Day 15: Two-Dimensional Arrays",
      "Day 16: Strings",
      "Day 17: Functions",
      "Day 18: Function Prototypes",
      "Day 19: Nesting of Functions",
      "Day 20: Call by Value and Call by Reference",
      "Day 21: Structures",
      "Day 22: Pointers with Structures",
      "Day 23: Pointers with Functions",
      "Day 24: Preprocessor Directives"
    ]
  },
  {
    id: "13",
    doiSuffix: "lp.book.013",
    slug: "data-analytics-for-business-concepts-methods-visualization-and-ai-driven-decision-making",
    shortSlug: "data-analytics",
    title: "Data Analytics for Business: Concepts, Methods, Visualization, and AI-Driven Decision Making",
    authors: "Dr Chinmaya Kumar Swain, Dr Abhilash Ponnam, Dr Guru Prasad, Mr Tulasi Ram",
    domain: "Management & Business Analytics / Data Science & AI",
    isbn: "978-81-180403-3-0",
    isbnDigital: "978-81-180403-4-7",
    pages: 389,
    price: 599,
    digitalPrice: 299,
    code: "DA",
    pdfFileName: "data-analytics.pdf",
    coverImg: "/portal_coverpages/data_analytics.jpeg",
    previewPdfUrl: "/published_books/previews/data-analytics.pdf",
    publishedDate: "October 2026",
    tag: "Featured",
    stockStatus: "in-stock",
    rentalEnabled: true,
    hasCaselet: false,
    description:
      "This book introduces the foundational concepts, practical methods, visualization techniques, and AI-driven frameworks essential for modern business analytics. It connects analytical concepts with business questions, covering descriptive, diagnostic, predictive, and prescriptive analytics alongside industry tools like SQL, Excel, Power BI, Tableau, R, and Python.",
    longDescription:
      "Data Analytics for Business: Concepts, Methods, Visualization, and AI-Driven Decision Making is a comprehensive, industry-aligned textbook authored by Dr. Chinmaya Kumar Swain, Dr. Abhilash Ponnam, Dr. Guru Prasad, and Mr. Tulasi Ram. Designed for students and practitioners of management, commerce, and analytics, this book connects core analytical principles with real-world enterprise applications.\n\nProgressing across 21 chapters from foundational statistics and exploratory data analysis to machine learning, Big Data architectures (Hadoop, Spark, Data Lakes), and Generative AI, this book includes hands-on labs in SQL, Excel, Power BI, Tableau, R, and Python to empower evidence-based decision making.",
    keywords: [
      "Data Analytics for Business",
      "Business Analytics textbook",
      "AI-Driven Decision Making",
      "Data Visualization",
      "SQL for Data Analytics",
      "Power BI Tableau Excel R Python",
      "Dr Chinmaya Kumar Swain",
      "Dr Abhilash Ponnam",
      "Dr Guru Prasad",
      "Mr Tulasi Ram",
      "Predictive Analytics Prescriptive Analytics",
      "978-81-180403-3-0",
      "Lurnexa Data Analytics textbook"
    ],
    tableOfContents: [
      "Chapter 1: Introduction to Data Analytics",
      "Chapter 2: Business Decision Making Using Data",
      "Chapter 3: Data Types and Data Sources",
      "Chapter 4: Data Collection and Data Preparation",
      "Chapter 5: Data Analytics Lifecycle",
      "Chapter 6: Statistics for Business Analytics",
      "Chapter 7: Exploratory Data Analysis (EDA)",
      "Chapter 8: Data Visualization",
      "Chapter 9: Descriptive Analytics",
      "Chapter 10: Diagnostic Analytics",
      "Chapter 11: Predictive Analytics",
      "Chapter 12: Prescriptive Analytics",
      "Chapter 13: SQL for Data Analytics",
      "Chapter 14: Excel for Business Analytics",
      "Chapter 15: Power BI",
      "Chapter 16: Tableau",
      "Chapter 17: R for Data Analytics",
      "Chapter 18: Python for Business Analytics",
      "Chapter 19: Big Data Analytics",
      "Chapter 20: Artificial Intelligence in Data Analytics",
      "Chapter 21: Generative AI For Data Analytics"
    ]
  }
];

function getCatalogOverrides(): { overrides: Record<string, Book>; deletedIds: string[] } {
  if (typeof window !== "undefined") {
    return { overrides: {}, deletedIds: [] };
  }
  try {
    const fs = eval("require('fs')");
    const path = eval("require('path')");
    const localDir =
      process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL
        ? "/tmp"
        : path.join(process.cwd(), "scratch");
    const catalogFilePath = path.join(localDir, "textbooks_catalog.json");
    if (fs.existsSync(catalogFilePath)) {
      const raw = JSON.parse(fs.readFileSync(catalogFilePath, "utf-8"));
      return {
        overrides: raw?.overrides && typeof raw.overrides === "object" ? raw.overrides : {},
        deletedIds: Array.isArray(raw?.deletedIds) ? raw.deletedIds.map(String) : [],
      };
    }
  } catch {
    // fallback
  }
  return { overrides: {}, deletedIds: [] };
}

export function getAllBooks(): Book[] {
  const { overrides, deletedIds } = getCatalogOverrides();
  const deletedSet = new Set(deletedIds);
  const map = new Map<string, Book>();

  for (const b of PUBLISHED_BOOKS_DATA) {
    if (!deletedSet.has(String(b.id))) {
      map.set(String(b.id), b);
    }
  }

  for (const [id, overrideBook] of Object.entries(overrides)) {
    if (deletedSet.has(id)) {
      map.delete(id);
    } else if (overrideBook && typeof overrideBook === "object") {
      const existing = map.get(id);
      const title = (overrideBook.title || existing?.title || "").trim();
      const slug = (overrideBook.slug || (title ? slugifyBookTitle(title) : existing?.slug) || id).trim();
      const shortSlug = (overrideBook.shortSlug || existing?.shortSlug || slug.slice(0, 32)).trim();
      map.set(id, {
        ...existing,
        ...overrideBook,
        id,
        title,
        slug,
        shortSlug,
      } as Book);
    }
  }

  const result = Array.from(map.values());
  result.sort((a, b) => {
    const na = Number(a.id);
    const nb = Number(b.id);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return String(a.id).localeCompare(String(b.id));
  });
  return result;
}

export function getBookBySlug(slug: string): Book | undefined {
  if (!slug) return undefined;
  const normalized = decodeURIComponent(slug).toLowerCase().trim();
  const catalog = getAllBooks();
  return catalog.find(
    (b) =>
      (b.slug && b.slug.toLowerCase() === normalized) ||
      (b.shortSlug && b.shortSlug.toLowerCase() === normalized) ||
      (b.title && slugifyBookTitle(b.title) === normalized) ||
      String(b.id).toLowerCase() === normalized ||
      (b.code && b.code.toLowerCase() === normalized)
  );
}

export function getBookByIsbn(isbn: string): Book | undefined {
  if (!isbn) return undefined;
  const clean = isbn.replace(/-/g, "");
  const catalog = getAllBooks();
  return catalog.find(
    (b) =>
      (b.isbn && b.isbn.replace(/-/g, "") === clean) ||
      (b.isbnDigital && b.isbnDigital.replace(/-/g, "") === clean)
  );
}
