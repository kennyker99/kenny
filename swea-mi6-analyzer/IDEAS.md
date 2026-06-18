# SWEA MI6 Signal Analyzer — Design Philosophy

## Chosen Approach: "Trading Terminal Dark"

**Design Movement:** Professional Financial Terminal / Bloomberg-inspired Dark Dashboard
**Brand Essence:** The trader's co-pilot — a precision instrument for SWEA MI6 signal verification, built for speed and clarity.
**Personality Adjectives:** Precise · Authoritative · Decisive

### Core Principles
1. **Signal-First Hierarchy** — The 6-indicator grid and final verdict dominate every screen. Nothing competes with the signal output.
2. **Dark Substrate** — Deep navy (#0A1628) background reduces eye strain during long sessions; green/red signal colors pop with maximum contrast.
3. **Monospace Accents** — Ticker symbols, timestamps, and values use monospace font (JetBrains Mono) to evoke terminal authenticity.
4. **Zero Ambiguity** — Every state (bullish/bearish/neutral) has a unique color, icon, and label. Never guess.

### Color Philosophy
- Background: `#0A1628` (deep navy) — calm, focused, professional
- Surface: `#0F1F3D` (card surface) — subtle elevation
- Bullish: `#00C896` (electric teal-green) — clear positive signal
- Bearish: `#FF4D6D` (vivid red-pink) — clear negative signal
- Neutral: `#6B7A99` (slate blue-grey) — no signal / undecided
- Accent: `#3B82F6` (electric blue) — interactive elements, highlights

### Layout Paradigm
- **Left sidebar** for navigation (fixed, collapsible on mobile)
- **Main content area** with two-column indicator grid (PA left, TA right)
- **Sticky verdict bar** at bottom of analyzer page
- **Full-width history table** on history page

### Typography System
- Display / Headings: **Space Grotesk** (bold, geometric, modern)
- Body / Labels: **Inter** (clean, readable)
- Monospace / Data: **JetBrains Mono** (terminal feel for tickers/values)

### Signature Elements
1. Hexagonal badge for the MI6 logo
2. Glowing signal verdict card (green glow for bullish, red for bearish)
3. Animated score meter (0–6 indicators aligned)

### Animation Guidelines
- Indicator state changes: 150ms ease-out color transition
- Verdict card: 200ms scale + opacity entrance
- Score meter fill: 300ms smooth width transition
- Page transitions: 180ms fade
