"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import TickerBar from "@/components/economics/TickerBar";
import SignalBar from "@/components/economics/SignalBar";
import KPIStrip from "@/components/economics/KPIStrip";
import MarketHeatmap from "@/components/economics/MarketHeatmap";
import EventFeed from "@/components/economics/EventFeed";
import ChartPanel from "@/components/economics/ChartPanel";
import PredictivePanel from "@/components/economics/PredictivePanel";
import AIAssistant from "@/components/economics/AIAssistant";
import YieldCurveChart from "@/components/economics/YieldCurveChart";
import CurrencyMatrix from "@/components/economics/CurrencyMatrix";
import SectorGrid from "@/components/economics/SectorGrid";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { RefreshCw, Activity } from "lucide-react";

const EconomicsMap = dynamic(() => import("@/components/economics/EconomicsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-700 text-sm animate-pulse">
      Loading map…
    </div>
  ),
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
      className={`relative bg-[#030810]/80 border border-[#00d4ff]/8 rounded-2xl overflow-hidden backdrop-blur-sm ${noPad ? "" : "p-4"} ${className}`}
      style={{
        boxShadow: "0 0 0 1px rgba(0,212,255,0.04), inset 0 1px 0 rgba(0,212,255,0.06)",
      }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/15 to-transparent pointer-events-none" />
      {children}
    </div>
  );
}

function SectionLabel({ children, color = "#00d4ff" }: { children: React.ReactNode; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.04]">
      <span className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>
        {children}
      </span>
    </div>
  );
}

export default function EconomicsPage() {
  const { status, refresh } = useGeoTera();

  const statusColor  = status === "connected" ? "#00ff9d" : status === "connecting" ? "#ffd700" : "#ff3366";
  const statusLabel  = status === "connected" ? "Live" : status === "connecting" ? "Connecting…" : "Reconnecting…";

  return (
    <div
      className="min-h-screen bg-[#03060d] eco-grid-bg pt-16 flex flex-col"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Top ticker bar ── */}
      <TickerBar />

      {/* ── Macro KPI strip ── */}
      <KPIStrip />

      {/* ── Signal alerts ── */}
      <SignalBar />

      {/* ── Page header ── */}
      <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-white/[0.03] flex-shrink-0">
        <div>
          <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
            <Activity size={16} className="text-[#00d4ff]" />
            Economic Intelligence
          </h1>
          <p className="text-[9px] text-gray-600 pl-6">
            Real-time global monitoring · AI-powered insights · World Bank &amp; live market data
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2 pl-6">
            <Link href="/finance" className="px-3 py-1 bg-white/[0.04] hover:bg-emerald-500/15 border border-white/8 hover:border-emerald-500/40 rounded-lg text-[9px] font-bold text-gray-500 hover:text-emerald-400 transition-all uppercase tracking-widest">
              Finance
            </Link>
            <Link href="/corporate" className="px-3 py-1 bg-white/[0.04] hover:bg-violet-500/15 border border-white/8 hover:border-violet-500/40 rounded-lg text-[9px] font-bold text-gray-500 hover:text-violet-400 transition-all uppercase tracking-widest">
              Corporate
            </Link>
            <Link href="/about" className="px-3 py-1 bg-white/[0.04] hover:bg-[#00d4ff]/15 border border-white/8 hover:border-[#00d4ff]/40 rounded-lg text-[9px] font-bold text-gray-500 hover:text-[#00d4ff] transition-all uppercase tracking-widest">
              About
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: statusColor }}
            />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: statusColor }}>
              {statusLabel}
            </span>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/8 text-gray-600 hover:text-gray-400 transition-all text-[9px] font-bold uppercase tracking-widest"
          >
            <RefreshCw size={10} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 px-4 pb-6 pt-3 flex flex-col gap-3">

        {/* ── ROW 1: Map + AI ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-3" style={{ minHeight: "480px" }}>
          {/* Map panel */}
          <Panel className="lg:col-span-3" noPad>
            <SectionLabel>🌍 Global Economic Map · Click Country</SectionLabel>
            <div style={{ height: "440px" }}>
              <EconomicsMap />
            </div>
          </Panel>

          {/* AI panel */}
          <Panel className="lg:col-span-2 flex flex-col" noPad>
            <div className="flex-1 min-h-0" style={{ height: "480px" }}>
              <AIAssistant />
            </div>
          </Panel>
        </div>

        {/* ── ROW 2: Heatmap | Events | Yield Curve ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ minHeight: "340px" }}>
          <Panel>
            <MarketHeatmap />
          </Panel>
          <Panel>
            <EventFeed />
          </Panel>
          <Panel>
            <YieldCurveChart />
          </Panel>
        </div>

        {/* ── ROW 3: Charts | Sectors | Currency ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ minHeight: "320px" }}>
          <Panel>
            <ChartPanel />
          </Panel>
          <Panel>
            <SectorGrid />
          </Panel>
          <Panel>
            <CurrencyMatrix />
          </Panel>
        </div>

        {/* ── ROW 4: Predictive Analytics (full width) ── */}
        <Panel>
          <PredictivePanel />
        </Panel>

      </div>
    </div>
  );
}
