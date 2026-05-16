"use client";
import { EconomyData, MarketItem } from "@/lib/useWebSocket";
import { TrendingUp, TrendingDown } from "lucide-react";

function fmt(n: number | null, decimals = 2): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
  return n.toFixed(decimals);
}

function MarketRow({ item }: { item: MarketItem }) {
  const up = (item.change_pct ?? 0) >= 0;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
      <span className="text-sm text-gray-300 truncate max-w-[120px]">{item.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-white">{item.price != null ? fmt(item.price) : "—"}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold w-16 justify-end ${up ? "text-green-400" : "text-red-400"}`}>
          {item.change_pct != null ? (
            <>
              {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {Math.abs(item.change_pct).toFixed(2)}%
            </>
          ) : "—"}
        </span>
      </div>
    </div>
  );
}

export default function EconomyWidget({ economy }: { economy: EconomyData | null }) {
  if (!economy) {
    return <div className="text-gray-600 text-sm text-center py-8">Fetching market data...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Indices */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Indices</h3>
        {economy.indices.map((m) => <MarketRow key={m.symbol} item={m} />)}
      </div>

      {/* Crypto + Commodities */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Crypto</h3>
        {economy.crypto.map((m) => <MarketRow key={m.symbol} item={m} />)}
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 mt-4">Commodities</h3>
        {economy.commodities.map((m) => <MarketRow key={m.symbol} item={m} />)}
      </div>

      {/* Forex */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">USD Forex Rates</h3>
        {Object.entries(economy.forex ?? {}).map(([cur, rate]) => (
          <div key={cur} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
            <span className="text-sm text-gray-300">USD → {cur}</span>
            <span className="text-sm font-mono text-white">{typeof rate === "number" ? rate.toFixed(4) : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
