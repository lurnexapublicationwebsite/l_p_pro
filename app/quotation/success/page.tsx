"use client";

import { useEffect } from "react";

export default function QuotationSuccessPage() {
  // Prevent back button navigation after submission
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.go(1);
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] pt-[50px] font-sans antialiased text-[#111827]">
      <div className="mx-auto max-w-[700px] px-4">
        <div className="rounded-[12px] bg-white p-[30px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] border-t-[8px] border-t-[#4f46e5]">
          <h1 className="text-[32px] font-bold tracking-tight text-[#111827] mb-3 leading-tight">
            Book Quotation Request
          </h1>
          <p className="text-[16px] text-[#202124] mt-3 leading-relaxed">
            Your response has been recorded.
          </p>
          <p className="text-[15px] text-[#4b5563] mt-2 leading-relaxed">
            The admin will review your quotation request shortly.
          </p>
        </div>
      </div>
    </div>
  );
}
