"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Star, Plus, X, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts";

const DEFAULT_SYMBOLS = ["^GSPC", "BTC-USD", "GC=F", "^VIX", "^TNX", "DX-Y.NYB"];

interface WatchItem {
  symbol: string;
  price: number | null;
  change_pct: number | null;
  name: string;
  chartData: { time: string; close: number }[];
}

const SYMBOL_NAMES: Record<string, string> = {
  "^GSPC":    "S&P 500",
  "^DJI":     "Dow Jones",
  "^IXIC":    "NASDAQ",
  "^VIX":     "CBOE VIX",
  "^TNX":     "10Y Treasury",
  "DX-Y.NYB": "US Dollar Index",
  "BTC-USD":  "Bitcoin",
  "ETH-USD":  "Ethereum",
  "GC=F":     "Gold Futures",
  "CL=F":     "Crude Oil WTI",
  "SI=F":     "Silver Futures",
  "AAPL":     "Apple",
  "MSFT":     "Microsoft",
  "NVDA":     "NVIDIA",
  "TSLA":     "Tesla",
  "AMZN":     "Amazon",
};

function WatchCard({ item, onRemove }: { item: WatchItem; onRemove: () => void }) {
  const up   = (item.change_pct ?? 0) >= 0;
  const color = up ? "#00ff9d" : "#ff3366";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 relative overflow-hidden hover:border-white/[0.12] transition-all group"
    >
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 text-gray-600 hover:text-[#ff3366] hover:bg-[#ff3366]/10 transition-all"
      >
        <X size={11} />
      </button>

      {/* Background glow */}
      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${color}08, transparent)` }} />

      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">{item.symbol}</p>
          <p className="text-[11px] font-bold text-white leading-tight mt-0.5">{item.name}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border
          ${up ? "bg-[#00ff9d]/10 text-[#00ff9d] border-[#00ff9d]/20" : "bg-[#ff3366]/10 text-[#ff3366] border-[#ff3366]/20"}`}>
          {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {up ? "+" : ""}{item.change_pct?.toFixed(2) ?? "—"}%
        </div>
      </div>

      <p className="text-[18px] font-black font-mono" style={{ color }}>
        {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
      </p>

      {/* Mini chart */}
      {item.chartData.length > 4 && (
        <div className="mt-2 -mx-1" style={{ height: 36 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={item.chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`wg-${item.symbol.replace(/[^a-z]/gi, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length
                    ? <div className="bg-[#0a0f1e] text-[8px] px-1.5 py-1 rounded border border-white/10" style={{ color }}>
                        {Number(payload[0].value).toFixed(2)}
                      </div>
                    : null
                }
              />
              <Area type="monotone" dataKey="close" stroke={color} strokeWidth={1.5}
                fill={`url(#wg-${item.symbol.replace(/[^a-z]/gi, "")})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

export default function Watchlists() {
  const { data } = useGeoTera();
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_SYMBOLS);
  const [items,   setItems]   = useState<WatchItem[]>([]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingChart, setLoadingChart] = useState<Record<string, boolean>>({});

  // Persist watchlist
  useEffect(() => {
    try {
      const saved = localStorage.getItem("geo-watchlist");
      if (saved) setSymbols(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem("geo-watchlist", JSON.stringify(symbols));
  }, [symbols]);

  const fetchChart = useCallback(async (sym: string) => {
    try {
      const r = await fetch(`http://localhost:8000/api/history/${encodeURIComponent(sym)}?period=5d&interval=1h`);
      const j = await r.json();
      return (j.data ?? []).slice(-48) as { time: string; close: number }[];
    } catch { return []; }
  }, []);

  useEffect(() => {
    if (!data) return;
    const eco  = data.economy;
    const all  = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];

    const build = async () => {
      const results: WatchItem[] = [];
      for (const sym of symbols) {
        const found = all.find(i => i.symbol === sym);
        const chart = await fetchChart(sym);
        results.push({
          symbol: sym,
          price: found?.price ?? null,
          change_pct: found?.change_pct ?? null,
          name: found?.name ?? SYMBOL_NAMES[sym] ?? sym,
          chartData: chart,
        });
      }
      setItems(results);
    };
    build();
  }, [data, symbols, fetchChart]);

  const add = async () => {
    const sym = input.trim().toUpperCase();
    if (!sym || symbols.includes(sym)) { setInput(""); return; }
    setLoading(true);
    setSymbols(prev => [...prev, sym]);
    setInput("");
    setLoading(false);
  };

  const remove = (sym: string) => {
    setSymbols(prev => prev.filter(s => s !== sym));
    setItems(prev => prev.filter(i => i.symbol !== sym));
  };

  const portfolio = items.reduce((s, i) => s + (i.price ?? 0), 0);
  const up   = items.filter(i => (i.change_pct ?? 0) > 0).length;
  const down = items.filter(i => (i.change_pct ?? 0) < 0).length;

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Star size={14} className="text-[#e879f9]" />
        <h2 className="text-sm font-black text-white">Personalized Watchlist</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <div className="flex items-center gap-3 text-[9px]">
          <span className="text-[#00ff9d] font-bold">▲ {up}</span>
          <span className="text-[#ff3366] font-bold">▼ {down}</span>
          <span className="text-gray-600">{items.length} tracked</span>
        </div>
      </div>

      {/* Add symbol bar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex-1 flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2
          focus-within:border-[#e879f9]/40 transition-all">
          <Plus size={12} className="text-gray-600" />
          <input
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Add symbol (e.g. AAPL, MSFT, ETH-USD)…"
            className="flex-1 bg-transparent text-[11px] text-white placeholder-gray-700 outline-none"
          />
        </div>
        <button
          onClick={add}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-xl bg-[#e879f9]/15 border border-[#e879f9]/30 text-[#e879f9] text-[9px] font-black uppercase tracking-widest
            disabled:opacity-30 hover:bg-[#e879f9]/25 transition-all"
        >
          {loading ? <RefreshCw size={11} className="animate-spin" /> : "ADD"}
        </button>
      </div>

      {/* Quick add suggestions */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <span className="text-[8px] text-gray-700 font-bold">Quick add:</span>
        {["AAPL", "NVDA", "MSFT", "TSLA", "ETH-USD", "SI=F", "^DJI"].filter(s => !symbols.includes(s)).map(s => (
          <button
            key={s}
            onClick={() => { setSymbols(prev => [...prev, s]); }}
            className="text-[8px] px-2 py-0.5 rounded-full border border-white/[0.08] text-gray-600 hover:text-[#e879f9] hover:border-[#e879f9]/30 transition-all"
          >
            + {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-700">
            <Star size={36} className="opacity-20" />
            <p className="text-sm">Your watchlist is empty</p>
            <p className="text-xs">Add symbols using the search bar above</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            <AnimatePresence>
              {items.map(item => (
                <WatchCard key={item.symbol} item={item} onRemove={() => remove(item.symbol)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Summary bar */}
      {items.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex-shrink-0 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 flex items-center gap-6"
        >
          <div>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">Tracking</p>
            <p className="text-[13px] font-black text-white">{items.length} symbols</p>
          </div>
          <div>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">Advancing</p>
            <p className="text-[13px] font-black text-[#00ff9d]">{up}</p>
          </div>
          <div>
            <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">Declining</p>
            <p className="text-[13px] font-black text-[#ff3366]">{down}</p>
          </div>
          <div className="flex-1" />
          <p className="text-[8px] text-gray-700">Watchlist persisted locally · Not financial advice</p>
        </motion.div>
      )}
    </div>
  );
}
