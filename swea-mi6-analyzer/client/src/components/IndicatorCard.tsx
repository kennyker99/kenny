// SWEA MI6 — Indicator Card Component (Plan C Redesign)
// Design: Financial Professional Deep Blue
// Features: Direction buttons + free-text notes + image upload/preview

import { useRef, useState } from "react";
import {
  ChevronDown, ChevronUp, Info, TrendingDown, TrendingUp, Minus,
  ImagePlus, X, ZoomIn,
} from "lucide-react";
import type { SignalState, IndicatorValue } from "@/lib/swea-data";

interface IndicatorDef {
  id: string;
  name: string;
  nameEn: string;
  category: "PA" | "TA";
  description: string;
  placeholder: string;
  reference: string[];
}

interface IndicatorCardProps {
  indicator: IndicatorDef;
  value: IndicatorValue;
  onChange: (value: IndicatorValue) => void;
  index: number;
}

const STATE_CONFIG = {
  bullish: {
    label: "看涨",
    icon: TrendingUp,
    activeClass: "bg-emerald-500/20 border-emerald-400/70 text-emerald-300",
    inactiveClass: "border-white/10 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400/70",
    cardBorder: "border-emerald-500/25",
    cardBg: "bg-emerald-500/5",
  },
  bearish: {
    label: "看跌",
    icon: TrendingDown,
    activeClass: "bg-red-500/20 border-red-400/70 text-red-300",
    inactiveClass: "border-white/10 text-slate-500 hover:border-red-500/30 hover:text-red-400/70",
    cardBorder: "border-red-500/25",
    cardBg: "bg-red-500/5",
  },
  neutral: {
    label: "中性",
    icon: Minus,
    activeClass: "bg-slate-600/40 border-slate-400/50 text-slate-300",
    inactiveClass: "border-white/10 text-slate-500 hover:border-slate-500/40 hover:text-slate-400",
    cardBorder: "border-white/10",
    cardBg: "bg-slate-800/40",
  },
};

const CATEGORY_STYLE = {
  PA: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  TA: "text-violet-400 bg-violet-500/10 border-violet-500/25",
};

export default function IndicatorCard({ indicator, value, onChange, index }: IndicatorCardProps) {
  const [showRef, setShowRef] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cfg = STATE_CONFIG[value.state];

  const handleStateChange = (state: SignalState) => {
    onChange({ ...value, state });
  };

  const handleNotesChange = (notes: string) => {
    onChange({ ...value, notes });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      onChange({ ...value, imageData: dataUrl });
    };
    reader.readAsDataURL(file);
    // reset input so same file can be re-uploaded
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    onChange({ ...value, imageData: undefined });
  };

  return (
    <>
      <div
        className={`
          rounded-xl border flex flex-col gap-0 overflow-hidden
          ${cfg.cardBorder} ${cfg.cardBg}
          transition-all duration-200
        `}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* ── Header ── */}
        <div className="px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border font-mono tracking-wider ${CATEGORY_STYLE[indicator.category]}`}>
                  {indicator.category}
                </span>
                <span className="text-[10px] text-slate-600 font-mono">#{index + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-100 leading-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
                {indicator.name}
              </h3>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{indicator.nameEn}</p>
            </div>

            {/* Current state pill */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-semibold flex-shrink-0 ${
              value.state === "bullish" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
              value.state === "bearish" ? "text-red-400 bg-red-500/10 border-red-500/30" :
              "text-slate-400 bg-slate-700/40 border-slate-600/30"
            }`}>
              {value.state === "bullish" && <TrendingUp size={10} />}
              {value.state === "bearish" && <TrendingDown size={10} />}
              {value.state === "neutral" && <Minus size={10} />}
              {STATE_CONFIG[value.state].label}
            </div>
          </div>
        </div>

        {/* ── Direction Buttons ── */}
        <div className="px-4 py-3 grid grid-cols-3 gap-2">
          {(["bullish", "bearish", "neutral"] as SignalState[]).map((state) => {
            const c = STATE_CONFIG[state];
            const Icon = c.icon;
            const isActive = value.state === state;
            return (
              <button
                key={state}
                onClick={() => handleStateChange(state)}
                className={`
                  flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg border text-xs font-semibold
                  transition-all duration-150 active:scale-[0.97]
                  ${isActive ? c.activeClass : c.inactiveClass}
                `}
              >
                <Icon size={12} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Free-text Notes ── */}
        <div className="px-4 pb-3">
          <textarea
            value={value.notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder={indicator.placeholder}
            rows={3}
            className="
              w-full px-3 py-2.5 rounded-lg border border-white/8 bg-slate-900/60
              text-xs text-slate-200 placeholder:text-slate-600
              focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/30
              resize-none transition-colors duration-150
              leading-relaxed
            "
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        {/* ── Image Upload ── */}
        <div className="px-4 pb-4">
          {value.imageData ? (
            <div className="relative group rounded-lg overflow-hidden border border-white/10">
              <img
                src={value.imageData}
                alt="K线图截图"
                className="w-full h-28 object-cover"
              />
              {/* Overlay actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-3">
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  <ZoomIn size={13} />
                  查看
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-colors"
                >
                  <X size={13} />
                  删除
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="
                w-full flex items-center justify-center gap-2 py-2.5 rounded-lg
                border border-dashed border-white/10 text-slate-600
                hover:border-amber-500/30 hover:text-amber-500/70
                text-xs transition-all duration-150
              "
            >
              <ImagePlus size={14} />
              <span>上传K线图截图</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>

        {/* ── Reference Toggle ── */}
        <div className="border-t border-white/5">
          <button
            onClick={() => setShowRef(!showRef)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-slate-600 hover:text-slate-400 transition-colors duration-150"
          >
            <Info size={11} />
            <span>判断标准参考</span>
            <div className="flex-1" />
            {showRef ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {showRef && (
            <div className="px-4 pb-4 space-y-2 bg-slate-900/40">
              <p className="text-[11px] text-slate-500 italic">{indicator.description}</p>
              {indicator.reference.map((ref, i) => (
                <div key={i} className="flex gap-2 text-[11px] text-slate-500">
                  <span className="text-amber-500/60 flex-shrink-0 font-mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>{ref}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Lightbox ── */}
      {lightboxOpen && value.imageData && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} />
          </button>
          <img
            src={value.imageData}
            alt="K线图截图"
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
