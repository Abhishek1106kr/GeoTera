"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import type { MacroData } from "@/lib/useWebSocket";

export default function YieldCurveChart() {
  const { data } = useGeoTera();
  const macro: MacroData = data?.economy?.macro ?? {
    vix: null, dxy: null, treasury_10y: null, treasury_2y: null,
    treasury_5y: null, treasury_30y: null, fear_greed: null,
  };

  const t3m  = macro.treasury_2y;   // 13-week T-bill as short-rate proxy
  const t5y  = macro.treasury_5y;
  const t10y = macro.treasury_10y;
  const t30y = macro.treasury_30y;

  const points = [
    { term: "3M",  yield: t3m,  label: "3-Month" },
    { term: "5Y",  yield: t5y,  label: "5-Year"  },
    { term: "10Y", yield: t10y, label: "10-Year" },
    { term: "30Y", yield: t30y, label: "30-Year" },
  ].filter(p => p.yield != null);

  const isInverted = t3m != null && t10y != null && t3m > t10y;
  const spread     = t10y != null && t3m != null ? t10y - t3m : null;
  const hasData    = points.length >= 2;

  const curveColor = isInverted ? "#ff3366" : "#00d4ff";
  const gradId     = isInverted ? "yieldRed" : "yieldCyan";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" />
          Treasury Yield Curve
        </p>
        {hasData && (
          <span
            className="text-[9px] font-black px-2 py-0.5 rounded-full border"
            style={
              isInverted
                ? { color: "#ff3366", background: "rgba(255,51,102,0.08)", borderColor: "rgba(255,51,102,0.25)" }
                : { color: "#00ff9d", background: "rgba(0,255,157,0.08)", borderColor: "rgba(0,255,157,0.25)" }
            }
          >
            {isInverted ? "⚠ INVERTED" : "✓ NORMAL"}
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">
          Fetching yield data…
        </div>
      ) : (
        <>
          <div className="flex-1" style={{ minHeight: 0, height: "140px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ left: -10, right: 5, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={curveColor} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={curveColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="term"
                  tick={{ fill: "#4b5563", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#4b5563", fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={v => `${v.toFixed(1)}%`}
                  width={36}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div
                        style={{
                          background: "#03060d",
                          border: "1px solid rgba(0,212,255,0.2)",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          fontSize: "11px",
                        }}
                      >
                        <p style={{ color: "#6b7280", marginBottom: "2px" }}>{d.label}</p>
                        <p style={{ color: curveColor, fontFamily: "monospace", fontWeight: 700 }}>
                          {Number(payload[0].value).toFixed(3)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="yield"
                  stroke={curveColor}
                  strokeWidth={2}
                  fill={`url(#${gradId})`}
                  dot={{ fill: curveColor, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: curveColor, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Spread & signal */}
          <div className="mt-2 space-y-1.5">
            {spread != null && (
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-gray-600">10Y–3M Spread</span>
                <span
                  className="font-mono font-bold"
                  style={{ color: spread < 0 ? "#ff3366" : "#00ff9d" }}
                >
                  {spread >= 0 ? "+" : ""}{spread.toFixed(2)}%
                </span>
              </div>
            )}
            {isInverted && (
              <div className="bg-[#ff3366]/8 border border-[#ff3366]/15 rounded-lg px-2.5 py-1.5">
                <p className="text-[9px] text-[#ff3366] font-semibold">
                  Inverted yield curve — historically precedes recession by 6–18 months
                </p>
              </div>
            )}
            {!isInverted && spread != null && (
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "3M",  value: t3m  },
                  { label: "5Y",  value: t5y  },
                  { label: "10Y", value: t10y },
                  { label: "30Y", value: t30y },
                ].filter(r => r.value != null).map(r => (
                  <div key={r.label} className="flex justify-between bg-white/[0.02] rounded px-2 py-1">
                    <span className="text-[9px] text-gray-600">{r.label}</span>
                    <span className="text-[9px] font-mono text-gray-400">{r.value!.toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
