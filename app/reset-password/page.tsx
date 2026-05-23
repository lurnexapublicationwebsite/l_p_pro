"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import NavigationPage from "@/components/Home/nav/page";
import FooterSection from "@/components/Home/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// --- STEP 1: The Form Logic (Nested inside the Page) ---
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Safely get email
  const emailFromUrl = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.lurnexa.in/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: emailFromUrl,
          reset_code: otp, 
          password: newPassword 
        }),
      });

      if (response.ok) {
        setSuccess(true);
        // Immediate visual feedback then redirect
        setTimeout(() => {
          router.push("/EditoralLogins");
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.detail || "Invalid OTP or session expired.");
      }
    } catch (err) {
      setError("Connection failed. Check your internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription>Enter the OTP from your email and your new password.</CardDescription>
      </CardHeader>
      
      <form onSubmit={onResetSubmit}>
        <CardContent className="space-y-4">
          {success && (
            <div className="p-3 bg-green-50 text-green-600 border border-green-200 rounded text-center text-sm font-bold">
              Success! Redirecting to login...
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <Label className="text-slate-600">Account Email</Label>
            <Input value={emailFromUrl} disabled className="bg-slate-50 opacity-70" />
          </div>

          <div className="space-y-1">
            <Label htmlFor="otp">OTP Code</Label>
            <Input 
              id="otp" 
              placeholder="6-digit code" 
              required 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading || success}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">New Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="Enter new password"
              required 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading || success}
            />
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full h-11" disabled={loading || success}>
            {loading ? "Verifying..." : "Reset & Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// --- STEP 2: The Main Export (Wrapped in Suspense) ---
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavigationPage />
      <main className="grow flex items-center justify-center px-4 py-12">
        {/* THIS SUSPENSE TAG IS THE FIX FOR ERROR #317 */}
        <Suspense fallback={<div className="text-slate-500 italic">Loading secure form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <FooterSection />
    </div>
  );
}
