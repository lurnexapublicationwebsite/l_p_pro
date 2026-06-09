"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Quotation {
  id: string;
  quotation_number: string;
  total_amount: string;
  is_confirmed: boolean;
}

interface QuotationRequest {
  institution_name: string;
  authorized_person: string;
  email: string;
}

export default function ConfirmQuotationPage() {
  const params = useParams();
  const quoteId = params?.id as string;

  const [quote, setQuote] = useState<Quotation | null>(null);
  const [reqDetails, setReqDetails] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    document.title = "Confirm Your Quotation - Book Quotation System";
    
    async function fetchDetails() {
      if (!quoteId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/quotation/confirm?quote_id=${quoteId}`);
        if (!res.ok) throw new Error("Failed to load quotation details");
        const data = await res.json();
        
        setQuote(data.quotation);
        setReqDetails(data.request);
        if (data.quotation.is_confirmed) {
          setConfirmed(true);
        }
      } catch (err: any) {
        setError(err.message || "Quotation not found.");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [quoteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your official stamp or signature image.");
      return;
    }

    setConfirming(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("quote_id", quoteId);
      formData.append("stamp", file);

      const res = await fetch("/api/quotation/confirm", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm quotation");
      }

      setConfirmed(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="text-sm font-semibold text-[#6b7280]">Loading quotation details...</div>
      </div>
    );
  }

  if (error || !quote || !reqDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
        <div className="bg-white rounded-2xl border border-red-200 p-8 max-w-[480px] w-full text-center shadow-lg">
          <div className="text-red-500 mb-4 inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Quotation</h2>
          <p className="text-sm text-gray-600 mb-0">{error || "The quotation could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] pt-12 pb-16 font-sans antialiased text-[#111827]">
      <div className="max-w-[650px] mx-auto px-4">
        <div className="bg-white rounded-2xl border border-t-[8px] border-t-[#4f46e5] border-[#e5e7eb] shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8 border-b border-[#f1f3f4] pb-6">
              <h1 className="text-2xl font-extrabold text-[#111827] mb-1">Confirm Your Quotation</h1>
              <p className="text-sm text-gray-500 font-medium">Quote Reference: {quote.quotation_number}</p>
            </div>

            {confirmed ? (
              <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="text-green-500 mb-4 inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Quotation Confirmed!</h2>
                <p className="text-sm text-gray-600 max-w-[420px] mx-auto leading-relaxed">
                  Thank you! Your quotation has been successfully confirmed and signed. The official signed Confirmed Quotation document has been emailed to <strong>{reqDetails.email}</strong>.
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm space-y-3 mb-8 bg-[#f8fafc] border border-[#e2e8f0] p-6 rounded-xl">
                  <p className="flex"><span className="text-[#6b7280] w-32 shrink-0">Authorized Person:</span> <strong className="text-[#111827]">{reqDetails.authorized_person}</strong></p>
                  <p className="flex"><span className="text-[#6b7280] w-32 shrink-0">Institution:</span> <strong className="text-[#111827]">{reqDetails.institution_name}</strong></p>
                  <p className="flex"><span className="text-[#6b7280] w-32 shrink-0">Quote Number:</span> <span className="font-mono text-[#4F46E5] font-semibold">{quote.quotation_number}</span></p>
                  <p className="flex"><span className="text-[#6b7280] w-32 shrink-0">Total Amount:</span> <strong className="text-[#10B981]">Rs. {parseFloat(quote.total_amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-[#374151] mb-2">
                      Upload Official Stamp / Signature (Image)
                    </label>
                    <input
                      type="file"
                      required
                      accept="image/*"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="w-full bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#4f46e5] transition file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#e0e7ff] file:text-[#4f46e5] hover:file:bg-[#c7d2fe]"
                    />
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      Please upload a clear image (PNG, JPG) of your institution&apos;s official stamp or authorized signature to confirm the order.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={confirming}
                    className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold rounded-lg py-3 text-sm transition shadow-md disabled:bg-opacity-50 flex items-center justify-center gap-2"
                  >
                    {confirming ? "Confirming..." : "Confirm Quotation"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
