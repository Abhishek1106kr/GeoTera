"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, ReferenceLine,
} from "recharts";

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CN: "China", DE: "Germany", JP: "Japan",
  IN: "India", GB: "United Kingdom", BR: "Brazil", FR: "France",
  IT: "Italy", CA: "Canada", KR: "South Korea", AU: "Australia",
  MX: "Mexico", ID: "Indonesia", TR: "Turkey", SA: "Saudi Arabia",
};

type MetricKey = "gdp_growth" | "inflation" | "unemployment" | "debt_to_gdp";

const METRICS: { key: MetricKey; label: string; unit: string; color: string; goodHigh: boolean }[] = [
  { key: "gdp_growth",    label: "GDP Growth",    unit: "%", color: "#00d4ff",  goodHigh: true  },
  { key: "inflation",     label: "Inflation",     unit: "%", color: "#f59e0b",  goodHigh: false },
  { key: "unemployment",  label: "Unemployment",  unit: "%", color: "#ff3366",  goodHigh: false },
  { key: "debt_to_gdp",   label: "Debt / GDP",    unit: "%", color: "#a78bfa",  goodHigh: false },
];

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const v = payload[0].value as number;
  const metric = payload[0].payload.metric as string;
  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 text-[10px] shadow-xl">
      <p className="text-gray-300 font-bold mb-1">{COUNTRY_NAMES[label] ?? label}</p>
      <p style={{ color: payload[0].fill }}>{metric}: {v.toFixed(2)}%</p>
    </div>
  );
};

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 text-[10px] shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {p.value?.toFixed(3)}%</p>
      ))}
    </div>
  );
};

