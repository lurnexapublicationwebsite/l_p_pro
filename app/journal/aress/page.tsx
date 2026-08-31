"use client";
import NavigationPage from "@/components/Home/Navigation_SubJournals_ARESS";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";
import Image from "next/image";
export default function ARESSPage() {
  return (
    <>
      <NavigationPage />
      <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-2xl font-bold text-center text-gray-900 mb-2">
            Advanced Research in Economics and Social Sciences (ARESS)
          </h1>
          <p className="text-center text-lg text-gray-600 italic mb-12">
            “Empowering Socio-Economic Transformation”
             <br />
            ISSN: 3139-9126
          </p>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left Image */}
            <div className="flex-[0.6] flex justify-center lg:mt-[52px]">
              <Image
                src="/Aress.png"
                alt="ARESS Cover"
                width={240}
                height={320}
                className="object-cover rounded-lg shadow-md border border-gray-200"
              />
            </div>

            {/* Right Content */}
            <div className="flex-[1.5] flex flex-col items-end gap-3 w-full">
              <Link href="/EditorialBoard/ARESS">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-all cursor-pointer font-semibold text-sm">
                  ARESS Editorial Page
                </button>
              </Link>

              <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-inner border border-gray-200 max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6 text-start">
              <Section title="About Us">
              
ARESS publishes scholarly work that deepens understanding of economic systems and social development.
We provide a platform for evidence-based research that informs policy and societal progress.
The section encourages interdisciplinary studies across economics, governance, and social sciences.
We support research addressing real-world issues such as inequality, growth, and public welfare.
ARESS aims to contribute to meaningful development through high-impact academic insights.
              </Section>

              <Section title="Vision">
               To emerge as a leading platform empowering high-quality research in economics and social sciences, advancing evidence-based policy, development, and societal well-being.
              </Section>

              <ListSection title="Mission" items={[
               " To foster interdisciplinary research addressing economic, social, and developmental challenges.",
" To encourage publications that contribute to policymaking, societal progress, and socio-economic innovation.",
" To support scholars in producing research that drives equitable growth and human-centric transformation.",
" To promote global dialogue on socio-economic systems and emerging societal trends."
              ]}/>

              <ListSection title="Objectives" items={[
                " Publish scholarly work in microeconomics, macroeconomics, development studies, public policy, sociology, and behavioural sciences.",
" Encourage comparative and empirical research that supports data-driven decision-making.",
" Provide a platform for studies contributing to inclusive growth, governance, and social innovation.",
"Support young researchers working on social impact, inequality, public systems, and economic transformation.",
" Facilitate global collaboration among economists, social scientists, and policymakers."

              ]}/>

              <ListSection title="Aims" items={[
                "To publish research that advances economic understanding and social development.",
" To support policy-relevant studies addressing societal and developmental issues.",
" To encourage interdisciplinary dialogue on economic and social systems",
              ]}/>

              <Section title="Scope">
               Microeconomics, Macroeconomics & Econometrics
Development Economics, Public Policy & Governance
International Economics & Trade
Sociology, Psychology & Social Behaviour
Education, Health & Social Development
Environmental Economics & Sustainable Development
              </Section>

             

            </div>
          </div>
        </div>
              <Buttons />

        </div>
      </section>
      <FooterSection />
    </>
  );
}

const Section = ({ title, children }: any) => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-700 leading-relaxed">{children}</p>
  </div>
);
const ListSection = ({ title, items }: any) => (
  <div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-2">{title}</h2>
    <ul className="list-decimal list-inside text-gray-700 leading-relaxed space-y-1">
      {items.map((i: string, idx: number) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  </div>
);
const Buttons = () => (
 <div className="flex flex-wrap justify-center gap-4 pt-6 px-4 sm:px-8 md:px-20">
  {/* <Link href="/EditorialBoard/ARESS">
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
