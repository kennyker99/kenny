// SWEA MI6 — Reference Page
// Design: Educational guide for all 6 MI6 indicators

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { INDICATOR_DEFINITIONS } from "@/lib/swea-data";

const INDICATOR_DETAILS = {
  candlestick: {
    overview: "蜡烛形态（Candlestick Pattern）是技术分析的基础，通过单根或多根K线的形状和组合，反映市场参与者的情绪和多空力量对比。",
    howToUse: [
      "观察K线的实体大小：实体越大，方向性越强",
      "观察影线长度：长影线代表价格被强力拒绝",
      "结合趋势背景：同样的K线在不同趋势中意义不同",
      "等待收盘确认：未收盘的K线形态不可靠",
    ],
    keyPatterns: [
      { name: "锤子线 / 倒锤子线", signal: "bullish", desc: "下影线长，实体小，出现在下跌末端，预示反转" },
      { name: "流星线 / 上吊线", signal: "bearish", desc: "上影线长，实体小，出现在上涨末端，预示反转" },
      { name: "看涨/看跌吞没", signal: "both", desc: "后一根K线完全包含前一根，方向相反，强势反转信号" },
      { name: "早晨之星 / 黄昏之星", signal: "both", desc: "三根K线组合，中间为小实体，第三根收回第一根50%以上" },
      { name: "十字星", signal: "neutral", desc: "开收盘价相近，多空力量均衡，通常预示变盘" },
    ],
  },
  chartPattern: {
    overview: "图表形态（Chart Pattern）是价格在一段时间内形成的可识别结构，分为反转形态（预示趋势改变）和持续形态（预示趋势延续）。",
    howToUse: [
      "识别形态需要足够的时间和价格数据",
      "等待形态完成（突破颈线/边界）后再入场",
      "量价配合：突破时成交量应放大",
      "计算目标位：通常等于形态高度",
    ],
    keyPatterns: [
      { name: "头肩顶 / 倒头肩", signal: "both", desc: "三个峰值/谷值，中间最高/低，颈线突破确认" },
      { name: "双顶 (M顶) / 双底 (W底)", signal: "both", desc: "两个相近的高点/低点，颈线突破后确认" },
      { name: "旗形 / 楔形", signal: "both", desc: "急速运动后的整理形态，通常沿原方向突破" },
      { name: "三角形", signal: "neutral", desc: "收敛形态，突破方向决定后续走势" },
      { name: "矩形整理", signal: "neutral", desc: "价格在两条水平线间震荡，突破方向为信号" },
    ],
  },
  trendPattern: {
    overview: "趋势形态（Trend Pattern）分析价格的整体运动方向和结构，是判断市场大方向的核心工具。SWEA MI6 使用艾略特波浪理论来识别趋势阶段。",
    howToUse: [
      "上升趋势：高点不断升高（HH），低点不断升高（HL）",
      "下降趋势：高点不断降低（LH），低点不断降低（LL）",
      "趋势转换：出现结构性破坏，如上升趋势中跌破前低",
      "艾略特波浪：识别当前处于哪个浪段，判断后续走势",
    ],
    keyPatterns: [
      { name: "强势上升趋势", signal: "bullish", desc: "连续的 HH + HL 结构，均线向上排列" },
      { name: "强势下降趋势", signal: "bearish", desc: "连续的 LH + LL 结构，均线向下排列" },
      { name: "艾略特第3浪", signal: "bullish", desc: "最强的上升浪，通常最长，动能最强" },
      { name: "艾略特C浪", signal: "bearish", desc: "ABC调整结构中的最后下跌浪" },
      { name: "横盘震荡", signal: "neutral", desc: "价格在区间内来回，无明确方向" },
    ],
  },
  fibonacci: {
    overview: "斐波那契回撤/扩展（Fibonacci Retracement/Extension）基于黄金比例，用于预测价格回调的支撑位和趋势延续的目标位。",
    howToUse: [
      "上升趋势：从波段低点拉到高点，寻找回调支撑",
      "下降趋势：从波段高点拉到低点，寻找反弹阻力",
      "61.8%（黄金比例）是最重要的回撤位",
      "扩展位 127.2% 和 161.8% 用于预测目标价",
    ],
    keyPatterns: [
      { name: "38.2% 回撤", signal: "both", desc: "浅回撤，趋势强时常见的支撑/阻力位" },
      { name: "50% 回撤", signal: "both", desc: "中等回撤，心理重要位置" },
      { name: "61.8% 回撤（黄金比例）", signal: "both", desc: "最重要的回撤位，强势趋势的最大回撤" },
      { name: "127.2% 扩展", signal: "both", desc: "第一个常见目标位" },
      { name: "161.8% 扩展", signal: "both", desc: "强势趋势的主要目标位" },
    ],
  },
  bollingerBand: {
    overview: "布林带（Bollinger Band）由中轨（20日SMA）和上下轨（±2标准差）组成，用于衡量价格的相对高低位和市场波动率。",
    howToUse: [
      "价格触及上轨：相对偏高，可能回调（但强趋势中可持续）",
      "价格触及下轨：相对偏低，可能反弹（但强下跌中可持续）",
      "布林带收窄：波动率降低，即将出现大幅突破",
      "布林带扩张：波动率增加，趋势可能加速",
    ],
    keyPatterns: [
      { name: "触及下轨反弹", signal: "bullish", desc: "价格触及下轨后出现看涨K线，超卖反弹信号" },
      { name: "触及上轨回落", signal: "bearish", desc: "价格触及上轨后出现看跌K线，超买回落信号" },
      { name: "收窄后向上突破", signal: "bullish", desc: "低波动整理后向上突破，趋势启动信号" },
      { name: "收窄后向下突破", signal: "bearish", desc: "低波动整理后向下突破，下跌趋势启动" },
      { name: "沿上轨上行", signal: "bullish", desc: "强势上升趋势，价格持续贴近上轨" },
    ],
  },
  movingAverage: {
    overview: "20日均线（MA20）是最常用的短中期趋势参考线，反映过去20根K线的平均成本，是动态支撑/阻力位。",
    howToUse: [
      "价格在MA20上方：短期趋势偏多",
      "价格在MA20下方：短期趋势偏空",
      "MA20向上倾斜 + 价格在其上方 = 强势多头",
      "价格回调至MA20反弹：趋势延续的买入机会",
    ],
    keyPatterns: [
      { name: "价格在MA20上方", signal: "bullish", desc: "多头控盘，短期趋势向上" },
      { name: "回调至MA20反弹", signal: "bullish", desc: "上升趋势中的买入机会，MA20提供支撑" },
      { name: "价格在MA20下方", signal: "bearish", desc: "空头控盘，短期趋势向下" },
      { name: "反弹至MA20受阻", signal: "bearish", desc: "下降趋势中的卖出机会，MA20提供阻力" },
      { name: "金叉 / 死叉", signal: "both", desc: "短期MA与MA20的交叉，趋势转换信号" },
    ],
  },
};

