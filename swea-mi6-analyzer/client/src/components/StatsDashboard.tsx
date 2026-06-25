// SWEA MI6 — Statistics Dashboard Component
// Design: Plan C — Financial Professional Deep Blue
// Charts: Signal distribution by pair (bar), confidence trend (line), signal pie
// Library: Recharts (built-in)

import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, ReferenceLine,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity, Target, BarChart2, Zap, Download } from "lucide-react";
import { toast } from "sonner";
import type { AnalysisRecord } from "@/lib/swea-data";

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportToCSV(records: AnalysisRecord[]) {
  if (records.length === 0) {
    toast.error("暂无记录可导出");
    return;
  }

  const INDICATOR_NAMES: Record<string, string> = {
    candlestick:   "蜡烛形态",
    chartPattern:  "图表形态",
    trendPattern:  "趋势形态",
    fibonacci:     "斐波那契",
    bollingerBand: "布林带",
    movingAverage: "均线MA20",
  };

  const STATE_LABELS: Record<string, string> = {
    bullish: "看涨",
    bearish: "看跌",
    neutral: "中性",
  };

  const SIGNAL_LABELS_CSV: Record<string, string> = {
    strong_bullish: "强烈多头",
    bullish:        "多头信号",
    strong_bearish: "强烈空头",
    bearish:        "空头信号",
    mixed:          "信号混合",
    no_signal:      "无明确信号",
  };

  const headers = [
    "记录ID", "交易对", "时间框架", "分析日期", "分析时间",
    "蜡烛形态_方向", "蜡烛形态_备注",
    "图表形态_方向", "图表形态_备注",
    "趋势形态_方向", "趋势形态_备注",
    "斐波那契_方向", "斐波那契_备注",
    "布林带_方向",   "布林带_备注",
    "均线MA20_方向", "均线MA20_备注",
    "看涨计数", "看跌计数", "中性计数",
    "净值分", "可信度(%)", "信号等级", "信号描述",
    "备注",
  ];

  const escape = (v: string | undefined) => {
    const s = (v ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = records.map((r) => {
    const d = new Date(r.date);
    const dateStr = d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
    const timeStr = d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    const ind = r.indicators;
    return [
      escape(r.id),
      escape(r.pair),
      escape(r.timeframe),
      escape(dateStr),
      escape(timeStr),
      escape(STATE_LABELS[ind.candlestick.state]),   escape(ind.candlestick.notes),
      escape(STATE_LABELS[ind.chartPattern.state]),  escape(ind.chartPattern.notes),
      escape(STATE_LABELS[ind.trendPattern.state]),  escape(ind.trendPattern.notes),
      escape(STATE_LABELS[ind.fibonacci.state]),     escape(ind.fibonacci.notes),
      escape(STATE_LABELS[ind.bollingerBand.state]), escape(ind.bollingerBand.notes),
      escape(STATE_LABELS[ind.movingAverage.state]), escape(ind.movingAverage.notes),
      r.verdict.bullishCount,
      r.verdict.bearishCount,
      r.verdict.neutralCount,
      r.verdict.netScore,
      r.verdict.confidence,
      escape(SIGNAL_LABELS_CSV[r.verdict.signal]),
      escape(r.verdict.description),
      escape(r.notes ?? ""),
    ].join(",");
  });

  // BOM for Excel UTF-8 compatibility
  const bom = "\uFEFF";
  const csvContent = bom + [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = `SWEA_MI6_Records_${new Date().toISOString().slice(0, 10)}.csv`;
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success(`已导出 ${records.length} 条记录`, { description: filename });
}

// ─── Color constants ──────────────────────────────────────────────────────────
const C = {
  bullish:        "#10b981",
  strongBullish:  "#059669",
  bearish:        "#ef4444",
  strongBearish:  "#dc2626",
  mixed:          "#f59e0b",
  noSignal:       "#475569",
  neutral:        "#64748b",
  gold:           "#f0b429",
  iceBlue:        "#38bdf8",
  gridLine:       "rgba(255,255,255,0.06)",
  axisText:       "#64748b",
  tooltipBg:      "#0f1e35",
  tooltipBorder:  "rgba(240,180,41,0.25)",
};

const SIGNAL_COLORS: Record<string, string> = {
  strong_bullish: C.strongBullish,
  bullish:        C.bullish,
  strong_bearish: C.strongBearish,
  bearish:        C.bearish,
  mixed:          C.mixed,
  no_signal:      C.noSignal,
};

const SIGNAL_LABELS: Record<string, string> = {
  strong_bullish: "强烈多头",
  bullish:        "多头信号",
  strong_bearish: "强烈空头",
  bearish:        "空头信号",
  mixed:          "信号混合",
  no_signal:      "无信号",
};

// ─── Derived stats helpers ────────────────────────────────────────────────────

interface PairStats {
  pair: string;
  total: number;
  bullish: number;
  bearish: number;
  mixed: number;
  noSignal: number;
  avgConfidence: number;
}

interface ConfidenceTrend {
  date: string;
  confidence: number;
  netScore: number;
  pair: string;
  signal: string;
}

interface SignalDist {
  name: string;
  value: number;
  color: string;
}

function derivePairStats(records: AnalysisRecord[]): PairStats[] {
  const map = new Map<string, AnalysisRecord[]>();
  for (const r of records) {
    if (!map.has(r.pair)) map.set(r.pair, []);
    map.get(r.pair)!.push(r);
  }
  return Array.from(map.entries())
    .map(([pair, recs]) => ({
      pair,
      total: recs.length,
      bullish: recs.filter((r) => r.verdict.signal.includes("bullish")).length,
      bearish: recs.filter((r) => r.verdict.signal.includes("bearish")).length,
      mixed:   recs.filter((r) => r.verdict.signal === "mixed").length,
      noSignal: recs.filter((r) => r.verdict.signal === "no_signal").length,
      avgConfidence: Math.round(
        recs.reduce((s, r) => s + r.verdict.confidence, 0) / recs.length
      ),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // top 10 pairs
}

function deriveConfidenceTrend(records: AnalysisRecord[], pair: string): ConfidenceTrend[] {
  const filtered = pair === "all" ? records : records.filter((r) => r.pair === pair);
  return [...filtered]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-30) // last 30 entries
    .map((r) => ({
      date: new Date(r.date).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
      confidence: r.verdict.confidence,
      netScore: r.verdict.netScore,
      pair: r.pair,
      signal: r.verdict.signal,
    }));
}

function deriveSignalDist(records: AnalysisRecord[]): SignalDist[] {
  const counts: Record<string, number> = {
    strong_bullish: 0, bullish: 0, strong_bearish: 0, bearish: 0, mixed: 0, no_signal: 0,
  };
  for (const r of records) counts[r.verdict.signal]++;
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: SIGNAL_LABELS[k], value: v, color: SIGNAL_COLORS[k] }));
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-xs shadow-xl"
      style={{ background: C.tooltipBg, borderColor: C.tooltipBorder }}
    >
      {label && <div className="font-bold text-slate-300 mb-1.5 font-mono">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color || p.fill }} />
          <span className="text-slate-400">{p.name}：</span>
          <span className="font-bold font-mono" style={{ color: p.color || p.fill }}>
            {typeof p.value === "number" && p.name?.includes("可信度") ? `${p.value}%` : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function NetScoreTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div
      className="rounded-xl border px-3 py-2.5 text-xs shadow-xl"
      style={{ background: C.tooltipBg, borderColor: C.tooltipBorder }}
    >
      <div className="font-bold text-slate-300 mb-1 font-mono">{d?.pair} · {label}</div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-slate-400">可信度：</span>
        <span className="font-bold font-mono text-amber-400">{d?.confidence}%</span>
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-slate-400">净值分：</span>
        <span
          className="font-bold font-mono"
          style={{ color: d?.netScore > 0 ? C.bullish : d?.netScore < 0 ? C.bearish : C.neutral }}
        >
          {d?.netScore > 0 ? "+" : ""}{d?.netScore}
        </span>
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-slate-400">信号：</span>
        <span className="font-semibold" style={{ color: SIGNAL_COLORS[d?.signal] }}>
          {SIGNAL_LABELS[d?.signal]}
        </span>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-slate-800/40 p-4 flex items-start gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-400 font-medium">{label}</div>
        <div
          className="text-xl font-bold font-mono mt-0.5 leading-none"
          style={{ color, fontFamily: "'Fira Code', monospace" }}
        >
          {value}
        </div>
        {sub && <div className="text-[10px] text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StatsDashboardProps {
  records: AnalysisRecord[];
}

export default function StatsDashboard({ records }: StatsDashboardProps) {
  return <DashboardInner records={records} />;
}

export { exportToCSV };

function DashboardInner({ records }: { records: AnalysisRecord[] }) {
  const [trendPair, setTrendPair] = useState("all");
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      exportToCSV(records);
      setExporting(false);
    }, 100);
  };

  const pairStats     = useMemo(() => derivePairStats(records), [records]);
  const trendData     = useMemo(() => deriveConfidenceTrend(records, trendPair), [records, trendPair]);
  const signalDist    = useMemo(() => deriveSignalDist(records), [records]);
  const allPairs      = useMemo(() => Array.from(new Set(records.map((r) => r.pair))).sort(), [records]);

  // Summary stats
  const totalRecords  = records.length;
  const bullishCount  = records.filter((r) => r.verdict.signal.includes("bullish")).length;
  const bearishCount  = records.filter((r) => r.verdict.signal.includes("bearish")).length;
  const avgConf       = totalRecords > 0
    ? Math.round(records.reduce((s, r) => s + r.verdict.confidence, 0) / totalRecords)
    : 0;
  const topPair       = pairStats[0]?.pair ?? "—";
  const bullishRate   = totalRecords > 0 ? Math.round((bullishCount / totalRecords) * 100) : 0;

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-slate-800/20 p-10 text-center">
        <BarChart2 size={36} className="mx-auto mb-3 text-slate-700" />
        <p className="text-sm text-slate-400">暂无数据，保存分析记录后即可查看统计图表</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Top bar: Export Button ── */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">
          共 <span className="font-mono font-bold text-slate-400">{records.length}</span> 条记录
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-95"
          style={{
            background: exporting ? "rgba(240,180,41,0.08)" : "rgba(240,180,41,0.12)",
            border: "1px solid rgba(240,180,41,0.30)",
            color: "#f0b429",
            cursor: exporting ? "wait" : "pointer",
          }}
          onMouseEnter={(e) => { if (!exporting) (e.currentTarget as HTMLButtonElement).style.background = "rgba(240,180,41,0.20)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = exporting ? "rgba(240,180,41,0.08)" : "rgba(240,180,41,0.12)"; }}
        >
          <Download size={13} style={{ opacity: exporting ? 0.5 : 1 }} />
          {exporting ? "导出中…" : `导出 CSV (${records.length} 条)`}
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Activity}
          label="总分析次数"
          value={totalRecords}
          sub={`${allPairs.length} 个交易对`}
          color={C.iceBlue}
        />
        <StatCard
          icon={TrendingUp}
          label="多头信号率"
          value={`${bullishRate}%`}
          sub={`${bullishCount} 次多头 / ${bearishCount} 次空头`}
          color={C.bullish}
        />
        <StatCard
          icon={Target}
          label="平均可信度"
          value={`${avgConf}%`}
          sub="所有记录平均值"
          color={C.gold}
        />
        <StatCard
          icon={Zap}
          label="最活跃交易对"
          value={topPair}
          sub={`${pairStats[0]?.total ?? 0} 条记录`}
          color="#a78bfa"
        />
      </div>

      {/* ── Row 1: Signal Distribution Bar + Pie ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Bar chart: signal distribution by pair */}
        <div className="xl:col-span-2 rounded-2xl border border-white/8 bg-slate-800/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className="text-sm font-bold text-slate-200"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                各交易对信号分布
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">每个交易对的多头/空头/混合信号次数</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pairStats} barSize={10} barGap={2} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} vertical={false} />
              <XAxis
                dataKey="pair"
                tick={{ fill: C.axisText, fontSize: 10, fontFamily: "'Fira Code', monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: C.axisText, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: C.axisText, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar dataKey="bullish"  name="多头"   fill={C.bullish}       radius={[3, 3, 0, 0]} />
              <Bar dataKey="bearish"  name="空头"   fill={C.bearish}       radius={[3, 3, 0, 0]} />
              <Bar dataKey="mixed"    name="混合"   fill={C.mixed}         radius={[3, 3, 0, 0]} />
              <Bar dataKey="noSignal" name="无信号" fill={C.noSignal}      radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: overall signal type distribution */}
        <div className="rounded-2xl border border-white/8 bg-slate-800/30 p-5">
          <div className="mb-4">
            <h3
              className="text-sm font-bold text-slate-200"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              信号类型占比
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">全部记录的信号分布</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={signalDist}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {signalDist.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0];
                  const pct = Math.round(((d.value as number) / totalRecords) * 100);
                  return (
                    <div
                      className="rounded-xl border px-3 py-2 text-xs shadow-xl"
                      style={{ background: C.tooltipBg, borderColor: C.tooltipBorder }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: d.payload.color }} />
                        <span className="text-slate-300 font-semibold">{d.name}</span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        <span className="font-mono font-bold text-white">{d.value}</span> 次 ({pct}%)
                      </div>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="space-y-1 mt-1">
            {signalDist.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-400">{d.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-300">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Confidence Trend Line ── */}
      <div className="rounded-2xl border border-white/8 bg-slate-800/30 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3
              className="text-sm font-bold text-slate-200"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              可信度 & 净值分趋势
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">最近 30 条记录的信号强度变化（金线=可信度，蓝线=净值分）</p>
          </div>
          <select
            value={trendPair}
            onChange={(e) => setTrendPair(e.target.value)}
            className="h-8 px-3 rounded-lg border border-white/10 bg-slate-800 text-slate-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500/40 self-start sm:self-auto"
          >
            <option value="all">全部交易对</option>
            {allPairs.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {trendData.length < 2 ? (
          <div className="h-48 flex items-center justify-center text-slate-700 text-sm">
            至少需要 2 条记录才能显示趋势图
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.gridLine} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: C.axisText, fontSize: 10, fontFamily: "'Fira Code', monospace" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="conf"
                domain={[0, 100]}
                tick={{ fill: C.axisText, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                yAxisId="net"
                orientation="right"
                domain={[-6, 6]}
                tick={{ fill: C.axisText, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)}
              />
              <Tooltip content={<NetScoreTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }} />
              <ReferenceLine yAxisId="net" y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <Line
                yAxisId="conf"
                type="monotone"
                dataKey="confidence"
                name="可信度"
                stroke={C.gold}
                strokeWidth={2}
                dot={{ fill: C.gold, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: C.gold, stroke: "#0a1628", strokeWidth: 2 }}
              />
              <Line
                yAxisId="net"
                type="monotone"
                dataKey="netScore"
                name="净值分"
                stroke={C.iceBlue}
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ fill: C.iceBlue, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: C.iceBlue, stroke: "#0a1628", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Row 3: Per-pair avg confidence bar ── */}
      {pairStats.length > 1 && (
        <div className="rounded-2xl border border-white/8 bg-slate-800/30 p-5">
          <div className="mb-4">
            <h3
              className="text-sm font-bold text-slate-200"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              各交易对平均可信度
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">信号强度越高，代表该交易对的分析结果越一致</p>
          </div>
          <div className="space-y-2.5">
            {pairStats.map((ps) => (
              <div key={ps.pair} className="flex items-center gap-3">
                <div
                  className="w-16 text-right text-xs font-bold text-slate-400 flex-shrink-0 font-mono"
                  style={{ fontFamily: "'Fira Code', monospace" }}
                >
                  {ps.pair}
                </div>
                <div className="flex-1 h-5 rounded-full bg-slate-700/40 overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${ps.avgConfidence}%`,
                      background: ps.avgConfidence >= 67
                        ? `linear-gradient(90deg, ${C.bullish}80, ${C.bullish})`
                        : ps.avgConfidence >= 50
                        ? `linear-gradient(90deg, ${C.gold}80, ${C.gold})`
                        : `linear-gradient(90deg, ${C.noSignal}80, ${C.noSignal})`,
                    }}
                  />
                </div>
                <div
                  className="w-10 text-xs font-bold font-mono flex-shrink-0"
                  style={{
                    color: ps.avgConfidence >= 67 ? C.bullish : ps.avgConfidence >= 50 ? C.gold : C.noSignal,
                    fontFamily: "'Fira Code', monospace",
                  }}
                >
                  {ps.avgConfidence}%
                </div>
                <div className="w-8 text-[10px] text-slate-400 flex-shrink-0 text-right">
                  ×{ps.total}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


