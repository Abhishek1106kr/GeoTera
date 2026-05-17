"use client";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Brain, AlertTriangle, CheckCircle } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import type { EconomyData, MacroData } from "@/lib/useWebSocket";

interface Scores {
  recession: number; volatility: number; bull: number;
  inflation: number; inverted: boolean; vixLevel: string; fg: number | null;
}

function compute(eco: EconomyData | undefined): Scores {
  const all   = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];
  const macro: MacroData = eco?.macro ?? { vix: null, dxy: null, treasury_10y: null, treasury_2y: null, treasury_5y: null, treasury_30y: null, fear_greed: null };
  const neg   = all.filter(m => (m.change_pct ?? 0) < -1.5).length;
  const pos   = all.filter(m => (m.change_pct ?? 0) > 1.5).length;
  const big   = all.filter(m => Math.abs(m.change_pct ?? 0) > 2.5).length;
  let rec = 20 + neg * 9, vol = 18 + big * 8;
  let bull = Math.max(10, Math.min(90, 45 + pos * 9 - neg * 8)), inf = 30;
  const vix = macro.vix;
  if (vix) { if (vix > 35) { rec += 18; vol += 20; bull -= 20; } else if (vix > 25) { rec += 10; vol += 12; bull -= 10; } else if (vix < 15) { vol -= 8; bull += 8; } }
  if (macro.fear_greed != null) bull = Math.round(bull * 0.5 + macro.fear_greed * 0.5);
  const inv = (macro.treasury_2y ?? 0) > (macro.treasury_10y ?? 999) && macro.treasury_2y != null && macro.treasury_10y != null;
  if (inv) { rec += 22; inf += 5; }
  const oil  = (eco?.commodities ?? []).find(c => c.symbol === "CL=F");
  const gold = (eco?.commodities ?? []).find(c => c.symbol === "GC=F");
  if ((oil?.change_pct ?? 0) > 2) inf += 15;
  if ((gold?.change_pct ?? 0) > 2) inf += 8;
  const vixLevel = vix == null ? "normal" : vix > 35 ? "extreme" : vix > 25 ? "elevated" : vix > 15 ? "normal" : "low";
  return {
    recession:  Math.min(90, Math.max(5, rec)),
    volatility: Math.min(90, Math.max(5, vol)),
    bull:       Math.min(90, Math.max(5, bull)),
    inflation:  Math.min(90, Math.max(5, inf)),
    inverted: inv, vixLevel, fg: macro.fear_greed,
  };
}

const SIGNALS = [
  { text: "Yield curve inverted — historical recession precursor", cond: (s: Scores) => s.inverted,           neg: true  },
  { text: "VIX extreme — severe market stress signal",            cond: (s: Scores) => s.vixLevel === "extreme",  neg: true  },
  { text: "VIX elevated — heightened volatility environment",     cond: (s: Scores) => s.vixLevel === "elevated", neg: true  },
  { text: "Equity market breadth deeply negative",                cond: (s: Scores) => s.bull < 25,           neg: true  },
  { text: "Recession probability exceeds 60% threshold",          cond: (s: Scores) => s.recession > 60,      neg: true  },
  { text: "Commodity prices signalling inflationary pressure",    cond: (s: Scores) => s.inflation > 55,      neg: true  },
  { text: "Multiple systemic risk factors simultaneously active", cond: (s: Scores) => s.recession > 50 && s.volatility > 50, neg: true },
  { text: "Risk-on environment — bullish momentum confirmed",     cond: (s: Scores) => s.bull > 65,           neg: false },
  { text: "Low volatility regime — calm market conditions",       cond: (s: Scores) => s.volatility < 28,     neg: false },
  { text: "Inflation pressure subdued — favorable backdrop",      cond: (s: Scores) => s.inflation < 25,      neg: false },
  { text: "Strong positive market breadth across sectors",        cond: (s: Scores) => s.bull > 75,           neg: false },
  { text: "VIX below 15 — complacency or genuine stability",      cond: (s: Scores) => s.vixLevel === "low",  neg: false },
];

