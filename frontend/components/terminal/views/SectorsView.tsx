"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

const SECTOR_META: Record<string, { icon: string; desc: string }> = {
  "Technology":      { icon: "⚡", desc: "Software, Hardware, Semiconductors" },
  "Financials":      { icon: "🏛", desc: "Banks, Insurance, Asset Management" },
  "Energy":          { icon: "🛢", desc: "Oil, Gas, Renewable Energy" },
  "Health Care":     { icon: "🏥", desc: "Pharma, Biotech, Medical Devices" },
  "Industrials":     { icon: "🏭", desc: "Aerospace, Defense, Machinery" },
  "Communication":   { icon: "📡", desc: "Telecom, Media, Entertainment" },
  "Cons. Staples":   { icon: "🛒", desc: "Food, Beverages, Household" },
  "Cons. Discret.":  { icon: "🎯", desc: "Retail, Auto, Luxury Goods" },
  "Real Estate":     { icon: "🏢", desc: "REITs, Property Management" },
  "Materials":       { icon: "⛏", desc:  "Chemicals, Mining, Metals" },
  "Utilities":       { icon: "💡", desc: "Electric, Water, Gas" },
};

export default function SectorsView() {
  const { data } = useGeoTera();
  const sectors = [...(data?.economy?.sectors ?? [])].sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0));

  const upCount = sectors.filter(s => (s.change_pct ?? 0) > 0).length;
  const downCount = sectors.filter(s => (s.change_pct ?? 0) < 0).length;
  const bestSector = sectors[0];
  const worstSector = sectors[sectors.length - 1];

  if (!sectors.length) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.dim, fontSize: 11 }}>
      LOADING SECTOR DATA…
    </div>
  );

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "auto" }}>
      {/* ── Summary Strip ─────────────────────────────────── */}
      <div style={{ display: "flex", gap: 1 }}>
        <div className="glass-panel" style={{ flex: 1, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.orange, fontSize: 9, fontWeight: 700 }}>MARKET BREADTH</span>
          <span style={{ color: T.green, fontSize: 11, fontWeight: 700 }}>▲{upCount}</span>
          <span style={{ color: T.dim }}>·</span>
          <span style={{ color: T.red, fontSize: 11, fontWeight: 700 }}>▼{downCount}</span>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: "8px 10px" }}>
          <span style={{ color: T.dim, fontSize: 8 }}>LEADER </span>
          <span style={{ color: T.green, fontSize: 10, fontWeight: 700 }}>
            {bestSector?.name} {bestSector?.change_pct != null ? `+${bestSector.change_pct.toFixed(2)}%` : ""}
          </span>
        </div>
        <div className="glass-panel" style={{ flex: 1, padding: "8px 10px" }}>
          <span style={{ color: T.dim, fontSize: 8 }}>LAGGARD </span>
          <span style={{ color: T.red, fontSize: 10, fontWeight: 700 }}>
            {worstSector?.name} {worstSector?.change_pct?.toFixed(2) ?? "—"}%
          </span>
        </div>
      </div>

      {/* ── Treemap Heatmap ───────────────────────────────── */}
      <div className="glass-panel" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>S&P 500 SECTOR HEATMAP</span>
          <span style={{ color: T.dim, fontSize: 8 }}>SORTED BY PERFORMANCE</span>
        </div>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1, padding: 1, overflow: "auto" }}>
          {sectors.map(sector => {
            const pct = sector.change_pct ?? 0;
            const up = pct >= 0;
            const intensity = Math.min(1, Math.abs(pct) / 3);
            const bg = up
              ? `rgba(0,204,68,${0.04 + intensity * 0.18})`
              : `rgba(255,68,68,${0.04 + intensity * 0.18})`;
            const meta = SECTOR_META[sector.name] ?? { icon: "◆", desc: sector.symbol };

            return (
              <div key={sector.symbol} className="mkt-row" style={{
                background: bg,
                border: `1px solid ${up ? T.green : T.red}15`,
                padding: "10px 12px",
                display: "flex", flexDirection: "column",
                gap: 4, cursor: "default",
                transition: "background 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, marginBottom: 2 }}>{meta.icon}</div>
                    <div style={{ fontSize: 11, color: T.white, fontWeight: 700 }}>{sector.name}</div>
                    <div style={{ fontSize: 8, color: T.dim, marginTop: 1 }}>{meta.desc}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, color: up ? T.green : T.red, fontWeight: 700 }}>
                      {up ? "+" : ""}{pct.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: 10, color: T.white, marginTop: 2 }}>
                      ${sector.price?.toFixed(2) ?? "—"}
                    </div>
                  </div>
                </div>
                {/* Performance bar */}
                <div style={{ height: 3, background: "#111", borderRadius: 1, overflow: "hidden" }}>
                  <div className="gauge-fill" style={{
                    width: `${Math.min(100, Math.abs(pct) * 25)}%`,
                    height: "100%", background: up ? T.green : T.red,
                  }} />
                </div>
                <div style={{ fontSize: 8, color: T.dim }}>{sector.symbol}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
