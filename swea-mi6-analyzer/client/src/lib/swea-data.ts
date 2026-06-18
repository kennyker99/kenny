// SWEA MI6 Signal Analyzer — Core Data Types & Storage
// Design: Plan C — Financial Professional Deep Blue
// Scoring: Dual-axis (bullish/bearish count) + confidence % + 5-tier signal

export type SignalState = "bullish" | "bearish" | "neutral";

export interface IndicatorValue {
  state: SignalState;
  notes: string;       // free-text description by user
  imageData?: string;  // base64 data URL for uploaded screenshot
}

export interface AnalysisRecord {
  id: string;
  pair: string;
  timeframe: string;
  date: string;          // ISO string
  indicators: {
    candlestick: IndicatorValue;
    chartPattern: IndicatorValue;
    trendPattern: IndicatorValue;
    fibonacci: IndicatorValue;
    bollingerBand: IndicatorValue;
    movingAverage: IndicatorValue;
  };
  verdict: VerdictResult;
  chartImage?: string;   // optional overall chart screenshot (base64)
  notes?: string;
}

export interface VerdictResult {
  signal: "strong_bullish" | "bullish" | "strong_bearish" | "bearish" | "mixed" | "no_signal";
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  confidence: number;   // 0–100, = max(bull,bear)/6 * 100
  netScore: number;     // bullishCount - bearishCount (-6 to +6)
  label: string;
  description: string;
}

// ─── Indicator Definitions ────────────────────────────────────────────────────

export const INDICATOR_DEFINITIONS = {
  candlestick: {
    id: "candlestick",
    name: "蜡烛形态",
    nameEn: "Candlestick Pattern",
    category: "PA" as const,
    description: "识别单根或多根K线组合所传递的多空信号",
    placeholder: "例：出现看涨吞没形态，位于支撑位附近，实体较大，影线短",
    reference: [
      "锤子线：下影线 ≥ 实体2倍，出现在下跌趋势末端",
      "吞没形态：后一根K线完全包含前一根，方向相反",
      "早晨之星：三根K线组合，中间为小实体，第三根收回第一根50%以上",
      "针形K线：长影线 ≥ 实体3倍，影线方向指示被拒绝的方向",
      "流星线/上吊线：上影线长，实体小，出现在上涨末端预示反转",
    ],
  },
  chartPattern: {
    id: "chartPattern",
    name: "图表形态",
    nameEn: "Chart Pattern",
    category: "PA" as const,
    description: "识别价格走势中的经典反转或持续形态",
    placeholder: "例：双底形态已完成，颈线位于1.0850，已突破确认",
    reference: [
      "双底：两个相近低点，颈线突破后确认，目标 = 颈线 + 双底高度",
      "头肩顶：左肩→头部→右肩，颈线跌破确认，目标 = 颈线 - 头肩高度",
      "旗形：急速上涨/下跌后的平行通道整理，突破方向延续原趋势",
      "三角形：收敛形态，突破方向决定后续走势",
      "楔形：上升楔形通常看跌，下降楔形通常看涨",
    ],
  },
  trendPattern: {
    id: "trendPattern",
    name: "趋势形态",
    nameEn: "Trend Pattern",
    category: "PA" as const,
    description: "判断当前价格结构的整体趋势方向",
    placeholder: "例：H4级别明显上升趋势，高点低点均在抬高（HH+HL结构）",
    reference: [
      "上升趋势：高点不断升高（HH），低点不断升高（HL）",
      "下降趋势：高点不断降低（LH），低点不断降低（LL）",
      "趋势转换：出现结构性破坏，如上升趋势中跌破前低",
      "艾略特波浪：5浪上升（1-2-3-4-5）+ 3浪下跌（A-B-C）",
      "横盘区间：价格在支撑阻力之间反复震荡，无明显方向",
    ],
  },
  fibonacci: {
    id: "fibonacci",
    name: "斐波那契",
    nameEn: "Fibonacci Extension / Retracement",
    category: "TA" as const,
    description: "价格是否在关键斐波那契回撤或扩展位附近",
    placeholder: "例：价格回调至61.8%黄金比例支撑位，出现止跌迹象",
    reference: [
      "关键回撤位：23.6% / 38.2% / 50% / 61.8% / 78.6%",
      "黄金比例：61.8%回撤是最重要的支撑/阻力位",
      "扩展位：127.2% / 161.8% 用于预测目标价位",
      "使用方法：从波段低点拉到高点（上升趋势），寻找回调支撑",
      "多重斐波那契汇聚区域信号更强",
    ],
  },
  bollingerBand: {
    id: "bollingerBand",
    name: "布林带",
    nameEn: "Bollinger Band",
    category: "TA" as const,
    description: "价格相对于布林带上中下轨的位置及形态",
    placeholder: "例：价格触及下轨后反弹，布林带开始扩张，中轨向上倾斜",
    reference: [
      "布林带参数：20日SMA为中轨，±2标准差为上下轨",
      "触及上轨：价格相对偏高，可能回调（强趋势中可持续）",
      "触及下轨：价格相对偏低，可能反弹（强下跌中可持续）",
      "布林带收窄：波动率降低，即将出现大幅突破",
      "布林带扩张：波动率增加，趋势可能加速",
    ],
  },
  movingAverage: {
    id: "movingAverage",
    name: "均线 MA20",
    nameEn: "Moving Average 20",
    category: "TA" as const,
    description: "价格与20日均线的关系及均线方向",
    placeholder: "例：价格在MA20上方运行，MA20向上倾斜，回调至MA20后反弹",
    reference: [
      "MA20 = 过去20根K线收盘价的算术平均值",
      "价格在MA20上方：短期趋势偏多",
      "价格在MA20下方：短期趋势偏空",
      "MA20向上倾斜 + 价格在其上方 = 强势多头信号",
      "金叉/死叉：短期MA与MA20的交叉是趋势转换信号",
    ],
  },
} as const;

