"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useGeoTera } from "@/lib/GeoTeraContext";
import IntelligenceBar from "@/components/terminal/IntelligenceBar";
import NavRail, { type ViewKey } from "@/components/terminal/NavRail";
import AITerminal from "@/components/terminal/AITerminal";
import OverviewView from "@/components/terminal/views/OverviewView";
import MarketsView from "@/components/terminal/views/MarketsView";
import MacroView from "@/components/terminal/views/MacroView";
import SectorsView from "@/components/terminal/views/SectorsView";
import CommoditiesView from "@/components/terminal/views/CommoditiesView";
import ForexView from "@/components/terminal/views/ForexView";
import RiskRadarView from "@/components/terminal/views/RiskRadarView";
import ForecastView from "@/components/terminal/views/ForecastView";
import ExplorerView from "@/components/terminal/views/ExplorerView";
import WatchlistView from "@/components/terminal/views/WatchlistView";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

const VIEW_LABELS: Record<ViewKey, string> = {
  overview: "OVERVIEW",
  markets: "FINANCIAL MARKETS",
  macro: "MACRO INDICATORS",
  sectors: "SECTOR INTELLIGENCE",
  commodities: "COMMODITIES & ENERGY",
  forex: "FOREIGN EXCHANGE",
  risk: "RISK RADAR",
  forecast: "AI FORECAST & CALENDAR",
  explorer: "COUNTRY EXPLORER",
  watchlist: "WATCHLIST",
};

function ViewRenderer({ view }: { view: ViewKey }) {
  switch (view) {
    case "overview":    return <OverviewView />;
    case "markets":     return <MarketsView />;
    case "macro":       return <MacroView />;
    case "sectors":     return <SectorsView />;
    case "commodities": return <CommoditiesView />;
    case "forex":       return <ForexView />;
    case "risk":        return <RiskRadarView />;
    case "forecast":    return <ForecastView />;
    case "explorer":    return <ExplorerView />;
    case "watchlist":   return <WatchlistView />;
    default:            return <OverviewView />;
  }
}

export default function EconomicsPage() {
  const { data } = useGeoTera();
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [aiOpen, setAiOpen] = useState(true);

  // Keyboard shortcuts: 1-0 switch views, Escape toggles AI
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const keys: Record<string, ViewKey> = {
        "1": "overview", "2": "markets", "3": "macro", "4": "sectors",
        "5": "commodities", "6": "forex", "7": "risk", "8": "forecast",
        "9": "explorer", "0": "watchlist",
      };

      if (keys[e.key]) {
        e.preventDefault();
        setActiveView(keys[e.key]);
      } else if (e.key === "Escape") {
        setAiOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      overflow: "hidden",
      paddingTop: 64, // for the global nav
    }}>
      {/* ── Intelligence Bar (top ribbon) ─────────────────── */}
      <IntelligenceBar />

      {/* ── Nav links bar ─────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 2,
        padding: "2px 6px", borderBottom: `1px solid ${T.border}`,
        background: "#030303", flexShrink: 0, fontSize: 8,
      }}>
        {[
          { href: "/", label: "HOME" },
          { href: "/news", label: "NEWS" },
          { href: "/climate", label: "CLIMATE" },
          { href: "/population", label: "POPULATION" },
          { href: "/about", label: "ABOUT" },
        ].map(link => (
          <Link
            key={link.href} href={link.href}
            style={{
              color: T.dim, padding: "1px 6px", border: `1px solid ${T.border}`,
              textDecoration: "none", fontWeight: 700, letterSpacing: 1,
            }}
          >{link.label}</Link>
        ))}
        <span style={{ color: T.border, margin: "0 4px" }}>│</span>
        <span style={{ color: T.orange, fontWeight: 700, letterSpacing: 1 }}>ECONOMICS TERMINAL</span>
        <span style={{ color: T.dim, marginLeft: 6 }}>
          {VIEW_LABELS[activeView]}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setAiOpen(prev => !prev)}
          style={{
            background: aiOpen ? `${T.orange}15` : "transparent",
            border: `1px solid ${aiOpen ? T.orange : T.border}`,
            color: aiOpen ? T.orange : T.dim,
            fontSize: 8, fontWeight: 700, cursor: "pointer", padding: "1px 6px",
          }}
        >
          AI {aiOpen ? "ON" : "OFF"} [Esc]
        </button>
      </div>

      {/* ── Main content area ─────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Nav Rail */}
        <NavRail
          active={activeView}
          onChange={setActiveView}
          collapsed={navCollapsed}
          onToggle={() => setNavCollapsed(prev => !prev)}
        />

        {/* Center: Dynamic View Canvas */}
        <div style={{
          flex: 1, overflow: "hidden",
          padding: 1, display: "flex", flexDirection: "column",
          minWidth: 0,
        }}>
          <ViewRenderer view={activeView} />
        </div>

        {/* Right: AI Terminal (collapsible) */}
        {aiOpen && (
          <div style={{
            width: 320,
            borderLeft: `1px solid ${T.border}`,
            background: T.bg,
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            <AITerminal />
          </div>
        )}
      </div>

      {/* ── Status bar ────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "2px 8px", borderTop: `1px solid ${T.border}`,
        background: "#030303", flexShrink: 0, fontSize: 8, color: T.dim,
      }}>
        <span>SRC: yfinance · World Bank · Frankfurter · Reuters/AP RSS</span>
        <span style={{ color: T.border }}>│</span>
        <span>UPD: {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : "—"}</span>
        <span style={{ color: T.border }}>│</span>
        <span>VIEW: {VIEW_LABELS[activeView]}</span>
        <span style={{ color: T.border }}>│</span>
        <span>KEYS: 1-0 navigate · Esc toggle AI</span>
        <span style={{ flex: 1 }} />
        <span style={{ color: T.red, fontWeight: 700 }}>NOT FINANCIAL ADVICE</span>
        <span style={{ color: T.border }}>│</span>
        <span>GeoTera Economic Intelligence Terminal v2.0</span>
      </div>
    </div>
  );
}
