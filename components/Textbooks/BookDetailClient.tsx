"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Book } from '@/lib/data/books';
import { 
  BookOpen, 
  ShoppingBag, 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  FileText, 
  Download, 
  User, 
  Calendar, 
  BookCheck, 
  Sparkles,
  Truck,
  Smartphone
} from 'lucide-react';

interface BookDetailClientProps {
  book: Book;
  relatedBooks: Book[];
}

export default function BookDetailClient({ book, relatedBooks }: BookDetailClientProps) {
  const [selectedFormat, setSelectedFormat] = useState<'physical' | 'soft'>('physical');

  const currentPrice = selectedFormat === 'physical' ? book.price : book.digitalPrice;

  return (
    <div className="space-y-8">
      {/* Hero Book Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Book Cover & Format Purchase Box */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="relative w-full max-w-xs aspect-[1/1.4] bg-slate-100 rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden group">
            <img
              src={book.coverImg}
              alt={`${book.title} cover`}
              className="w-full h-full object-cover rounded-2xl"
            />
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/25 via-black/10 to-transparent" />
          </div>

          {/* Format Selector Box */}
          <div className="w-full max-w-xs mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            
            {/* Format Toggle Tabs */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                Select Edition Format:
              </span>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-200/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('physical')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedFormat === 'physical'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen size={14} className={selectedFormat === 'physical' ? 'text-fuchsia-600' : ''} />
                  <span>Paperback</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFormat('soft')}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedFormat === 'soft'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone size={14} className={selectedFormat === 'soft' ? 'text-fuchsia-600' : ''} />
                  <span>Digital PDF</span>
                </button>
              </div>
            </div>

            {/* Price & Delivery Details */}
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">₹{currentPrice}</span>
                  {selectedFormat === 'soft' && (
                    <span className="text-xs text-slate-400 line-through">₹{book.price}</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {selectedFormat === 'physical' 
                    ? 'Hardcopy Print + Free Delivery' 
                    : 'Instant PDF Download + Portal Access'}
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                In Stock
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/textbooks/store/checkout?bookId=${book.id}&format=${selectedFormat}`}
                className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                {selectedFormat === 'physical' ? (
                  <>
                    <ShoppingBag size={16} />
                    <span>Buy Paperback (₹{currentPrice})</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Get Digital Copy (₹{currentPrice})</span>
                  </>
                )}
              </Link>
            </div>

            {/* Delivery/Feature Badges */}
            <div className="pt-2 border-t border-slate-200 space-y-2 text-[11px] text-slate-600">
              {selectedFormat === 'physical' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-fuchsia-600 shrink-0" />
                    <span>Free Home Delivery (3-5 Business Days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-fuchsia-600 shrink-0" />
                    <span>Premium Bound Academic Edition</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-fuchsia-600 shrink-0" />
                    <span>Instant Digital PDF Access After Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-fuchsia-600 shrink-0" />
                    <span>Read on Desktop, Tablet & Mobile</span>
                  </div>
                </>
              )}
              <div className="flex items-center gap-2">
                <Award size={14} className="text-fuchsia-600 shrink-0" />
                <span>Official ISBN: {book.isbn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Specifications & Content */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[11px] font-bold text-fuchsia-700 uppercase tracking-wider bg-fuchsia-50 px-2.5 py-0.5 rounded border border-fuchsia-200/50">
                {book.domain}
              </span>
              {book.tag && (
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                  {book.tag}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {book.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <User size={15} className="text-slate-400" />
                <span>Authors: <strong className="text-slate-900">{book.authors}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-slate-400" />
                <span>Published: {book.publishedDate}</span>
              </div>
            </div>
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">ISBN</span>
              <span className="text-xs font-mono font-bold text-slate-800">{book.isbn}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Pages</span>
              <span className="text-xs font-bold text-slate-800">{book.pages} Pages</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Paperback</span>
              <span className="text-xs font-bold text-slate-800">₹{book.price}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold block">Digital PDF</span>
              <span className="text-xs font-bold text-fuchsia-600">₹{book.digitalPrice}</span>
            </div>
          </div>

          {/* Book Description */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookCheck size={18} className="text-fuchsia-600" />
              About This Textbook
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {book.description}
            </p>
            {book.longDescription && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {book.longDescription}
              </p>
            )}
          </div>

          {/* Table of Contents */}
          {book.tableOfContents && book.tableOfContents.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} className="text-fuchsia-600" />
                Table of Contents
              </h2>
              <ul className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                {book.tableOfContents.map((chapter, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={14} className="text-fuchsia-600 mt-0.5 shrink-0" />
                    <span>{chapter}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Search Keywords Tags */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Academic Subjects:</span>
            <div className="flex flex-wrap gap-1.5">
              {book.keywords.slice(0, 8).map((kw, i) => (
                <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Related Books Section */}
      {relatedBooks.length > 0 && (
        <div className="mt-14 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">
              Other Textbooks from Lurnexa Publications
            </h2>
            <Link href="/textbooks/store" className="text-xs font-bold text-fuchsia-600 hover:underline">
              Explore All Textbooks →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedBooks.map((relBook) => (
              <div
                key={relBook.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <Link
                    href={`/textbooks/${relBook.slug}`}
                    className="aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center p-3 block"
                  >
                    <img
                      src={relBook.coverImg}
                      alt={relBook.title}
                      className="h-full object-cover rounded shadow-md group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <span className="text-[9px] font-bold text-fuchsia-600 uppercase bg-fuchsia-50 px-2 py-0.5 rounded border border-fuchsia-200/40 inline-block">
                    ISBN: {relBook.isbn}
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-fuchsia-600 line-clamp-2 transition-colors">
                    <Link href={`/textbooks/${relBook.slug}`}>{relBook.title}</Link>
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1">By {relBook.authors}</p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900">₹{relBook.price}</span>
                    <span className="text-[10px] text-slate-400 block">Digital: ₹{relBook.digitalPrice}</span>
                  </div>
                  <Link 
                    href={`/textbooks/${relBook.slug}`}
                    className="text-xs font-bold text-fuchsia-600 hover:underline"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
