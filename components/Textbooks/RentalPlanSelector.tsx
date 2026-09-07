"use client";

import React, { useState } from "react";
import { X, Clock, Check, Sparkles, ShieldCheck, ArrowRight, BookOpen } from "lucide-react";
import { RENTAL_PLANS, RentalPlan, formatRentalPrice } from "@/lib/data/rentals";

interface TextbookDetails {
  id: string;
  title: string;
  code: string;
  description: string;
  price: number;
  authors: string;
  pages: number;
  isbn: string;
  isbnDigital: string;
  pdfFileName: string;
}

interface RentalPlanSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  book: TextbookDetails | null;
  onSelectPlan: (plan: RentalPlan, action: 'buy_now' | 'add_to_cart') => void;
}

export default function RentalPlanSelector({
  isOpen,
  onClose,
  book,
  onSelectPlan
}: RentalPlanSelectorProps) {
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("6_months"); // Default best value

  if (!isOpen || !book) return null;

  const selectedPlan = RENTAL_PLANS.find(p => p.planCode === selectedPlanCode) || RENTAL_PLANS[2];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-3">
            <Clock size={12} />
            <span>Digital eBook Rental</span>
          </div>

          <h2 className="text-xl font-bold leading-snug text-white line-clamp-1">
            Rent: {book.title}
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Choose your rental duration. Instant online access after checkout.
          </p>
        </div>

        {/* Modal Body — Plan Cards */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RENTAL_PLANS.map((plan) => {
              const isSelected = selectedPlanCode === plan.planCode;
              return (
                <div
                  key={plan.planCode}
                  onClick={() => setSelectedPlanCode(plan.planCode)}
                  className={`relative cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles size={10} />
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-slate-800">{plan.displayName}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                      }`}>
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-2xl font-black text-slate-900">{formatRentalPrice(plan.price)}</span>
                      <span className="text-slate-500 text-xs font-medium"> / total</span>
                    </div>

                    <div className="text-[12px] font-bold text-indigo-600 bg-indigo-100/60 px-2.5 py-1 rounded-md inline-block">
                      ₹{plan.perMonthPrice}/mo
                    </div>
                  </div>

                  {plan.savingsPercent > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-semibold text-emerald-600">
                      Save {plan.savingsPercent}% vs 1 mo
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Key Rental Features */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-indigo-600" />
              Included with your rental
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Instant access in browser reader</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Read on Laptop, Tablet or Phone</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Renew anytime to extend access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>Auto-save last reading page</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 font-medium">
            Selected: <strong className="text-slate-900">{selectedPlan.displayName} Rental</strong> — <strong className="text-indigo-600">{formatRentalPrice(selectedPlan.price)}</strong> (+18% GST)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onSelectPlan(selectedPlan, 'add_to_cart')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all"
            >
              Add Rental to Cart
            </button>
            <button
              onClick={() => onSelectPlan(selectedPlan, 'buy_now')}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Rent Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
