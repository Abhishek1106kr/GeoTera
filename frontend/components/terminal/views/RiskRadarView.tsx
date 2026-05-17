"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", yellow: "#ffdd00", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

interface RiskDimension {
  label: string;
  value: number; // 0-100
  color: string;
  status: string;
  detail: string;
}

export default function RiskRadarView() {
  const { data } = useGeoTera();
  const macro = data?.economy?.macro;
  const wb = data?.worldbank?.countries ?? {};

  const vix = macro?.vix ?? 0;
  const fg = macro?.fear_greed ?? 50;
  const t2y = macro?.treasury_2y ?? 0;
  const t10y = macro?.treasury_10y ?? 0;
  const inverted = t2y > t10y && t10y > 0;
  const usDebt = wb["US"]?.debt_to_gdp ?? 0;
  const usInflation = wb["US"]?.inflation ?? 0;

  // Compute risk scores (0-100, higher = more risk)
  const volatilityRisk = Math.min(100, (vix / 40) * 100);
  const recessionRisk = inverted ? Math.min(100, 60 + (t2y - t10y) * 100) : Math.max(0, 20 - (t10y - t2y) * 20);
  const inflationRisk = Math.min(100, usInflation > 0 ? (usInflation / 10) * 100 : 30);
  const debtRisk = Math.min(100, usDebt > 0 ? (usDebt / 150) * 100 : 40);
  const sentimentRisk = Math.min(100, 100 - fg);
  const currencyRisk = macro?.dxy ? Math.min(100, Math.abs(macro.dxy - 100) * 3) : 30;

  const overallRisk = Math.round((volatilityRisk + recessionRisk + inflationRisk + debtRisk + sentimentRisk + currencyRisk) / 6);
  const overallColor = overallRisk > 65 ? T.red : overallRisk > 40 ? T.amber : T.green;
  const overallLabel = overallRisk > 65 ? "HIGH RISK" : overallRisk > 40 ? "MODERATE" : "LOW RISK";

  const dimensions: RiskDimension[] = [
    {
      label: "VOLATILITY",
      value: volatilityRisk,
      color: volatilityRisk > 65 ? T.red : volatilityRisk > 40 ? T.amber : T.green,
      status: vix > 30 ? "EXTREME" : vix > 20 ? "ELEVATED" : "NORMAL",
      detail: `VIX: ${vix.toFixed(1)}`,
    },
    {
      label: "RECESSION",
      value: recessionRisk,
      color: recessionRisk > 65 ? T.red : recessionRisk > 40 ? T.amber : T.green,
      status: inverted ? "WARNING" : "STABLE",
      detail: inverted ? `Curve inverted (${(t2y - t10y).toFixed(3)}%)` : "Curve normal",
    },
    {
      label: "INFLATION",
      value: inflationRisk,
      color: inflationRisk > 65 ? T.red : inflationRisk > 40 ? T.amber : T.green,
      status: usInflation > 5 ? "HIGH" : usInflation > 3 ? "ELEVATED" : "TARGET",
      detail: `US CPI: ${usInflation.toFixed(1)}%`,
    },
    {
      label: "DEBT",
      value: debtRisk,
      color: debtRisk > 65 ? T.red : debtRisk > 40 ? T.amber : T.green,
      status: usDebt > 120 ? "CRITICAL" : usDebt > 80 ? "HIGH" : "MANAGEABLE",
      detail: `US Debt/GDP: ${usDebt.toFixed(0)}%`,
    },
    {
      label: "SENTIMENT",
      value: sentimentRisk,
      color: sentimentRisk > 65 ? T.red : sentimentRisk > 40 ? T.amber : T.green,
      status: fg < 25 ? "EXTREME FEAR" : fg < 40 ? "FEAR" : fg < 60 ? "NEUTRAL" : "GREED",
      detail: `F&G: ${fg}/100`,
    },
    {
      label: "CURRENCY",
      value: currencyRisk,
      color: currencyRisk > 65 ? T.red : currencyRisk > 40 ? T.amber : T.green,
      status: (macro?.dxy ?? 100) > 105 ? "STRONG $" : (macro?.dxy ?? 100) < 95 ? "WEAK $" : "STABLE",
      detail: `DXY: ${macro?.dxy?.toFixed(2) ?? "—"}`,
    },
  ];

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "auto" }}>
      {/* ── Overall Risk Score ────────────────────────────── */}
      <div className="glass-panel border-pulse" style={{ padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 9, color: T.dim, letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>GLOBAL ECONOMIC RISK INDEX</div>
        <div style={{ fontSize: 48, color: overallColor, fontWeight: 700, lineHeight: 1 }} className="glow-orange">
          {overallRisk}
        </div>
        <div style={{ fontSize: 11, color: overallColor, fontWeight: 700, marginTop: 4, letterSpacing: 1 }}>{overallLabel}</div>
        <div style={{ width: "100%", height: 6, background: "#111", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
          <div className="gauge-fill" style={{ width: `${overallRisk}%`, height: "100%", background: overallColor, borderRadius: 3 }} />
        </div>
      </div>

      {/* ── Risk Dimensions ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, flex: 1 }}>
        {dimensions.map(dim => (
          <div key={dim.label} className="glass-panel" style={{ padding: "12px 14px", display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 8, color: T.dim, letterSpacing: 1, fontWeight: 700, marginBottom: 6 }}>{dim.label}</div>

            {/* Score */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 24, color: dim.color, fontWeight: 700 }}>{Math.round(dim.value)}</div>
              <div>
                <div style={{ fontSize: 9, color: dim.color, fontWeight: 700 }}>{dim.status}</div>
                <div style={{ fontSize: 8, color: T.dim }}>{dim.detail}</div>
              </div>
            </div>

            {/* Bar */}
            <div style={{ height: 4, background: "#111", borderRadius: 2, overflow: "hidden", marginTop: "auto" }}>
              <div className="gauge-fill" style={{ width: `${dim.value}%`, height: "100%", background: dim.color, borderRadius: 2 }} />
            </div>

            {/* Scale */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, color: T.dim, marginTop: 2 }}>
              <span>LOW</span><span>MED</span><span>HIGH</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Risk Summary ─────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: "8px 12px" }}>
        <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>RISK ASSESSMENT SUMMARY</div>
        <div style={{ fontSize: 9, color: T.text, lineHeight: 1.6 }}>
          {inverted && <div style={{ color: T.red }}>⚠ Yield curve inversion detected — historically precedes recessions by 12-18 months.</div>}
          {vix > 25 && <div style={{ color: T.amber }}>⚠ Elevated volatility (VIX {vix.toFixed(1)}) — consider risk-off positioning.</div>}
          {fg < 25 && <div style={{ color: T.red }}>⚠ Extreme fear in markets — contrarian buy signal for long-term investors.</div>}
          {fg > 75 && <div style={{ color: T.amber }}>⚠ Extreme greed — potential correction risk elevated.</div>}
          {usInflation > 4 && <div style={{ color: T.amber }}>⚠ Inflation above target — central bank tightening likely to continue.</div>}
          {!inverted && vix <= 25 && fg >= 25 && fg <= 75 && <div style={{ color: T.green }}>✓ No major systemic risk signals detected. Economic conditions stable.</div>}
        </div>
      </div>
    </div>
  );
}
