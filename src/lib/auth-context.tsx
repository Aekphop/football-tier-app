"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isApproved: boolean;
  isLoading: boolean;
  loginWithDev: (email: string, name: string, role?: UserRole) => void;
  logout: () => void;
  setAdminEmail: (email: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "USER",
  isAdmin: false,
  isApproved: false,
  isLoading: true,
  loginWithDev: () => {},
  logout: () => {},
  setAdminEmail: () => {},
});

const DEV_STORAGE_KEY = "tier_app_user_session";
const PRIMARY_ADMIN_EMAIL = "xekphphbrrnsa@gmail.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEV_STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        if (parsed.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
          parsed.role = "ADMIN";
          parsed.isApproved = true;
        }
        setUser(parsed);
      } else {
        // Default login as Admin (xekphphbrrnsa@gmail.com)
        const defaultAdmin: User = {
          id: "u_admin_owner",
          email: PRIMARY_ADMIN_EMAIL,
          name: "แอดมิน (ฉัน)",
          image: "https://api.dicebear.com/7.x/personas/svg?seed=AdminBoss",
          role: "ADMIN",
          isApproved: true,
        };
        setUser(defaultAdmin);
        localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(defaultAdmin));
      }
    } catch (e) {
      console.error("Auth load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithDev = (email: string, name: string, forcedRole?: UserRole) => {
    const cleanEmail = email.toLowerCase().trim();
    const isAdmin =
      forcedRole === "ADMIN" ||
      cleanEmail === PRIMARY_ADMIN_EMAIL ||
      cleanEmail.includes("admin");

    const newUser: User = {
      id: `u_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email: cleanEmail,
      name,
      image: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: isAdmin ? "ADMIN" : "USER",
      isApproved: isAdmin,
    };

    setUser(newUser);
    localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(newUser));

    // Register user with backend
    fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    }).catch(() => {});
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(DEV_STORAGE_KEY);
  };

  const setAdminEmail = (email: string) => {
    if (user && user.email === email) {
      const updated = { ...user, role: "ADMIN" as UserRole, isApproved: true };
      setUser(updated);
      localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const role: UserRole = user?.role || "USER";
  const isAdmin = role === "ADMIN" || user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL;
  const isApproved = isAdmin || Boolean(user?.isApproved);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isApproved,
        isLoading,
        loginWithDev,
        logout,
        setAdminEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
