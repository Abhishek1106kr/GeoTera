"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

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

function Row({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${T.border}`,
      padding: "4px 6px",
      fontFamily: "Consolas, Monaco, monospace",
      fontSize: 11,
    }}>
      <div>
        <span style={{ color: T.dim, fontSize: 9, letterSpacing: 1 }}>{label}</span>
        {sub && <div style={{ color: T.amber, fontSize: 9, marginTop: 1 }}>{sub}</div>}
      </div>
      <span style={{ color: color ?? T.white, fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function GaugeMini({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: "#111", height: 4, borderRadius: 2, overflow: "hidden", margin: "2px 6px 4px" }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: "100%", background: color, transition: "width 1s" }} />
    </div>
  );
}

export default function MacroPanel() {
  const { data } = useGeoTera();
  const macro = data?.economy?.macro;
  const wb    = data?.worldbank?.countries ?? {};
  const us    = wb["US"] ?? {};
  const eu    = wb["DE"] ?? {};
  const cn    = wb["CN"] ?? {};

  const vix  = macro?.vix;
  const vixColor = vix == null ? T.dim : vix > 30 ? T.red : vix > 20 ? T.amber : T.green;
  const vixLabel = vix == null ? "—" : vix > 30 ? "EXTREME FEAR" : vix > 20 ? "ELEVATED" : vix > 15 ? "NORMAL" : "LOW VOL";

  const t10y = macro?.treasury_10y;
  const t2y  = macro?.treasury_2y;
  const inverted = t2y != null && t10y != null && t2y > t10y;

  const fg   = macro?.fear_greed;
  const fgColor = fg == null ? T.dim : fg > 60 ? T.green : fg > 40 ? T.amber : T.red;
  const fgLabel = fg == null ? "—" : fg > 75 ? "EXTREME GREED" : fg > 55 ? "GREED" : fg > 45 ? "NEUTRAL" : fg > 25 ? "FEAR" : "EXTREME FEAR";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "4px 6px",
        borderBottom: `1px solid ${T.orange}55`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
          MACRO INDICATORS
        </span>
        {inverted && (
          <span style={{
            color: T.red, fontSize: 8, fontFamily: "Consolas, Monaco, monospace",
            background: `${T.red}15`, border: `1px solid ${T.red}44`,
            padding: "1px 5px",
          }}>
            ⚠ CURVE INVERTED
          </span>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* VIX */}
        <div style={{ padding: "4px 6px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Consolas, Monaco, monospace", fontSize: 11 }}>
            <span style={{ color: T.dim, fontSize: 9 }}>VIX  VOLATILITY INDEX</span>
            <span style={{ color: vixColor, fontWeight: 700 }}>{vix?.toFixed(2) ?? "—"}</span>
          </div>
          <div style={{ color: vixColor, fontSize: 8, fontFamily: "Consolas, Monaco, monospace", textAlign: "right", marginBottom: 2 }}>{vixLabel}</div>
          {vix != null && <GaugeMini pct={(vix / 50) * 100} color={vixColor} />}
        </div>

        {/* DXY */}
        <Row label="DXY  US DOLLAR INDEX" value={macro?.dxy?.toFixed(2) ?? "—"} color={T.amber} />

        {/* Yields */}
        <div style={{ padding: "3px 6px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, marginBottom: 2 }}>TREASURY YIELDS</div>
          {[
            { label: "2Y", val: macro?.treasury_2y },
            { label: "5Y", val: macro?.treasury_5y },
            { label: "10Y", val: macro?.treasury_10y },
            { label: "30Y", val: macro?.treasury_30y },
          ].map(({ label, val }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Consolas, Monaco, monospace", fontSize: 10, marginBottom: 2 }}>
              <span style={{ color: T.dim }}>{label}</span>
              <span style={{ color: label === "2Y" && inverted ? T.red : T.white }}>
                {val != null ? `${val.toFixed(3)}%` : "—"}
                {label === "2Y" && inverted && <span style={{ color: T.red, fontSize: 8 }}> ▲</span>}
              </span>
            </div>
          ))}
        </div>

        {/* F&G */}
        <div style={{ padding: "4px 6px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Consolas, Monaco, monospace", fontSize: 11 }}>
            <span style={{ color: T.dim, fontSize: 9 }}>FEAR & GREED INDEX</span>
            <span style={{ color: fgColor, fontWeight: 700 }}>{fg ?? "—"}/100</span>
          </div>
          <div style={{ color: fgColor, fontSize: 8, fontFamily: "Consolas, Monaco, monospace", textAlign: "right", marginBottom: 2 }}>{fgLabel}</div>
          {fg != null && <GaugeMini pct={fg} color={fgColor} />}
        </div>

        {/* World Bank macro */}
        <div style={{ padding: "3px 6px 0", borderBottom: `1px solid ${T.border}` }}>
          <div style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, marginBottom: 3, letterSpacing: 1 }}>WORLD BANK — KEY ECONOMIES</div>
          {[
            { code: "US", d: us },
            { code: "EU", d: eu },
            { code: "CN", d: cn },
          ].map(({ code, d }) => (
            <div key={code} style={{ marginBottom: 4 }}>
              <div style={{ color: T.amber, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700 }}>{code}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 8px", fontFamily: "Consolas, Monaco, monospace", fontSize: 9 }}>
                <span style={{ color: T.dim }}>GDP Growth: <span style={{ color: T.white }}>{d.gdp_growth != null ? `${d.gdp_growth.toFixed(1)}%` : "—"}</span></span>
                <span style={{ color: T.dim }}>Inflation:  <span style={{ color: T.white }}>{d.inflation  != null ? `${d.inflation.toFixed(1)}%` : "—"}</span></span>
                <span style={{ color: T.dim }}>Unemploy:  <span style={{ color: T.white }}>{d.unemployment != null ? `${d.unemployment.toFixed(1)}%` : "—"}</span></span>
                <span style={{ color: T.dim }}>Debt/GDP:  <span style={{ color: T.white }}>{d.debt_to_gdp != null ? `${d.debt_to_gdp.toFixed(0)}%` : "—"}</span></span>
              </div>
            </div>
          ))}
        </div>

        {/* Forex */}
        <div style={{ padding: "3px 6px" }}>
          <div style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, marginBottom: 3, letterSpacing: 1 }}>FOREX (1 USD =)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px 8px", fontFamily: "Consolas, Monaco, monospace", fontSize: 10 }}>
            {Object.entries(data?.economy?.forex ?? {}).slice(0, 10).map(([cur, rate]) => (
              <div key={cur} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: T.dim }}>{cur}</span>
                <span style={{ color: T.text }}>{typeof rate === "number" ? rate.toFixed(4) : "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