export type IndicatorId = keyof typeof INDICATOR_DEFINITIONS;

// ─── Scoring Engine ───────────────────────────────────────────────────────────
// Logic:
//   bullishCount = count of "bullish" indicators (0–6)
//   bearishCount = count of "bearish" indicators (0–6)
//   neutralCount = count of "neutral" indicators (0–6)
//   netScore = bullishCount - bearishCount (-6 to +6)
//   confidence = max(bullishCount, bearishCount) / 6 * 100
//
// Signal tiers:
//   5-6 bullish  → strong_bullish  (deep green)
//   4   bullish  → bullish         (green)
//   5-6 bearish  → strong_bearish  (deep red)
//   4   bearish  → bearish         (red)
//   |bull-bear| ≤ 1 && neutral ≤ 2 → mixed (amber)
//   else                           → no_signal (slate)

export function calculateVerdict(indicators: AnalysisRecord["indicators"]): VerdictResult {
  const values = Object.values(indicators);
  const bullishCount = values.filter((v) => v.state === "bullish").length;
  const bearishCount = values.filter((v) => v.state === "bearish").length;
  const neutralCount = values.filter((v) => v.state === "neutral").length;
  const confidence = Math.round((Math.max(bullishCount, bearishCount) / 6) * 100);
  const netScore = bullishCount - bearishCount;

  if (bullishCount >= 5) {
    return {
      signal: "strong_bullish", bullishCount, bearishCount, neutralCount, confidence, netScore,
      label: "强烈多头信号",
      description: `${bullishCount}/6 项指标一致看涨，信号高度可靠，可积极寻找做多入场机会。`,
    };
  } else if (bullishCount >= 4) {
    return {
      signal: "bullish", bullishCount, bearishCount, neutralCount, confidence, netScore,
      label: "多头信号",
      description: `${bullishCount}/6 项指标看涨，整体偏多，可寻找做多机会，注意风险管理。`,
    };
  } else if (bearishCount >= 5) {
    return {
      signal: "strong_bearish", bullishCount, bearishCount, neutralCount, confidence, netScore,
      label: "强烈空头信号",
      description: `${bearishCount}/6 项指标一致看跌，信号高度可靠，可积极寻找做空入场机会。`,
    };
  } else if (bearishCount >= 4) {
    return {
      signal: "bearish", bullishCount, bearishCount, neutralCount, confidence, netScore,
      label: "空头信号",
      description: `${bearishCount}/6 项指标看跌，整体偏空，可寻找做空机会，注意风险管理。`,
    };
  } else if (Math.abs(bullishCount - bearishCount) <= 1 && neutralCount <= 2) {
    return {
      signal: "mixed", bullishCount, bearishCount, neutralCount, confidence, netScore,
      label: "信号混合",
      description: `多空信号相互矛盾（多头 ${bullishCount} vs 空头 ${bearishCount}），建议观望等待更清晰信号。`,
    };
  } else {
    return {
      signal: "no_signal", bullishCount, bearishCount, neutralCount, confidence, netScore,
      label: "无明确信号",
      description: `当前 ${neutralCount} 项指标中性，信号不足，建议等待更多市场确认。`,
    };
  }
}

