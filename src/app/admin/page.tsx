"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { Candidate, SystemSettings, User, VoteRecord, WebCustomization } from "@/types";
import { useAuth } from "@/lib/auth-context";
import AdminCandidateModal from "@/components/AdminCandidateModal";
import { formatThaiDateTime } from "@/components/CountdownTimer";
import { ALL_SUB_CRITERIA } from "@/data/criteria";
import {
  Settings,
  Clock,
  Lock,
  Unlock,
  UserPlus,
  Edit2,
  Trash2,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  Save,
  Loader2,
  UserX,
  FileCheck2,
  KeyRound,
  Check,
  X,
  UserCheck,
  ShieldAlert,
  SlidersHorizontal,
  Palette,
  Image as ImageIcon,
  Ban,
  RefreshCw,
  Flame,
  Eye,
  Search,
  FileSpreadsheet,
} from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<VoteRecord[]>([]);
  const [userList, setUserList] = useState<User[]>([]);
  const [status, setStatus] = useState<{ isOpen: boolean; reason: string } | null>(null);

  // Form states for settings
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [votingStartTime, setVotingStartTime] = useState("");
  const [votingEndTime, setVotingEndTime] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [preventSelfVoting, setPreventSelfVoting] = useState(true);
  const [allowEditVote, setAllowEditVote] = useState(false);
  const [votingPasscode, setVotingPasscode] = useState("1234");
  const [requireApproval, setRequireApproval] = useState(true);

  // Web Customization states
  const [customization, setCustomization] = useState<WebCustomization>({
    headerTitle: "Football Skills Tier List 2026",
    headerSubtitle: "ประเมินทักษะนักเตะ 7 หมวด 36 ข้อย่อย จัด Tier อัตโนมัติ",
    themeColor: "rose",
    logoUrl: "",
    bannerImageUrl: "",
    customAnnouncement: "",
  });

  // Voting Restrictions Matrix
  const [restrictions, setRestrictions] = useState<Record<string, string[]>>({});
  const [selectedVoterEmail, setSelectedVoterEmail] = useState<string>("");
  const [restrictionSuccessMessage, setRestrictionSuccessMessage] = useState("");

  // Audit filter state
  const [auditSearch, setAuditSearch] = useState("");
  const [expandedVoteId, setExpandedVoteId] = useState<string | null>(null);

  // UI modal states
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [settingsRes, candRes, votesRes, usersRes, restRes] = await Promise.all([
        fetch("/api/admin/settings"),
        fetch("/api/candidates"),
        fetch("/api/vote"),
        fetch("/api/admin/users"),
        fetch("/api/admin/restrictions"),
      ]);

      const sData = await settingsRes.json();
      const cData = await candRes.json();
      const vData = await votesRes.json();
      const uData = await usersRes.json();
      const rData = await restRes.json();

      if (sData.success) {
        setSettings(sData.data);
        setStatus(sData.status);
        setTitle(sData.data.title || "");
        setDescription(sData.data.description || "");
        setVotingStartTime(sData.data.votingStartTime ? sData.data.votingStartTime.substring(0, 16) : "");
        setVotingEndTime(sData.data.votingEndTime ? sData.data.votingEndTime.substring(0, 16) : "");
        setIsLocked(Boolean(sData.data.isLocked));
        setPreventSelfVoting(sData.data.preventSelfVoting ?? true);
        setAllowEditVote(sData.data.allowEditVote ?? false);
        setVotingPasscode(sData.data.votingPasscode || "1234");
        setRequireApproval(sData.data.requireApproval ?? true);
        if (sData.data.customization) {
          setCustomization(sData.data.customization);
        }
      }
      if (cData.success) setCandidates(cData.data);
      if (vData.success) setVotes(vData.data);
      if (uData.success) {
        setUserList(uData.data || []);
        if (uData.data && uData.data.length > 0 && !selectedVoterEmail) {
          setSelectedVoterEmail(uData.data[0].email);
        }
      }
      if (rData.success) {
        setRestrictions(rData.restrictions || {});
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    setSaveSuccessMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          votingStartTime: votingStartTime ? new Date(votingStartTime).toISOString() : null,
          votingEndTime: votingEndTime ? new Date(votingEndTime).toISOString() : null,
          isLocked,
          preventSelfVoting,
          allowEditVote,
          votingPasscode: votingPasscode.trim(),
          requireApproval,
          votingRestrictions: restrictions,
          customization,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setStatus(data.status);
        setSaveSuccessMessage("บันทึกการตั้งค่าระบบและธีมหน้าเว็บเรียบร้อยแล้ว!");
        setTimeout(() => setSaveSuccessMessage(""), 3500);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleToggleLock = async () => {
    const newLock = !isLocked;
    setIsLocked(newLock);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isLocked: newLock }),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        setStatus(data.status);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserApproval = async (email: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleApproval",
          email,
          approve: !currentStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserBan = async (email: string, currentBanned: boolean) => {
    if (!confirm(`คุณต้องการ ${currentBanned ? "ปลดแบน" : "แบนบัญชี"} ${email} หรือไม่?`)) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleBan",
          email,
          ban: !currentBanned,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRestriction = (candidateId: string) => {
    if (!selectedVoterEmail) return;
    const cleanVoter = selectedVoterEmail.toLowerCase().trim();
    const currentForbidden = restrictions[cleanVoter] || [];

    let updatedForbidden: string[];
    if (currentForbidden.includes(candidateId)) {
      updatedForbidden = currentForbidden.filter((id) => id !== candidateId);
    } else {
      updatedForbidden = [...currentForbidden, candidateId];
    }

    setRestrictions((prev) => ({
      ...prev,
      [cleanVoter]: updatedForbidden,
    }));
  };

  const handleSaveRestrictions = async () => {
    try {
      const res = await fetch("/api/admin/restrictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restrictions }),
      });
      const data = await res.json();
      if (data.success) {
        setRestrictionSuccessMessage("บันทึกกติกาใครห้ามโหวตใครเรียบร้อยแล้ว!");
        setTimeout(() => setRestrictionSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Save restrictions error:", err);
    }
  };

  const handleSaveCandidate = async (candData: Partial<Candidate>) => {
    if (editingCandidate) {
      const res = await fetch(`/api/candidates/${editingCandidate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candData),
      });
      if (res.ok) fetchData();
    } else {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(candData),
      });
      if (res.ok) fetchData();
    }
  };

  const handleDeleteCandidate = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้เล่น "${name}" ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleHardReset = async () => {
    if (!confirm("⚠️ คำเตือน: คุณต้องการรีเซ็ตระบบทั้งหมดกลับไปเป็นค่าเริ่มต้นและล้างข้อมูลเก่าทิ้งทั้งหมดหรือไม่?")) return;
    try {
      const res = await fetch("/api/admin/reset", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-semibold">กำลังโหลดแผงควบคุมระบบ...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl space-y-4 max-w-xl mx-auto border border-red-500/30">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">เฉพาะแอดมินเท่านั้น</h2>
        <p className="text-xs text-slate-400">
          บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้ กรุณาสลับเข้าสู่ระบบในฐานะแอดมิน
        </p>
      </div>
    );
  }

  const selectedVoterForbidden = restrictions[selectedVoterEmail?.toLowerCase().trim()] || [];

  const filteredVotes = votes.filter((v) => {
    const cand = candidates.find((c) => c.id === v.candidateId);
    const search = auditSearch.toLowerCase().trim();
    if (!search) return true;
    return (
      v.userEmail.toLowerCase().includes(search) ||
      (cand && cand.name.toLowerCase().includes(search)) ||
      (cand && cand.nickname && cand.nickname.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">ระบบจัดการและควบคุม (Admin Panel)</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                แอดมิน
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ปรับแต่งหน้าเว็บ, ตั้งเวลากติกา, รหัสผ่านโหวต, ใครห้ามโหวตใคร, ตรวจสอบผลโหวตรายบุคคล, แบนแอคเคาน์, และรีเซ็ตระบบ
            </p>
          </div>
        </div>

        {/* Quick Lock/Unlock Toggle */}
        <button
          onClick={handleToggleLock}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-lg ${
            isLocked
              ? "bg-red-600 hover:bg-red-500 text-white shadow-red-600/30"
              : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30"
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span>{isLocked ? "ระบบถูกล็อคอยู่ (คลิกเพื่อปลดล็อค)" : "ระบบเปิดอยู่ (คลิกเพื่อล็อคโหวต)"}</span>
        </button>
      </div>

      {/* Section 1: Web App Customization */}
      <form onSubmit={handleSaveSettings} className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/5 to-slate-900/40 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Palette className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              1. ปรับแต่งหน้าเว็บทั้งหมด (ข้อความ / โทนสี / รูปภาพแบนเนอร์ & โลโก้)
            </h2>
          </div>
          {saveSuccessMessage && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveSuccessMessage}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">ชื่อหัวข้อหลัก (Header Title)</label>
            <input
              type="text"
              value={customization.headerTitle}
              onChange={(e) => setCustomization({ ...customization, headerTitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">คำอธิบายใต้หัวข้อ (Subtitle / Description)</label>
            <input
              type="text"
              value={customization.headerSubtitle}
              onChange={(e) => setCustomization({ ...customization, headerSubtitle: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Theme Color Selector */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>เลือกโทนสีหลักของหน้าเว็บ (Theme Color):</span>
          </label>

          <div className="grid grid-cols-5 gap-2 max-w-md">
            {[
              { id: "rose", name: "Rose Crimson", bg: "bg-rose-600" },
              { id: "amber", name: "Amber Gold", bg: "bg-amber-500" },
              { id: "emerald", name: "Emerald Green", bg: "bg-emerald-600" },
              { id: "indigo", name: "Indigo Violet", bg: "bg-indigo-600" },
              { id: "cyan", name: "Cyan Blue", bg: "bg-cyan-500" },
            ].map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setCustomization({ ...customization, themeColor: theme.id as any })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  customization.themeColor === theme.id
                    ? "bg-slate-800 border-white ring-2 ring-white/20 scale-105 font-bold"
                    : "bg-slate-950/70 border-slate-800 hover:bg-slate-800"
                }`}
              >
                <span className={`w-6 h-6 rounded-full ${theme.bg} shadow-md mb-1`} />
                <span className="text-[10px] text-slate-300 text-center">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSavingSettings}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSavingSettings ? "กำลังบันทึก..." : "บันทึกธีมและข้อความหน้าเว็บ"}</span>
          </button>
        </div>
      </form>

      {/* Section 2: Audit Voting Insights (แอดมินดูว่าใครโหวตให้ใครเท่าไหร่) */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-slate-900/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                2. ตรวจสอบผลโหวตรายบุคคล (Audit - เฉพาะแอดมินดูได้)
              </h2>
              <p className="text-xs text-slate-400">
                ตรวจสอบว่าใครส่งโหวตให้ผู้เล่นคนไหน ให้คะแนนเท่าไหร่ รายละเอียดทั้ง 36 ข้อ
              </p>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้โหวต/ผู้เล่น..."
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {filteredVotes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            ไม่พบประวัติการโหวตที่ตรงกับคำค้นหา
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {filteredVotes.map((v) => {
              const candidateObj = candidates.find((c) => c.id === v.candidateId);
              const scores = v.scores || {};
              const scoreValues = Object.values(scores);
              const totalScore = scoreValues.reduce((acc, curr) => acc + curr, 0);
              const isExpanded = expandedVoteId === v.id;

              return (
                <div
                  key={v.id}
                  className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={candidateObj?.avatarUrl || `https://api.dicebear.com/7.x/personas/svg?seed=${v.candidateId}`}
                        alt={candidateObj?.name || "Player"}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${v.candidateId}`;
                        }}
                        className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-2">
                          <span className="text-cyan-400 font-extrabold">{v.userEmail}</span>
                          <span>โหวตให้</span>
                          <span className="text-amber-400 font-extrabold">{candidateObj?.name || v.candidateId}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          เมื่อ: {formatThaiDateTime(v.submittedAt)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">คะแนนรวมที่ให้</span>
                        <span className="text-base font-black text-amber-400">{totalScore} <span className="text-xs text-slate-400 font-normal">/ 180</span></span>
                      </div>

                      <button
                        onClick={() => setExpandedVoteId(isExpanded ? null : v.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "ซ่อนรายละเอียด" : "ดูทั้ง 36 ข้อ"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded 36 Criteria Scores Detail */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800/80 animate-in fade-in duration-150">
                      <div className="text-xs font-bold text-slate-300 mb-2">คะแนนรายข้อย่อย (36 ข้อ):</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {ALL_SUB_CRITERIA.map((sub, idx) => {
                          const pts = scores[sub.id] || 0;
                          return (
                            <div
                              key={sub.id}
                              className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-[11px]"
                            >
                              <span className="text-slate-300 truncate max-w-[180px]">
                                {idx + 1}. {sub.nameTh}
                              </span>
                              <span className="font-bold text-amber-400 shrink-0 ml-1">
                                {pts} คะแนน
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Voting Passcode Settings */}
      <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-slate-900/40 space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
          <KeyRound className="w-5 h-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            3. รหัสผ่านสำหรับการโหวต (Voting Passcode)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-200">
              รหัสผ่านสำหรับโหวต (Voting Passcode) *
            </label>
            <input
              type="text"
              required
              placeholder="เช่น 1234"
              value={votingPasscode}
              onChange={(e) => setVotingPasscode(e.target.value)}
              className="w-full bg-slate-950 border-2 border-amber-500/60 rounded-xl px-4 py-2.5 text-base text-amber-400 font-mono font-black focus:outline-none focus:border-amber-400 text-center tracking-widest"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-300">รหัสปัจจุบันที่ใช้งาน:</span>
            <div className="text-xl font-black text-amber-400 font-mono tracking-widest">
              {votingPasscode || "ไม่มีรหัส"}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>ต้องได้รับการอนุมัติก่อนโหวต</span>
              </span>
              <p className="text-[10px] text-slate-400">ผู้ใช้ต้องได้รับการอนุมัติจากคุณ</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={requireApproval}
                onChange={(e) => setRequireApproval(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>
      </div>

      {/* Section 4: Custom Voting Restrictions Matrix (ใครห้ามโหวตใคร) */}
      <div className="glass-panel p-6 rounded-3xl border border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-slate-900/40 space-y-5 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <UserX className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                4. กำหนดสิทธิ์: ใครห้ามโหวตใคร (Custom Voting Restrictions)
              </h2>
              <p className="text-xs text-slate-400">
                คลิกเลือกผู้โหวต และติ๊กเลือกนักเตะที่ผู้โหวตคนนั้น <strong>"ห้ามโหวต"</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveRestrictions}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกกติกานี้</span>
          </button>
        </div>

        {restrictionSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{restrictionSuccessMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>เลือกผู้โหวตที่ต้องการตั้งกฎ:</span>
            </label>
            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
              {userList.map((u) => {
                const isSelected = selectedVoterEmail.toLowerCase() === u.email.toLowerCase();
                const forbiddenCount = (restrictions[u.email.toLowerCase()] || []).length;

                return (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => setSelectedVoterEmail(u.email)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-400 shadow-md font-bold"
                        : "bg-slate-950/70 text-slate-300 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.image || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(u.email)}`}
                        alt={u.name}
                        className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <span className="text-xs truncate">{u.name}</span>
                    </div>
                    {forbiddenCount > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isSelected
                            ? "bg-black/30 text-white"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        }`}
                      >
                        ห้าม {forbiddenCount} คน
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-white">
                ติ๊กเลือกนักเตะที่ <span className="text-amber-400 font-extrabold underline">{userList.find(u => u.email.toLowerCase() === selectedVoterEmail.toLowerCase())?.name || selectedVoterEmail}</span> ถูก <span className="text-rose-400 font-bold">ห้ามโหวต</span>:
              </span>
              <span className="text-[11px] text-slate-400">
                (ห้ามโหวต {selectedVoterForbidden.length} / {candidates.length} คน)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {candidates.map((cand) => {
                const isForbidden = selectedVoterForbidden.includes(cand.id);

                return (
                  <div
                    key={cand.id}
                    onClick={() => handleToggleRestriction(cand.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isForbidden
                        ? "bg-red-500/20 border-red-500/60 text-white shadow-sm"
                        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cand.avatarUrl}
                        alt={cand.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${cand.id}`;
                        }}
                        className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{cand.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {cand.position || "Player"} {cand.number && `• เบอร์ ${cand.number}`}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 pl-2">
                      {isForbidden ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-600 text-white font-bold flex items-center gap-1 shadow-sm">
                          <X className="w-3 h-3" /> ห้ามโหวต
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
                          โหวตได้ ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Account Approval & Account Banning System */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                5. อนุมัติและบล็อคบัญชีผู้ใช้ / แบนแอคเคาน์ ({userList.length} บัญชี)
              </h2>
              <p className="text-xs text-slate-400">อนุมัติสิทธิ์ หรือแบนบัญชีไม่ให้เข้าใช้งานเว็บ</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {userList.map((u) => {
            const isUAdmin = u.role === "ADMIN" || u.email.toLowerCase() === "xekphphbrrnsa@gmail.com";
            const approved = isUAdmin || Boolean(settings?.approvedUsers?.map(e => e.toLowerCase()).includes(u.email.toLowerCase()));
            const banned = Boolean(settings?.bannedUsers?.map(e => e.toLowerCase()).includes(u.email.toLowerCase()));

            return (
              <div
                key={u.email}
                className={`bg-slate-950/80 border rounded-2xl p-3.5 flex flex-col justify-between gap-3 ${
                  banned ? "border-red-500/50 bg-red-950/20" : "border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.image || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(u.email)}`}
                    alt={u.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.number && <span className="text-amber-400 font-extrabold">#{u.number}</span>}
                      {isUAdmin && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          แอดมิน
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{u.email}</div>
                  </div>
                </div>

                {!isUAdmin && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleToggleUserApproval(u.email, approved)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        approved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {approved ? "อนุมัติแล้ว ✓" : "ยังไม่อนุมัติ ✕"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleUserBan(u.email, banned)}
                      className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        banned
                          ? "bg-red-600 text-white shadow-md"
                          : "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      <span>{banned ? "ถูกแบนอยู่ (ปลด)" : "แบนบัญชี"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 6: Player Management */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                6. จัดการรายชื่อนักเตะ ({candidates.length} คน)
              </h2>
              <p className="text-xs text-slate-400">เพิ่ม, แก้ไข, ลบ หรือปรับแต่งรูปภาพและข้อมูลนักเตะ</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingCandidate(null);
              setShowCandidateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>เพิ่มผู้เล่นใหม่</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {candidates.map((cand) => {
            const candVoteCount = votes.filter((v) => v.candidateId === cand.id).length;

            return (
              <div
                key={cand.id}
                className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between gap-3 group hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cand.avatarUrl}
                    alt={cand.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/personas/svg?seed=${cand.id}`;
                    }}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">{cand.name}</h4>
                    </div>
                    {cand.nickname && (
                      <p className="text-[11px] text-amber-400 font-semibold truncate">
                        {cand.nickname} {cand.number && `(#${cand.number})`}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 truncate">
                      {cand.position || "Player"} • โหวต {candVoteCount} คน
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setEditingCandidate(cand);
                      setShowCandidateModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                    title="แก้ไข"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCandidate(cand.id, cand.name)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 7: Hard Reset */}
      <div className="glass-panel p-6 rounded-3xl border border-red-500/40 bg-gradient-to-b from-red-500/10 to-slate-900/50 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Flame className="w-5 h-5 text-red-500" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              7. เคลียร์ข้อมูลและรีเซ็ตเว็บกลับไปค่าเริ่มต้น (Hard Reset)
            </h2>
            <p className="text-xs text-slate-400">ล้างผลโหวต ข้อมูลเก่า และกติกาเดิมทั้งหมดทิ้ง เพื่อเริ่มนับใหม่</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleHardReset}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black shadow-xl shadow-red-600/30 transition-all hover:scale-102"
          >
            <RotateCcw className="w-4 h-4" />
            <span>🔥 รีเซ็ตระบบกลับค่าเริ่มต้นล้างข้อมูลเก่าทั้งหมด (Hard Reset)</span>
          </button>
        </div>
      </div>

      {/* Candidate Modal */}
      {showCandidateModal && (
        <AdminCandidateModal
          candidate={editingCandidate}
          onClose={() => {
            setShowCandidateModal(false);
            setEditingCandidate(null);
          }}
          onSave={handleSaveCandidate}
        />
      )}
    </div>
  );
}
