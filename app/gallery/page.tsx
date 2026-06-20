"use client";

import { useEffect, useState } from "react";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";

interface GalleryData {
  folders: Record<string, string[]>;
}

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryData>({ folders: {} });
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [flattenedImages, setFlattenedImages] = useState<{ url: string; category: string }[]>([]);

  // Fetch gallery list
  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) throw new Error("Failed to fetch gallery");
        const data: GalleryData = await res.json();
        setGallery(data);

        // Pre-flatten images for easy navigation in lightbox
        const flat: { url: string; category: string }[] = [];
        Object.entries(data.folders).forEach(([folderName, images]) => {
          images.forEach((img) => {
            flat.push({ url: img, category: folderName });
          });
        });
        setFlattenedImages(flat);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Filtered images for display
  const displayImages = flattenedImages.filter((img) => {
    if (activeFolder === "all") return true;
    return img.category === activeFolder;
  });

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex === null) return;
    const currentUrl = displayImages[lightboxIndex].url;
    // Find index in displayImages
    const newIdx = (lightboxIndex - 1 + displayImages.length) % displayImages.length;
    setLightboxIndex(newIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (lightboxIndex === null) return;
    const newIdx = (lightboxIndex + 1) % displayImages.length;
    setLightboxIndex(newIdx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, displayImages]);

  // Prettify folder names for display
  const prettifyFolderName = (name: string) => {
    if (name === "all") return name;
    if (!/^(honorable|hon'ble)/i.test(name)) {
      return `Honorable ${name}`;
    }
    return name;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      <div>
        {/* Navigation bar */}
        <section className="bg-white shadow-sm">
          <NavigationPage />
        </section>

        {/* Hero Banner */}
        <div className="relative py-20 px-6 overflow-hidden text-slate-900 text-center border-b border-slate-100" style={{ backgroundColor: "#FFF0E6" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,146,60,0.15),rgba(255,255,255,0))]" />
          <div className="relative max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-slate-900">
              Lurnexa Gallery
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
              Capturing milestones, celebrations, and distinguished visitors at Lurnexa Publications.
            </p>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 animate-pulse">Loading gallery assets...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-lg mx-auto shadow-sm">
              <p className="font-semibold">Failed to load gallery</p>
              <p className="text-sm opacity-80 mt-1">{error}</p>
            </div>
          ) : (
            <>
              {/* Folder Filter Tabs */}
              <div className="flex flex-wrap justify-center gap-3 mb-12">
                <button
                  onClick={() => setActiveFolder("all")}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer shadow-sm ${
                    activeFolder === "all"
                      ? "bg-slate-900 text-white shadow-slate-900/20"
                      : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  All Photos
                </button>
                {Object.keys(gallery.folders).map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setActiveFolder(folder)}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 cursor-pointer shadow-sm ${
                      activeFolder === folder
                        ? "bg-slate-900 text-white shadow-slate-900/20"
                        : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {prettifyFolderName(folder)}
                  </button>
                ))}
              </div>

              {/* Photos Grid */}
              {displayImages.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm max-w-md mx-auto">
                  <svg
                    className="w-16 h-16 text-slate-300 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-800 mb-1">No Photos Found</h3>
                  <p className="text-slate-500 text-sm">
                    Add images to <code className="bg-orange-50/50 px-1.5 py-0.5 rounded text-orange-600 font-mono text-xs">public/gallery/{activeFolder !== "all" ? activeFolder : ""}</code> to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {displayImages.map((image, index) => (
                    <div
                      key={image.url}
                      onClick={() => setLightboxIndex(index)}
                      className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100/50"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-slate-100 relative">
                        <img
                          src={image.url}
                          alt={prettifyFolderName(image.category)}
                          className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="p-3 bg-white/95 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <svg className="w-5 h-5 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="p-4 bg-white">
                        <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-md">
                          {prettifyFolderName(image.category)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <FooterSection />

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 bg-black/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300 animate-fadeIn"
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 text-white hover:text-slate-300 focus:outline-none p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
            aria-label="Close Lightbox"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 focus:outline-none p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer hidden md:block"
            aria-label="Previous Image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 focus:outline-none p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer hidden md:block"
            aria-label="Next Image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Wrapper */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[80vh] flex flex-col items-center"
          >
            <img
              src={displayImages[lightboxIndex].url}
              alt="Viewing Image"
              className="object-contain max-w-full max-h-[70vh] rounded-lg shadow-2xl"
            />
            {/* Caption & Indicator */}
            <div className="text-center mt-4 text-white">
              <span className="px-3 py-1 bg-orange-600/80 rounded-full text-xs font-semibold uppercase tracking-wider">
                {prettifyFolderName(displayImages[lightboxIndex].category)}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                {lightboxIndex + 1} of {displayImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