export default function MacroIndicators() {
  const { data } = useGeoTera();
  const [metric, setMetric] = useState<MetricKey>("gdp_growth");
  const wb     = data?.worldbank?.countries ?? {};
  const macro  = data?.economy?.macro;
  const t2y    = macro?.treasury_2y;
  const t5y    = macro?.treasury_5y;
  const t10y   = macro?.treasury_10y;
  const t30y   = macro?.treasury_30y;
  const inv    = t2y != null && t10y != null && t2y > t10y;

  const metaCfg = METRICS.find(m => m.key === metric)!;

  // Country bar chart data
  const barData = Object.entries(wb)
    .filter(([, v]) => v[metric] != null)
    .map(([code, v]) => ({ code, [metric]: v[metric], name: COUNTRY_NAMES[code] ?? code, metric: metaCfg.label }))
    .sort((a, b) => ((b[metric] as number) ?? 0) - ((a[metric] as number) ?? 0))
    .slice(0, 12);

  // Yield curve data
  const yieldData = [
    { label: "2Y",  value: t2y  ?? null },
    { label: "5Y",  value: t5y  ?? null },
    { label: "10Y", value: t10y ?? null },
    { label: "30Y", value: t30y ?? null },
  ].filter(d => d.value != null);

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <BarChart3 size={14} className="text-[#f59e0b]" />
        <h2 className="text-sm font-black text-white">Macroeconomic Indicators</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
      </div>

      {/* Top: macro stat cards */}
      <div className="grid grid-cols-5 gap-2 flex-shrink-0">
        {[
          { label: "VIX",          value: macro?.vix?.toFixed(1) ?? "—",         color: macro?.vix && macro.vix > 25 ? "#ff3366" : "#00ff9d" },
          { label: "DXY",          value: macro?.dxy?.toFixed(2) ?? "—",         color: "#38bdf8" },
          { label: "10Y Yield",    value: t10y != null ? `${t10y.toFixed(3)}%` : "—", color: inv ? "#ff3366" : "#e2e8f0" },
          { label: "2Y Yield",     value: t2y  != null ? `${t2y.toFixed(3)}%` : "—",  color: inv ? "#ff3366" : "#e2e8f0" },
          { label: "Fear & Greed", value: macro?.fear_greed != null ? `${macro.fear_greed}/100` : "—",
            color: macro?.fear_greed != null ? (macro.fear_greed > 55 ? "#00ff9d" : macro.fear_greed > 45 ? "#f59e0b" : "#ff3366") : "#6b7280" },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2.5 text-center"
          >
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{card.label}</p>
            <p className="text-[14px] font-black font-mono mt-0.5" style={{ color: card.color }}>{card.value}</p>
            {card.label === "10Y Yield" && inv && (
              <p className="text-[7px] text-[#ff3366] font-bold mt-0.5">CURVE INVERTED</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* Yield Curve */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black text-[#00d4ff] uppercase tracking-widest">US Yield Curve</p>
            {inv && (
              <span className="text-[8px] text-[#ff3366] font-bold bg-[#ff3366]/10 border border-[#ff3366]/20 px-2 py-0.5 rounded-full">
                ⚠ Inverted
              </span>
            )}
          </div>
          {yieldData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldData} margin={{ top: 4, right: 12, bottom: 4, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="1 4" />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 8 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v.toFixed(1)}%`} width={35} />
                <Tooltip content={<CustomLineTooltip />} />
                {t2y != null && <ReferenceLine y={t2y} stroke="#ff3366" strokeDasharray="3 3" strokeWidth={0.5} />}
                <Line type="monotone" dataKey="value" stroke={inv ? "#ff3366" : "#00d4ff"} strokeWidth={2}
                  dot={{ fill: inv ? "#ff3366" : "#00d4ff", r: 4 }} name="Yield" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">Loading…</div>
          )}
        </motion.div>

        {/* Country comparison bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col"
        >
          {/* Metric selector */}
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Country Comparison:</p>
            <div className="flex gap-1">
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`text-[8px] px-2 py-1 rounded-lg font-bold uppercase tracking-wide transition-all
                    ${metric === m.key ? "text-white" : "text-gray-600 hover:text-gray-400"}`}
                  style={metric === m.key ? { background: `${m.color}18`, color: m.color, border: `1px solid ${m.color}30` } : { border: "1px solid transparent" }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 24 }}>
                <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 8 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${v.toFixed(0)}%`} />
                <YAxis type="category" dataKey="code" tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: 600 }}
                  axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey={metric} radius={[0, 3, 3, 0]} maxBarSize={14}>
                  {barData.map((entry, i) => {
                    const v = (entry[metric] as number) ?? 0;
                    const isGood = metaCfg.goodHigh ? v > 0 : v < (metric === "inflation" ? 3 : metric === "unemployment" ? 5 : 60);
                    return <Cell key={i} fill={isGood ? metaCfg.color : "#6b7280"} fillOpacity={0.8} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">Loading World Bank data…</div>
          )}
        </motion.div>
      </div>

      {/* Bottom: ranked country table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="flex-shrink-0 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                <th className="px-3 py-2 text-left text-[8px] text-gray-600 font-black uppercase tracking-widest">Country</th>
                {METRICS.map(m => (
                  <th key={m.key} className="px-3 py-2 text-right text-[8px] text-gray-600 font-black uppercase tracking-widest">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {Object.entries(wb).slice(0, 8).map(([code, v]) => (
                <tr key={code} className="hover:bg-white/[0.02] transition-all">
                  <td className="px-3 py-1.5">
                    <span className="text-[10px] font-bold text-white">{COUNTRY_NAMES[code] ?? code}</span>
                    <span className="text-[8px] text-gray-600 ml-1.5">({code})</span>
                  </td>
                  {METRICS.map(m => {
                    const val = v[m.key];
                    const isGood = val != null && (m.goodHigh ? val > 0 : val < (m.key === "inflation" ? 3 : m.key === "unemployment" ? 6 : 70));
                    return (
                      <td key={m.key} className="px-3 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {val != null && (
                            isGood
                              ? <ArrowUp size={9} className="text-[#00ff9d]" />
                              : <ArrowDown size={9} className="text-[#ff3366]" />
                          )}
                          <span className={`text-[10px] font-mono font-bold ${
                            val == null ? "text-gray-700" :
                            isGood ? "text-[#00ff9d]" : "text-[#ff3366]"
                          }`}>
                            {val != null ? `${val.toFixed(1)}%` : "—"}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
