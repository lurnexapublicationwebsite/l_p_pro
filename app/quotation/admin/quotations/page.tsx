"use client";

import { useEffect, useState } from "react";

interface Quotation {
  id: string;
  quotation_number: string;
  institution_name: string;
  authorized_person: string;
  email: string;
  contact_number: string;
  total_amount: string;
  sent_date: string;
  is_confirmed: boolean;
}

export default function GeneratedQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Generated Quotations - Book Quotation System";
    fetchQuotations();
  }, []);

  async function fetchQuotations() {
    try {
      setLoading(true);
      const res = await fetch("/api/quotation/admin/quotations");
      if (!res.ok) throw new Error("Failed to fetch quotations");
      const data = await res.json();
      setQuotations(data.quotations || []);
    } catch (err: any) {
      setError(err.message || "Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-[#6b7280] text-sm">Loading generated quotations...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }

  return (
    <div className="max-w-[1000px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#111827] leading-tight">
          Generated Quotations
        </h1>
      </div>

      {/* Quotations Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#374151] font-semibold">
              <tr>
                <th className="px-6 py-4">Quotation No</th>
                <th className="px-6 py-4">Institution / Client</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Sent Date</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] text-[#111827]">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6b7280]">
                    No quotations generated yet.
                  </td>
                </tr>
              ) : (
                quotations.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold align-middle text-[#4f46e5]">
                      {quote.quotation_number}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="font-semibold">{quote.institution_name}</div>
                      <div className="text-xs text-[#6b7280] mt-0.5">{quote.authorized_person} ({quote.email})</div>
                    </td>
                    <td className="px-6 py-4 align-middle font-semibold">
                      ₹{parseFloat(quote.total_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 align-middle text-[#4b5563]">
                      {new Date(quote.sent_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        {quote.is_confirmed ? (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Confirmed
                            </span>
                            {(quote as any).client_stamp && (
                              <a
                                href={(quote as any).client_stamp}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-white border border-[#e5e7eb] hover:bg-gray-50 text-[#374151] font-semibold px-2.5 py-1 rounded-lg text-xs transition"
                                title="View Stamp"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <rect width="18" height="18" x="3" y="3" rx="2" />
                                  <circle cx="9" cy="9" r="2" />
                                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                </svg>
                                <span>Stamp</span>
                              </a>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Sent
                            </span>
                            <a
                              href={`/quotation/admin/quotations/edit/${quote.id}`}
                              className="inline-flex items-center gap-1 bg-white border border-[#e5e7eb] hover:bg-[#e0e7ff] hover:text-[#4f46e5] text-[#374151] font-semibold px-2.5 py-1 rounded-lg text-xs transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                              </svg>
                              <span>Edit</span>
                            </a>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
