"use client";
import Link from "next/link";
import { useGeoTera } from "@/lib/GeoTeraContext";
import PageHero from "@/components/PageHero";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import type { MarketItem } from "@/lib/useWebSocket";

function fmt(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toFixed(2);
}

function MarketCard({ item }: { item: MarketItem }) {
  const up = (item.change_pct ?? 0) >= 0;
  return (
    <div className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-0.5">{item.symbol}</p>
          <p className="text-sm font-semibold text-gray-300">{item.name}</p>
        </div>
        {item.change_pct != null && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(item.change_pct).toFixed(2)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white tabular-nums">{fmt(item.price)}</p>
    </div>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
      <span className={`w-1.5 h-7 rounded-full bg-gradient-to-b ${color}`} />
      {label}
    </h2>
  );
}

export default function EconomicsPage() {
  const { data } = useGeoTera();
  const eco = data?.economy;
  const empty = <div className="h-36 flex items-center justify-center text-gray-700 bg-white/[0.02] border border-white/5 rounded-2xl text-sm">Fetching data...</div>;

  return (
    <div className="min-h-screen">
      <PageHero
        tag="Live Markets"
        title="Global Economics"
        subtitle="Real-time stock indices, cryptocurrency, commodities, and foreign exchange rates — updated every 15 minutes via WebSocket."
        gradient="from-emerald-400 to-teal-500"
      />

      <div className="max-w-screen-xl mx-auto px-6 pb-20 space-y-16">
        {/* Quick Navigation Buttons */}
        <div className="flex flex-wrap items-center gap-4 -mb-8">
          <Link href="/finance" className="px-6 py-2.5 bg-white/[0.05] hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/50 rounded-xl text-sm font-medium text-gray-300 hover:text-emerald-400 transition-all">
            Finance
          </Link>
          <Link href="/corporate" className="px-6 py-2.5 bg-white/[0.05] hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/50 rounded-xl text-sm font-medium text-gray-300 hover:text-violet-400 transition-all">
            Corporate
          </Link>
          <Link href="/about" className="px-6 py-2.5 bg-white/[0.05] hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-xl text-sm font-medium text-gray-300 hover:text-cyan-400 transition-all">
            About
          </Link>
        </div>

        <section>
          <SectionTitle label="Stock Indices" color="from-emerald-400 to-teal-600" />
          {eco?.indices?.length
            ? <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{eco.indices.map((m) => <MarketCard key={m.symbol} item={m} />)}</div>
            : empty}
        </section>

        <section>
          <SectionTitle label="Cryptocurrency" color="from-violet-400 to-purple-600" />
          {eco?.crypto?.length
            ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{eco.crypto.map((m) => <MarketCard key={m.symbol} item={m} />)}</div>
            : empty}
        </section>

        <section>
          <SectionTitle label="Commodities" color="from-amber-400 to-orange-500" />
          {eco?.commodities?.length
            ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{eco.commodities.map((m) => <MarketCard key={m.symbol} item={m} />)}</div>
            : empty}
        </section>

        {eco?.forex && Object.keys(eco.forex).length > 0 && (
          <section>
            <SectionTitle label="Forex Rates (USD Base)" color="from-cyan-400 to-blue-500" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(eco.forex).map(([cur, rate]) => (
                <div key={cur} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center">
                  <DollarSign size={20} className="text-cyan-400 mx-auto mb-3" />
                  <p className="text-xs text-gray-600 mb-1">USD → {cur}</p>
                  <p className="text-xl font-black text-white tabular-nums">{(rate as number).toFixed(4)}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
