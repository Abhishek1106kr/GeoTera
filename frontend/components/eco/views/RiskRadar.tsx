"use client";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Target, AlertTriangle, Shield, Zap } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, PolarRadiusAxis } from "recharts";

const RISK_MATRIX = [
  { id: "yield",     label: "Yield Curve Inversion",     category: "Systemic",  desc: "2Y > 10Y spread — historical recession precursor",          severity: (d: any) => d.inverted ? "CRITICAL" : "LOW" },
  { id: "vix",       label: "Volatility (VIX)",          category: "Market",    desc: "Implied volatility gauge for S&P 500 options",              severity: (d: any) => d.vix > 30 ? "HIGH" : d.vix > 20 ? "MEDIUM" : "LOW" },
  { id: "inflation", label: "Inflation Pressure",        category: "Macro",     desc: "Oil & commodity price signals inflation acceleration",       severity: (d: any) => d.infScore > 55 ? "HIGH" : d.infScore > 35 ? "MEDIUM" : "LOW" },
  { id: "geopolitical",label:"Geopolitical Tension",     category: "External",  desc: "Conflicts & sanctions impact on supply chains & trade",     severity: (_d: any) => "MEDIUM" },
  { id: "fx",        label: "Dollar Strength (DXY)",     category: "Currency",  desc: "Strong dollar pressures EM debt & commodity exporters",     severity: (d: any) => d.dxy > 108 ? "HIGH" : d.dxy > 103 ? "MEDIUM" : "LOW" },
  { id: "credit",    label: "Credit Conditions",         category: "Financial", desc: "Tight credit amplifies recession risk in leveraged sectors", severity: (d: any) => d.inverted ? "HIGH" : "LOW" },
  { id: "recession", label: "Recession Probability",     category: "Systemic",  desc: "Composite model: yields + VIX + breadth + macro data",      severity: (d: any) => d.recScore > 60 ? "CRITICAL" : d.recScore > 40 ? "HIGH" : "LOW" },
  { id: "sentiment", label: "Market Sentiment (F&G)",    category: "Behavioral",desc: "Fear & Greed index — extreme readings signal mean reversion", severity: (d: any) => d.fg != null && (d.fg < 20 || d.fg > 80) ? "HIGH" : "LOW" },
];

const SEV_COLOR: Record<string, string> = {
  CRITICAL: "#ff3366",
  HIGH:     "#f97316",
  MEDIUM:   "#f59e0b",
  LOW:      "#00ff9d",
};
const SEV_BG: Record<string, string> = {
  CRITICAL: "#ff336610",
  HIGH:     "#f9731610",
  MEDIUM:   "#f59e0b10",
  LOW:      "#00ff9d08",
};
const SEV_BORDER: Record<string, string> = {
  CRITICAL: "#ff336625",
  HIGH:     "#f9731625",
  MEDIUM:   "#f59e0b25",
  LOW:      "#00ff9d15",
};

