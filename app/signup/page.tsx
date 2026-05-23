import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo */}
      <div
        className="flex items-center gap-3 select-none pointer-events-auto px-6 pt-4"
        aria-label="Logo"
      >
        <a href="/" className="flex items-center gap-2 no-underline">
          <img
            src="/Logo.png"
            alt="Lurnexa"
            className="block mix-blend-multiply object-contain opacity-100%"
            draggable={false}
            width={80}
            height={80}
            style={{
              width: "clamp(40px, 6vw, 80px)",
              height: "clamp(40px, 6vw, 80px)",
            }}
          />
          <span className="text-[20px] sm:text-[28px] md:text-[32px] lg:text-[35px] font-semibold text-black tracking-tight">
            Lurnexa
          </span>
        </a>
      </div>

      {/* Main two-column area */}
      <div className="grid flex-1 min-h-0 lg:grid-cols-2 overflow-hidden">
        {/* Left: signup (scrollable) */}
        <div className="flex flex-col p-6 md:p-10 overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <SignupForm />
            </div>
          </div>
        </div>

        {/* Right: quote (fixed view on large screens) */}
        <div className="hidden lg:flex fixed -bottom-2 -right-2 items-end justify-end min-h-[900px] max-w-[750px] z-50 ">
  <CardContent className="relative rounded-2xl backdrop-blur-md bg-white/40 shadow-xl border border-white/30 p-8 text-start transition-all duration-500 hover:shadow-2xl">
    {/* Decorative quote symbol */}
    <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-7xl text-gray-200 font-serif select-none leading-none">
      “
    </span>

    {/* Quote text */}
    <p className=" text-start text-lg md:text-xl font-semibold text-gray-800 leading-relaxed mt-3">
      Lurnexa Publications is a leading techno-management hub of knowledge and
      innovation, bridging technology, research, and management disciplines.
      Our peer-reviewed journals aim to promote global academic collaboration
      and dissemination of impactful research.
    </p>

    {/* Logo + name section */}
    <div className="flex flex-col items-center justify-center mt-6 space-y-2">
      <div className="p-[2px] bg-linear-to-r from-indigo-400 to-cyan-400 rounded-full">
        <img
          src="/Logo.png"
          alt="Lurnexa Logo"
          className="w-16 h-16 rounded-full object-contain bg-white p-2 shadow-md"
        />
      </div>
      <cite className="text-sm font-semibold text-gray-700 tracking-wide">
        Lurnexa
      </cite>
    </div>
  </CardContent>
</div>
</div>
    </div>
  )
}
