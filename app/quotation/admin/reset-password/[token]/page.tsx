"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Set New Password - Book Quotation System";
    
    async function checkToken() {
      if (!token) return;
      try {
        const res = await fetch(`/api/quotation/admin/reset-password?token=${token}`);
        const data = await res.json();
        setIsValid(data.valid);
      } catch (err) {
        setIsValid(false);
      }
    }
    
    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/quotation/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/quotation/admin/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="text-sm font-semibold text-[#6b7280]">Verifying reset token...</div>
      </div>
    );
  }

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
      `}} />

      <div className="login-body">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        
        <div className="login-wrapper">
          <div className="glass-panel">
            {isValid ? (
              <>
                <div className="login-header">
                  <h2>Set New Password</h2>
                  <p>Please enter your new password twice so we can verify you typed it in correctly.</p>
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

                  {success && (
                    <div className="alert alert-success" style={{
                      background: "rgba(40, 167, 69, 0.2)",
                      border: "1px solid rgba(40, 167, 69, 0.4)",
                      color: "#85e085",
                      borderRadius: "12px",
                      padding: "10px 15px",
                      marginBottom: "1rem",
                      fontSize: "0.9rem"
                    }}>
                      Success! Redirecting to login...
                    </div>
                  )}
                  
                  <div className="mb-4 relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      className="form-control pr-12" 
                      placeholder="New Password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span 
                      className="absolute top-1/2 right-4 -translate-y-1/2 select-none" 
                      style={{ cursor: "pointer", color: "#555555", zIndex: 10 }} 
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                          <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12-1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                      )}
                    </span>
                  </div>

                  <div className="mb-6 relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirm_password" 
                      className="form-control pr-12" 
                      placeholder="Confirm New Password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span 
                      className="absolute top-1/2 right-4 -translate-y-1/2 select-none" 
                      style={{ cursor: "pointer", color: "#555555", zIndex: 10 }} 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7 7 0 0 0-2.79.588l.77.771A6 6 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755q-.247.248-.517.486z"/>
                          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829"/>
                          <path d="M3.35 5.47q-.27.24-.518.487A13 13 0 0 0 1.172 8l.195.288c.335.48.83 1.12-1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7 7 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12z"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
                        </svg>
                      )}
                    </span>
                  </div>
                  
                  <button type="submit" disabled={loading} className="btn-login">
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="login-header">
                  <h2>Link Expired</h2>
                  <p style={{ color: "#ff6b6b" }}>The password reset link was invalid, possibly because it has already been used.</p>
                </div>
                <button 
                  onClick={() => router.push("/quotation/admin/forgot-password")} 
                  className="btn-login"
                >
                  Request a new password reset
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
