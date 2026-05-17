"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useGeoTera } from "@/lib/GeoTeraContext";
import MarketTable from "@/components/terminal/MarketTable";
import PriceChart  from "@/components/terminal/PriceChart";
import MacroPanel  from "@/components/terminal/MacroPanel";
import SectorTable from "@/components/terminal/SectorTable";
import EconCalendar from "@/components/terminal/EconCalendar";
import AITerminal  from "@/components/terminal/AITerminal";

const T = {
  bg:     "#000000",
  panel:  "#080808",
  border: "#1a1a1a",
  orange: "#ff6600",
  amber:  "#ffaa00",
  green:  "#00cc44",
  red:    "#ff4444",
  dim:    "#555555",
  text:   "#cccccc",
  white:  "#e8e8e8",
};

type MarketTab = "INDICES" | "CRYPTO" | "COMMODITIES";

function FKey({ label, sub, active, onClick }: { label: string; sub?: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? T.orange : `${T.orange}15`,
        border: `1px solid ${active ? T.orange : T.orange}44`,
        color: active ? "#000" : T.orange,
        fontFamily: "Consolas, Monaco, monospace",
        fontSize: 8,
        padding: "2px 5px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minWidth: 36,
        lineHeight: 1.2,
      }}
    >
      <span style={{ fontWeight: 700 }}>{label}</span>
      {sub && <span style={{ opacity: 0.7, fontSize: 7 }}>{sub}</span>}
    </button>
  );
}

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 11, color: T.amber, letterSpacing: 1 }}>
      {time}
    </span>
  );
}

function TickerItem({ symbol, price, change_pct }: { symbol: string; price: number | null; change_pct: number | null }) {
  const up = (change_pct ?? 0) >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "0 12px", borderRight: `1px solid ${T.border}`, flexShrink: 0 }}>
      <span style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700 }}>{symbol}</span>
      <span style={{ color: T.white, fontFamily: "Consolas, Monaco, monospace", fontSize: 9 }}>
        {price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
      </span>
      {change_pct != null && (
        <span style={{ color: up ? T.green : T.red, fontFamily: "Consolas, Monaco, monospace", fontSize: 9 }}>
          {up ? "▲" : "▼"}{Math.abs(change_pct).toFixed(2)}%
        </span>
      )}
    </span>
  );
}

function Panel({ children, label, style: s }: { children: React.ReactNode; label?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: T.panel,
      border: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      ...s,
    }}>
      {label && (
        <div style={{
          padding: "2px 6px",
          borderBottom: `1px solid ${T.orange}55`,
          fontFamily: "Consolas, Monaco, monospace",
          fontSize: 9,
          color: T.orange,
          fontWeight: 700,
          letterSpacing: 1,
          background: `${T.orange}08`,
          flexShrink: 0,
        }}>{label}</div>
      )}
      {children}
    </div>
  );
}

