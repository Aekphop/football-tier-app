"use client";

import React from "react";
import { SubCriteria } from "@/types";
import { SCORE_LABELS } from "@/data/criteria";
import { Info, Check } from "lucide-react";

interface VotingCardProps {
  criterion: SubCriteria;
  index: number;
  selectedScore?: number;
  onSelectScore: (score: number) => void;
  disabled?: boolean;
}

export default function VotingCard({
  criterion,
  index,
  selectedScore,
  onSelectScore,
  disabled = false,
}: VotingCardProps) {
  const scores = [1, 2, 3, 4, 5];

  return (
    <div
      className={`glass-card rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
        selectedScore
          ? "border-rose-500/40 bg-slate-900/80 shadow-md shadow-rose-950/20"
          : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        {/* Criterion Title & Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center border border-slate-700">
              {index + 1}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
              {criterion.nameEn}
            </h4>
            <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
              {criterion.nameTh}
            </span>
          </div>
          {criterion.description && (
            <p className="text-xs text-slate-400 pl-8 flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{criterion.description}</span>
            </p>
          )}
        </div>

        {/* Selected Score summary badge */}
        {selectedScore ? (
          <div className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shrink-0 animate-in zoom-in-90 duration-150 bg-slate-950/80 border-slate-700">
            <span className="text-slate-400">เลือก:</span>
            <span className="text-amber-400 font-extrabold">{selectedScore} คะแนน</span>
            <span className="text-slate-300 font-normal">
              ({SCORE_LABELS[selectedScore]?.labelTh})
            </span>
          </div>
        ) : (
          <span className="self-start md:self-auto text-[11px] text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-800">
            ยังไม่ได้ให้คะแนน
          </span>
        )}
      </div>

      {/* 5 Circular Voting Buttons with Numbers and Labels below */}
      <div className="pt-2 border-t border-slate-800/60">
        <div className="grid grid-cols-5 gap-2 sm:gap-4 max-w-2xl mx-auto">
          {scores.map((score) => {
            const isSelected = selectedScore === score;
            const meta = SCORE_LABELS[score];

            // Specific active styles per score tier
            let activeColorClass = "bg-rose-600 text-white border-rose-400 shadow-rose-600/50";
            if (score === 1) activeColorClass = "bg-red-600 text-white border-red-400 shadow-red-600/50";
            if (score === 2) activeColorClass = "bg-orange-600 text-white border-orange-400 shadow-orange-600/50";
            if (score === 3) activeColorClass = "bg-amber-600 text-white border-amber-400 shadow-amber-600/50";
            if (score === 4) activeColorClass = "bg-emerald-600 text-white border-emerald-400 shadow-emerald-600/50";
            if (score === 5) activeColorClass = "bg-cyan-600 text-white border-cyan-400 shadow-cyan-600/50";

            return (
              <button
                key={score}
                type="button"
                disabled={disabled}
                onClick={() => onSelectScore(score)}
                className={`group flex flex-col items-center justify-center p-2 rounded-2xl transition-all ${
                  disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                } ${
                  isSelected
                    ? "bg-slate-800/90 scale-105"
                    : "hover:bg-slate-800/40 hover:scale-102"
                }`}
              >
                {/* Circular Button */}
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm sm:text-base font-black transition-all shadow-md ${
                    isSelected
                      ? `${activeColorClass} shadow-lg ring-2 ring-white/30`
                      : "bg-slate-800 text-slate-300 border border-slate-700 group-hover:border-slate-500 group-hover:bg-slate-700"
                  }`}
                >
                  {score}
                </div>

                {/* Thai Label below circle */}
                <span
                  className={`mt-2 text-xs sm:text-xs font-semibold text-center leading-tight transition-colors ${
                    isSelected ? "text-white font-bold" : "text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {meta.labelTh}
                </span>

                {/* Subtitle / Meaning */}
                <span className="hidden sm:block text-[10px] text-slate-400 text-center leading-tight">
                  {meta.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
