"use client";

import React, { useState } from "react";
import { X, RefreshCw, Sparkles, Check, ArrowRight } from "lucide-react";
import { RENTAL_PLANS, RentalPlan, formatRentalPrice } from "@/lib/data/rentals";

interface RenewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: {
    rentalId: string;
    bookTitle: string;
    expiresAt?: string;
    planCode: string;
  } | null;
  onConfirmRenewal: (rentalId: string, newPlanCode: string) => void;
}

export default function RenewModal({
  isOpen,
  onClose,
  rental,
  onConfirmRenewal
}: RenewModalProps) {
  const [selectedPlanCode, setSelectedPlanCode] = useState<string>("3_months");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !rental) return null;

  const handleRenew = async () => {
    setLoading(true);
    try {
      await onConfirmRenewal(rental.rentalId, selectedPlanCode);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[11px] font-bold uppercase tracking-wider mb-2">
            <RefreshCw size={12} />
            <span>Renew Rental Access</span>
          </div>

          <h3 className="text-lg font-bold text-white line-clamp-1">
            {rental.bookTitle}
          </h3>
          <p className="text-slate-300 text-xs mt-1">
            Renewing before expiry rolls over remaining time into your new rental period!
          </p>
        </div>

        {/* Plan Cards */}
        <div className="p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Select Renewal Plan:
          </h4>
          
          {RENTAL_PLANS.map((plan) => {
            const isSelected = selectedPlanCode === plan.planCode;
            return (
              <div
                key={plan.planCode}
                onClick={() => setSelectedPlanCode(plan.planCode)}
                className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex items-center justify-between ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                    isSelected ? "bg-indigo-600 border-indigo-600 text-white" : "border-slate-300"
                  }`}>
                    {isSelected && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{plan.displayName}</span>
                    <span className="text-xs text-indigo-600 font-semibold">₹{plan.perMonthPrice}/mo</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900">{formatRentalPrice(plan.price)}</span>
                  {plan.badge && (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full block mt-0.5">
                      {plan.badge}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleRenew}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <span>{loading ? "Processing..." : "Proceed to Payment"}</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
