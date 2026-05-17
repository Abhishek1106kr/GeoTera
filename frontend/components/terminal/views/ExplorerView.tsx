"use client";
import { useState } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", green: "#00cc44",
  red: "#ff4444", dim: "#555555", text: "#cccccc", white: "#e8e8e8",
};

const TOP_COUNTRIES = ["US", "CN", "IN", "DE", "JP", "BR", "GB", "FR", "CA", "AU", "KR", "MX", "IT", "ES", "ID", "TR", "SA", "ZA", "RU", "AR"];

const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CN: "China", IN: "India", DE: "Germany", JP: "Japan",
  BR: "Brazil", GB: "United Kingdom", FR: "France", CA: "Canada", AU: "Australia",
  KR: "South Korea", MX: "Mexico", IT: "Italy", ES: "Spain", ID: "Indonesia",
  TR: "Turkey", SA: "Saudi Arabia", ZA: "South Africa", RU: "Russia", AR: "Argentina",
};

type Indicator = "gdp_growth" | "inflation" | "unemployment" | "debt_to_gdp" | "gdp_per_capita";

const INDICATORS: { key: Indicator; label: string; suffix: string; color: string }[] = [
  { key: "gdp_growth",    label: "GDP Growth",    suffix: "%",  color: T.green },
  { key: "inflation",     label: "Inflation",     suffix: "%",  color: T.amber },
  { key: "unemployment",  label: "Unemployment",  suffix: "%",  color: T.red },
  { key: "debt_to_gdp",   label: "Debt/GDP",      suffix: "%",  color: "#a78bfa" },
  { key: "gdp_per_capita", label: "GDP/Capita",   suffix: "",   color: T.orange },
];

export default function ExplorerView() {
  const { data } = useGeoTera();
  const wb = data?.worldbank?.countries ?? {};
  const [indicator, setIndicator] = useState<Indicator>("gdp_growth");
  const [selected, setSelected] = useState<string[]>(["US", "CN", "IN", "DE"]);

  const indMeta = INDICATORS.find(i => i.key === indicator)!;

  // Build chart data from selected countries
  const chartData = selected
    .map(code => ({
      country: code,
      name: COUNTRY_NAMES[code] ?? code,
      value: wb[code]?.[indicator] ?? null,
    }))
    .filter(d => d.value !== null) as { country: string; name: string; value: number }[];

  // All available countries sorted by indicator value
  const ranked = TOP_COUNTRIES
    .map(code => ({ code, name: COUNTRY_NAMES[code] ?? code, value: wb[code]?.[indicator] ?? null }))
    .filter(d => d.value !== null)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const toggleCountry = (code: string) => {
    setSelected(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="view-enter" style={{ display: "flex", flexDirection: "column", gap: 1, height: "100%", overflow: "hidden" }}>
      {/* ── Indicator Tabs ────────────────────────────────── */}
      <div className="glass-panel" style={{ padding: "4px 6px", display: "flex", gap: 2, flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ color: T.orange, fontSize: 9, fontWeight: 700, letterSpacing: 1, marginRight: 4, alignSelf: "center" }}>EXPLORER</span>
        {INDICATORS.map(ind => (
          <button
            key={ind.key}
            onClick={() => setIndicator(ind.key)}
            style={{
              fontSize: 8, fontWeight: 700, padding: "3px 8px", cursor: "pointer", letterSpacing: 0.5,
              background: indicator === ind.key ? T.orange : "transparent",
              color: indicator === ind.key ? "#000" : T.dim,
              border: `1px solid ${indicator === ind.key ? T.orange : T.border}`,
            }}
          >{ind.label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 1, flex: 1, minHeight: 0 }}>
        {/* ── Country selector ────────────────────────────── */}
        <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "4px 8px", borderBottom: `1px solid ${T.orange}33`, fontSize: 8, color: T.orange, fontWeight: 700, letterSpacing: 1 }}>
            COUNTRIES ({selected.length} selected)
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {TOP_COUNTRIES.map(code => {
              const active = selected.includes(code);
              const val = wb[code]?.[indicator];
              return (
                <div
                  key={code}
                  className="mkt-row"
                  onClick={() => toggleCountry(code)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "4px 8px", cursor: "pointer",
                    borderBottom: `1px solid ${T.border}`,
                    background: active ? `${T.orange}12` : "transparent",
                    borderLeft: active ? `2px solid ${T.orange}` : "2px solid transparent",
                  }}
                >
                  <div>
                    <span style={{ color: active ? T.orange : T.amber, fontSize: 10, fontWeight: 700, marginRight: 6 }}>{code}</span>
                    <span style={{ color: T.dim, fontSize: 8 }}>{COUNTRY_NAMES[code] ?? code}</span>
                  </div>
                  <span style={{ color: val != null ? T.white : T.dim, fontSize: 9, fontWeight: 600 }}>
                    {val != null ? (indicator === "gdp_per_capita" ? `$${val.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `${val.toFixed(1)}${indMeta.suffix}`) : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chart + Rankings ────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, overflow: "hidden" }}>
          {/* Bar Chart */}
          <div className="glass-panel" style={{ flex: 1, padding: "8px", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ fontSize: 9, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
              {indMeta.label.toUpperCase()} COMPARISON
            </div>
            {chartData.length > 0 ? (
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke={T.border} strokeDasharray="1 4" vertical={false} />
                    <XAxis dataKey="country" tick={{ fill: T.amber, fontSize: 9, fontWeight: 700 }} axisLine={{ stroke: T.border }} tickLine={false} />
                    <YAxis tick={{ fill: T.dim, fontSize: 8 }} axisLine={false} tickLine={false} width={45}
                      tickFormatter={v => indicator === "gdp_per_capita" ? `$${(v/1000).toFixed(0)}k` : `${v}${indMeta.suffix}`}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div style={{ background: "#0a0a0a", border: `1px solid ${T.orange}55`, padding: "6px 10px", fontSize: 10 }}>
                            <div style={{ color: T.orange, fontWeight: 700 }}>{d.name}</div>
                            <div style={{ color: T.white }}>
                              {indicator === "gdp_per_capita" ? `$${d.value.toLocaleString()}` : `${d.value.toFixed(1)}${indMeta.suffix}`}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={indMeta.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontSize: 11 }}>
                Select countries to compare
              </div>
            )}
          </div>

          {/* Rankings */}
          <div className="glass-panel" style={{ maxHeight: 140, overflow: "auto", padding: "6px 8px" }}>
            <div style={{ fontSize: 8, color: T.orange, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>GLOBAL RANKING — {indMeta.label.toUpperCase()}</div>
            <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {ranked.map((item, i) => (
                <div key={item.code} style={{
                  fontSize: 8, padding: "2px 6px",
                  background: i === 0 ? `${T.green}15` : i === ranked.length - 1 ? `${T.red}15` : "transparent",
                  border: `1px solid ${T.border}`,
                  color: T.text,
                }}>
                  <span style={{ color: T.dim, marginRight: 3 }}>#{i + 1}</span>
                  <span style={{ color: T.amber, fontWeight: 700 }}>{item.code}</span>
                  <span style={{ marginLeft: 4 }}>
                    {indicator === "gdp_per_capita" ? `$${(item.value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `${(item.value ?? 0).toFixed(1)}${indMeta.suffix}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
