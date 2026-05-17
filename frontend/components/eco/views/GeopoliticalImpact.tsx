"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { Shield, AlertTriangle, Info, Zap, TrendingDown } from "lucide-react";

const SECTOR_TAGS: { keywords: string[]; label: string; color: string }[] = [
  { keywords: ["oil", "energy", "gas", "opec", "saudi"], label: "Energy",      color: "#f59e0b" },
  { keywords: ["rate", "fed", "ecb", "bank", "inflation", "cpi", "interest"], label: "Rates", color: "#38bdf8" },
  { keywords: ["bank", "financial", "credit", "debt", "bond"],  label: "Finance",     color: "#00ff9d" },
  { keywords: ["tech", "ai", "chip", "semi", "nvidia", "apple"], label: "Tech",       color: "#00d4ff" },
  { keywords: ["trade", "tariff", "export", "import", "supply"], label: "Trade",      color: "#a78bfa" },
  { keywords: ["war", "conflict", "military", "nato", "russia", "china", "taiwan"], label: "Geopolitical", color: "#ff3366" },
  { keywords: ["gold", "silver", "copper", "commodity"],        label: "Commodities", color: "#f97316" },
  { keywords: ["crypto", "bitcoin", "ethereum", "defi"],        label: "Crypto",      color: "#c084fc" },
  { keywords: ["election", "government", "policy", "sanction"], label: "Policy",      color: "#84cc16" },
  { keywords: ["climate", "weather", "hurricane", "disaster"],  label: "Climate",     color: "#6ee7b7" },
];

function getTag(text: string) {
  const lower = text.toLowerCase();
  return SECTOR_TAGS.find(t => t.keywords.some(k => lower.includes(k)));
}

function getSeverity(text: string) {
  const lower = text.toLowerCase();
  if (lower.match(/crash|collapse|crisis|war|sanction|default|recession|catastroph/)) return "HIGH";
  if (lower.match(/risk|concern|warning|surge|drop|fall|decline|fear|threat|tension/)) return "MED";
  return "INFO";
}

const SEV_META = {
  HIGH:  { icon: AlertTriangle, color: "#ff3366", bg: "bg-[#ff3366]/5",  border: "border-[#ff3366]/15", label: "High Impact"   },
  MED:   { icon: Zap,           color: "#f59e0b", bg: "bg-[#f59e0b]/5",  border: "border-[#f59e0b]/15", label: "Watch"         },
  INFO:  { icon: Info,          color: "#00d4ff", bg: "bg-[#00d4ff]/5",  border: "border-[#00d4ff]/10", label: "Informational" },
};

type Sev = keyof typeof SEV_META;

