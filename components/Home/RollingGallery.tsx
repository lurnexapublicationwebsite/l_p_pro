"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface GalleryData {
  folders: Record<string, string[]>;
}

export default function RollingGallery() {
  const [images, setImages] = useState<{ url: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const prettifyFolderName = (name: string) => {
    if (name === "all") return name;
    if (!/^(honorable|hon'ble)/i.test(name)) {
      return `Honorable ${name}`;
    }
    return name;
  };

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data: GalleryData = await res.json();
          const flat: { url: string; category: string }[] = [];
          
          const folders = Object.entries(data.folders);
          const maxImages = Math.max(...folders.map(([_, urls]) => urls.length), 0);
          
          for (let i = 0; i < maxImages; i++) {
            folders.forEach(([folderName, imgUrls]) => {
              if (i < imgUrls.length) {
                flat.push({ url: imgUrls[i], category: folderName });
              }
            });
          }
          setImages(flat);
        }
      } catch (err) {
        console.error("Error fetching gallery for home page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  // Auto-advance every 10 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images]);

  if (loading || images.length === 0) {
    return null;
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50 overflow-hidden relative border-t border-b border-slate-100">
      {/* Dynamic Grid Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 mb-8 md:mb-12 text-center">
        <h2 className="text-2xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950">
          Lurnexa Gallery
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto font-light leading-relaxed">
          Moments of distinction, including honorable guests, chancellors, and national leaders.
        </p>
      </div>

      {/* Single Photo Slideshow Container */}
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/gallery" className="block group">
          <div className="relative aspect-[4/3] w-full rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl border border-slate-200/80 bg-slate-100 transition-all duration-300 group-hover:scale-[1.01] group-hover:border-orange-500/40">
            {images.map((image, idx) => (
              <div
                key={`${image.url}-${idx}`}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={image.url}
                  alt={prettifyFolderName(image.category)}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover transform transition-transform duration-700 group-hover:scale-105"
                  priority={idx === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-20">
                  <span className="inline-block px-3 py-1 text-xs md:text-sm font-bold tracking-wider bg-orange-600 uppercase rounded-full mb-2">
                    {prettifyFolderName(image.category)}
                  </span>
                </div>
              </div>
            ))}

            {/* Manual Controls - Prev Button */}
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 active:scale-95 text-white hover:text-orange-50 p-2 md:p-3 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer border border-white/10"
              aria-label="Previous image"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Manual Controls - Next Button */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/40 active:scale-95 text-white hover:text-orange-50 p-2 md:p-3 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer border border-white/10"
              aria-label="Next image"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Navigation Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2 bg-slate-950/40 backdrop-blur-md py-1.5 px-3 rounded-full border border-white/10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? "w-6 bg-orange-500" : "w-2 bg-white/60 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}
