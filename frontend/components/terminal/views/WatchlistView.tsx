"use client";
import { useState, useEffect } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { MarketItem } from "@/lib/useWebSocket";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

const STORAGE_KEY = "geoterra_watchlist";

function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : ["^GSPC", "BTC-USD", "GC=F", "^VIX"];
  } catch { return []; }
}

function saveWatchlist(list: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function WatchlistView() {
  const { data } = useGeoTera();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => { setWatchlist(getWatchlist()); }, []);

  const allItems = [
    ...(data?.economy?.indices ?? []),
    ...(data?.economy?.crypto ?? []),
    ...(data?.economy?.commodities ?? []),
    ...(data?.economy?.sectors ?? []),
  ];

  const watchedItems = watchlist.map(sym => {
    const item = allItems.find(i => i.symbol === sym);
    return item ?? { symbol: sym, name: sym, price: null, change_pct: null };
  });

  const available = allItems.filter(i => !watchlist.includes(i.symbol));

  const addSymbol = (sym: string) => {
    const next = [...watchlist, sym];
    setWatchlist(next);
    saveWatchlist(next);
  };

  const removeSymbol = (sym: string) => {
    const next = watchlist.filter(s => s !== sym);
    setWatchlist(next);
    saveWatchlist(next);
  };

  const addCustom = () => {
    const sym = input.trim().toUpperCase();
    if (sym && !watchlist.includes(sym)) {
      addSymbol(sym);
      setInput("");
    }
  };

  // Summary stats
  const withData = watchedItems.filter(i => i.price != null);
  const upCount = withData.filter(i => (i.change_pct ?? 0) >= 0).length;
  const downCount = withData.filter(i => (i.change_pct ?? 0) < 0).length;

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "hidden" }}>
      {/* ── Header ────────────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
        <div>
          <span style={{ color: T.orange, fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>WATCHLIST</span>
          <span style={{ color: T.dim, fontSize: 8, marginLeft: 8 }}>Personalized tracking · localStorage</span>
        </div>
        <div style={{ display: "flex", gap: 4, fontSize: 9 }}>
          <span style={{ color: T.green }}>▲{upCount}</span>
          <span style={{ color: T.dim }}>·</span>
          <span style={{ color: T.red }}>▼{downCount}</span>
          <span style={{ color: T.dim }}>· {watchlist.length} items</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 1, flex: 1, minHeight: 0 }}>
        {/* ── Watched Items ──────────────────────────────── */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33`, fontSize: 8, color: T.orange, fontWeight: 700, letterSpacing: 1 }}>
            TRACKED INSTRUMENTS
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {watchedItems.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: T.dim, fontSize: 11 }}>
                No items in watchlist. Add symbols from the right panel.
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["", "SYMBOL", "NAME", "PRICE", "CHANGE", ""].map((h, i) => (
                      <th key={i} style={{
                        fontSize: 8, color: T.orange, fontWeight: 700, letterSpacing: 0.5,
                        textAlign: i >= 3 ? "right" : "left", padding: "3px 6px",
                        background: T.panel, position: "sticky", top: 0,
                        borderBottom: `1px solid ${T.orange}33`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {watchedItems.map((item, idx) => {
                    const up = (item.change_pct ?? 0) >= 0;
                    return (
                      <tr key={item.symbol} className="mkt-row" style={{ borderBottom: `1px solid ${T.border}` }}>
                        <td style={{ padding: "4px 6px", color: T.dim, fontSize: 9 }}>{idx + 1}</td>
                        <td style={{ padding: "4px 6px", color: T.orange, fontSize: 10, fontWeight: 700 }}>{item.symbol}</td>
                        <td style={{ padding: "4px 6px", color: T.dim, fontSize: 9 }}>{item.name}</td>
                        <td style={{ padding: "4px 6px", color: T.white, fontSize: 10, fontWeight: 600, textAlign: "right" }}>
                          {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
                        </td>
                        <td style={{ padding: "4px 6px", textAlign: "right" }}>
                          <span style={{ color: item.change_pct != null ? (up ? T.green : T.red) : T.dim, fontSize: 10, fontWeight: 600 }}>
                            {item.change_pct != null ? `${up ? "+" : ""}${item.change_pct.toFixed(2)}%` : "—"}
                          </span>
                        </td>
                        <td style={{ padding: "4px 6px" }}>
                          <button
                            onClick={() => removeSymbol(item.symbol)}
                            style={{ background: "transparent", border: `1px solid ${T.red}44`, color: T.red, fontSize: 8, cursor: "pointer", padding: "1px 4px" }}
                          >✕</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Add Panel ──────────────────────────────────── */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33`, fontSize: 8, color: T.orange, fontWeight: 700, letterSpacing: 1 }}>
            ADD INSTRUMENT
          </div>
          {/* Custom input */}
          <div style={{ display: "flex", gap: 2, padding: "4px 6px", borderBottom: `1px solid ${T.border}` }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
              placeholder="SYMBOL↵"
              style={{
                flex: 1, background: "transparent", border: `1px solid ${T.border}`,
                color: T.text, fontSize: 9, padding: "3px 5px", outline: "none",
              }}
            />
            <button
              onClick={addCustom}
              disabled={!input.trim()}
              style={{
                background: T.orange, color: "#000", border: "none",
                fontSize: 8, fontWeight: 700, padding: "3px 6px", cursor: "pointer",
              }}
            >ADD</button>
          </div>
          {/* Available list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {available.map(item => (
              <div
                key={item.symbol}
                className="mkt-row"
                onClick={() => addSymbol(item.symbol)}
                style={{
                  padding: "3px 8px", cursor: "pointer",
                  borderBottom: `1px solid ${T.border}`, fontSize: 9,
                  display: "flex", justifyContent: "space-between",
                }}
              >
                <span style={{ color: T.amber }}>{item.symbol}</span>
                <span style={{ color: T.dim }}>+</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
