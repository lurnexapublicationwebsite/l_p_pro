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
  const [visibleDelete, setVisibleDelete] = useState<{ [key: string]: boolean }>({});
  const [deleteTarget, setDeleteTarget] = useState<Quotation | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(quotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, quotations.length);
  const currentQuotations = quotations.slice(startIndex, endIndex);

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

  async function handleDelete(id: string) {
    try {
      setDeleting(true);
      const res = await fetch("/api/quotation/admin/quotations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete quotation");
      }
      setDeleteTarget(null);
      fetchQuotations();
    } catch (err: any) {
      alert(err.message || "Failed to delete quotation.");
    } finally {
      setDeleting(false);
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
              {currentQuotations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#6b7280]">
                    No quotations generated yet.
                  </td>
                </tr>
              ) : (
                currentQuotations.map((quote) => (
                  <tr 
                    key={quote.id} 
                    className="hover:bg-gray-50 transition-colors select-none cursor-pointer"
                    title="Triple click to reveal delete option"
                    onClick={(e) => {
                      if (e.detail === 3) {
                        setVisibleDelete((prev) => ({ ...prev, [quote.id]: true }));
                      }
                    }}
                  >
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
                    <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2.5">
                        {visibleDelete[quote.id] && (
                          <button
                            onClick={() => setDeleteTarget(quote)}
                            className="bg-red-600 text-white hover:bg-red-700 font-semibold px-2.5 py-1 rounded-lg text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        )}

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

      {/* Pagination Controls */}
      {quotations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#4b5563] font-medium">
            Showing <span className="font-semibold text-[#111827]">{quotations.length === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold text-[#111827]">
              {endIndex}
            </span>{" "}
            of <span className="font-semibold text-[#111827]">{quotations.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm font-semibold text-[#374151] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Previous</span>
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 border border-[#e5e7eb] rounded-lg text-sm font-semibold text-[#374151] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-red-100 max-w-[440px] w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" x2="12" y1="9" y2="13" />
                <line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              Confirm Deletion
            </h3>
            <p className="text-sm text-[#4b5563] leading-relaxed mb-6">
              Are you sure you want to permanently delete the quotation <strong>{deleteTarget.quotation_number}</strong> for <strong>{deleteTarget.institution_name}</strong>? This will also delete any associated order and revert the original request status to pending.
            </p>
            <div className="flex justify-end gap-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={() => handleDelete(deleteTarget.id)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition cursor-pointer"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
