"use client";
import Link from "next/link";
import { ArrowRight, ChevronRight, Mail, ShieldCheck, Globe, Activity } from "lucide-react";
import { useState } from "react";

const SOURCES = [
  { category: "Global News", items: ["BBC World News", "Reuters", "Associated Press", "Al Jazeera"] },
  { category: "Economic Indicators", items: ["Yahoo Finance", "Frankfurter FX API", "World Bank Data"] },
  { category: "Climate & Environment", items: ["Open-Meteo", "USGS Earthquake Hazards Program", "NOAA Global Monitoring Laboratory"] },
  { category: "Demographics & Health", items: ["REST Countries API", "Worldometers", "WHO Global Health Observatory"] },
];

const METHODOLOGY = [
  { title: "Data Aggregation", desc: "Automated pipelines extract data from certified public RSS feeds, open REST APIs, and authorized endpoints using python-based scraping utilities." },
  { title: "Processing & Caching", desc: "Data is standardized and stored in high-performance memory structures via FastAPI. A central scheduler refreshes the dataset continuously at 15-minute intervals." },
  { title: "Real-time Distribution", desc: "A persistent WebSocket architecture ensures immediate dissemination of updated statistics to all connected client nodes, minimizing latency." },
];

export default function AboutPage() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:8000/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
          setSubscribed(true);
          setEmail("");
          setTimeout(() => setSubscribed(false), 5000);
        } else {
          console.error("Subscription failed");
        }
      } catch (error) {
        console.error("Error subscribing:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#060b18] text-slate-200 selection:bg-blue-900 selection:text-white pt-24 pb-20 overflow-hidden">
      
      {/* Background Animations */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f1a_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] animate-pan-grid"></div>
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-900/15 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[100px] mix-blend-screen animate-float"></div>
      </div>

      <style>{`
        @keyframes pan-grid {
          0% { transform: translateY(0); }
          100% { transform: translateY(4rem); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-30px) translateX(20px); }
        }
        .animate-pan-grid { animation: pan-grid 15s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 10s ease-in-out infinite; }
        .animate-float { animation: float 14s ease-in-out infinite; }
      `}</style>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        
        {/* Header Section */}
        <header className="border-b border-slate-800 pb-12 mb-16 relative">
          <div className="flex items-center gap-2 text-blue-500 font-semibold tracking-wide uppercase text-xs mb-4">
            <ShieldCheck size={16} />
            <span>Official Documentation</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight mb-6">
            About GeoTera
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
            GeoTera is a comprehensive intelligence platform designed to aggregate, process, and distribute real-time global data across key socio-economic, environmental, and geopolitical sectors.
          </p>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Purpose & Vision */}
            <section>
              <h2 className="text-2xl font-normal text-white mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-blue-600 mr-4"></span>
                Purpose & Vision
              </h2>
              <div className="prose prose-invert prose-slate max-w-none space-y-6">
                <p className="text-lg leading-relaxed text-slate-300">
                  In an increasingly interconnected world, access to verified, real-time data is critical for accurate situational awareness. GeoTera was established to democratize global intelligence by consolidating fragmented data streams into a unified, accessible dashboard. 
                </p>
                <p className="text-lg leading-relaxed text-slate-300">
                  Our primary objective is to empower decision-makers, researchers, and the general public with unfiltered access to the planet's most vital metrics. Whether tracking macroeconomic shifts, monitoring climate anomalies, or observing demographic trends, GeoTera acts as a neutral, open-source nexus for global information.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm">
                    <Globe className="text-blue-500 mb-4" size={24} />
                    <h4 className="text-white font-medium mb-2 text-lg">Global Coverage</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">Monitoring hundreds of verified data points from over 190 countries and territories to maintain comprehensive oversight.</p>
                  </div>
                  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-sm">
                    <Activity className="text-blue-500 mb-4" size={24} />
                    <h4 className="text-white font-medium mb-2 text-lg">Real-Time Sync</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">Advanced pipelines orchestrate millions of data points to deliver sub-second updates directly to client interfaces.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-normal text-white mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-blue-600 mr-4"></span>
                Methodology & Architecture
              </h2>
              <div className="space-y-8">
                {METHODOLOGY.map((step, i) => (
                  <div key={i} className="pl-6 border-l-2 border-slate-800 relative">
                    <div className="absolute w-2 h-2 rounded-full bg-blue-600 -left-[5px] top-2"></div>
                    <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-normal text-white mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-blue-600 mr-4"></span>
                Data Provenance
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                All metrics and intelligence displayed on GeoTera are sourced from authoritative institutional APIs, official feeds, and recognized public databases.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                {SOURCES.map((s) => (
                  <div key={s.category}>
                    <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                      {s.category}
                    </h3>
                    <ul className="space-y-3">
                      {s.items.map((item) => (
                        <li key={item} className="flex items-start text-sm text-slate-400">
                          <ChevronRight size={16} className="text-blue-500 mr-2 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Specs Panel */}
            <div className="bg-[#0b1221]/80 backdrop-blur-md border border-slate-800 rounded-sm p-8 sticky top-24">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6 pb-4 border-b border-slate-800">
                System Specifications
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Platform</h4>
                  <p className="text-sm text-slate-300">Open-source Web Application</p>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Core Technologies</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    <li>Python 3.11+</li>
                    <li>FastAPI & WebSockets</li>
                    <li>Next.js 14 & TypeScript</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs text-slate-500 uppercase tracking-wider mb-2">Update Frequency</h4>
                  <p className="text-sm text-slate-300">15 minutes (Global Standard)</p>
                </div>
                
                <div className="pt-6 mt-6 border-t border-slate-800">
                  <Link
                    href="/"
                    className="group flex items-center justify-between w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-3 rounded-sm transition-colors"
                  >
                    <span>Access Dashboard</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Newsletter Panel */}
            <div className="bg-[#0b1221]/80 backdrop-blur-md border border-slate-800 rounded-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="text-blue-500" size={20} />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Intelligence Brief
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Subscribe to receive curated weekly summaries of critical global metrics, geopolitical shifts, and platform updates.
              </p>
              
              {subscribed ? (
                <div className="bg-blue-900/30 border border-blue-500/50 text-blue-400 text-sm p-4 rounded-sm flex items-start gap-3">
                  <ShieldCheck size={18} className="shrink-0 mt-0.5" />
                  <span>Subscription confirmed. Thank you for joining the intelligence network.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} action="/subscribe" method="POST" className="space-y-3">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jhondoe.email@domain.com" 
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm px-4 py-3 rounded-sm focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-200 hover:bg-white text-slate-900 text-sm font-semibold px-4 py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Subscribing..." : "Subscribe"}
                  </button>
                  <p className="text-xs text-slate-600 text-center mt-3">
                    Your data is secured. Unsubscribe at any time.
                  </p>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
