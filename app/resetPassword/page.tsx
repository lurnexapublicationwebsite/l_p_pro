"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

// 1. Create a separate component for the form logic
const ResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: searchParams.get("email") || "",
    reset_code: searchParams.get("code") || "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Connects to your /reset-password API
      const response = await fetch("https://api-lurnexa.in/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), 
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        // Handles the 422 error detail structure from your image
        const errorMsg = data.detail?.[0]?.msg || "Failed to reset password.";
        setError(errorMsg);
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-[450px] shadow-lg border-none">
      {!success ? (
        <>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Create New Password</CardTitle>
            <CardDescription>Enter your reset code and new password below.</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={formData.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset_code">Reset Code</Label>
                <Input id="reset_code" type="text" placeholder="Enter code" required value={formData.reset_code} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleChange} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full py-6 text-base" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Password"}
              </Button>
              <Link href="/login" className="text-sm text-muted-foreground hover:underline">Back to Login</Link>
            </CardFooter>
          </form>
        </>
      ) : (
        <CardContent className="py-12 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle>Success!</CardTitle>
          <p className="text-muted-foreground">Redirecting you to login...</p>
        </CardContent>
      )}
    </Card>
  );
};

// 2. The main page component wraps the form in Suspense
const ResetPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <NavigationPage />
      <main className="grow flex items-center justify-center p-4">
        {/* This Suspense boundary fixes your build error! */}
        <Suspense fallback={<div className="text-center italic">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <FooterSection />
    </div>
  );
};

export default ResetPasswordPage;