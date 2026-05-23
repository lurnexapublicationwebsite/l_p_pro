"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";


export default function SetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [session, setSession] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false)


  // 🔹 Load email & session from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("email")?.trim();
    const storedSession = localStorage.getItem("session")?.trim();
    console.log("Stored Email:", storedEmail);
    console.log("Stored Session:", storedSession);
   if (!storedEmail || !storedSession) {
      setError("Invalid or expired password reset session.");
      return;
    }

    setEmail(storedEmail);
    setSession(storedSession);
  }, []);

  const handleUpdate = async () => {
    if (!email || !session) {
      setError("Invalid session");
      return;
    }

    if (!newPassword) {
      setError("Password cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/complete-new-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            new_password: newPassword,
            session: session,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Password update failed");
      }

      // ✅ Store tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("id_token", data.id_token);

      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      // ✅ Cleanup temp data
      localStorage.removeItem("np_email");
      localStorage.removeItem("np_session");

      // ✅ Redirect after success
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-50">
  <div className="w-full max-w-md space-y-5 bg-white p-6 rounded-xl shadow">
    <h2 className="text-xl font-semibold text-center">
      Set New Password
    </h2>

    <div className="space-y-2">
      <Label htmlFor="new-password">New Password</Label>

      {/* ONLY ADDITION: relative wrapper */}
      <div className="relative">
        <Input
          id="new-password"
          type={showNewPassword ? "text" : "password"}
          placeholder="Enter a strong password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="pr-10"
        />

        <button
          type="button"
          onClick={() => setShowNewPassword(!showNewPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>

    {error && (
      <p className="text-red-600 text-sm text-center">
        {error}
      </p>
    )}

    <Button
      onClick={handleUpdate}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Updating..." : "Update Password"}
    </Button>
  </div>
</div>

  );
}