export default function EconomicsPage() {
  const { data, status, refresh } = useGeoTera();
  const [marketTab, setMarketTab] = useState<MarketTab>("INDICES");
  const [chartSym,  setChartSym]  = useState("^GSPC");

  const eco    = data?.economy;
  const macro  = eco?.macro;
  const all    = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];

  const statusColor = status === "connected" ? T.green : status === "connecting" ? T.amber : T.red;
  const statusLabel = status === "connected" ? "LIVE" : status === "connecting" ? "CONN…" : "RETRY";

  const vix  = macro?.vix;
  const t10y = macro?.treasury_10y;
  const t2y  = macro?.treasury_2y;
  const inverted = t2y != null && t10y != null && t2y > t10y;

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      fontFamily: "Consolas, Monaco, monospace",
      overflow: "hidden",
      paddingTop: 64,
    }}>

      {/* ── ROW 1: Function key bar ─────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        padding: "3px 6px",
        borderBottom: `1px solid ${T.orange}44`,
        background: "#050505",
        flexShrink: 0,
        flexWrap: "wrap",
      }}>
        <span style={{ color: T.orange, fontWeight: 900, fontSize: 13, letterSpacing: 2, marginRight: 8 }}>GEO</span>
        <FKey label="F1" sub="MRKT" active={marketTab === "INDICES"}    onClick={() => setMarketTab("INDICES")} />
        <FKey label="F2" sub="CRPT" active={marketTab === "CRYPTO"}     onClick={() => setMarketTab("CRYPTO")} />
        <FKey label="F3" sub="CMDTY" active={marketTab === "COMMODITIES"} onClick={() => setMarketTab("COMMODITIES")} />
        <FKey label="F4" sub="S&P500" onClick={() => setChartSym("^GSPC")} />
        <FKey label="F5" sub="BTC"    onClick={() => setChartSym("BTC-USD")} />
        <FKey label="F6" sub="GOLD"   onClick={() => setChartSym("GC=F")} />
        <FKey label="F7" sub="OIL"    onClick={() => setChartSym("CL=F")} />
        <FKey label="F8" sub="VIX"    onClick={() => setChartSym("^VIX")} />
        <div style={{ flex: 1 }} />
        {/* Macro quick-read */}
        <span style={{ fontSize: 9, color: T.dim }}>VIX</span>
        <span style={{ fontSize: 10, color: vix ? (vix > 25 ? T.red : vix > 18 ? T.amber : T.green) : T.dim, fontWeight: 700 }}>{vix?.toFixed(1) ?? "—"}</span>
        <span style={{ color: T.border, margin: "0 4px" }}>│</span>
        <span style={{ fontSize: 9, color: T.dim }}>10Y</span>
        <span style={{ fontSize: 10, color: inverted ? T.red : T.white, fontWeight: 700 }}>{t10y?.toFixed(3) ?? "—"}%</span>
        {inverted && <span style={{ fontSize: 8, color: T.red, fontWeight: 700 }}>⚠INVERTED</span>}
        <span style={{ color: T.border, margin: "0 4px" }}>│</span>
        <Clock />
        <span style={{ color: T.border, margin: "0 4px" }}>│</span>
        <button
          onClick={refresh}
          style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.dim, cursor: "pointer", padding: "2px 6px", fontSize: 8 }}
        >⟳ REFRESH</button>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span style={{ color: statusColor, fontSize: 10 }}>●</span>
          <span style={{ color: statusColor, fontSize: 8, fontWeight: 700 }}>{statusLabel}</span>
        </div>
      </div>

      {/* ── ROW 2: Ticker bar ───────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        borderBottom: `1px solid ${T.border}`,
        background: "#030303",
        overflowX: "auto",
        flexShrink: 0,
        height: 26,
      }}>
        {all.slice(0, 18).map(item => (
          <TickerItem key={item.symbol} symbol={item.symbol} price={item.price} change_pct={item.change_pct} />
        ))}
      </div>

      {/* ── ROW 3: Navigation links ─────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        padding: "2px 6px",
        borderBottom: `1px solid ${T.border}`,
        background: "#030303",
        flexShrink: 0,
      }}>
        {[
          { href: "/", label: "HOME" },
          { href: "/finance", label: "FINANCE" },
          { href: "/corporate", label: "CORPORATE" },
          { href: "/about", label: "ABOUT" },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              color: T.dim,
              fontSize: 8,
              padding: "1px 8px",
              border: `1px solid ${T.border}`,
              textDecoration: "none",
              fontFamily: "Consolas, Monaco, monospace",
              letterSpacing: 1,
              fontWeight: 700,
            }}
          >{link.label}</Link>
        ))}
        <span style={{ color: T.border, margin: "0 6px" }}>│</span>
        <span style={{ color: T.orange, fontSize: 8, fontWeight: 700 }}>ECONOMICS TERMINAL</span>
        <span style={{ color: T.dim, fontSize: 8, marginLeft: 8 }}>
          Real-time global market data · AI-powered analysis · World Bank indicators
        </span>
      </div>

      {/* ── ROW 4: Main grid (flex 1) ───────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "22% 44% 34%",
        gridTemplateRows: "50% 50%",
        gap: 1,
        padding: 1,
        minHeight: 0,
        overflow: "hidden",
      }}>

        {/* [0,0] Market Table */}
        <Panel style={{ gridColumn: 1, gridRow: 1, display: "flex", flexDirection: "column" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 1, padding: "2px 4px", borderBottom: `1px solid ${T.orange}33`, flexShrink: 0 }}>
            {(["INDICES", "CRYPTO", "COMMODITIES"] as MarketTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setMarketTab(tab)}
                style={{
                  fontFamily: "Consolas, Monaco, monospace", fontSize: 8, fontWeight: 700,
                  padding: "1px 5px", cursor: "pointer", letterSpacing: 0.5,
                  background: marketTab === tab ? T.orange : "transparent",
                  color: marketTab === tab ? "#000" : T.dim,
                  border: `1px solid ${marketTab === tab ? T.orange : T.border}`,
                }}
              >{tab}</button>
            ))}
          </div>
          <MarketTable tab={marketTab} />
        </Panel>

        {/* [0,1] Price Chart */}
        <Panel style={{ gridColumn: 2, gridRow: 1 }}>
          <PriceChart defaultSymbol={chartSym} key={chartSym} />
        </Panel>

        {/* [0,2] Macro Panel */}
        <Panel style={{ gridColumn: 3, gridRow: 1 }}>
          <MacroPanel />
        </Panel>

        {/* [1,0] Sector Table */}
        <Panel style={{ gridColumn: 1, gridRow: 2 }}>
          <SectorTable />
        </Panel>

        {/* [1,1] Economic Calendar */}
        <Panel style={{ gridColumn: 2, gridRow: 2 }}>
          <EconCalendar />
        </Panel>

        {/* [1,2] AI Terminal */}
        <Panel style={{ gridColumn: 3, gridRow: 2 }}>
          <AITerminal />
        </Panel>

      </div>

      {/* ── ROW 5: Status bar ───────────────────────────────────────────────── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "2px 8px",
        borderTop: `1px solid ${T.border}`,
        background: "#030303",
        flexShrink: 0,
        fontSize: 8,
        fontFamily: "Consolas, Monaco, monospace",
        color: T.dim,
      }}>
        <span>SRC: yfinance · World Bank · Open-Meteo · Reuters/AP RSS · Frankfurter</span>
        <span style={{ color: T.border }}>│</span>
        <span>UPD: {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : "—"}</span>
        <span style={{ color: T.border }}>│</span>
        <span style={{ color: T.red, fontWeight: 700 }}>NOT FINANCIAL ADVICE</span>
        <span style={{ flex: 1 }} />
        <span>GeoTera Economic Intelligence Terminal · v2.0</span>
      </div>
    </div>
  );
}
