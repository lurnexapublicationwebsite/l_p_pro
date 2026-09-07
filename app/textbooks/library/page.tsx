"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyLibraryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/textbooks/portal/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
        Redirecting to Access Portal Login...
      </p>
    </div>
  );
}
