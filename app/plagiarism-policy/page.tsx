import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { AlertCircle, ShieldAlert, BarChart3, SearchCheck } from "lucide-react";

export default function PlagiarismPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Modern Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-2xl mb-4">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
            PLAGIARISM POLICY
          </h2>
        </header>

        <div className="space-y-8">
          {/* 1. Policy Statement */}
          <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              1. Policy Statement
            </h3>
            <p className="text-lg leading-relaxed text-slate-700">
              GJPIR maintains a zero-tolerance approach toward plagiarism and ensures that all published work is original and properly attributed.
            </p>
          </section>

          {/* 2 & 3. Definition & Screening */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4">2. Definition of Plagiarism</h3>
              <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wider">Plagiarism includes:</p>
              <ul className="space-y-3">
                {["Direct copying without citation", "Paraphrasing without acknowledgment", "Self-plagiarism (reuse of own work without disclosure)", "Data or idea theft"].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <SearchCheck className="w-6 h-6 text-blue-600" />
                3. Plagiarism Screening
              </h3>
              <p className="text-sm text-slate-600 mb-4">All manuscripts undergo plagiarism checks using reliable detection tools:</p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-sm font-medium text-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Screening is conducted at initial submission stage
                </li>
                <li className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-sm font-medium text-blue-800">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  Additional checks may be performed before final acceptance
                </li>
              </ul>
            </div>
          </div>

          {/* 4 & 5. Thresholds & Actions */}
          <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              <h3 className="text-2xl font-bold">4. Acceptable Similarity Threshold</h3>
            </div>
            <div className="text-center mb-10">
              <div className="text-5xl font-black text-blue-400 mb-2">≤ 15%</div>
              <p className="text-slate-400">Excludes references, quotes, and standard phrases</p>
            </div>

            <h3 className="text-xl font-bold mb-6 border-b border-slate-800 pb-4">5. Levels of Plagiarism and Actions</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4 p-4 rounded-xl bg-slate-800/50">
                <div>
                  <h4 className="font-bold text-blue-300">5.1 Minor Overlap (≤15%)</h4>
                  <p className="text-sm text-slate-300 italic">Revision required. Proper citation must be added.</p>
                </div>
              </div>
              <div className="flex justify-between items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-orange-500/30">
                <div>
                  <h4 className="font-bold text-orange-300">5.2 Moderate Overlap (15–30%)</h4>
                  <p className="text-sm text-slate-300 italic">Manuscript may be rejected. Resubmission allowed after significant revision.</p>
                </div>
              </div>
              <div className="flex justify-between items-start gap-4 p-4 rounded-xl bg-red-950/40 border border-red-500/30">
                <div>
                  <h4 className="font-bold text-red-400">5.3 Severe Plagiarism (&gt;30%)</h4>
                  <p className="text-sm text-slate-300 italic">Immediate rejection. Author may be blacklisted. Institution may be notified (if necessary).</p>
                </div>
              </div>
            </div>
          </section>

          {/* 6. Post-Publication */}
          <section className="p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <h3 className="text-2xl font-bold mb-4">6. Post-Publication Plagiarism</h3>
            <p className="text-slate-600 mb-4">If plagiarism is detected after publication:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              {["Article may be retracted", "Public notice will be issued", "Indexing agencies may be informed"].map((txt) => (
                <div key={txt} className="p-4 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 border border-slate-100 italic">
                  "{txt}"
                </div>
              ))}
            </div>
          </section>

          {/* 7 & 8 Responsibilities */}
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-2xl font-bold mb-4 border-l-4 border-slate-900 pl-4">7. Author Responsibility</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span>•</span> Ensuring originality</li>
                <li className="flex gap-2"><span>•</span> Proper referencing</li>
                <li className="flex gap-2"><span>•</span> Using plagiarism-check tools before submission</li>
              </ul>
            </section>
            <section>
              <h3 className="text-2xl font-bold mb-4 border-l-4 border-slate-900 pl-4">8. Editorial Responsibility</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><span>•</span> Proper screening of all submissions</li>
                <li className="flex gap-2"><span>•</span> Fair handling of plagiarism cases</li>
                <li className="flex gap-2"><span>•</span> Transparent communication with authors</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

       <FooterSection />
    </div>
  );
}