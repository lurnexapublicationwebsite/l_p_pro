"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/app/providers/AuthProvider";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export function LoginCopy({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // ✅ AUTH FUNCTION (CORRECT)
  const startAuth = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("https://api.lurnexa.in/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("LOGIN RESPONSE 👉", data);

      // 🔴 TEMP PASSWORD → SET PASSWORD PAGE
      if (data.status === "NEW_PASSWORD_REQUIRED") {
        localStorage.setItem("email", email);
        localStorage.setItem("session", data.session);
        window.location.href = "/set-password";
        return;
      }

      // ❌ WRONG PASSWORD
      if (data.status === "Failed") {
        throw new Error(data.message || "Invalid email or password");
      }

      // ✅ NORMAL LOGIN
      if (data.status === "OK") {
        login({
          access_token: data.access_token,
          id_token: data.id_token,
          refresh_token: data.refresh_token,
          expires_in: data.expires_in,
        });
        return;
      }

      throw new Error("Unexpected login response");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ MISSING HANDLER 1 (FIXED)
  const handleLoginClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreeTerms) {
      setError("Please accept Terms & Conditions");
      return;
    }

    setShowTermsModal(true);
  };

  // ✅ MISSING HANDLER 2 (FIXED)
  const handleAcceptTerms = () => {
    setShowTermsModal(false);
    startAuth();
  };

  return (
    <div className={cn("flex flex-col gap-6 relative", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to log in to your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLoginClick}>
            <FieldGroup>
              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>

              <Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  I agree to Terms & Conditions
                </label>
              </Field>

              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading || !agreeTerms}
                className="w-full"
              >
                {loading ? "Processing..." : "Login"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* 📜 TERMS MODAL */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Terms & Conditions
              </h3>
              <p className="text-sm text-gray-500">
                Lurnexa Publications - Editorial Access
              </p>
            </div>

            <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed">
              <p className="mb-4 font-medium italic">
                By clicking "I Accept", you agree to the following:
              </p>

              <div className="space-y-3 text-start">
                <div className="p-6 overflow-y-auto text-sm text-gray-600 leading-relaxed">
              <p className="mb-4 font-medium italic">By clicking "I Accept", you agree to the following Editorial Login Access terms:</p>
              
              <div className="space-y-4">
                <section>
                  <h4 className="font-bold text-gray-800 underline">1. Purpose</h4>
                  <p>Credentials are for profile verification, manuscript access, and official editorial coordination only.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">2. Confidentiality</h4>
                  <p>Login details are strictly confidential. Sharing with third parties is prohibited.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">3. Data Accuracy</h4>
                  <p>Members must ensure all submitted information is authentic and accurate.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">4. Privacy</h4>
                  <p>Data is used strictly for official publishing and administrative purposes.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">5. Ethics</h4>
                  <p>Must comply with ethical publishing standards and peer-review confidentiality.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">6. System Security</h4>
                  <p>Members should change temporary passwords immediately. Security monitoring is in place.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">7. Termination</h4>
                  <p>Access may be revoked for violations or completion of association.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">8. IP Rights</h4>
                  <p>All system content and workflows are the intellectual property of Lurnexa Publications.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">9. Liability</h4>
                  <p>Lurnexa is not liable for user negligence or compromised credentials.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">10. Modifications</h4>
                  <p>Terms may be updated at any time; continued use constitutes acceptance.</p>
                </section>
                <section>
                  <h4 className="font-bold text-gray-800 underline">11. Governing Law</h4>
                  <p>Governed by the laws of India and subject to its competent courts.</p>
                </section>
                <section className="bg-blue-50 p-3 rounded">
                  <h4 className="font-bold text-gray-800 underline">12. Acceptance</h4>
                  <p>By clicking the button below, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</p>
                </section>
              </div>
              </div>
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTermsModal(false);
                  setLoading(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAcceptTerms}
                className="flex-1 bg-blue-700 hover:bg-blue-800"
              >
                I Accept & Login
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>  );
}