"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg:     "#000000",
  panel:  "#080808",
  border: "#1a1a1a",
  orange: "#ff6600",
  green:  "#00cc44",
  red:    "#ff4444",
  dim:    "#555555",
  text:   "#cccccc",
  white:  "#e8e8e8",
};

const ICONS: Record<string, string> = {
  "Technology":     "TECH",
  "Financials":     "FIN ",
  "Energy":         "ENRG",
  "Health Care":    "HLTH",
  "Industrials":    "INDU",
  "Communication":  "COMM",
  "Cons. Staples":  "STPL",
  "Cons. Discret.": "DISC",
  "Real Estate":    "REIT",
  "Materials":      "MATL",
  "Utilities":      "UTIL",
};

export default function SectorTable() {
  const { data } = useGeoTera();
  const sectors = data?.economy?.sectors ?? [];
  const sorted  = [...sectors].sort((a, b) => (b.change_pct ?? -99) - (a.change_pct ?? -99));

  const up   = sorted.filter(s => (s.change_pct ?? 0) > 0).length;
  const down = sorted.filter(s => (s.change_pct ?? 0) < 0).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "3px 6px",
        borderBottom: `1px solid ${T.orange}55`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
          S&amp;P SECTORS
        </span>
        {sectors.length > 0 && (
          <span style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9 }}>
            <span style={{ color: T.green }}>▲{up}</span>
            <span style={{ color: T.dim, margin: "0 4px" }}>·</span>
            <span style={{ color: T.red }}>▼{down}</span>
          </span>
        )}
      </div>

      {!sectors.length ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 11 }}>
          LOADING…
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                {["CODE", "SECTOR", "PRICE", "CHG%"].map((h, i) => (
                  <th key={h} style={{
                    fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.orange,
                    textAlign: i >= 2 ? "right" : "left",
                    padding: "3px 6px", background: T.panel,
                    position: "sticky", top: 0, fontWeight: 700, letterSpacing: 0.5,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => {
                const c = (s.change_pct ?? 0) >= 0 ? T.green : T.red;
                const barW = Math.min(100, Math.abs(s.change_pct ?? 0) * 25);
                return (
                  <tr key={s.symbol} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.amber, padding: "3px 6px", fontWeight: 700 }}>
                      {ICONS[s.name] ?? s.symbol.replace("XL", "XL·").slice(0, 4)}
                    </td>
                    <td style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.dim, padding: "3px 6px" }}>
                      {s.name}
                    </td>
                    <td style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 10, color: T.white, padding: "3px 6px", textAlign: "right" }}>
                      {s.price?.toFixed(2) ?? "—"}
                    </td>
                    <td style={{ padding: "3px 6px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 5 }}>
                        <div style={{ width: 28, height: 3, background: "#111", borderRadius: 1, overflow: "hidden" }}>
                          <div style={{ width: `${barW}%`, height: "100%", background: c }} />
                        </div>
                        <span style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 10, color: c, minWidth: 50, textAlign: "right" }}>
                          {s.change_pct != null ? `${s.change_pct >= 0 ? "+" : ""}${s.change_pct.toFixed(2)}%` : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
