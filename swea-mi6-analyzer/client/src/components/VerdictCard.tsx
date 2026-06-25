// SWEA MI6 — Verdict Card Component (Plan C Redesign)
// Design: Financial Professional Deep Blue — Gold + Ice Blue accents
// Features: Dual-axis score, confidence %, 5-tier signal, net score bar

import { AlertTriangle, TrendingDown, TrendingUp, Minus, Zap, Shield } from "lucide-react";
import type { VerdictResult } from "@/lib/swea-data";
import { getVerdictColor, getVerdictBg } from "@/lib/swea-data";

interface VerdictCardProps {
  verdict: VerdictResult;
  compact?: boolean;
}

const SIGNAL_ICONS = {
  strong_bullish: TrendingUp,
  bullish:        TrendingUp,
  strong_bearish: TrendingDown,
  bearish:        TrendingDown,
  mixed:          AlertTriangle,
  no_signal:      Minus,
};

const SIGNAL_STARS: Record<VerdictResult["signal"], number> = {
  strong_bullish: 3,
  bullish:        2,
  strong_bearish: 3,
  bearish:        2,
  mixed:          1,
  no_signal:      0,
};

export default function VerdictCard({ verdict, compact = false }: VerdictCardProps) {
  const Icon = SIGNAL_ICONS[verdict.signal];
  const colorClass = getVerdictColor(verdict.signal);
  const bgClass = getVerdictBg(verdict.signal);
  const stars = SIGNAL_STARS[verdict.signal];
  const isStrong = verdict.signal === "strong_bullish" || verdict.signal === "strong_bearish";
  const isBull = verdict.signal.includes("bullish");
  const isBear = verdict.signal.includes("bearish");

  // Net score bar: -6 (full bear) to +6 (full bull), center = 0
  const netPct = ((verdict.netScore + 6) / 12) * 100; // 0% = -6, 50% = 0, 100% = +6

  return (
    <div className={`rounded-xl border ${bgClass} transition-all duration-300`}>
      {/* ── Main Signal Header ── */}
      <div className="p-5 pb-4">
        <div className="flex items-start gap-3">
          {/* Icon circle */}
          <div className={`
            w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border
            ${isBull ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : ""}
            ${isBear ? "bg-red-500/15 border-red-500/30 text-red-400" : ""}
            ${verdict.signal === "mixed" ? "bg-amber-500/15 border-amber-500/30 text-amber-400" : ""}
            ${verdict.signal === "no_signal" ? "bg-slate-700/40 border-slate-600/30 text-slate-400" : ""}
            ${compact ? "w-10 h-10" : ""}
          `}>
            <Icon size={compact ? 18 : 22} />
          </div>

          <div className="flex-1 min-w-0">
            {/* Stars + Strong badge */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`text-sm ${i < stars ? colorClass : "text-slate-700"}`}>★</span>
                ))}
              </div>
              {isStrong && (
                <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${colorClass} ${
                  isBull ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                }`}>
                  <Zap size={9} />
                  HIGH CONVICTION
                </span>
              )}
            </div>

            {/* Signal label */}
            <h2
              className={`font-bold leading-tight ${colorClass} ${compact ? "text-lg" : "text-xl"}`}
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              {verdict.label}
            </h2>

            {!compact && (
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{verdict.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Score Breakdown ── */}
      <div className="px-5 pb-5 space-y-4">

        {/* Dual-axis count grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-3 rounded-lg bg-emerald-500/8 border border-emerald-500/20">
            <div className="text-2xl font-bold text-emerald-400 leading-none font-mono" style={{ fontFamily: "'Fira Code', monospace" }}>
              {verdict.bullishCount}
            </div>
            <div className="text-[10px] text-emerald-400/60 mt-1 font-semibold tracking-wider">看涨 BULL</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-red-500/8 border border-red-500/20">
            <div className="text-2xl font-bold text-red-400 leading-none font-mono" style={{ fontFamily: "'Fira Code', monospace" }}>
              {verdict.bearishCount}
            </div>
            <div className="text-[10px] text-red-400/60 mt-1 font-semibold tracking-wider">看跌 BEAR</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-700/30 border border-slate-600/20">
            <div className="text-2xl font-bold text-slate-400 leading-none font-mono" style={{ fontFamily: "'Fira Code', monospace" }}>
              {verdict.neutralCount}
            </div>
            <div className="text-[10px] text-slate-400/70 mt-1 font-semibold tracking-wider">中性 NEU</div>
          </div>
        </div>

        {/* Net score bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>← 空头</span>
            <span className={`font-bold text-xs ${colorClass}`}>
              净值 {verdict.netScore > 0 ? "+" : ""}{verdict.netScore}
            </span>
            <span>多头 →</span>
          </div>
          <div className="relative h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
            {/* Center marker */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20 z-10" />
            {/* Fill bar */}
            <div
              className={`absolute top-0 bottom-0 rounded-full transition-all duration-500 ${
                verdict.netScore > 0 ? "bg-emerald-500" :
                verdict.netScore < 0 ? "bg-red-500" : "bg-slate-500"
              }`}
              style={
                verdict.netScore >= 0
                  ? { left: "50%", width: `${(verdict.netScore / 6) * 50}%` }
                  : { right: "50%", width: `${(Math.abs(verdict.netScore) / 6) * 50}%` }
              }
            />
          </div>
        </div>

        {/* Confidence + 6-dot row */}
        <div className="flex items-center justify-between gap-3">
          {/* 6 indicator dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => {
              let dotClass = "bg-slate-700 border-slate-600/40";
              if (i < verdict.bullishCount) dotClass = "bg-emerald-500 border-emerald-400/50 shadow-[0_0_6px_rgba(16,185,129,0.5)]";
              else if (i < verdict.bullishCount + verdict.bearishCount) dotClass = "bg-red-500 border-red-400/50 shadow-[0_0_6px_rgba(239,68,68,0.5)]";
              return (
                <div key={i} className={`w-3 h-3 rounded-full border transition-all duration-300 ${dotClass}`} />
              );
            })}
          </div>

          {/* Confidence badge */}
          <div className="flex items-center gap-1.5">
            <Shield size={11} className="text-amber-500/70" />
            <span className="text-xs font-bold font-mono text-amber-400" style={{ fontFamily: "'Fira Code', monospace" }}>
              {verdict.confidence}%
            </span>
            <span className="text-[10px] text-slate-400">可信度</span>
          </div>
        </div>

        {/* Confidence bar */}
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isBull ? "bg-gradient-to-r from-emerald-600 to-emerald-400" :
              isBear ? "bg-gradient-to-r from-red-600 to-red-400" :
              verdict.signal === "mixed" ? "bg-gradient-to-r from-amber-600 to-amber-400" :
              "bg-slate-600"
            }`}
            style={{ width: `${verdict.confidence}%` }}
          />
        </div>
      </div>
    </div>
  );
}
