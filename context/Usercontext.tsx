"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const UserContext = createContext<any>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    const subId = localStorage.getItem("user_id");

    console.log("DEBUG: Checking Storage...", { token: !!token, subId });

    if (!token || !subId) {
      console.warn("DEBUG: No token or ID found. Redirecting to login.");
      setLoading(false);
      return;
    }

    try {
      console.log("DEBUG: Fetching profile for ID:", subId);
      const res = await fetch(`https://api.lurnexa.in/get_users`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ subid: subId }),
      });

      const result = await res.json();
      console.log("DEBUG: API Response:", result);

      if (res.ok && result?.data?.[0]) {
        setUser(result.data[0]);
        console.log("DEBUG: User set successfully!");
      } else {
        console.error("DEBUG: API returned error or empty data");
        // Don't clear storage immediately, just set user null
        setUser(null);
      }
    } catch (err) {
      console.error("DEBUG: Network Error:", err);
      setUser(null);
    } finally {
      setLoading(false);
      console.log("DEBUG: Loading finished.");
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <UserContext.Provider value={{ user, setUser, loading, logout: () => { localStorage.clear(); setUser(null); router.push("/EditoralLogins"); }, refreshProfile: fetchProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);