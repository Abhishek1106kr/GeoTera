"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { WorldBankData } from "@/lib/useWebSocket";

type Metric = "gdp_growth" | "inflation" | "unemployment" | "debt_to_gdp";

const COUNTRIES = [
  { code: "US", name: "United States",  lat: 38.9,   lng: -77.0  },
  { code: "CN", name: "China",          lat: 39.9,   lng: 116.4  },
  { code: "JP", name: "Japan",          lat: 35.7,   lng: 139.7  },
  { code: "DE", name: "Germany",        lat: 52.5,   lng: 13.4   },
  { code: "GB", name: "United Kingdom", lat: 51.5,   lng: -0.1   },
  { code: "FR", name: "France",         lat: 48.9,   lng: 2.3    },
  { code: "IN", name: "India",          lat: 28.6,   lng: 77.2   },
  { code: "BR", name: "Brazil",         lat: -15.8,  lng: -47.9  },
  { code: "CA", name: "Canada",         lat: 45.4,   lng: -75.7  },
  { code: "KR", name: "South Korea",    lat: 37.6,   lng: 126.9  },
  { code: "AU", name: "Australia",      lat: -35.3,  lng: 149.1  },
  { code: "RU", name: "Russia",         lat: 55.75,  lng: 37.6   },
  { code: "IT", name: "Italy",          lat: 41.9,   lng: 12.5   },
  { code: "ES", name: "Spain",          lat: 40.4,   lng: -3.7   },
  { code: "MX", name: "Mexico",         lat: 19.4,   lng: -99.1  },
  { code: "ID", name: "Indonesia",      lat: -6.2,   lng: 106.8  },
  { code: "NL", name: "Netherlands",    lat: 52.4,   lng: 4.9    },
  { code: "SA", name: "Saudi Arabia",   lat: 24.7,   lng: 46.7   },
  { code: "TR", name: "Turkey",         lat: 39.9,   lng: 32.9   },
  { code: "NG", name: "Nigeria",        lat: 9.1,    lng: 7.5    },
  { code: "ZA", name: "South Africa",   lat: -25.7,  lng: 28.2   },
  { code: "AR", name: "Argentina",      lat: -34.6,  lng: -58.4  },
  { code: "SG", name: "Singapore",      lat: 1.3,    lng: 103.8  },
  { code: "CH", name: "Switzerland",    lat: 46.9,   lng: 7.4    },
  { code: "SE", name: "Sweden",         lat: 59.3,   lng: 18.1   },
  { code: "PL", name: "Poland",         lat: 52.2,   lng: 21.0   },
  { code: "EG", name: "Egypt",          lat: 30.1,   lng: 31.2   },
  { code: "PK", name: "Pakistan",       lat: 33.7,   lng: 73.1   },
  { code: "TH", name: "Thailand",       lat: 13.75,  lng: 100.5  },
  { code: "MY", name: "Malaysia",       lat: 3.1,    lng: 101.7  },
];

interface MetricCfg {
  label: string;
  color: (v: number) => string;
  format: (v: number) => string;
  radius: (v: number) => number;
  legend: { label: string; color: string }[];
}

const METRIC_CFG: Record<Metric, MetricCfg> = {
  gdp_growth: {
    label: "GDP Growth",
    color: v => v >= 6 ? "#00ff9d" : v >= 3 ? "#34d399" : v >= 1 ? "#fbbf24" : v >= 0 ? "#f97316" : "#ef4444",
    format: v => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
    radius: v => 8 + Math.abs(v) * 1.5,
    legend: [
      { label: "≥6%", color: "#00ff9d" }, { label: "3–6%", color: "#34d399" },
      { label: "1–3%", color: "#fbbf24" }, { label: "<0", color: "#ef4444" },
    ],
  },
  inflation: {
    label: "Inflation (CPI)",
    color: v => v > 15 ? "#ff3366" : v > 8 ? "#ef4444" : v > 4 ? "#f97316" : v > 2 ? "#fbbf24" : "#00ff9d",
    format: v => `${v.toFixed(1)}%`,
    radius: v => 7 + Math.min(v, 20) * 0.8,
    legend: [
      { label: "≤2%", color: "#00ff9d" }, { label: "2–4%", color: "#fbbf24" },
      { label: "4–8%", color: "#f97316" }, { label: ">8%", color: "#ef4444" },
    ],
  },
  unemployment: {
    label: "Unemployment",
    color: v => v > 15 ? "#ff3366" : v > 10 ? "#ef4444" : v > 6 ? "#f97316" : v > 4 ? "#fbbf24" : "#00ff9d",
    format: v => `${v.toFixed(1)}%`,
    radius: v => 7 + Math.min(v, 20) * 0.7,
    legend: [
      { label: "≤4%", color: "#00ff9d" }, { label: "4–6%", color: "#fbbf24" },
      { label: "6–10%", color: "#f97316" }, { label: ">10%", color: "#ef4444" },
    ],
  },
  debt_to_gdp: {
    label: "Debt / GDP",
    color: v => v > 150 ? "#ff3366" : v > 100 ? "#ef4444" : v > 60 ? "#f97316" : v > 30 ? "#fbbf24" : "#00ff9d",
    format: v => `${v.toFixed(0)}%`,
    radius: v => 7 + Math.min(v, 200) * 0.06,
    legend: [
      { label: "≤30%", color: "#00ff9d" }, { label: "30–60%", color: "#fbbf24" },
      { label: "60–100%", color: "#f97316" }, { label: ">100%", color: "#ef4444" },
    ],
  },
};

