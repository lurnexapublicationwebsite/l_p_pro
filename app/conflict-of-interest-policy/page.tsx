import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { Scale, HeartHandshake, Eye, AlertCircle, FileCheck } from "lucide-react";
import { Footer } from "react-day-picker";

export default function ConflictOfInterest() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      {/* --- REFINED HEADER --- */}
      <header className="bg-slate-50 border-b border-slate-200 py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-blue-600 font-bold tracking-widest text-[10px] uppercase mb-4">
            <Scale className="w-4 h-4" /> Editorial Policies
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-950 leading-tight">
            📄 CONFLICT OF INTEREST POLICY
          </h2>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="space-y-12 md:space-y-16">
          
          {/* 1. Policy Statement */}
          <section className="bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3 text-blue-700">
              1. Policy Statement
            </h3>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg">
              GJPIR is committed to maintaining transparency, objectivity, and integrity in all stages of the publication process. The journal ensures that any potential conflicts of interest are properly disclosed and managed to prevent bias in editorial decisions, peer review, and publication outcomes.
            </p>
          </section>

          {/* 2. Definition Section */}
          <section className="bg-slate-950 text-white rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl md:text-2xl font-bold mb-4">2. Definition of Conflict of Interest</h3>
              <p className="text-slate-300 mb-6">A conflict of interest exists when an individual’s personal, financial, institutional, or professional relationships could influence, or appear to influence, their judgment or actions.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Financial", desc: "Funding, grants, employment, consultancy" },
                  { label: "Institutional", desc: "Affiliations or collaborations" },
                  { label: "Personal", desc: "Relationships, rivalry, or personal beliefs" },
                  { label: "Academic/Professional", desc: "Competition or shared research interests" }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="block font-bold text-blue-400 text-sm mb-1">{item.label}</span>
                    <span className="text-xs text-slate-400 leading-relaxed">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Visual background accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          </section>

          {/* 3. Author Responsibilities - Detailed Card */}
          <section className="p-6 md:p-8 rounded-2xl border-2 border-slate-100 bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3">
              <HeartHandshake className="w-6 h-6 text-blue-600" /> 3. Author Responsibilities
            </h3>
            <div className="space-y-6">
              <p className="text-slate-600">Authors must disclose any potential conflicts of interest at the time of submission.</p>
              
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <p className="text-sm font-bold mb-3">This includes:</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2 italic">• Sources of financial support or funding</li>
                  <li className="flex items-center gap-2 italic">• Institutional affiliations that may influence</li>
                  <li className="flex items-center gap-2 italic">• Relationships that could affect objectivity</li>
                </ul>
              </div>

              <div className="bg-blue-600 p-6 rounded-xl text-white">
                <h4 className="font-bold flex items-center gap-2 mb-2">
                  <FileCheck className="w-5 h-5" /> Declaration Requirement:
                </h4>
                <p className="text-sm mb-4">A Conflict of Interest statement must be included in the manuscript.</p>
                <div className="p-4 bg-white/10 rounded border border-white/20 italic text-sm">
                  “The authors declare no conflict of interest.”
                </div>
              </div>
              <p className="text-xs text-red-600 font-bold italic">
                Failure to disclose conflicts may result in rejection, retraction, or further action.
              </p>
            </div>
          </section>

          {/* 4 & 5 Responsibility Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-6 bg-white border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-blue-700 underline underline-offset-8">4. Reviewer Responsibilities</h3>
              <ul className="text-sm text-slate-600 space-y-3">
                <li className="font-semibold">Decline invitations if they have:</li>
                <ul className="pl-4 list-disc space-y-1 opacity-80">
                  <li>Personal relationships with authors</li>
                  <li>Institutional connections</li>
                  <li>Competing research interests</li>
                </ul>
                <li>Provide objective and unbiased evaluations</li>
                <li>Avoid using manuscript content for gain</li>
              </ul>
            </section>

            <section className="p-6 bg-white border border-slate-200 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-blue-700 underline underline-offset-8">5. Editorial Responsibilities</h3>
              <ul className="text-sm text-slate-600 space-y-3">
                <li>Avoid handling manuscripts where a conflict exists</li>
                <li>Assign independent and unbiased reviewers</li>
                <li>Ensure decisions based solely on academic merit</li>
                <li className="pt-2 text-blue-600 font-bold">If a conflict arises:</li>
                <p className="text-xs italic pl-4 border-l-2 border-blue-200">The manuscript will be reassigned and transparent documentation maintained.</p>
              </ul>
            </section>
          </div>

          {/* 6, 7 & 8 Management Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold mb-3 flex items-center gap-2"><Eye className="w-4 h-4" /> 6. Disclosure</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Required at all stages (Authors, Reviewers, Editors). Disclosures may be published alongside the article.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-orange-600"><AlertCircle className="w-4 h-4" /> 7. Management</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Journal may reassign reviewers/editors, request more disclosure, or halt the review process if needed.</p>
            </div>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <h4 className="font-bold mb-3 text-red-700 uppercase tracking-tighter">8. Non-Compliance</h4>
              <p className="text-[11px] text-red-900 leading-relaxed">May lead to: Rejection, Retraction of articles, or Restriction on future submissions.</p>
            </div>
          </div>

        </div>
      </main>

      {/* --- MINIMAL FOOTER --- */}
    <FooterSection />
    </div>
  );
}