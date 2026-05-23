import { Suspense } from "react";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import TextbooksClient from "@/components/Textbooks/TextbooksClient";

export default function TextbooksPage() {
  return (
    <>
      <NavigationPage />

      <div className="mt-20 max-w-7xl mx-auto px-6 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <TextbooksClient />
        </Suspense>
      </div>

      <FooterSection />
    </>
  );
}
