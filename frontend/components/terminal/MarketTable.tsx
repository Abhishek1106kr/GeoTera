"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { MarketItem } from "@/lib/useWebSocket";

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

function pct(v: number | null) {
  if (v == null) return <span style={{ color: T.dim }}>—</span>;
  const c = v >= 0 ? T.green : T.red;
  return <span style={{ color: c }}>{v >= 0 ? "+" : ""}{v.toFixed(2)}%</span>;
}

function Row({ item, rank }: { item: MarketItem; rank: number }) {
  const c = (item.change_pct ?? 0) >= 0 ? T.green : T.red;
  return (
    <tr
      style={{
        borderBottom: `1px solid ${T.border}`,
        fontFamily: "Consolas, Monaco, monospace",
        fontSize: 11,
      }}
    >
      <td style={{ color: T.dim, paddingRight: 6, paddingLeft: 4, paddingTop: 3, paddingBottom: 3 }}>{rank}</td>
      <td style={{ color: T.orange, fontWeight: 700, paddingRight: 8, whiteSpace: "nowrap" }}>{item.symbol}</td>
      <td style={{ color: T.dim, paddingRight: 8, maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</td>
      <td style={{ color: T.white, fontWeight: 600, textAlign: "right", paddingRight: 8 }}>
        {item.price != null ? item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
      </td>
      <td style={{ textAlign: "right", paddingRight: 8 }}>{pct(item.change_pct)}</td>
      <td style={{ paddingRight: 4 }}>
        <div style={{ width: 40, height: 3, background: "#111", borderRadius: 2 }}>
          <div style={{
            width: `${Math.min(100, Math.abs(item.change_pct ?? 0) * 20)}%`,
            height: "100%",
            background: c,
            borderRadius: 2,
          }} />
        </div>
      </td>
    </tr>
  );
}

export default function MarketTable({ tab }: { tab: "INDICES" | "CRYPTO" | "COMMODITIES" }) {
  const { data } = useGeoTera();
  const eco = data?.economy;

  const items: MarketItem[] =
    tab === "INDICES"     ? (eco?.indices     ?? []) :
    tab === "CRYPTO"      ? (eco?.crypto      ?? []) :
                            (eco?.commodities ?? []);

  const sorted = [...items].sort((a, b) => (b.change_pct ?? -99) - (a.change_pct ?? -99));

  if (!sorted.length) return (
    <div style={{ color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 11, padding: 8 }}>
      LOADING…
    </div>
  );

  return (
    <div style={{ overflowY: "auto", flex: 1 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${T.orange}33` }}>
            {["#", "SYM", "NAME", "LAST", "CHG%", ""].map((h, i) => (
              <th key={i} style={{
                color: T.orange,
                fontFamily: "Consolas, Monaco, monospace",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 1,
                textAlign: i >= 3 ? "right" : "left",
                padding: "3px 8px 3px 4px",
                background: T.panel,
                position: "sticky",
                top: 0,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => <Row key={item.symbol} item={item} rank={i + 1} />)}
        </tbody>
      </table>
    </div>
  );
}
