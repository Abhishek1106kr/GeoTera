"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { LayoutGrid } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import type { MarketItem } from "@/lib/useWebSocket";

const SECTOR_META: Record<string, { icon: string; short: string; color: string; desc: string }> = {
  "Technology":     { icon: "💻", short: "TECH",  color: "#00d4ff", desc: "Software, hardware, semiconductors" },
  "Financials":     { icon: "🏦", short: "FIN",   color: "#00ff9d", desc: "Banks, insurance, asset management" },
  "Energy":         { icon: "⚡", short: "ENRG",  color: "#f59e0b", desc: "Oil, gas, renewables" },
  "Health Care":    { icon: "🏥", short: "HLTH",  color: "#f43f5e", desc: "Pharma, biotech, medical devices" },
  "Industrials":    { icon: "🏭", short: "INDU",  color: "#94a3b8", desc: "Manufacturing, aerospace, defense" },
  "Communication":  { icon: "📡", short: "COMM",  color: "#a78bfa", desc: "Media, telecom, internet" },
  "Cons. Staples":  { icon: "🛒", short: "STPL",  color: "#84cc16", desc: "Food, beverages, household products" },
  "Cons. Discret.": { icon: "🛍️", short: "DISC",  color: "#fb923c", desc: "Retail, autos, luxury" },
  "Real Estate":    { icon: "🏢", short: "REIT",  color: "#38bdf8", desc: "REITs, property management" },
  "Materials":      { icon: "⚗️", short: "MATL",  color: "#6ee7b7", desc: "Mining, chemicals, paper" },
  "Utilities":      { icon: "🔌", short: "UTIL",  color: "#cbd5e1", desc: "Electric, water, gas utilities" },
};

