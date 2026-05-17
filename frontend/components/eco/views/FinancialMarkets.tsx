"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import PriceChart from "@/components/terminal/PriceChart";
import type { MarketItem } from "@/lib/useWebSocket";

type Tab = "INDICES" | "CRYPTO" | "COMMODITIES" | "FOREX";

const TAB_CONFIG: Record<Tab, { color: string; default: string }> = {
  INDICES:     { color: "#00d4ff",  default: "^GSPC"   },
  CRYPTO:      { color: "#c084fc",  default: "BTC-USD" },
  COMMODITIES: { color: "#f59e0b",  default: "GC=F"    },
  FOREX:       { color: "#38bdf8",  default: "^GSPC"   },
};

function MarketRow({ item, i, onSelect, selected }: {
  item: MarketItem; i: number; onSelect: (s: string) => void; selected: boolean;
}) {
  const up = (item.change_pct ?? 0) >= 0;
  return (
    <motion.tr
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.03 }}
      onClick={() => onSelect(item.symbol)}
      className={`cursor-pointer transition-all hover:bg-white/[0.04] ${selected ? "bg-white/[0.06] border-l-2 border-l-[#00d4ff]" : ""}`}
    >
      <td className="py-2 pl-3 pr-2">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${up ? "bg-[#00ff9d]" : "bg-[#ff3366]"}`} />
          <div>
            <p className="text-[10px] font-black text-white">{item.symbol}</p>
            <p className="text-[8px] text-gray-600 leading-tight max-w-[80px] truncate">{item.name}</p>
          </div>
        </div>
      </td>
      <td className="py-2 pr-3 text-right">
        <p className="text-[11px] font-mono font-bold text-white">
          {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
        </p>
        <p className={`text-[9px] font-bold ${up ? "text-[#00ff9d]" : "text-[#ff3366]"}`}>
          {up ? "▲" : "▼"} {Math.abs(item.change_pct ?? 0).toFixed(2)}%
        </p>
      </td>
      <td className="py-2 pr-3">
        <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${Math.min(100, Math.abs(item.change_pct ?? 0) * 20)}%`,
              background: up ? "#00ff9d" : "#ff3366",
            }}
          />
        </div>
      </td>
    </motion.tr>
  );
}

function ForexGrid({ forex }: { forex: Record<string, number> }) {
  const currencies = Object.entries(forex).slice(0, 12);
  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {currencies.map(([cur, rate]) => (
        <div key={cur} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 hover:border-[#38bdf8]/20 transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[9px] text-gray-600 font-bold">USD/{cur}</p>
              <p className="text-[12px] font-mono font-black text-white">{rate.toFixed(4)}</p>
            </div>
            <div className="text-[11px]">
              {cur === "EUR" ? "🇪🇺" : cur === "GBP" ? "🇬🇧" : cur === "JPY" ? "🇯🇵" :
               cur === "CNY" ? "🇨🇳" : cur === "CHF" ? "🇨🇭" : cur === "AUD" ? "🇦🇺" :
               cur === "CAD" ? "🇨🇦" : cur === "INR" ? "🇮🇳" : cur === "KRW" ? "🇰🇷" :
               cur === "BRL" ? "🇧🇷" : cur === "MXN" ? "🇲🇽" : "💱"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FinancialMarkets() {
  const { data } = useGeoTera();
  const [tab, setTab]     = useState<Tab>("INDICES");
  const [chartSym, setChartSym] = useState("^GSPC");
  const eco = data?.economy;

  const items: MarketItem[] =
    tab === "INDICES"     ? (eco?.indices     ?? []) :
    tab === "CRYPTO"      ? (eco?.crypto      ?? []) :
    tab === "COMMODITIES" ? (eco?.commodities ?? []) : [];

  const sorted = [...items].sort((a, b) => (b.change_pct ?? -99) - (a.change_pct ?? -99));
  const up   = sorted.filter(i => (i.change_pct ?? 0) > 0).length;
  const down = sorted.filter(i => (i.change_pct ?? 0) < 0).length;

  const cfg = TAB_CONFIG[tab];

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <TrendingUp size={14} className="text-[#00ff9d]" />
        <h2 className="text-sm font-black text-white">Financial Markets</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        {tab !== "FOREX" && (
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#00ff9d] font-bold">▲ {up}</span>
            <span className="text-gray-600">— {sorted.length - up - down}</span>
            <span className="text-[#ff3366] font-bold">▼ {down}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-shrink-0">
        {(Object.keys(TAB_CONFIG) as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setChartSym(TAB_CONFIG[t].default);
            }}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all
              ${tab === t ? "text-white" : "text-gray-600 hover:text-gray-400 bg-white/[0.02] hover:bg-white/[0.04]"}`}
            style={tab === t ? { background: `${TAB_CONFIG[t].color}18`, color: TAB_CONFIG[t].color, border: `1px solid ${TAB_CONFIG[t].color}33` } : { border: "1px solid transparent" }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 grid grid-cols-5 gap-3">
        {/* Left: market list */}
        <div className="col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {tab === "FOREX" ? (
              <motion.div
                key="forex"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <ForexGrid forex={eco?.forex ?? {}} />
              </motion.div>
            ) : (
              <motion.div
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto"
              >
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#030810]">
                    <tr className="border-b border-white/[0.05]">
                      <th className="text-left px-3 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">ASSET</th>
                      <th className="text-right px-3 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">PRICE / CHG</th>
                      <th className="text-right pr-3 py-2 text-[8px] font-black text-gray-600 uppercase tracking-widest">BAR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {sorted.map((item, i) => (
                      <MarketRow
                        key={item.symbol}
                        item={item}
                        i={i}
                        onSelect={setChartSym}
                        selected={chartSym === item.symbol}
                      />
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
        >
          {tab === "FOREX" ? (
            <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-600">
              <span className="text-4xl">💱</span>
              <p className="text-xs">Select a currency pair to view chart</p>
            </div>
          ) : (
            <PriceChart defaultSymbol={chartSym} key={chartSym} />
          )}
        </motion.div>
      </div>
    </div>
  );
}
