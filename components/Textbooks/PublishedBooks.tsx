"use client";

import { useState } from "react";
import { BookOpen, ShoppingBag, Eye, X, User, Tag, ShieldAlert, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PublishedBooks() {
  const router = useRouter();
  const [selectedBookForPreview, setSelectedBookForPreview] = useState<any | null>(null);

  const books = [
    {
      id: "1",
      title: "Indian Mineral Import Policy Options: An Economywide Analysis",
      authors: "Badri Narayanan Gopalakrishnan, Vishnu Dasgupta, Kannan Kumar",
      domain: "Economics / Trade Policy",
      isbn: "978-81-685077-7-7",
      pages: 88,
      price: 999,
      code: "MP",
      pdfFileName: "minerals.pdf",
      publishedDate: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
      description: "This study presents a comprehensive and data-driven examination of India's mineral import landscape, offering a distinctive economy-wide perspective. By integrating long-term trade trends with advanced simulation and modelling techniques, it evaluates the real economic implications of mineral import decisions on output, employment, prices, and trade dynamics. Covering a wide spectrum of critical minerals and situating India within the global resource ecosystem, the study provides a balanced and policy-relevant framework for understanding the interplay between domestic production and strategic imports."
    },
    {
      id: "2",
      title: "MACHINE LEARNING: A STRUCTURED APPROACH TO ALGORITHMS AND INTELLIGENT SYSTEMS",
      authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
      domain: "CSE / Machine Learning",
      isbn: "978-81-685077-3-9",
      pages: 231,
      price: 700,
      code: "ML",
      pdfFileName: "ml.pdf",
      publishedDate: "May 18, 2026",
      description: "This book offers a systematic and in-depth exploration of machine learning, designed to help readers build a strong foundation while progressing toward advanced applications. It begins by introducing the core principles of machine learning, including data representation, statistical thinking, and the fundamental paradigms of supervised, unsupervised, and reinforcement learning."
    },
    {
      id: "3",
      title: "DATABASE MANAGEMENT SYSTEMS: CONCEPTS, DESIGN AND IMPLEMENTATION",
      authors: "Dr. Halavath Balaji, Jogu Saritha, Pallavi B",
      domain: "CSE / DBMS",
      isbn: "978-81-685077-5-3",
      pages: 248,
      price: 750,
      code: "DB",
      pdfFileName: "dbms.pdf",
      publishedDate: "May 18, 2026",
      description: "This textbook provides a comprehensive and structured introduction to the fundamental concepts, design principles, and implementation techniques of Database Management Systems (DBMS). It is designed to guide learners from foundational topics such as data models and relational theory to advanced areas including SQL, schema refinement (normalization), and transaction management."
    },
    {
      id: "5",
      title: "PRINCIPLES OF MICROECONOMICS FOR BUSINESS AND MANAGEMENT",
      authors: "Dr. Aruna Kumar Dash",
      domain: "Economics / Management",
      isbn: "978-81-685077-1-5",
      pages: 277,
      price: 600,
      code: "PM",
      pdfFileName: "Principles of Microeconomics for Business and Management.pdf",
      publishedDate: "May 18, 2026",
      description: "This textbook provides a comprehensive and structured introduction to the core principles of microeconomics tailored for business and management. It covers demand and supply analysis, consumer behavior, production theory, market structures, factor pricing, and real-world managerial decision making."
    }
  ];

  return (
    <div className="py-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {books.map((bookItem) => {
          let coverImg = "/portal_coverpages/minerals.jpg";
          if (bookItem.id === "2") coverImg = "/portal_coverpages/ml.png";
          if (bookItem.id === "3") coverImg = "/portal_coverpages/dbms.jpeg";
          if (bookItem.id === "5") coverImg = "/portal_coverpages/Principles of Microeconomics for Business and Management.jpeg";

          return (
            <div 
              key={bookItem.id} 
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Cover presentation */}
                <div 
                  onClick={() => router.push('/textbooks/store')}
                  className="relative w-full aspect-[4/5] rounded-xl bg-gradient-to-tr from-slate-100 to-fuchsia-50/30 flex items-center justify-center border border-slate-200/20 hover:scale-[1.01] transition-all duration-300 cursor-pointer overflow-hidden p-5"
                >
                  <div className="relative h-full aspect-[1/1.4] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] rounded-r overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                    <img 
                      src={coverImg}
                      className="w-full h-full object-cover"
                      alt={bookItem.title}
                    />
                    {/* Spine overlay effect */}
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
                    {/* Highlight gloss */}
                    <div className="absolute inset-y-0 left-2.5 w-[1px] bg-white/10" />
                  </div>
                </div>

                {/* Meta & Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[8px] text-fuchsia-600 font-extrabold uppercase tracking-widest bg-fuchsia-50 border border-fuchsia-200/30 px-1.5 py-0.5 rounded">
                      Peer-Reviewed
                    </span>
                    <span className="text-[8px] text-[#64748B] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      ISBN: {bookItem.isbn}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0F172A] line-clamp-2 leading-snug group-hover:text-fuchsia-600 transition-colors duration-200 h-10" title={bookItem.title}>
                    {bookItem.title}
                  </h3>

                  <p className="text-[11px] text-[#64748B] font-semibold line-clamp-1">
                    By {bookItem.authors}
                  </p>

                  <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                    {bookItem.description}
                  </p>
                </div>
              </div>

              {/* Pricing and Actions */}
              <div className="pt-4 mt-4 border-t border-[#E2E8F0] space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-[#0F172A]">₹{bookItem.price}</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push('/textbooks/store')}
                  className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2.5 rounded-xl text-[11px] text-center flex items-center justify-center gap-1.5 transition-all active:scale-98"
                >
                  <ShoppingBag size={12} />
                  <span>Purchase from Store</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
