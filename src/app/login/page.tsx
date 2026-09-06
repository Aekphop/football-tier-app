"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Trophy, ShieldCheck, UserCheck, Sparkles, LogIn, ArrowRight, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithDev } = useAuth();
  const [activeTab, setActiveTab] = useState<"ADMIN" | "GMAIL">("GMAIL");
  const [gmailInput, setGmailInput] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleAdminLogin = () => {
    loginWithDev("xekphphbrrnsa@gmail.com", "แอดมิน", "ADMIN");
    router.push("/");
  };

  const handleGmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    let email = gmailInput.trim().toLowerCase();
    if (!email) {
      setErrorMessage("กรุณาระบุบัญชี Gmail ของคุณ");
      return;
    }

    if (!email.includes("@")) {
      email = `${email}@gmail.com`;
    } else if (!email.endsWith("@gmail.com")) {
      setErrorMessage("กรุณาใช้อีเมลที่ลงท้ายด้วย @gmail.com เท่านั้น");
      return;
    }

    const name = userName.trim() || email.split("@")[0];
    loginWithDev(email, name, "USER");
    router.push("/");
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 p-[2px] mx-auto shadow-xl shadow-rose-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white">เข้าสู่ระบบ Football Tier List</h1>
        <p className="text-xs text-slate-400">
          เลือกเข้าใช้งานในฐานะแอดมิน หรือเข้าสู่ระบบด้วยบัญชี Gmail
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5 shadow-xl">
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("GMAIL")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "GMAIL"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ⚽ บัญชีทั่วไป (Gmail)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ADMIN")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === "ADMIN"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            👑 บัญชีแอดมิน
          </button>
        </div>

        {activeTab === "GMAIL" ? (
          <form onSubmit={handleGmailLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  บัญชี Gmail <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="example@gmail.com"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  ชื่อที่ใช้แสดง (Display Name)
                </label>
                <input
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>เข้าสู่ระบบด้วย Gmail</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center py-4">
            <p className="text-xs text-slate-300">
              คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบในฐานะแอดมินผู้ดูแลระบบ
            </p>
            <button
              type="button"
              onClick={handleAdminLogin}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>เข้าสู่ระบบในฐานะแอดมิน</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
