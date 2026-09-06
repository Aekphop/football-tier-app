"use client";

import React, { useEffect, useState } from "react";
import { Clock, Lock, Unlock, AlertCircle, Sparkles } from "lucide-react";
import { SystemSettings } from "@/types";

interface CountdownTimerProps {
  settings: SystemSettings | null;
  status: { isOpen: boolean; reason: string } | null;
  compact?: boolean;
  sticky?: boolean;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  type: "start" | "end" | "none";
}

export function formatThaiDateTime(isoString?: string | null): string {
  if (!isoString) return "ไม่จำกัดเวลา (เปิดตลอด)";
  try {
    const d = new Date(isoString);
    const thaiMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const day = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear() + 543; // พ.ศ.
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} พ.ศ. ${year} เวลา ${hours}:${minutes} น.`;
  } catch (e) {
    return isoString;
  }
}

export default function CountdownTimer({
  settings,
  status,
  compact = false,
  sticky = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    type: "none",
  });

  useEffect(() => {
    if (!settings) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      let targetTime: number | null = null;
      let type: "start" | "end" | "none" = "none";

      if (settings.votingStartTime && now < new Date(settings.votingStartTime).getTime()) {
        targetTime = new Date(settings.votingStartTime).getTime();
        type = "start";
      } else if (settings.votingEndTime) {
        targetTime = new Date(settings.votingEndTime).getTime();
        type = "end";
      }

      if (!targetTime) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false, type: "none" });
        return;
      }

      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, type });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds, isExpired: false, type });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  if (!settings) return null;

  const isLocked = settings.isLocked;
  const isOpen = status ? status.isOpen : !isLocked && !timeLeft.isExpired;

  // Sticky / Bar mode for voting screen
  if (sticky) {
    return (
      <div className="sticky top-16 z-30 bg-slate-950/95 backdrop-blur-md border-y border-amber-500/40 py-2.5 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLocked ? "bg-red-400" : isOpen ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isLocked ? "bg-red-500" : isOpen ? "bg-emerald-500" : "bg-amber-500"}`} />
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">
              {isLocked ? "🔒 โหวตถูกล็อคโดยแอดมิน" : isOpen ? "⚡ ระบบเปิดรับโหวต (เวลาไทย)" : "🛑 หมดเวลาโหวตแล้ว"}
            </span>
          </div>

          {/* Prominent Eye-Catching Countdown Digits */}
          {timeLeft.type !== "none" && !isLocked && !timeLeft.isExpired ? (
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono">
              <span className="text-xs text-amber-300 font-sans font-semibold mr-1">เหลือเวลา:</span>
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400 font-black text-sm sm:text-base">
                {String(timeLeft.days * 24 + timeLeft.hours).padStart(2, "0")} ชม.
              </div>
              <span className="text-amber-400 font-bold">:</span>
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-400 font-black text-sm sm:text-base">
                {String(timeLeft.minutes).padStart(2, "0")} น.
              </div>
              <span className="text-amber-400 font-bold">:</span>
              <div className="px-2.5 py-1 rounded-lg bg-amber-500/30 border border-amber-400 text-amber-300 font-black text-sm sm:text-base animate-pulse">
                {String(timeLeft.seconds).padStart(2, "0")} วิ
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              สิ้นสุด: {formatThaiDateTime(settings.votingEndTime)}
            </span>
          )}
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
        {isLocked ? (
          <span className="flex items-center gap-1.5 text-red-400 font-semibold">
            <Lock className="w-3.5 h-3.5" /> โหวตถูกล็อค
          </span>
        ) : isOpen ? (
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            เปิดรับโหวต
            {timeLeft.type === "end" && !timeLeft.isExpired && (
              <span className="text-amber-300 font-mono font-bold ml-1">
                ({timeLeft.days * 24 + timeLeft.hours}ชม. {timeLeft.minutes}น. {timeLeft.seconds}วิ)
              </span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Clock className="w-3.5 h-3.5" /> ปิดรับโหวตแล้ว
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
      {/* Header with status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl border ${
              isLocked
                ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10"
                : isOpen
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                : "bg-amber-500/20 text-amber-400 border-amber-500/40"
            }`}
          >
            {isLocked ? (
              <Lock className="w-6 h-6" />
            ) : isOpen ? (
              <Unlock className="w-6 h-6" />
            ) : (
              <Clock className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
              <span>เวลาการเปิดรับโหวต (เวลาประเทศไทย)</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                ปฏิทินไทย พ.ศ.
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {status?.reason || (isOpen ? "ระบบกำลังเปิดรับโหวตในขณะนี้" : "ปิดรับการโหวต")}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center">
          {isLocked ? (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black shadow-sm shadow-red-500/20">
              <Lock className="w-3.5 h-3.5" /> ล็อคระบบแล้ว (ADMIN LOCKED)
            </span>
          ) : isOpen ? (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black shadow-sm shadow-emerald-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              เปิดรับโหวตอยู่ (VOTING ACTIVE)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold">
              <AlertCircle className="w-3.5 h-3.5" /> ปิดรับการโหวต (CLOSED)
            </span>
          )}
        </div>
      </div>

      {/* Prominent Eye-Catching Countdown Digits */}
      {timeLeft.type !== "none" && !isLocked && !timeLeft.isExpired && (
        <div className="pt-3 border-t border-slate-800/80">
          <div className="text-xs font-bold text-amber-400 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>
              {timeLeft.type === "start"
                ? "⚡ นับถอยหลังก่อนเปิดรับโหวต:"
                : "⚡ นับถอยหลังก่อนหมดเวลาโหวต:"}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg">
            {[
              { label: "วัน (Days)", val: timeLeft.days },
              { label: "ชั่วโมง (Hours)", val: timeLeft.hours },
              { label: "นาที (Minutes)", val: timeLeft.minutes },
              { label: "วินาที (Seconds)", val: timeLeft.seconds },
            ].map((unit, idx) => (
              <div
                key={idx}
                className="bg-slate-950/90 border-2 border-amber-500/30 rounded-2xl p-3 sm:p-4 text-center shadow-xl shadow-black/40 relative overflow-hidden group hover:border-amber-400 transition-all"
              >
                <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                  {String(unit.val).padStart(2, "0")}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-semibold mt-1">
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thai Calendar Schedule Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="text-slate-400">เวลาเริ่ม: </span>
            <span className="text-white font-bold">{formatThaiDateTime(settings.votingStartTime)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <Clock className="w-4 h-4 text-rose-400 shrink-0" />
          <div>
            <span className="text-slate-400">เวลาสิ้นสุด: </span>
            <span className="text-white font-bold">{formatThaiDateTime(settings.votingEndTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
