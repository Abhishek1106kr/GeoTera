"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import type { EconomyData, MacroData } from "@/lib/useWebSocket";

interface Scores {
  recessionRisk: number;
  volatility: number;
  bullSentiment: number;
  inflationPressure: number;
  yieldInverted: boolean;
  vixLevel: "low" | "normal" | "elevated" | "extreme";
  fearGreed: number | null;
}

function computeScores(eco: EconomyData | undefined): Scores {
  const all = [
    ...(eco?.indices    ?? []),
    ...(eco?.crypto     ?? []),
    ...(eco?.commodities ?? []),
  ];
  const macro: MacroData = eco?.macro ?? {
    vix: null, dxy: null, treasury_10y: null, treasury_2y: null,
    treasury_5y: null, treasury_30y: null, fear_greed: null,
  };

  const negCount  = all.filter(m => (m.change_pct ?? 0) < -1.5).length;
  const posCount  = all.filter(m => (m.change_pct ?? 0) > 1.5).length;
  const bigMoves  = all.filter(m => Math.abs(m.change_pct ?? 0) > 2.5).length;

  let recession  = 20 + negCount * 9;
  let volatility = 18 + bigMoves * 8;
  let bull       = Math.max(10, Math.min(90, 45 + posCount * 9 - negCount * 8));
  let inflation  = 30;

  // Macro adjustments
  const vix = macro.vix;
  if (vix) {
    if (vix > 35) { recession += 18; volatility += 20; bull -= 20; }
    else if (vix > 25) { recession += 10; volatility += 12; bull -= 10; }
    else if (vix < 15) { volatility -= 8; bull += 8; }
  }
  if (macro.fear_greed != null) {
    bull = Math.round((bull * 0.5) + (macro.fear_greed * 0.5));
  }

  const yieldInverted = (macro.treasury_2y ?? 0) > (macro.treasury_10y ?? 999) &&
                        macro.treasury_2y != null && macro.treasury_10y != null;
  if (yieldInverted) { recession += 22; inflation += 5; }

  // Oil/commodity-based inflation signal
  const oil  = (eco?.commodities ?? []).find(c => c.symbol === "CL=F");
  const gold = (eco?.commodities ?? []).find(c => c.symbol === "GC=F");
  if ((oil?.change_pct  ?? 0) > 2) inflation += 15;
  if ((gold?.change_pct ?? 0) > 2) inflation += 8;

  const vixLevel: Scores["vixLevel"] =
    vix == null ? "normal"
    : vix > 35 ? "extreme"
    : vix > 25 ? "elevated"
    : vix > 15 ? "normal"
    : "low";

  return {
    recessionRisk:    Math.min(90, Math.max(5, recession)),
    volatility:       Math.min(90, Math.max(5, volatility)),
    bullSentiment:    Math.min(90, Math.max(5, bull)),
    inflationPressure: Math.min(90, Math.max(5, inflation)),
    yieldInverted,
    vixLevel,
    fearGreed: macro.fear_greed,
  };
}

