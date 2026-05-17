"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Flame } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const COMMODITY_META: Record<string, { name: string; unit: string; emoji: string; color: string; category: string }> = {
  "GC=F":  { name: "Gold",          unit: "$/oz",  emoji: "🥇", color: "#f59e0b", category: "Metals"  },
  "SI=F":  { name: "Silver",        unit: "$/oz",  emoji: "🥈", color: "#94a3b8", category: "Metals"  },
  "HG=F":  { name: "Copper",        unit: "$/lb",  emoji: "🔶", color: "#fb923c", category: "Metals"  },
  "CL=F":  { name: "Crude Oil WTI", unit: "$/bbl", emoji: "🛢️", color: "#6366f1", category: "Energy"  },
  "NG=F":  { name: "Natural Gas",   unit: "$/mmBtu",emoji: "🔥",color: "#f43f5e", category: "Energy"  },
  "ZW=F":  { name: "Wheat",         unit: "¢/bu",  emoji: "🌾", color: "#84cc16", category: "Agri"    },
};

interface OHLCRow { time: string; close: number; }

function MiniChart({ symbol, color }: { symbol: string; color: string }) {
  const [chartData, setChartData] = useState<OHLCRow[]>([]);
  useEffect(() => {
    fetch(`http://localhost:8000/api/history/${encodeURIComponent(symbol)}?period=5d&interval=1h`)
      .then(r => r.json())
      .then(j => setChartData((j.data ?? []).slice(-48)))
      .catch(() => {});
  }, [symbol]);

  if (!chartData.length) return <div className="flex-1 bg-white/[0.02] rounded" />;
  const first = chartData[0].close;
  const last  = chartData[chartData.length - 1].close;
  const up    = last >= first;
  const chartColor = up ? "#00ff9d" : "#ff3366";

  return (
    <div className="flex-1" style={{ minHeight: 60 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`cg-${symbol.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length
                ? <div className="bg-[#0a0f1e] text-[9px] px-2 py-1 rounded border border-white/10 text-gray-300">
                    {Number(payload[0].value).toFixed(2)}
                  </div>
                : null
            }
          />
          <Area
            type="monotone"
            dataKey="close"
            stroke={chartColor}
            strokeWidth={1.5}
            fill={`url(#cg-${symbol.replace(/[^a-z]/gi, "")})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CommodityCard({ symbol, item, i }: { symbol: string; item: any; i: number }) {
  const meta = COMMODITY_META[symbol];
  if (!meta) return null;
  const up = (item.change_pct ?? 0) >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06, duration: 0.3 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 flex flex-col gap-3 cursor-default
        hover:border-white/[0.12] transition-all group"
      style={{ boxShadow: `0 0 0 1px ${meta.color}08` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{meta.emoji}</span>
          <div>
            <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{meta.category}</p>
            <p className="text-sm font-black text-white">{meta.name}</p>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-[9px] font-black border
          ${up ? "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/20" : "bg-[#ff3366]/10 text-[#ff3366] border-[#ff3366]/20"}`}>
          {up ? "▲" : "▼"} {Math.abs(item.change_pct ?? 0).toFixed(2)}%
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-[22px] font-black font-mono" style={{ color: meta.color }}>
          {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
        </p>
        <p className="text-[9px] text-gray-600 mt-0.5">{meta.unit}</p>
      </div>

      {/* Mini chart */}
      <MiniChart symbol={symbol} color={meta.color} />

      {/* Trend bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[8px] text-gray-600">
          <span>30-Day Range</span>
          <span style={{ color: meta.color }}>LIVE</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(100, Math.max(5, 50 + (item.change_pct ?? 0) * 10))}%`,
              background: `linear-gradient(90deg, ${meta.color}60, ${meta.color})`,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function Commodities() {
  const { data } = useGeoTera();
  const commodities = data?.economy?.commodities ?? [];

  const byCategory: Record<string, { symbol: string; item: any }[]> = { Metals: [], Energy: [], Agri: [] };
  for (const item of commodities) {
    const meta = COMMODITY_META[item.symbol];
    if (meta) byCategory[meta.category]?.push({ symbol: item.symbol, item });
  }

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Flame size={14} className="text-[#fb923c]" />
        <h2 className="text-sm font-black text-white">Commodities & Energy</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <div className="flex items-center gap-2 text-[9px]">
          {["Metals", "Energy", "Agri"].map(cat => (
            <span key={cat} className="text-gray-600 font-bold">{cat}: {byCategory[cat]?.length ?? 0}</span>
          ))}
        </div>
      </div>

      {/* Category sections */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {(["Metals", "Energy", "Agri"] as const).map(cat => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{cat}</span>
              <div className="flex-1 h-px bg-white/[0.04]" />
            </div>
            <div className={`grid gap-3 ${byCategory[cat]?.length === 1 ? "grid-cols-1" : byCategory[cat]?.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {byCategory[cat]?.map(({ symbol, item }, i) => (
                <CommodityCard key={symbol} symbol={symbol} item={item} i={i} />
              ))}
              {byCategory[cat]?.length === 0 && (
                <div className="col-span-3 bg-white/[0.02] border border-white/[0.05] rounded-xl p-6 text-center text-gray-700 text-xs animate-pulse">
                  Loading {cat.toLowerCase()} data…
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: supply/demand context */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 flex items-center gap-6"
      >
        <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Live pricing via yfinance</span>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[8px] text-gray-700">Futures contracts · Continuous front-month</span>
        <span className="text-[8px] text-[#f59e0b] font-bold">NOT FINANCIAL ADVICE</span>
      </motion.div>
    </div>
  );
}
