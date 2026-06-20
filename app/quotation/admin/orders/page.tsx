"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  quotation_id: string;
  quotation_number: string;
  institution_name: string;
  authorized_person: string;
  email: string;
  contact_number: string;
  stamp_file_path: string;
  total_amount: string;
  order_date: string;
  status: string;
}

export default function ConfirmedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleDelete, setVisibleDelete] = useState<{ [key: string]: boolean }>({});
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    document.title = "Confirmed Orders - Book Quotation System";
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch("/api/quotation/admin/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      setDeleting(true);
      const res = await fetch("/api/quotation/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete order");
      }
      setDeleteTarget(null);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Failed to delete order.");
    } finally {
      setDeleting(false);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      (order.quotation_number || "").toLowerCase().includes(query) ||
      order.institution_name.toLowerCase().includes(query) ||
      order.authorized_person.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredOrders.length);
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  if (loading) {
    return <div className="text-[#6b7280] text-sm">Loading confirmed orders...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }

  return (
    <div className="max-w-[1000px]">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#111827] leading-tight">
          Confirmed Orders
        </h1>
        <div className="flex gap-2 max-w-[320px] w-full">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow bg-white border border-[#e5e7eb] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="bg-white border border-[#e5e7eb] text-[#374151] hover:bg-gray-50 font-semibold px-3 py-2 rounded-lg text-sm transition"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Card */}
      <div className="bg-white rounded-xl border border-[#e5e7eb] overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#374151] font-semibold">
              <tr>
                <th className="px-6 py-4">Order No</th>
                <th className="px-6 py-4">Institution / Client</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Document</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] text-[#111827]">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#6b7280]">
                    No confirmed orders found.
                  </td>
                </tr>
              ) : (
                currentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 transition-colors select-none cursor-pointer"
                    title="Triple click to reveal delete option"
                    onClick={(e) => {
                      if (e.detail === 3) {
                        setVisibleDelete((prev) => ({ ...prev, [order.id]: true }));
                      }
                    }}
                  >
                    <td className="px-6 py-4 font-bold align-middle text-[#111827]">
                      {order.quotation_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="font-semibold">{order.institution_name}</div>
                      <div className="text-xs text-[#6b7280] mt-0.5">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 align-middle text-[#4b5563]">
                      {new Date(order.order_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 align-middle font-semibold">
                      ₹{parseFloat(order.total_amount).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        {visibleDelete[order.id] && (
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="bg-red-600 text-white hover:bg-red-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                            <span>Delete</span>
                          </button>
                        )}

                        <a
                          href={`/api/quotation/admin/orders?order_id=${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span>View PDF</span>
                        </a>

                        {order.stamp_file_path && (
                          <a
                            href={order.stamp_file_path}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold px-3 py-1.5 rounded-lg text-xs transition inline-flex items-center gap-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <rect width="18" height="18" x="3" y="3" rx="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <span>Stamp</span>
                          </a>
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
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-white border border-[#e5e7eb] rounded-xl p-4 shadow-sm">
          <div className="text-sm text-[#4b5563] font-medium">
            Showing <span className="font-semibold text-[#111827]">{filteredOrders.length === 0 ? 0 : startIndex + 1}</span> to{" "}
            <span className="font-semibold text-[#111827]">
              {endIndex}
            </span>{" "}
            of <span className="font-semibold text-[#111827]">{filteredOrders.length}</span> entries
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
              Are you sure you want to permanently delete the confirmed order for{" "}
              <strong>{deleteTarget.institution_name}</strong>? This action cannot be undone and will revert the quotation's status to unconfirmed.
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
