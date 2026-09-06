"use client";

import React, { useState } from "react";
import { Candidate } from "@/types";
import { X, UserPlus, Image, Sparkles } from "lucide-react";

interface AdminCandidateModalProps {
  candidate?: Candidate | null;
  onClose: () => void;
  onSave: (data: Partial<Candidate>) => Promise<void>;
}

export default function AdminCandidateModal({
  candidate,
  onClose,
  onSave,
}: AdminCandidateModalProps) {
  const [name, setName] = useState(candidate?.name || "");
  const [nickname, setNickname] = useState(candidate?.nickname || "");
  const [number, setNumber] = useState<string>(candidate?.number ? String(candidate.number) : "");
  const [position, setPosition] = useState(candidate?.position || "Midfielder (MF)");
  const [team, setTeam] = useState(candidate?.team || "");
  const [avatarUrl, setAvatarUrl] = useState(
    candidate?.avatarUrl ||
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presetAvatars = [
    { label: "นักเตะ 1", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&auto=format&fit=crop&q=80" },
    { label: "นักเตะ 2", url: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80" },
    { label: "นักเตะ 3", url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&auto=format&fit=crop&q=80" },
    { label: "นักเตะ 4", url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&auto=format&fit=crop&q=80" },
    { label: "นักเตะ 5", url: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&auto=format&fit=crop&q=80" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        nickname: nickname.trim() || undefined,
        number: number ? parseInt(number, 10) : undefined,
        position: position.trim() || undefined,
        team: team.trim() || undefined,
        avatarUrl: avatarUrl.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {candidate ? "แก้ไขข้อมูลผู้เล่น" : "เพิ่มผู้เล่นใหม่เข้าระบบ"}
              </h3>
              <p className="text-xs text-slate-400">กรอกข้อมูลผู้เล่นสำหรับการเปิดรับคะแนนโหวต</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">
              ชื่อ - นามสกุล <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ชนาธิป สรงกระสินธ์"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ชื่อเล่น / ชื่อเรียก</label>
              <input
                type="text"
                placeholder="เช่น เจ (Jay)"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">เบอร์เสื้อ (Number)</label>
              <input
                type="number"
                placeholder="เช่น 18"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ตำแหน่ง (Position)</label>
              <input
                type="text"
                placeholder="เช่น Attacking Midfielder"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">ทีม / สโมสร</label>
              <input
                type="text"
                placeholder="เช่น ทีมชาติไทย / BG Pathum"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Avatar URL & Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">ลิงก์รูปภาพโปรไฟล์ (Image URL)</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl || "https://api.dicebear.com/7.x/personas/svg?seed=preview"}
                alt="Preview"
                className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-600 bg-slate-800"
              />
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2 pt-1 overflow-x-auto">
              <span className="text-[11px] text-slate-400 shrink-0">รูปตัวอย่าง:</span>
              {presetAvatars.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatarUrl(p.url)}
                  className="w-7 h-7 rounded-lg overflow-hidden ring-1 ring-slate-700 hover:ring-rose-400 shrink-0 transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50"
            >
              {isSubmitting ? "กำลังบันทึก..." : candidate ? "บันทึกการแก้ไข" : "เพิ่มผู้เล่น"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
