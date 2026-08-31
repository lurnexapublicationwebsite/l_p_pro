"use client";
import NavigationPage from "@/components/Home/Navigation_SubJournals_CIMS";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";

export default function CIMSPage() {
  return (
    <>
      <NavigationPage />
      <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-2xl font-bold text-center text-gray-900 mb-2">
            Center for Innovative Management Studies (CIMS)
          </h1>
          <p className="text-center text-lg text-gray-600 italic mb-12">
            “Bridging Innovation and Management Excellence”
             <br />
            ISSN: 3139-9126
          </p>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-[0.6] flex justify-center lg:mt-[52px]">
              <img src="/Cimss.png" alt="CIMS Cover" className="w-[240px] h-[320px] object-cover rounded-lg shadow-md border"/>
            </div>

            <div className="flex-[1.5] flex flex-col items-end gap-3 w-full">
              <Link href="/EditorialBoard/CIMS">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-all cursor-pointer font-semibold text-sm">
                  CIMS Editorial Page
                </button>
              </Link>

              <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-inner border max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 text-start">
              <Section title="About Us">
                CIMS is dedicated to strengthening modern management knowledge through high-quality academic research.
                We focus on strategic, analytical, and innovative approaches that support organizational growth.
                Our section encourages studies connecting theory with real-world managerial practice.
                We welcome contributions that promote sustainability, ethics, and leadership development.
                CIMS aims to support forward-thinking research shaping the future of global management.
              </Section>
              <Section title="Vision">
                To become a leading global platform that advances modern management knowledge, innovative business practices, and leadership excellence for a rapidly evolving world.
              </Section>
              <ListSection title="Mission" items={[
                " To promote research that enhances strategic thinking, organizational innovation, and managerial effectiveness",
                " To bridge academia and industry through impactful, practice-oriented studies.",
                " To support knowledge creation in emerging areas like digital management, analytics-driven decision-making, and sustainable business models.",
                " To nurture future leaders through quality, evidence-based research dissemination",
              ]}/>
              <ListSection title="Objectives" items={[
                " Publish high-impact studies in areas such as finance, operations, and strategic management",
                " Encourage research that addresses current industry challenges and future management trends",
                " Facilitate global knowledge exchange through conferences, collaborations, and expert contributions",
                " Promote responsible, ethical, and sustainable management practices",
                " Build a repository of research contributing to managerial innovation and policy development"
              ]}/>
              <ListSection title="Aims" items={[
                 "To promote research that strengthens modern management practices",
"To enhance strategic, analytical, and operational approaches in organizations.",
" To bridge academic insights with real-world managerial challenges"

              ]}/>
              <Section title="Scope">
                 Strategic Management & Organizational Leadership,
 Operations Management, Supply Chain & Logistics,
 Business Analytics & Data-Driven Decision Making,
 Innovation Management & Entrepreneurship,
 Corporate Governance, Ethics & Sustainability,
 Financial Management, FinTech & Risk Analysis
              </Section>
             
             
              </div>
            </div>
          </div>
           <Buttons/>
        </div>
      </section>
      <FooterSection />
    </>
  );
}
const Section = ({ title, children }: any) => (
  <div><h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2><p className="text-gray-700 leading-relaxed">{children}</p></div>
);
const ListSection = ({ title, items }: any) => (
  <div><h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2><ul className="list-decimal list-inside text-gray-700 leading-relaxed space-y-1">{items.map((i: string, idx: number) => <li key={idx}>{i}</li>)}</ul></div>
);
const Buttons = () => (
  <div className="flex flex-wrap justify-center gap-4 pt-6 px-4 sm:px-8 md:px-20">
  {/* <Link href="/EditorialBoard/CIMS">
    <button className="w-48 sm:w-56 md:w-60 bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-all duration-200">
      Editorial Board
    </button>
  </Link> */}

<Link href="/submityourarticle">
    <button className="w-48 sm:w-56 md:w-60 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-500 transition-all duration-200 cursor-pointer">
      Article / Case Submission
    </button>
  </Link>

  <Link href="/journal/explore">
    <button className="w-48 sm:w-56 md:w-60 bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-all duration-200">
      ← Back to Journals
    </button>
  </Link>
</div>

);