// ─── LocalStorage Persistence ─────────────────────────────────────────────────

const STORAGE_KEY = "swea_mi6_records_v2";

export function loadRecords(): AnalysisRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalysisRecord[];
  } catch {
    return [];
  }
}

export function saveRecord(record: AnalysisRecord): void {
  const records = loadRecords();
  const existingIndex = records.findIndex((r) => r.id === record.id);
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.unshift(record);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function deleteRecord(id: string): void {
  const records = loadRecords().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function getRecordById(id: string): AnalysisRecord | undefined {
  return loadRecords().find((r) => r.id === id);
}

// ─── Default State ────────────────────────────────────────────────────────────

export function createDefaultIndicators(): AnalysisRecord["indicators"] {
  return {
    candlestick:   { state: "neutral", notes: "" },
    chartPattern:  { state: "neutral", notes: "" },
    trendPattern:  { state: "neutral", notes: "" },
    fibonacci:     { state: "neutral", notes: "" },
    bollingerBand: { state: "neutral", notes: "" },
    movingAverage: { state: "neutral", notes: "" },
  };
}

// ─── Common Trading Pairs & Timeframes ───────────────────────────────────────

export const COMMON_PAIRS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "NZDUSD", "USDCAD",
  "GBPJPY", "EURJPY", "EURGBP", "XAUUSD", "BTCUSD", "ETHUSD", "US30", "SPX500",
];

export const TIMEFRAMES = ["M15", "M30", "H1", "H4", "D1", "W1"];

// ─── Color Helpers (Plan C: Deep Blue + Gold + Ice Blue) ─────────────────────

export function getVerdictColor(signal: VerdictResult["signal"]): string {
  switch (signal) {
    case "strong_bullish": return "text-emerald-400";
    case "bullish":        return "text-emerald-500";
    case "strong_bearish": return "text-red-400";
    case "bearish":        return "text-red-500";
    case "mixed":          return "text-amber-400";
    default:               return "text-slate-400";
  }
}

export function getVerdictBg(signal: VerdictResult["signal"]): string {
  switch (signal) {
    case "strong_bullish": return "bg-emerald-500/10 border-emerald-500/40";
    case "bullish":        return "bg-emerald-500/8 border-emerald-500/25";
    case "strong_bearish": return "bg-red-500/10 border-red-500/40";
    case "bearish":        return "bg-red-500/8 border-red-500/25";
    case "mixed":          return "bg-amber-500/10 border-amber-500/35";
    default:               return "bg-slate-500/8 border-slate-500/25";
  }
}

export function getSignalColor(state: SignalState): string {
  switch (state) {
    case "bullish": return "text-emerald-400";
    case "bearish": return "text-red-400";
    default:        return "text-slate-400";
  }
}

export function getSignalBg(state: SignalState): string {
  switch (state) {
    case "bullish": return "bg-emerald-500/8 border-emerald-500/25";
    case "bearish": return "bg-red-500/8 border-red-500/25";
    default:        return "bg-slate-800/60 border-slate-700/40";
  }
}
