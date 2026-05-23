"use client";

// import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { useAuth } from "@/components/AuthProvider";
import { buildLoginUrl } from "@/lib/cognito"; // ✅ Cognito login URL builder
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  // const { user, loading } = useAuth();
  const router = useRouter();

  // ✅ Redirect logged-in users directly to dashboard
  // useEffect(() => {
  //   if (!loading && user) {
  //     router.replace("/dashboard");
  //   }
  // }, [user, loading, router]);

  // ✅ Optionally auto-redirect to Cognito Hosted UI login
  const handleCognitoLogin = () => {
    window.location.href = buildLoginUrl();
  };

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
          <LoginForm />

          {/* OR Hosted UI login button */}
         
        </div>
      </div>
    </>
  );
}
