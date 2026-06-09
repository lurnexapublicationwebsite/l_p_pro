"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Book Quotation System - Forgot Password";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/quotation/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password reset request failed");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
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
          font-size: 1rem;
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
          display: block;
          text-align: center;
          text-decoration: none;
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

        .icon-large {
          display: flex;
          justify-content: center;
          align-items: center;
          color: #8a2be2;
          margin-bottom: 1.5rem;
        }
      `}} />

      <div className="login-body">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        
        <div className="login-wrapper">
          <div className="glass-panel">
            {success ? (
              <>
                <div className="icon-large">
                  <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2H2Zm3.708 6.208L1 11.105V5.383l4.708 2.825ZM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2-7-4.2Z"/>
                    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Zm-1.993-1.679a.5.5 0 0 0-.686.172l-1.17 1.95-.547-.547a.5.5 0 0 0-.708.708l.774.773a.75.75 0 0 0 1.174-.144l1.335-2.226a.5.5 0 0 0-.172-.686Z"/>
                  </svg>
                </div>
                <div className="login-header">
                  <h2>Email Sent!</h2>
                  <p>We've emailed you instructions for setting your password, if an account exists with the email you entered. You should receive them shortly.</p>
                  <p className="mt-3"><small>If you don't receive an email, please make sure you've entered the address you registered with, and check your spam folder.</small></p>
                </div>
                <button onClick={() => router.push("/quotation/admin/login")} className="btn-login">
                  Return to Login
                </button>
              </>
            ) : (
              <>
                <div className="login-header">
                  <h2>Reset Password</h2>
                  <p>Enter your registered admin email to receive a new password.</p>
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
                      fontSize: "0.9rem"
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <input 
                      type="email" 
                      name="email" 
                      className="form-control" 
                      placeholder="Admin Email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <span 
                      onClick={() => router.push("/quotation/admin/login")} 
                      className="forgot-link cursor-pointer"
                    >
                      Back to Login
                    </span>
                  </div>
                  
                  <button type="submit" disabled={loading} className="btn-login">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