function SectorHeatCell({ item, i, onClick, selected }: {
  item: MarketItem; i: number; onClick: () => void; selected: boolean;
}) {
  const meta = SECTOR_META[item.name] ?? { icon: "📊", short: "?", color: "#6b7280", desc: "" };
  const pct  = item.change_pct ?? 0;
  const intensity = Math.min(1, Math.abs(pct) / 3);
  const positive  = pct >= 0;
  const baseColor = positive ? "#00ff9d" : "#ff3366";

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: i * 0.04 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative rounded-xl p-3 text-left transition-all overflow-hidden flex flex-col gap-2 border
        ${selected ? "border-white/30" : "border-white/[0.05]"}`}
      style={{
        background: `rgba(${positive ? "0,255,157" : "255,51,102"},${intensity * 0.12})`,
        boxShadow: selected ? `0 0 20px ${baseColor}25` : undefined,
      }}
    >
      {/* Glow overlay */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${baseColor}10, transparent 70%)` }} />
      )}

      <div className="flex items-start justify-between">
        <span className="text-xl">{meta.icon}</span>
        <span
          className={`text-[11px] font-black font-mono ${positive ? "text-[#00ff9d]" : "text-[#ff3366]"}`}
        >
          {positive ? "+" : ""}{pct.toFixed(2)}%
        </span>
      </div>

      <div>
        <p className="text-[9px] font-black text-white">{meta.short}</p>
        <p className="text-[7px] text-gray-600 leading-tight mt-0.5 line-clamp-1">{item.name}</p>
      </div>

      {item.price != null && (
        <p className="text-[9px] font-mono text-gray-500">${item.price.toFixed(2)}</p>
      )}

      {/* Bar indicator */}
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.abs(pct) * 20)}%`,
            background: baseColor,
            opacity: 0.7,
          }}
        />
      </div>
    </motion.button>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const pct = payload[0].value as number;
  return (
    <div className="bg-[#0a0f1e] border border-white/10 rounded-lg p-2.5 text-[10px] shadow-xl">
      <p className="text-gray-300 font-bold">{label}</p>
      <p style={{ color: pct >= 0 ? "#00ff9d" : "#ff3366" }}>
        {pct >= 0 ? "▲ +" : "▼ "}{pct.toFixed(2)}%
      </p>
    </div>
  );
};

export default function SectorIntelligence() {
  const { data } = useGeoTera();
  const sectors = data?.economy?.sectors ?? [];
  const [selected, setSelected] = useState<string | null>(null);

  const sorted   = [...sectors].sort((a, b) => (b.change_pct ?? -99) - (a.change_pct ?? -99));
  const up       = sorted.filter(s => (s.change_pct ?? 0) > 0).length;
  const down     = sorted.filter(s => (s.change_pct ?? 0) < 0).length;
  const best     = sorted[0];
  const worst    = sorted[sorted.length - 1];

  const selectedItem = selected ? sectors.find(s => s.name === selected) : null;
  const selectedMeta = selectedItem ? SECTOR_META[selectedItem.name] : null;

  const chartData = sorted.map(s => ({
    name: SECTOR_META[s.name]?.short ?? s.name.slice(0, 5),
    pct: s.change_pct ?? 0,
    fullName: s.name,
  }));

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <LayoutGrid size={14} className="text-[#4ade80]" />
        <h2 className="text-sm font-black text-white">Sector Intelligence</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <div className="flex items-center gap-4 text-[9px]">
          <span className="text-[#00ff9d] font-bold">▲ {up} advancing</span>
          <span className="text-[#ff3366] font-bold">▼ {down} declining</span>
        </div>
      </div>

      {/* Quick stats */}
      {best && worst && (
        <div className="flex gap-2 flex-shrink-0">
          <div className="flex-1 bg-[#00ff9d]/5 border border-[#00ff9d]/15 rounded-xl px-3 py-2 flex items-center gap-3">
            <span className="text-lg">{SECTOR_META[best.name]?.icon ?? "📊"}</span>
            <div>
              <p className="text-[8px] text-gray-600 uppercase tracking-widest">Best Performing</p>
              <p className="text-[11px] font-black text-white">{best.name}</p>
            </div>
            <span className="ml-auto text-[13px] font-black text-[#00ff9d]">+{best.change_pct?.toFixed(2)}%</span>
          </div>
          <div className="flex-1 bg-[#ff3366]/5 border border-[#ff3366]/15 rounded-xl px-3 py-2 flex items-center gap-3">
            <span className="text-lg">{SECTOR_META[worst.name]?.icon ?? "📊"}</span>
            <div>
              <p className="text-[8px] text-gray-600 uppercase tracking-widest">Worst Performing</p>
              <p className="text-[11px] font-black text-white">{worst.name}</p>
            </div>
            <span className="ml-auto text-[13px] font-black text-[#ff3366]">{worst.change_pct?.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* Heat grid */}
        <div className="col-span-2 overflow-y-auto">
          {sectors.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-700 text-xs animate-pulse">
              Loading sector data…
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {sorted.map((item, i) => (
                <SectorHeatCell
                  key={item.symbol}
                  item={item}
                  i={i}
                  onClick={() => setSelected(selected === item.name ? null : item.name)}
                  selected={selected === item.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right panel: bar chart + selected detail */}
        <div className="flex flex-col gap-3">
          {/* Bar chart */}
          <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 flex flex-col">
            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Performance Ranking</p>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 4, bottom: 0, left: 28 }}>
                  <CartesianGrid horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 8 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#9ca3af", fontSize: 9, fontWeight: 700 }}
                    axisLine={false} tickLine={false} width={30} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pct" radius={[0, 3, 3, 0]} maxBarSize={12}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.pct >= 0 ? "#00ff9d" : "#ff3366"} fillOpacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">Loading…</div>
            )}
          </div>

          {/* Selected sector detail */}
          {selectedItem && selectedMeta ? (
            <motion.div
              key={selectedItem.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.03] border rounded-xl p-3 flex-shrink-0"
              style={{ borderColor: `${selectedMeta.color}30` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{selectedMeta.icon}</span>
                <div>
                  <p className="text-[11px] font-black text-white">{selectedItem.name}</p>
                  <p className="text-[8px] text-gray-600">{selectedMeta.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[8px] text-gray-600">Price</p>
                  <p className="text-[12px] font-mono font-black text-white">${selectedItem.price?.toFixed(2) ?? "—"}</p>
                </div>
                <div>
                  <p className="text-[8px] text-gray-600">Change</p>
                  <p className={`text-[12px] font-mono font-black ${(selectedItem.change_pct ?? 0) >= 0 ? "text-[#00ff9d]" : "text-[#ff3366]"}`}>
                    {(selectedItem.change_pct ?? 0) >= 0 ? "+" : ""}{selectedItem.change_pct?.toFixed(2) ?? "—"}%
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-[8px] text-gray-600 mb-1">Ticker</p>
                <p className="text-[9px] font-mono" style={{ color: selectedMeta.color }}>{selectedItem.symbol}</p>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 flex-shrink-0 text-center">
              <p className="text-[9px] text-gray-700">Click a sector cell to view details</p>
            </div>
          )}
        </div>
      </div>

      <p className="text-[8px] text-gray-700 text-center flex-shrink-0">
        S&amp;P 500 Select Sector SPDR ETFs (XL*) · Prices via yfinance
      </p>
    </div>
  );
}
