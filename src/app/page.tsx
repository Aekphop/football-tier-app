"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CandidateTierResult, SystemSettings, TierListSummary } from "@/types";
import CountdownTimer from "@/components/CountdownTimer";
import PlayerRadarModal from "@/components/PlayerRadarModal";
import { getTierInfo } from "@/lib/tierCalculator";
import {
  Trophy,
  Vote,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Zap,
  Activity,
  Flame,
  Award,
  Users,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const [summary, setSummary] = useState<TierListSummary | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [status, setStatus] = useState<{ isOpen: boolean; reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<CandidateTierResult | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tierRes, settingsRes] = await Promise.all([
          fetch("/api/tier-list"),
          fetch("/api/admin/settings"),
        ]);

        const tierData = await tierRes.json();
        const settingsData = await settingsRes.json();

        if (tierData.success) {
          setSummary(tierData.data);
        }
        if (settingsData.success) {
          setSettings(settingsData.data);
          setStatus(settingsData.status);
        }
      } catch (err) {
        console.error("Home fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>ระบบโหวตประเมินทักษะและจัด Tier List ฟุตบอล</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            ประเมินทักษะนักเตะ <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 bg-clip-text text-transparent">
              7 หมวด 36 ข้อย่อย
            </span>{" "}
            จัด Tier อัตโนมัติ
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            โหวตให้คะแนน 1 - 5 คะแนนในแต่ละข้อย่อย ระบบจะนำคะแนนโหวตทั้งหมดมาหาค่าเฉลี่ย
            และรวมคะแนนสุทธิ (เต็ม 180 คะแนน) เพื่อจัดลงใน <strong>Tier S, A, B, C</strong>{" "}
            พร้อมสร้างรูปภาพ Tier List คุณภาพสูงได้ทันที
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/vote"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-rose-600/30 transition-all hover:scale-102"
            >
              <Vote className="w-4 h-4" />
              <span>เริ่มโหวตคะแนนผู้เล่น</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/tier-list"
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm border border-slate-700 shadow-lg transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>ดูผลสรุป Tier List</span>
            </Link>
          </div>
        </div>

        {/* 4 Tier Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-6 border-t border-slate-800/80">
          {[
            { tier: "TIER S", range: "136 - 180 คะแนน", color: "text-red-400", border: "border-red-500/30", bg: "bg-red-500/10" },
            { tier: "TIER A", range: "91 - 135 คะแนน", color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
            { tier: "TIER B", range: "46 - 90 คะแนน", color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
            { tier: "TIER C", range: "0 - 45 คะแนน", color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border ${item.border} ${item.bg} text-center space-y-0.5`}
            >
              <div className={`text-base font-black ${item.color}`}>{item.tier}</div>
              <div className="text-[11px] text-slate-300 font-semibold">{item.range}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Countdown Timer and Voting Status Bar */}
      <CountdownTimer settings={settings} status={status} />

      {/* Featured Candidates / Current Leaderboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">
              อันดับคะแนนผู้เล่นล่าสุด (Live Leaderboard)
            </h2>
          </div>
          <Link
            href="/tier-list"
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <span>ดูทั้งหมดใน Tier List</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 text-sm">กำลังโหลดข้อมูลผู้เล่น...</div>
        ) : summary && summary.rankings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.rankings.map((player) => {
              const tierInfo = getTierInfo(player.tier);
              return (
                <div
                  key={player.candidate.id}
                  className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={player.candidate.avatarUrl}
                        alt={player.candidate.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-700 group-hover:ring-rose-500/50 transition-all"
                      />
                      <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-md bg-slate-950 text-[10px] font-black text-amber-400 border border-slate-800">
                        #{player.overallRank}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-white truncate">
                          {player.candidate.name}
                        </h3>
                        {player.candidate.nickname && (
                          <span className="text-xs text-amber-400 font-semibold shrink-0">
                            ({player.candidate.nickname})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {player.candidate.position || "Player"} {player.candidate.team && `• ${player.candidate.team}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full border ${tierInfo.badgeColor}`}>
                          Tier {player.tier}
                        </span>
                        <span className="text-xs font-extrabold text-slate-200">
                          {player.totalScore.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">/ 180</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => setSelectedPlayer(player)}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-rose-400" />
                      <span>ดูกราฟสถิติ</span>
                    </button>
                    <Link
                      href={`/vote/${player.candidate.id}`}
                      className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold text-rose-300 transition-colors"
                    >
                      <Vote className="w-3.5 h-3.5" />
                      <span>โหวตคะแนน</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-2xl text-slate-400 text-sm">
            ยังไม่มีรายชื่อผู้เล่นในระบบ
          </div>
        )}
      </div>

      {/* Radar Stats Modal */}
      {selectedPlayer && (
        <PlayerRadarModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
}
