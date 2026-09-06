"use client";

import React, { useState } from "react";
import { CandidateTierResult } from "@/types";
import { CATEGORIES } from "@/data/criteria";
import { getTierInfo } from "@/lib/tierCalculator";
import {
  Swords,
  X,
  Trophy,
  Zap,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";

interface PlayerCompareModalProps {
  allPlayers: CandidateTierResult[];
  initialPlayerA?: CandidateTierResult;
  onClose: () => void;
}

export default function PlayerCompareModal({
  allPlayers,
  initialPlayerA,
  onClose,
}: PlayerCompareModalProps) {
  const [playerAId, setPlayerAId] = useState<string>(
    initialPlayerA?.candidate.id || allPlayers[0]?.candidate.id || ""
  );
  const [playerBId, setPlayerBId] = useState<string>(
    allPlayers.find((p) => p.candidate.id !== (initialPlayerA?.candidate.id || allPlayers[0]?.candidate.id))?.candidate.id || ""
  );

  const playerA = allPlayers.find((p) => p.candidate.id === playerAId);
  const playerB = allPlayers.find((p) => p.candidate.id === playerBId);

  if (!allPlayers || allPlayers.length === 0) return null;

  // Radar chart SVG calculation parameters
  const size = 320;
  const center = size / 2;
  const radius = center - 45;
  const totalCategories = CATEGORIES.length;
  const angleSlice = (Math.PI * 2) / totalCategories;

  // Helper to convert category score (0 - 5) to SVG coordinates
  const getCoordinates = (catIndex: number, score: number) => {
    const angle = angleSlice * catIndex - Math.PI / 2;
    const r = (score / 5) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  const getPointsString = (player?: CandidateTierResult) => {
    if (!player) return "";
    return CATEGORIES.map((cat, idx) => {
      const catAvg = player.categoryAverages.find((c) => c.categoryId === cat.id)?.averageOutOf5 || 0;
      const { x, y } = getCoordinates(idx, catAvg);
      return `${x},${y}`;
    }).join(" ");
  };

  const tierAInfo = playerA ? getTierInfo(playerA.tier) : null;
  const tierBInfo = playerB ? getTierInfo(playerB.tier) : null;

  const totalDiff = playerA && playerB ? playerA.totalScore - playerB.totalScore : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-white text-lg sm:text-xl flex items-center gap-2">
                <span>เปรียบเทียบค่าพลังใยแมงมุม (Player Comparison)</span>
              </h2>
              <p className="text-xs text-slate-400">
                เลือกนักเตะ 2 คน ซ้อนทับใยแมงมุมและเปรียบเทียบจุดเด่นรายหมวด
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Player A Selection (Cyan/Rose Theme) */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border-2 border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block shadow-md" />
                <span>ผู้เล่นคนที่ 1 (ฝ่ายน้ำเงิน)</span>
              </span>
              {playerA && tierAInfo && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tierAInfo.badgeColor}`}>
                  Tier {playerA.tier}
                </span>
              )}
            </div>

            <select
              value={playerAId}
              onChange={(e) => setPlayerAId(e.target.value)}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              {allPlayers.map((p) => (
                <option key={p.candidate.id} value={p.candidate.id} disabled={p.candidate.id === playerBId}>
                  {p.candidate.name} {p.candidate.nickname && `(${p.candidate.nickname})`} - #{p.overallRank} (Tier {p.tier})
                </option>
              ))}
            </select>

            {playerA && (
              <div className="flex items-center gap-3 pt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={playerA.candidate.avatarUrl}
                  alt={playerA.candidate.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-cyan-400 shrink-0"
                />
                <div>
                  <div className="text-sm font-bold text-white">{playerA.candidate.name}</div>
                  <div className="text-xs text-cyan-300 font-extrabold">
                    คะแนนรวม: {playerA.totalScore.toFixed(1)} / 180
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Player B Selection (Amber/Rose Theme) */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-md" />
                <span>ผู้เล่นคนที่ 2 (ฝ่ายสีทอง)</span>
              </span>
              {playerB && tierBInfo && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tierBInfo.badgeColor}`}>
                  Tier {playerB.tier}
                </span>
              )}
            </div>

            <select
              value={playerBId}
              onChange={(e) => setPlayerBId(e.target.value)}
              className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              {allPlayers.map((p) => (
                <option key={p.candidate.id} value={p.candidate.id} disabled={p.candidate.id === playerAId}>
                  {p.candidate.name} {p.candidate.nickname && `(${p.candidate.nickname})`} - #{p.overallRank} (Tier {p.tier})
                </option>
              ))}
            </select>

            {playerB && (
              <div className="flex items-center gap-3 pt-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={playerB.candidate.avatarUrl}
                  alt={playerB.candidate.name}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-400 shrink-0"
                />
                <div>
                  <div className="text-sm font-bold text-white">{playerB.candidate.name}</div>
                  <div className="text-xs text-amber-300 font-extrabold">
                    คะแนนรวม: {playerB.totalScore.toFixed(1)} / 180
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dual Radar Chart & Comparison Matrix */}
        {playerA && playerB && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
            {/* SVG Dual Radar Chart */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 bg-slate-950/70 border border-slate-800 rounded-3xl relative">
              <svg width={size} height={size} className="overflow-visible">
                {/* Background Concentric Webs (1 - 5 Scale) */}
                {[1, 2, 3, 4, 5].map((level) => {
                  const levelPoints = CATEGORIES.map((_, idx) => {
                    const { x, y } = getCoordinates(idx, level);
                    return `${x},${y}`;
                  }).join(" ");

                  return (
                    <polygon
                      key={level}
                      points={levelPoints}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="1"
                      strokeDasharray={level === 5 ? "0" : "2,2"}
                    />
                  );
                })}

                {/* Radar Spoke Lines */}
                {CATEGORIES.map((_, idx) => {
                  const { x, y } = getCoordinates(idx, 5);
                  return (
                    <line
                      key={idx}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Player A Polygon (Cyan) */}
                <polygon
                  points={getPointsString(playerA)}
                  fill="rgba(6, 182, 212, 0.25)"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
                {CATEGORIES.map((cat, idx) => {
                  const catAvg = playerA.categoryAverages.find((c) => c.categoryId === cat.id)?.averageOutOf5 || 0;
                  const { x, y } = getCoordinates(idx, catAvg);
                  return <circle key={`a_${idx}`} cx={x} cy={y} r="4" fill="#06b6d4" />;
                })}

                {/* Player B Polygon (Amber) */}
                <polygon
                  points={getPointsString(playerB)}
                  fill="rgba(245, 158, 11, 0.25)"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  className="transition-all duration-300"
                />
                {CATEGORIES.map((cat, idx) => {
                  const catAvg = playerB.categoryAverages.find((c) => c.categoryId === cat.id)?.averageOutOf5 || 0;
                  const { x, y } = getCoordinates(idx, catAvg);
                  return <circle key={`b_${idx}`} cx={x} cy={y} r="4" fill="#f59e0b" />;
                })}

                {/* Category Labels */}
                {CATEGORIES.map((cat, idx) => {
                  const labelPos = getCoordinates(idx, 5.7);
                  return (
                    <text
                      key={cat.id}
                      x={labelPos.x}
                      y={labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#cbd5e1"
                      className="text-[10px] sm:text-[11px] font-extrabold"
                    >
                      {cat.nameTh}
                    </text>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="flex items-center gap-6 mt-4 pt-3 border-t border-slate-800 text-xs font-bold">
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="w-3 h-3 rounded-full bg-cyan-400" />
                  <span>{playerA.candidate.name}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span>{playerB.candidate.name}</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown & Superiority Table */}
            <div className="lg:col-span-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-rose-400" />
                  <span>สรุปจุดเด่นของแต่ละคนใน 7 หมวด:</span>
                </h3>
              </div>

              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => {
                  const avgA = playerA.categoryAverages.find((c) => c.categoryId === cat.id)?.averageOutOf5 || 0;
                  const avgB = playerB.categoryAverages.find((c) => c.categoryId === cat.id)?.averageOutOf5 || 0;
                  const diff = Math.abs(avgA - avgB);

                  const aIsBetter = avgA > avgB;
                  const isEqual = Math.abs(avgA - avgB) < 0.01;

                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="font-bold text-white min-w-[100px]">
                        {cat.id}. {cat.nameTh}
                      </div>

                      <div className="flex items-center gap-3 font-mono font-extrabold">
                        <span className={aIsBetter ? "text-cyan-400" : "text-slate-400"}>
                          {avgA.toFixed(2)}
                        </span>
                        <span className="text-slate-600">vs</span>
                        <span className={!aIsBetter && !isEqual ? "text-amber-400" : "text-slate-400"}>
                          {avgB.toFixed(2)}
                        </span>
                      </div>

                      {/* Superiority indicator */}
                      <div className="text-right min-w-[140px]">
                        {isEqual ? (
                          <span className="text-[11px] text-slate-400">เท่ากัน</span>
                        ) : aIsBetter ? (
                          <span className="text-[11px] font-bold text-cyan-400 flex items-center justify-end gap-1">
                            <span>{playerA.candidate.name} (+{diff.toFixed(2)})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-400 flex items-center justify-end gap-1">
                            <span>{playerB.candidate.name} (+{diff.toFixed(2)})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Overall Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-400">สรุปคะแนนรวมทั้งหมด 180 คะแนน:</div>
                  <div className="text-sm font-black text-white">
                    {totalDiff > 0 ? (
                      <span className="text-cyan-400">
                        {playerA.candidate.name} เด่นกว่ารวม +{totalDiff.toFixed(1)} คะแนน
                      </span>
                    ) : totalDiff < 0 ? (
                      <span className="text-amber-400">
                        {playerB.candidate.name} เด่นกว่ารวม +{Math.abs(totalDiff).toFixed(1)} คะแนน
                      </span>
                    ) : (
                      <span className="text-slate-300">ทั้งคู่มีคะแนนรวมเท่ากัน</span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-400 block">ส่วนต่างคะแนนรวม</span>
                  <span className="text-lg font-black text-white">{Math.abs(totalDiff).toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
