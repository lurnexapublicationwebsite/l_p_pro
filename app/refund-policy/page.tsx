"use client";

import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";

export default function RefundPolicyPage() {
  return (
    <>
      <NavigationPage />
      <main className="bg-white pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-10 text-slate-900">
            Refund & Cancellation Policy
          </h1>
          <div className="space-y-6 text-slate-700 leading-8">
            <p>
              This policy governs the cancellation and refund of products and services purchased through LURNEXA PUBLICATIONS PRIVATE LIMITED.
            </p>
            <ul className="list-disc ml-6 space-y-4">
              <li>Cancellation requests are accepted within twenty-four hours of order placement. Once dispatched or customized, cancellation is not permitted.</li>
              <li>Digital products, subscriptions, and customized publications are non-refundable except in cases of verified technical failures.</li>
              <li>Damaged, defective, or misprinted items must be reported within forty-eight hours of delivery with supporting evidence (e.g., photos).</li>
              <li>After verification, replacement or refund may be approved at the company’s discretion.</li>
              <li>Approved refunds are processed within five to seven working days and credited back to the original payment method.</li>
              <li>False or repeated claims may result in account restrictions or suspension.</li>
              <li>Under any circumstances, there will be no refund for article submission/processing fees once an article has been reviewed or rejected.</li>
            </ul>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
