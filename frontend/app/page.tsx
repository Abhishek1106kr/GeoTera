"use client";
import { useGeoTeraWebSocket } from "@/lib/useWebSocket";
import LiveBadge from "@/components/LiveBadge";
import NewsWidget from "@/components/NewsWidget";
import EconomyWidget from "@/components/EconomyWidget";
import ClimateWidget from "@/components/ClimateWidget";
import PopulationWidget from "@/components/PopulationWidget";
import { RefreshCw } from "lucide-react";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-[#111118] border border-gray-800 rounded-2xl p-5">
      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">{title}</h2>
      {children}
    </section>
  );
}

export default function Home() {
  const { data, status, refresh } = useGeoTeraWebSocket();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0a0a0f]/90 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-black tracking-tight">
            <span className="text-blue-400">Geo</span>Tera
          </span>
          <span className="hidden sm:block text-xs text-gray-600">Global Live Data Center</span>
        </div>
        <div className="flex items-center gap-4">
          {data?.last_updated && (
            <span className="hidden md:block text-xs text-gray-600">
              Updated {new Date(data.last_updated).toLocaleTimeString()}
            </span>
          )}
          <LiveBadge status={status} />
          <button
            onClick={refresh}
            title="Force refresh all data"
            className="p-1.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      {/* Dashboard grid */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: News */}
        <div className="lg:col-span-1">
          <Section title="🌐 World News">
            <NewsWidget news={data?.news ?? []} />
          </Section>
        </div>

        {/* Middle + Right columns */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Section title="📈 Markets & Economy">
            <EconomyWidget economy={data?.economy ?? null} />
          </Section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Section title="🌍 Climate & Environment">
              <ClimateWidget climate={data?.climate ?? null} />
            </Section>
            <Section title="👥 Population & Demographics">
              <PopulationWidget population={data?.population ?? null} />
            </Section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-700">
        GeoTera — Data refreshes every 15 minutes automatically via WebSocket.
        Sources: BBC · Reuters · AP · Yahoo Finance · Open-Meteo · USGS · NOAA · WHO · REST Countries
      </footer>
    </div>
  );
}
