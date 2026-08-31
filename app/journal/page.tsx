"use client";

import NavigationPage from "@/components/Home/Navigation_Gjpir";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";

export default function PublicationsPage() {
  return (
    <>
      <NavigationPage showLogoName={true} logoName="Lurnexa" />
      <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="mt-3 text-2xl md:text-2xl font-bold text-center text-gray-900 mb-2">
            Global Journal for Progressive Innovation and Research (GJPIR)
          </h1>
          <p className="text-center text-lg text-gray-600 italic mb-12">
            “Integrating Knowledge, Inspiring Progress”
            <br />
            ISSN: 3139-9126
          </p>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-[0.6] flex justify-center lg:mt-[52px]">
              <img
                src="/Gjpir.png"
                alt="GJPIR Cover"
                className="w-[520px] h-[500px] object-contain rounded-lg shadow-md border bg-white p-2"
              />
            </div>

            <div className="flex-[1.5] flex flex-col items-end gap-3 w-full">
              <Link href="/EditorialBoard/GJPIR">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-all cursor-pointer font-semibold text-sm">
                  Editorial Page
                </button>
              </Link>

              <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-inner border max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 text-start">
                
                {/* ==== ABOUT JOURNAL SECTION (Custom Layout) ==== */}
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Journal</h2>
                
                {/* ==== MOVED DETAILS LIST (Below Title, Above Para) ==== */}
                <section className="mb-6 bg-slate-50 p-5 rounded-lg border border-slate-200">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                    <li>
                      <strong className="text-gray-900">Year of Starting:</strong> 2026
                    </li>
                    <li>
                      <strong className="text-gray-900">Number of issues:</strong> 2 issues per year
                    </li>
                    <li>
                      <strong className="text-gray-900">Mode:</strong> Online
                    </li>
                    <li>
                      <strong className="text-gray-900">Language:</strong> English
                    </li>
                    <li className="sm:col-span-2">
                      <strong className="text-gray-900">Subject Area:</strong> Multidisciplinary
                    </li>
                  </ul>
                </section>

                <p className="text-gray-700 leading-relaxed">
                  The Global Journal for Progressive Innovation and Research (GJPIR)
                  is established as a common platform for researchers working across
                  technology, management, economics, social sciences, and
                  engineering. The journal brings together four focused sections
                  that collectively support a wide spectrum of academic inquiry. We
                  aim to publish work that carries clarity, relevance, and long-term
                  value to the research community. Our approach encourages both
                  disciplinary and cross-disciplinary studies, especially those that
                  address current challenges and future possibilities. GJPIR
                  maintains a transparent review process and follows strong academic
                  ethics to ensure the reliability of the research it publishes. We
                  welcome contributions from scholars, professionals, and
                  practitioners who seek to share knowledge that can benefit
                  institutions, industries, and society. Through this journal, we
                  hope to strengthen research culture, promote meaningful dialogue,
                  and support new ideas that contribute to advancement in various
                  fields.
                </p>
              </div>

              {/* ==== VISION SECTION ==== */}
              <Section title="Vision">
                To evolve as a dependable and respected multidisciplinary research
                journal contributing to innovation and sustainable advancement
                across diverse fields.
              </Section>

              {/* ==== MISSION SECTION ==== */}
              <ListSection
                title="Mission"
                items={[
                  "Publish quality research reflecting originality and integrity.",
                  "Encourage collaboration among multiple disciplines.",
                  "Address emerging global concerns through evidence-based studies.",
                  "Maintain transparent peer-review and ethical publication standards.",
                ]}
              />

              {/* ==== OBJECTIVES SECTION ==== */}
              <ListSection
                title="Objectives"
                items={[
                  "Foster interdisciplinary collaboration.",
                  "Encourage innovation linking theory with practice.",
                  "Promote ethical, socially relevant research.",
                  "Strengthen academic and industrial connections globally.",
                ]}
              />

              {/* ==== AIMS SECTION ==== */}
              <ListSection
                title="Aims"
                items={[
                  "To bring together research that contributes to innovation, scientific understanding, and societal progress",
                  "To encourage studies that connect multiple disciplines and offer practical insights.",
                  "To support work that is thoughtful, evidence-based, and useful for academic and professional communities.",
                  "To publish research aligned with emerging trends and long-term developmental needs.",
                ]}
              />

              {/* ==== SCOPE SECTION ==== */}
              <Section title="Scope">
                <b className="text-gray-900">Computational and Emerging Technologies : </b>
                Artificial intelligence, machine learning, data-driven modelling,
                robotics, automation, cybersecurity, IoT, and upcoming digital
                technologies.
                <br />
                <br />
                <b className="text-gray-900">Management Studies : </b>
                Strategic management, operations, supply chain systems, analytics,
                entrepreneurship, governance, sustainability, and financial
                systems.
                <br />
                <br />
                <b className="text-gray-900">Economics and Social Sciences : </b>
                Economic theory and practice, development studies, policy,
                governance, behavioural sciences, social development, and
                environmental economics.
                <br />
                <br />
                <b className="text-gray-900">Electrical and Electronics Engineering : </b>
                Power systems, renewable energy, smart grids, electronics, VLSI,
                embedded technologies, communication systems, automation, and
                intelligent hardware systems.
                <br />
                <br />
                The journal welcomes full-length research papers, review articles,
                case studies, conceptual studies, and analytical reports.
              </Section>
            </div>
          </div>
        </div>
        </div>
      </section>

      <FooterSection />
    </>
  );
}

function Section({ title, children }: any) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-700 leading-relaxed">{children}</p>
    </div>
  );
}

function ListSection({ title, items }: any) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
      <ul className="list-decimal list-inside text-gray-700 leading-relaxed space-y-1">
        {items.map((i: string, idx: number) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

/* <div className="flex-1 text-start lg:text-left space-y-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                Lurnexa Publications
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                Lurnexa Publications is a leading techno-management hub of
                knowledge and innovation, bridging technology, research, and
                management disciplines. Our peer-reviewed journals aim to
                promote global academic collaboration and dissemination of
                impactful research.
              </p>

              
            </div> */