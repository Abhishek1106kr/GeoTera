"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

function RiskGauge({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-black font-mono" style={{ color }}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function computeRiskScores(eco: any) {
  let recessionRisk = 25;
  let volatility = 30;
  let bullishSentiment = 55;

  const all = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];
  const negCount = all.filter((m) => (m.change_pct ?? 0) < -1.5).length;
  const posCount = all.filter((m) => (m.change_pct ?? 0) > 1.5).length;
  const bigMoves = all.filter((m) => Math.abs(m.change_pct ?? 0) > 2).length;

  recessionRisk  = Math.min(85, 20 + negCount * 8);
  volatility     = Math.min(90, 20 + bigMoves * 6);
  bullishSentiment = Math.min(90, Math.max(10, 40 + posCount * 8 - negCount * 6));

  return { recessionRisk, volatility, bullishSentiment };
}

const RISK_FACTORS = [
  { label: "High market volatility detected",   condition: (s: any) => s.volatility > 50 },
  { label: "Broad equity sell-off underway",    condition: (s: any) => s.bullishSentiment < 30 },
  { label: "Commodities signaling inflation",   condition: (s: any) => s.recessionRisk > 40 },
  { label: "Risk-off sentiment elevated",       condition: (s: any) => s.recessionRisk > 55 },
  { label: "Multiple sectors in decline",       condition: (s: any) => s.bullishSentiment < 40 },
  { label: "Markets trending positively",       condition: (s: any) => s.bullishSentiment > 65 },
  { label: "Low volatility — calm session",     condition: (s: any) => s.volatility < 30 },
];

export default function PredictivePanel() {
  const { data } = useGeoTera();
  const eco = data?.economy;
  const scores = computeRiskScores(eco);

  const activeFactors = RISK_FACTORS.filter((f) => f.condition(scores));
  const positives = activeFactors.filter((f) => ["trending positively", "calm session"].some((k) => f.label.includes(k)));
  const negatives = activeFactors.filter((f) => !positives.includes(f));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" /> Predictive Analytics
      </p>

      {/* Risk gauges */}
      <div className="grid grid-cols-3 gap-4">
        <RiskGauge label="Recession Risk" pct={scores.recessionRisk} color={scores.recessionRisk > 60 ? "#ff3366" : scores.recessionRisk > 40 ? "#f97316" : "#00ff9d"} />
        <RiskGauge label="Volatility"     pct={scores.volatility}    color={scores.volatility > 60    ? "#ff3366" : scores.volatility > 40    ? "#ffd700" : "#00d4ff"} />
        <RiskGauge label="Bull Sentiment" pct={scores.bullishSentiment} color={scores.bullishSentiment > 55 ? "#00ff9d" : scores.bullishSentiment > 35 ? "#ffd700" : "#ff3366"} />
      </div>

      {/* Active risk signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {negatives.map((f, i) => (
          <div key={i} className="flex items-center gap-2 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366] flex-shrink-0" />
            <span className="text-[10px] text-gray-500">{f.label}</span>
          </div>
        ))}
        {positives.map((f, i) => (
          <div key={i} className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] flex-shrink-0" />
            <span className="text-[10px] text-gray-500">{f.label}</span>
          </div>
        ))}
        {!activeFactors.length && (
          <div className="col-span-2 text-center text-gray-700 text-xs py-2">Analyzing market signals…</div>
        )}
      </div>

      <p className="text-[9px] text-gray-700 text-center">
        Risk scores computed from live market data · Not financial advice
      </p>
    </div>
  );
}
