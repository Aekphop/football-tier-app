"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { TierListSummary, SystemSettings } from "@/types";
import TierListBoard from "@/components/TierListBoard";
import CountdownTimer from "@/components/CountdownTimer";
import { Trophy, Sparkles, Loader2, RefreshCw } from "lucide-react";

export default function TierListPage() {
  const [summary, setSummary] = useState<TierListSummary | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [status, setStatus] = useState<{ isOpen: boolean; reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/tier-list");
      const json = await res.json();
      if (json.success) {
        setSummary(json.data);
        setSettings(json.settings);
        setStatus(json.status);
      }
    } catch (err) {
      console.error("Tier list fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-sm font-semibold">กำลังคำนวณและประมวลผล Tier List จากผลโหวต...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white shadow-lg shadow-amber-500/20">
            <Trophy className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {settings?.title || "ตารางสรุปผล TIER LIST"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              {settings?.description || "สรุปผลค่าเฉลี่ย 7 หมวด 36 ข้อย่อย (คะแนนเต็ม 180)"}
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>รีเฟรชผลคะแนน</span>
        </button>
      </div>

      {/* Countdown Timer Widget */}
      <CountdownTimer settings={settings} status={status} />

      {/* Main Tier List Board */}
      {summary ? (
        <TierListBoard summary={summary} settingsTitle={settings?.title} />
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl text-slate-400 text-sm">
          ยังไม่มีข้อมูลการจัด Tier
        </div>
      )}
    </div>
  );
}
