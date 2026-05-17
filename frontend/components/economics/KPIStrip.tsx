"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { MacroData } from "@/lib/useWebSocket";

function fmt(p: number | null | undefined, prefix = "", dec = 2): string {
  if (p == null) return "—";
  if (p >= 10000) return `${prefix}${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (p >= 1000)  return `${prefix}${p.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  return `${prefix}${p.toFixed(dec)}`;
}

function KPICard({
  label,
  value,
  sub,
  change,
  invertTrend = false,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  change?: number | null;
  invertTrend?: boolean;
  accent?: string;
}) {
  const hasChange = change != null;
  const up = (change ?? 0) >= 0;
  const positive = invertTrend ? !up : up;
  const changeColor = hasChange ? (positive ? "#00ff9d" : "#ff3366") : "#6b7280";

  return (
    <div
      className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-[#00d4ff]/30 rounded-xl px-3 py-2.5 flex flex-col gap-0.5 transition-all duration-200 cursor-default overflow-hidden"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
      <p
        className="font-mono text-sm font-black leading-none tabular-nums"
        style={{ color: accent ?? "white" }}
      >
        {value}
      </p>
      <div className="flex items-center gap-1.5 min-h-[13px]">
        {hasChange && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-bold"
            style={{ color: changeColor }}
          >
            {up ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
            {Math.abs(change!).toFixed(2)}%
          </span>
        )}
        {sub && (
          <span className="text-[9px]" style={{ color: accent ? `${accent}99` : "#4b5563" }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  );
}

export default function KPIStrip() {
  const { data } = useGeoTera();
  const eco = data?.economy;
  const macro: MacroData = eco?.macro ?? {
    vix: null, dxy: null, treasury_10y: null, treasury_2y: null,
    treasury_5y: null, treasury_30y: null, fear_greed: null,
  };

  const spx   = eco?.indices?.find(i => i.symbol === "^GSPC");
  const gold   = eco?.commodities?.find(c => c.symbol === "GC=F");
  const oil    = eco?.commodities?.find(c => c.symbol === "CL=F");
  const btc    = eco?.crypto?.find(c => c.symbol === "BTC-USD");

  const vix = macro.vix;
  const fg  = macro.fear_greed;
  const t10 = macro.treasury_10y;
  const t2  = macro.treasury_2y;
  const dxy = macro.dxy;

  const vixColor = vix == null ? "#9ca3af" : vix > 30 ? "#ff3366" : vix > 20 ? "#f97316" : "#00ff9d";
  const vixSub   = vix == null ? "" : vix > 30 ? "High Fear" : vix > 20 ? "Elevated" : "Calm";

  const fgColor = fg == null ? "#9ca3af" : fg > 75 ? "#00ff9d" : fg > 55 ? "#34d399" : fg > 45 ? "#ffd700" : fg > 25 ? "#f97316" : "#ff3366";
  const fgLabel = fg == null ? "" : fg > 75 ? "Extreme Greed" : fg > 55 ? "Greed" : fg > 45 ? "Neutral" : fg > 25 ? "Fear" : "Extreme Fear";

  const yieldInverted = t2 != null && t10 != null && t2 > t10;

  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 px-4 py-2.5 border-b border-[#00d4ff]/5">
      <KPICard
        label="S&P 500"
        value={fmt(spx?.price)}
        change={spx?.change_pct}
      />
      <KPICard
        label="VIX"
        value={vix != null ? vix.toFixed(1) : "—"}
        sub={vixSub}
        accent={vixColor}
        invertTrend
      />
      <KPICard
        label="DXY"
        value={dxy != null ? dxy.toFixed(2) : "—"}
      />
      <KPICard
        label="10Y Yield"
        value={t10 != null ? `${t10.toFixed(2)}%` : "—"}
        sub={yieldInverted ? "⚠ Inverted" : t10 != null ? "Normal" : ""}
        accent={yieldInverted ? "#ff3366" : undefined}
      />
      <KPICard
        label="Fear & Greed"
        value={fg != null ? `${fg}` : "—"}
        sub={fgLabel}
        accent={fgColor}
      />
      <KPICard
        label="Gold"
        value={fmt(gold?.price, "$")}
        change={gold?.change_pct}
      />
      <KPICard
        label="Crude Oil"
        value={fmt(oil?.price, "$")}
        change={oil?.change_pct}
      />
      <KPICard
        label="Bitcoin"
        value={fmt(btc?.price, "$")}
        change={btc?.change_pct}
      />
    </div>
  );
}
