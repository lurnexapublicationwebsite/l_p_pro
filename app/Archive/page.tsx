"use client";

import { motion, Variants } from "framer-motion"; // Added Variants type for TS
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";
import { MoveRight } from "lucide-react"; 

// 1. Move variants OUTSIDE the component to ensure they are defined before use
const containerVars: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const letterVars: Variants = {
  initial: { opacity: 0, y: 100, rotateX: -90 },
  animate: { 
    opacity: 1, 
    y: 0, 
    rotateX: 0,
    transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
  },
};

const cardReveal: Variants = {
  initial: { opacity: 0, y: 40, scale: 0.98 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

export default function ArchivePage() {
  const word = "ARCHIVE";

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900 selection:bg-blue-100 overflow-x-hidden">
      <NavigationPage />

      <main className="grow container mx-auto px-4 py-20 relative">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] -z-10 opacity-60" />
        <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-slate-100 rounded-full blur-[100px] -z-10 opacity-50" />

        <div className="relative mb-24 flex flex-col items-center">
          <motion.div 
            variants={containerVars}
            initial="initial"
            animate="animate"
            className="flex perspective-1000"
          >
            {word.split("").map((letter, index) => (
              <motion.span 
                key={index} 
                variants={letterVars}
                className="text-[18vw] lg:text-[240px] font-black leading-none tracking-[calc(-0.05em)] text-slate-900 inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="z-10 text-center max-w-2xl -mt-6 md:-mt-12"
          >
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-[0.3em] text-blue-600 mt-5">
              Lurnexa Publications
            </p>
            <h2 className="text-2xl md:text-4xl font-light text-slate-600 italic">
              "Preserving the future of scholarly innovation."
            </h2>
          </motion.div>
        </div>

        <motion.div 
          variants={cardReveal} 
          initial="initial"
          animate="animate"
          className="max-w-6xl mx-auto"
        >
          <div className="group relative grid grid-cols-1 md:grid-cols-12 bg-blue-50 rounded-[40px] overflow-hidden hover:bg-slate-100 transition-all duration-700">
            
            <div className="md:col-span-4 bg-slate-200 relative overflow-hidden h-64 md:h-auto">
                <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                   <span className="font-bold 
                          text-2xl 
                          sm:text-3xl 
                          md:text-4xl 
                          lg:text-6xl 
                          xl:text-7xl
                          opacity-20 
                          -rotate-90 
                          whitespace-nowrap
                          leading-none
                          tracking-widest
                          block"> GJPIR
  <span className="block text-3xl sm:text-lg md:text-lg lg:text-xl tracking-normal">
    VOLUME. 1
  </span>
</span>



                </div>
                <div className="absolute inset-0 bg-linear-to-tr from-blue-600/20 to-transparent" />
            </div>

            <div className="md:col-span-8 p-10 md:p-16 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-xs font-black tracking-widest uppercase bg-green-500 px-4 py-2 rounded-full border border-slate-200 text-white">
                    Issue 01 / 2026
                  </span>
                  <span className="h-px w-12 bg-slate-300" />
                  {/* <span className="text-xs font-bold text-blue-600 uppercase">Proposed Inaugural Issue</span> */}
                </div>

                <h3 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight leading-[1.1] group-hover:translate-x-2 transition-transform duration-500">
                    April 2026 <br/> Edition
                </h3>

                <div className="grid grid-cols-2 gap-8 mt-12 border-t border-slate-200 pt-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Publisher</p>
                    <p className="font-medium text-slate-900">Lurnexa Publications</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Mode</p>
                    <p className="font-medium text-slate-900"> Online </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <Link href="/Articles" className="inline-flex items-center gap-4 text-lg font-bold group/link">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-full border border-blue-600 group-hover/link:bg-blue-700 group-hover/link:border-blue-700 transition-all duration-300">
                  Explore this Issue
                  </button>
                  <span className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center group-hover/link:bg-blue-600 group-hover/link:border-blue-600 group-hover/link:text-white transition-all duration-300">
                    <MoveRight className="w-5 h-5" />
                  </span>
                </Link>

                 {/* 🔥 NEW ARTICLES BUTTON */}

              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <FooterSection />
    </div>
  );
}