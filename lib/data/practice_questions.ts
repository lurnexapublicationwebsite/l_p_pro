export interface Question {
  id: string;
  bookId: string;
  questionText: string;
  type?: 'mcq' | 'written';
  chapter?: number;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: 'A' | 'B' | 'C' | 'D';
  category?: 'practice' | 'quiz';
  selectedForPractice?: boolean;
}

export const SEED_QUESTIONS: Question[] = [
  // Book 1: Mineral Policy Options (bookId: "1")
  {
    id: "mp-1",
    bookId: "1",
    questionText: "What is the primary objective of an economy-wide modelling approach in mineral policy?",
    chapter: 1,
    optionA: "To calculate mining company profit margins",
    optionB: "To analyze the interdependencies and feedback loops across all sectors of the economy",
    optionC: "To set global prices for critical minerals",
    optionD: "To replace geological field studies",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "mp-2",
    bookId: "1",
    questionText: "Which economic consequence is typically associated with high import dependency on critical minerals?",
    chapter: 2,
    optionA: "Complete immunity to global supply chain disruptions",
    optionB: "Consistent drop in domestic manufacturing costs",
    optionC: "Vulnerability to geopolitical risks and price volatility",
    optionD: "Immediate expansion of domestic reserves",
    correctOption: "C",
    category: "practice"
  },
  {
    id: "mp-3",
    bookId: "1",
    questionText: "What does a 'strategic mineral reserve' refer to?",
    chapter: 3,
    optionA: "Stockpiles of critical minerals held by governments to safeguard against supply shocks",
    optionB: "A protected wildlife reserve where mining is permanently banned",
    optionC: "The total estimated deposits yet to be discovered by geologists",
    optionD: "The financial reserves of the Ministry of Mines",
    correctOption: "A",
    category: "practice"
  },
  {
    id: "mp-4",
    bookId: "1",
    questionText: "How do trade tariffs on raw mineral imports affect domestic manufacturers downstream?",
    chapter: 1,
    optionA: "They reduce their production costs",
    optionB: "They increase input costs, potentially making local products less competitive globally",
    optionC: "They eliminate their need for raw materials",
    optionD: "They automatically double the quality of manufactured goods",
    correctOption: "B",
    category: "quiz"
  },
  {
    id: "mp-5",
    bookId: "1",
    questionText: "Which modelling technique is commonly used to simulate policy impacts on trade, output, and employment?",
    chapter: 2,
    optionA: "Linear regression only",
    optionB: "Computable General Equilibrium (CGE) models",
    optionC: "Standard spreadsheets without formulas",
    optionD: "Simple keyword searches in trade documents",
    correctOption: "B",
    category: "quiz"
  },

  // Book 2: Machine Learning (bookId: "2")
  {
    id: "ml-1",
    bookId: "2",
    questionText: "What is the purpose of a validation dataset in machine learning workflows?",
    chapter: 1,
    optionA: "To train the model's weights and parameters directly",
    optionB: "To tune hyperparameters and prevent overfitting during the selection phase",
    optionC: "To write the final product code",
    optionD: "To replace the need for clean data annotations",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "ml-2",
    bookId: "2",
    questionText: "Which phenomenon is occurring when a model performs exceptionally on training data but poorly on test data?",
    chapter: 2,
    optionA: "Underfitting",
    optionB: "Overfitting",
    optionC: "Feature Scaling",
    optionD: "Data Imbalance",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "ml-3",
    bookId: "2",
    questionText: "In supervised learning, what role does gradient descent play?",
    chapter: 3,
    optionA: "It randomly generates new training samples",
    optionB: "It minimizes the loss function by iteratively updating model weights",
    optionC: "It visualizes high-dimensional datasets in 2D",
    optionD: "It deletes redundant labels in the dataset",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "ml-4",
    bookId: "2",
    questionText: "Which neural network architecture is widely used for computer vision and image classification?",
    chapter: 1,
    optionA: "Recurrent Neural Networks (RNN)",
    optionB: "Convolutional Neural Networks (CNN)",
    optionC: "Generative Adversarial Networks (GAN) only",
    optionD: "Long Short-Term Memory (LSTM) networks",
    correctOption: "B",
    category: "quiz"
  },
  {
    id: "ml-5",
    bookId: "2",
    questionText: "In clustering algorithms like K-Means, how is the optimal number of clusters commonly estimated?",
    chapter: 2,
    optionA: "By using the Elbow Method and inertia plots",
    optionB: "By counting the total columns in the dataset",
    optionC: "By dividing the rows by two",
    optionD: "By selecting a random number between 1 and 100",
    correctOption: "A",
    category: "quiz"
  },

  // Book 3: DBMS (bookId: "3")
  {
    id: "db-1",
    bookId: "3",
    questionText: "What does the 'I' in ACID properties of transaction management stand for?",
    chapter: 1,
    optionA: "Inheritance",
    optionB: "Isolation",
    optionC: "Indexation",
    optionD: "Iteration",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "db-2",
    bookId: "3",
    questionText: "In relational database design, which normal form eliminates transitive functional dependencies?",
    chapter: 2,
    optionA: "First Normal Form (1NF)",
    optionB: "Second Normal Form (2NF)",
    optionC: "Third Normal Form (3NF)",
    optionD: "Boyce-Codd Normal Form (BCNF)",
    correctOption: "C",
    category: "practice"
  },
  {
    id: "db-3",
    bookId: "3",
    questionText: "What is the key difference between a PRIMARY KEY and a UNIQUE key constraint?",
    chapter: 3,
    optionA: "A Primary Key allows multiple NULL values, Unique does not",
    optionB: "A table can have only one Primary Key, but multiple Unique keys; Primary Key cannot contain NULLs",
    optionC: "Unique key enforces indexes, Primary Key does not",
    optionD: "There is no difference; they are exact aliases",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "db-4",
    bookId: "3",
    questionText: "Which SQL clause is used to filter aggregate groups created by a GROUP BY clause?",
    chapter: 1,
    optionA: "WHERE",
    optionB: "HAVING",
    optionC: "LIMIT",
    optionD: "ORDER BY",
    correctOption: "B",
    category: "quiz"
  },
  {
    id: "db-5",
    bookId: "3",
    questionText: "What is a database deadlock?",
    chapter: 2,
    optionA: "A state where the database server crashes due to power failure",
    optionB: "A situation where two or more transactions are waiting indefinitely for each other to release locks",
    optionC: "An index that is no longer referenced by any table query",
    optionD: "A deleted database backup file",
    correctOption: "B",
    category: "quiz"
  },

  // Book 4: Entrepreneurship (bookId: "4")
  {
    id: "ent-1",
    bookId: "4",
    questionText: "What is the core purpose of a Minimum Viable Product (MVP) in lean startup methodology?",
    chapter: 1,
    optionA: "To build a complete product with all envisioned features",
    optionB: "To test hypotheses and learn from customers with the least amount of effort and cost",
    optionC: "To secure a patent before competitor entry",
    optionD: "To hire the maximum number of developers",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "ent-2",
    bookId: "4",
    questionText: "In startup financing, what is the main distinction of Venture Capital (VC) compared to Angel Investing?",
    chapter: 2,
    optionA: "VCs invest their own personal capital; Angels invest institutional funds",
    optionB: "VCs manage pooled money from institutional investors; Angels are wealthy individuals investing personal capital",
    optionC: "VCs only invest in debt; Angels only invest in equity",
    optionD: "Angels require seats on the board of directors; VCs never do",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "ent-3",
    bookId: "4",
    questionText: "What does the Value Proposition block in a Business Model Canvas describe?",
    chapter: 3,
    optionA: "The revenue model and pricing structure",
    optionB: "The bundle of products and services that create value for a specific customer segment",
    optionC: "The marketing channels used to reach clients",
    optionD: "The list of key stakeholders and partners",
    correctOption: "B",
    category: "practice"
  },
  {
    id: "ent-4",
    bookId: "4",
    questionText: "What does ESG stand for in modern corporate strategy and sustainable development?",
    chapter: 1,
    optionA: "Economic, Social, and Governance",
    optionB: "Environmental, Social, and Governance",
    optionC: "Environmental, Scientific, and Global",
    optionD: "Energy, Safety, and Growth",
    correctOption: "B",
    category: "quiz"
  },
  {
    id: "ent-5",
    bookId: "4",
    questionText: "Which term describes the stage where a startup's product satisfies a strong market demand?",
    chapter: 2,
    optionA: "Ideation stage",
    optionB: "Product-Market Fit",
    optionC: "Pre-seed funding",
    optionD: "Initial Public Offering (IPO)",
    correctOption: "B",
    category: "quiz"
  },
  // Seeded Written Questions
  {
    id: "w-mp-1",
    bookId: "1",
    questionText: "Explain the core difference between economy-wide CGE models and partial equilibrium models in mineral policy analysis.",
    chapter: 1,
    type: "written",
    category: "practice"
  },
  {
    id: "w-mp-2",
    bookId: "1",
    questionText: "Describe the role strategic reserves play in mitigating critical mineral import vulnerability.",
    chapter: 2,
    type: "written",
    category: "quiz"
  },
  {
    id: "w-ml-1",
    bookId: "2",
    questionText: "Explain the mathematical difference between L1 and L2 regularization and how they influence feature sparsity.",
    chapter: 1,
    type: "written",
    category: "practice"
  },
  {
    id: "w-ml-2",
    bookId: "2",
    questionText: "Outline the architecture of a Convolutional Neural Network (CNN) and explain the function of pooling layers.",
    chapter: 2,
    type: "written",
    category: "quiz"
  },
  {
    id: "w-db-1",
    bookId: "3",
    questionText: "Compare and contrast B-Tree indexes and Hash indexes in database storage systems. When is each preferred?",
    chapter: 1,
    type: "written",
    category: "practice"
  },
  {
    id: "w-db-2",
    bookId: "3",
    questionText: "Explain the ACID properties of database transactions and how concurrency control protocols like 2PL ensure Isolation.",
    chapter: 2,
    type: "written",
    category: "quiz"
  },
  {
    id: "w-ent-1",
    bookId: "4",
    questionText: "Discuss the concept of 'pivoting' in lean startup methodology and provide a real-world example.",
    chapter: 1,
    type: "written",
    category: "practice"
  },
  {
    id: "w-ent-2",
    bookId: "4",
    questionText: "Describe the difference between equity financing and debt financing for early-stage ventures.",
    chapter: 2,
    type: "written",
    category: "quiz"
  }
];
