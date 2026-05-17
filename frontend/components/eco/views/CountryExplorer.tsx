"use client";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { MapPin, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CN: "China", DE: "Germany", JP: "Japan",
  IN: "India", GB: "United Kingdom", BR: "Brazil", FR: "France",
  IT: "Italy", CA: "Canada", KR: "South Korea", AU: "Australia",
  MX: "Mexico", ID: "Indonesia", TR: "Turkey", SA: "Saudi Arabia",
  RU: "Russia", ZA: "South Africa", AR: "Argentina", NG: "Nigeria",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", CN: "🇨🇳", DE: "🇩🇪", JP: "🇯🇵", IN: "🇮🇳", GB: "🇬🇧",
  BR: "🇧🇷", FR: "🇫🇷", IT: "🇮🇹", CA: "🇨🇦", KR: "🇰🇷", AU: "🇦🇺",
  MX: "🇲🇽", ID: "🇮🇩", TR: "🇹🇷", SA: "🇸🇦", RU: "🇷🇺", ZA: "🇿🇦",
  AR: "🇦🇷", NG: "🇳🇬",
};

function MetricCard({ label, value, unit, color, icon: Icon }: {
  label: string; value: number | null | undefined; unit: string;
  color: string; icon: React.ElementType;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={11} style={{ color }} />
        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
      </div>
      <p className="text-[20px] font-black font-mono" style={{ color: value != null ? color : "#374151" }}>
        {value != null ? `${value.toFixed(1)}${unit}` : "—"}
      </p>
    </div>
  );
}

