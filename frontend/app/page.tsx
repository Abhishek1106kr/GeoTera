"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { useLocation } from "@/lib/useLocation";
import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, MapPin, Clock, TrendingUp, Globe, Newspaper, Cloud, Users, Activity } from "lucide-react";

const DeckGlobe = dynamic(() => import("@/components/DeckGlobe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mx-auto mb-4" />
        <p className="text-gray-600 text-sm">Loading globe...</p>
      </div>
    </div>
  ),
});

function useLocalTime(timezone?: string) {
  const [time, setTime] = useState("");
  useEffect(() => {
    if (!timezone) return;
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timezone]);
  return time;
}

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    const steps = 60;
    const inc = value / steps;
    let cur = 0;
    const id = setInterval(() => {
      cur += inc;
      if (cur >= value) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.floor(cur));
    }, 2000 / steps);
    return () => clearInterval(id);
  }, [value]);

  const fmt = (n: number) =>
    n >= 1e9 ? `${(n / 1e9).toFixed(2)}B`
    : n >= 1e6 ? `${(n / 1e6).toFixed(1)}M`
    : n.toLocaleString();

  return <span className="tabular-nums">{fmt(display)}{suffix}</span>;
}

const CARDS = [
  { href: "/economics", icon: TrendingUp, label: "Economics", desc: "Live markets, crypto & forex", from: "from-emerald-400", to: "to-teal-500", shadow: "shadow-emerald-500/20" },
  { href: "/news", icon: Newspaper, label: "World News", desc: "Real-time global headlines", from: "from-blue-400", to: "to-indigo-500", shadow: "shadow-blue-500/20" },
  { href: "/climate", icon: Cloud, label: "Climate", desc: "Weather, earthquakes & CO₂", from: "from-orange-400", to: "to-red-500", shadow: "shadow-orange-500/20" },
  { href: "/population", icon: Users, label: "Population", desc: "Demographics & health data", from: "from-violet-400", to: "to-purple-600", shadow: "shadow-violet-500/20" },
];

export default function Home() {
  const { data } = useGeoTera();
  const { location, loading } = useLocation();
  const localTime = useLocalTime(location?.timezone);

  const totalMarkets =
    (data?.economy?.indices?.length ?? 0) +
    (data?.economy?.crypto?.length ?? 0) +
    (data?.economy?.commodities?.length ?? 0);

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060b18] via-[#0a1228] to-[#060b18]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-2/3 left-1/4 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[250px] h-[250px] bg-violet-500/4 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-10">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Live Global Intelligence</span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tighter mb-6">
            <span className="text-white">Geo</span>
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">Tera</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed">
            The world&apos;s data, live. News, markets, climate, and demographics — one real-time dashboard.
          </p>

          {/* Location card */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-white/5 border border-white/10 backdrop-blur rounded-2xl px-6 py-4 mb-12">
            {loading ? (
              <span className="text-gray-600 text-sm">Detecting location...</span>
            ) : location ? (
              <>
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin size={15} className="text-cyan-400 flex-shrink-0" />
                  <span className="font-semibold">{location.city}{location.country ? `, ${location.country}` : ""}</span>
                </div>
                <div className="w-px h-4 bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock size={15} className="text-cyan-400 flex-shrink-0" />
                  <span className="font-mono text-sm">{localTime || "—"}</span>
                </div>
                {location.timezone && (
                  <>
                    <div className="w-px h-4 bg-white/20 hidden sm:block" />
                    <span className="text-xs text-gray-600">{location.timezone}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-gray-500 text-sm flex items-center gap-2">
                <Globe size={15} /> Global view
              </span>
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/economics"
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5"
            >
              Explore Dashboard <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/10 rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-cyan-400 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      {data && (
        <section className="border-y border-white/10 bg-white/[0.02] py-12 px-6">
          <div className="max-w-screen-xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "World Population", value: data.population?.world_population ?? 0 },
              { label: "CO₂ Level (ppm)", value: Math.floor(data.climate?.co2_ppm ?? 0) },
              { label: "Live News Stories", value: data.news?.length ?? 0 },
              { label: "Markets Tracked", value: totalMarkets },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-white mb-2">
                  {s.value ? <Counter value={s.value} /> : <span className="text-gray-700">—</span>}
                </p>
                <p className="text-sm text-gray-600">{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LIVE EARTH GLOBE ── */}
      <section className="py-20 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-5">
              <Activity size={12} className="text-cyan-400 animate-pulse" />
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Live Earth</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3">The World, Right Now</h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Earthquake activity and tracked cities plotted in real-time. Drag to explore. Data arcs show active news bureau connections.
            </p>
          </div>

          {/* Globe card */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#04080f]"
               style={{ boxShadow: "0 0 80px rgba(6,182,212,0.08), 0 0 0 1px rgba(255,255,255,0.05)" }}>
            {/* Top glow */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
            {/* Ambient corner glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-3xl pointer-events-none" />

            {/* Globe canvas */}
            <div className="relative" style={{ height: "600px" }}>
              <DeckGlobe
                earthquakes={data?.climate?.earthquakes ?? []}
                weather={data?.climate?.weather ?? []}
              />
            </div>

            {/* Bottom legend bar */}
            <div className="relative border-t border-white/5 bg-black/30 backdrop-blur px-8 py-4 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_2px_rgba(6,182,212,0.5)]" />
                <span className="text-xs text-gray-500">Tracked Cities ({data?.climate?.weather?.length ?? 0})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]" />
                <span className="text-xs text-gray-500">
                  Earthquakes ({data?.climate?.earthquakes?.length ?? 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-px bg-gradient-to-r from-cyan-400/60 to-violet-400/60" />
                <span className="text-xs text-gray-500">News Bureau Arcs</span>
              </div>
              <span className="ml-auto text-xs text-gray-700 hidden sm:block">Drag to rotate · Hover for details</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPLORE CARDS ── */}
      <section className="py-28 px-6">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Explore the World</h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              Four lenses on global reality. All data updates automatically every 15 minutes.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CARDS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group relative bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-2xl p-7 transition-all hover:-translate-y-1.5 duration-200"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.from} ${c.to} flex items-center justify-center mb-5 shadow-xl ${c.shadow}`}>
                  <c.icon size={24} className="text-white" />
                </div>
                <h3 className={`text-xl font-black text-white mb-2 bg-gradient-to-r ${c.from} ${c.to} bg-clip-text group-hover:text-transparent transition-all`}>
                  {c.label}
                </h3>
                <p className="text-sm text-gray-600 mb-5">{c.desc}</p>
                <div className={`flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r ${c.from} ${c.to} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Explore <ArrowRight size={12} className={`text-transparent stroke-current`} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS PREVIEW ── */}
      {(data?.news?.length ?? 0) > 0 && (
        <section className="py-20 px-6 bg-white/[0.02] border-t border-white/10">
          <div className="max-w-screen-xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl md:text-4xl font-black text-white">Latest Headlines</h2>
              <Link href="/news" className="flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                All News <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data!.news.slice(0, 3).map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-200"
                >
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">{item.source}</span>
                  <h3 className="text-base font-bold text-gray-200 mt-2 mb-3 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {item.summary?.replace(/<[^>]*>/g, "")}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
