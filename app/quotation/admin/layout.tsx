"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // Check if we are on the login, verification or password reset pages
  const isBypassPage = 
    pathname?.includes("/admin/login") || 
    pathname?.includes("/admin/forgot-password") || 
    pathname?.includes("/admin/reset-password");

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);

    if (isBypassPage) {
      setLoading(false);
      return () => {
        window.removeEventListener("pageshow", handlePageShow);
      };
    }

    async function checkAuth() {
      try {
        const res = await fetch("/api/quotation/admin/dashboard");
        if (!res.ok) {
          router.push("/quotation/admin/login");
        } else {
          setAuthenticated(true);
        }
      } catch (err) {
        router.push("/quotation/admin/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [pathname, router, isBypassPage]);

  const handleLogout = async () => {
    try {
      await fetch("/api/quotation/admin/settings", {
        method: "DELETE", // We can use DELETE or POST/GET to clear token, let's check settings/auth endpoints later
      });
    } catch (err) {}
    // Clear cookies client-side or let backend handle it.
    document.cookie = "quotation_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/quotation/admin/login");
  };

  if (isBypassPage) {
    return <>{children}</>;
  }

  if (loading || !authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="text-sm font-semibold text-[#6b7280]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans antialiased text-[#111827]">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 w-[260px] h-screen bg-white border-r border-[#e5e7eb] p-6 flex flex-col z-30 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
        <Link href="/quotation/admin/dashboard" className="text-xl font-extrabold text-[#4f46e5] mb-8 px-3 flex items-center gap-2 hover:text-[#4338ca] transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span>BookQuotations</span>
        </Link>

        <nav className="flex flex-col gap-1 flex-grow">
          <Link
            href="/quotation/admin/dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
              pathname === "/quotation/admin/dashboard"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : "text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/quotation/admin/books"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
              pathname === "/quotation/admin/books"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : "text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
            <span>Books Management</span>
          </Link>

          <Link
            href="/quotation/admin/requests"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
              pathname === "/quotation/admin/requests"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : "text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            <span>Quotation Requests</span>
          </Link>

          <Link
            href="/quotation/admin/quotations"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
              pathname === "/quotation/admin/quotations"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : "text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <line x1="10" x2="8" y1="9" y2="9" />
            </svg>
            <span>Generated Quotations</span>
          </Link>

          <Link
            href="/quotation/admin/orders"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
              pathname === "/quotation/admin/orders"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : "text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Confirmed Orders</span>
          </Link>

          <Link
            href="/quotation/admin/settings"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm transition ${
              pathname === "/quotation/admin/settings"
                ? "bg-[#e0e7ff] text-[#4f46e5]"
                : "text-[#6b7280] hover:bg-gray-50 hover:text-[#111827]"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </Link>
        </nav>

        <div className="mt-auto pt-4 border-t border-[#e5e7eb]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm text-red-600 hover:bg-red-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" x2="9" y1="12" y2="12" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-[260px] p-12 min-h-screen">{children}</main>
    </div>
  );
}