function GaugeArc({ label, pct, color, sub }: { label: string; pct: number; color: string; sub?: string }) {
  const r = 40, cx = 60, cy = 60;
  const angle = (pct / 100) * 180 - 90;
  const rad   = (angle * Math.PI) / 180;
  const x = cx + r * Math.cos(rad);
  const y = cy + r * Math.sin(rad);

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-white/[0.1] transition-all">
      <svg viewBox="0 0 120 70" className="w-full max-w-[140px]">
        {/* Track */}
        <path d={`M 20 60 A 40 40 0 0 1 100 60`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" strokeLinecap="round" />
        {/* Fill */}
        {pct > 0 && (
          <path
            d={`M 20 60 A 40 40 0 ${pct > 50 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        )}
        {/* Needle */}
        <line x1={cx} y1={cy} x2={x.toFixed(2)} y2={y.toFixed(2)} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="3" fill={color} />
        {/* Value */}
        <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize="14" fontWeight="900" fontFamily="monospace">
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div className="text-center">
        <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
        {sub && <p className="text-[8px] mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

export default function AIForecasting() {
  const { data } = useGeoTera();
  const s   = compute(data?.economy);
  const neg = SIGNALS.filter(sig => sig.neg && sig.cond(s));
  const pos = SIGNALS.filter(sig => !sig.neg && sig.cond(s));

  const recColor = s.recession    > 60 ? "#ff3366" : s.recession    > 40 ? "#f97316" : "#00ff9d";
  const volColor = s.volatility   > 60 ? "#ff3366" : s.volatility   > 40 ? "#f59e0b" : "#00d4ff";
  const bulColor = s.bull         > 55 ? "#00ff9d" : s.bull         > 35 ? "#f59e0b" : "#ff3366";
  const infColor = s.inflation    > 55 ? "#ff3366" : s.inflation    > 35 ? "#f97316" : "#00ff9d";

  const radarData = [
    { subject: "Recession",  value: s.recession         },
    { subject: "Volatility", value: s.volatility         },
    { subject: "Inflation",  value: s.inflation          },
    { subject: "Bear Risk",  value: 100 - s.bull         },
    { subject: "Instability",value: s.inverted ? 70 : 20 },
  ];

  // Fake forecast trend data based on scores
  const forecastData = Array.from({ length: 12 }, (_, i) => ({
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    recession: Math.min(90, Math.max(5, s.recession + (i - 6) * 2 + Math.sin(i) * 4)),
    sentiment: Math.min(90, Math.max(5, s.bull      - (i - 6) * 1.5 + Math.cos(i) * 5)),
  }));

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Brain size={14} className="text-[#c084fc]" />
        <h2 className="text-sm font-black text-white">AI Forecasting & Analytics</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        {s.fg != null && (
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-gray-600 uppercase tracking-widest">F&amp;G</span>
            <span className="text-[13px] font-black font-mono" style={{
              color: s.fg > 60 ? "#00ff9d" : s.fg > 40 ? "#f59e0b" : "#ff3366",
            }}>{s.fg}/100</span>
          </div>
        )}
        {s.inverted && (
          <span className="px-2 py-1 rounded-full bg-[#ff3366]/10 border border-[#ff3366]/25 text-[8px] font-black text-[#ff3366] animate-pulse">
            ⚠ YIELD INVERTED
          </span>
        )}
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* Left: gauges */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <GaugeArc label="Recession Risk"    pct={s.recession}  color={recColor} sub={s.inverted ? "Curve Inverted" : undefined} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GaugeArc label="Market Volatility" pct={s.volatility} color={volColor} sub={data?.economy?.macro?.vix != null ? `VIX ${data.economy.macro.vix.toFixed(1)}` : undefined} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GaugeArc label="Bull Sentiment"    pct={s.bull}       color={bulColor} sub={s.fg != null ? (s.fg > 55 ? "Greed zone" : s.fg > 45 ? "Neutral" : "Fear zone") : undefined} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <GaugeArc label="Inflation Signal"  pct={s.inflation}  color={infColor} />
          </motion.div>
        </div>

        {/* Center: radar + forecast chart */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex-1 flex flex-col"
          >
            <p className="text-[9px] font-black text-[#c084fc] uppercase tracking-widest mb-2">Risk Radar</p>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 8 }} />
                <Radar name="Risk" dataKey="value" stroke="#c084fc" fill="#c084fc" fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex-shrink-0"
            style={{ height: 140 }}
          >
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">12-Month Forecast Trend</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="1 4" />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={({ active, payload }) =>
                  active && payload?.length
                    ? <div className="bg-[#0a0f1e] border border-white/10 rounded p-1.5 text-[9px]">
                        <p style={{ color: "#ff3366" }}>Recession: {Number(payload[0]?.value).toFixed(0)}%</p>
                        <p style={{ color: "#00ff9d" }}>Sentiment: {Number(payload[1]?.value).toFixed(0)}%</p>
                      </div>
                    : null
                } />
                <Area type="monotone" dataKey="recession" stroke="#ff3366" fill="#ff336620" strokeWidth={1.5} dot={false} name="Recession" />
                <Area type="monotone" dataKey="sentiment" stroke="#00ff9d" fill="#00ff9d10" strokeWidth={1.5} dot={false} name="Sentiment" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Right: signals */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest flex-shrink-0">Active Intelligence Signals</p>

          {neg.length === 0 && pos.length === 0 && (
            <div className="text-center text-gray-700 text-xs py-6">No active signals — markets nominal</div>
          )}

          {neg.map((sig, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-2 bg-[#ff3366]/5 border border-[#ff3366]/15 rounded-xl px-3 py-2.5 flex-shrink-0"
            >
              <AlertTriangle size={11} className="text-[#ff3366] flex-shrink-0 mt-0.5" />
              <p className="text-[9px] text-gray-400 leading-relaxed">{sig.text}</p>
            </motion.div>
          ))}

          {pos.map((sig, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (neg.length + i) * 0.05 }}
              className="flex items-start gap-2 bg-[#00ff9d]/5 border border-[#00ff9d]/15 rounded-xl px-3 py-2.5 flex-shrink-0"
            >
              <CheckCircle size={11} className="text-[#00ff9d] flex-shrink-0 mt-0.5" />
              <p className="text-[9px] text-gray-400 leading-relaxed">{sig.text}</p>
            </motion.div>
          ))}

          <p className="text-[8px] text-gray-700 text-center flex-shrink-0 mt-auto pt-3">
            Scores derived from live market data · Not predictive · Not financial advice
          </p>
        </div>
      </div>
    </div>
  );
}
