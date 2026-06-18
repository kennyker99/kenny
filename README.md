# SWEA MI6 — 交易分析系统

> Vernon Tee Traderpreneur Community · SWEA MI6 独创攻略

---

## 📁 仓库结构

```
SWEA_MI6/
├── index.html              # SWEA MI6 主页（GitHub Pages）
├── mi6-scanner.html        # MI6 扫描工具（静态版）
│
├── swea-mi6-analyzer/      # ✅ 完整 React 互动课程分析工具
│   ├── client/             # 前端源码（React 19 + Tailwind 4）
│   │   └── src/
│   │       ├── pages/      # 三大页面：分析器、历史记录、指标说明
│   │       ├── components/ # 核心组件：IndicatorCard、VerdictCard、StatsDashboard
│   │       └── lib/        # 数据层：swea-data.ts（类型定义 + localStorage）
│   ├── package.json
│   └── vite.config.ts
│
└── docs/                   # 📚 SWEA MI6 系统文档资料
    ├── SWEA_Course_Report.md           # 课程综合报告
    ├── SWEA_MI6_System_Architecture.md # 系统架构文档
    ├── SWEA_Website_Specification.md   # 网站开发规范
    └── swea_mi6_data.json              # 完整数据结构（JSON）
```

---

## 🚀 SWEA MI6 Signal Analyzer

**在线访问**：[sweami6analy-hqcfgvwt.manus.space](https://sweami6analy-hqcfgvwt.manus.space)

### 功能特性

| 功能 | 说明 |
|---|---|
| **6 大指标检查** | PA 三项（蜡烛/图表/趋势形态）+ TA 三项（Fibonacci/布林带/MA20） |
| **自由文本输入** | 每项指标可填写自定义描述，不限定固定选项 |
| **K 线图上传** | 每项指标及整体行情均可上传截图，随记录一起保存 |
| **双轴评分系统** | 看涨/看跌/中性计分 + 可信度百分比 + 5 级信号等级 |
| **历史记录** | localStorage 持久化，支持按交易对/时间框架/信号类型筛选 |
| **统计仪表盘** | 信号分布柱状图、占比饼图、可信度趋势折线图、交易对对比 |
| **导出 CSV** | 一键导出所有记录（含 BOM 头，兼容 Excel 中文显示） |
| **PDF 导出** | 单次分析结果可导出为 PDF 报告 |
| **指标说明** | 内置每项指标的判断标准和检查清单 |

### 评分机制

- **看涨 +1 / 看跌 +1（反向）/ 中性 0**
- **可信度** = max(看涨数, 看跌数) / 6 × 100%
- **5 级信号**：强烈多头 / 多头信号 / 强烈空头 / 空头信号 / 信号混合 / 无明确信号

### 本地开发

```bash
cd swea-mi6-analyzer
pnpm install
pnpm dev
```

---

## 📚 MI6 独创攻略框架

| 模块 | 名称 | 核心内容 |
|---|---|---|
| MI1 | 汇市趋势 · Fundamental | 通胀体系、央行政策、利率差异 |
| MI2 | 价格行为 · Price Action | 蜡烛形态、图表形态、趋势结构 |
| MI3 | 技术工具 · Technical Analysis | Fibonacci、布林带、MA20 |
| MI4 | 入场时机 · Entry Timing | 信号确认、入场点位、止损设置 |
| MI5 | 风险回报 · Risk & Reward | 仓位管理、RR 比率、资金保护 |
| MI6 | 盈利翻倍 · X-Factor | 多因素共振、信号叠加、利润放大 |

---

*Built with Manus · 2026*
