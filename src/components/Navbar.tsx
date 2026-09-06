"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Trophy,
  Vote,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
  Settings,
  ChevronDown,
  Lock,
  Radio,
  KeyRound,
  Mail,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAdmin, loginWithDev, logout } = useAuth();
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [gmailInput, setGmailInput] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navLinks = [
    { href: "/", label: "หน้าแรก", icon: Radio },
    { href: "/vote", label: "โหวตคะแนน", icon: Vote },
    { href: "/tier-list", label: "สรุป Tier List", icon: Trophy },
    ...(isAdmin
      ? [{ href: "/admin", label: "ระบบจัดการ (Admin)", icon: Settings }]
      : []),
  ];

  const handleAdminSwitch = () => {
    loginWithDev("xekphphbrrnsa@gmail.com", "แอดมิน", "ADMIN");
    setShowSwitchModal(false);
  };

  const handleGmailSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    let email = gmailInput.trim().toLowerCase();
    if (!email) {
      setErrorMessage("กรุณาระบุบัญชี Gmail");
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
    setShowSwitchModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-indigo-600 p-[2px] shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
                  FOOTBALL TIER
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  7 หมวด 36 ข้อ
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Account / Role Switcher */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSwitchModal(true)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all text-left group"
                    title="สลับบัญชีผู้ใช้"
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.image || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.email)}`}
                        alt={user.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-600"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                          isAdmin ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
                        <span className="truncate max-w-[120px]">{user.name}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="text-[10px] leading-tight">
                        {isAdmin ? (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> แอดมิน
                          </span>
                        ) : (
                          <span className="text-emerald-400 flex items-center gap-0.5">
                            <UserCheck className="w-2.5 h-2.5" /> ผู้ใช้ทั่วไป
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 bg-slate-950/80 px-2 py-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-medium ${
                  isActive
                    ? "text-rose-400 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[11px]">{link.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Account Switcher Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">สลับประเภทบัญชีผู้ใช้</h3>
                  <p className="text-xs text-slate-400">เลือกบัญชีแอดมิน หรือลงชื่อเข้าใช้ด้วย Gmail</p>
                </div>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Admin */}
              <button
                onClick={handleAdminSwitch}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 hover:bg-amber-500/20 text-left transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-base">
                    👑
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">สลับเป็น บัญชีแอดมิน</div>
                    <div className="text-[11px] text-amber-300 font-medium">เข้าใช้งานในฐานะผู้ดูแลระบบ</div>
                  </div>
                </div>
              </button>

              {/* Option 2: Gmail Login */}
              <form onSubmit={handleGmailSwitch} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>เข้าสู่ระบบด้วย Gmail บัญชีทั่วไป:</span>
                </div>

                <input
                  type="text"
                  placeholder="example@gmail.com"
                  value={gmailInput}
                  onChange={(e) => setGmailInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <input
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                {errorMessage && (
                  <p className="text-[11px] text-red-400 font-semibold">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  เข้าสู่ระบบด้วย Gmail นี้
                </button>
              </form>
            </div>

            {user && (
              <button
                onClick={() => {
                  logout();
                  setShowSwitchModal(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors pt-2 border-t border-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>ออกจากระบบ</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
