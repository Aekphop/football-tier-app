"use client";

import React from "react";
import { CandidateTierResult } from "@/types";
import { CATEGORIES, ALL_SUB_CRITERIA, SCORE_LABELS } from "@/data/criteria";
import { getTierInfo } from "@/lib/tierCalculator";
import { X, Award, BarChart3, Star, ShieldCheck, CheckCircle2 } from "lucide-react";

interface PlayerRadarModalProps {
  player: CandidateTierResult | null;
  onClose: () => void;
}

export default function PlayerRadarModal({ player, onClose }: PlayerRadarModalProps) {
  if (!player) return null;

  const tierInfo = getTierInfo(player.tier);

  // Radar Chart Mathematics for 7 Axes
  const numAxes = CATEGORIES.length; // 7
  const size = 320;
  const center = size / 2;
  const radius = size * 0.38;

  // Compute points for the 7 categories
  const radarPoints = CATEGORIES.map((cat, i) => {
    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
    const catAvg = player.categoryAverages.find((c) => c.categoryId === cat.id);
    const scorePct = catAvg ? catAvg.percentage / 100 : 0;
    const r = radius * Math.max(0.15, scorePct);
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle, cat, avg: catAvg };
  });

  const polygonPath = radarPoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Background concentric grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-6 p-5 sm:p-7 relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Player Header Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-800">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={player.candidate.avatarUrl}
              alt={player.candidate.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-2 ring-slate-700 shadow-xl"
            />
            <div
              className={`absolute -bottom-2.5 -right-2.5 px-3 py-1 rounded-xl text-xs font-black border shadow-lg ${tierInfo.badgeColor}`}
            >
              Tier {player.tier}
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{player.candidate.name}</h2>
              {player.candidate.nickname && (
                <span className="text-sm font-bold text-amber-400">({player.candidate.nickname})</span>
              )}
            </div>
            <p className="text-sm text-slate-300 font-medium">
              {player.candidate.position || "Player"} {player.candidate.team && `• ${player.candidate.team}`}{" "}
              {player.candidate.number && `• เบอร์ ${player.candidate.number}`}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              <div className="px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
                <span className="text-slate-400">คะแนนรวม: </span>
                <span className="text-white font-extrabold text-sm">{player.totalScore}</span>
                <span className="text-slate-400"> / 180</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
                <span className="text-slate-400">อันดับโดยรวม: </span>
                <span className="text-amber-400 font-bold">#{player.overallRank}</span>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
                <span className="text-slate-400">ผู้โหวต: </span>
                <span className="text-emerald-400 font-bold">{player.voteCount} คน</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Category Radar Chart & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Chart SVG */}
          <div className="lg:col-span-6 flex flex-col items-center bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-rose-400" />
              <span>กราฟใยแมงมุม (Radar Skill Breakdown 7 ด้าน)</span>
            </h3>

            <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center">
              <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
                {/* Concentric Polygons */}
                {gridLevels.map((level, idx) => {
                  const points = CATEGORIES.map((_, i) => {
                    const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                    const r = radius * level;
                    return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
                  }).join(" ");
                  return (
                    <polygon
                      key={idx}
                      points={points}
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="1"
                      strokeDasharray={idx === 4 ? "" : "3,3"}
                    />
                  );
                })}

                {/* Axes Spokes */}
                {CATEGORIES.map((_, i) => {
                  const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Player Skill Polygon with Glow */}
                <polygon
                  points={polygonPath}
                  fill="rgba(244, 63, 94, 0.35)"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  className="filter drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                />

                {/* Data Points on vertices */}
                {radarPoints.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#fb7185"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Axis Labels */}
                {CATEGORIES.map((cat, i) => {
                  const angle = (Math.PI * 2 / numAxes) * i - Math.PI / 2;
                  const labelRadius = radius + 24;
                  const lx = center + labelRadius * Math.cos(angle);
                  const ly = center + labelRadius * Math.sin(angle);
                  const avg = player.categoryAverages.find((c) => c.categoryId === cat.id);

                  return (
                    <text
                      key={i}
                      x={lx}
                      y={ly}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[10px] font-semibold fill-slate-300"
                    >
                      {cat.nameTh.split(" ")[0]} ({avg?.averageOutOf5 || 0})
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* 7 Category Progress Cards */}
          <div className="lg:col-span-6 space-y-2.5">
            <h3 className="text-sm font-bold text-slate-200 mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>สรุปคะแนนเฉลี่ยรายหมวด (เต็ม 5)</span>
            </h3>

            {player.categoryAverages.map((cat) => (
              <div
                key={cat.categoryId}
                className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">
                    {cat.categoryId}. {cat.categoryName}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-400 text-sm">{cat.averageOutOf5}</span>
                    <span className="text-slate-400 text-[11px]">/ 5</span>
                    <span className="text-slate-400 text-[10px]">({cat.totalScore} คะแนน)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 36 Sub-criteria Detailed Average Table */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>รายละเอียดค่าเฉลี่ยทั้ง 36 ข้อย่อย</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-slate-950/60 rounded-2xl p-3.5 border border-slate-800/80 space-y-2"
              >
                <div className="text-xs font-bold text-rose-400 pb-1 border-b border-slate-800">
                  หมวด {cat.id}: {cat.nameTh}
                </div>
                <div className="space-y-1.5">
                  {cat.subCriteria.map((sub) => {
                    const avg = player.subCriteriaAverages[sub.id] || 0;
                    return (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between text-[11px] py-0.5"
                      >
                        <span className="text-slate-300 truncate pr-2" title={sub.description}>
                          {sub.nameTh}
                        </span>
                        <span
                          className={`font-mono font-bold px-1.5 py-0.2 rounded ${
                            avg >= 4.5
                              ? "bg-cyan-500/20 text-cyan-400"
                              : avg >= 3.5
                              ? "bg-emerald-500/20 text-emerald-400"
                              : avg >= 2.5
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {avg.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
