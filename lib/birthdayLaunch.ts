import { Book, slugifyBookTitle } from "@/lib/data/books";

export const BIRTHDAY_LAUNCH_EVENT_KEY = "hasini-oct30-2026";
export const BIRTHDAY_LAUNCH_PATH = "/launch/hasini-oct30";

export interface BirthdayLaunchState {
  eventKey: string;
  honoreeName: string;
  eventDate: string;
  isLaunched: boolean;
  launchedAt: string | null;
  books: Book[];
}

export const DEFAULT_HASINI_LAUNCH_BOOKS: Book[] = [
  {
    id: "10",
    doiSuffix: "lp.book.010",
    slug: "deep-learning-and-neural-network-architectures",
    shortSlug: "deep-learning",
    title: "DEEP LEARNING AND NEURAL NETWORK ARCHITECTURES: THEORY TO PRACTICE",
    authors: "Lurnexa Academic Press",
    domain: "Computer Science & Engineering / Deep Learning",
    isbn: "978-81-903315-9-3",
    isbnDigital: "978-81-903315-9-4",
    pages: 264,
    price: 649,
    digitalPrice: 299,
    code: "DL",
    pdfFileName: "deep_learning.pdf",
    coverImg: "/portal_coverpages/ai.jpeg",
    publishedDate: "October 30, 2026",
    tag: "Launched Oct 30",
    stockStatus: "in-stock",
    rentalEnabled: true,
    description:
      "Specially launched on October 30 in celebration of Hasini's Birthday. This comprehensive textbook explores modern deep learning architectures, convolutional and transformer networks, optimization dynamics, and real-world AI deployment.",
    longDescription:
      "Deep Learning and Neural Network Architectures: Theory to Practice provides an authoritative, hands-on academic treatment of modern neural computation, backpropagation, CNNs, RNNs, Vision Transformers, Large Language Models, and generative AI systems. Officially inaugurated during the October 30 Grand Birthday Book Launch by Hasini.",
    keywords: [
      "Deep Learning",
      "Neural Networks",
      "Deep Learning textbook",
      "Transformer architectures",
      "Lurnexa Deep Learning book"
    ],
    tableOfContents: [
      "Chapter 1: Foundations of Deep Neural Networks & Perceptrons",
      "Chapter 2: Backpropagation, Gradient Descent & Optimization",
      "Chapter 3: Convolutional Neural Networks (CNNs) & Computer Vision",
      "Chapter 4: Sequence Modeling, RNNs, LSTMs & Attention Mechanisms",
      "Chapter 5: Transformers, Foundation Models & Generative AI",
      "Chapter 6: Model Compression, Deployment & Responsible AI"
    ]
  },
  {
    id: "11",
    doiSuffix: "lp.book.011",
    slug: "cloud-computing-and-devops-engineering",
    shortSlug: "cloud-computing",
    title: "CLOUD COMPUTING AND MODERN DEVOPS ENGINEERING",
    authors: "Lurnexa Academic Press",
    domain: "Computer Science & Engineering / Cloud & DevOps",
    isbn: "978-81-903315-9-5",
    isbnDigital: "978-81-903315-9-6",
    pages: 242,
    price: 599,
    digitalPrice: 279,
    code: "CC",
    pdfFileName: "cloud_computing.pdf",
    coverImg: "/portal_coverpages/data_streaming.jpeg",
    publishedDate: "October 30, 2026",
    tag: "Launched Oct 30",
    stockStatus: "in-stock",
    rentalEnabled: true,
    description:
      "Specially launched on October 30 in celebration of Hasini's Birthday. An industry-aligned textbook covering distributed cloud infrastructure, microservices, Docker, Kubernetes orchestration, and automated CI/CD pipelines.",
    longDescription:
      "Cloud Computing and Modern DevOps Engineering guides students and engineers from foundational virtualization and cloud service models (IaaS, PaaS, SaaS) to container orchestration, serverless computing, Infrastructure as Code (IaC), and site reliability engineering. Officially inaugurated during the October 30 Grand Birthday Book Launch by Hasini.",
    keywords: [
      "Cloud Computing",
      "DevOps Engineering",
      "Cloud Computing textbook",
      "Kubernetes and Docker book",
      "Lurnexa Cloud textbook"
    ],
    tableOfContents: [
      "Chapter 1: Cloud Computing Paradigms, Virtualization & Architecture",
      "Chapter 2: Microservices Design & Containerization with Docker",
      "Chapter 3: Kubernetes Orchestration & Cloud-Native Scaling",
      "Chapter 4: Continuous Integration, Continuous Delivery (CI/CD) & DevOps",
      "Chapter 5: Serverless Architectures, Observability & Cloud Security",
      "Chapter 6: Multi-Cloud Cost Optimization & Site Reliability Engineering"
    ]
  }
];

export function normalizeLaunchBook(raw: Partial<Book>, fallback: Book): Book {
  const id = raw.id || fallback.id;
  const title = (raw.title || fallback.title).trim();
  const slug = (raw.slug || slugifyBookTitle(title) || fallback.slug).trim();
  const cleanedChapters = Array.isArray(raw.tableOfContents)
    ? raw.tableOfContents.map((c) => String(c || "").trim()).filter(Boolean)
    : [];

  return {
    ...fallback,
    ...raw,
    id,
    title,
    slug,
    shortSlug: raw.shortSlug || fallback.shortSlug || slug.slice(0, 28),
    authors: (raw.authors || fallback.authors).trim(),
    domain: (raw.domain || fallback.domain).trim(),
    isbn: (raw.isbn || fallback.isbn).trim(),
    isbnDigital: (raw.isbnDigital || fallback.isbnDigital).trim(),
    pages: Number(raw.pages) > 0 ? Number(raw.pages) : fallback.pages,
    price: Number(raw.price) > 0 ? Number(raw.price) : fallback.price,
    digitalPrice: Number(raw.digitalPrice) > 0 ? Number(raw.digitalPrice) : fallback.digitalPrice,
    code: (raw.code || fallback.code).trim().toUpperCase(),
    pdfFileName: (raw.pdfFileName || fallback.pdfFileName).trim(),
    previewPdfUrl:
      raw.previewPdfUrl && raw.previewPdfUrl.trim().length > 0
        ? raw.previewPdfUrl.trim()
        : `/api/birthday-launch/preview-pdf?bookId=${encodeURIComponent(id)}`,
    customPreviewPdfDataUrl: raw.customPreviewPdfDataUrl || undefined,
    customFullBookPdfDataUrl: raw.customFullBookPdfDataUrl || undefined,
    fullBookPdfSize: typeof raw.fullBookPdfSize === "number" ? raw.fullBookPdfSize : undefined,
    fullBookPdfUploadedAt: raw.fullBookPdfUploadedAt || undefined,
    coverImg: (raw.coverImg || fallback.coverImg).trim(),
    publishedDate: (raw.publishedDate || fallback.publishedDate).trim(),
    tag: (raw.tag || fallback.tag || "Launched Oct 30").trim(),
    description: (raw.description || fallback.description).trim(),
    longDescription: (raw.longDescription || raw.description || fallback.longDescription || "").trim(),
    stockStatus: raw.stockStatus || fallback.stockStatus || "in-stock",
    rentalEnabled: raw.rentalEnabled ?? true,
    keywords: Array.isArray(raw.keywords) && raw.keywords.length > 0 ? raw.keywords : fallback.keywords,
    tableOfContents:
      cleanedChapters.length > 0
        ? cleanedChapters
        : fallback.tableOfContents
  };
}

