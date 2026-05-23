"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, ArrowUpRight, Sparkles, ChevronRight, X, Filter, Check, Download, ArrowLeft } from 'lucide-react';
import NavigationPage from '@/components/Home/nav/page';
import { allArticles, slugify } from '@/lib/data/articles';
import Link from 'next/link';

export default function ProfessionalExplore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState(allArticles);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let result = allArticles.filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.journal.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (activeFilter !== 'All') {
      result = result.filter(article => article.category.toUpperCase() === activeFilter.toUpperCase());
    }
    setFilteredArticles(result);
  }, [searchTerm, activeFilter]);

  const categories = ['All', 'ARESS', 'CIMS', 'IAEES','AICET'];

  return (
    <div className="relative min-h-screen bg-white">
      <NavigationPage />

      {/* Decorative Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-orange-50/50 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-50/40 blur-[100px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-12 lg:pt-36 lg:pb-24 font-sans">
        <header className="mb-10 space-y-4">
          {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-[0.2em]">
            <Sparkles size={10} className="text-orange-400" /> Research Archive 2026
          </div> */}
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950 leading-tight">
            Vol. 01- Issue  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">01- April 2026 </span>
          </h1>
        </header>

        {/* Action Bar */}
        <div className="flex items-center gap-3 mb-12">
          <div className="flex-grow relative group">
            <div className="relative flex items-center bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm focus-within:shadow-md transition-all">
              <Search className="text-slate-400 mr-3" size={18} />
              <input 
                ref={searchInputRef}
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author or journal..." 
                className="bg-transparent w-full outline-none text-sm font-medium placeholder:text-slate-300"
              />
              <kbd className="hidden md:inline-flex whitespace-nowrap px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold text-slate-400">
                CTRL + K
              </kbd>
            </div>
          </div>
          
          <div className="relative" ref={filterRef}>
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-bold text-xs ${activeFilter !== 'All' ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50 shadow-sm'}`}>
              <Filter size={16} />
              <span className="hidden sm:inline">{activeFilter === 'All' ? 'Filter' : activeFilter}</span>
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2">
                  {categories.map((cat) => (
                    <button key={cat} onClick={() => { setActiveFilter(cat); setIsFilterOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors">
                      {cat}
                      {activeFilter === cat && <Check size={14} className="text-orange-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
              <ArticleCard 
              key={article.id} 
              article={article} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function ArticleCard({ article }: { article: any }) {
  return (
    <div className="group relative">
      <div className="absolute -inset-1 bg-gradient-to-br from-orange-500/5 to-transparent rounded-[24px] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
      
      <div className="relative h-full bg-white border border-slate-100 rounded-[20px] p-6 transition-all duration-500 group-hover:border-orange-200 group-hover:-translate-y-2 flex flex-col shadow-sm hover:shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-orange-500 bg-orange-50 px-2 py-0.5 rounded w-fit">
              {article.category}
            </span>
            <span className="text-[10px] font-bold text-slate-400 line-clamp-1 uppercase tracking-tight">{article.journal}</span>
          </div>
          <div className="flex flex-col items-end">
            <FileText size={16} className="text-slate-300 group-hover:text-orange-500 transition-all duration-500 transform group-hover:rotate-12" />
            <span className="text-[8px] font-black text-slate-300 mt-1 uppercase tracking-tighter">{article.pages}</span>
          </div>
        </div>

        <div className="flex-grow space-y-2">
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-tight">
            {article.title}
          </h2>
          <p className="text-slate-400 text-xs leading-relaxed font-medium line-clamp-2">
            {article.description}
          </p>
        </div>

        <div className="mt-6 space-y-0.5">
          <div className="border-b border-slate-100 pb-1 flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sub Division Journal:</span>
            <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{article.subJournal}</span>
          </div>
          <div className="border-b border-slate-100 py-1.5 flex items-center justify-between">
             <span className="text-[11px] font-bold text-slate-900">{article.author}</span>
             <span className="text-[9px] text-slate-400 font-medium italic">{article.date || 'Q1 2026'}</span>
          </div>
        </div>

        <Link 
          href={`/Articles/${slugify(article.title)}`}
          className="w-full mt-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:bg-orange-600 shadow-md"
        >
          View Full Publication <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}