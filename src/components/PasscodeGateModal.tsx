"use client";

import React, { useState } from "react";
import { KeyRound, ShieldAlert, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

interface PasscodeGateModalProps {
  isOpen: boolean;
  onSuccess: (enteredPasscode: string) => void;
  onCancel?: () => void;
}

export default function PasscodeGateModal({
  isOpen,
  onSuccess,
  onCancel,
}: PasscodeGateModalProps) {
  const [passcode, setPasscode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setErrorMessage("กรุณากรอกรหัสผ่านก่อนเข้าสู่ระบบการโหวต");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      // Check passcode against settings API
      const res = await fetch("/api/admin/settings");
      const json = await res.json();

      if (json.success) {
        const correctPasscode = json.data?.votingPasscode || "1234";
        if (passcode.trim() === correctPasscode.trim()) {
          onSuccess(passcode.trim());
        } else {
          setErrorMessage("รหัสผ่านไม่ถูกต้อง! กรุณาติดต่อแอดมิน (ฉัน) เพื่อขอรหัสที่ถูกต้อง");
        }
      } else {
        setErrorMessage("ไม่สามารถตรวจสอบรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-amber-500/10 space-y-5 relative">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">กรอกรหัสผ่านเพื่อเริ่มโหวต</h2>
          <p className="text-xs text-slate-300">
            แอดมินกำหนดให้ต้องใส่รหัสผ่านที่แอดมินตั้งไว้ ก่อนจึงจะสามารถเริ่มโหวตได้
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <input
              type="text"
              autoFocus
              required
              placeholder="กรอกรหัสผ่าน (เช่น 1234)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-lg text-amber-400 font-mono font-black text-center tracking-widest focus:outline-none transition-all shadow-inner"
            />
            {errorMessage && (
              <p className="text-xs text-red-400 font-semibold text-center mt-1 animate-in fade-in">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-1">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-emerald-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isVerifying ? "กำลังตรวจสอบ..." : "ปลดล็อคเพื่อเริ่มโหวต"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
