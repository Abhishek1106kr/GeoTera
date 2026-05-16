"use client";
import dynamic from "next/dynamic";
import TickerBar from "@/components/economics/TickerBar";
import SignalBar from "@/components/economics/SignalBar";
import MarketHeatmap from "@/components/economics/MarketHeatmap";
import EventFeed from "@/components/economics/EventFeed";
import ChartPanel from "@/components/economics/ChartPanel";
import PredictivePanel from "@/components/economics/PredictivePanel";
import AIAssistant from "@/components/economics/AIAssistant";

const EconomicsMap = dynamic(() => import("@/components/economics/EconomicsMap"), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center text-gray-700 text-sm animate-pulse">Loading map…</div>,
});

function Panel({
  children,
  className = "",
  noPad = false,
}: {
  children: React.ReactNode;
  className?: string;
  noPad?: boolean;
}) {
  return (
    <div
      className={`relative bg-[#030810]/80 border border-[#00d4ff]/8 rounded-2xl overflow-hidden ${noPad ? "" : "p-4"} ${className}`}
      style={{ boxShadow: "0 0 0 1px rgba(0,212,255,0.04), inset 0 1px 0 rgba(0,212,255,0.05)" }}
    >
      {children}
    </div>
  );
}

export default function EconomicsPage() {
  return (
    <div className="min-h-screen bg-[#03060d] eco-grid-bg pt-16 flex flex-col">
      {/* ── Live Ticker ── */}
      <TickerBar />

      {/* ── Signal Bar ── */}
      <SignalBar />

      {/* ── Page title ── */}
      <div className="px-6 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="w-2 h-6 rounded-full bg-gradient-to-b from-[#00d4ff] to-violet-500" />
            Economic Intelligence
          </h1>
          <p className="text-xs text-gray-600 mt-0.5 pl-5">Real-time global economic monitoring · AI-powered insights · Live World Bank data</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
          <span className="text-[10px] text-gray-600 uppercase tracking-widest">Live Feed</span>
        </div>
      </div>

      <div className="flex-1 px-4 pb-6 flex flex-col gap-3">
        {/* ── Row 1: Map + AI ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ minHeight: "380px" }}>
          <Panel className="lg:col-span-2" noPad>
            {/* Map header */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#00d4ff]/8">
              <span className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest">Global Economic Map</span>
              <div className="ml-auto flex items-center gap-4 text-[9px] text-gray-600">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00ff9d]" />Growth &gt;3%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />1–3%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />0–1%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ff3366]" />Negative</span>
              </div>
            </div>
            <div style={{ height: "340px" }}>
              <EconomicsMap />
            </div>
          </Panel>

          <Panel className="flex flex-col" noPad>
            <div style={{ height: "380px" }}>
              <AIAssistant />
            </div>
          </Panel>
        </div>

        {/* ── Row 2: Heatmap + Events + Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ minHeight: "320px" }}>
          <Panel>
            <MarketHeatmap />
          </Panel>
          <Panel>
            <EventFeed />
          </Panel>
          <Panel>
            <ChartPanel />
          </Panel>
        </div>

        {/* ── Row 3: Predictive Analytics ── */}
        <Panel>
          <PredictivePanel />
        </Panel>
      </div>
    </div>
  );
}
