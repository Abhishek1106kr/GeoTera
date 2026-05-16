"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { ExternalLink, Zap, AlertTriangle, Info } from "lucide-react";

const ECONOMIC_KEYWORDS = [
  "fed", "federal reserve", "rate", "interest", "inflation", "gdp", "recession",
  "oil", "gold", "bank", "ecb", "imf", "world bank", "trade", "tariff",
  "unemployment", "jobs", "cpi", "economy", "market", "stock", "crypto",
  "bitcoin", "yield", "bond", "debt", "deficit", "currency", "dollar",
  "sanctions", "opec", "supply chain",
];

function severity(title: string): { level: "high" | "medium" | "info"; icon: React.ReactNode; color: string } {
  const t = title.toLowerCase();
  const high = ["crash", "surge", "record", "collapse", "crisis", "war", "sanction", "emergency", "alert"];
  const med = ["rise", "fall", "cut", "hike", "warning", "concern", "volatil"];
  if (high.some((w) => t.includes(w))) return { level: "high", icon: <AlertTriangle size={10} />, color: "text-[#ff3366] bg-[#ff3366]/10 border-[#ff3366]/20" };
  if (med.some((w) => t.includes(w))) return { level: "medium", icon: <Zap size={10} />, color: "text-[#ffd700] bg-[#ffd700]/10 border-[#ffd700]/20" };
  return { level: "info", icon: <Info size={10} />, color: "text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/20" };
}

export default function EventFeed() {
  const { data } = useGeoTera();

  const events = (data?.news ?? []).filter((n) => {
    const text = `${n.title} ${n.summary}`.toLowerCase();
    return ECONOMIC_KEYWORDS.some((kw) => text.includes(kw));
  });

  if (!events.length) {
    return (
      <div className="h-full flex items-center justify-center text-gray-700 text-sm">
        Monitoring economic events…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Zap size={10} className="animate-pulse" /> Event Intelligence
      </p>
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        {events.map((ev, i) => {
          const { icon, color } = severity(ev.title);
          return (
            <a
              key={i}
              href={ev.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 rounded-xl p-3 transition-all"
            >
              <div className="flex items-start gap-2">
                <span className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5 ${color}`}>
                  {icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                    {ev.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-700">{ev.source}</span>
                    <ExternalLink size={8} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
