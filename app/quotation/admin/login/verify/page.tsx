"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OTPVerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "2-Step Verification - Book Quotation System";
    const storedEmail = sessionStorage.getItem("admin_login_email");
    if (!storedEmail) {
      router.push("/quotation/admin/login");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/quotation/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Clear email and go to dashboard
      sessionStorage.removeItem("admin_login_email");
      router.push("/quotation/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        .login-body {
          font-family: 'Inter', sans-serif;
          background: #ffffff;
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin: 0;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 9999;
        }

        .login-wrapper {
          width: 100%;
          max-width: 420px;
          padding: 2rem;
          position: relative;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          padding: 3rem 2rem;
          box-shadow: 0 8px 32px 0 rgba(138, 43, 226, 0.1);
          color: #333333;
          animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-header h2 {
          font-weight: 700;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
          text-align: center;
          background: -webkit-linear-gradient(45deg, #8a2be2, #ff1493);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 1.8rem;
        }

        .login-header p {
          color: #555555;
          text-align: center;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .form-control {
          background: #ffffff;
          border: 1px solid #d1d5db;
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
          color: #333333;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 1.25rem;
          letter-spacing: 0.5em;
          text-align: center;
          transition: all 0.3s ease;
          width: 100%;
          outline: none;
          box-sizing: border-box;
        }

        .form-control:focus {
          background: #ffffff;
          border-color: #c490e4;
          box-shadow: 0 0 0 4px rgba(196, 144, 228, 0.3);
          color: #333333;
        }
        
        .form-control::placeholder {
          color: rgba(0, 0, 0, 0.4);
        }

        .btn-login {
          background: linear-gradient(135deg, #c490e4, #ff1493);
          border: none;
          color: white;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          transition: all 0.3s ease;
          margin-top: 1rem;
          width: 100%;
          cursor: pointer;
        }

        .btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 20, 147, 0.3);
          color: white;
        }

        .btn-login:active {
          transform: translateY(0);
        }

        .forgot-link {
          color: #c490e4;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
          font-weight: 600;
        }

        .forgot-link:hover {
          color: #8a2be2;
        }
        
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          z-index: -1;
          animation: float 10s infinite ease-in-out alternate;
        }
        .orb-1 {
          width: 300px;
          height: 300px;
          background: rgba(255, 105, 180, 0.4);
          top: -50px;
          left: -50px;
        }
        .orb-2 {
          width: 400px;
          height: 400px;
          background: rgba(138, 43, 226, 0.3);
          bottom: -100px;
          right: -50px;
          animation-delay: -5s;
        }

        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(30px, -30px); }
        }
      `}} />

      <div className="login-body">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        
        <div className="login-wrapper">
          <div className="glass-panel">
            <div className="login-header text-center">
              <h2>Security Verification</h2>
              <p>We've sent a 6-digit security code to your email. Please enter it below to securely sign in.</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="alert alert-danger" style={{
                  background: "rgba(220, 53, 69, 0.2)",
                  border: "1px solid rgba(220, 53, 69, 0.4)",
                  color: "#ff6b6b",
                  borderRadius: "12px",
                  padding: "10px 15px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                  textAlign: "center"
                }}>
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <input 
                  type="text" 
                  name="otp" 
                  className="form-control" 
                  placeholder="6-digit code" 
                  maxLength={6} 
                  pattern="\d{6}" 
                  required 
                  autoComplete="off" 
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>
              
              <div className="flex justify-center mb-4">
                <span 
                  onClick={() => router.push("/quotation/admin/login")} 
                  className="forgot-link cursor-pointer"
                >
                  Cancel and return to Login
                </span>
              </div>
              
              <button type="submit" disabled={loading} className="btn-login">
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
