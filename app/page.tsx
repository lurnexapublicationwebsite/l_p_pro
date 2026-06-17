"use client";

import { useEffect, useState } from "react";
import HeroSection from "@/components/Home/HeroSection";
import VisionMission from "@/components/Home/VisionMission";
import WhoWeAre from "@/components/Home/WhoWeAre";
import FooterSection from "@/components/Home/FooterSection";
import FeaturesSectionDemo from "@/components/features-section-demo-2";
import { LeadershipSection } from "@/components/Home/LeadershipSection";
import NavigationPage from "@/components/Home/nav/page";
import LurnexaAim from "@/components/Home/LurnexaAim";
import WelcomeIntro from "@/components/Home/WelcomeIntro";
import RollingGallery from "@/components/Home/RollingGallery";

export default function Home() {
  // ✅ Section tracking
  const SECTION_IDS = [
    "hero",
    "who-we-are",
    "vision",
    "objectives",
    "leadership",
    "contact",
  ];

  const [activeSection, setActiveSection] = useState<string>("hero");

  // Smooth scroll (optional — for future nav use)
  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  //  Intersection Observer for active section tracking
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSections = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          );

        if (visibleSections.length > 0) {
          const id = visibleSections[0].target.id;
          if (SECTION_IDS.includes(id) && id !== activeSection) {
            setActiveSection(id);
          }
        }
      },
      {
        threshold: 0.4,
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []); //  no dependency on activeSection to prevent re-observing each update

  return (
    <>
      <WelcomeIntro />
      <div className="min-h-screen text-slate-900">
        {/* Fixed navigation */}
        <section>
        <NavigationPage />
        </section>
        {/* Sections with proper IDs for observer tracking */}
        <section id="hero">
          <HeroSection />
        </section>

        <section id="who-we-are">
          <WhoWeAre />
        </section>

        <section id="vision" >
  
          <VisionMission />
        </section>
     
        <section id="objectives">
          <FeaturesSectionDemo />
        </section>
<LurnexaAim />
        <section id="leadership">
          <LeadershipSection />
        </section>
        
        <RollingGallery />
      


        <section id="contact">
          <FooterSection />
        </section>
        
                    
      </div>
    </>
  );
}
