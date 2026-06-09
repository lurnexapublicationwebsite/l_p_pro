"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface RequestItem {
  book_name: string;
  quantity: number;
}

interface QuotationRequest {
  id: string;
  institution_name: string;
  authorized_person: string;
  contact_number: string;
  email: string;
  created_at: string;
  items: RequestItem[];
}

interface PriceItem {
  book_name: string;
  quantity: number;
  unit_price: string;
}

export default function ReviewQuotationPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params?.id as string;

  const [req, setReq] = useState<QuotationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Generate Quotation - Book Quotation System";
    
    async function fetchRequestDetails() {
      if (!requestId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/quotation/admin/requests?id=${requestId}`);
        if (!res.ok) throw new Error("Failed to load request details");
        const data = await res.json();
        
        setReq(data.request);
        
        // Initialize price input state
        const initialPriceItems = (data.request.items || []).map((item: RequestItem) => ({
          book_name: item.book_name,
          quantity: item.quantity,
          unit_price: "",
        }));
        setPriceItems(initialPriceItems);
      } catch (err: any) {
        setError(err.message || "Failed to load quotation request details.");
      } finally {
        setLoading(false);
      }
    }

    fetchRequestDetails();
  }, [requestId]);

  const handlePriceChange = (index: number, val: string) => {
    // Only allow decimal numbers
    const cleanVal = val.replace(/[^0-9.]/g, "");
    setPriceItems(
      priceItems.map((item, idx) => (idx === index ? { ...item, unit_price: cleanVal } : item))
    );
  };

  const getGrandTotal = () => {
    return priceItems.reduce((acc, item) => {
      const qty = item.quantity || 0;
      const price = parseFloat(item.unit_price) || 0;
      return acc + qty * price;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all prices are filled and greater than 0
    const invalid = priceItems.some((item) => !item.unit_price || parseFloat(item.unit_price) <= 0);
    if (invalid) {
      alert("Please enter a valid price greater than ₹0.00 for all items.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quotation/admin/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          items: priceItems,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit quotation");
      }

      router.push("/quotation/admin/quotations");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-[#6b7280] text-sm">Loading request details...</div>;
  }

  if (error || !req) {
    return <div className="text-red-600 text-sm">Error: {error || "Quotation request not found."}</div>;
  }

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="bg-white rounded-xl border border-t-[6px] border-t-[#4f46e5] border-[#e5e7eb] shadow-md overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#e5e7eb] flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-950">Generate Quotation</h2>
          <span className="bg-[#e0e7ff] text-[#4f46e5] text-xs font-semibold px-3 py-1 rounded-full font-mono">
            Ref: {req.id.substring(0, 8)}
          </span>
        </div>

        {/* Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <h6 className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-3">Client Details</h6>
              <div className="text-sm space-y-2 text-[#374151]">
                <p className="flex"><span className="text-[#6b7280] w-24 shrink-0">Institution:</span> <strong>{req.institution_name}</strong></p>
                <p className="flex"><span className="text-[#6b7280] w-24 shrink-0">Name:</span> <span>{req.authorized_person}</span></p>
                <p className="flex"><span className="text-[#6b7280] w-24 shrink-0">Phone:</span> <span>{req.contact_number}</span></p>
                <p className="flex"><span className="text-[#6b7280] w-24 shrink-0">Email:</span> <a href={`mailto:${req.email}`} className="text-[#4f46e5] hover:underline">{req.email}</a></p>
              </div>
            </div>
            <div className="md:text-right">
              <h6 className="text-[11px] font-bold text-[#6b7280] uppercase tracking-wider mb-3">Request Date</h6>
              <p className="text-sm font-semibold text-[#374151]">
                {new Date(req.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <hr className="border-t border-[#e5e7eb] my-6" />

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-[#e5e7eb] text-sm rounded-lg overflow-hidden">
                <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] font-semibold text-[#374151]">
                  <tr>
                    <th className="px-4 py-3" style={{ width: "5%" }}>Sl.No</th>
                    <th className="px-4 py-3" style={{ width: "45%" }}>Book Name</th>
                    <th className="px-4 py-3 text-center" style={{ width: "15%" }}>No. of Copies</th>
                    <th className="px-4 py-3" style={{ width: "18%" }}>Unit Price (₹)</th>
                    <th className="px-4 py-3 text-right" style={{ width: "17%" }}>Total Price (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] text-[#111827]">
                  {priceItems.map((item, index) => {
                    const qty = item.quantity || 0;
                    const price = parseFloat(item.unit_price) || 0;
                    const rowTotal = qty * price;

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4.5 align-middle">{index + 1}</td>
                        <td className="px-4 py-4.5 align-middle font-medium">{item.book_name}</td>
                        <td className="px-4 py-4.5 align-middle text-center">{qty}</td>
                        <td className="px-4 py-4.5 align-middle">
                          <div className="relative rounded-lg border border-[#d1d5db] overflow-hidden focus-within:border-[#4f46e5] focus-within:ring-1 focus-within:ring-[#4f46e5] max-w-[130px]">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                            <input
                              type="text"
                              required
                              value={item.unit_price}
                              onChange={(e) => handlePriceChange(index, e.target.value)}
                              placeholder="0.00"
                              className="w-full bg-transparent pl-7 pr-3 py-1.5 text-sm outline-none"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4.5 align-middle text-right font-bold text-gray-900">
                          ₹{rowTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-[#f9fafb] font-bold text-[#111827]">
                  <tr className="border-t border-[#e5e7eb]">
                    <td colSpan={4} className="px-4 py-4.5 text-right font-bold">Grand Total:</td>
                    <td className="px-4 py-4.5 text-right text-lg text-[#4f46e5]">
                      ₹{getGrandTotal().toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-[#e5e7eb] pt-5">
              <Link
                href="/quotation/admin/requests"
                className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
              >
                Back to Dashboard
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#10b981] hover:bg-[#059669] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition shadow-sm flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="22" x2="11" y1="2" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send Quotation to Client
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
