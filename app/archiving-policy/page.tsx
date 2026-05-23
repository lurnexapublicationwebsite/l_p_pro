import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { Database, HardDrive, Globe, ShieldCheck, RefreshCcw, Search } from "lucide-react";

export default function ArchivingPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      {/* --- PROFESSIONAL HEADER --- */}
      <header className="bg-slate-50 border-b border-slate-200 py-12 md:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-blue-600 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-4">
            <Database className="w-4 h-4" /> Preservation & Accessibility
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 leading-tight">
            ARCHIVING POLICY
          </h1>
        
          <div className="mt-8 h-1 w-20 bg-blue-600 rounded-full"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="space-y-12 md:space-y-16">
          
          {/* 1. Purpose */}
          <section>
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              1. Purpose
            </h3>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg italic border-l-4 border-slate-200 pl-6">
              The Archiving Policy ensures the long-term preservation, accessibility, and integrity of all published content.
            </p>
          </section>

          {/* 2 & 4. Digital Archiving & Backup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-600" /> 2. Digital Archiving System
              </h3>
              <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wider">All articles are:</p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">• Stored on the journal’s official website</li>
                <li className="flex items-start gap-2">• Maintained in secure digital formats</li>
                <li className="flex items-start gap-2">• Organized in a structured archive (volume/issue-wise)</li>
              </ul>
            </section>

            <section className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> 4. Backup and Data Preservation
              </h3>
              <p className="text-sm text-slate-500 mb-4 font-semibold uppercase tracking-wider">The journal maintains:</p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">• Regular system backups</li>
                <li className="flex items-start gap-2">• Redundant storage systems</li>
                <li className="flex items-start gap-2">• Secure hosting infrastructure</li>
              </ul>
            </section>
          </div>

          {/* 3. Accessibility - MODERN HIGHLIGHT CARD */}
          <section className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-4 flex items-center justify-center md:justify-start gap-3">
                  <Globe className="w-6 h-6 text-blue-400" /> 3. Accessibility and Open Access
                </h3>
                <ul className="space-y-2 text-slate-400 text-sm md:text-base">
                  <li>• All archived articles remain freely accessible</li>
                  <li>• No subscription or access barriers</li>
                  <li>• Supports global dissemination of knowledge</li>
                </ul>
              </div>
            </div>
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          </section>

          {/* 5, 6, 7 & 8 Detailed Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-600" /> 5. Content Integrity
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                The journal ensures published content is unaltered and authentic. Any updates (corrections/retractions) are clearly documented.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-600" /> 7. Version Control
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Any updates to articles are documented. Previous versions are preserved when necessary.
              </p>
            </section>

            <section className="md:col-span-2 p-8 border-2 border-dashed border-slate-200 rounded-3xl bg-white">
              <h3 className="text-xl font-bold mb-4">6. Long-Term Preservation Strategy</h3>
              <p className="text-sm text-slate-500 mb-6">The journal aims to integrate with:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                {["Institutional repositories", "Digital preservation systems", "Indexing databases"].map((item) => (
                  <div key={item} className="p-4 bg-slate-50 rounded-xl text-xs font-bold text-slate-700 border border-slate-100 uppercase tracking-tighter">
                    {item}
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-xs text-slate-400 italic">
                This ensures continued availability even in case of system changes.
              </p>
            </section>
          </div>

          {/* 8. Accessibility Standards Footer Section */}
          <section className="border-t border-slate-100 pt-12">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" /> 8. Accessibility Standards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "Easy navigation of archives",
                "Searchable content",
                "Compatibility across devices"
              ].map((std) => (
                <div key={std} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-slate-700">{std}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      <FooterSection/>
    </div>
  );
}