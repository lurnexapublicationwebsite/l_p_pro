import { useState } from 'react';
import { BookOpen, ChevronRight, Tag, User, X, Info, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const textbooks = [
  {
    id: 1,
    title: "INDIAN MINERAL IMPORT POLICY OPTIONS: AN ECONOMYWIDE ANALYSIS",
    author: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar",
    domain: "Economics / Trade Policy",
    status: "In Press",
    date: "2026-05-18",
    isbn: "978-81-685077-7-7",
    aboutBook: "This study presents a comprehensive and data-driven examination of India's mineral import landscape, offering a distinctive economy-wide perspective rarely found in existing literature. By integrating long-term trade trends with advanced simulation and modelling techniques, it moves beyond conventional descriptive analysis to evaluate the real economic implications of mineral import decisions on output, employment, prices, and trade dynamics. Covering a wide spectrum of critical minerals and situating India within the global resource ecosystem, the study provides a balanced and policy-relevant framework for understanding the interplay between domestic production and strategic imports.",
    aboutAuthor: "Dr. Badri Narayanan Gopalakrishnan: Globally recognized economist associated with University of Washington and Purdue University; former advisor to World Bank and IMF.\n\nVishnu Dasgupta: Independent economist specializing in macroeconomics and international trade, with a focus on bridging governance and industry needs.\n\nKannan Kumar: Independent economist and advocate with expertise in trade and industrial policy, contributing to national policy initiatives and international trade negotiations."
  },
  {
    id: 2,
    title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS",
    author: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    domain: "CSE / Machine Learning",
    status: "In Press",
    date: "2026-05-18",
    isbn: "978-81-685077-3-9",
    aboutBook: "This book offers a systematic and in-depth exploration of machine learning, designed to help readers build a strong foundation while progressing toward advanced applications. It begins by introducing the core principles of machine learning, including data representation, statistical thinking, and the fundamental paradigms of supervised, unsupervised, and reinforcement learning.\n\nAdopting a structured approach, the book breaks down complex algorithms into clear, step-by-step explanations, enabling readers to understand not just how models work, but why they work. Key techniques such as regression, classification, clustering, decision trees, neural networks, and deep learning are presented with mathematical intuition, practical examples, and real-world use cases.",
    aboutAuthor: "Dr. Halavath Balaji: Professor at Sreenidhi Institute of Science and Technology, expert in guiding research and mentoring students toward academic success.\n\nJogu Saritha: Assistant Professor at Sreenidhi Institute of Science and Technology and Research Scholar at NIT Jalandhar, contributing significantly to education and research.\n\nPallavi B: Assistant Professor at Sreenidhi Institute of Science and Technology with 18 years of teaching experience, currently a research scholar at SR University specializing in Machine Learning."
  },
  {
    id: 3,
    title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION",
    author: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
    domain: "CSE / DBMS",
    status: "In Press",
    date: "2026-05-18",
    isbn: "978-81-685077-5-3",
    aboutBook: "This textbook provides a comprehensive and structured introduction to the fundamental concepts, design principles, and implementation techniques of Database Management Systems (DBMS). It is designed to guide learners from foundational topics such as data models and relational theory to advanced areas including SQL, schema refinement (normalization), and transaction management.\n\nThe book emphasizes both theoretical understanding and practical application, enabling students to develop a strong conceptual base while gaining hands-on experience with real-world database scenarios. Key topics such as relational algebra, integrity constraints, normalization techniques, concurrency control, and ACID properties are presented with clear explanations and illustrative examples.",
    aboutAuthor: "Dr. Halavath Balaji: Professor at Sreenidhi Institute of Science and Technology, expert in guiding research and mentoring students toward academic success.\n\nJogu Saritha: Assistant Professor at Sreenidhi Institute of Science and Technology and Research Scholar at NIT Jalandhar, contributing significantly to education and research.\n\nPallavi B: Assistant Professor at Sreenidhi Institute of Science and Technology with 18 years of teaching experience, currently a research scholar at SR University specializing in Machine Learning."
  },
  {
    id: 4,
    title: "ENTREPRENEURSHIP DEVELOPMENT: CONCEPTS TO CREATION",
    author: "Dr. Sourav Mondal",
    domain: "Management / Entrepreneurship",
    status: "In Press",
    date: "2026-05-18",
    isbn: "978-81-685077-9-1",
    aboutBook: "This book provides a comprehensive and practical roadmap for aspiring entrepreneurs, students, and professionals who aim to transform ideas into successful ventures. It begins by building a strong conceptual foundation of entrepreneurship—covering key theories, traits of successful entrepreneurs, and the evolving role of innovation in today’s dynamic business environment.\n\nMoving beyond theory, the book systematically guides readers through the entrepreneurial journey—from opportunity identification and idea validation to business model development and resource mobilization. It emphasizes real-world applicability by integrating case studies, contemporary examples, and structured frameworks that help bridge the gap between academic knowledge and practical execution.",
    aboutAuthor: "Dr. Sourav Mondal is a faculty member at the Indian Institute of Management Jammu, with expertise in entrepreneurship, strategic management, and operations. He earned his Ph.D. in Entrepreneurship from the Indian Institute of Technology (ISM) Dhanbad, where his doctoral research received the Best Thesis Award. He also holds postdoctoral experience from IIT Delhi.\n\nPrior to joining IIM Jammu, he served as an Assistant Professor at the Symbiosis Centre for Management Studies, Pune. His teaching and research interests include Entrepreneurship, Supply Chain Management, and Corporate Sustainability, with a focus on ESG and the Circular Economy."
  },
];

export default function Upcoming() {
  const [selectedBook, setSelectedBook] = useState<any>(null);

  return (
    <>
      <div className="py-8">
        <h1 className="text-2xl font-bold mb-4 text-slate-900">Upcoming Books</h1>
        <p className="text-slate-600 mb-8">Manage and track the editorial progress of upcoming publications.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {textbooks.map((book) => (
            <div key={book.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-300 flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-6 w-6" />
                </div>
                <span className={`text-[10px] uppercase font-black tracking-wider px-3 py-1.5 rounded-full ${
                  book.status === 'Designing Team' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {book.status}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-4 line-clamp-2">{book.title}</h3>

              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{book.author}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center">
                    <Tag className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{book.domain}</span>
                </div>
                {book.isbn && (
                  <div className="flex items-center gap-3 text-xs text-indigo-700 font-bold bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100">
                    <span className="font-black text-indigo-400">ISBN</span>
                    <span className="font-mono tracking-tight">{book.isbn}</span>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedBook(book)}
                className="mt-auto w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300"
              >
                View Details
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBook(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3 text-blue-600">
                  <BookOpen size={24} className="font-bold" />
                  <span className="text-sm font-black uppercase tracking-widest text-slate-400">Book Details</span>
                </div>
                <button 
                  onClick={() => setSelectedBook(null)}
                  className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 overflow-y-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 mb-6 leading-tight">
                    {selectedBook.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <Tag size={14} />
                      {selectedBook.domain}
                    </span>
                    <span className="px-4 py-2 bg-blue-50 rounded-xl text-blue-600 text-xs font-bold uppercase tracking-wide">
                      {selectedBook.status}
                    </span>
                    {selectedBook.isbn && (
                      <span className="px-4 py-2 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg">
                        ISBN: {selectedBook.isbn}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid gap-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        <Info size={18} />
                      </div>
                      <h4 className="font-black uppercase tracking-wider text-sm">About the Book</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                      {selectedBook.aboutBook}
                    </p>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                      <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <GraduationCap size={18} />
                      </div>
                      <h4 className="font-black uppercase tracking-wider text-sm">About the Author</h4>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                      <p className="text-slate-900 font-bold mb-2">{selectedBook.author}</p>
                      <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {selectedBook.aboutAuthor}
                      </p>
                    </div>
                  </section>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium">
                  Expected Publication Date: <span className="text-slate-900 font-bold">{selectedBook.date}</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}