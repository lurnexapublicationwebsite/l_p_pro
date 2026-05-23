import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { Sparkles, Clock } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coming Soon | Lurnexa Publications",
  description: "Exciting new research and journals are coming soon to Lurnexa Publications. Stay tuned for our upcoming launches.",
};

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavigationPage />
      
      <main className="flex-grow flex items-center justify-center px-6 pt-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/3 -left-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 bg-orange-50 rounded-full blur-3xl opacity-60" />

        <div className="text-center max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
            <Sparkles size={14} className="text-orange-400" /> New Launch 2026
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-950 mb-6 tracking-tight leading-none">
            Something <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 italic">Remarkable</span> is coming.
          </h1>
          
          <p className="text-slate-500 text-lg md:text-xl mb-12 leading-relaxed font-medium">
            We are curating high-impact research journals and academic resources. Our team is working hard to bring you the best in techno-management scholarship.
          </p>

          <div className="flex flex-col items-center gap-4">
             <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <Clock size={16} /> Estimated Launch: Q3 2026
             </div>
             <div className="w-16 h-1 bg-slate-100 rounded-full mt-4">
                <div className="w-1/2 h-full bg-orange-500 rounded-full animate-pulse" />
             </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}