"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Upcoming from "@/components/Textbooks/Upcoming";
import PublishedBooks from "@/components/Textbooks/PublishedBooks";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

/* 🔥 Tab Config */
const TABS = [
  { key: "upcoming", label: "Upcoming Books", component: Upcoming, activeClass: "bg-slate-900 text-white" },
  { key: "published", label: "Published Books", component: PublishedBooks, activeClass: "bg-orange-600 text-white" },
];

export default function TextbooksClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const defaultTab = searchParams.get("tab") || "upcoming";
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    router.replace(`?tab=${activeTab}`);
  }, [activeTab, router]);

  const ActiveComponent =
    TABS.find((tab) => tab.key === activeTab)?.component || null;

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-8 border-b border-[#E2E8F0] pb-5">
        {/* Segmented Control Tabs */}
        <div className="bg-[#F1F5F9] p-1 rounded-xl flex gap-1 self-start">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-250 ${
                activeTab === tab.key
                  ? "bg-white text-[#0F172A] shadow-sm font-bold"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => router.push('/textbooks/store')}
            className="bg-[#0F172A] hover:bg-slate-850 text-white font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 text-xs flex items-center gap-1.5 active:scale-98"
          >
            <ShoppingBag size={14} />
            <span>Go to Bookstore</span>
          </button>
          <button
            onClick={() => router.push('/textbooks/portal')}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-fuchsia-500/10 hover:shadow-fuchsia-500/20 transition-all duration-200 text-xs active:scale-98"
          >
            Access Portal
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {ActiveComponent && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ActiveComponent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
