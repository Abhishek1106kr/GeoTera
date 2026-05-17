"use client";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Building2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, AreaChart, Area,
} from "recharts";

const CENTRAL_BANKS = [
  { id: "fed",   name: "Federal Reserve",      country: "US", flag: "🇺🇸", rate: 4.25, prev: 4.50, color: "#00d4ff" },
  { id: "ecb",   name: "European Central Bank",country: "EU", flag: "🇪🇺", rate: 2.65, prev: 2.90, color: "#a78bfa" },
  { id: "boe",   name: "Bank of England",      country: "UK", flag: "🇬🇧", rate: 4.25, prev: 4.50, color: "#00ff9d" },
  { id: "boj",   name: "Bank of Japan",        country: "JP", flag: "🇯🇵", rate: 0.50, prev: 0.25, color: "#38bdf8" },
  { id: "pboc",  name: "People's Bank of China",country:"CN", flag: "🇨🇳", rate: 3.45, prev: 3.45, color: "#f59e0b" },
  { id: "rba",   name: "Reserve Bank Australia",country:"AU", flag: "🇦🇺", rate: 4.10, prev: 4.35, color: "#fb923c" },
  { id: "snb",   name: "Swiss National Bank",  country: "CH", flag: "🇨🇭", rate: 0.25, prev: 0.50, color: "#4ade80" },
  { id: "rbi",   name: "Reserve Bank of India",country: "IN", flag: "🇮🇳", rate: 6.00, prev: 6.25, color: "#f43f5e" },
];

// Historical Fed rate path (approximate 2020-2026)
const FED_HISTORY = [
  { period: "2020 Q1", rate: 1.75 }, { period: "2020 Q2", rate: 0.25 },
  { period: "2021 Q1", rate: 0.25 }, { period: "2021 Q3", rate: 0.25 },
  { period: "2022 Q1", rate: 0.25 }, { period: "2022 Q2", rate: 1.75 },
  { period: "2022 Q3", rate: 3.25 }, { period: "2022 Q4", rate: 4.50 },
  { period: "2023 Q1", rate: 5.00 }, { period: "2023 Q2", rate: 5.25 },
  { period: "2023 Q3", rate: 5.50 }, { period: "2023 Q4", rate: 5.50 },
  { period: "2024 Q1", rate: 5.50 }, { period: "2024 Q2", rate: 5.25 },
  { period: "2024 Q3", rate: 4.75 }, { period: "2024 Q4", rate: 4.50 },
  { period: "2025 Q1", rate: 4.50 }, { period: "2025 Q2", rate: 4.25 },
  { period: "2025 Q3", rate: 4.00 }, { period: "2025 Q4", rate: 3.75 },
  { period: "2026 Q1", rate: 3.75 }, { period: "2026 Q2", rate: 4.25 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 text-[10px] shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color ?? p.stroke }}>{p.name}: {Number(p.value).toFixed(2)}%</p>
      ))}
    </div>
  );
};

