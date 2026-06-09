"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  quotation_id: string;
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

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.quotation_id.toLowerCase().includes(query) ||
      order.institution_name.toLowerCase().includes(query) ||
      order.authorized_person.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query)
    );
  });

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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[#6b7280]">
                    No confirmed orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold align-middle text-[#111827]">
                      {order.quotation_id}
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
                    <td className="px-6 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
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
    </div>
  );
}
