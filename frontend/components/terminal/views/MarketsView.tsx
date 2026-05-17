"use client";
import { useState } from "react";
import MarketTable from "@/components/terminal/MarketTable";
import PriceChart from "@/components/terminal/PriceChart";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

type MarketTab = "INDICES" | "CRYPTO" | "COMMODITIES";

export default function MarketsView() {
  const { data } = useGeoTera();
  const [tab, setTab] = useState<MarketTab>("INDICES");
  const [chartSym, setChartSym] = useState("^GSPC");

  const eco = data?.economy;
  const items = tab === "INDICES" ? (eco?.indices ?? []) : tab === "CRYPTO" ? (eco?.crypto ?? []) : (eco?.commodities ?? []);

  return (
    <div className="view-enter" style={{
      display: "grid", gridTemplateColumns: "280px 1fr",
      gap: 1, height: "100%", overflow: "hidden",
    }}>
      {/* Left: Market Table */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Tab bar */}
        <div style={{ display: "flex", gap: 1, padding: "3px 4px", borderBottom: `1px solid ${T.orange}33`, flexShrink: 0 }}>
          {(["INDICES", "CRYPTO", "COMMODITIES"] as MarketTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontSize: 8, fontWeight: 700, padding: "2px 6px", cursor: "pointer", letterSpacing: 0.5,
                background: tab === t ? T.orange : "transparent",
                color: tab === t ? "#000" : T.dim,
                border: `1px solid ${tab === t ? T.orange : T.border}`,
              }}
            >{t}</button>
          ))}
        </div>

        {/* Clickable rows */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.orange}33` }}>
                {["SYM", "LAST", "CHG%"].map((h, i) => (
                  <th key={h} style={{
                    color: T.orange, fontSize: 8, fontWeight: 700, letterSpacing: 0.5,
                    textAlign: i >= 1 ? "right" : "left", padding: "3px 6px",
                    background: T.panel, position: "sticky", top: 0,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const up = (item.change_pct ?? 0) >= 0;
                const active = chartSym === item.symbol;
                return (
                  <tr
                    key={item.symbol}
                    className="mkt-row"
                    onClick={() => setChartSym(item.symbol)}
                    style={{
                      cursor: "pointer",
                      borderBottom: `1px solid ${T.border}`,
                      background: active ? `${T.orange}12` : "transparent",
                      borderLeft: active ? `2px solid ${T.orange}` : "2px solid transparent",
                    }}
                  >
                    <td style={{ color: active ? T.orange : T.amber, fontSize: 10, fontWeight: 700, padding: "4px 6px", whiteSpace: "nowrap" }}>
                      {item.symbol}
                      <div style={{ color: T.dim, fontSize: 8, fontWeight: 400 }}>{item.name}</div>
                    </td>
                    <td style={{ color: T.white, fontSize: 10, textAlign: "right", padding: "4px 6px", fontWeight: 600 }}>
                      {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                    </td>
                    <td style={{ textAlign: "right", padding: "4px 6px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        <div style={{ width: 30, height: 3, background: "#111", borderRadius: 1, overflow: "hidden" }}>
                          <div style={{
                            width: `${Math.min(100, Math.abs(item.change_pct ?? 0) * 20)}%`,
                            height: "100%", background: up ? T.green : T.red,
                          }} />
                        </div>
                        <span style={{ color: up ? T.green : T.red, fontSize: 10, fontWeight: 600, minWidth: 48, textAlign: "right" }}>
                          {item.change_pct != null ? `${up ? "+" : ""}${item.change_pct.toFixed(2)}%` : "—"}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Price Chart */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <PriceChart defaultSymbol={chartSym} key={chartSym} />
      </div>
    </div>
  );
}
