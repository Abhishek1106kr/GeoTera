"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

function GaugeArc({ value, max, color, label, sublabel }: { value: number; max: number; color: string; label: string; sublabel: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 8, color: T.dim, letterSpacing: 1, marginBottom: 4, fontWeight: 700 }}>{label}</div>
      <div style={{ position: "relative", height: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Bar gauge */}
        <div style={{ width: "100%", height: 6, background: "#111", borderRadius: 3, overflow: "hidden" }}>
          <div className="gauge-fill" style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
        </div>
      </div>
      <div style={{ fontSize: 18, color, fontWeight: 700, marginTop: 2 }}>{value.toFixed(1)}</div>
      <div style={{ fontSize: 8, color, marginTop: 1 }}>{sublabel}</div>
    </div>
  );
}

function YieldRow({ label, value, highlight }: { label: string; value: number | null; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 10 }}>
      <span style={{ color: T.dim }}>{label}</span>
      <span style={{ color: highlight ? T.red : T.white, fontWeight: 600 }}>
        {value != null ? `${value.toFixed(3)}%` : "—"}
        {highlight && <span style={{ color: T.red, fontSize: 8, marginLeft: 3 }}>▲</span>}
      </span>
    </div>
  );
}

function CountryCard({ code, d }: { code: string; d: Record<string, number | undefined> }) {
  return (
    <div className="glass-panel" style={{ padding: "8px 10px" }}>
      <div style={{ color: T.amber, fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{code}</div>
      {[
        { label: "GDP Growth", key: "gdp_growth", suffix: "%" },
        { label: "Inflation", key: "inflation", suffix: "%" },
        { label: "Unemployment", key: "unemployment", suffix: "%" },
        { label: "Debt/GDP", key: "debt_to_gdp", suffix: "%" },
        { label: "GDP/Cap", key: "gdp_per_capita", suffix: "", prefix: "$" },
      ].map(({ label, key, suffix, prefix }) => {
        const v = d[key];
        return (
          <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 9, padding: "2px 0", borderBottom: `1px solid ${T.border}` }}>
            <span style={{ color: T.dim }}>{label}</span>
            <span style={{ color: T.white, fontWeight: 600 }}>
              {v != null ? `${prefix ?? ""}${key === "gdp_per_capita" ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : v.toFixed(1)}${suffix}` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function MacroView() {
  const { data } = useGeoTera();
  const macro = data?.economy?.macro;
  const wb = data?.worldbank?.countries ?? {};

  const vix = macro?.vix ?? 0;
  const vixColor = vix > 30 ? T.red : vix > 20 ? T.amber : T.green;
  const vixLabel = vix > 30 ? "EXTREME FEAR" : vix > 20 ? "ELEVATED" : vix > 15 ? "NORMAL" : "LOW VOL";

  const fg = macro?.fear_greed ?? 50;
  const fgColor = fg > 60 ? T.green : fg > 40 ? T.amber : T.red;
  const fgLabel = fg > 75 ? "EXTREME GREED" : fg > 55 ? "GREED" : fg > 45 ? "NEUTRAL" : fg > 25 ? "FEAR" : "EXTREME FEAR";

  const t2y = macro?.treasury_2y;
  const t5y = macro?.treasury_5y;
  const t10y = macro?.treasury_10y;
  const t30y = macro?.treasury_30y;
  const inverted = t2y != null && t10y != null && t2y > t10y;

  const yieldData = [
    { maturity: "2Y", yield: t2y ?? 0 },
    { maturity: "5Y", yield: t5y ?? 0 },
    { maturity: "10Y", yield: t10y ?? 0 },
    { maturity: "30Y", yield: t30y ?? 0 },
  ];

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "auto" }}>
      {/* ── Row 1: Gauges ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1 }}>
        <div className="glass-panel" style={{ padding: "10px" }}>
          <GaugeArc value={vix} max={50} color={vixColor} label="CBOE VOLATILITY INDEX" sublabel={vixLabel} />
        </div>
        <div className="glass-panel" style={{ padding: "10px" }}>
          <GaugeArc value={fg} max={100} color={fgColor} label="FEAR & GREED INDEX" sublabel={fgLabel} />
        </div>
        <div className="glass-panel" style={{ padding: "10px" }}>
          <GaugeArc value={macro?.dxy ?? 0} max={120} color={T.amber} label="US DOLLAR INDEX (DXY)" sublabel={`${(macro?.dxy ?? 0) > 100 ? "STRONG" : "WEAK"} DOLLAR`} />
        </div>
      </div>

      {/* ── Row 2: Yield Curve + Treasury Table ────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
        {/* Yield Curve Chart */}
        <div className="glass-panel" style={{ padding: "8px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>YIELD CURVE</span>
            {inverted && (
              <span style={{
                color: T.red, fontSize: 8, fontWeight: 700,
                background: `${T.red}15`, border: `1px solid ${T.red}44`, padding: "1px 5px",
              }}>⚠ INVERTED</span>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid stroke={T.border} strokeDasharray="1 4" vertical={false} />
                <XAxis dataKey="maturity" tick={{ fill: T.dim, fontSize: 9 }} axisLine={{ stroke: T.border }} tickLine={false} />
                <YAxis tick={{ fill: T.dim, fontSize: 9 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} width={35} tickFormatter={v => `${v}%`} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={{ background: "#0a0a0a", border: `1px solid ${T.orange}55`, padding: "4px 8px", fontSize: 10 }}>
                        <div style={{ color: T.orange }}>{d.maturity}</div>
                        <div style={{ color: T.white, fontWeight: 700 }}>{d.yield.toFixed(3)}%</div>
                      </div>
                    );
                  }}
                />
                <Line type="monotone" dataKey="yield" stroke={inverted ? T.red : T.green} strokeWidth={2} dot={{ r: 4, fill: inverted ? T.red : T.green, stroke: "#000" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Treasury Table */}
        <div className="glass-panel" style={{ padding: "8px", display: "flex", flexDirection: "column" }}>
          <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>TREASURY YIELDS</span>
          <YieldRow label="2-Year" value={t2y ?? null} highlight={inverted} />
          <YieldRow label="5-Year" value={t5y ?? null} />
          <YieldRow label="10-Year" value={t10y ?? null} />
          <YieldRow label="30-Year" value={t30y ?? null} />
          <div style={{ marginTop: 8, padding: "6px", background: inverted ? `${T.red}08` : `${T.green}08`, border: `1px solid ${inverted ? T.red : T.green}22` }}>
            <div style={{ fontSize: 9, color: inverted ? T.red : T.green, fontWeight: 700 }}>
              {inverted ? "⚠ YIELD CURVE INVERTED — Recession Signal" : "✓ YIELD CURVE NORMAL — No Recession Signal"}
            </div>
            <div style={{ fontSize: 8, color: T.dim, marginTop: 2 }}>
              2Y-10Y Spread: {t2y != null && t10y != null ? `${(t10y - t2y).toFixed(3)}%` : "—"}
            </div>
          </div>

          {/* Forex Quick */}
          <div style={{ marginTop: "auto", paddingTop: 8 }}>
            <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>FOREX (1 USD =)</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 8px", marginTop: 4, fontSize: 9 }}>
              {Object.entries(data?.economy?.forex ?? {}).slice(0, 8).map(([cur, rate]) => (
                <div key={cur} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
                  <span style={{ color: T.dim }}>{cur}</span>
                  <span style={{ color: T.text }}>{typeof rate === "number" ? rate.toFixed(4) : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Country Comparison ─────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 1 }}>
        {["US", "CN", "IN", "DE", "JP", "BR"].map(code => (
          <CountryCard key={code} code={code} d={wb[code] ?? {}} />
        ))}
      </div>
    </div>
  );
}
