"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { TrendingUp, TrendingDown } from "lucide-react";

function TickerItem({ label, value, change }: { label: string; value: string; change: number | null }) {
  const up = (change ?? 0) >= 0;
  return (
    <span className="inline-flex items-center gap-2 px-5 border-r border-white/5 whitespace-nowrap">
      <span className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">{label}</span>
      <span className="font-mono text-sm text-white font-semibold">{value}</span>
      {change != null && (
        <span className={`flex items-center gap-0.5 text-[11px] font-bold ${up ? "text-[#00ff9d]" : "text-[#ff3366]"}`}>
          {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {Math.abs(change).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

export default function TickerBar() {
  const { data } = useGeoTera();
  const eco = data?.economy;

  const items: { label: string; value: string; change: number | null }[] = [
    ...(eco?.indices ?? []).map((m) => ({
      label: m.name,
      value: m.price != null ? m.price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : "—",
      change: m.change_pct,
    })),
    ...(eco?.crypto ?? []).map((m) => ({
      label: m.name,
      value: m.price != null ? `$${m.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—",
      change: m.change_pct,
    })),
    ...(eco?.commodities ?? []).map((m) => ({
      label: m.name,
      value: m.price != null ? `$${m.price.toFixed(2)}` : "—",
      change: m.change_pct,
    })),
    ...Object.entries(eco?.forex ?? {}).map(([cur, rate]) => ({
      label: `USD/${cur}`,
      value: (rate as number).toFixed(4),
      change: null,
    })),
  ];

  if (!items.length) {
    return (
      <div className="h-10 bg-[#03060d] border-b border-[#00d4ff]/10 flex items-center px-6">
        <span className="text-xs text-gray-700 animate-pulse">Loading market data…</span>
      </div>
    );
  }

  // Double the items so the infinite scroll is seamless
  const doubled = [...items, ...items];

  return (
    <div className="h-10 bg-[#030810] border-b border-[#00d4ff]/10 overflow-hidden flex items-center relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#030810] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#030810] to-transparent z-10 pointer-events-none" />
      <div className="ticker-track flex items-center">
        {doubled.map((item, i) => (
          <TickerItem key={i} {...item} />
        ))}
      </div>
    </div>
  );
}
