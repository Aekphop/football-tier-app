"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Trophy,
  ShieldCheck,
  UserCheck,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function LoginGateModal() {
  const { user, loginWithDev } = useAuth();
  const [activeTab, setActiveTab] = useState<"SELECT" | "USER_GMAIL">("SELECT");
  const [gmailInput, setGmailInput] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (user) return null; // Already logged in

  const handleAdminLogin = () => {
    loginWithDev("xekphphbrrnsa@gmail.com", "แอดมิน", "ADMIN");
  };

  const handleUserGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    let email = gmailInput.trim().toLowerCase();
    if (!email) {
      setErrorMessage("กรุณาระบุบัญชี Gmail ของคุณ");
      return;
    }

    // Ensure it is a valid Gmail address
    if (!email.includes("@")) {
      email = `${email}@gmail.com`;
    } else if (!email.endsWith("@gmail.com")) {
      setErrorMessage("กรุณาใช้อีเมลที่ลงท้ายด้วย @gmail.com เท่านั้น");
      return;
    }

    const name = userName.trim() || email.split("@")[0];
    loginWithDev(email, name, "USER");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 p-[2px] mx-auto shadow-2xl shadow-rose-500/30">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            FOOTBALL TIER LIST
          </h1>
          <p className="text-xs text-slate-300">
            กรุณาเลือกประเภทบัญชีเพื่อเข้าสู่ระบบ
          </p>
        </div>

        {/* 2 Clean Account Options */}
        {activeTab === "SELECT" ? (
          <div className="space-y-3">
            {/* 1. Admin Option */}
            <button
              onClick={handleAdminLogin}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-transparent hover:from-amber-500/25 border-2 border-amber-500/50 hover:border-amber-400 text-left transition-all group shadow-lg shadow-amber-500/10 hover:scale-102"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  👑
                </div>
                <div>
                  <div className="text-base font-black text-white flex items-center gap-2">
                    <span>1. บัญชีแอดมิน</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black">
                      Admin
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    เข้าสู่ระบบในฐานะผู้ดูแลระบบ
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* 2. General User Option */}
            <button
              onClick={() => setActiveTab("USER_GMAIL")}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-500 text-left transition-all group shadow-lg hover:scale-102"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  ⚽
                </div>
                <div>
                  <div className="text-base font-black text-white flex items-center gap-2">
                    <span>2. บัญชีทั่วไป</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      Gmail
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    เข้าสู่ระบบด้วยบัญชี Gmail
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>
        ) : (
          /* General User Gmail Input Form */
          <form onSubmit={handleUserGmailSubmit} className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ระบุบัญชี Gmail ของคุณเพื่อเข้าใช้งาน</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  บัญชี Gmail <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="example@gmail.com"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  ชื่อที่ใช้แสดง (Display Name)
                </label>
                <input
                  type="text"
                  placeholder="ชื่อของคุณ (เช่น สมชาย / ก้อง)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-all placeholder-slate-500"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("SELECT");
                  setErrorMessage("");
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                ย้อนกลับ
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
