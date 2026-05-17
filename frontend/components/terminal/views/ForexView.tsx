"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

const FLAGS: Record<string, string> = {
  EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", INR: "🇮🇳", CNY: "🇨🇳",
  AUD: "🇦🇺", CHF: "🇨🇭", CAD: "🇨🇦", KRW: "🇰🇷", BRL: "🇧🇷", MXN: "🇲🇽",
};

export default function ForexView() {
  const { data } = useGeoTera();
  const forex = data?.economy?.forex ?? {};
  const dxy = data?.economy?.macro?.dxy;
  const entries = Object.entries(forex);

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "auto" }}>
      {/* ── DXY Header ───────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: T.dim, fontWeight: 700, letterSpacing: 1 }}>US DOLLAR INDEX</div>
          <div style={{ fontSize: 28, color: T.amber, fontWeight: 700 }}>{dxy?.toFixed(2) ?? "—"}</div>
          <div style={{ fontSize: 8, color: T.dim, marginTop: 2 }}>
            DXY measures the value of USD against a basket of 6 major currencies
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1 }}>STRENGTH</div>
          <div style={{ width: 120, height: 6, background: "#111", borderRadius: 3, overflow: "hidden", marginTop: 6 }}>
            <div className="gauge-fill" style={{
              width: `${dxy ? Math.min(100, ((dxy - 80) / 40) * 100) : 0}%`,
              height: "100%",
              background: (dxy ?? 100) > 100 ? T.green : T.amber,
              borderRadius: 3,
            }} />
          </div>
          <div style={{ fontSize: 10, color: (dxy ?? 100) > 100 ? T.green : T.amber, fontWeight: 700, marginTop: 4 }}>
            {(dxy ?? 100) > 105 ? "VERY STRONG" : (dxy ?? 100) > 100 ? "STRONG" : (dxy ?? 100) > 95 ? "NEUTRAL" : "WEAK"}
          </div>
        </div>
      </div>

      {/* ── Currency Grid ────────────────────────────────── */}
      <div className="glass-panel" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>EXCHANGE RATES (1 USD =)</span>
          <span style={{ color: T.dim, fontSize: 8 }}>{entries.length} PAIRS</span>
        </div>
        <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 1, padding: 1 }}>
          {entries.map(([cur, rate]) => {
            const numRate = typeof rate === "number" ? rate : 0;
            return (
              <div key={cur} className="mkt-row" style={{
                background: T.panel, border: `1px solid ${T.border}`,
                padding: "10px 12px", cursor: "default",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{FLAGS[cur] ?? "💱"}</span>
                  <div>
                    <div style={{ fontSize: 12, color: T.white, fontWeight: 700 }}>USD/{cur}</div>
                    <div style={{ fontSize: 8, color: T.dim }}>{cur === "EUR" ? "Euro" : cur === "GBP" ? "British Pound" : cur === "JPY" ? "Japanese Yen" : cur === "INR" ? "Indian Rupee" : cur === "CNY" ? "Chinese Yuan" : cur === "AUD" ? "Australian Dollar" : cur === "CHF" ? "Swiss Franc" : cur === "CAD" ? "Canadian Dollar" : cur === "KRW" ? "South Korean Won" : cur === "BRL" ? "Brazilian Real" : cur === "MXN" ? "Mexican Peso" : cur}</div>
                  </div>
                </div>
                <div style={{ fontSize: 20, color: T.amber, fontWeight: 700 }}>
                  {numRate.toFixed(4)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Cross Rate Matrix ────────────────────────────── */}
      <div className="glass-panel" style={{ padding: "8px" }}>
        <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>QUICK CONVERSIONS (vs USD)</div>
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {entries.slice(0, 6).map(([cur, rate]) => {
            const numRate = typeof rate === "number" ? rate : 0;
            return (
              <div key={cur} style={{ flex: "0 0 auto", textAlign: "center", minWidth: 70 }}>
                <div style={{ fontSize: 8, color: T.dim }}>{cur}</div>
                <div style={{ fontSize: 10, color: T.white, fontWeight: 600, marginTop: 2 }}>1 USD</div>
                <div style={{ fontSize: 8, color: T.amber, marginTop: 1 }}>{numRate.toFixed(2)} {cur}</div>
                <div style={{ height: 1, background: T.border, margin: "4px 0" }} />
                <div style={{ fontSize: 10, color: T.white, fontWeight: 600 }}>1 {cur}</div>
                <div style={{ fontSize: 8, color: T.amber, marginTop: 1 }}>{numRate > 0 ? (1/numRate).toFixed(4) : "—"} USD</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
