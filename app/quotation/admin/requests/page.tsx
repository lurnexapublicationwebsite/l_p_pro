"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RequestItem {
  id: string;
  institution_name: string;
  authorized_person: string;
  contact_number: string;
  email: string;
  created_at: string;
  status: string;
}

export default function PendingRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clientLink, setClientLink] = useState("");

  // Deletion state
  const [deleteTarget, setDeleteTarget] = useState<RequestItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, requests.length);
  const currentRequests = requests.slice(startIndex, endIndex);

  useEffect(() => {
    document.title = "Pending Quotation Requests - Book Quotation System";
    
    // Set client request link using current hostname
    if (typeof window !== "undefined") {
      setClientLink(`${window.location.origin}/quotation/`);
    }

    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);
      const res = await fetch("/api/quotation/admin/requests");
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(clientLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/quotation/admin/requests", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget.id }),
      });

      if (!res.ok) throw new Error("Failed to delete request");
      
      setRequests(requests.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || "Could not delete request.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="text-[#6b7280] text-sm">Loading pending requests...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }

  return (
    <div className="max-w-[1000px]">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#111827] leading-tight">
          Pending Quotation Requests
        </h1>
      </div>

      {/* Share Link Card */}
      <div className="bg-white rounded-xl border border-t-4 border-[#4f46e5] border-[#e5e7eb] p-6 shadow-md mb-6">
        <h5 className="text-[16px] font-bold text-[#4f46e5] mb-2 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          Permanent Client Request Link
        </h5>
        <p className="text-sm text-[#6b7280] mb-4">
          Share this permanent link everywhere for clients to submit a new quotation request.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={clientLink}
            className="flex-grow bg-[#f9fafb] border border-[#e5e7eb] rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#374151] font-semibold">
              <tr>
                <th className="px-6 py-4">Institution</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] text-[#111827]">
              {currentRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-[#6b7280]">
                    No pending requests found.
                  </td>
                </tr>
              ) : (
                currentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold align-middle">{req.institution_name}</td>
                    <td className="px-6 py-4 align-middle">
                      <div>{req.authorized_person}</div>
                      <div className="text-xs text-[#6b7280] mt-1 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          {req.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          {req.contact_number}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-[#4b5563]">
                      {new Date(req.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 align-middle text-right">
                      <Link
                        href={`/quotation/admin/review/${req.id}`}
                        className="bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold px-4 py-2 rounded-lg text-xs transition inline-block mr-2"
                      >
                        Review Request
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(req)}
                        className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-lg text-xs transition inline-block"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {requests.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#4b5563] font-medium">
            Showing <span className="font-semibold text-[#111827]">{requests.length === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold text-[#111827]">
              {endIndex}
            </span>{" "}
            of <span className="font-semibold text-[#111827]">{requests.length}</span> entries
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
              Are you sure you want to permanently delete the pending quotation request for{" "}
              <strong>{deleteTarget.institution_name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-4 py-2 rounded-lg text-sm transition"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
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
