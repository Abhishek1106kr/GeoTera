"use client";
import EconCalendar from "@/components/terminal/EconCalendar";
import AITerminal from "@/components/terminal/AITerminal";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", dim: "#555555",
};

export default function ForecastView() {
  return (
    <div className="view-enter" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, height: "100%", overflow: "hidden" }}>
      {/* Left: Economic Calendar */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <EconCalendar />
      </div>

      {/* Right: AI Terminal */}
      <div className="glass-panel" style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AITerminal />
      </div>
    </div>
  );
}
