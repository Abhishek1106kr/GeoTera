"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

export default function CommoditiesView() {
  const { data } = useGeoTera();
  const commodities = data?.economy?.commodities ?? [];

  const COMMODITY_META: Record<string, { icon: string; category: string }> = {
    "GC=F": { icon: "🥇", category: "PRECIOUS METALS" },
    "SI=F": { icon: "🥈", category: "PRECIOUS METALS" },
    "CL=F": { icon: "🛢️", category: "ENERGY" },
    "NG=F": { icon: "🔥", category: "ENERGY" },
    "HG=F": { icon: "🔶", category: "INDUSTRIAL METALS" },
    "ZW=F": { icon: "🌾", category: "AGRICULTURE" },
  };

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "auto" }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ color: T.orange, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>COMMODITIES & ENERGY</span>
          <span style={{ color: T.dim, fontSize: 8, marginLeft: 8 }}>Real-time commodity futures</span>
        </div>
        <span style={{ color: T.dim, fontSize: 8 }}>{commodities.length} INSTRUMENTS</span>
      </div>

      {/* Commodity Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 1, flex: 1 }}>
        {commodities.map(c => {
          const pct = c.change_pct ?? 0;
          const up = pct >= 0;
          const meta = COMMODITY_META[c.symbol] ?? { icon: "◆", category: "OTHER" };
          const intensity = Math.min(1, Math.abs(pct) / 4);
          const bg = up
            ? `rgba(0,204,68,${0.03 + intensity * 0.12})`
            : `rgba(255,68,68,${0.03 + intensity * 0.12})`;

          return (
            <div key={c.symbol} className="glass-panel mkt-row" style={{ padding: "12px 14px", background: bg, cursor: "default" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{meta.icon}</div>
                  <div style={{ fontSize: 12, color: T.white, fontWeight: 700 }}>{c.name}</div>
                  <div style={{ fontSize: 8, color: T.dim, letterSpacing: 0.5 }}>{meta.category}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 8, color: T.orange, fontWeight: 700 }}>{c.symbol}</div>
                  <div style={{ fontSize: 20, color: T.white, fontWeight: 700, marginTop: 4 }}>
                    ${c.price?.toFixed(2) ?? "—"}
                  </div>
                  <div style={{ fontSize: 11, color: up ? T.green : T.red, fontWeight: 700, marginTop: 2 }}>
                    {up ? "▲+" : "▼"}{pct.toFixed(2)}%
                  </div>
                </div>
              </div>
              {/* Bar */}
              <div style={{ height: 3, background: "#111", borderRadius: 1, overflow: "hidden", marginTop: 8 }}>
                <div className="gauge-fill" style={{
                  width: `${Math.min(100, Math.abs(pct) * 25)}%`,
                  height: "100%", background: up ? T.green : T.red,
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Energy vs Metals comparison */}
      <div className="glass-panel" style={{ padding: "8px 10px" }}>
        <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>COMMODITY PERFORMANCE COMPARISON</div>
        <div style={{ display: "flex", gap: 4 }}>
          {commodities.map(c => {
            const pct = c.change_pct ?? 0;
            const up = pct >= 0;
            return (
              <div key={c.symbol} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 8, color: T.dim, marginBottom: 2 }}>{c.name}</div>
                <div style={{ height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <div style={{
                    width: 16, borderRadius: "2px 2px 0 0",
                    height: `${Math.min(40, Math.abs(pct) * 10)}px`,
                    background: up ? T.green : T.red,
                    transition: "height 1s ease",
                  }} />
                </div>
                <div style={{ fontSize: 9, color: up ? T.green : T.red, fontWeight: 600, marginTop: 2 }}>
                  {up ? "+" : ""}{pct.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