export default function CountryExplorer() {
  const { data }     = useGeoTera();
  const wb           = data?.worldbank?.countries ?? {};
  const popData      = data?.population?.countries ?? [];
  const [query,  setQuery]   = useState("");
  const [codeA,  setCodeA]   = useState("US");
  const [codeB,  setCodeB]   = useState("CN");
  const [compare, setCompare] = useState(false);

  const allCodes = Object.keys(wb).filter(c => COUNTRY_NAMES[c]);

  const filtered = useMemo(() =>
    allCodes.filter(c => {
      const name = COUNTRY_NAMES[c] ?? "";
      return name.toLowerCase().includes(query.toLowerCase()) || c.toLowerCase().includes(query.toLowerCase());
    }), [query, allCodes]);

  const countryA = wb[codeA];
  const countryB = wb[codeB];

  const popA = popData.find(p => p.name.toLowerCase().includes(COUNTRY_NAMES[codeA]?.toLowerCase() ?? ""))?.population;
  const popB = compare ? popData.find(p => p.name.toLowerCase().includes(COUNTRY_NAMES[codeB]?.toLowerCase() ?? ""))?.population : null;

  const radarData = (code: string, d: typeof countryA) => [
    { subject: "GDP Growth",   value: Math.min(100, Math.max(0, ((d?.gdp_growth ?? 0) + 5) * 8)), fullMark: 100 },
    { subject: "Low Inflation",value: Math.min(100, Math.max(0, 100 - (d?.inflation ?? 5) * 10)), fullMark: 100 },
    { subject: "Employment",   value: Math.min(100, Math.max(0, 100 - (d?.unemployment ?? 5) * 6)), fullMark: 100 },
    { subject: "Fiscal",       value: Math.min(100, Math.max(0, 100 - (d?.debt_to_gdp ?? 50) * 0.5)), fullMark: 100 },
    { subject: "GDP/Capita",   value: Math.min(100, ((d?.gdp_per_capita ?? 0) / 1000)), fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <MapPin size={14} className="text-[#fbbf24]" />
        <h2 className="text-sm font-black text-white">Country Economic Explorer</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <button
          onClick={() => setCompare(!compare)}
          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border
            ${compare ? "bg-[#fbbf24]/15 text-[#fbbf24] border-[#fbbf24]/30" : "bg-white/[0.03] text-gray-600 border-white/[0.06] hover:text-gray-400"}`}
        >
          {compare ? "✓ Compare Mode" : "Compare Mode"}
        </button>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-4 gap-3">

        {/* Country selector */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col overflow-hidden">
          <div className="p-2 border-b border-white/[0.04] flex-shrink-0">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5">
              <Search size={11} className="text-gray-600" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search country…"
                className="flex-1 bg-transparent text-[10px] text-white placeholder-gray-700 outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.map(code => {
              const isA = code === codeA;
              const isB = code === codeB && compare;
              return (
                <button
                  key={code}
                  onClick={() => compare && !isA ? setCodeB(code) : setCodeA(code)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-all hover:bg-white/[0.04]
                    ${isA ? "bg-[#00d4ff]/8 border-l-2 border-l-[#00d4ff]" : isB ? "bg-[#fbbf24]/8 border-l-2 border-l-[#fbbf24]" : "border-l-2 border-l-transparent"}`}
                >
                  <span className="text-base">{COUNTRY_FLAGS[code] ?? "🌐"}</span>
                  <div>
                    <p className="text-[10px] font-bold" style={{ color: isA ? "#00d4ff" : isB ? "#fbbf24" : "#e2e8f0" }}>
                      {COUNTRY_NAMES[code]}
                    </p>
                    <p className="text-[8px] text-gray-600">{code}</p>
                  </div>
                  {isA && <span className="ml-auto text-[8px] text-[#00d4ff] font-bold">A</span>}
                  {isB && <span className="ml-auto text-[8px] text-[#fbbf24] font-bold">B</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Country A detail */}
        <div className="col-span-2 flex flex-col gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={codeA}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3 h-full"
            >
              {/* Country header */}
              <div className="bg-gradient-to-r from-[#00d4ff]/8 to-transparent border border-[#00d4ff]/15 rounded-xl px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <span className="text-3xl">{COUNTRY_FLAGS[codeA] ?? "🌐"}</span>
                <div>
                  <p className="text-[9px] text-[#00d4ff] font-bold uppercase tracking-widest">{codeA}</p>
                  <p className="text-xl font-black text-white">{COUNTRY_NAMES[codeA] ?? codeA}</p>
                  {popA && <p className="text-[9px] text-gray-500 mt-0.5">Population: {popA.toLocaleString()}</p>}
                </div>
                {countryA?.gdp_per_capita && (
                  <div className="ml-auto text-right">
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest">GDP per Capita</p>
                    <p className="text-[16px] font-black text-white">${countryA.gdp_per_capita.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                  </div>
                )}
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                <MetricCard label="GDP Growth" value={countryA?.gdp_growth}  unit="%" color="#00d4ff" icon={TrendingUp} />
                <MetricCard label="Inflation"  value={countryA?.inflation}   unit="%" color="#f59e0b" icon={TrendingUp} />
                <MetricCard label="Unemployment" value={countryA?.unemployment} unit="%" color="#ff3366" icon={TrendingDown} />
                <MetricCard label="Debt / GDP" value={countryA?.debt_to_gdp} unit="%" color="#a78bfa" icon={Minus} />
              </div>

              {/* Radar */}
              <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col">
                <p className="text-[9px] font-black text-[#00d4ff] uppercase tracking-widest mb-2">Economic Health Score</p>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData(codeA, countryA)} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 8 }} />
                    <Radar name={codeA} dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={1.5} />
                    {compare && countryB && (
                      <Radar name={codeB} dataKey="value" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.1} strokeWidth={1.5}
                        data={radarData(codeB, countryB)} />
                    )}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Country B (compare mode) */}
        {compare && (
          <AnimatePresence>
            <motion.div
              key={codeB}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-3"
            >
              <div className="bg-gradient-to-r from-[#fbbf24]/8 to-transparent border border-[#fbbf24]/15 rounded-xl px-4 py-3 flex items-center gap-3 flex-shrink-0">
                <span className="text-3xl">{COUNTRY_FLAGS[codeB] ?? "🌐"}</span>
                <div>
                  <p className="text-[9px] text-[#fbbf24] font-bold uppercase tracking-widest">{codeB}</p>
                  <p className="text-xl font-black text-white">{COUNTRY_NAMES[codeB] ?? codeB}</p>
                  {popB && <p className="text-[9px] text-gray-500 mt-0.5">Pop: {popB.toLocaleString()}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 flex-shrink-0">
                {[
                  { label: "GDP Growth",   value: countryB?.gdp_growth,    vA: countryA?.gdp_growth,   color: "#00d4ff", goodHigh: true  },
                  { label: "Inflation",    value: countryB?.inflation,     vA: countryA?.inflation,    color: "#f59e0b", goodHigh: false },
                  { label: "Unemployment", value: countryB?.unemployment,  vA: countryA?.unemployment, color: "#ff3366", goodHigh: false },
                  { label: "Debt / GDP",   value: countryB?.debt_to_gdp,   vA: countryA?.debt_to_gdp,  color: "#a78bfa", goodHigh: false },
                ].map(m => {
                  const diff = m.value != null && m.vA != null ? m.value - m.vA : null;
                  const betterB = diff != null && (m.goodHigh ? diff > 0 : diff < 0);
                  return (
                    <div key={m.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-2.5">
                      <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold mb-1">{m.label}</p>
                      <div className="flex items-end gap-2">
                        <span className="text-[16px] font-black font-mono" style={{ color: m.color }}>
                          {m.value != null ? `${m.value.toFixed(1)}%` : "—"}
                        </span>
                        {diff != null && (
                          <span className={`text-[9px] font-bold mb-0.5 ${betterB ? "text-[#00ff9d]" : "text-[#ff3366]"}`}>
                            {betterB ? "▲" : "▼"} vs {codeA}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
