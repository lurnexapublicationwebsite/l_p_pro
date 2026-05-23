"use client";

import { useEffect, useRef, useState } from "react";

interface FirstPagePreviewProps {
  pdfUrl: string;
}

export default function FirstPagePreview({ pdfUrl }: FirstPagePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive: track container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Load pdfjs from CDN (avoids webpack bundling completely)
        const pdfjsLib = await loadPdfjs();
        if (cancelled) return;

        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Scale to fit container width with high DPI
        const unscaledViewport = page.getViewport({ scale: 1 });
        const desiredWidth = Math.min(containerWidth, 900);
        const scale = (desiredWidth / unscaledViewport.width) * (window.devicePixelRatio || 1);
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1)}px`;
        canvas.style.height = `${viewport.height / (window.devicePixelRatio || 1)}px`;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!cancelled) setStatus("ready");
      } catch (err) {
        console.error("PDF preview error:", err);
        if (!cancelled) setStatus("error");
      }
    }

    if (pdfUrl) {
      setStatus("loading");
      render();
    }

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, containerWidth]);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading first page preview…</p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={`shadow-2xl border border-slate-200 rounded-lg bg-white max-w-full transition-opacity duration-500 ${
          status === "ready" ? "opacity-100" : "opacity-0 absolute"
        }`}
      />

      {status === "error" && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <p className="text-red-400 font-semibold">Preview not available</p>
          <p className="text-slate-400 text-sm">Please use the download button below to access the full manuscript.</p>
        </div>
      )}
    </div>
  );
}

// ─── CDN Loader (runs once, cached globally) ────────────────────────────
let pdfjsPromise: Promise<any> | null = null;

function loadPdfjs(): Promise<any> {
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    // If already loaded
    if ((window as any).pdfjsLib) {
      return resolve((window as any).pdfjsLib);
    }

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib) {
        lib.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(lib);
      } else {
        reject(new Error("pdfjsLib not found after script load"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load pdf.js from CDN"));
    document.head.appendChild(script);
  });

  return pdfjsPromise;
}
