"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Globe, TrendingUp, AlertTriangle, Activity, Newspaper, Zap } from "lucide-react";

const EconomicsMap = dynamic(() => import("@/components/economics/EconomicsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-700 text-xs animate-pulse">
      Loading map…
    </div>
  ),
});

function KPICard({
  label, value, sub, color, icon: Icon, delay = 0,
}: {
  label: string; value: string; sub?: string; color: string;
  icon: React.ElementType; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 flex items-center gap-3 hover:border-white/[0.1] transition-all"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <Icon size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-[15px] font-black text-white leading-tight">{value}</p>
        {sub && <p className="text-[9px] mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

function NewsCard({ item, i }: { item: { source: string; title: string; published: string; summary?: string }; i: number }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + i * 0.04 }}
      onClick={() => setExpanded(!expanded)}
      className="border-b border-white/[0.04] pb-3 mb-3 cursor-pointer hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition-all"
    >
      <div className="flex items-start gap-2">
        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00d4ff]/10 text-[#00d4ff] flex-shrink-0 mt-0.5">
          {item.source}
        </span>
        <p className={`text-[10px] text-gray-300 leading-snug ${!expanded ? "line-clamp-2" : ""}`}>
          {item.title}
        </p>
      </div>
      {expanded && item.summary && (
        <p className="text-[9px] text-gray-500 mt-1.5 leading-relaxed pl-10">{item.summary}</p>
      )}
      <p className="text-[8px] text-gray-700 mt-1 pl-10">{item.published}</p>
    </motion.div>
  );
}

export default function GlobalOverview() {
  const { data } = useGeoTera();
  const eco     = data?.economy;
  const macro   = eco?.macro;
  const wb      = data?.worldbank?.countries ?? {};

  const sp500 = eco?.indices?.find(i => i.symbol === "^GSPC");
  const vix   = macro?.vix;
  const t10y  = macro?.treasury_10y;
  const t2y   = macro?.treasury_2y;
  const inv   = t2y != null && t10y != null && t2y > t10y;
  const fg    = macro?.fear_greed;

  // Average world GDP growth from worldbank
  const gdpValues = Object.values(wb)
    .map(c => c.gdp_growth)
    .filter((v): v is number => v != null);
  const avgGdp = gdpValues.length
    ? gdpValues.reduce((s, v) => s + v, 0) / gdpValues.length
    : null;

  const fgLabel = fg == null ? "—" : fg > 70 ? "Extreme Greed" : fg > 55 ? "Greed" : fg > 45 ? "Neutral" : fg > 30 ? "Fear" : "Extreme Fear";
  const fgColor = fg == null ? "#6b7280" : fg > 55 ? "#00ff9d" : fg > 45 ? "#f59e0b" : "#ff3366";

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">

      {/* Section header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-[#00d4ff]" />
          <h2 className="text-sm font-black text-white tracking-tight">Global Economy Overview</h2>
        </div>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[8px] text-gray-600 font-mono">
          {data?.last_updated ? `UPD: ${new Date(data.last_updated).toLocaleTimeString()}` : "AWAITING DATA"}
        </span>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-4 gap-3 flex-shrink-0">
        <KPICard
          label="World Avg GDP Growth"
          value={avgGdp != null ? `${avgGdp.toFixed(1)}%` : "—"}
          sub={avgGdp != null ? (avgGdp > 2.5 ? "Expansion" : avgGdp > 0 ? "Moderate" : "Contraction") : undefined}
          color="#00d4ff"
          icon={TrendingUp}
          delay={0}
        />
        <KPICard
          label="Market Sentiment"
          value={fgLabel}
          sub={fg != null ? `F&G Index: ${fg}/100` : undefined}
          color={fgColor}
          icon={Activity}
          delay={0.05}
        />
        <KPICard
          label="Volatility Index"
          value={vix != null ? vix.toFixed(1) : "—"}
          sub={vix != null ? (vix > 30 ? "Extreme Fear" : vix > 20 ? "Elevated" : "Low") : undefined}
          color={vix == null ? "#6b7280" : vix > 30 ? "#ff3366" : vix > 20 ? "#f59e0b" : "#00ff9d"}
          icon={Zap}
          delay={0.1}
        />
        <KPICard
          label="Yield Curve"
          value={inv ? "INVERTED" : "Normal"}
          sub={t10y != null ? `10Y: ${t10y.toFixed(3)}%  2Y: ${t2y?.toFixed(3) ?? "—"}%` : undefined}
          color={inv ? "#ff3366" : "#00ff9d"}
          icon={AlertTriangle}
          delay={0.15}
        />
      </div>

      {/* Main grid: map + news */}
      <div className="flex-1 min-h-0 grid grid-cols-5 gap-3">

        {/* Map */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="col-span-3 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] animate-pulse" />
            <span className="text-[9px] font-black text-[#00d4ff] uppercase tracking-widest">
              Interactive Economic Map · Click Country for Detail
            </span>
          </div>
          <div style={{ height: "calc(100% - 32px)" }}>
            <EconomicsMap />
          </div>
        </motion.div>

        {/* News feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl flex flex-col overflow-hidden"
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04] flex-shrink-0">
            <Newspaper size={11} className="text-[#f59e0b]" />
            <span className="text-[9px] font-black text-[#f59e0b] uppercase tracking-widest">
              Live Intelligence Feed
            </span>
            <span className="ml-auto text-[8px] text-gray-700">{data?.news?.length ?? 0} items</span>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pt-3">
            {(data?.news ?? []).length === 0 && (
              <p className="text-gray-700 text-xs text-center pt-8 animate-pulse">Loading news…</p>
            )}
            {(data?.news ?? []).slice(0, 20).map((item, i) => (
              <NewsCard key={i} item={item} i={i} />
            ))}
          </div>
        </motion.div>

      </div>

      {/* Bottom: market summary strip */}
      <div className="flex-shrink-0 grid grid-cols-6 gap-2">
        {[...(eco?.indices ?? []), ...(eco?.crypto ?? [])].slice(0, 6).map((item, i) => {
          const up = (item.change_pct ?? 0) >= 0;
          return (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-3 py-2 text-center hover:border-white/[0.1] transition-all"
            >
              <p className="text-[8px] text-gray-600 font-bold">{item.symbol}</p>
              <p className="text-[11px] font-black text-white mt-0.5">
                {item.price?.toLocaleString("en-US", { maximumFractionDigits: 2 }) ?? "—"}
              </p>
              <p className={`text-[9px] font-bold ${up ? "text-[#00ff9d]" : "text-[#ff3366]"}`}>
                {up ? "▲" : "▼"} {Math.abs(item.change_pct ?? 0).toFixed(2)}%
              </p>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
