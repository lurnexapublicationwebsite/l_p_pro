"use client";

import NavigationPage from "@/components/Home/Navigation_SubJournals_Explore";
import FooterSection from "@/components/Home/FooterSection";
import Link from "next/link";

export default function ExploreJournalsPage() {
  const journals = [
    {
      Id: 1,
      title: "Advances in Computer & Information Engineering Technology (ACIET)",
      description:
        "Dive into advanced studies and innovations in computing and information technologies.",
      color: "bg-purple-600",
      path: "/journal/aciet",
      image: "/Aciet.png",
      name: "ACIET",
    },
    {
      Id: 2,
      title: "Center for Innovative Management Studies (CIMS)",
      description:
        "Discover pioneering research in management, leadership, and innovation strategies.",
      color: "bg-yellow-500",
      path: "/journal/cims",
      image: "/Cimss.png",
      name: "CIMS",
    },
    {
      Id: 3,
      title: "Advanced Research in Economics & Social Sciences (ARESS)",
      description:
        "Engage with impactful research and insights in economics and social sciences.",
      color: "bg-emerald-600",
      path: "/journal/aress",
      image: "/Aress.png",
      name: "ARESS",
    },
    {
      Id: 4,
      title: "Institute of Advanced Electrical & Electronics Studies (IAEES)",
      description:
        "Explore advancements and applied research in electrical and electronics engineering.",
      color: "bg-indigo-600",
      path: "/journal/iaees",
      image: "/Iaees.png",
      name: "IAEES",
    },
  ];

  return (
    <>
      <NavigationPage />
    <section className="relative z-50 overflow-x-hidden py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 border-b border-gray-300">
  <div className="max-w-7xl mx-auto text-center">
    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 text-gray-900">
      Sub Division Journals
    </h1>
    <p className="text-base sm:text-lg text-gray-700 mb-10 sm:mb-12 max-w-2xl mx-auto">
      Explore our peer-reviewed open-access journals in techno-management
      and social sciences.
    </p>

    {/* Responsive grid */}
    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-center">
      {journals.map((journal) => (
        <Link key={journal.Id} href={journal.path}>
          <div className="flex flex-col h-full items-center text-center cursor-pointer bg-white shadow-md rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            
            {/* Image section (FULL image visible) */}
            <div className="w-full aspect-[3.5/4] overflow-hidden rounded-t-xl flex items-center justify-center bg-white">
              <img
                src={journal.image}
                alt={journal.title}
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
              />
            </div>

            {/* Button below image */}
            {journal.path && (
              <button className="mt-4 mb-4 bg-blue-500 text-white text-sm sm:text-base font-medium rounded-xl px-5 py-2 hover:bg-blue-600 transition-all duration-200 w-[80%] sm:w-[70%] lg:w-[60%]">
                {journal.name}
              </button>
            )}
          </div>
        </Link>
      ))}
    </div>

    {/* Back button */}
    <div className="mt-12">
      <Link href="/journal">
        <button className="bg-gray-200 text-gray-800 text-sm sm:text-base px-6 py-2 rounded-md hover:bg-gray-300 transition-all duration-200">
          ← Back to Journal
        </button>
      </Link>
    </div>
  </div>
</section>


      <FooterSection />
    </>
  );
}
