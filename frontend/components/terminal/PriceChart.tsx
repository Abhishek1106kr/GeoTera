"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine, Line,
} from "recharts";

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

const SYMBOLS = [
  { sym: "^GSPC",   label: "S&P 500" },
  { sym: "^DJI",    label: "DJIA"    },
  { sym: "^IXIC",   label: "NASDAQ"  },
  { sym: "BTC-USD", label: "BTC"     },
  { sym: "ETH-USD", label: "ETH"     },
  { sym: "GC=F",    label: "GOLD"    },
  { sym: "CL=F",    label: "OIL"     },
  { sym: "^VIX",    label: "VIX"     },
];

const PERIODS = [
  { val: "1d",  label: "1D",  interval: "5m"  },
  { val: "5d",  label: "5D",  interval: "1h"  },
  { val: "1mo", label: "1M",  interval: "1d"  },
  { val: "3mo", label: "3M",  interval: "1d"  },
  { val: "1y",  label: "1Y",  interval: "1wk" },
];

interface OHLCVRow { time: string; open: number; high: number; low: number; close: number; volume: number; ma?: number; }

function sma(data: OHLCVRow[], n: number): OHLCVRow[] {
  return data.map((row, i) => {
    if (i < n - 1) return row;
    const slice = data.slice(i - n + 1, i + 1);
    const avg = slice.reduce((s, r) => s + r.close, 0) / n;
    return { ...row, ma: parseFloat(avg.toFixed(4)) };
  });
}

function fmtTime(t: string, period: string) {
  const d = new Date(t);
  if (period === "1d")  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (period === "5d")  return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:00`;
  return `${d.getMonth()+1}/${d.getDate()}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as OHLCVRow;
  if (!d) return null;
  const up = d.close >= d.open;
  return (
    <div style={{
      background: "#0a0a0a", border: `1px solid ${T.orange}55`,
      padding: "6px 10px", fontFamily: "Consolas, Monaco, monospace", fontSize: 10,
    }}>
      <div style={{ color: T.dim, marginBottom: 2 }}>{label}</div>
      <div style={{ color: T.white }}>O: {d.open.toFixed(2)}  H: {d.high.toFixed(2)}</div>
      <div style={{ color: T.white }}>L: {d.low.toFixed(2)}   C: <span style={{ color: up ? T.green : T.red }}>{d.close.toFixed(2)}</span></div>
      {d.volume > 0 && <div style={{ color: T.dim }}>VOL: {d.volume.toLocaleString()}</div>}
      {d.ma != null && <div style={{ color: T.amber }}>MA20: {d.ma.toFixed(2)}</div>}
    </div>
  );
};

export default function PriceChart({ defaultSymbol = "^GSPC" }: { defaultSymbol?: string }) {
  const [sym,    setSym]    = useState(defaultSymbol);
  const [period, setPeriod] = useState(PERIODS[1]);
  const [data,   setData]   = useState<OHLCVRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [customSym, setCustomSym] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (s: string, p: typeof PERIODS[number]) => {
    setLoading(true);
    try {
      const r = await fetch(`http://localhost:8000/api/history/${encodeURIComponent(s)}?period=${p.val}&interval=${p.interval}`);
      const j = await r.json();
      const rows: OHLCVRow[] = j.data ?? [];
      setData(sma(rows, 20));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(sym, period); }, [sym, period, load]);

  const first = data[0]?.close;
  const last  = data[data.length - 1]?.close;
  const up    = last != null && first != null && last >= first;
  const pctChg = (first != null && last != null && first !== 0)
    ? ((last - first) / first * 100).toFixed(2) : null;

  const lineColor = up ? T.green : T.red;
  const volMax = Math.max(...data.map(d => d.volume));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg }}>
      {/* Symbol selector */}
      <div style={{
        display: "flex", gap: 1, padding: "3px 4px",
        borderBottom: `1px solid ${T.border}`, flexWrap: "wrap", alignItems: "center",
      }}>
        {SYMBOLS.map(s => (
          <button
            key={s.sym}
            onClick={() => setSym(s.sym)}
            style={{
              fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700,
              padding: "2px 6px", cursor: "pointer", letterSpacing: 0.5,
              background: sym === s.sym ? T.orange : "transparent",
              color: sym === s.sym ? "#000" : T.dim,
              border: `1px solid ${sym === s.sym ? T.orange : T.border}`,
            }}
          >{s.label}</button>
        ))}
        {/* Custom symbol input */}
        <input
          ref={inputRef}
          value={customSym}
          onChange={e => setCustomSym(e.target.value.toUpperCase())}
          onKeyDown={e => { if (e.key === "Enter" && customSym) { setSym(customSym); setCustomSym(""); } }}
          placeholder="SYMBOL↵"
          style={{
            background: "transparent", border: `1px solid ${T.border}`, color: T.text,
            fontFamily: "Consolas, Monaco, monospace", fontSize: 9, padding: "2px 5px",
            width: 70, outline: "none",
          }}
        />
      </div>

      {/* Header: symbol + price + period */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "3px 6px", borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ fontFamily: "Consolas, Monaco, monospace" }}>
          <span style={{ color: T.orange, fontWeight: 700, fontSize: 12 }}>{sym}</span>
          {last != null && (
            <>
              <span style={{ color: T.white, fontSize: 13, fontWeight: 700, marginLeft: 8 }}>
                {last.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {pctChg != null && (
                <span style={{ color: lineColor, fontSize: 10, marginLeft: 6 }}>
                  {up ? "▲" : "▼"} {up ? "+" : ""}{pctChg}%
                </span>
              )}
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 1 }}>
          {PERIODS.map(p => (
            <button
              key={p.val}
              onClick={() => setPeriod(p)}
              style={{
                fontFamily: "Consolas, Monaco, monospace", fontSize: 9, padding: "2px 6px",
                background: period.val === p.val ? `${T.orange}22` : "transparent",
                color: period.val === p.val ? T.orange : T.dim,
                border: `1px solid ${period.val === p.val ? T.orange : T.border}`,
                cursor: "pointer",
              }}
            >{p.label}</button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
        {loading && (
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 11, zIndex: 10, background: `${T.bg}cc`,
          }}>
            LOADING {sym}…
          </div>
        )}
        {!loading && data.length === 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 11 }}>
            NO DATA
          </div>
        )}
        {data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
              <CartesianGrid stroke={T.border} strokeDasharray="1 4" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={t => fmtTime(t, period.val)}
                tick={{ fill: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 8 }}
                axisLine={{ stroke: T.border }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="price"
                orientation="right"
                tick={{ fill: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 8 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => v.toLocaleString("en-US", { notation: "compact" })}
                width={50}
                domain={["auto", "auto"]}
              />
              <YAxis
                yAxisId="vol"
                orientation="left"
                hide
                domain={[0, volMax * 4]}
              />
              <Tooltip content={<CustomTooltip />} />
              {first != null && (
                <ReferenceLine yAxisId="price" y={first} stroke={T.dim} strokeDasharray="2 4" strokeWidth={0.5} />
              )}
              {/* Volume bars */}
              <Bar
                yAxisId="vol"
                dataKey="volume"
                fill={up ? `${T.green}20` : `${T.red}20`}
                stroke="none"
                isAnimationActive={false}
              />
              {/* Price area */}
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={lineColor}
                strokeWidth={1.5}
                fill={up ? `${T.green}12` : `${T.red}12`}
                dot={false}
                isAnimationActive={false}
              />
              {/* 20-period MA */}
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ma"
                stroke={T.amber}
                strokeWidth={1}
                dot={false}
                strokeDasharray="3 2"
                connectNulls
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
