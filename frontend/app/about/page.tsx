"use client";
import Link from "next/link";
import { Globe, Zap, RefreshCw, Database, ArrowRight } from "lucide-react";

const SOURCES = [
  { category: "News", items: ["BBC World (RSS)", "Reuters (RSS)", "AP News (RSS)", "Al Jazeera (RSS)"] },
  { category: "Economy", items: ["Yahoo Finance (yfinance)", "Frankfurter FX API", "World Bank (GDP)"] },
  { category: "Climate", items: ["Open-Meteo (Weather)", "USGS Earthquake GeoJSON", "NOAA Mauna Loa CO₂"] },
  { category: "Population", items: ["REST Countries API", "Worldometers", "WHO Global Health Observatory"] },
];

const HOW_IT_WORKS = [
  { icon: Database, title: "Web Scraping", desc: "Python scrapers pull from RSS feeds, open APIs, and publicly accessible web sources using aiohttp and BeautifulSoup." },
  { icon: RefreshCw, title: "Auto-Refresh", desc: "APScheduler triggers a full scrape cycle every 15 minutes. All data is cached in-memory on the FastAPI server." },
  { icon: Zap, title: "WebSocket Push", desc: "After each scrape, updated data is instantly pushed to every connected browser client over a persistent WebSocket connection." },
  { icon: Globe, title: "Live Dashboard", desc: "The Next.js frontend maintains a live WebSocket connection, auto-reconnects on drop, and renders fresh data without page reload." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-cyan-500 to-blue-500 opacity-5 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/20">
            <Globe size={36} className="text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            About <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">GeoTera</span>
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            GeoTera is a real-time global intelligence dashboard that aggregates news, financial markets, climate data, and population statistics from trusted open sources — and delivers it to your browser the moment it changes.
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-6 pb-24 space-y-20">
        {/* Mission */}
        <section className="bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-800/20 rounded-3xl p-10 md:p-14">
          <h2 className="text-3xl font-black text-white mb-4">Our Mission</h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
            The world changes fast. GeoTera exists to make the pulse of the planet accessible to anyone, instantly — from geopolitical headlines to live stock prices, from earthquake alerts to atmospheric CO₂ readings. No subscriptions. No paywalls. Just the world, live.
          </p>
        </section>

        {/* How it works */}
        <section>
          <h2 className="text-3xl font-black text-white mb-10 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-7">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mb-5 shadow-lg shadow-cyan-500/15">
                  <step.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data sources */}
        <section>
          <h2 className="text-3xl font-black text-white mb-10 text-center">Data Sources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SOURCES.map((s) => (
              <div key={s.category} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-4">{s.category}</h3>
                <ul className="space-y-2.5">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-cyan-600 mt-0.5">›</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="text-center">
          <h2 className="text-3xl font-black text-white mb-4">Tech Stack</h2>
          <p className="text-gray-600 mb-10">Open source, self-hostable, no external subscriptions required.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["FastAPI", "Python 3.11+", "APScheduler", "WebSockets", "BeautifulSoup4", "aiohttp", "yfinance", "feedparser", "Next.js 14", "TypeScript", "Tailwind CSS", "Recharts"].map((tech) => (
              <span key={tech} className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-sm text-gray-400 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold px-10 py-4 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 hover:-translate-y-0.5"
          >
            Back to Dashboard <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </div>
  );
}