function NewsCard({ item, i, sev, tag }: {
  item: { source: string; title: string; published: string; summary?: string; link?: string };
  i: number; sev: Sev; tag: typeof SECTOR_TAGS[0] | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  const { icon: Icon, color, bg, border, label } = SEV_META[sev];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      onClick={() => setExpanded(!expanded)}
      className={`${bg} border ${border} rounded-xl px-3 py-2.5 cursor-pointer hover:brightness-110 transition-all`}
    >
      <div className="flex items-start gap-2.5">
        <Icon size={12} style={{ color }} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: `${color}20`, color }}>{item.source}</span>
            {tag && (
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded"
                style={{ background: `${tag.color}15`, color: tag.color }}>{tag.label}</span>
            )}
            <span className="text-[7px] text-gray-700 ml-auto">{item.published}</span>
          </div>
          <p className={`text-[10px] text-gray-300 leading-snug ${!expanded ? "line-clamp-2" : ""}`}>
            {item.title}
          </p>
          {expanded && item.summary && (
            <p className="text-[9px] text-gray-500 mt-1.5 leading-relaxed">{item.summary}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function GeopoliticalImpact() {
  const { data } = useGeoTera();
  const [filter, setFilter] = useState<Sev | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const news = data?.news ?? [];

  const enriched = news.map(item => ({
    item,
    sev: getSeverity(item.title + " " + (item.summary ?? "")) as Sev,
    tag: getTag(item.title + " " + (item.summary ?? "")),
  }));

  const filtered = enriched.filter(e =>
    (!filter || e.sev === filter) &&
    (!tagFilter || e.tag?.label === tagFilter)
  );

  const counts = { HIGH: 0, MED: 0, INFO: 0 } as Record<Sev, number>;
  enriched.forEach(e => counts[e.sev]++);

  const activeTags = [...new Set(enriched.map(e => e.tag?.label).filter(Boolean))];

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <Shield size={14} className="text-[#f43f5e]" />
        <h2 className="text-sm font-black text-white">Geopolitical Economic Impact</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[9px] text-gray-600">{news.length} live events</span>
      </div>

      {/* Impact summary */}
      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        {(["HIGH", "MED", "INFO"] as Sev[]).map(sev => {
          const { color, icon: Icon, label, bg, border } = SEV_META[sev];
          const isActive = filter === sev;
          return (
            <button
              key={sev}
              onClick={() => setFilter(isActive ? null : sev)}
              className={`${isActive ? `${bg} ${border}` : "bg-white/[0.02] border border-white/[0.05]"} border rounded-xl px-3 py-2.5 text-left transition-all hover:brightness-110 flex items-center gap-2.5`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15` }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div>
                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">{label}</p>
                <p className="text-[16px] font-black" style={{ color }}>{counts[sev]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sector tag filters */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Filter by sector:</span>
        {activeTags.map(tag => {
          const meta = SECTOR_TAGS.find(t => t.label === tag);
          const isActive = tagFilter === tag;
          return (
            <button
              key={tag}
              onClick={() => setTagFilter(isActive ? null : tag ?? null)}
              className={`text-[8px] px-2 py-0.5 rounded-full font-bold transition-all border`}
              style={isActive
                ? { background: `${meta?.color}20`, color: meta?.color, borderColor: `${meta?.color}40` }
                : { color: "#6b7280", borderColor: "#1f2937" }}
            >
              {tag}
            </button>
          );
        })}
        {(filter || tagFilter) && (
          <button
            onClick={() => { setFilter(null); setTagFilter(null); }}
            className="text-[8px] px-2 py-0.5 rounded-full border border-gray-700 text-gray-600 hover:text-gray-400"
          >
            ✕ Clear
          </button>
        )}
      </div>

      {/* News feed */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-3">
        {/* High impact events */}
        <div className="overflow-y-auto space-y-2">
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest sticky top-0 bg-[#03060d] pb-1">
            <TrendingDown size={9} className="inline mr-1 text-[#ff3366]" />
            High Impact Events
          </p>
          {filtered.filter(e => !filter || filter === "HIGH" ? e.sev === "HIGH" : false).length === 0 ? (
            <p className="text-[9px] text-gray-700 text-center py-6">
              {filter === "HIGH" ? "No high-impact events" : "Select HIGH filter to see impact events"}
            </p>
          ) : null}
          {filtered
            .filter(e => e.sev === "HIGH")
            .map(({ item, sev, tag }, i) => (
              <NewsCard key={i} item={item} i={i} sev={sev} tag={tag} />
            ))}
        </div>

        {/* All events feed */}
        <div className="overflow-y-auto space-y-2">
          <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest sticky top-0 bg-[#03060d] pb-1">
            Live Event Feed · {filtered.length} events
          </p>
          {filtered.length === 0 && (
            <div className="text-gray-700 text-xs text-center py-8 animate-pulse">No events match filter</div>
          )}
          {filtered.map(({ item, sev, tag }, i) => (
            <NewsCard key={i} item={item} i={i} sev={sev} tag={tag} />
          ))}
        </div>
      </div>

      <p className="text-[8px] text-gray-700 text-center flex-shrink-0">
        Sources: BBC · Reuters · AP · Al Jazeera · severity auto-classified from headline text
      </p>
    </div>
  );
}
