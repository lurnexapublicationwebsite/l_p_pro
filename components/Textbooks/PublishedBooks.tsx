"use client";

import { useState } from "react";
import { BookOpen, ShoppingBag, Eye, X, User, Tag, ShieldAlert, Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PUBLISHED_BOOKS_DATA } from "@/lib/data/books";

export default function PublishedBooks() {
  const router = useRouter();

  return (
    <div className="py-4 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        {PUBLISHED_BOOKS_DATA.map((bookItem) => {
          return (
            <div 
              key={bookItem.id} 
              className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Cover presentation */}
                <Link 
                  href={`/textbooks/${bookItem.slug}`}
                  className="relative w-full aspect-[4/5] rounded-xl bg-gradient-to-tr from-slate-100 to-fuchsia-50/30 flex items-center justify-center border border-slate-200/20 hover:scale-[1.01] transition-all duration-300 cursor-pointer overflow-hidden p-5 block"
                >
                  <div className="relative h-full aspect-[1/1.4] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.15)] rounded-r overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                    <img 
                      src={bookItem.coverImg}
                      className="w-full h-full object-cover"
                      alt={bookItem.title}
                    />
                    {/* Spine overlay effect */}
                    <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
                    {/* Highlight gloss */}
                    <div className="absolute inset-y-0 left-2.5 w-[1px] bg-white/10" />
                  </div>
                </Link>

                {/* Meta & Info */}
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[8px] text-fuchsia-600 font-extrabold uppercase tracking-widest bg-fuchsia-50 border border-fuchsia-200/30 px-1.5 py-0.5 rounded">
                      Peer-Reviewed
                    </span>
                    <span className="text-[8px] text-[#64748B] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      PB: {bookItem.isbn} | Digital: {bookItem.isbnDigital}
                    </span>
                  </div>

                  <div className="h-10 flex items-center">
                    <Link 
                      href={`/textbooks/${bookItem.slug}`}
                      className="text-sm font-bold text-[#0F172A] line-clamp-2 leading-snug group-hover:text-fuchsia-600 transition-colors duration-200" 
                      title={bookItem.title}
                    >
                      {bookItem.title}
                    </Link>
                  </div>

                  <p className="text-[11px] text-[#64748B] font-semibold line-clamp-1">
                    By {bookItem.authors}
                  </p>

                  <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                    {bookItem.description}
                  </p>
                </div>
              </div>

              {/* Pricing and Actions */}
              <div className="pt-4 mt-4 border-t border-[#E2E8F0] space-y-2">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-[#0F172A]">₹{bookItem.price}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    In Stock
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/textbooks/${bookItem.slug}`}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-xl text-[11px] text-center flex items-center justify-center gap-1 transition-all"
                  >
                    <span>View Details</span>
                  </Link>
                  <Link
                    href={`/textbooks/store/checkout?bookId=${bookItem.id}`}
                    className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 rounded-xl text-[11px] text-center flex items-center justify-center gap-1 transition-all shadow-sm"
                  >
                    <ShoppingBag size={11} />
                    <span>Buy Now</span>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
