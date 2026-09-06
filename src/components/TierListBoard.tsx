"use client";

import React, { useState } from "react";
import { CandidateTierResult, TierListSummary, TierType } from "@/types";
import { getTierInfo } from "@/lib/tierCalculator";
import { useAuth } from "@/lib/auth-context";
import PlayerRadarModal from "./PlayerRadarModal";
import TierListCanvasExport from "./TierListCanvasExport";
import {
  Trophy,
  Sparkles,
  Search,
  Filter,
  BarChart2,
  Lock,
  ShieldCheck,
} from "lucide-react";

interface TierListBoardProps {
  summary: TierListSummary;
  settingsTitle?: string;
}

export default function TierListBoard({ summary, settingsTitle }: TierListBoardProps) {
  const { isAdmin } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<CandidateTierResult | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("ALL");

  const tierKeys: TierType[] = ["S", "A", "B", "C"];

  const positions = [
    "ALL",
    ...Array.from(
      new Set(
        summary.rankings
          .map((r) => r.candidate.position?.split(" ")[0])
          .filter(Boolean) as string[]
      )
    ),
  ];

  const filterCandidate = (res: CandidateTierResult) => {
    const matchesSearch =
      searchQuery === "" ||
      res.candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.candidate.nickname &&
        res.candidate.nickname.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPos =
      selectedPosition === "ALL" ||
      (res.candidate.position && res.candidate.position.includes(selectedPosition));

    return matchesSearch && matchesPos;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>ตารางสรุปผล TIER LIST</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            จัดอันดับจากค่าเฉลี่ย 7 หมวด 36 ข้อย่อย (คะแนนเต็ม 180) • ผู้เล่นทั้งหมด{" "}
            {summary.totalCandidates} คน • ผู้โหวต {summary.totalVoters} คน
          </p>
        </div>

        {/* Export Button - ONLY VISIBLE & ACCESSIBLE BY ADMIN */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin ? (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-rose-600/25 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>สร้างรูปภาพ Tier (PNG) [สิทธิ์ Admin]</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>สร้างรูปภาพได้เฉพาะแอดมิน (ฉัน)</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้เล่น หรือ ชื่อเล่น..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        {positions.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50"
            >
              {positions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos === "ALL" ? "ทุกตำแหน่ง (All Positions)" : pos}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tier Rows */}
      <div className="space-y-4">
        {tierKeys.map((tier) => {
          const tierInfo = getTierInfo(tier);
          const playersInTier = (summary.tiers[tier] || []).filter(filterCandidate);

          return (
            <div
              key={tier}
              className={`rounded-2xl border ${tierInfo.borderColor} ${tierInfo.bgGlow} overflow-hidden shadow-xl transition-all`}
            >
              <div className="flex flex-col md:flex-row min-h-[160px]">
                {/* Left Tier Header */}
                <div
                  className={`md:w-48 p-4 sm:p-5 flex flex-col justify-center items-center text-center bg-gradient-to-br ${tierInfo.headerGradient} text-white shrink-0 shadow-lg`}
                >
                  <span className="text-3xl sm:text-4xl font-black tracking-wider drop-shadow-md">
                    TIER {tier}
                  </span>
                  <span className="text-xs font-bold text-white/90 mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                    {tierInfo.range}
                  </span>
                  <span className="text-[11px] text-white/80 mt-1">
                    {tierInfo.description}
                  </span>
                  <span className="text-xs font-semibold text-white/90 mt-2">
                    ({playersInTier.length} คน)
                  </span>
                </div>

                {/* Right Player Badges Grid / Row */}
                <div className="flex-1 p-3 sm:p-4 bg-slate-950/70 flex flex-wrap gap-3 items-center min-h-[140px]">
                  {playersInTier.length === 0 ? (
                    <div className="w-full text-center py-6 text-slate-400 text-sm italic">
                      ไม่มีผู้เล่นในระดับ {tierInfo.name}
                    </div>
                  ) : (
                    playersInTier.map((player) => (
                      <div
                        key={player.candidate.id}
                        onClick={() => setSelectedPlayer(player)}
                        className="group relative flex flex-col items-center bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-white/30 rounded-2xl p-3 w-[130px] sm:w-[145px] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                      >
                        {/* Overall Rank badge */}
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-slate-950/90 border border-slate-700 text-[10px] font-black text-amber-400">
                          #{player.overallRank}
                        </div>

                        {/* Player Avatar */}
                        <div className="relative mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={player.candidate.avatarUrl}
                            alt={player.candidate.name}
                            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full object-cover ring-2 ring-slate-600 group-hover:ring-rose-400 transition-all shadow-md"
                          />
                        </div>

                        {/* Player Name */}
                        <div className="mt-2 text-center w-full">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-rose-300 transition-colors">
                            {player.candidate.nickname || player.candidate.name.split(" ")[0]}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {player.candidate.name}
                          </p>
                        </div>

                        {/* Total Score Badge */}
                        <div
                          className={`mt-2 w-full py-1 rounded-lg text-center text-xs font-black text-white shadow-inner bg-gradient-to-r ${tierInfo.headerGradient}`}
                        >
                          {player.totalScore.toFixed(1)} คะแนน
                        </div>

                        {/* Hover Quick Action Indicator */}
                        <div className="mt-1 text-[10px] text-slate-400 group-hover:text-slate-200 flex items-center gap-0.5 transition-colors">
                          <BarChart2 className="w-3 h-3 text-rose-400" />
                          <span>ดูกราฟสถิติ</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Radar Stats Modal */}
      {selectedPlayer && (
        <PlayerRadarModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      {/* High-Res Image Export Modal (Admin Only) */}
      {showExportModal && isAdmin && (
        <TierListCanvasExport
          summary={summary}
          settingsTitle={settingsTitle}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
