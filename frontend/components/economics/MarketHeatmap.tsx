"use client";
import { useState } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { MarketItem } from "@/lib/useWebSocket";

type View = "all" | "indices" | "sectors" | "crypto" | "commodities";

const VIEWS: { id: View; label: string }[] = [
  { id: "all",         label: "All"         },
  { id: "indices",     label: "Indices"     },
  { id: "sectors",     label: "Sectors"     },
  { id: "crypto",      label: "Crypto"      },
  { id: "commodities", label: "Commodities" },
];

function colors(pct: number | null): { bg: string; text: string; border: string; glow: string } {
  if (pct == null) return { bg: "bg-white/5", text: "text-gray-600", border: "border-white/5", glow: "transparent" };
  if (pct >= 4)   return { bg: "bg-[#00ff9d]/15", text: "text-[#00ff9d]", border: "border-[#00ff9d]/20", glow: "#00ff9d" };
  if (pct >= 2)   return { bg: "bg-emerald-500/12", text: "text-emerald-400", border: "border-emerald-500/18", glow: "#34d399" };
  if (pct >= 0.5) return { bg: "bg-emerald-900/20", text: "text-emerald-600", border: "border-emerald-900/30", glow: "transparent" };
  if (pct >= -0.5) return { bg: "bg-white/5", text: "text-gray-500", border: "border-white/5", glow: "transparent" };
  if (pct >= -2)  return { bg: "bg-red-900/20", text: "text-red-500", border: "border-red-900/30", glow: "transparent" };
  if (pct >= -4)  return { bg: "bg-red-500/12", text: "text-red-400", border: "border-red-500/18", glow: "#ef4444" };
  return               { bg: "bg-[#ff3366]/15", text: "text-[#ff3366]", border: "border-[#ff3366]/20", glow: "#ff3366" };
}

function Cell({ item, large }: { item: MarketItem; large?: boolean }) {
  const c = colors(item.change_pct);
  return (
    <div
      className={`${c.bg} border ${c.border} rounded-xl ${large ? "p-4" : "p-2.5"} flex flex-col justify-between
        hover:brightness-125 transition-all cursor-default`}
      style={c.glow !== "transparent" ? { boxShadow: `inset 0 0 20px ${c.glow}12` } : undefined}
    >
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 truncate">{item.name}</p>
      <div className="mt-1">
        <p className={`font-mono font-black ${large ? "text-xl" : "text-sm"} text-white tabular-nums truncate`}>
          {item.price != null
            ? item.price >= 10000
              ? item.price.toLocaleString("en-US", { maximumFractionDigits: 0 })
              : item.price >= 1000
              ? item.price.toLocaleString("en-US", { maximumFractionDigits: 0 })
              : item.price.toFixed(2)
            : "—"}
        </p>
        <p className={`text-xs font-bold ${c.text} mt-0.5 tabular-nums`}>
          {item.change_pct != null
            ? `${item.change_pct >= 0 ? "+" : ""}${item.change_pct.toFixed(2)}%`
            : "—"}
        </p>
      </div>
    </div>
  );
}

export default function MarketHeatmap() {
  const { data } = useGeoTera();
  const [view, setView] = useState<View>("all");
  const eco = data?.economy;

  const pools: Record<View, MarketItem[]> = {
    all:         [...(eco?.indices ?? []), ...(eco?.sectors ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])],
    indices:     eco?.indices     ?? [],
    sectors:     eco?.sectors     ?? [],
    crypto:      eco?.crypto      ?? [],
    commodities: eco?.commodities ?? [],
  };

  const items = [...pools[view]].sort((a, b) => Math.abs(b.change_pct ?? 0) - Math.abs(a.change_pct ?? 0));

  const pos  = items.filter(m => (m.change_pct ?? 0) > 0).length;
  const neg  = items.filter(m => (m.change_pct ?? 0) < 0).length;

  if (!items.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-700 text-sm animate-pulse">
        Loading market data…
      </div>
    );
  }

  const [top, ...rest] = items;

  return (
    <div className="h-full flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <p className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
          Market Heatmap
        </p>
        <div className="text-[9px] flex items-center gap-2">
          <span className="text-[#00ff9d]">▲{pos}</span>
          <span className="text-[#ff3366]">▼{neg}</span>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 flex-shrink-0 flex-wrap">
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
              view === v.id
                ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/25"
                : "text-gray-700 hover:text-gray-500 border border-transparent"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-2 gap-1.5 h-full">
          {top && (
            <div className="col-span-2">
              <Cell item={top} large />
            </div>
          )}
          {rest.slice(0, 8).map(m => (
            <Cell key={m.symbol} item={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
