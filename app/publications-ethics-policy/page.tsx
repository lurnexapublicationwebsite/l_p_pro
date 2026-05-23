import FooterSection from "@/components/Home/FooterSection";
import NavigationPage from "@/components/Home/Navigation_SubJournal";
import { Scale, Users, FileCheck, AlertTriangle, MessageSquare } from "lucide-react";

export default function PublicationEthicsPolicy() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <NavigationPage showLogoName={true} logoName="Lurnexa" />

      {/* Hero Header */}
      <header className="bg-slate-50 border-b border-slate-200 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
              Standard Compliance
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-950 mb-6">
            PUBLICATION ETHICS POLICY
          </h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-12">
          
          {/* 1. Ethical Framework */}
          <section className="relative p-8 rounded-2xl border border-slate-200 bg-white">
            <div className="absolute -top-4 left-8 bg-blue-600 text-white p-2 rounded-lg shadow-lg">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold mb-4 pt-2">1. Ethical Framework</h3>
            <p className="text-slate-700 leading-relaxed">
              GJPIR is committed to maintaining the highest standards of integrity in scholarly publishing. The journal follows internationally recognized ethical principles inspired by the Committee on Publication Ethics (COPE).
            </p>
            <p className="mt-4 font-medium text-slate-900 italic">
              All stakeholders—including authors, editors, reviewers, and publishers—are expected to adhere to these ethical standards.
            </p>
          </section>

          {/* 2. Author Responsibilities */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold">2. Author Responsibilities</h3>
            </div>
            <p className="mb-6 text-slate-600">Authors submitting to GJPIR must ensure that:</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: "2.1 Originality and Authenticity", items: ["Manuscripts are original and unpublished", "Content is not under consideration elsewhere", "All sources are properly cited"] },
                { title: "2.2 Authorship Criteria", items: ["Only individuals with significant contributions listed", "All co-authors approved final manuscript", "Changes in authorship must be justified"] },
                { title: "2.3 Data Integrity", items: ["Data must be accurate and verifiable", "Fabrication or manipulation is prohibited"] },
                { title: "2.4 Conflict of Interest", items: ["Must disclose financial or personal conflicts"] },
                { title: "2.5 Ethical Compliance", items: ["Human/animal research must follow guidelines", "Necessary approvals must be obtained"] }
              ].map((section, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                  <h4 className="font-bold text-slate-900 mb-2">{section.title}</h4>
                  <ul className="text-sm text-slate-600 space-y-1">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-blue-500">•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* 3 & 4. Editors and Reviewers */}
          <div className="grid md:grid-cols-2 gap-8">
            <section className="border-t-2 border-blue-600 pt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" /> 3. Editorial Responsibilities
              </h3>
              <p className="text-sm font-medium mb-3">Editors must:</p>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Ensure fair, unbiased, and transparent decisions</li>
                <li>Evaluate manuscripts based solely on academic merit</li>
                <li>Maintain confidentiality of submissions</li>
                <li>Avoid conflicts of interest</li>
                <li>Take appropriate action in case of ethical concerns</li>
              </ul>
            </section>

            <section className="border-t-2 border-slate-900 pt-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-slate-900" /> 4. Reviewer Responsibilities
              </h3>
              <ul className="text-sm text-slate-600 list-disc pl-5 space-y-1">
                <li>Provide objective, constructive, and timely reviews</li>
                <li>Maintain strict confidentiality</li>
                <li>Identify relevant uncited work</li>
                <li>Declare conflicts of interest</li>
                <li>Avoid using manuscript content for personal benefit</li>
              </ul>
            </section>
          </div>

          {/* 5. Ethical Misconduct */}
          <section className="bg-red-50 p-8 rounded-2xl border border-red-100">
            <div className="flex items-center gap-3 mb-4 text-red-700">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-2xl font-bold">5. Ethical Misconduct</h3>
            </div>
            <p className="mb-4 font-semibold text-red-900">The journal does not tolerate unethical practices, including:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 text-xs font-bold uppercase tracking-tighter text-red-700">
              <span className="bg-red-100 p-2 text-center rounded">Plagiarism</span>
              <span className="bg-red-100 p-2 text-center rounded">Duplicate Submission</span>
              <span className="bg-red-100 p-2 text-center rounded">Data Fabrication</span>
              <span className="bg-red-100 p-2 text-center rounded">Improper Attribution</span>
            </div>
            <p className="mb-2 font-bold text-red-950">Actions may include:</p>
            <ul className="text-sm text-red-800 list-disc pl-5 space-y-1">
              <li>Immediate rejection</li>
              <li>Retraction of published articles</li>
              <li>Notification to affiliated institutions</li>
              <li>Restriction on future submissions</li>
            </ul>
          </section>

          {/* 6, 7 & 8. Bottom Information */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start border-l-4 border-slate-200 pl-6">
              <div className="pt-1"><MessageSquare className="w-5 h-5 text-slate-400" /></div>
              <div>
                <h3 className="text-xl font-bold mb-2">6. Complaints and Appeals</h3>
                <p className="text-sm text-slate-600">Authors may appeal editorial decisions by submitting a justified request. Appeals are reviewed independently; Final decision rests with the editorial board.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start border-l-4 border-slate-200 pl-6">
              <div className="pt-1"><FileCheck className="w-5 h-5 text-slate-400" /></div>
              <div>
                <h3 className="text-xl font-bold mb-2">7. Corrections and Retractions</h3>
                <p className="text-sm text-slate-600">Errors identified post-publication may lead to corrections or retractions. Retraction notices will be clearly linked to the original article.</p>
              </div>
            </div>

            <footer className="bg-slate-950 text-white p-8 rounded-3xl text-center">
              <h3 className="text-xl font-bold mb-3">8. Ethical Oversight</h3>
              <p className="text-slate-400 text-sm italic">
                GJPIR continuously monitors and updates its policies to align with global ethical standards in scholarly publishing.
              </p>
            </footer>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}