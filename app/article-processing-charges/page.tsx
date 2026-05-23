import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Info } from "lucide-react";

export default function APC() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      {/* --- PREMIUM HEADER --- */}
      <header className="bg-slate-50 border-b border-slate-200 py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4">
            <CreditCard className="w-3 h-3" /> Transparency & Affordability
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-950 mb-6 leading-tight">
         ARTICLE PROCESSING CHARGES (APC)
          </h2>
          <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="space-y-12 md:space-y-16">
          
          {/* 1. Policy Statement */}
          <section className="bg-white">
            <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            1. APC Policy Statement
            </h3>
            <p className="text-slate-600 leading-relaxed text-base md:text-lg italic border-l-4 border-blue-600 pl-6">
              GJPIR follows a transparent and ethical approach to Article Processing Charges (APC) to support the costs associated with editorial processing, peer review management, digital publishing, and long-term archiving.
            </p>
          </section>

          {/* 2. APC Amount - MODERN PRICING CARD */}
          <section className="relative">
            <div className="bg-slate-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-8 text-blue-400">2. APC Amount</h3>
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-8">
                  <span className="text-5xl md:text-7xl font-black">₹1000 – ₹1200</span>
                  <span className="text-slate-400 font-medium">per accepted article</span>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <p className="text-sm font-bold mb-4 flex items-center gap-2">
                    👉 The exact amount within this range may depend on:
                  </p>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Article type (research, review, case study)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Formatting and processing requirements</li>
                  </ul>
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
            </div>
          </section>

          {/* 3 & 4. Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <section className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="text-xl font-bold mb-4">3. When APC is Charged</h3>
              <ul className="space-y-3 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                   APC is charged only after the manuscript is accepted following peer review
                </li>
                <li className="flex items-start gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                   No charges are applied at the submission or review stage
                </li>
              </ul>
            </section>

            <section className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <h3 className="text-xl font-bold mb-4">4. What APC Covers</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                {["Editorial processing and manuscript handling", "Double-blind peer review management", "Copyediting and formatting", "Online publication and hosting", "Long-term digital archiving"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" /> {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* 5 & 9. No Hidden Charges & Ethics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> 5. No Hidden Charges
              </h3>
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <p className="text-sm font-bold text-blue-900 mb-2">GJPIR maintains full transparency:</p>
                <p className="text-sm text-blue-700">No submission fees • No review charges • No hidden or additional fees after payment</p>
              </div>
            </section>
            <section>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" /> 9. Ethical Compliance
              </h3>
              <p className="text-sm text-slate-600 mb-2 font-bold">APC does not influence editorial decisions.</p>
              <p className="text-sm text-slate-600">Acceptance is based solely on academic quality and peer review. Payment does not guarantee publication.</p>
            </section>
          </div>

          {/* 6. Waiver Policy */}
          <section className="p-8 rounded-3xl border-2 border-slate-900 bg-white">
            <h3 className="text-2xl font-bold mb-6">6. Waiver and Discount Policy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="font-bold text-slate-900 mb-4">The journal may offer:</p>
                <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                  <li>Partial or full fee waivers</li>
                  <li className="font-bold">Discounts for:</li>
                  <ul className="list-circle pl-6 space-y-1">
                    <li>Students</li>
                    <li>Early-career researchers</li>
                    <li>Authors from financially constrained backgrounds</li>
                  </ul>
                </ul>
              </div>
              <div className="flex items-center">
                 <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                   <p className="text-sm text-yellow-800 font-bold leading-relaxed">
                     👉 Waiver requests must be submitted before or during the review process
                   </p>
                 </div>
              </div>
            </div>
          </section>

          {/* 7, 8, 10. Bottom Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-slate-200 rounded-2xl">
              <h4 className="font-bold mb-2">7. Payment Terms</h4>
              <p className="text-xs text-slate-500">Instructions shared after acceptance. Complete payment within the specified timeline to proceed.</p>
            </div>
            <div className="p-6 border border-slate-200 rounded-2xl">
              <h4 className="font-bold mb-2">8. Refund Policy</h4>
              <p className="text-xs text-slate-500">Non-refundable once article is accepted. Refunds only in exceptional cases (e.g., duplicate payment).</p>
            </div>
            <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg">
              <h4 className="font-bold mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-blue-400" /> 10. Transparency</h4>
              <p className="text-xs text-slate-400">GJPIR is committed to affordability, accessibility, and ethical standards.</p>
            </div>
          </div>

        </div>
      </main>

         <FooterSection />
    </div>
  );
}