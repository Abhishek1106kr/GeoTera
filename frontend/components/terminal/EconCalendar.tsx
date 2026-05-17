"use client";
import { useEffect, useState } from "react";

const T = {
  bg:     "#000000",
  panel:  "#080808",
  border: "#1a1a1a",
  orange: "#ff6600",
  amber:  "#ffaa00",
  green:  "#00cc44",
  red:    "#ff4444",
  yellow: "#ffdd00",
  dim:    "#555555",
  text:   "#cccccc",
  white:  "#e8e8e8",
};

interface CalEvent {
  date: string;
  time: string;
  event: string;
  country: string;
  impact: "HIGH" | "MED" | "LOW";
  prev: string | null;
  expected: string | null;
  actual: string | null;
}

function impactColor(i: string) {
  return i === "HIGH" ? T.red : i === "MED" ? T.yellow : T.dim;
}

function formatDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function EconCalendar() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/econ-calendar")
      .then(r => r.json())
      .then(d => { setEvents(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{
        padding: "3px 6px",
        borderBottom: `1px solid ${T.orange}55`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>
          ECONOMIC CALENDAR
        </span>
        <span style={{ color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 8 }}>
          UPCOMING EVENTS
        </span>
      </div>

      {/* Column headers */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "56px 36px 36px auto 38px 38px 38px",
        gap: "0 4px",
        padding: "2px 6px",
        borderBottom: `1px solid ${T.border}`,
        background: T.panel,
      }}>
        {["DATE", "TIME", "IMP", "EVENT", "PREV", "EXP", "ACT"].map(h => (
          <div key={h} style={{ color: T.orange, fontFamily: "Consolas, Monaco, monospace", fontSize: 8, fontWeight: 700, letterSpacing: 0.5 }}>{h}</div>
        ))}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.dim, fontFamily: "Consolas, Monaco, monospace", fontSize: 11 }}>
          LOADING…
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {events.map((ev, i) => {
            const isToday  = ev.date === today;
            const isPast   = ev.date < today;
            const hasActual = ev.actual != null;
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 36px 36px auto 38px 38px 38px",
                  gap: "0 4px",
                  padding: "3px 6px",
                  borderBottom: `1px solid ${T.border}`,
                  background: isToday ? `${T.orange}08` : "transparent",
                  borderLeft: isToday ? `2px solid ${T.orange}` : `2px solid transparent`,
                  opacity: isPast && !hasActual ? 0.5 : 1,
                }}
              >
                <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: isToday ? T.orange : T.dim }}>
                  {formatDate(ev.date)}
                </div>
                <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.dim }}>
                  {ev.time}
                </div>
                <div>
                  <span style={{
                    fontFamily: "Consolas, Monaco, monospace", fontSize: 8, fontWeight: 700,
                    color: impactColor(ev.impact), letterSpacing: 0.5,
                  }}>
                    {ev.impact === "HIGH" ? "●●●" : ev.impact === "MED" ? "●●○" : "●○○"}
                  </span>
                </div>
                <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ color: T.amber, marginRight: 4, fontSize: 8 }}>{ev.country}</span>
                  {ev.event}
                </div>
                <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.dim, textAlign: "right" }}>
                  {ev.prev ?? "—"}
                </div>
                <div style={{ fontFamily: "Consolas, Monaco, monospace", fontSize: 9, color: T.text, textAlign: "right" }}>
                  {ev.expected ?? "—"}
                </div>
                <div style={{
                  fontFamily: "Consolas, Monaco, monospace", fontSize: 9, textAlign: "right",
                  color: ev.actual != null
                    ? (parseFloat(ev.actual) > parseFloat(ev.expected ?? "0") ? T.green : T.red)
                    : T.dim,
                  fontWeight: ev.actual != null ? 700 : 400,
                }}>
                  {ev.actual ?? "—"}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
