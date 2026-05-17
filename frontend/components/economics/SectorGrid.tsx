"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { MarketItem } from "@/lib/useWebSocket";

const SECTOR_META: Record<string, { icon: string; shortName: string }> = {
  "Technology":       { icon: "💻", shortName: "Tech"       },
  "Financials":       { icon: "🏦", shortName: "Finance"    },
  "Energy":           { icon: "⛽", shortName: "Energy"     },
  "Health Care":      { icon: "🏥", shortName: "Health"     },
  "Industrials":      { icon: "🏭", shortName: "Industrials"},
  "Communication":    { icon: "📡", shortName: "Comms"      },
  "Cons. Staples":    { icon: "🛒", shortName: "Staples"    },
  "Cons. Discret.":   { icon: "🛍️", shortName: "Discret."  },
  "Real Estate":      { icon: "🏢", shortName: "Real Est."  },
  "Materials":        { icon: "⚗️", shortName: "Materials"  },
  "Utilities":        { icon: "⚡", shortName: "Utilities"  },
};

function chg(pct: number | null): { bg: string; text: string; border: string } {
  if (pct == null) return { bg: "bg-white/[0.03]", text: "text-gray-600", border: "border-white/5" };
  if (pct >= 2)   return { bg: "bg-[#00ff9d]/12", text: "text-[#00ff9d]", border: "border-[#00ff9d]/15" };
  if (pct >= 0.5) return { bg: "bg-emerald-500/8", text: "text-emerald-400", border: "border-emerald-500/15" };
  if (pct >= -0.5) return { bg: "bg-white/[0.03]", text: "text-gray-500", border: "border-white/5" };
  if (pct >= -2)  return { bg: "bg-red-500/8", text: "text-red-400", border: "border-red-500/15" };
  return               { bg: "bg-[#ff3366]/12", text: "text-[#ff3366]", border: "border-[#ff3366]/15" };
}

function SectorCell({ item }: { item: MarketItem }) {
  const meta   = SECTOR_META[item.name];
  const colors = chg(item.change_pct);
  return (
    <div
      className={`${colors.bg} border ${colors.border} rounded-xl p-2.5 flex flex-col justify-between
        hover:brightness-125 transition-all cursor-default group`}
    >
      <div className="flex items-start justify-between">
        <span className="text-lg leading-none">{meta?.icon ?? "📊"}</span>
        <p
          className={`font-mono text-[11px] font-black tabular-nums ${colors.text}`}
        >
          {item.change_pct != null
            ? `${item.change_pct >= 0 ? "+" : ""}${item.change_pct.toFixed(2)}%`
            : "—"}
        </p>
      </div>
      <p className="text-[9px] text-gray-600 font-bold mt-1.5 leading-tight">
        {meta?.shortName ?? item.name}
      </p>
      {item.price != null && (
        <p className="text-[8px] font-mono text-gray-700 mt-0.5">
          ${item.price.toFixed(2)}
        </p>
      )}
    </div>
  );
}

export default function SectorGrid() {
  const { data } = useGeoTera();
  const sectors: MarketItem[] = data?.economy?.sectors ?? [];

  const sorted = [...sectors].sort((a, b) => (b.change_pct ?? -99) - (a.change_pct ?? -99));

  const up   = sorted.filter(s => (s.change_pct ?? 0) > 0).length;
  const down = sorted.filter(s => (s.change_pct ?? 0) < 0).length;
  const flat = sorted.length - up - down;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-[#00ff9d] uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
          S&amp;P Sectors
        </p>
        {sectors.length > 0 && (
          <div className="flex items-center gap-2 text-[9px]">
            <span className="text-[#00ff9d]">▲ {up}</span>
            <span className="text-gray-600">= {flat}</span>
            <span className="text-[#ff3366]">▼ {down}</span>
          </div>
        )}
      </div>

      {!sectors.length ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">
          Loading sector data…
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 flex-1 content-start">
          {sorted.map(s => <SectorCell key={s.symbol} item={s} />)}
        </div>
      )}

      <p className="text-[8px] text-gray-700 mt-2 text-center">
        S&amp;P Select Sector ETFs (XL*) · SPDR
      </p>
    </div>
  );
}