export default function BankingMonetary() {
  const { data } = useGeoTera();
  const macro = data?.economy?.macro;
  const t2y  = macro?.treasury_2y;
  const t5y  = macro?.treasury_5y;
  const t10y = macro?.treasury_10y;
  const t30y = macro?.treasury_30y;
  const inv  = t2y != null && t10y != null && t2y > t10y;

  const yieldData = [
    { term: "2Y",  yield: t2y  ?? null },
    { term: "5Y",  yield: t5y  ?? null },
    { term: "10Y", yield: t10y ?? null },
    { term: "30Y", yield: t30y ?? null },
  ].filter(d => d.yield != null);

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Building2 size={14} className="text-[#38bdf8]" />
        <h2 className="text-sm font-black text-white">Banking & Monetary Systems</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        {inv && (
          <span className="px-2.5 py-1 rounded-full bg-[#ff3366]/10 border border-[#ff3366]/25 text-[8px] font-black text-[#ff3366] animate-pulse">
            ⚠ Yield Curve Inverted
          </span>
        )}
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* Central bank rates */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-white/[0.04] flex-shrink-0">
            <p className="text-[9px] font-black text-[#38bdf8] uppercase tracking-widest">Central Bank Rates</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CENTRAL_BANKS.map((bank, i) => {
              const cut  = bank.rate < bank.prev;
              const hike = bank.rate > bank.prev;
              const diff = bank.rate - bank.prev;
              return (
                <motion.div
                  key={bank.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-3 py-2.5 border-b border-white/[0.03] hover:bg-white/[0.02] transition-all"
                >
                  <span className="text-base flex-shrink-0">{bank.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold text-white truncate">{bank.name}</p>
                    <p className="text-[7px] text-gray-600">{bank.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-black font-mono" style={{ color: bank.color }}>
                      {bank.rate.toFixed(2)}%
                    </p>
                    {(cut || hike) && (
                      <p className={`text-[8px] font-bold ${cut ? "text-[#ff3366]" : "text-[#00ff9d]"}`}>
                        {cut ? "▼" : "▲"} {Math.abs(diff).toFixed(2)}%
                      </p>
                    )}
                    {!cut && !hike && (
                      <p className="text-[8px] text-gray-600">Unchanged</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Fed rate history chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col"
        >
          <p className="text-[9px] font-black text-[#38bdf8] uppercase tracking-widest mb-3 flex-shrink-0">
            Fed Funds Rate History (2020–2026)
          </p>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FED_HISTORY} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="fedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="1 4" />
              <XAxis dataKey="period" tick={{ fill: "#6b7280", fontSize: 7 }} axisLine={false} tickLine={false}
                interval={3} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 8 }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v.toFixed(1)}%`} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={4.25} stroke="#ff3366" strokeDasharray="3 3" label={{ value: "Current", fill: "#ff3366", fontSize: 8 }} />
              <Area type="stepAfter" dataKey="rate" stroke="#00d4ff" strokeWidth={2}
                fill="url(#fedGrad)" dot={false} name="Fed Rate" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Yield curve + reserves */}
        <div className="flex flex-col gap-3">
          {/* Yield curve */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <p className="text-[9px] font-black text-[#00d4ff] uppercase tracking-widest">US Treasury Yield Curve</p>
              {inv && <span className="text-[8px] text-[#ff3366] font-black animate-pulse">INVERTED</span>}
            </div>
            {yieldData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yieldData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="1 4" />
                  <XAxis dataKey="term" tick={{ fill: "#6b7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6b7280", fontSize: 8 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v.toFixed(1)}%`} width={35} domain={["auto", "auto"]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="yield" stroke={inv ? "#ff3366" : "#00d4ff"}
                    strokeWidth={2.5} dot={{ fill: inv ? "#ff3366" : "#00d4ff", r: 5 }} name="Yield"
                    style={{ filter: inv ? "drop-shadow(0 0 6px #ff336680)" : "drop-shadow(0 0 6px #00d4ff80)" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">Awaiting data…</div>
            )}
          </motion.div>

          {/* Key metrics */}
          <div className="space-y-2 flex-shrink-0">
            {[
              { label: "10Y - 2Y Spread", value: t10y != null && t2y != null ? `${(t10y - t2y).toFixed(3)}%` : "—", color: inv ? "#ff3366" : "#00ff9d" },
              { label: "30Y - 10Y Spread", value: t30y != null && t10y != null ? `${(t30y - t10y).toFixed(3)}%` : "—", color: "#38bdf8" },
              { label: "DXY Dollar Index", value: macro?.dxy?.toFixed(2) ?? "—", color: "#f59e0b" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2 flex items-center justify-between"
              >
                <p className="text-[9px] text-gray-600 font-bold">{m.label}</p>
                <p className="text-[12px] font-black font-mono" style={{ color: m.color }}>{m.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[8px] text-gray-700 text-center flex-shrink-0">
        Rates: approximate consensus estimates · Yield data: yfinance live · Not financial advice
      </p>
    </div>
  );
}