function riskScore(e: WorldBankData["countries"][string]): { score: number; label: string; color: string } {
  let s = 55;
  if ((e.inflation ?? 0) > 8) s -= 15; else if ((e.inflation ?? 0) > 4) s -= 7;
  if ((e.gdp_growth ?? 0) < 0) s -= 15; else if ((e.gdp_growth ?? 0) > 4) s += 10;
  if ((e.unemployment ?? 0) > 10) s -= 10;
  if ((e.debt_to_gdp ?? 0) > 100) s -= 8;
  const score = Math.max(0, Math.min(100, s));
  if (score > 70) return { score, label: "Low Risk",   color: "#00ff9d" };
  if (score > 50) return { score, label: "Moderate",   color: "#fbbf24" };
  if (score > 30) return { score, label: "Elevated",   color: "#f97316" };
  return               { score, label: "High Risk",   color: "#ff3366" };
}

const METRICS: { id: Metric; label: string }[] = [
  { id: "gdp_growth",   label: "GDP Growth"   },
  { id: "inflation",    label: "Inflation"    },
  { id: "unemployment", label: "Unemployment" },
  { id: "debt_to_gdp",  label: "Debt/GDP"     },
];

export default function EconomicsMap() {
  const { data } = useGeoTera();
  const [ready,  setReady]  = useState(false);
  const [metric, setMetric] = useState<Metric>("gdp_growth");

  useEffect(() => { setReady(true); }, []);

  const wb: WorldBankData["countries"] = data?.worldbank?.countries ?? {};
  const cfg = METRIC_CFG[metric];

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center text-gray-700 text-sm animate-pulse">
        Initialising map…
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Metric selector */}
      <div className="absolute top-2 left-2 z-[500] flex gap-0.5 bg-[#03060d]/95 backdrop-blur-sm rounded-xl p-1 border border-white/8 shadow-xl">
        {METRICS.map(m => (
          <button
            key={m.id}
            onClick={() => setMetric(m.id)}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
              metric === m.id
                ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30"
                : "text-gray-600 hover:text-gray-400 border border-transparent"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[500] bg-[#03060d]/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5 border border-white/8 flex gap-3 shadow-xl">
        {cfg.legend.map(li => (
          <span key={li.label} className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className="w-2 h-2 rounded-full" style={{ background: li.color }} />
            {li.label}
          </span>
        ))}
      </div>

      <MapContainer
        center={[20, 10]}
        zoom={2}
        style={{ height: "100%", width: "100%", background: "#03060d" }}
        zoomControl={false}
        attributionControl={false}
        worldCopyJump
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={10}
        />

        {COUNTRIES.map(c => {
          const econ = wb[c.code] ?? {};
          const val  = econ[metric];
          const color  = val != null ? cfg.color(val) : "#374151";
          const radius = val != null ? Math.max(6, Math.min(24, cfg.radius(val))) : 7;
          const { label: rLabel, color: rColor } = riskScore(econ);

          return (
            <CircleMarker
              key={c.code}
              center={[c.lat, c.lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 1.5 }}
            >
              <Popup>
                <div style={{
                  background: "#03060d", border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "12px", padding: "14px", minWidth: "210px",
                  color: "white", fontFamily: "system-ui,sans-serif", fontSize: "11px",
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <p style={{ fontWeight: 900, fontSize: "13px", margin: 0 }}>{c.name}</p>
                    <span style={{
                      background: `${rColor}18`, border: `1px solid ${rColor}35`,
                      color: rColor, fontSize: "8px", fontWeight: 700,
                      padding: "2px 7px", borderRadius: "999px",
                    }}>{rLabel}</span>
                  </div>

                  {/* Metric cards */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                    {[
                      {
                        label: "GDP Growth",
                        value: econ.gdp_growth != null ? `${econ.gdp_growth > 0 ? "+" : ""}${econ.gdp_growth.toFixed(1)}%` : "—",
                        color: econ.gdp_growth != null ? (econ.gdp_growth >= 0 ? "#00ff9d" : "#ff3366") : "#6b7280",
                      },
                      {
                        label: "Inflation",
                        value: econ.inflation != null ? `${econ.inflation.toFixed(1)}%` : "—",
                        color: econ.inflation != null ? (econ.inflation > 8 ? "#ff3366" : econ.inflation > 4 ? "#f97316" : "#00ff9d") : "#6b7280",
                      },
                      {
                        label: "Unemployment",
                        value: econ.unemployment != null ? `${econ.unemployment.toFixed(1)}%` : "—",
                        color: econ.unemployment != null ? (econ.unemployment > 10 ? "#f97316" : "#9ca3af") : "#6b7280",
                      },
                      {
                        label: "Debt / GDP",
                        value: econ.debt_to_gdp != null ? `${econ.debt_to_gdp.toFixed(0)}%` : "—",
                        color: econ.debt_to_gdp != null ? (econ.debt_to_gdp > 100 ? "#f97316" : "#9ca3af") : "#6b7280",
                      },
                    ].map(row => (
                      <div key={row.label} style={{
                        background: "rgba(255,255,255,0.04)", borderRadius: "8px",
                        padding: "5px 8px", border: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <p style={{ color: "#6b7280", fontSize: "8px", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 2px" }}>
                          {row.label}
                        </p>
                        <p style={{ color: row.color, fontFamily: "monospace", fontWeight: 700, margin: 0, fontSize: "12px" }}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* GDP per capita */}
                  {econ.gdp_per_capita != null && (
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "6px" }}>
                      <span style={{ color: "#6b7280", fontSize: "9px" }}>GDP per capita</span>
                      <span style={{ color: "#e5e7eb", fontFamily: "monospace", fontSize: "9px", fontWeight: 600 }}>
                        ${econ.gdp_per_capita.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  <p style={{ color: "#374151", fontSize: "8px", marginTop: "6px", marginBottom: 0 }}>
                    World Bank · Most recent available year
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
