"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Candidate, SystemSettings, VoteRecord } from "@/types";
import { useAuth } from "@/lib/auth-context";
import CountdownTimer from "@/components/CountdownTimer";
import PasscodeGateModal from "@/components/PasscodeGateModal";
import {
  Vote,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
  Lock,
  UserX,
  Eye,
  LogIn,
  KeyRound,
  ShieldX,
} from "lucide-react";

export default function VoteSelectPage() {
  const { user, isApproved, isAdmin } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [userVotes, setUserVotes] = useState<VoteRecord[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [status, setStatus] = useState<{ isOpen: boolean; reason: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Passcode verification state in session
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [targetCandidateId, setTargetCandidateId] = useState<string | null>(null);

  useEffect(() => {
    // Check if passcode was already entered in sessionStorage
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("voting_passcode_unlocked");
      if (stored === "true") {
        setIsPasscodeUnlocked(true);
      }
    }

    const loadData = async () => {
      try {
        const [candRes, settingsRes, votesRes] = await Promise.all([
          fetch("/api/candidates"),
          fetch("/api/admin/settings"),
          user ? fetch(`/api/vote?userId=${user.id}`) : fetch("/api/vote"),
        ]);

        const candData = await candRes.json();
        const settingsData = await settingsRes.json();
        const votesData = await votesRes.json();

        if (candData.success) setCandidates(candData.data);
        if (settingsData.success) {
          setSettings(settingsData.data);
          setStatus(settingsData.status);
        }
        if (votesData.success && user) {
          const myVotes = Array.isArray(votesData.data)
            ? votesData.data.filter((v: VoteRecord) => v.userId === user.id || v.userEmail === user.email)
            : votesData.data ? [votesData.data] : [];
          setUserVotes(myVotes);
        }
      } catch (err) {
        console.error("Vote page load error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handlePasscodeSuccess = (enteredCode: string) => {
    setIsPasscodeUnlocked(true);
    setShowPasscodeModal(false);
    sessionStorage.setItem("voting_passcode_unlocked", "true");
    sessionStorage.setItem("current_voting_passcode", enteredCode);
  };

  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nickname && c.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Check if voter is restricted from voting for this candidate (Admin Matrix)
  const isRestrictedFrom = (candId: string, candEmail?: string, candName?: string) => {
    if (!user) return false;
    const cleanUser = user.email.toLowerCase().trim();
    const restrictions = settings?.votingRestrictions || {};
    const forbiddenList = restrictions[cleanUser] || [];

    if (forbiddenList.includes(candId)) return true;

    // Self-voting check
    if (settings?.preventSelfVoting) {
      if (candEmail && candEmail.toLowerCase().trim() === cleanUser) return true;
      if (candName && user.name && user.name.includes(candName)) return true;
    }

    return false;
  };

  return (
    <div className="space-y-6">
      {/* Passcode Gate Modal */}
      <PasscodeGateModal
        isOpen={showPasscodeModal}
        onSuccess={handlePasscodeSuccess}
        onCancel={() => setShowPasscodeModal(false)}
      />

      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">เลือกผู้เล่นเพื่อทำการโหวต</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                ประเมินทักษะ 7 หมวด 36 ข้อย่อย (1 - 5 คะแนน) • <strong className="text-amber-400">ต้องใส่รหัสผ่านโหวต & กติกากำหนดโดยแอดมิน</strong>
              </p>
            </div>
          </div>

          {/* Passcode status pill */}
          <div>
            {isPasscodeUnlocked ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                <KeyRound className="w-3.5 h-3.5" /> ปลดล็อครหัสผ่านแล้ว ✓
              </span>
            ) : (
              <button
                onClick={() => setShowPasscodeModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all"
              >
                <KeyRound className="w-3.5 h-3.5" /> คลิกกรอกรหัสผ่านเพื่อเริ่มโหวต
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth & Passcode Reminder */}
      {!user ? (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogIn className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">กรุณาเข้าสู่ระบบก่อนทำการโหวต</div>
              <div className="text-xs text-amber-200/80">ระบบเปิดให้โหวตเฉพาะสมาชิกที่เข้าสู่ระบบและได้รับอนุมัติแล้วเท่านั้น</div>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shrink-0"
          >
            เข้าสู่ระบบทันที
          </Link>
        </div>
      ) : !isPasscodeUnlocked ? (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-sm font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <KeyRound className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">ต้องใส่รหัสผ่านที่แอดมินตั้งถึงจะเริ่มโหวตได้</div>
              <div className="text-xs text-amber-200/80">กรุณากรอกรหัสผ่าน (Passcode) ที่ได้รับจากแอดมิน (ฉัน)</div>
            </div>
          </div>
          <button
            onClick={() => setShowPasscodeModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shrink-0 shadow-lg shadow-amber-500/20"
          >
            ใส่รหัสผ่านเดี๋ยวนี้
          </button>
        </div>
      ) : null}

      {/* Countdown Timer with Thai Calendar */}
      <CountdownTimer settings={settings} status={status} />

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้เล่นที่ต้องการโหวต..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
        />
      </div>

      {/* Candidate Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-sm">กำลังโหลดรายชื่อผู้เล่น...</div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-16 glass-panel rounded-2xl text-slate-400 text-sm">
          ไม่พบรายชื่อผู้เล่น
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCandidates.map((candidate) => {
            const userVote = userVotes.find((v) => v.candidateId === candidate.id);
            const hasVoted = Boolean(userVote && userVote.scores && Object.keys(userVote.scores).length > 0);
            const ratedCount = userVote ? Object.keys(userVote.scores || {}).length : 0;

            const isRestricted = isRestrictedFrom(candidate.id, candidate.userEmail, candidate.name);

            return (
              <div
                key={candidate.id}
                className={`glass-card rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 group ${
                  isRestricted
                    ? "border-red-500/30 bg-slate-950/60 opacity-80"
                    : hasVoted
                    ? "border-emerald-500/30 bg-slate-900/70"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={candidate.avatarUrl}
                    alt={candidate.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-700 group-hover:ring-rose-500/50 transition-all shrink-0 shadow-md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-white truncate">{candidate.name}</h3>
                    </div>
                    {candidate.nickname && (
                      <p className="text-xs text-amber-400 font-semibold truncate">
                        ชื่อเล่น: {candidate.nickname} {candidate.number && `(#${candidate.number})`}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 truncate">
                      {candidate.position || "Player"} {candidate.team && `• ${candidate.team}`}
                    </p>

                    {/* Voted / Restriction Status Badge */}
                    <div className="mt-2">
                      {isRestricted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          <ShieldX className="w-3 h-3" /> แอดมินตั้งห้ามคุณโหวตคนนี้
                        </span>
                      ) : hasVoted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <Lock className="w-3 h-3" /> โหวตแล้ว ({ratedCount}/36 ข้อ) ล็อคผลถาวร
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          ยังไม่ได้โหวต (0/36)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                {isRestricted ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold bg-red-950/40 text-red-400 border border-red-500/30 cursor-not-allowed opacity-70"
                  >
                    <ShieldX className="w-4 h-4" />
                    <span>แอดมินกำหนดห้ามโหวตคนนี้</span>
                  </button>
                ) : hasVoted ? (
                  <Link
                    href={`/vote/${candidate.id}`}
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>ดูคะแนนที่ส่งไปแล้ว (ล็อคผลโหวต)</span>
                  </Link>
                ) : !isPasscodeUnlocked ? (
                  <button
                    onClick={() => setShowPasscodeModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition-all"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>ใส่รหัสผ่านเพื่อเริ่มโหวต</span>
                  </button>
                ) : (
                  <Link
                    href={`/vote/${candidate.id}`}
                    className="w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white shadow-lg shadow-rose-600/20 transition-all"
                  >
                    <Vote className="w-4 h-4" />
                    <span>เริ่มโหวตคะแนน 36 ข้อ</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
