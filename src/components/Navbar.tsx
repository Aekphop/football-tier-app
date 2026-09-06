"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import UserProfileModal from "@/components/UserProfileModal";
import PlayerCompareModal from "@/components/PlayerCompareModal";
import { CandidateTierResult } from "@/types";
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
  User,
  Swords,
  Edit3,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, role, isAdmin, logout } = useAuth();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [allPlayersForCompare, setAllPlayersForCompare] = useState<CandidateTierResult[]>([]);

  const navLinks = [
    { href: "/", label: "หน้าแรก", icon: Radio },
    { href: "/vote", label: "โหวตคะแนน", icon: Vote },
    { href: "/tier-list", label: "สรุป Tier List", icon: Trophy },
    ...(isAdmin
      ? [{ href: "/admin", label: "ระบบจัดการ (Admin)", icon: Settings }]
      : []),
  ];

  const handleOpenCompare = async () => {
    try {
      const res = await fetch("/api/tier-list");
      const json = await res.json();
      if (json.success && json.data?.rankings) {
        setAllPlayersForCompare(json.data.rankings);
        setShowCompareModal(true);
      }
    } catch (e) {
      console.error(e);
    }
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

              {/* Compare Spider Chart Button */}
              <button
                onClick={handleOpenCompare}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all border border-amber-500/30"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>เปรียบเทียบผู้เล่น 2 คน</span>
              </button>
            </nav>

            {/* User Profile / Menu */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowProfileModal(true)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all text-left group"
                    title="แก้ไขโปรไฟล์ส่วนตัว"
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.image || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.email)}`}
                        alt={user.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.email)}`;
                        }}
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
                        {user.number && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold border border-amber-500/30">
                            #{user.number}
                          </span>
                        )}
                        <Edit3 className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors" />
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

                  <button
                    onClick={logout}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
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

          <button
            onClick={handleOpenCompare}
            className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg text-xs font-medium text-amber-400"
          >
            <Swords className="w-4 h-4" />
            <span className="text-[11px]">เปรียบเทียบ</span>
          </button>
        </div>
      </header>

      {/* User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {/* Player Compare Radar Modal */}
      {showCompareModal && (
        <PlayerCompareModal
          allPlayers={allPlayersForCompare}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </>
  );
}
