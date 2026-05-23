"use client";

import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
  href?: string;
  linkedinUrl?: string;
  collegeUrl?: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!testimonials || testimonials.length === 0) return null;

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
    setExpanded(false);
  }, [testimonials.length]);

  const handlePrev = useCallback(() => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setExpanded(false);
  }, [testimonials.length]);

  // ✅ Autoplay with hover pause
  useEffect(() => {
    if (!autoplay || isPaused) return;
    const interval = setInterval(handleNext, 3000);
    return () => clearInterval(interval);
  }, [autoplay, handleNext, isPaused]);

  const current = testimonials[active];
  const MAX_WORDS = 45;
  const words = current?.quote?.split(" ") || [];
  const isLong = words.length > MAX_WORDS;
  const visibleWords = expanded ? words : words.slice(0, MAX_WORDS);

  const textContainerBase =
    "mt-6 text-black leading-relaxed text-base md:text-lg";
  const textContainerClass = expanded
    ? `${textContainerBase} max-h-60 md:max-h-72 overflow-y-auto modern-scroll pr-2`
    : textContainerBase;

  return (
    <>
      <div
        className="mx-auto py-20 font-sans antialiased md:max-w-5xl px-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-4">
            Leader Spotlight
          </h2>
          <div className="w-20 h-1.5 bg-orange-500 mx-auto rounded-full mb-6" />
          <p className="mt-3 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Meet the visionaries leading Lurnexa Publications
          </p>
        </div>

        {/* GRID LAYOUT FOR IMAGE AND TEXT */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-orange-100 rounded-[2rem] shadow-xl p-6 md:p-10"
          >
            {/* IMAGE SECTION */}
            <div className="relative h-[250px] md:h-[380px] w-full group">
              {current.href ? (
                <a 
                  href={current.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="cursor-pointer"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="h-full w-full relative overflow-hidden rounded-2xl shadow-2xl"
                  >
                    <Image
                      src={current.src}
                      alt={current.name}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </motion.div>
                </a>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, rotate: -2 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full w-full relative overflow-hidden rounded-2xl shadow-2xl"
                >
                  <Image
                    src={current.src}
                    alt={current.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>
              )}
            </div>

            {/* TEXT SECTION */}
            <div className="flex flex-col">
              {current.href ? (
                <a 
                  href={current.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:underline"
                >
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-950 mb-2">
                    {current.name}
                  </h3>
                </a>
              ) : (
                <h3 className="text-3xl md:text-4xl font-extrabold text-slate-950 mb-2">
                  {current.name}
                </h3>
              )}
              <p className="text-lg md:text-xl font-medium text-blue-600 mb-4">
                {current.designation}
              </p>

              {/* SOCIAL ICONS */}
              <div className="flex items-center gap-4 mb-6">
                {current.linkedinUrl && (
                  <a
                    href={current.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-gray-200 hover:border-blue-600 hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {current.collegeUrl && (
                  <a
                    href={current.collegeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full border border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-gray-500 hover:text-orange-500 transition-all duration-300"
                    title="View Official Profile"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 0 6 0 9 5 3-5 6-5 9-5v-5"/>
                    </svg>
                  </a>
                )}
              </div>

              <motion.div
                className={textContainerClass}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {visibleWords.map((word, index) => (
                  <motion.span
                    key={index}
                    initial={{ filter: "blur(8px)", opacity: 0, y: 5 }}
                    animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      ease: "easeOut",
                      delay: 0.015 * index,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                ))}

                {isLong && !expanded && (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="ml-2 inline-flex items-center text-orange-600 font-black text-sm uppercase tracking-widest hover:text-orange-700 transition-colors group/read"
                  >
                    Read Full Vision
                    <svg 
                      className="ml-1 w-4 h-4 transition-transform group-hover/read:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5-5 5M6 7l5 5-5 5" />
                    </svg>
                  </button>
                )}

                {isLong && expanded && (
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="mt-4 block text-sm text-blue-600 font-bold hover:underline"
                  >
                    Show Less
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modern scrollbar styles */}
      <style>{`
        .modern-scroll {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #e5e7eb;
        }

        .modern-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .modern-scroll::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 9999px;
        }

        .modern-scroll::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 9999px;
        }

        .modern-scroll::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </>
  );
};
