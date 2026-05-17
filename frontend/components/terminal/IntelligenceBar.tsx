"use client";
import { useEffect, useState, useRef } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span style={{ color: T.amber, letterSpacing: 1 }}>{t}</span>;
}

export default function IntelligenceBar() {
  const { data, status, refresh } = useGeoTera();
  const eco = data?.economy;
  const macro = eco?.macro;
  const all = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];

  const vix = macro?.vix;
  const vixColor = vix == null ? T.dim : vix > 30 ? T.red : vix > 20 ? T.amber : T.green;
  const fg = macro?.fear_greed;
  const fgColor = fg == null ? T.dim : fg > 60 ? T.green : fg > 40 ? T.amber : T.red;
  const fgLabel = fg == null ? "—" : fg > 75 ? "XGREED" : fg > 55 ? "GREED" : fg > 45 ? "NEUTRAL" : fg > 25 ? "FEAR" : "XFEAR";
  const t10y = macro?.treasury_10y;
  const t2y = macro?.treasury_2y;
  const inverted = t2y != null && t10y != null && t2y > t10y;

  const statusColor = status === "connected" ? T.green : status === "connecting" ? T.amber : T.red;
  const statusLabel = status === "connected" ? "LIVE" : status === "connecting" ? "CONN" : "DISC";

  return (
    <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
      {/* ── Row 1: Macro badges + status ─────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2, padding: "3px 6px",
        borderBottom: `1px solid ${T.orange}33`, background: "#050505",
        fontSize: 9, fontWeight: 700, flexWrap: "wrap",
      }}>
        <span style={{ color: T.orange, fontSize: 13, letterSpacing: 2, marginRight: 6, fontWeight: 900 }}>GEO</span>
        <span style={{ color: T.orange, fontSize: 9, letterSpacing: 1, marginRight: 6 }}>ECONOMIC INTELLIGENCE</span>
        <span style={{ color: T.border, margin: "0 2px" }}>│</span>

        {/* VIX */}
        <span style={{ color: T.dim }}>VIX</span>
        <span style={{ color: vixColor, marginRight: 4 }}>{vix?.toFixed(1) ?? "—"}</span>

        {/* F&G */}
        <span style={{ color: T.dim }}>F&G</span>
        <span style={{ color: fgColor, marginRight: 4 }}>{fg ?? "—"} {fgLabel}</span>

        {/* 10Y */}
        <span style={{ color: T.dim }}>10Y</span>
        <span style={{ color: inverted ? T.red : T.white }}>{t10y?.toFixed(3) ?? "—"}%</span>
        {inverted && <span style={{ color: T.red, fontSize: 8, marginLeft: 2 }}>⚠INV</span>}

        {/* DXY */}
        <span style={{ color: T.dim, marginLeft: 4 }}>DXY</span>
        <span style={{ color: T.amber }}>{macro?.dxy?.toFixed(2) ?? "—"}</span>

        <div style={{ flex: 1 }} />

        <Clock />
        <span style={{ color: T.border, margin: "0 3px" }}>│</span>
        <button
          onClick={refresh}
          style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.dim, cursor: "pointer", padding: "1px 5px", fontSize: 8 }}
        >⟳</button>
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginLeft: 4 }}>
          <span className="live-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: statusColor, color: statusColor, display: "inline-block" }} />
          <span style={{ color: statusColor, fontSize: 8 }}>{statusLabel}</span>
        </div>
      </div>

      {/* ── Row 2: Scrolling ticker ──────────────────────────── */}
      <div style={{
        overflow: "hidden", borderBottom: `1px solid ${T.border}`,
        background: "#030303", height: 22, position: "relative",
      }}>
        <div className="ticker-track" style={{
          display: "flex", alignItems: "center", whiteSpace: "nowrap",
          height: "100%", width: "max-content",
        }}>
          {[...all, ...all].map((item, i) => {
            const up = (item.change_pct ?? 0) >= 0;
            return (
              <span key={`${item.symbol}-${i}`} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "0 10px", borderRight: `1px solid ${T.border}`, fontSize: 9,
              }}>
                <span style={{ color: T.orange, fontWeight: 700 }}>{item.symbol}</span>
                <span style={{ color: T.white }}>
                  {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                </span>
                {item.change_pct != null && (
                  <span style={{ color: up ? T.green : T.red }}>
                    {up ? "▲" : "▼"}{Math.abs(item.change_pct).toFixed(2)}%
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