function GaugeBar({
  label,
  pct,
  color,
  sub,
}: {
  label: string;
  pct: number;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
          {sub && <p className="text-[9px] mt-0.5" style={{ color: `${color}bb` }}>{sub}</p>}
        </div>
        <p className="text-2xl font-black font-mono tabular-nums" style={{ color }}>
          {pct.toFixed(0)}
          <span className="text-sm text-gray-600 font-normal">%</span>
        </p>
      </div>
      {/* Bar */}
      <div className="space-y-1">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}70, ${color})`,
              boxShadow: `0 0 10px ${color}50`,
            }}
          />
        </div>
        {/* 5-segment indicator */}
        <div className="flex gap-1">
          {[0, 20, 40, 60, 80].map(t => (
            <div
              key={t}
              className="flex-1 h-0.5 rounded-full transition-all duration-1000"
              style={{ background: pct > t ? color : "rgba(255,255,255,0.07)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const SIGNALS = [
  { text: "Yield curve inverted — recession signal active",   condition: (s: Scores) => s.yieldInverted,          neg: true  },
  { text: "VIX extreme — severe market stress",              condition: (s: Scores) => s.vixLevel === "extreme",   neg: true  },
  { text: "VIX elevated — caution warranted",                condition: (s: Scores) => s.vixLevel === "elevated",  neg: true  },
  { text: "Broad equity sell-off underway",                  condition: (s: Scores) => s.bullSentiment < 25,       neg: true  },
  { text: "High recession risk probability",                 condition: (s: Scores) => s.recessionRisk > 60,       neg: true  },
  { text: "Commodity prices signalling inflation",           condition: (s: Scores) => s.inflationPressure > 55,   neg: true  },
  { text: "Multiple risk factors simultaneously elevated",   condition: (s: Scores) => s.recessionRisk > 50 && s.volatility > 50, neg: true },
  { text: "Markets risk-on — bullish momentum",             condition: (s: Scores) => s.bullSentiment > 65,        neg: false },
  { text: "Low volatility — calm market conditions",        condition: (s: Scores) => s.volatility < 28,            neg: false },
  { text: "Inflation pressure subdued",                     condition: (s: Scores) => s.inflationPressure < 25,    neg: false },
  { text: "Strong positive market breadth",                 condition: (s: Scores) => s.bullSentiment > 75,        neg: false },
];

export default function PredictivePanel() {
  const { data } = useGeoTera();
  const scores = computeScores(data?.economy);

  const recColor = scores.recessionRisk    > 60 ? "#ff3366" : scores.recessionRisk    > 40 ? "#f97316" : "#00ff9d";
  const volColor = scores.volatility        > 60 ? "#ff3366" : scores.volatility        > 40 ? "#ffd700" : "#00d4ff";
  const bulColor = scores.bullSentiment     > 55 ? "#00ff9d" : scores.bullSentiment     > 35 ? "#ffd700" : "#ff3366";
  const infColor = scores.inflationPressure > 55 ? "#ff3366" : scores.inflationPressure > 35 ? "#f97316" : "#00ff9d";

  const activeSignals = SIGNALS.filter(s => s.condition(scores));
  const negSignals    = activeSignals.filter(s => s.neg);
  const posSignals    = activeSignals.filter(s => !s.neg);

  const radarData = [
    { subject: "Recession",  value: scores.recessionRisk    },
    { subject: "Volatility", value: scores.volatility        },
    { subject: "Inflation",  value: scores.inflationPressure },
    { subject: "Sentiment",  value: 100 - scores.bullSentiment },
    { subject: "Stability",  value: scores.yieldInverted ? 70 : 25 },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Predictive Analytics
        </p>
        <div className="flex items-center gap-3 text-[9px]">
          {scores.fearGreed != null && (
            <span className="text-gray-600">
              F&amp;G{" "}
              <span
                className="font-mono font-bold"
                style={{ color: scores.fearGreed > 55 ? "#00ff9d" : scores.fearGreed > 45 ? "#ffd700" : "#ff3366" }}
              >
                {scores.fearGreed}/100
              </span>
            </span>
          )}
          {scores.yieldInverted && (
            <span className="text-[#ff3366] font-bold bg-[#ff3366]/8 border border-[#ff3366]/20 px-2 py-0.5 rounded-full">
              ⚠ Curve Inverted
            </span>
          )}
        </div>
      </div>

      {/* Gauges + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <GaugeBar
            label="Recession Risk"
            pct={scores.recessionRisk}
            color={recColor}
            sub={scores.yieldInverted ? "Yield curve inverted" : undefined}
          />
          <GaugeBar
            label="Market Volatility"
            pct={scores.volatility}
            color={volColor}
            sub={data?.economy?.macro?.vix != null ? `VIX ${data.economy.macro.vix.toFixed(1)}` : undefined}
          />
          <GaugeBar
            label="Bull Sentiment"
            pct={scores.bullSentiment}
            color={bulColor}
            sub={
              scores.fearGreed != null
                ? scores.fearGreed > 55 ? "Greed zone"
                : scores.fearGreed > 45 ? "Neutral"
                : "Fear zone"
                : undefined
            }
          />
          <GaugeBar
            label="Inflation Signal"
            pct={scores.inflationPressure}
            color={infColor}
          />
        </div>

        {/* Radar */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-center p-2">
          <ResponsiveContainer width="100%" height={130}>
            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#4b5563", fontSize: 8 }} />
              <Radar
                name="Risk"
                dataKey="value"
                stroke="#a78bfa"
                fill="#a78bfa"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active signals */}
      {activeSignals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2">
          {negSignals.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366] flex-shrink-0 animate-pulse" />
              <span className="text-[9px] text-gray-500">{s.text}</span>
            </div>
          ))}
          {posSignals.map((s, i) => (
            <div key={i} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-2.5 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] flex-shrink-0" />
              <span className="text-[9px] text-gray-500">{s.text}</span>
            </div>
          ))}
          {!activeSignals.length && (
            <div className="col-span-full text-center text-gray-700 text-xs py-2">
              No active signals — market conditions nominal
            </div>
          )}
        </div>
      )}

      <p className="text-[8px] text-gray-700 text-center">
        Scores computed from live market data · For informational purposes only · Not financial advice
      </p>
    </div>
  );
}
