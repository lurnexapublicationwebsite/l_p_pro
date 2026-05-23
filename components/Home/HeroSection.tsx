"use client";

import { LineShadowText } from "@/components/ui/line-shadow-text";
import { TypingAnimation } from "@/components/ui/typing-animation";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="flex items-center justify-center min-h-screen overflow-hidden bg-[#FFF0E6] px-4 sm:px-6 lg:px-8 relative z-10"
    >
      {/* ✅ Everything centered both horizontally & vertically */}
      <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16 sm:py-20 md:py-28 text-center">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-balance font-extrabold tracking-tight text-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
            <LineShadowText>
              LURNEXA
            </LineShadowText>

            <br />
            <span className="relative mt-2 inline-block text-4xl sm:text-5xl md:text-6xl lg:text-7xl italic bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-300 bg-clip-text text-transparent">
              PUBLICATIONS
            </span>
          </h1>

          <TypingAnimation className="mt-6 text-balance text-base sm:text-lg md:text-xl leading-relaxed text-black">
            A techno-management hub of knowledge and innovation, bridging technology,
            research, management, and publishing to create real-world impact.
          </TypingAnimation>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
           
            <button className="rounded-full bg-blue-600 px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 hover:shadow-blue-500/50">
            <Link
            href="/journal">
              Explore Journals
              </Link>
            </button>
            
            <button className="rounded-full border border-slate-300 px-8 py-3 text-sm sm:text-base font-semibold text-slate-800 shadow-sm transition hover:border-blue-500 hover:text-blue-600 dark:hover:border-sky-400 dark:hover:text-sky-300">
              <Link
            href="/comingsoon">
              Submit Your Article
              </Link>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
