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

  useEffect(() => {
    async function fetchGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data: GalleryData = await res.json();
          const flat: { url: string; category: string }[] = [];
          Object.entries(data.folders).forEach(([folderName, imgUrls]) => {
            imgUrls.forEach((url) => {
              flat.push({ url, category: folderName });
            });
          });
          // Limit to 8 images on the homepage to avoid heavy DOM rendering and lag
          setImages(flat.slice(0, 8));
        }
      } catch (err) {
        console.error("Error fetching gallery for home page:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchGallery();
  }, []);

  if (loading || images.length === 0) {
    return null;
  }

  // Duplicate the list of images to ensure seamless infinite scroll loop
  const duplicatedImages = [...images, ...images, ...images];

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

      {/* Rolling Marquee Container */}
      <div className="relative w-full overflow-hidden select-none py-2 md:py-4">
        <div className="flex w-max gap-4 md:gap-6 animate-marquee hover:[animation-play-state:paused] cursor-pointer">
          {duplicatedImages.map((image, idx) => (
            <Link
              href="/gallery"
              key={`${image.url}-${idx}`}
              className="w-48 md:w-80 flex-shrink-0 group block"
            >
              <div className="relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl border border-slate-200 bg-slate-50 transition-all duration-300 group-hover:scale-[1.02] group-hover:border-orange-500/50">
                <Image
                  src={image.url}
                  alt={image.category}
                  fill
                  sizes="(max-width: 768px) 192px, 320px"
                  className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 4}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white z-10">
                  <span className="inline-block px-2 py-0.5 text-[9px] md:text-[10px] font-bold tracking-wider bg-orange-600/80 uppercase rounded-full mb-1">
                    {image.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Styled self-contained animation keyframes */}
      <style suppressHydrationWarning>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-33.33333%, 0, 0);
          }
        }
        .animate-marquee {
          animation: marquee 100s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
        }
      `}</style>
    </section>
  );
}
