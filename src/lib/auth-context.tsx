"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  isApproved: boolean;
  isBanned: boolean;
  isPasscodeUnlocked: boolean;
  isLoading: boolean;
  loginWithGoogle: (email: string, name: string) => Promise<{ success: boolean; error?: string }>;
  unlockPasscode: (code: string) => Promise<{ success: boolean; error?: string }>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "USER",
  isAdmin: false,
  isApproved: false,
  isBanned: false,
  isPasscodeUnlocked: false,
  isLoading: true,
  loginWithGoogle: async () => ({ success: false }),
  unlockPasscode: async () => ({ success: false }),
  updateUserProfile: async () => ({ success: false }),
  logout: () => {},
});

const SESSION_STORAGE_KEY = "tier_app_user_session";
const PASSCODE_UNLOCKED_KEY = "tier_app_passcode_unlocked";
const PRIMARY_ADMIN_EMAIL = "xekphphbrrnsa@gmail.com";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Check stored user session
      const storedUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedUser) {
        const parsed: User = JSON.parse(storedUser);
        const cleanEmail = parsed.email.toLowerCase().trim();
        parsed.role = cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USER";
        setUser(parsed);
      }

      // Check passcode unlock status
      const storedPasscode = sessionStorage.getItem(PASSCODE_UNLOCKED_KEY);
      if (storedPasscode === "true") {
        setIsPasscodeUnlocked(true);
      }
    } catch (e) {
      console.error("Auth load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async (email: string, name: string) => {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail.endsWith("@gmail.com")) {
      return { success: false, error: "กรุณาใช้อีเมล Gmail (@gmail.com) เท่านั้น" };
    }

    const isAdmin = cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase();

    const newUser: User = {
      id: `u_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      email: cleanEmail,
      name: name || cleanEmail.split("@")[0],
      image: `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: isAdmin ? "ADMIN" : "USER",
      isApproved: isAdmin,
      isBanned: false,
    };

    setUser(newUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));

    // Register user with backend
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newUser }),
      });
    } catch (e) {}

    return { success: true };
  };

  const unlockPasscode = async (code: string) => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success) {
        const setPasscode = data.data.votingPasscode || "1234";
        if (code.trim() === setPasscode.trim()) {
          setIsPasscodeUnlocked(true);
          sessionStorage.setItem(PASSCODE_UNLOCKED_KEY, "true");
          return { success: true };
        } else {
          return { success: false, error: "รหัสผ่านไม่ถูกต้อง กรุณาติดต่อแอดมินเพื่อขอรหัสที่ถูกต้อง" };
        }
      }
      return { success: false, error: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อตรวจสอบรหัสได้" };
    } catch (e) {
      return { success: false, error: "เกิดข้อผิดพลาดในการตรวจสอบรหัสผ่าน" };
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

    // Check duplicate shirt number
    if (updates.number !== undefined && updates.number !== null) {
      const num = Number(updates.number);
      try {
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const duplicate = json.data.find(
            (u: User) => u.email.toLowerCase() !== user.email.toLowerCase() && Number(u.number) === num
          );
          if (duplicate) {
            return {
              success: false,
              error: `เบอร์เสื้อ #${num} ถูกใช้งานแล้วโดยคุณ "${duplicate.name}" กรุณาเลือกเบอร์อื่น`,
            };
          }
        }
      } catch (e) {}
    }

    const updatedUser = {
      ...user,
      ...updates,
    };

    setUser(updatedUser);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));

    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: updatedUser }),
      });
    } catch (e) {}

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsPasscodeUnlocked(false);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(PASSCODE_UNLOCKED_KEY);
  };

  const role: UserRole = user?.role || "USER";
  const isAdmin = role === "ADMIN" || user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
  const isApproved = isAdmin || Boolean(user?.isApproved);
  const isBanned = Boolean(user?.isBanned);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isApproved,
        isBanned,
        isPasscodeUnlocked,
        isLoading,
        loginWithGoogle,
        unlockPasscode,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
