"use client";
import NavigationPage from "@/components/Home/Navigation_SubJournals_ACIET";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";
import Image from "next/image";
export default function ACIETPage() {
  return (
    <>
      <NavigationPage />
      <section className="py-20 pt-30 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300 ">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-2xl font-bold text-center text-gray-900 mb-2">
            Advanced Computational Intelligence & Emerging Technologies (ACIET)
          </h1>
          <p className="text-center text-lg text-gray-600 italic mb-12">
            “Pioneering Intelligence, Shaping the Future”
            <br />
            ISSN:
          </p>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-[0.6] flex justify-center lg:mt-[52px]">
              <Image src="/Aciet2.png" alt="Journal cover for Advanced Computational Intelligence & Emerging Technologies, ACIET. The cover features an abstract design with interconnected lines and glowing nodes set against a dark background, conveying themes of advanced technology and digital networks."
          width={300}
          height={400}
          className="object-cover rounded-lg shadow-xl border"
          priority
          />
            </div>

            <div className="flex-[1.5] flex flex-col items-end gap-3 w-full">
              <Link href="/EditorialBoard/ACIET">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-all cursor-pointer font-semibold text-sm">
                  ACIET Editorial Page
                </button>
              </Link>

              <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-inner border max-h-[550px] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 text-start">
              <Section title="About Us">
               The ACIET section focuses on advancing research in artificial intelligence, machine learning, and next-generation computing.
                We publish innovative studies that address real-world technological challenges through intelligent systems.
                Our aim is to promote interdisciplinary research that integrates AI with emerging digital technologies.
                The section brings together global scholars, researchers, and industry professionals.
                We strive to contribute to the future of smart, automated, and data-driven innovation.
              </Section>
              <Section title="Vision">
                To be a global catalyst advancing intelligent technologies by fostering innovation, computational excellence, and interdisciplinary breakthroughs that redefine the future of digital transformation.
              </Section>
              <ListSection title="Mission" items={[
                " To publish high-quality, peer-reviewed research that expands the frontiers of AI, ML, data science, and emerging digital technologies.",
                " To encourage interdisciplinary collaboration among academia, research institutions, and industry.",
                " To enable scholars to explore futuristic solutions that address real-world challenges.",
                " To promote ethical, responsible, and impactful applications of computational intelligence."
              ]}/>
              <ListSection title="Objectives" items={[
               "Facilitate global dissemination of research in AI, neural networks, computational modeling, and emerging tech.",
" Provide a scientific platform for breakthrough innovations in automation, robotics, cybersecurity, and IoT.",
" Support young researchers and innovators through inclusive and transparent publication processes.",
" Promote standards of excellence, originality, and scientific rigor in all published works.",
" Build a global research network that supports future-driven technological progress."

              ]}/>
              <ListSection title="Aims" items={[
                "To publish research that advances AI, machine learning, and computational technologies.",
                " To promote interdisciplinary innovations solving complex real-world problems.",
                " To support global scientific development in emerging and intelligent systems."
              ]}/>
              <Section title="Scope">
                 Artificial Intelligence, Machine Learning, Deep Learning,
                  Data Science, Big Data & Predictive Models,
                  Computer Vision, NLP & Cognitive Systems,
                  Robotics, Automation & Intelligent Decision Systems,
                  Cybersecurity, Blockchain & Emerging Digital Technologies,
                  IoT, Edge Computing, Cloud Computing,
                  Quantum Computing & Future Tech

              </Section>
              
              </div>
            </div>
          </div>
        </div>
            <Buttons/>
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
  {/* <Link href="/EditorialBoard/ACIET">
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
