import { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, Tag, User, X, Info, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const textbooks = [
  {
    id: 1,
    title: "INDIAN MINERAL IMPORT POLICY OPTIONS: AN ECONOMYWIDE ANALYSIS",
    author: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar",
    domain: "Economics / Trade Policy",
    status: "In Press",
    date: "2026-08-30",
    isbn: "978-81-685077-7-7",
    pdfFileName: "minerals.pdf",
    aboutBook: "This study presents a comprehensive and data-driven examination of India's mineral import landscape, offering a distinctive economy-wide perspective rarely found in existing literature. By integrating long-term trade trends with advanced simulation and modelling techniques, it moves beyond conventional descriptive analysis to evaluate the real economic implications of mineral import decisions on output, employment, prices, and trade dynamics. Covering a wide spectrum of critical minerals and situating India within the global resource ecosystem, the study provides a balanced and policy-relevant framework for understanding the interplay between domestic production and strategic imports.",
    aboutAuthor: "Dr. Badri Narayanan Gopalakrishnan: Globally recognized economist associated with University of Washington and Purdue University; former advisor to World Bank and IMF.\n\nVishnu Dasgupta: Independent economist specializing in macroeconomics and international trade, with a focus on bridging governance and industry needs.\n\nKannan Kumar: Independent economist and advocate with expertise in trade and industrial policy, contributing to national policy initiatives and international trade negotiations."
  },
  {
    id: 4,
    title: "ENTREPRENEURSHIP DEVELOPMENT: CONCEPTS TO CREATION",
    author: "Dr. V. Padmaja, Dr. Archan Mitra, Dr. C. Udaya Kumar",
    domain: "Management / Entrepreneurship",
    status: "In Press",
    date: "2026-08-30",
    isbn: "978-81-685077-6-0",
    pdfFileName: "Gig_Economy_Social_Security_Research_Paper.pdf",
    aboutBook: "This book provides a comprehensive and practical roadmap for aspiring entrepreneurs, students, and professionals who aim to transform ideas into successful ventures. It begins by building a strong conceptual foundation of entrepreneurship—covering key theories, traits of successful entrepreneurs, and the evolving role of innovation in today’s dynamic business environment.\n\nMoving beyond theory, the book systematically guides readers through the entrepreneurial journey—from opportunity identification and idea validation to business model development and resource mobilization. It emphasizes real-world applicability by integrating case studies, contemporary examples, and structured frameworks that help bridge the gap between academic knowledge and practical execution.",
    aboutAuthor: "Dr. Sourav Mondal is a faculty member at the Indian Institute of Management Jammu, with expertise in entrepreneurship, strategic management, and operations. He earned his Ph.D. in Entrepreneurship from the Indian Institute of Technology (ISM) Dhanbad, where his doctoral research received the Best Thesis Award. He also holds postdoctoral experience from IIT Delhi.\n\nPrior to joining IIM Jammu, he served as an Assistant Professor at the Symbiosis Centre for Management Studies, Pune. His teaching and research interests include Entrepreneurship, Supply Chain Management, and Corporate Sustainability, with a focus on ESG and the Circular Economy."
  },
  {
    id: 5,
    title: "PYTHON PROGRAMMING: PRINCIPLES AND PRACTICE",
    author: "Dr. Prakash Shanmurthy, Dr. J. Somasekar, Mr. Vaibhav Prabhakar Raibole, Mr. Shiva Prasad Munukuntla",
    domain: "Computer Science / Programming",
    status: "In Press",
    date: "2026-08-30",
    isbn: "978-81-685077-2-2",
    pdfFileName: "python_programming.pdf",
    aboutBook: "This book provides a comprehensive and hands-on foundation in Python programming, designed for students, educators, and software development professionals. It covers essential syntax, core data structures, object-oriented concepts, and practical problem-solving techniques. Emphasizing real-world applications, industry coding standards, and algorithmic thinking, the text guides readers through structured examples and project-oriented learning to build proficiency in modern Python software development.",
    aboutAuthor: ""
  }
];

export default function Upcoming() {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [publishedPdfs, setPublishedPdfs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/textbooks/published")
      .then((res) => res.ok ? res.json() : { files: [] })
      .then((data) => {
        setPublishedPdfs(data.files || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load published books:", err);
        setIsLoading(false);
      });
  }, []);

  const filteredTextbooks = textbooks.filter(
    (book) => {
      // Only hide the Minerals textbook once it is published; keep the remaining books in upcoming
      if (book.pdfFileName === "minerals.pdf") {
        return !publishedPdfs.includes("minerals.pdf");
      }
      return true;
    }
  );

  return (
    <>
      <div className="py-4">
        {/* Section Header */}
        <div className="mb-6 space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Upcoming Books</h1>
          <p className="text-sm text-[#64748B]">Manage and track the editorial progress of upcoming publications.</p>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="h-8 w-8 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Checking publication statuses...</p>
          </div>
        ) : filteredTextbooks.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm my-6 space-y-4">
            <div className="h-12 w-12 bg-fuchsia-50 text-fuchsia-600 rounded-full flex items-center justify-center mx-auto border border-fuchsia-100">
              <BookOpen size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#0F172A]">No Upcoming Books</h3>
              <p className="text-xs text-[#64748B] leading-normal">
                All currently planned textbooks have completed editorial review and are fully published. Visit the "Published Books" tab or our digital bookstore to view them!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTextbooks.map((book) => (
              <div 
                key={book.id} 
                className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-[410px] group"
              >
                {/* Top Row - Status Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] text-fuchsia-600 font-extrabold uppercase tracking-widest bg-fuchsia-50 border border-fuchsia-200/30 px-2 py-0.5 rounded-md">
                    IN PRESS
                  </span>
                  <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider bg-slate-50 border border-[#E2E8F0] px-2 py-0.5 rounded-md">
                    {book.domain.split(" / ")[0]}
                  </span>
                </div>

                {/* Core Title and Authors */}
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-[#0F172A] leading-snug tracking-tight line-clamp-2 group-hover:text-fuchsia-600 transition-colors duration-200">
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-medium line-clamp-1">
                    By {book.author}
                  </p>
                </div>

                {/* Metadata & Progress Section */}
                <div className="space-y-4 pt-2">
                  {/* Category Chip & ISBN Container */}
                  <div className="flex flex-wrap gap-2 items-center justify-between">
                    <span className="text-[10px] font-bold text-fuchsia-600">
                      {book.domain.split(" / ")[1] || book.domain}
                    </span>
                    {book.isbn && (
                      <span className="text-[10px] font-bold font-mono text-[#64748B] bg-slate-50 border border-[#E2E8F0] px-2 py-1 rounded">
                        ISBN: {book.isbn}
                      </span>
                    )}
                  </div>

                  {/* Editorial Progress Indicator */}
                  <div className="space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[9px] font-bold text-[#64748B] uppercase tracking-wider">
                      <span>Editorial Stage</span>
                      <span className="text-fuchsia-600 font-extrabold">Production</span>
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <div className="h-1 flex-1 bg-[#10B981] rounded-full" title="Manuscript: Complete" />
                      <div className="h-1 flex-1 bg-[#10B981] rounded-full" title="Peer Review: Complete" />
                      <div className="h-1 flex-1 bg-fuchsia-600 rounded-full animate-pulse" title="Production: In Progress" />
                      <div className="h-1 flex-1 bg-[#E2E8F0] rounded-full" title="Publishing: Pending" />
                    </div>
                  </div>
                </div>

                {/* Footer CTA */}
                <div className="pt-4 border-t border-[#E2E8F0] mt-4">
                  <button 
                    onClick={() => setSelectedBook(book)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-fuchsia-600 hover:text-white text-[#0F172A] font-bold text-xs transition-all duration-200"
                  >
                    <span>View Details</span>
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
              className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3 text-fuchsia-600">
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
                  <h2 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
                    {selectedBook.title}
                  </h2>
                  <p className="text-slate-600 font-semibold text-sm mb-6 flex items-center gap-2">
                    <User size={16} className="text-fuchsia-600 shrink-0" />
                    <span>By {selectedBook.author}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-3 mb-8">
                    <span className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <Tag size={14} />
                      {selectedBook.domain}
                    </span>
                    <span className="px-4 py-2 bg-fuchsia-50 rounded-xl text-fuchsia-600 text-xs font-bold uppercase tracking-wide">
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
                      <div className="p-2 bg-fuchsia-100 rounded-lg text-fuchsia-600">
                        <Info size={18} />
                      </div>
                      <h4 className="font-black uppercase tracking-wider text-sm">About the Book</h4>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                      {selectedBook.aboutBook}
                    </p>
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