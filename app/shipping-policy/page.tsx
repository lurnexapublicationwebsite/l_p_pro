"use client";

import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";

export default function ShippingPolicyPage() {
  return (
    <>
      <NavigationPage />
      <main className="bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-10 text-slate-900">
            Shipping Policy
          </h1>
          <div className="space-y-6 text-slate-700 leading-8">
            <p>
              This policy outlines the shipping and delivery terms for physical products (such as textbooks or printed journals) ordered from LURNEXA PUBLICATIONS PRIVATE LIMITED.
            </p>
            <ul className="list-disc ml-6 space-y-4">
              <li>Orders are shipped through registered courier services, India Post, and authorized logistics partners.</li>
              <li>Dispatch is usually completed within three to seven working days after payment confirmation.</li>
              <li>Delivery timelines depend on the destination, courier policies, and regional accessibility.</li>
              <li>The company is not responsible for delays caused by natural disasters, strikes, regulatory actions, or courier issues.</li>
              <li>Buyers must provide accurate and complete address details. Incorrect information may result in delivery failure and additional charges for re-shipping.</li>
              <li>Shipping charges are calculated and displayed at checkout and are non-refundable.</li>
              <li>Force majeure events may result in unavoidable delays.</li>
            </ul>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
