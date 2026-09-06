"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, ShieldCheck, UserCheck, Edit3, Camera, Save, X, Hash, UserX } from "lucide-react";

interface UserProfileModalProps {
  onClose: () => void;
}

export default function UserProfileModal({ onClose }: UserProfileModalProps) {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [number, setNumber] = useState<string>(user?.number !== undefined && user?.number !== null ? String(user.number) : "");
  const [image, setImage] = useState(user?.image || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const parsedNumber = number.trim() ? parseInt(number.trim(), 10) : undefined;

    if (parsedNumber !== undefined && (isNaN(parsedNumber) || parsedNumber < 1 || parsedNumber > 99)) {
      setErrorMessage("กรุณาระบุเบอร์เสื้อระหว่าง 1 - 99");
      setIsSubmitting(false);
      return;
    }

    const res = await updateUserProfile({
      name: name.trim() || user.name,
      nickname: nickname.trim(),
      number: parsedNumber,
      image,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage("บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!");
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setErrorMessage(res.error || "เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">ตั้งค่าโปรไฟล์บัญชีผู้ใช้</h3>
              <p className="text-xs text-slate-400">แก้ไขชื่อ รูปโปรไฟล์ และเบอร์เสื้อ (ห้ามซ้ำ)</p>
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
          {/* Profile Image & Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image || `https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(user.email)}`}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-slate-700 shadow-xl"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-[10px] text-slate-400">คลิกที่รูปเพื่อเลือกภาพโปรไฟล์ใหม่จากเครื่อง</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">
                ชื่อที่ใช้แสดง (Display Name) <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ชื่อเล่น (Nickname)</label>
                <input
                  type="text"
                  placeholder="เช่น กล้า / โต้"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-amber-400" />
                  <span>เบอร์เสื้อ (1-99) *</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  placeholder="เช่น 10"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400">ลิงก์รูปภาพโปรไฟล์ (Image URL)</label>
              <input
                type="url"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-rose-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              {successMessage}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
