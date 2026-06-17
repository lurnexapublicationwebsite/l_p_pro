"use client";
import { useEffect, useState } from "react";
import StaggeredMenu from "@/components/StaggeredMenu";
const SECTION_IDS = [
  "hero",
  "vision",
  "objectives",
  "who-we-are",
  "leadership",
  "contact",
];
  
const menuItems = [
  { label: "Home", ariaLabel: "Go to home page", link: "/" },
  { label: "About Us", ariaLabel: "Learn about us", link: "/aboutus" },
  {
    label: "Journal",
    ariaLabel: "View our journal",
    link: "/journal",
  },
  { label: "Text Books", ariaLabel: "Explore our text books", link: "/textbooks" },
  { label: "Gallery", ariaLabel: "View our photo gallery", link: "/gallery" },
  // { label: "Articles", ariaLabel: "Browse our articles", link: "/Articles" },
  // {
  //   label: "Join Editorial Board",
  //   ariaLabel: "Apply to join the editorial board",
  //   link: "/",
  // },
  { label: "Contact", ariaLabel: "Get in touch with us", link: "/contact" },
  //  {label:"Editorial Login " ,
  //   ariaLabel:"editorial Login ",
  //   link:"/EditoralLogins"},
  { label: "Login / Sign up", ariaLabel: "Access your account or sign up", link: "/signup" },
 
];

export default function NavigationPage({ showLogoName = false, logoName = "" }: { showLogoName?: boolean; logoName?: string }) {
  //  Track which section is currently visible
  const [activeSection, setActiveSection] = useState<string>("hero");

  //  Smooth scroll on nav click
  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  //  Track visible sections via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0)
          );

        if (visible.length > 0) {
          const id = visible[0].target.id;
          if (SECTION_IDS.includes(id)) {
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
  }, []);

  return (
    <main>
      <StaggeredMenu
        position="right"
        items={menuItems}
        displayItemNumbering={false}
        menuButtonColor="#000"
        openMenuButtonColor="#000"
        changeMenuColorOnOpen={true}
        logoUrl="/Logo.png"
        accentColor="#ff6b6b"
        isFixed={false}
        showLogoName={true}
        logoName="Lurnexa"
      />
     
    </main>
  );
}