function RiskRow({ risk, d, i }: { risk: typeof RISK_MATRIX[0]; d: any; i: number }) {
  const sev = risk.severity(d);
  const c   = SEV_COLOR[sev];
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.04 }}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 border transition-all hover:brightness-110"
      style={{ background: SEV_BG[sev], borderColor: SEV_BORDER[sev] }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-bold text-white">{risk.label}</p>
          <span className="text-[7px] font-bold text-gray-600 uppercase">{risk.category}</span>
        </div>
        <p className="text-[8px] text-gray-600 leading-snug mt-0.5 line-clamp-1">{risk.desc}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black`} style={{ color: c, background: `${c}20`, border: `1px solid ${c}40` }}>
          {sev}
        </span>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: c }} />
      </div>
    </motion.div>
  );
}

export default function RiskRadar() {
  const { data } = useGeoTera();
  const eco   = data?.economy;
  const macro = eco?.macro;
  const all   = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];
  const neg   = all.filter(m => (m.change_pct ?? 0) < -1.5).length;
  const pos   = all.filter(m => (m.change_pct ?? 0) > 1.5).length;
  const big   = all.filter(m => Math.abs(m.change_pct ?? 0) > 2.5).length;
  let rec = 20 + neg * 9, inf = 30;
  if ((macro?.vix ?? 0) > 35) rec += 18;
  else if ((macro?.vix ?? 0) > 25) rec += 10;
  const inv = macro?.treasury_2y != null && macro?.treasury_10y != null && macro.treasury_2y > macro.treasury_10y;
  if (inv) { rec += 22; inf += 5; }
  const oil = (eco?.commodities ?? []).find(c => c.symbol === "CL=F");
  if ((oil?.change_pct ?? 0) > 2) inf += 15;

  const d = {
    inverted: inv,
    vix: macro?.vix ?? 0,
    dxy: macro?.dxy ?? 100,
    fg: macro?.fear_greed,
    recScore: Math.min(90, Math.max(5, rec)),
    infScore: Math.min(90, Math.max(5, inf)),
  };

  const severities = RISK_MATRIX.map(r => r.severity(d));
  const critCount  = severities.filter(s => s === "CRITICAL").length;
  const highCount  = severities.filter(s => s === "HIGH").length;
  const medCount   = severities.filter(s => s === "MEDIUM").length;

  const overallRisk = critCount > 0 ? "CRITICAL" : highCount >= 2 ? "HIGH" : highCount === 1 ? "MEDIUM" : "LOW";

  const radarData = [
    { subject: "Systemic",   value: critCount > 0 ? 90 : d.recScore               },
    { subject: "Market",     value: Math.min(90, (d.vix / 50) * 100)              },
    { subject: "Macro",      value: d.infScore                                     },
    { subject: "Currency",   value: Math.min(90, Math.max(5, (d.dxy - 90) * 3))  },
    { subject: "Behavioral", value: d.fg != null ? Math.abs(d.fg - 50) * 2 : 30  },
    { subject: "External",   value: 45                                             },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Target size={14} className="text-[#ef4444]" />
        <h2 className="text-sm font-black text-white">Economic Risk Radar</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <div className="flex items-center gap-4 text-[9px]">
          <span style={{ color: SEV_COLOR.CRITICAL }}>CRITICAL: {critCount}</span>
          <span style={{ color: SEV_COLOR.HIGH }}>HIGH: {highCount}</span>
          <span style={{ color: SEV_COLOR.MEDIUM }}>MEDIUM: {medCount}</span>
        </div>
      </div>

      {/* Overall risk badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 px-5 py-3.5 rounded-xl border flex-shrink-0"
        style={{
          background: SEV_BG[overallRisk],
          borderColor: SEV_BORDER[overallRisk],
        }}
      >
        <div className="flex items-center gap-3">
          {overallRisk === "CRITICAL" || overallRisk === "HIGH"
            ? <AlertTriangle size={22} style={{ color: SEV_COLOR[overallRisk] }} />
            : <Shield size={22} style={{ color: SEV_COLOR[overallRisk] }} />
          }
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">Overall Risk Assessment</p>
            <p className="text-2xl font-black" style={{ color: SEV_COLOR[overallRisk] }}>{overallRisk}</p>
          </div>
        </div>
        <div className="flex-1 h-px" style={{ background: SEV_COLOR[overallRisk] + "30" }} />
        <div className="text-right">
          <p className="text-[9px] text-gray-600">{critCount + highCount} elevated risk factors</p>
          <p className="text-[9px] text-gray-600">out of {RISK_MATRIX.length} monitored indicators</p>
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* Risk list */}
        <div className="col-span-2 overflow-y-auto space-y-2">
          {RISK_MATRIX.map((risk, i) => (
            <RiskRow key={risk.id} risk={risk} d={d} i={i} />
          ))}
        </div>

        {/* Radar chart */}
        <div className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex-1 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={11} className="text-[#ef4444]" />
              <p className="text-[9px] font-black text-[#ef4444] uppercase tracking-widest">Multi-Axis Risk Map</p>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 12, right: 20, bottom: 12, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 8 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#374151", fontSize: 7 }} />
                <Radar name="Risk" dataKey="value" stroke="#ef4444" fill="#ef4444" fillOpacity={0.18} strokeWidth={2}
                  style={{ filter: "drop-shadow(0 0 8px rgba(239,68,68,0.4))" }} />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Severity legend */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex-shrink-0">
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold mb-2">Severity Scale</p>
            <div className="space-y-1.5">
              {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: SEV_COLOR[s] }} />
                  <span className="text-[9px] font-bold" style={{ color: SEV_COLOR[s] }}>{s}</span>
                  <span className="text-[8px] text-gray-600 ml-auto">
                    {s === "CRITICAL" ? "Act Now" : s === "HIGH" ? "Monitor" : s === "MEDIUM" ? "Watch" : "Nominal"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
