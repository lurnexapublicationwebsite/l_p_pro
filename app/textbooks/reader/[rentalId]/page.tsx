"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Clock, 
  RefreshCw, 
  Lock, 
  AlertTriangle, 
  Moon, 
  Sun, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  BookOpen,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import RentalTimer from "@/components/Textbooks/RentalTimer";

interface ReaderPageProps {
  params: Promise<{ rentalId: string }>;
}

export default function SecureReaderPage({ params }: ReaderPageProps) {
  const resolvedParams = use(params);
  const rentalId = resolvedParams.rentalId;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const [rentalData, setRentalData] = useState<any>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [watermarkText, setWatermarkText] = useState<string>("");

  // Reader Controls State
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Disable right-click & print shortcut
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
        e.preventDefault();
        alert("Downloading and printing is disabled for rented eBooks.");
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!rentalId) return;

    const savedEmail = localStorage.getItem("lurnexa_reader_email") || 
                       localStorage.getItem("lurnexa_user_email") || 
                       localStorage.getItem("user_email");

    if (!savedEmail) {
      setError("Please log in to your library to access this book.");
      setLoading(false);
      return;
    }

    validateAndLoadReader(savedEmail);
  }, [rentalId]);

  const validateAndLoadReader = async (userEmail: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rentals/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalId, userEmail })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isExpired) {
          setIsExpired(true);
        }
        setError(data.error || "Access denied to this rental.");
        return;
      }

      setRentalData(data.rental);
      setPdfUrl(data.pdfUrl);
      setWatermarkText(data.watermarkText);

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
          Validating Rental Session & Loading Secure eBook...
        </p>
      </div>
    );
  }

  if (error || isExpired) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-800 rounded-3xl p-8 border border-slate-700 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {error}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/textbooks/library"
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-all"
            >
              Back to My Library
            </Link>
            <Link
              href="/textbooks/store"
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all"
            >
              Rent or Buy Book
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-slate-100'} select-none`}>
      
      {/* CSS Rule to hide reader when user tries to print */}
      <style jsx global>{`
        @media print {
          body { display: none !important; }
        }
      `}</style>

      {/* Top Reader Navigation Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between z-20 shrink-0">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-4">
          <Link
            href="/textbooks/library"
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Library</span>
          </Link>
          
          <div className="h-4 w-[1px] bg-slate-800 hidden sm:block" />

          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white line-clamp-1 max-w-xs sm:max-w-md">
              {rentalData?.bookTitle}
            </h1>
            <p className="text-[10px] text-slate-400 line-clamp-1">
              By {rentalData?.bookAuthors}
            </p>
          </div>
        </div>

        {/* Center: Timer */}
        {rentalData?.expiresAt && (
          <div className="hidden lg:block">
            <RentalTimer expiresAt={rentalData.expiresAt} compact />
          </div>
        )}

        {/* Right: Zoom & Theme Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-mono font-bold px-2 text-slate-300">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-all"
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>
          </div>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl border border-slate-700 transition-all"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        </div>

      </header>

      {/* Main Content Area — PDF Viewer with Watermark Overlay */}
      <main className="flex-1 relative overflow-hidden bg-slate-900 flex items-center justify-center p-2 sm:p-6">
        
        {/* Semi-transparent Diagonal Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center overflow-hidden opacity-15">
          <div className="rotate-[-30deg] text-slate-300 font-mono font-bold text-sm sm:text-xl text-center leading-loose whitespace-nowrap select-none">
            {watermarkText}<br/>
            {watermarkText}<br/>
            {watermarkText}
          </div>
        </div>

        {/* PDF Frame */}
        <div 
          className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden relative z-0 border border-slate-800"
          style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top' }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full border-none"
            title={rentalData?.bookTitle || "eBook Reader"}
          />
        </div>

      </main>

    </div>
  );
}
