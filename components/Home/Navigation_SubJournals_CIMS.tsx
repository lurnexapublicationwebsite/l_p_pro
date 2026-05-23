"use client";
import { useEffect, useState } from "react";
import StaggeredNewMenu from "../StaggeredNewMenu";

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
  { label: "CIMS Editorial Board", ariaLabel: "Board Members", link: "/EditorialBoard/CIMS" },
  { 
    label: 'Policies', 
    link: '#', 
    subItems: [
      { label: 'Peer Review Policy', link: '/peer-review-policy' },
      { label: 'Plagarism Policy', link: '/plagiarism-policy' },
      { label: 'Publications Ethics Policy', link: '/publications-ethics-policy' },
      { label: 'Copyright & Licensing Policy', link: '/copyright-licensing-policy' },
    ] 
  },
  { 
    label: 'For Authors', 
    link: '#', 
    subItems: [
      { label: 'Author Guidelines', link: '/author-guidelines' },
      { label: 'Article Processing Charges(APC)', link: '/article-processing-charges' },
      /* UPDATED: This path must match exactly the file in your /public folder.
         We use the 'download' attribute logic inside the component if possible, 
         but here we ensure the link is a direct file path.
      */
      { 
        label: 'Submission Guidelines', 
        link: '/submission_guidelines.pdf', 
        isDownload: true 
      },
    ] 
  },
  { 
    label: 'Editorial Policies', 
    link: '#', 
    subItems: [
      { label: 'Conflict of Interest Policy', link: '/conflict-of-interest-policy' },
      { label: 'Retraction Policy', link: '/retraction-policy' },
      { label: 'Archiving Policy', link: '/archiving-policy' },
    ] 
  },
  // {label:"Archives" ,ariaLabel:"Archives" , link:"/Archive",},
  {label:"Editorial Login " ,ariaLabel:"editorial Login " , link:"/EditoralLogins"},
  // {label:"Sub Division Journals" ,ariaLabel:"Sub Division Journals" , link:"/journal/explore",},
  // { label: "Login / Sign up", ariaLabel: "Access your account or sign up", link: "/signup" },
];

export default function NavigationPage({ showLogoName = false, logoName = "" }: { showLogoName?: boolean; logoName?: string }) {
  const [activeSection, setActiveSection] = useState<string>("hero");

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
      <StaggeredNewMenu
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