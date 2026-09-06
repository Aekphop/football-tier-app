"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Trophy,
  ShieldCheck,
  UserCheck,
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  Sparkles,
  LogOut,
} from "lucide-react";

export default function LoginGateModal() {
  const { user, isPasscodeUnlocked, loginWithGoogle, unlockPasscode, logout } = useAuth();

  const [activeMode, setActiveMode] = useState<"GOOGLE" | "ADMIN">("GOOGLE");
  const [gmailInput, setGmailInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [passcodeInput, setPasscodeInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If user is logged in AND passcode is unlocked, close gate!
  if (user && isPasscodeUnlocked) {
    return null;
  }

  // STEP 1: If User is NOT logged in -> Require Google / Gmail Sign In
  if (!user) {
    const handleGoogleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMessage("");
      setIsSubmitting(true);

      let email = gmailInput.trim().toLowerCase();
      if (!email) {
        setErrorMessage("กรุณาระบุบัญชี Gmail ของคุณ");
        setIsSubmitting(false);
        return;
      }

      if (!email.includes("@")) {
        email = `${email}@gmail.com`;
      } else if (!email.endsWith("@gmail.com")) {
        setErrorMessage("กรุณาใช้อีเมล Gmail (@gmail.com) เท่านั้น");
        setIsSubmitting(false);
        return;
      }

      const res = await loginWithGoogle(email, nameInput.trim() || email.split("@")[0]);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMessage(res.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    };

    const handleAdminQuickLogin = async () => {
      setIsSubmitting(true);
      await loginWithGoogle("xekphphbrrnsa@gmail.com", "แอดมิน");
      setIsSubmitting(false);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 p-[2px] mx-auto shadow-2xl shadow-rose-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              FOOTBALL TIER LIST
            </h1>
            <p className="text-xs text-slate-300 font-medium">
              ต้องเข้าสู่ระบบด้วยบัญชี Google / Gmail ก่อนเริ่มใช้งาน
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setActiveMode("GOOGLE");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMode === "GOOGLE"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบด้วย Gmail</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveMode("ADMIN");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeMode === "ADMIN"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>บัญชีแอดมิน</span>
            </button>
          </div>

          {activeMode === "GOOGLE" ? (
            <form onSubmit={handleGoogleSubmit} className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-400" />
                    <span>อีเมล Google / Gmail *</span>
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="example@gmail.com"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none placeholder-slate-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    ชื่อโปรไฟล์ที่ต้องการแสดง (Display Name)
                  </label>
                  <input
                    type="text"
                    placeholder="ชื่อของคุณ (เช่น สมชาย / ก้อง)"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none placeholder-slate-500"
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
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>{isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google / Gmail"}</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-center py-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                เข้าสู่ระบบในฐานะผู้ดูแลระบบ (Admin)
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleAdminQuickLogin}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบในฐานะแอดมิน"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // STEP 2: If User is Logged In BUT Passcode is NOT Unlocked -> Mandatory Passcode Gate Screen!
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!passcodeInput.trim()) {
      setErrorMessage("กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน");
      return;
    }

    setIsSubmitting(true);
    const res = await unlockPasscode(passcodeInput.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || "รหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 relative">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/20">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">กรอกรหัสผ่านเพื่อเข้าใช้งานเว็บ</h2>
          <p className="text-xs text-slate-300">
            สวัสดีคุณ <strong className="text-amber-400">{user.name}</strong> ({user.email}) <br />
            กรุณากรอกรหัสผ่านที่ได้รับจากแอดมินเพื่อเริ่มใช้งานเว็บแอปพลิเคชัน
          </p>
        </div>

        <form onSubmit={handlePasscodeSubmit} className="space-y-4">
          <div className="space-y-1">
            <input
              type="text"
              autoFocus
              required
              placeholder="กรอกรหัสผ่าน (เช่น 1234)"
              value={passcodeInput}
              onChange={(e) => setPasscodeInput(e.target.value)}
              className="w-full bg-slate-950 border-2 border-amber-500/60 focus:border-amber-400 rounded-2xl px-4 py-3 text-xl text-amber-400 font-mono font-black text-center tracking-widest focus:outline-none transition-all shadow-inner"
            />
            {errorMessage && (
              <p className="text-xs text-red-400 font-semibold text-center mt-1 animate-in fade-in">
                {errorMessage}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isSubmitting ? "กำลังตรวจสอบ..." : "ปลดล็อคเข้าใช้งานเว็บไซต์"}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={logout}
            className="text-xs text-slate-400 hover:text-red-400 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>สลับบัญชี / ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
