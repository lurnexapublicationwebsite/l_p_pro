"use client";

import React, { useState } from "react";
import Link from "next/link";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
// Optional: Use shadcn toast for errors
// import { useToast } from "@/components/ui/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.lurnexa.in/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }), // Correct payload 
      });

      if (response.ok) {
        setSubmitted(true);

        // ✅ AUTO REDIRECT TO RESET PASSWORD PAGE
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(email)}`
          );
        }, 1200);
      } else {
        const errorData = await response.json();
        setError(
          errorData.detail?.[0]?.msg ||
            "Something went wrong. Please try again."
        );
      }
    } catch (err) {
      setError("Failed to connect to the server. Please check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavigationPage />
      
      {/* Responsive Container */}
      <main className="grow flex items-center justify-center px-4 py-12 mt-12 ">
        <Card className="w-full max-w-sm sm:max-w-md shadow-xl border-t-4 border-t-primary">
          {!submitted ? (
            <>
              <CardHeader className="space-y-2 text-center">
                <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight">
                  Forgot Password?
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Enter your email and we'll send you a reset link.
                  <br/>
                  <span className="font-extrabold ">Please enter the registered email only</span>
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={onSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      required 
                      className={`h-11 ${error ? "border-destructive" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                    {error && (
                      <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                        {error}
                      </p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col gap-4 mt-3">
                  <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]" 
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                         <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                         Processing...
                      </span>
                    ) : "Send Reset Link"}
                  </Button>
                  
                  <Link 
                    href="/login" 
                    className="text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                  >
                    ← Back to Login
                  </Link>
                </CardFooter>
              </form>
            </>
          ) : (
            <CardContent className="py-12 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">📩</span>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl">Check your inbox</CardTitle>
                <p className="text-muted-foreground">
                  We sent a otp to <span className="font-semibold text-foreground">{email}</span>
                </p>
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setSubmitted(false)}
              >
                Try a different email
              </Button>
            </CardContent>
          )}
        </Card>
      </main>

      <FooterSection />
    </div>
  );
};

export default ForgotPassword;