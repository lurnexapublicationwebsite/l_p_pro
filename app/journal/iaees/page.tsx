"use client";
import React from "react";
import NavigationPage from "@/components/Home/Navigation_SubJournals_IAEES";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";

export default function IAEESPage() {
  return (
    <>
      <NavigationPage />
      <section className="py-20 px-6 bg-linear-to-b from-neutral-50 to-white border-b border-gray-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="mt-3 text-2xl md:text-2xl font-bold text-center text-gray-900 mb-2">
            Institute of Advanced Electrical & Electronics Studies (IAEES)
          </h1>
          <p className="text-center text-lg text-gray-600 italic mb-12">
            “Empowering Innovation in Electrical and Electronic Frontiers”
             <br />
            ISSN:
          </p>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Left Image */}
            <div className="flex-[0.6] flex justify-center lg:mt-[52px]">
              <img
                src="/Iaees3.png"
                alt="IAEES Cover"
                className="w-[240px] h-[320px] object-cover rounded-lg shadow-md border border-gray-200"
              />
            </div>

            {/* Right Content */}
            <div className="flex-[1.5] flex flex-col items-end gap-3 w-full">
              <Link href="/EditorialBoard/IAEES">
                <button className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-all cursor-pointer font-semibold text-sm">
                  IAEES Editorial Page
                </button>
              </Link>

              <div className="w-full bg-white p-6 md:p-8 rounded-xl shadow-inner border border-gray-200 max-h-[550px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6 text-start">
                <Section title="About Us">
                 IAEES is committed to promoting innovation in electrical and electronics engineering.
  We focus on research that enhances power systems, electronics, automation, and intelligent technologies.
  The section encourages studies that support sustainable and efficient engineering solutions.
  We connect researchers and engineers working on next-generation electrical and electronic advancements.
  IAEES aims to contribute to global technological progress through high-quality engineering research.
                </Section>

                <Section title="Vision">
                  To be a globally recognized hub for pioneering research and innovation in electrical and electronics engineering, driving the next generation of intelligent, sustainable, and high-performance technological solutions.
                </Section>

                <ListSection title="Mission" items={[
                 "To publish cutting-edge research advancing power systems, electronics, embedded systems, automation, and communication technologies",
  "To support innovation that contributes to smarter, safer, and more efficient electrical and electronic systems.",
  "To connect researchers, industry experts, and academicians for collaborative technological advancement.",
  " To promote sustainable and energy-efficient engineering practices that address global challenges.",
  "To encourage futuristic research in semiconductor technology, microelectronics, signal processing, and intelligent control systems."
                ]}/>

                <ListSection title="Objectives" items={[
                 " Promote high-quality innovations in electrical engineering, electronics, circuits, power generation, and emerging EEE technologies.",
  " Support research advancements in automation, VLSI, IoT devices, renewable energy systems, and embedded technologies.",
  " Provide a platform for global knowledge exchange through publications, expert reviews, and academic-industry collaboration.",
  " Encourage young engineers and researchers to contribute novel ideas addressing real-world technological challenges.",
  " Uphold international scientific standardsensuring originality, technical rigor, and impactful engineering research.",
  " Facilitate interdisciplinary applications, integrating electronics with AI, robotics, smart grids, and communication systems.",
  " Contribute to sustainable development through research in green technologies, efficient energy systems, and eco-friendly engineering innovations."
                ]}/>

                <ListSection title="Aims" items={[
                " To support research advancing electrical and electronic engineering innovations",
                " To promote sustainable, intelligent and efficient engineering solutions",
                " To integrate modern engineering with emerging technologies"
                ]}/>

                <Section title="Scope">
                Electrical Engineering, Power Systems & Power Electronics,
                Renewable Energy, Smart Grids & Energy Systems,
                Electronics, VLSI, Embedded & Digital Systems,
                Communication Systems, Signal Processing & Networks,
                Control Systems, Automation & Instrumentation,
                Robotics, IoT Devices & Cyber-Physical Systems,
                Semiconductor Devices & Sensor Technologies
                            
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
  {/* <Link href="/EditorialBoard/IAEES">
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