export default function ReferencePage() {
  const [expandedId, setExpandedId] = useState<string | null>("candlestick");

  const indicators = Object.values(INDICATOR_DEFINITIONS);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border bg-card/50 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <BookOpen size={18} className="text-primary" />
            <div>
              <h1
                className="text-lg font-bold text-foreground"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                指标说明 · Reference
              </h1>
              <p className="text-xs text-muted-foreground">
                SWEA MI6 六大指标判断标准与检查清单
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* MI6 System Overview */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <h2
            className="text-base font-bold text-primary mb-2"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SWEA MI6 系统概览
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            MI6 是 SWEA 交易系统的核心信号框架，通过 6 个维度的综合分析来判断当前市场是否具备高概率的交易机会。
            当多数指标方向一致时，信号可靠性显著提升。
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "5-6 项看涨", result: "强烈多头信号", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { label: "4 项看涨", result: "多头信号", color: "text-emerald-500 bg-emerald-500/8 border-emerald-500/15" },
              { label: "5-6 项看跌", result: "强烈空头信号", color: "text-red-400 bg-red-500/10 border-red-500/20" },
              { label: "4 项看跌", result: "空头信号", color: "text-red-500 bg-red-500/8 border-red-500/15" },
              { label: "多空相近", result: "信号混乱，观望", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
              { label: "多项中性", result: "无明确信号", color: "text-slate-400 bg-slate-700/30 border-slate-600/20" },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg border p-3 ${item.color}`}>
                <div className="text-xs font-semibold">{item.label}</div>
                <div className="text-xs opacity-80 mt-0.5">{item.result}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicator accordion */}
        {indicators.map((indicator) => {
          const detail = INDICATOR_DETAILS[indicator.id as keyof typeof INDICATOR_DETAILS];
          const isExpanded = expandedId === indicator.id;
          const categoryColor =
            indicator.category === "PA"
              ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
              : "text-purple-400 bg-purple-500/10 border-purple-500/20";

          return (
            <div
              key={indicator.id}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : indicator.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/30 transition-colors duration-150"
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded border font-mono flex-shrink-0 ${categoryColor}`}>
                  {indicator.category}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-sm font-bold text-foreground"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {indicator.name}
                    </h3>
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {indicator.nameEn}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {indicator.description}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                )}
              </button>

              {isExpanded && detail && (
                <div className="px-4 pb-5 space-y-5 border-t border-border">
                  {/* Overview */}
                  <div className="pt-4">
                    <p className="text-sm text-foreground/80 leading-relaxed">{detail.overview}</p>
                  </div>

                  {/* How to use */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      使用方法
                    </h4>
                    <div className="space-y-1.5">
                      {detail.howToUse.map((tip, i) => (
                        <div key={i} className="flex gap-2 text-sm text-foreground/70">
                          <span className="text-primary flex-shrink-0 font-mono text-xs mt-0.5">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key patterns */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      关键形态 / 信号
                    </h4>
                    <div className="space-y-2">
                      {detail.keyPatterns.map((pattern, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {pattern.signal === "bullish" ? (
                              <TrendingUp size={14} className="text-emerald-400" />
                            ) : pattern.signal === "bearish" ? (
                              <TrendingDown size={14} className="text-red-400" />
                            ) : pattern.signal === "both" ? (
                              <div className="flex flex-col gap-0.5">
                                <TrendingUp size={10} className="text-emerald-400" />
                                <TrendingDown size={10} className="text-red-400" />
                              </div>
                            ) : (
                              <Minus size={14} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-foreground">
                              {pattern.name}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {pattern.desc}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick reference */}
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      快速检查清单
                    </h4>
                    <div className="space-y-1">
                      {indicator.reference.map((ref, i) => (
                        <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="text-primary flex-shrink-0">›</span>
                          <span>{ref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer note */}
        <div className="text-center py-6 text-xs text-muted-foreground/50">
          SWEA MI6 Signal Analyzer · Traderpreneur Community
          <br />
          本工具仅供学习参考，不构成投资建议
        </div>
      </div>
    </div>
  );
}
