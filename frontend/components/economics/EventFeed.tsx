"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { ExternalLink, Zap, AlertTriangle, Info, Shield } from "lucide-react";

const ECON_KEYWORDS = [
  "fed", "federal reserve", "rate", "interest", "inflation", "gdp", "recession",
  "oil", "gold", "bank", "ecb", "imf", "world bank", "trade", "tariff",
  "unemployment", "jobs", "cpi", "economy", "market", "stock", "crypto",
  "bitcoin", "yield", "bond", "debt", "deficit", "currency", "dollar",
  "sanctions", "opec", "supply chain", "manufacturing", "export", "import",
  "earnings", "profit", "revenue", "growth", "contraction", "fiscal", "monetary",
];

const SECTOR_TAGS: { kw: string[]; sector: string; color: string }[] = [
  { kw: ["oil", "opec", "energy", "pipeline", "lng", "gas price"], sector: "Energy",       color: "#f97316" },
  { kw: ["fed", "rate", "bond", "yield", "treasury", "monetary"],  sector: "Rates",        color: "#00d4ff" },
  { kw: ["bank", "financial", "credit", "lending", "mortgage"],    sector: "Finance",      color: "#34d399" },
  { kw: ["tech", "ai", "chip", "semiconductor", "software", "big tech"], sector: "Tech",   color: "#a78bfa" },
  { kw: ["trade", "tariff", "export", "import", "supply chain"],   sector: "Trade",        color: "#fbbf24" },
  { kw: ["gold", "silver", "copper", "commodity", "metals"],       sector: "Commodities",  color: "#ffd700" },
  { kw: ["war", "conflict", "sanction", "geopolit", "military"],   sector: "Geopolitical", color: "#ff3366" },
  { kw: ["inflation", "cpi", "ppi", "price rise", "cost"],         sector: "Inflation",    color: "#f97316" },
  { kw: ["crypto", "bitcoin", "eth", "blockchain", "defi"],        sector: "Crypto",       color: "#8b5cf6" },
];

interface Severity {
  level: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
  text: string;
}

function getSeverity(title: string): Severity {
  const t = title.toLowerCase();
  const high = ["crash", "surge", "record high", "record low", "collapse", "crisis", "war", "sanction", "emergency", "spike", "plunge", "soar", "ban", "default"];
  const med  = ["rise", "fall", "cut", "hike", "warning", "concern", "volatil", "jump", "drop", "slip", "slowdown"];
  if (high.some(w => t.includes(w)))
    return { level: "HIGH", icon: <AlertTriangle size={8} />, bg: "bg-[#ff3366]/8",  border: "border-[#ff3366]/20", text: "text-[#ff3366]" };
  if (med.some(w => t.includes(w)))
    return { level: "MED",  icon: <Zap size={8} />,           bg: "bg-[#ffd700]/8",  border: "border-[#ffd700]/20", text: "text-[#ffd700]" };
  return       { level: "INFO", icon: <Info size={8} />,      bg: "bg-[#00d4ff]/8",  border: "border-[#00d4ff]/20", text: "text-[#00d4ff]" };
}

function getTagsFor(title: string, summary: string) {
  const text = `${title} ${summary}`.toLowerCase();
  return SECTOR_TAGS.filter(t => t.kw.some(kw => text.includes(kw))).slice(0, 2);
}

export default function EventFeed() {
  const { data } = useGeoTera();

  const events = (data?.news ?? [])
    .filter(n => {
      const text = `${n.title} ${n.summary ?? ""}`.toLowerCase();
      return ECON_KEYWORDS.some(kw => text.includes(kw));
    })
    .slice(0, 15);

  const highCount = events.filter(e => getSeverity(e.title).level === "HIGH").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <p className="text-[10px] font-black text-[#ffd700] uppercase tracking-widest flex items-center gap-1.5">
          <Zap size={10} className="animate-pulse" /> Event Intelligence
        </p>
        <div className="flex items-center gap-2 text-[9px]">
          {highCount > 0 && (
            <span className="bg-[#ff3366]/10 border border-[#ff3366]/20 text-[#ff3366] px-1.5 py-0.5 rounded font-bold">
              {highCount} HIGH
            </span>
          )}
          <span className="text-gray-700">{events.length} events</span>
        </div>
      </div>

      {!events.length ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs">
          <div className="text-center">
            <Shield size={24} className="text-gray-800 mx-auto mb-2" />
            <p>Monitoring economic events…</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin min-h-0">
          {events.map((ev, i) => {
            const sev  = getSeverity(ev.title);
            const tags = getTagsFor(ev.title, ev.summary ?? "");

            return (
              <a
                key={i}
                href={ev.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block border rounded-xl p-2.5 transition-all hover:brightness-125 ${sev.bg} ${sev.border}`}
              >
                <div className="flex items-start gap-2">
                  {/* Severity badge */}
                  <span className={`inline-flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded border flex-shrink-0 mt-0.5 ${sev.bg} ${sev.border} ${sev.text}`}>
                    {sev.icon}{sev.level}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold text-gray-300 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                      {ev.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[8px] text-gray-700">{ev.source}</span>
                      {tags.map(tag => (
                        <span
                          key={tag.sector}
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{
                            background: `${tag.color}15`,
                            color: tag.color,
                            border: `1px solid ${tag.color}28`,
                          }}
                        >
                          {tag.sector}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ExternalLink size={8} className="text-gray-700 group-hover:text-gray-500 flex-shrink-0 mt-1" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
