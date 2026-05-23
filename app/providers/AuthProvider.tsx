"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthContextType = {
  accessToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: (tokens: {
    access_token: string;
    id_token?: string;
    refresh_token?: string;
    expires_in?: number;
  }) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* 🔄 Load tokens on refresh */
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const uid = localStorage.getItem("user_id");
    if (token) setAccessToken(token);
    if (uid) setUserId(uid);
  }, []);

  const login = (tokens: any) => {
    localStorage.setItem("access_token", tokens.access_token);
    if (tokens.refresh_token)
      localStorage.setItem("refresh_token", tokens.refresh_token);
    if (tokens.id_token)
      localStorage.setItem("id_token", tokens.id_token);

    if (tokens.expires_in) {
      localStorage.setItem(
        "token_expiry",
        (Date.now() + tokens.expires_in * 1000).toString()
      );
    }

    setAccessToken(tokens.access_token);
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.clear();
    setAccessToken(null);
    setUserId(null);
    router.push("/EditoralLogins");
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        userId,
        isAuthenticated: !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ✅ SAFE HOOK */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
