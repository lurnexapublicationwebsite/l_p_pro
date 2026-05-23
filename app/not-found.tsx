"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavigationPage />
      
      <main className="flex-grow flex items-center justify-center relative overflow-hidden px-6 pt-20">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl w-full text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-orange-50 text-orange-500 mb-8 shadow-sm">
              <FileQuestion size={40} />
            </div>
            
            <h1 className="text-8xl md:text-9xl font-black text-slate-900 mb-4 tracking-tighter">
              4<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">0</span>4
            </h1>
            
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
              Page Not Found
            </h2>
            
            <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-lg hover:-translate-y-1 w-full sm:w-auto"
              >
                <Home size={18} />
                Back to Home
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all w-full sm:w-auto"
              >
                <ArrowLeft size={18} />
                Go Back
              </button>
            </div>
            
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center">
                <p className="text-slate-400 text-sm font-medium mb-4 flex items-center gap-2">
                   <Search size={14} /> Quick search for what you need:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    {['Articles', 'Editorial Board', 'About Us', 'Contact'].map((item) => (
                        <Link 
                            key={item}
                            href={`/${item.toLowerCase().replace(/\s+/g, '')}`}
                            className="text-xs font-bold text-slate-500 hover:text-orange-500 transition-colors bg-slate-50 px-4 py-2 rounded-full border border-slate-100"
                        >
                            {item}
                        </Link>
                    ))}
                </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <FooterSection />
    </div>
  );
}
