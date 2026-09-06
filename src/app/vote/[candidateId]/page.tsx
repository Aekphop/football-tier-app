"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Candidate, SystemSettings, VoteRecord } from "@/types";
import { CATEGORIES, ALL_SUB_CRITERIA, TOTAL_CRITERIA_COUNT } from "@/data/criteria";
import { useAuth } from "@/lib/auth-context";
import VotingCard from "@/components/VotingCard";
import CountdownTimer from "@/components/CountdownTimer";
import PasscodeGateModal from "@/components/PasscodeGateModal";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Zap,
  Activity,
  Compass,
  Flame,
  Users,
  Trophy,
  Footprints,
  Send,
  Loader2,
  UserX,
  ShieldAlert,
  KeyRound,
  Eye,
  LogIn,
  ShieldX,
} from "lucide-react";

export default function CandidateVotePage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.candidateId as string;
  const { user, isApproved, isAdmin } = useAuth();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [status, setStatus] = useState<{ isOpen: boolean; reason: string } | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [hasExistingVote, setHasExistingVote] = useState(false);
  const [isRestricted, setIsRestricted] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [activeCategoryTab, setActiveCategoryTab] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [votingPasscode, setVotingPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");

  const iconMap: Record<number, any> = {
    1: Zap,
    2: Activity,
    3: Compass,
    4: Flame,
    5: Users,
    6: Trophy,
    7: Footprints,
  };

  const handleCategoryChange = (catId: number) => {
    setActiveCategoryTab(catId);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("current_voting_passcode");
      if (stored) {
        setVotingPasscode(stored);
      }
    }

    const fetchData = async () => {
      try {
        const [candRes, settingsRes, voteRes] = await Promise.all([
          fetch(`/api/candidates/${candidateId}`),
          fetch("/api/admin/settings"),
          user ? fetch(`/api/vote?userId=${user.id}&candidateId=${candidateId}`) : Promise.resolve(null),
        ]);

        const candData = await candRes.json();
        const settingsData = await settingsRes.json();

        let loadedSettings: SystemSettings | null = null;
        if (settingsData.success) {
          loadedSettings = settingsData.data;
          setSettings(loadedSettings);
          setStatus(settingsData.status);
        }

        if (candData.success) {
          const cand: Candidate = candData.data;
          setCandidate(cand);

          // Check custom restrictions set by Admin (ใครห้ามโหวตใคร)
          if (user && loadedSettings) {
            const cleanUser = user.email.toLowerCase().trim();
            const forbiddenList = loadedSettings.votingRestrictions?.[cleanUser] || [];

            if (forbiddenList.includes(cand.id)) {
              setIsRestricted(true);
              setRestrictionReason("แอดมิน (ฉัน) ได้ตั้งค่าระงับไม่ให้คุณโหวตผู้เล่นคนนี้");
            } else if (
              loadedSettings.preventSelfVoting &&
              ((cand.userEmail && cand.userEmail.toLowerCase().trim() === cleanUser) ||
                cand.userId === user.id ||
                (cand.name && user.name && user.name.includes(cand.name)) ||
                (cand.nickname && user.name && user.name.includes(cand.nickname)))
            ) {
              setIsRestricted(true);
              setRestrictionReason("ระบบล็อคไม่ให้โหวตให้ตนเอง");
            }
          }
        }

        if (voteRes) {
          const voteData = await voteRes.json();
          if (voteData.success && voteData.data?.scores) {
            setScores(voteData.data.scores);
            setHasExistingVote(true);
          }
        }
      } catch (err) {
        console.error("Vote fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (candidateId) {
      fetchData();
    }
  }, [candidateId, user]);

  const handleScoreSelect = (subCriteriaId: string, score: number) => {
    if (hasExistingVote || isRestricted) return;
    setScores((prev) => ({
      ...prev,
      [subCriteriaId]: score,
    }));
  };

  const handleQuickFillCategory = (categoryId: number, score: number) => {
    if (hasExistingVote || isRestricted) return;
    const cat = CATEGORIES.find((c) => c.id === categoryId);
    if (!cat) return;

    setScores((prev) => {
      const updated = { ...prev };
      cat.subCriteria.forEach((sub) => {
        updated[sub.id] = score;
      });
      return updated;
    });
  };

  const filledCount = Object.keys(scores).length;
  const currentTotalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
  const isAllFilled = filledCount === TOTAL_CRITERIA_COUNT;

  const handleOpenSubmit = () => {
    if (!user) {
      setErrorMessage("กรุณาเข้าสู่ระบบก่อนทำการโหวต");
      return;
    }
    if (!isAllFilled) {
      setErrorMessage(`กรุณาโหวตให้ครบทุกข้อก่อนส่ง (ปัจจุบัน ${filledCount}/${TOTAL_CRITERIA_COUNT} ข้อ เหลืออีก ${TOTAL_CRITERIA_COUNT - filledCount} ข้อ)`);
      return;
    }
    setPasscodeError("");
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (settings?.votingPasscode && !votingPasscode.trim()) {
      setPasscodeError("กรุณากรอกรหัสผ่านสำหรับโหวต");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setPasscodeError("");

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId,
          userId: user?.id,
          userEmail: user?.email,
          scores,
          passcode: votingPasscode.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowConfirmModal(false);
        setSubmitSuccess(true);
        setHasExistingVote(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("voting_passcode_unlocked", "true");
          sessionStorage.setItem("current_voting_passcode", votingPasscode.trim());
        }

        try {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        setTimeout(() => {
          router.push("/tier-list");
        }, 2200);
      } else {
        setPasscodeError(data.error || "เกิดข้อผิดพลาดในการบันทึก");
        setErrorMessage(data.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      setPasscodeError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-sm font-medium">กำลังโหลดแบบฟอร์มการประเมิน...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">ไม่พบข้อมูลผู้เล่น</h2>
        <Link
          href="/vote"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายชื่อผู้เล่น</span>
        </Link>
      </div>
    );
  }

  const isWindowClosed = status && !status.isOpen;
  const isNotApproved = settings?.requireApproval && !isApproved;
  const isVotingDisabled = isWindowClosed || isRestricted || hasExistingVote || !user || isNotApproved;

  return (
    <div className="space-y-6 pb-32">
      {/* Prominent Eye-Catching Sticky Countdown Bar */}
      <CountdownTimer settings={settings} status={status} sticky={true} />

      {/* Top Navigation & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/vote"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>เลือกผู้เล่นคนอื่น</span>
        </Link>

        {/* Realtime Progress Pill */}
        <div className="flex items-center gap-3">
          <div className={`px-3.5 py-1.5 rounded-xl border text-xs ${
            isAllFilled
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-bold"
              : "bg-slate-900 border-slate-800 text-amber-400"
          }`}>
            <span>โหวตครบ: </span>
            <span className="font-extrabold">{filledCount} / {TOTAL_CRITERIA_COUNT} ข้อ</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs">
            <span className="text-rose-300">คะแนนรวม: </span>
            <span className="font-extrabold text-white text-sm">{currentTotalScore}</span>
            <span className="text-slate-400 text-[10px]"> / 180</span>
          </div>
        </div>
      </div>

      {/* Auth / Restriction Alerts */}
      {!user ? (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-semibold flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogIn className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">ต้องเข้าสู่ระบบก่อนทำการโหวต</div>
              <div className="text-xs text-amber-200/80">
                กรุณาเข้าสู่ระบบเพื่อเริ่มให้คะแนน
              </div>
            </div>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shrink-0"
          >
            เข้าสู่ระบบทันที
          </Link>
        </div>
      ) : isRestricted ? (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold flex items-center gap-3">
          <ShieldX className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <div className="font-bold text-white">คุณถูกระงับสิทธิ์ในการโหวตผู้เล่นคนนี้</div>
            <div className="text-xs text-red-200/80 mt-0.5">
              {restrictionReason || "แอดมิน (ฉัน) ได้กำหนดกติกาไม่ให้คุณโหวตผู้เล่นคนนี้"}
            </div>
          </div>
        </div>
      ) : isNotApproved ? (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-semibold flex items-center gap-3">
          <Lock className="w-6 h-6 text-red-400 shrink-0" />
          <div>
            <div className="font-bold text-white">บัญชีของคุณยังไม่ได้รับอนุมัติจากแอดมิน</div>
            <div className="text-xs text-red-200/80 mt-0.5">
              ต้องได้รับอนุญาตจากแอดมิน (xekphphbrrnsa@gmail.com) ก่อนจึงจะสามารถส่งโหวตได้
            </div>
          </div>
        </div>
      ) : hasExistingVote ? (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold flex items-center gap-3">
          <Lock className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold text-white">คุณได้ส่งผลโหวตสำหรับผู้เล่นคนนี้แล้ว (ล็อคผลโหวตถาวร)</div>
            <div className="text-xs text-emerald-200/80 mt-0.5">
              คะแนนของคุณถูกบันทึกแล้วและไม่สามารถแก้ไขได้ ด้านล่างคือคะแนนที่คุณได้ให้ไว้
            </div>
          </div>
        </div>
      ) : null}

      {/* Candidate Profile Summary Banner */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candidate.avatarUrl}
          alt={candidate.name}
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-2 ring-slate-700 shadow-xl shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white">{candidate.name}</h1>
            {candidate.nickname && (
              <span className="text-sm font-bold text-amber-400">({candidate.nickname})</span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-300">
            {candidate.position || "Player"} {candidate.team && `• ${candidate.team}`}{" "}
            {candidate.number && `• เบอร์ ${candidate.number}`}
          </p>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 max-w-md">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(filledCount / TOTAL_CRITERIA_COUNT) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map((cat) => {
          const Icon = iconMap[cat.id] || Zap;
          const isActive = activeCategoryTab === cat.id;
          const catFilledCount = cat.subCriteria.filter((s) => scores[s.id] !== undefined).length;
          const isCatComplete = catFilledCount === cat.subCriteria.length;

          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20 scale-102"
                  : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>
                {cat.id}. {cat.nameTh}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isCatComplete
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {catFilledCount}/{cat.subCriteria.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Render Active Category Form */}
      {CATEGORIES.filter((c) => c.id === activeCategoryTab).map((cat) => {
        const Icon = iconMap[cat.id] || Zap;

        return (
          <div key={cat.id} className="space-y-4 animate-in fade-in duration-200">
            {/* Category Header */}
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">
                    หมวด {cat.id}: {cat.nameTh} ({cat.nameEn})
                  </h2>
                  <p className="text-xs text-slate-400">
                    มีทั้งหมด {cat.subCriteria.length} ข้อย่อย • เลือก 1 - 5 คะแนน (1=แย่, 2=ปรับปรุง, 3=พอใช้, 4=ดี, 5=ดีมาก)
                  </p>
                </div>
              </div>

              {!isVotingDisabled && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-400 text-[11px] mr-1">ให้ทั้งหมวด:</span>
                  {[3, 4, 5].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => handleQuickFillCategory(cat.id, pts)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                    >
                      {pts} คะแนน
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subcriteria List */}
            <div className="space-y-3">
              {cat.subCriteria.map((sub, idx) => {
                const absoluteIndex = ALL_SUB_CRITERIA.findIndex((s) => s.id === sub.id);

                return (
                  <VotingCard
                    key={sub.id}
                    criterion={sub}
                    index={absoluteIndex >= 0 ? absoluteIndex : idx}
                    selectedScore={scores[sub.id]}
                    onSelectScore={(score) => handleScoreSelect(sub.id, score)}
                    disabled={Boolean(isVotingDisabled)}
                  />
                );
              })}
            </div>

            {/* Next / Prev Category Buttons with auto-scroll */}
            <div className="flex items-center justify-between pt-4">
              {cat.id > 1 ? (
                <button
                  type="button"
                  onClick={() => handleCategoryChange(cat.id - 1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ← หมวดก่อนหน้า ({cat.id - 1})
                </button>
              ) : <div />}

              {cat.id < CATEGORIES.length ? (
                <button
                  type="button"
                  onClick={() => handleCategoryChange(cat.id + 1)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white text-xs font-bold shadow-md"
                >
                  หมวดถัดไป ({cat.id + 1}) →
                </button>
              ) : <div />}
            </div>
          </div>
        );
      })}

      {/* Error Message if any */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Floating Bottom Submit Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 p-4 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs">
            <div className="font-medium text-slate-300">
              สถานะ:{" "}
              <span className={`font-bold ${isAllFilled ? "text-emerald-400" : "text-amber-400"}`}>
                {filledCount} / {TOTAL_CRITERIA_COUNT} ข้อ
              </span>
              {!isAllFilled && (
                <span className="text-red-400 font-semibold ml-1">
                  (ต้องโหวตอีก {TOTAL_CRITERIA_COUNT - filledCount} ข้อ)
                </span>
              )}
            </div>
            <div className="text-slate-400">
              คะแนนรวม: <span className="text-amber-400 font-extrabold text-sm">{currentTotalScore}</span> / 180
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isRestricted ? (
              <div className="text-xs text-red-400 font-bold flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30">
                <ShieldX className="w-4 h-4" />
                <span>แอดมินกำหนดห้ามคุณโหวตคนนี้</span>
              </div>
            ) : hasExistingVote ? (
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <Lock className="w-4 h-4" />
                <span>ส่งคะแนนแล้ว (ล็อคผลโหวตถาวร ไม่สามารถแก้ไขได้)</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={isVotingDisabled || !isAllFilled || isSubmitting}
                onClick={handleOpenSubmit}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl transition-all ${
                  isVotingDisabled || !isAllFilled
                    ? "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed border border-slate-700"
                    : submitSuccess
                    ? "bg-emerald-600 shadow-emerald-600/30"
                    : "bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 hover:opacity-95 shadow-rose-600/30 hover:scale-102 cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังส่งผลโหวต...</span>
                  </>
                ) : submitSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>บันทึกสำเร็จ!</span>
                  </>
                ) : !isAllFilled ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>ยังโหวตไม่ครบ ({filledCount}/36 ข้อ)</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ยืนยันและส่งผลโหวต (ครบ 36 ข้อ)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation & Passcode Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-lg">ยืนยันการส่งผลโหวต</h3>
                <p className="text-xs text-amber-300 font-medium">กรอกรหัสผ่านสำหรับการโหวต</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">ผู้เล่นที่โหวต:</span>
                <span className="font-bold text-white">{candidate.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">จำนวนข้อที่ให้คะแนน:</span>
                <span className="font-bold text-emerald-400">ครบทั้ง 36 ข้อ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">คะแนนรวมที่ประเมิน:</span>
                <span className="font-extrabold text-white">{currentTotalScore} / 180</span>
              </div>
            </div>

            {/* Voting Passcode Input */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>รหัสผ่านสำหรับการโหวต (Voting Passcode) *</span>
              </label>
              <input
                type="text"
                required
                placeholder="กรอกรหัสผ่านที่ได้รับจากแอดมิน (เช่น 1234)"
                value={votingPasscode}
                onChange={(e) => setVotingPasscode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest text-center"
              />
              {passcodeError && (
                <p className="text-xs text-red-400 font-semibold">{passcodeError}</p>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              ⚠️ เมื่อกดยืนยันแล้วจะไม่สามารถกลับมาแก้ไขคะแนนได้อีก
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {isSubmitting ? "กำลังส่ง..." : "ยืนยันการส่งผลโหวต"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
