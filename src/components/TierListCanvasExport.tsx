"use client";

import React, { useRef, useState, useEffect } from "react";
import { TierListSummary, TierType } from "@/types";
import { getTierInfo } from "@/lib/tierCalculator";
import { Download, Image as ImageIcon, Sparkles, Check, Loader2, X } from "lucide-react";

interface TierListCanvasExportProps {
  summary: TierListSummary;
  settingsTitle?: string;
  onClose: () => void;
}

export default function TierListCanvasExport({
  summary,
  settingsTitle = "Football Skills Tier List 2026",
  onClose,
}: TierListCanvasExportProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const renderCanvas = async () => {
      setIsGenerating(true);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Dimensions
      const width = 1600;
      const rowHeight = 220;
      const headerHeight = 180;
      const footerHeight = 70;
      const totalHeight = headerHeight + rowHeight * 4 + footerHeight;

      canvas.width = width;
      canvas.height = totalHeight;

      // 1. Background
      const bgGrad = ctx.createLinearGradient(0, 0, width, totalHeight);
      bgGrad.addColorStop(0, "#090d16");
      bgGrad.addColorStop(0.5, "#0d1322");
      bgGrad.addColorStop(1, "#070a12");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, totalHeight);

      // Subtle Grid / Lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, totalHeight);
        ctx.stroke();
      }

      // 2. Header
      // Glowing accent
      const glowGrad = ctx.createRadialGradient(width / 2, 80, 50, width / 2, 80, 600);
      glowGrad.addColorStop(0, "rgba(239, 68, 68, 0.15)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, 180);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 42px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(settingsTitle.toUpperCase(), width / 2, 70);

      // Subtitle
      ctx.fillStyle = "#94a3b8";
      ctx.font = "600 20px sans-serif";
      ctx.fillText(
        `สรุปผลการประเมินทักษะ 7 หมวด 36 ข้อย่อย (คะแนนเต็ม 180) • ผู้ร่วมโหวตทั้งหมด ${summary.totalVoters} คน`,
        width / 2,
        110
      );

      // Date / Timestamp
      ctx.fillStyle = "#fbbf24";
      ctx.font = "700 15px monospace";
      ctx.fillText(
        `GENERATED ON: ${new Date().toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
        width / 2,
        140
      );

      // Helper function to load image safely
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => {
            // Fallback to placeholder if external image fails cors
            const fallback = new Image();
            fallback.src =
              "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e293b'/><text x='50' y='55' fill='%2394a3b8' font-size='30' font-family='sans-serif' text-anchor='middle'>⚽</text></svg>";
            fallback.onload = () => resolve(fallback);
          };
          img.src = src;
        });
      };

      // 3. Render Each Tier Row
      const tierKeys: TierType[] = ["S", "A", "B", "C"];
      const tierStyles = {
        S: { label: "TIER S", range: "136-180 pts", color: "#ef4444", bg: "#7f1d1d" },
        A: { label: "TIER A", range: "91-135 pts", color: "#f59e0b", bg: "#78350f" },
        B: { label: "TIER B", range: "46-90 pts", color: "#10b981", bg: "#064e3b" },
        C: { label: "TIER C", range: "0-45 pts", color: "#3b82f6", bg: "#1e3a8a" },
      };

      for (let i = 0; i < tierKeys.length; i++) {
        const tier = tierKeys[i];
        const style = tierStyles[tier];
        const players = summary.tiers[tier] || [];
        const y = headerHeight + i * rowHeight;

        // Row background
        ctx.fillStyle = i % 2 === 0 ? "rgba(15, 23, 42, 0.85)" : "rgba(30, 41, 59, 0.5)";
        ctx.fillRect(40, y, width - 80, rowHeight - 16);

        // Row border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 2;
        ctx.strokeRect(40, y, width - 80, rowHeight - 16);

        // Tier Header Box (Left Column)
        const headerWidth = 180;
        const tierGrad = ctx.createLinearGradient(40, y, 40 + headerWidth, y + rowHeight - 16);
        tierGrad.addColorStop(0, style.color);
        tierGrad.addColorStop(1, style.bg);
        ctx.fillStyle = tierGrad;
        ctx.fillRect(40, y, headerWidth, rowHeight - 16);

        // Tier Title text
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 36px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(style.label, 40 + headerWidth / 2, y + 80);

        ctx.font = "700 16px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx.fillText(style.range, 40 + headerWidth / 2, y + 115);

        ctx.font = "600 13px sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.fillText(`(${players.length} คน)`, 40 + headerWidth / 2, y + 140);

        // Draw Player Cards in this Tier (sorted left to right by score)
        const cardStartX = 40 + headerWidth + 20;
        const cardWidth = 140;
        const cardGap = 16;

        if (players.length === 0) {
          ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
          ctx.font = "italic 600 18px sans-serif";
          ctx.textAlign = "left";
          ctx.fillText("ไม่มีผู้เล่นใน Tier นี้", cardStartX + 20, y + (rowHeight - 16) / 2 + 6);
        } else {
          for (let pIdx = 0; pIdx < Math.min(players.length, 8); pIdx++) {
            const player = players[pIdx];
            const px = cardStartX + pIdx * (cardWidth + cardGap);
            const py = y + 14;
            const pHeight = rowHeight - 44;

            // Player card box
            ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
            ctx.fillRect(px, py, cardWidth, pHeight);

            // Card border
            ctx.strokeStyle = style.color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px, py, cardWidth, pHeight);

            // Player Avatar
            const avatarSize = 74;
            const ax = px + (cardWidth - avatarSize) / 2;
            const ay = py + 12;

            try {
              const img = await loadImage(player.candidate.avatarUrl);
              ctx.save();
              ctx.beginPath();
              ctx.arc(ax + avatarSize / 2, ay + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
              ctx.closePath();
              ctx.clip();
              ctx.drawImage(img, ax, ay, avatarSize, avatarSize);
              ctx.restore();

              // Avatar ring
              ctx.strokeStyle = style.color;
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(ax + avatarSize / 2, ay + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
              ctx.stroke();
            } catch (err) {
              // Ignore image load error
            }

            // Player Rank Pill
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(px + 6, py + 6, 26, 20);
            ctx.fillStyle = "#fbbf24";
            ctx.font = "800 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`#${player.overallRank}`, px + 19, py + 20);

            // Player Name (truncate if long)
            ctx.fillStyle = "#ffffff";
            ctx.font = "700 13px sans-serif";
            ctx.textAlign = "center";
            const displayName = player.candidate.nickname
              ? player.candidate.nickname
              : player.candidate.name.split(" ")[0];
            ctx.fillText(displayName, px + cardWidth / 2, py + avatarSize + 30);

            // Position
            ctx.fillStyle = "#94a3b8";
            ctx.font = "500 10px sans-serif";
            const pos = player.candidate.position?.split(" ")[0] || "Player";
            ctx.fillText(pos, px + cardWidth / 2, py + avatarSize + 44);

            // Score Badge
            const scoreGrad = ctx.createLinearGradient(px + 10, 0, px + cardWidth - 10, 0);
            scoreGrad.addColorStop(0, style.color);
            scoreGrad.addColorStop(1, style.bg);
            ctx.fillStyle = scoreGrad;
            ctx.fillRect(px + 10, py + pHeight - 24, cardWidth - 20, 20);

            ctx.fillStyle = "#ffffff";
            ctx.font = "900 12px monospace";
            ctx.fillText(`${player.totalScore.toFixed(1)} pts`, px + cardWidth / 2, py + pHeight - 10);
          }
        }
      }

      // 4. Footer
      ctx.fillStyle = "#64748b";
      ctx.font = "600 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚽ POWERED BY FOOTBALL SKILLS TIER LIST APP • 7 CATEGORIES 36 CRITERIA", width / 2, totalHeight - 28);

      // Export preview URL
      const dataUrl = canvas.toDataURL("image/png");
      setImagePreviewUrl(dataUrl);
      setIsGenerating(false);
    };

    renderCanvas();
  }, [summary, settingsTitle]);

  const handleDownload = () => {
    if (!imagePreviewUrl) return;
    const link = document.createElement("a");
    link.download = `Football_Tier_List_${Date.now()}.png`;
    link.href = imagePreviewUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full p-6 shadow-2xl space-y-5 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg sm:text-xl">
                ระบบสร้างรูปภาพ Tier List (PNG Export)
              </h3>
              <p className="text-xs text-slate-400">
                รูปภาพความละเอียดสูง เรนเดอร์จัดเรียงตามคะแนน 7 หมวด 36 ข้อย่อย
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden Canvas for computation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Preview Area */}
        <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
          {isGenerating ? (
            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
              <p className="text-sm font-semibold">กำลังคำนวณและเรนเดอร์รูปภาพ Tier List...</p>
            </div>
          ) : imagePreviewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imagePreviewUrl}
              alt="Tier List Export Preview"
              className="max-h-[60vh] w-auto rounded-xl shadow-2xl border border-slate-800 object-contain"
            />
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-400">
            * เกณฑ์การจัด Tier: Tier S (136-180), Tier A (91-135), Tier B (46-90), Tier C (0-45)
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating || !imagePreviewUrl}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-500 to-emerald-600 hover:opacity-95 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดรูปภาพ (Download PNG)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
