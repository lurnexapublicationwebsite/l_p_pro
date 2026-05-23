import { ShieldCheck, BookOpen, Scale, Users, CheckCircle, Quote, Globe, Microscope, ScrollText } from "lucide-react";
import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/nav/page";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Lurnexa Publications",
  description: "Learn about Lurnexa Publications' academic philosophy, foundational values, and commitment to scholarly rigor and ethical publishing.",
  openGraph: {
    title: "About Us | Lurnexa Publications",
    description: "Our commitment to academic excellence and scholarly integrity.",
    url: "https://lurnexa.in/aboutus",
  },
};

export default function AboutUsPage() {
  return (
    <>
 <NavigationPage />
     <main className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-100">
      
     {/* --- PRESTIGIOUS HERO SECTION --- */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Artistic Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1491841573634-28140fc7ced7?auto=format&fit=crop&q=80&w=2000" 
            alt="Library of knowledge" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/80 to-slate-950" />
        </div>
        
        <div className="relative z-10 text-center space-y-4">
          <div className="flex justify-center mb-6">
             <div className="h-px w-12 bg-indigo-500 self-center" />
             <span className="px-4 text-indigo-400 text-xs font-bold uppercase tracking-[0.5em]">
               Discovery
             </span>
             <div className="h-px w-12 bg-indigo-500 self-center" />
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-light text-white tracking-tight">
            About <span className="italic">Us</span>
          </h1>
          <p className="text-slate-400 tracking-[0.2em] text-sm uppercase mt-4">
            Lurnexa Publications
          </p>
        </div>

        {/* Elegant Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
          <div className="w-px h-12 bg-linear-to-b from-transparent to-white" />
        </div>
      </section>

      {/* --- EXECUTIVE SUMMARY / PHILOSOPHY INTRO --- */}
      <section className="relative z-20 -mt-20 max-w-5xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 md:p-16">
          <div className="flex items-center gap-3 mb-8">
            <ScrollText className="text-indigo-600" size={32} />
            <h2 className="text-3xl font-serif font-bold text-slate-900">Academic Philosophy</h2>
          </div>
          
          <div className="space-y-8">
            <p className="text-2xl text-slate-700 leading-relaxed font-light italic">
              "Lurnexa Publications is founded on the understanding that scholarly
              publishing is a <span className="text-indigo-600 font-semibold not-italic">custodial responsibility</span> rather than a transactional activity."
            </p>
            
            <div className="h-px w-full bg-slate-100" />
            
            <p className="text-lg text-slate-600 leading-relaxed">
              Academic publications play a critical role in shaping
              disciplinary knowledge, influencing policy discourse, guiding
              institutional decision-making, and informing future research
              trajectories. As such, publishing demands <span className="text-slate-900 font-medium">care, restraint, and
              intellectual responsibility.</span>
            </p>
          </div>
        </div>
      </section>

      {/* --- CORE PHILOSOPHY & RIGOR --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Foundational Values</h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              Our academic philosophy is grounded in intellectual honesty,
              methodological rigor, and long-term scholarly relevance. We value
              research that demonstrates clarity of reasoning, coherence of
              argumentation, and depth of engagement with existing literature.
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              Priority is given to work that advances understanding within its
              field, rather than research driven primarily by trends, metrics, or
              rapid visibility.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800" 
              alt="Deep scholarly work" 
              className="rounded-2xl shadow-xl grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </section>

      {/* --- CORE VALUES GRID --- */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=1000" 
              alt="Rigorous research" 
              className="rounded-2xl shadow-2xl relative z-10"
            />
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-indigo-50 rounded-2xl -z-0" />
          </div>
          
          <div className="space-y-8">
            <h2 className="text-3xl font-serif font-bold text-slate-900">Foundational Ethics</h2>
            <p className="text-lg text-slate-700 leading-relaxed">
              Our academic philosophy is grounded in intellectual honesty,
              methodological rigor, and long-term scholarly relevance. We value
              research that demonstrates clarity of reasoning, coherence of
              argumentation, and depth of engagement with existing literature.
              Priority is given to work that advances understanding within its
              field, rather than research driven primarily by trends, metrics, or
              rapid visibility.
            </p>
            <div className="flex gap-4">
              <div className="p-4 bg-indigo-50 rounded-xl">
                <Globe className="text-indigo-600 mb-2" size={24} />
                <h4 className="font-bold text-sm uppercase tracking-tighter">Global Reach</h4>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <Microscope className="text-slate-600 mb-2" size={24} />
                <h4 className="font-bold text-sm uppercase tracking-tighter">Scientific Rigor</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- QUALITY & REJECTION (THE QUOTE SECTION) --- */}
      <section className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-4xl font-serif font-bold text-slate-900">Commitment to Quality</h2>
            <p className="text-xl text-slate-700 leading-relaxed">
              Quality remains the central principle governing all publishing
              activities at Lurnexa Publications. Each submission is evaluated
              against clearly articulated academic benchmarks that emphasize
              originality, rigor, relevance, and ethical compliance. Editorial
              decisions are made on the strength of scholarly contribution rather
              than procedural completion or publication volume targets.
            </p>
          </div>
          <div className="lg:col-span-4 flex items-center">
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-8 border-indigo-600">
              <Quote className="text-indigo-200 mb-4" size={40} />
              <p className="text-slate-700 font-medium italic">
                "Rejection is treated as an essential mechanism of quality assurance
                and academic discipline. Acceptance signifies alignment with
                scholarly standards and contribution to knowledge."
              </p>
            </div>
          </div>
          <div className="lg:col-span-12">
            <p className="text-slate-600 text-lg max-w-4xl">
              This approach protects the credibility of authors, reviewers, and the publisher alike, and
              ensures that published work retains long-term academic value.
            </p>
          </div>
        </div>
      </section>

      {/* --- INDEPENDENCE & ETHICS SPLIT --- */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="space-y-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white mb-6">
            <Scale size={24} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Editorial Independence & Governance</h2>
          <p className="text-slate-700 leading-relaxed">
            Editorial decision-making at Lurnexa Publications operates with full
            academic independence. Governance structures are deliberately
            designed to separate editorial judgment from administrative,
            financial, or external influence. This separation is fundamental to
            preserving trust in the evaluation and publication process.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Editors and reviewers function within clearly documented frameworks
            that define roles, responsibilities, and ethical obligations.
            Decisions are guided exclusively by scholarly merit, disciplinary
            relevance, and ethical standards. Governance mechanisms also ensure
            accountability, consistency, and procedural fairness across all
            publications.
          </p>
        </div>

        <div className="space-y-6 bg-slate-900 text-white p-12 rounded-3xl relative overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800" 
            alt="Business ethics" 
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Ethics & Integrity Culture</h2>
            <p className="text-slate-300 leading-relaxed mb-6">
              Ethical conduct forms the foundation of all publishing activities at
              Lurnexa Publications. The organization maintains zero tolerance for
              plagiarism, data fabrication or manipulation, misrepresentation of
              authorship, or unethical review practices. Integrity is treated not
              as a procedural requirement, but as a core academic value.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Transparency, fairness, and accountability guide interactions with
              authors, reviewers, and institutions. Ethical concerns are addressed
              through documented procedures that balance due process with the
              protection of the scholarly record. Upholding research integrity is
              regarded as a collective responsibility.
            </p>
          </div>
        </div>
      </section>

      {/* --- REVIEW PHILOSOPHY IMAGE BANNER --- */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-[2rem] overflow-hidden bg-indigo-50 border border-indigo-100">
          <div className="p-12 lg:p-20 space-y-8">
            <h2 className="text-3xl font-bold text-slate-900">Review & Evaluation Philosophy</h2>
            <p className="text-slate-700">Research is assessed through structured, criteria-based evaluation frameworks focusing on:</p>
            <ul className="space-y-4">
              {[
                "Originality and contribution to knowledge",
                "Strength of theoretical grounding",
                "Methodological soundness",
                "Quality of analysis and reasoning",
                "Applied relevance"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-medium text-slate-800">
                  <CheckCircle className="text-indigo-600" size={20} />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-slate-500 text-sm italic">
              Constructive, scholarly feedback is regarded as a critical component of academic
              development, irrespective of final editorial outcome.
            </p>
          </div>
          <div className="h-full min-h-[400px]">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" 
              alt="Peer review process" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* --- SCOPE & ENGAGEMENT --- */}
    {/* --- BEAUTIFIED SCHOLARLY SCOPE & COMMUNITY SECTION --- */}
      <section className="relative max-w-7xl mx-auto px-6 py-32 overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* SCHOLARLY SCOPE CARD */}
          <div className="group relative flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800" 
                alt="Books and Research" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-indigo-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  Research Domains
                </span>
              </div>
            </div>
            
            <div className="p-8 lg:p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <BookOpen size={24} />
                </div>
                <h2 className="text-1xl font-serif font-bold text-slate-900 tracking-tight">
                  Scholarly Scope & Orientation
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed first-letter:text-4xl first-letter:font-serif first-letter:mr-2 first-letter:float-left first-letter:text-indigo-600">
                  Lurnexa Publications supports discipline-specific as well as
                  interdisciplinary research across management, economics,
                  technology, operations, decision sciences, and related applied
                  domains. While interdisciplinary inquiry is encouraged, such work
                  is expected to maintain conceptual clarity, methodological rigor,
                  and disciplinary accountability.
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-slate-600 italic leading-relaxed">
                    Scope alignment remains a central consideration in editorial
                    evaluation. This ensures coherence within individual publications
                    while allowing space for cross-disciplinary dialogue that is
                    academically grounded and methodologically sound.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* COMMUNITY ENGAGEMENT CARD */}
          <div className="group relative flex flex-col bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 overflow-hidden">
            <div className="h-48 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800" 
                alt="Collaboration" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-sm text-emerald-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">
                  Collaborative Responsibility
                </span>
              </div>
            </div>

            <div className="p-8 lg:p-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                  <Users size={24} />
                </div>
                <h2 className="text-1xl font-serif font-bold text-slate-900 tracking-tight">
                  Engagement with the Academic Community
                </h2>
              </div>

              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Publishing at Lurnexa Publications is approached as a collaborative
                  academic responsibility rather than a transactional exchange.
                  Engagement with researchers, reviewers, and institutions is
                  conducted through transparent, respectful, and professionally
                  structured processes.
                </p>
                <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500">
                  <p className="text-slate-700 leading-relaxed font-medium">
                    Clear communication, accessible guidelines, and timely
                    correspondence reflect respect for the intellectual labor and
                    professional commitments of the academic community. Relationships
                    are built on mutual trust, scholarly respect, and shared
                    responsibility.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- THE STANDARDS LISTS --- */}
      <section className="max-w-6xl mx-auto px-6 py-24 bg-white border border-slate-100 shadow-xl rounded-[3rem] my-12">
        <h2 className="text-3xl font-bold text-center mb-16">What Defines Our Standards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 px-6 md:px-12">
          <ul className="space-y-6">
            <h4 className="text-indigo-600 font-bold uppercase tracking-widest text-xs mb-8">Pillars of Excellence</h4>
            {[
              "Scholarly merit over publication volume",
              "Transparency over opacity in decision-making",
              "Ethical compliance over procedural shortcuts",
              "Long-term academic value over short-term visibility"
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600" />
                </div>
                <span className="text-slate-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>
          <ul className="space-y-6">
            <h4 className="text-rose-600 font-bold uppercase tracking-widest text-xs mb-8">Strict Operational Boundaries</h4>
            {[
              "We do not guarantee publication or acceptance",
              "We do not expedite reviews at the expense of rigor",
              "We do not influence editorial outcomes through non-academic considerations",
              "We do not participate in pay-for-acceptance or unethical publishing practices"
            ].map((item, i) => (
              <li key={i} className="flex gap-4 items-start">
                <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                </div>
                <span className="text-slate-700 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-center text-slate-400 mt-16 text-sm italic">
          These principles define the operational boundaries and academic identity of Lurnexa Publications.
        </p>
      </section>

      {/* --- TRANSPARENCY & LONG TERM COMMITMENT --- */}
      {/* --- PROFESSIONAL TRANSPARENCY & COMMITMENT SECTION --- */}
      <section className="bg-slate-50 py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            
            {/* Transparency Block */}
            <div className="group space-y-6 p-8 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Transparency & Accountability
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                All publishing activities are governed by documented policies
                addressing <span className="text-slate-900 font-medium">ethics, peer review, appeals</span>, and post-publication
                oversight. Authors and reviewers are encouraged to engage with
                these policies to ensure shared understanding of expectations and
                responsibilities. Concerns, complaints, and appeals are addressed objectively through established, fair procedures.
              </p>
            </div>

            {/* Long Term Commitment Block */}
            <div className="group space-y-6 p-8 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 shadow-sm">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-300">
                <Globe size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                Long-Term Scholarly Commitment
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Lurnexa Publications is committed to the sustained development of
                credible, responsible academic publishing practices. Ongoing
                efforts focus on <span className="text-slate-900 font-medium">strengthening editorial frameworks</span> and aligning operational practices with
                globally recognized academic benchmarks. Growth is pursued cautiously and responsibly, ensuring integrity is never compromised for speed.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* --- PREMIUM INSTITUTIONAL STATEMENT FOOTER --- */}
    
<section className="bg-indigo-600 py-24 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif mb-8">Institutional Statement</h2>
          <p className="text-xl leading-relaxed text-indigo-100">
            Lurnexa Publications exists to support responsible scholarly
            communication and the advancement of credible academic discourse.
            The platform serves researchers and institutions that value rigor,
            transparency, and meaningful contribution to knowledge, and seeks
            to uphold standards that endure beyond individual publications.
          </p>
          <div className="mt-12 h-1 w-20 bg-white/30 mx-auto" />
        </div>
      </section>
      {/* --- FINAL MINIMAL FOOTER --- */}
     
      <FooterSection/>
    </main>
    </>
  );
}