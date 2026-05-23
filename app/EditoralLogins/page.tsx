"use client";
import { LoginCopy } from "@/components/login-form copy";
export default function LoginPage() {

  return (
    <>
      {/* ✅ Logo / Navbar */}
      <div
        className="flex items-center gap-3 select-none pointer-events-auto px-6 pt-4 pb-2"
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

      {/* ✅ Login Section */}
      <div className="flex min-h-[80vh] w-full items-start justify-center p-4 md:p-8 mt-0">
        <div className="w-full max-w-sm text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Welcome Back
          </h2>

          {/* 👇 Your local LoginForm (optional custom login UI) */}
          <LoginCopy />

          {/* OR Hosted UI login button */}
         
        </div>
      </div>
    </>
  );
}
