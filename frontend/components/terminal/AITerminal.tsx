"use client";
import { useEffect, useRef, useState, useCallback, KeyboardEvent } from "react";
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

interface Line { type: "input" | "output" | "error" | "system"; text: string; }

const HELP_TEXT = `GeoTera Economic Intelligence Terminal v2.0
Type a question and press ENTER to query the AI.
Examples:
  > What is the current market outlook?
  > Analyze yield curve inversion risks
  > Compare US vs EU economic indicators
  > What sectors are outperforming today?
  > Recession probability assessment
Type CLEAR to clear the terminal.`;

const QUICK = [
  "Market outlook today",
  "Yield curve analysis",
  "Inflation vs Fed policy",
  "Top performing sectors",
  "Recession risk assessment",
  "Dollar strength impact",
];

export default function AITerminal() {
  const { data, status } = useGeoTera();
  const [lines,   setLines]   = useState<Line[]>([{ type: "system", text: HELP_TEXT }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const buildContext = useCallback(() => {
    const eco  = data?.economy;
    const macro = eco?.macro;
    const indices = (eco?.indices ?? []).map(i => `${i.name}: ${i.price} (${i.change_pct?.toFixed(2)}%)`).join(", ");
    const crypto  = (eco?.crypto  ?? []).map(i => `${i.symbol}: ${i.price} (${i.change_pct?.toFixed(2)}%)`).join(", ");
    const wb   = data?.worldbank?.countries ?? {};
    const yields = macro ? `2Y:${macro.treasury_2y?.toFixed(2)}% 10Y:${macro.treasury_10y?.toFixed(2)}%` : "";
    const inverted = macro && macro.treasury_2y != null && macro.treasury_10y != null && macro.treasury_2y > macro.treasury_10y;
    return `VIX:${macro?.vix?.toFixed(1)} DXY:${macro?.dxy?.toFixed(2)} F&G:${macro?.fear_greed}/100 Yields[${yields}]${inverted ? " INVERTED" : ""} | Indices:[${indices}] | Crypto:[${crypto}] | US GDP Growth:${wb["US"]?.gdp_growth?.toFixed(1)}% Inflation:${wb["US"]?.inflation?.toFixed(1)}%`;
  }, [data]);

  const submit = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q) return;

    if (q.toUpperCase() === "CLEAR") {
      setLines([{ type: "system", text: "Terminal cleared. " + new Date().toLocaleTimeString() }]);
      setInput("");
      return;
    }

    setLines(prev => [...prev, { type: "input", text: q }]);
    setHistory(prev => [q, ...prev.slice(0, 49)]);
    setHistIdx(-1);
    setInput("");
    setLoading(true);

    setLines(prev => [...prev, { type: "system", text: "Processing query…" }]);

    try {
      const res = await fetch("http://localhost:8000/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, context: buildContext() }),
      });
      const json = await res.json();
      setLines(prev => {
        const next = prev.filter(l => l.text !== "Processing query…");
        return [...next, { type: "output", text: json.response ?? "No response." }];
      });
    } catch (e) {
      setLines(prev => {
        const next = prev.filter(l => l.text !== "Processing query…");
        return [...next, { type: "error", text: "CONNECTION ERROR — Backend unavailable." }];
      });
    } finally {
      setLoading(false);
    }
  }, [buildContext]);

  const onKey = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      submit(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx] ?? "");
    }
  }, [input, submit, history, histIdx]);

  const lineColor = (t: Line["type"]) =>
    t === "input"  ? T.orange :
    t === "error"  ? T.red    :
    t === "system" ? T.dim    : T.text;

  const statusColor = status === "connected" ? T.green : status === "connecting" ? T.amber : T.red;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: T.bg, overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "3px 8px", borderBottom: `1px solid ${T.orange}55`,
        background: T.panel,
      }}>
        <span style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
          GEO&gt; AI TERMINAL
        </span>
        <span style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 8 }}>
          <span style={{ color: statusColor }}>●</span>
          <span style={{ color: T.dim, marginLeft: 4 }}>WS {status.toUpperCase()}</span>
        </span>
      </div>

      {/* Quick queries */}
      <div style={{
        display: "flex", gap: 4, padding: "3px 6px", overflowX: "auto",
        borderBottom: `1px solid ${T.border}`, flexShrink: 0,
      }}>
        {QUICK.map(q => (
          <button
            key={q}
            onClick={() => submit(q)}
            disabled={loading}
            style={{
              fontFamily: "Consolas, Monaco, monospace", fontSize: 8, whiteSpace: "nowrap",
              padding: "2px 6px", cursor: "pointer",
              background: "transparent", color: T.dim,
              border: `1px solid ${T.border}`,
            }}
          >{q}</button>
        ))}
      </div>

      {/* Output area */}
      <div
        style={{ flex: 1, overflowY: "auto", padding: "6px 8px", cursor: "text" }}
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ marginBottom: 4 }}>
            {line.type === "input" ? (
              <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 10 }}>
                <span style={{ color: T.orange, fontWeight: 700 }}>GEO&gt; </span>
                <span style={{ color: T.orange }}>{line.text}</span>
              </div>
            ) : (
              <div style={{
                fontFamily: "Consolas, Monaco, monospace", fontSize: 10,
                color: lineColor(line.type),
                whiteSpace: "pre-wrap", lineHeight: 1.6,
                borderLeft: line.type === "output" ? `2px solid ${T.orange}44` : "2px solid transparent",
                paddingLeft: line.type === "output" ? 6 : 0,
              }}>
                {line.text}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 10, color: T.orange }}>
            <span className="terminal-cursor">▋</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "4px 8px", borderTop: `1px solid ${T.orange}44`,
        background: T.panel, flexShrink: 0,
      }}>
        <span style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
          GEO&gt;
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          disabled={loading}
          placeholder={loading ? "Processing…" : "Enter query (↑↓ history, ENTER submit)"}
          style={{
            flex: 1, background: "transparent",
            border: "none", outline: "none",
            color: loading ? T.dim : T.white,
            fontFamily: "Consolas, Monaco, monospace", fontSize: 10,
            caretColor: T.orange,
          }}
        />
        <button
          onClick={() => submit(input)}
          disabled={loading || !input.trim()}
          style={{
            background: loading ? T.dim : T.orange, color: "#000",
            border: "none", padding: "2px 8px", cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700,
          }}
        >
          EXEC
        </button>
      </div>
    </div>
  );
}
