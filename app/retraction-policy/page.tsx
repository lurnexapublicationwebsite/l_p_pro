import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { AlertTriangle, Search, Scale, FileX, Info, Link as LinkIcon } from "lucide-react";

export default function RetractionPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      {/* --- PROFESSIONAL HEADER --- */}
      <header className="bg-slate-50 border-b border-slate-200 py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
            <AlertTriangle className="w-3 h-3" /> Scholarly Integrity
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-950 mb-6 leading-tight">
            RETRACTION POLICY
          </h1>
          <div className="mt-8 h-1 w-20 bg-red-600 mx-auto rounded-full"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="space-y-12 md:space-y-20">
          
          {/* 1. Purpose */}
          <section className="bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
              <Info className="w-6 h-6 text-blue-600" />
              1. Purpose
            </h3>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg border-l-4 border-slate-200 pl-6">
              The Retraction Policy ensures the integrity of the scholarly record by correcting errors and addressing serious ethical violations in published articles.
            </p>
          </section>

          {/* 2. Grounds for Retraction - HIGH CONTRAST CARD */}
          <section className="bg-red-50 rounded-3xl p-8 border border-red-100">
            <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-2 text-red-900">
              <FileX className="w-6 h-6" /> 2. Grounds for Retraction
            </h3>
            <p className="text-sm font-semibold text-red-800 mb-4">An article may be retracted under the following circumstances:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Plagiarism or duplicate publication",
                "Data fabrication or falsification",
                "Serious ethical violations",
                "Authorship disputes",
                "Major errors that invalidate findings"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/60 p-4 rounded-xl text-sm font-medium text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* 3 & 4. Initiation and Process */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" /> 3. Retraction Initiation
              </h3>
              <p className="text-sm text-slate-500 mb-4">Retraction may be initiated by:</p>
              <ul className="space-y-2">
                {["Authors", "Editors", "Reviewers", "Third parties (e.g., readers or institutions)"].map((u) => (
                  <li key={u} className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <div className="w-1 h-1 bg-slate-400 rounded-full" /> {u}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-400 italic font-medium">All concerns are taken seriously and investigated thoroughly.</p>
            </section>

            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-600" /> 4. Investigation Process
              </h3>
              <ul className="text-sm text-slate-600 space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">01</span> Preliminary assessment of the allegation
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">02</span> Communication with authors
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">03</span> Collection of evidence and documents
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-600">04</span> Consultation with editorial board
                </li>
              </ul>
              <p className="mt-4 p-3 bg-slate-50 rounded-lg text-[11px] text-slate-500 text-center font-bold uppercase tracking-wider">
                Fair • Confidential • Objective
              </p>
            </section>
          </div>

          {/* 5. Decision-Making */}
          <section className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl">
            <h3 className="text-2xl font-bold mb-6">5. Decision-Making</h3>
            <p className="text-slate-400 mb-8">Based on the investigation, the journal may:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Reject manuscript", "Issue a correction", "Retract the article", "Further disciplinary actions"].map((action) => (
                <div key={action} className="p-4 border border-white/10 rounded-xl text-center text-xs font-bold uppercase tracking-tighter">
                  {action}
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm font-medium text-blue-400 text-center border-t border-white/10 pt-6 italic">
              "The final decision is made by the editorial authority."
            </p>
          </section>

          {/* 6, 7 & 8 Handling & Notices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="border border-slate-200 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" /> 6. Retraction Notice
              </h3>
              <p className="text-sm text-slate-600 mb-4">A formal retraction notice will be published stating the reason and reference to original article. It will be permanently linked.</p>
            </section>
            <section className="border border-slate-200 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-4">7. Post-Retraction Handling</h3>
              <p className="text-sm text-slate-600">Original article remains accessible for transparency, clearly marked as <span className="text-red-600 font-bold underline">“Retracted”</span>. Indexing services notified.</p>
            </section>
          </div>

          {/* 8 & 9. Footer Policy Content */}
          <div className="border-t border-slate-100 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-lg font-bold mb-2">8. Corrections and Errata</h3>
                <p className="text-sm text-slate-500 italic">Minor errors not affecting conclusions may be corrected through: Erratum or Corrigendum.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">9. Ethical Commitment</h3>
                <p className="text-sm text-slate-500 italic">Retraction actions are taken in line with best practices in scholarly publishing ethics.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- MINIMALIST FOOTER --- */}
     <FooterSection />
    </div>
  );
}