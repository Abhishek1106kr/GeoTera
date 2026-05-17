"use client";
import { useRef, useState } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { AlertTriangle, Activity, Zap } from "lucide-react";

function Chip({
  label, value, color, sub, alert,
}: {
  label: string; value: string; color?: string; sub?: string; alert?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 border-r border-white/[0.05] flex-shrink-0 ${alert ? "bg-[#ff3366]/5" : ""}`}>
      {alert && <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366] animate-pulse flex-shrink-0" />}
      <div>
        <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-[11px] font-mono font-bold leading-tight" style={{ color: color ?? "#e2e8f0" }}>
          {value}
          {sub && <span className="text-[9px] font-normal text-gray-500 ml-1">{sub}</span>}
        </p>
      </div>
    </div>
  );
}

export default function IntelBar() {
  const { data, status } = useGeoTera();
  const tickerRef = useRef<HTMLDivElement>(null);
  const eco = data?.economy;
  const macro = eco?.macro;

  const sp500    = eco?.indices?.find(i => i.symbol === "^GSPC");
  const gold     = eco?.commodities?.find(c => c.symbol === "GC=F");
  const oil      = eco?.commodities?.find(c => c.symbol === "CL=F");
  const btc      = eco?.crypto?.find(c => c.symbol === "BTC-USD");
  const vix      = macro?.vix;
  const dxy      = macro?.dxy;
  const t10y     = macro?.treasury_10y;
  const t2y      = macro?.treasury_2y;
  const fg       = macro?.fear_greed;
  const inverted = t2y != null && t10y != null && t2y > t10y;

  const vixColor  = vix == null ? "#6b7280" : vix > 30 ? "#ff3366" : vix > 20 ? "#f59e0b" : "#00ff9d";
  const fgColor   = fg  == null ? "#6b7280" : fg > 60 ? "#00ff9d" : fg > 40 ? "#f59e0b" : "#ff3366";

  const allItems = [
    ...(eco?.indices ?? []),
    ...(eco?.crypto ?? []),
    ...(eco?.commodities ?? []),
  ];

  const statusColor = status === "connected" ? "#00ff9d" : status === "connecting" ? "#f59e0b" : "#ff3366";

  return (
    <div className="flex-shrink-0 bg-[#020509] border-b border-white/[0.05] flex items-center h-11 overflow-hidden">
      {/* Logo / Status */}
      <div className="flex items-center gap-2 px-3 border-r border-white/[0.05] flex-shrink-0 h-full">
        <span style={{ color: statusColor }} className="w-1.5 h-1.5 rounded-full animate-pulse" />
        <Activity size={11} style={{ color: statusColor }} />
        <span className="text-[9px] font-black text-white tracking-widest uppercase">LIVE</span>
      </div>

      {/* Metric chips */}
      {sp500 && (
        <Chip
          label="S&P 500"
          value={sp500.price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"}
          color={(sp500.change_pct ?? 0) >= 0 ? "#00ff9d" : "#ff3366"}
          sub={sp500.change_pct != null ? `${sp500.change_pct >= 0 ? "+" : ""}${sp500.change_pct.toFixed(2)}%` : undefined}
        />
      )}
      {vix != null && (
        <Chip label="VIX" value={vix.toFixed(1)} color={vixColor} alert={vix > 25} />
      )}
      {dxy != null && (
        <Chip label="DXY" value={dxy.toFixed(2)} color="#38bdf8" />
      )}
      {t10y != null && (
        <Chip
          label="10Y"
          value={`${t10y.toFixed(3)}%`}
          color={inverted ? "#ff3366" : "#e2e8f0"}
          alert={inverted}
          sub={inverted ? "INVERTED" : undefined}
        />
      )}
      {gold && (
        <Chip
          label="GOLD"
          value={gold.price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"}
          color="#f59e0b"
          sub={gold.change_pct != null ? `${gold.change_pct >= 0 ? "+" : ""}${gold.change_pct.toFixed(2)}%` : undefined}
        />
      )}
      {oil && (
        <Chip
          label="OIL"
          value={oil.price?.toFixed(2) ?? "—"}
          color="#fb923c"
          sub={oil.change_pct != null ? `${oil.change_pct >= 0 ? "+" : ""}${oil.change_pct.toFixed(2)}%` : undefined}
        />
      )}
      {btc && (
        <Chip
          label="BTC"
          value={btc.price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"}
          color="#c084fc"
          sub={btc.change_pct != null ? `${btc.change_pct >= 0 ? "+" : ""}${btc.change_pct.toFixed(2)}%` : undefined}
        />
      )}
      {fg != null && (
        <Chip label="F&G" value={`${fg}/100`} color={fgColor} sub={fg > 60 ? "GREED" : fg > 40 ? "NEUTRAL" : "FEAR"} />
      )}

      {/* Divider */}
      <div className="w-px h-full bg-white/[0.05] flex-shrink-0" />

      {/* Scrolling news ticker */}
      <div className="flex-1 overflow-hidden relative flex items-center">
        <div className="flex items-center gap-1 px-3 flex-shrink-0">
          <Zap size={10} className="text-[#f59e0b]" />
          <span className="text-[8px] font-black text-[#f59e0b] uppercase tracking-widest">INTEL</span>
        </div>
        <div className="overflow-hidden flex-1">
          <div className="ticker-track flex items-center gap-0">
            {[...(data?.news ?? []), ...(data?.news ?? [])].map((n, i) => (
              <span key={i} className="text-[10px] text-gray-500 px-4 border-r border-white/[0.04] flex-shrink-0 whitespace-nowrap">
                <span className="text-[#00d4ff] font-bold mr-1.5">{n.source?.toUpperCase()}</span>
                {n.title}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Anomaly alert */}
      {(inverted || (vix != null && vix > 25)) && (
        <div className="flex items-center gap-1.5 px-3 border-l border-white/[0.05] flex-shrink-0 bg-[#ff3366]/5">
          <AlertTriangle size={10} className="text-[#ff3366] animate-pulse" />
          <span className="text-[8px] font-black text-[#ff3366] uppercase tracking-wide whitespace-nowrap">
            {inverted ? "Curve Inverted" : "VIX Elevated"}
          </span>
        </div>
      )}
    </div>
  );
}
