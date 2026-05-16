"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { MarketItem } from "@/lib/useWebSocket";

function chgColor(pct: number | null): { bg: string; text: string } {
  if (pct == null) return { bg: "bg-white/5", text: "text-gray-600" };
  if (pct >=  4) return { bg: "bg-[#00ff9d]/20", text: "text-[#00ff9d]" };
  if (pct >=  2) return { bg: "bg-emerald-500/15", text: "text-emerald-400" };
  if (pct >=  0.5) return { bg: "bg-emerald-900/30", text: "text-emerald-600" };
  if (pct >= -0.5) return { bg: "bg-white/5", text: "text-gray-500" };
  if (pct >= -2) return { bg: "bg-red-900/30", text: "text-red-500" };
  if (pct >= -4) return { bg: "bg-red-500/15", text: "text-red-400" };
  return { bg: "bg-[#ff3366]/20", text: "text-[#ff3366]" };
}

function Cell({ item, large }: { item: MarketItem; large?: boolean }) {
  const { bg, text } = chgColor(item.change_pct);
  return (
    <div className={`${bg} border border-white/5 rounded-xl ${large ? "p-4" : "p-3"} flex flex-col justify-between hover:border-white/15 transition-all cursor-default`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest text-gray-600 truncate`}>{item.name}</p>
      <div>
        <p className={`font-mono font-black ${large ? "text-xl" : "text-base"} text-white truncate`}>
          {item.price != null
            ? item.price >= 1000
              ? item.price.toLocaleString("en-US", { maximumFractionDigits: 0 })
              : item.price.toFixed(2)
            : "—"}
        </p>
        <p className={`text-xs font-bold ${text} mt-0.5`}>
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
  const eco = data?.economy;

  const allItems: MarketItem[] = [
    ...(eco?.indices ?? []),
    ...(eco?.crypto ?? []),
    ...(eco?.commodities ?? []),
  ].sort((a, b) => (Math.abs(b.change_pct ?? 0) - Math.abs(a.change_pct ?? 0)));

  if (!allItems.length) {
    return <div className="h-full flex items-center justify-center text-gray-700 text-sm">Loading markets…</div>;
  }

  const [top, ...rest] = allItems;

  return (
    <div className="h-full flex flex-col gap-2">
      <p className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" /> Market Heatmap
      </p>
      <div className="grid grid-cols-2 gap-2 flex-1">
        {/* Biggest mover gets double cell */}
        <div className="col-span-2">
          <Cell item={top} large />
        </div>
        {rest.slice(0, 10).map((m) => (
          <Cell key={m.symbol} item={m} />
        ))}
      </div>
    </div>
  );
}
