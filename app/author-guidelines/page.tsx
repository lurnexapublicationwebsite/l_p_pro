import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { BookOpen, Layout, Type, CheckSquare, Send, FileText } from "lucide-react";

export default function AuthorGuidelines() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      {/* --- HERO SECTION --- */}
      <header className="relative py-12 md:py-24 px-4 sm:px-6 bg-blue-950 text-white">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-2 text-blue-400 font-bold tracking-[0.2em] uppercase text-[10px] md:text-xs mb-4">
            <span className="w-6 md:w-8 h-[2px] bg-blue-400"></span>
            For Authors
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight mb-4 md:mb-6 leading-tight">
          AUTHOR GUIDELINES
          </h1>
        </div>
        {/* Responsive Background Gradient */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none"></div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-10 md:gap-16">
          
          {/* Main Content Column */}
          <div className="w-full lg:flex-1 space-y-12 md:space-y-20">
            
            {/* 1. Introduction */}
            <section id="introduction">
              <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600 shrink-0" />
                1. Introduction
              </h3>
              <p className="text-slate-600 leading-relaxed text-base md:text-lg">
                GJPIR welcomes high-quality, original research contributions across its defined scope. Authors are expected to adhere strictly to the submission and formatting guidelines to ensure a smooth review and publication process.
              </p>
            </section>

            {/* 2. Types of Submissions */}
            <section id="types">
              <h3 className="text-xl md:text-2xl font-bold mb-6">2. Types of Submissions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {["Research Articles", "Review Papers", "Case Studies", "Short Communications"].map((type) => (
                  <div key={type} className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex items-center gap-3 font-semibold text-slate-700 text-sm md:text-base">
                    <FileText className="w-4 h-4 text-blue-600" />
                    {type}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs md:text-sm text-slate-500 italic">All submissions must be original and unpublished.</p>
            </section>

            {/* 3. Manuscript Structure */}
            <section id="structure">
              <div className="flex items-center gap-3 mb-6">
                <Layout className="w-5 h-5 md:w-6 md:h-6 text-blue-600 shrink-0" />
                <h3 className="text-xl md:text-2xl font-bold">3. Manuscript Structure</h3>
              </div>
              <div className="relative border-l-2 border-green-200 ml-2 md:ml-3 pl-6 md:pl-8 space-y-5 md:space-y-6">
                {[
                  "Title Page", "Abstract (150–250 words)", "Keywords (4–6)", 
                  "Introduction", "Literature Review (if applicable)", "Methodology", 
                  "Results and Discussion", "Conclusion", "References"
                ].map((step, idx) => (
                  <div key={idx} className="relative text-sm md:text-base">
                    <div className="absolute -left-[31px] md:-left-[41px] top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white border-2 border-blue-600"></div>
                    <span className="text-slate-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4 & 5. Formatting & Language */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/50 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-blue-100">
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <Type className="w-5 h-5 text-blue-600" /> 4. Formatting
                </h3>
                <ul className="text-xs md:text-sm space-y-2 text-slate-600">
                  <li><strong>Font:</strong> Times New Roman</li>
                  <li><strong>Font Size:</strong> 12</li>
                  <li><strong>Line Spacing:</strong> 1.5</li>
                  <li><strong>Alignment:</strong> Justified</li>
                  <li className="pt-2 text-blue-700 font-medium underline underline-offset-4">Referencing: APA / IEEE</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold text-slate-900">
                   5. Language and Clarity
                </h3>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                  Manuscripts must be written in clear and professional English. Authors are responsible for grammar and proofreading.
                </p>
              </div>
            </section>
          </div>

          {/* --- SIDEBAR SECTION --- */}
          <aside className="w-full lg:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6 md:space-y-8">
              
              {/* 7. Submission Checklist */}
              <div className="bg-white p-5 md:p-6 rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" /> 7. Checklist
                </h3>
                <ul className="space-y-4">
                  {[
                    "Manuscript is original", 
                    "All authors are listed correctly", 
                    "References properly formatted", 
                    "Plagiarism within limits"
                  ].map((check) => (
                    <li key={check} className="flex items-start gap-3 text-xs md:text-sm font-semibold text-slate-700">
                      <div className="mt-1 w-4 h-4 border-2 border-blue-600 rounded flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-sm"></div>
                      </div>
                      {check}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 6. Ethical Requirements */}
              <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-200">
                <h3 className="text-base md:text-lg font-bold mb-3">6. Ethical Requirements</h3>
                <ul className="text-xs md:text-sm text-slate-500 space-y-2 list-disc pl-4">
                  <li>Publication Ethics Policy</li>
                  <li>Plagiarism Policy</li>
                  <li>Conflict of Interest disclosure</li>
                </ul>
              </div>

              {/* 8. Review Process */}
              <div className="p-5 md:p-6 rounded-2xl bg-blue-600 text-white shadow-lg">
                <h3 className="text-base md:text-lg font-bold mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4" /> 8. Review & Publication
                </h3>
                <ul className="text-[11px] md:text-xs space-y-3 opacity-95 leading-relaxed">
                  <li>• Double-blind peer review</li>
                  <li>• Revisions may be required</li>
                  <li>• Acceptance by editorial decision</li>
                </ul>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
     <FooterSection />
    </div>
  );
}