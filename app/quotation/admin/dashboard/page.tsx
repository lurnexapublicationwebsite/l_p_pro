"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  total_books: number;
  pending_quotations: number;
  sent_quotations: number;
  confirmed_orders: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/quotation/admin/dashboard?t=${Date.now()}`, {
          cache: "no-store",
        });
        if (res.status === 401) {
          return; // Let parent layout handle redirect
        }
        if (!res.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-[#6b7280] text-sm">Loading stats...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-sm">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight text-[#111827] mb-8 leading-tight">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Books Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-1">Total Books</p>
              <h3 className="text-3xl font-extrabold text-[#111827]">{stats?.total_books || 0}</h3>
            </div>
            <div className="p-3 bg-[#e0e7ff] text-[#4f46e5] rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              </svg>
            </div>
          </div>
          <Link href="/quotation/admin/books" className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1">
            <span>Manage books</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Requests Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-1">Pending Requests</p>
              <h3 className="text-3xl font-extrabold text-[#111827]">{stats?.pending_quotations || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
              </svg>
            </div>
          </div>
          <Link href="/quotation/admin/requests" className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1">
            <span>View requests</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Sent Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-1">Sent Quotations</p>
              <h3 className="text-3xl font-extrabold text-[#111827]">{stats?.sent_quotations || 0}</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          <Link href="/quotation/admin/quotations" className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1">
            <span>View sent</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Confirmed Orders Card */}
        <div className="bg-white rounded-xl border border-[#e5e7eb] p-6 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-1">Confirmed Orders</p>
              <h3 className="text-3xl font-extrabold text-[#111827]">{stats?.confirmed_orders || 0}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <Link href="/quotation/admin/orders" className="text-sm font-semibold text-[#4f46e5] hover:text-[#4338ca] flex items-center gap-1">
            <span>View orders</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
