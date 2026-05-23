"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Upcoming from "@/components/Textbooks/Upcoming";
import PublishedBooks from "@/components/Textbooks/PublishedBooks";
import { motion, AnimatePresence } from "framer-motion";

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
      <div className="flex justify-around mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === tab.key
                ? tab.activeClass
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
