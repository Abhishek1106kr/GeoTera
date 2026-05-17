"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { MarketItem } from "@/lib/useWebSocket";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

function KPICard({ label, value, change, prefix }: { label: string; value: string; change?: number | null; prefix?: string }) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="glass-panel" style={{ padding: "8px 10px", flex: "1 1 0", minWidth: 110 }}>
      <div style={{ fontSize: 8, color: T.dim, letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 16, color: T.white, fontWeight: 700 }}>
        {prefix}{value}
      </div>
      {change != null && (
        <div style={{ fontSize: 9, color: up ? T.green : T.red, marginTop: 2 }}>
          {up ? "▲" : "▼"} {up ? "+" : ""}{change.toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function HeatCell({ item }: { item: MarketItem }) {
  const pct = item.change_pct ?? 0;
  const up = pct >= 0;
  const intensity = Math.min(1, Math.abs(pct) / 5);
  const bg = up
    ? `rgba(0,204,68,${0.05 + intensity * 0.2})`
    : `rgba(255,68,68,${0.05 + intensity * 0.2})`;

  return (
    <div style={{
      background: bg,
      border: `1px solid ${up ? T.green : T.red}22`,
      padding: "5px 6px",
      display: "flex", flexDirection: "column",
      gap: 1,
    }}>
      <div style={{ fontSize: 8, color: T.orange, fontWeight: 700 }}>{item.symbol}</div>
      <div style={{ fontSize: 11, color: T.white, fontWeight: 600 }}>
        {item.price?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? "—"}
      </div>
      <div style={{ fontSize: 9, color: up ? T.green : T.red }}>
        {up ? "+" : ""}{pct.toFixed(2)}%
      </div>
    </div>
  );
}

function SectorBar({ name, pct }: { name: string; pct: number }) {
  const up = pct >= 0;
  const width = Math.min(100, Math.abs(pct) * 25);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
      <span style={{ color: T.dim, fontSize: 9, width: 70, flexShrink: 0 }}>{name}</span>
      <div style={{ flex: 1, height: 4, background: "#111", borderRadius: 1, overflow: "hidden" }}>
        <div className="gauge-fill" style={{
          width: `${width}%`, height: "100%",
          background: up ? T.green : T.red, borderRadius: 1,
        }} />
      </div>
      <span style={{ color: up ? T.green : T.red, fontSize: 9, width: 45, textAlign: "right", fontWeight: 600 }}>
        {up ? "+" : ""}{pct.toFixed(2)}%
      </span>
    </div>
  );
}

export default function OverviewView() {
  const { data } = useGeoTera();
  const eco = data?.economy;
  const macro = eco?.macro;
  const wb = data?.worldbank?.countries ?? {};

  const spx = eco?.indices?.find(i => i.symbol === "^GSPC");
  const btc = eco?.crypto?.find(i => i.symbol === "BTC-USD");
  const gold = eco?.commodities?.find(i => i.symbol === "GC=F");
  const oil = eco?.commodities?.find(i => i.symbol === "CL=F");

  const allMarkets = [...(eco?.indices ?? []), ...(eco?.crypto ?? []), ...(eco?.commodities ?? [])];
  const sectors = [...(eco?.sectors ?? [])].sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0));

  const vix = macro?.vix;
  const fg = macro?.fear_greed;
  const vixColor = vix == null ? T.dim : vix > 30 ? T.red : vix > 20 ? T.amber : T.green;
  const fgColor = fg == null ? T.dim : fg > 60 ? T.green : fg > 40 ? T.amber : T.red;

  const upCount = allMarkets.filter(m => (m.change_pct ?? 0) > 0).length;
  const downCount = allMarkets.filter(m => (m.change_pct ?? 0) < 0).length;

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "auto" }}>
      {/* ── KPI Strip ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <KPICard label="S&P 500" value={spx?.price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"} change={spx?.change_pct} />
        <KPICard label="BITCOIN" value={btc?.price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"} prefix="$" change={btc?.change_pct} />
        <KPICard label="GOLD" value={gold?.price?.toLocaleString("en-US", { maximumFractionDigits: 0 }) ?? "—"} prefix="$" change={gold?.change_pct} />
        <KPICard label="CRUDE OIL" value={oil?.price?.toFixed(2) ?? "—"} prefix="$" change={oil?.change_pct} />
        <KPICard label="VIX" value={vix?.toFixed(1) ?? "—"} />
        <KPICard label="FEAR & GREED" value={`${fg ?? "—"}/100`} />
      </div>

      {/* ── Main grid ────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, flex: 1, minHeight: 0 }}>
        {/* Left: Market Pulse Heatmap */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>MARKET PULSE</span>
            <span style={{ fontSize: 8 }}>
              <span style={{ color: T.green }}>▲{upCount}</span>
              <span style={{ color: T.dim, margin: "0 3px" }}>·</span>
              <span style={{ color: T.red }}>▼{downCount}</span>
            </span>
          </div>
          <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 1, padding: 1 }}>
            {allMarkets.map(m => <HeatCell key={m.symbol} item={m} />)}
          </div>
        </div>

        {/* Right: Sector Rotation + Macro Health */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Sector Rotation */}
          <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33` }}>
              <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>SECTOR ROTATION</span>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: "4px 8px" }}>
              {sectors.map(s => (
                <SectorBar key={s.symbol} name={s.name} pct={s.change_pct ?? 0} />
              ))}
            </div>
          </div>

          {/* Macro Health */}
          <div className="glass-panel" style={{ padding: "6px 8px" }}>
            <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>MACRO HEALTH</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {/* VIX Gauge */}
              <div>
                <div style={{ fontSize: 8, color: T.dim, marginBottom: 2 }}>VOLATILITY</div>
                <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                  <div className="gauge-fill" style={{ width: `${Math.min(100, ((vix ?? 0) / 50) * 100)}%`, height: "100%", background: vixColor }} />
                </div>
                <div style={{ fontSize: 10, color: vixColor, fontWeight: 700, marginTop: 2 }}>{vix?.toFixed(1) ?? "—"}</div>
              </div>
              {/* F&G Gauge */}
              <div>
                <div style={{ fontSize: 8, color: T.dim, marginBottom: 2 }}>SENTIMENT</div>
                <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                  <div className="gauge-fill" style={{ width: `${fg ?? 0}%`, height: "100%", background: fgColor }} />
                </div>
                <div style={{ fontSize: 10, color: fgColor, fontWeight: 700, marginTop: 2 }}>{fg ?? "—"}/100</div>
              </div>
              {/* Yield Spread */}
              <div>
                <div style={{ fontSize: 8, color: T.dim, marginBottom: 2 }}>YIELD CURVE</div>
                <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden" }}>
                  <div className="gauge-fill" style={{
                    width: "60%", height: "100%",
                    background: (macro?.treasury_2y ?? 0) > (macro?.treasury_10y ?? 999) ? T.red : T.green,
                  }} />
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, marginTop: 2,
                  color: (macro?.treasury_2y ?? 0) > (macro?.treasury_10y ?? 999) ? T.red : T.green,
                }}>
                  {(macro?.treasury_2y ?? 0) > (macro?.treasury_10y ?? 999) ? "INVERTED" : "NORMAL"}
                </div>
              </div>
            </div>
          </div>

          {/* Global Economy Quick */}
          <div className="glass-panel" style={{ padding: "6px 8px" }}>
            <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>KEY ECONOMIES</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, fontSize: 9 }}>
              {[
                { code: "US", data: wb["US"] },
                { code: "CN", data: wb["CN"] },
                { code: "IN", data: wb["IN"] },
              ].map(({ code, data: d }) => (
                <div key={code}>
                  <div style={{ color: T.amber, fontWeight: 700, marginBottom: 2 }}>{code}</div>
                  <div style={{ color: T.dim }}>GDP <span style={{ color: T.white }}>{d?.gdp_growth?.toFixed(1) ?? "—"}%</span></div>
                  <div style={{ color: T.dim }}>INF <span style={{ color: T.white }}>{d?.inflation?.toFixed(1) ?? "—"}%</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
