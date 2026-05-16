"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import PageHero from "@/components/PageHero";
import { ExternalLink, Search } from "lucide-react";

const NewsMap = dynamic(() => import("@/components/maps/NewsMap"), { ssr: false });

const SOURCE_COLORS: Record<string, string> = {
  "BBC World": "bg-red-700/80 text-red-200",
  "Reuters": "bg-orange-700/80 text-orange-200",
  "AP News": "bg-blue-700/80 text-blue-200",
  "Al Jazeera": "bg-amber-700/80 text-amber-200",
};

const SOURCES = ["All", "BBC World", "Reuters", "AP News", "Al Jazeera"];

export default function NewsPage() {
  const { data } = useGeoTera();
  const [activeSource, setActiveSource] = useState("All");
  const [search, setSearch] = useState("");

  const news = (data?.news ?? []).filter((item) => {
    const matchSource = activeSource === "All" || item.source === activeSource;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
    return matchSource && matchSearch;
  });

  return (
    <div className="min-h-screen">
      <PageHero
        tag="Live Feed"
        title="World News"
        subtitle="Real-time headlines from BBC, Reuters, AP News, and Al Jazeera — auto-refreshed every 15 minutes."
        gradient="from-blue-400 to-indigo-500"
      />

      <div className="max-w-screen-xl mx-auto px-6 pb-20">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-10">
          {/* Source tabs */}
          <div className="flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSource(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeSource === s
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    : "bg-white/[0.03] text-gray-500 border border-white/10 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px] sm:max-w-xs ml-auto">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search headlines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 focus:border-blue-500/40 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-300 placeholder-gray-700 outline-none transition-colors"
            />
          </div>
        </div>

        {/* News Bureau Map */}
        <div className="mb-10 rounded-2xl overflow-hidden border border-white/10" style={{height:"300px"}}>
          <NewsMap news={data?.news ?? []} />
        </div>

        {/* Grid */}
        {news.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-gray-700 text-sm">
            {data?.news?.length ? "No results match your filter." : "Fetching news..."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all hover:-translate-y-1 duration-200 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${SOURCE_COLORS[item.source] ?? "bg-gray-700/80 text-gray-300"}`}>
                    {item.source}
                  </span>
                  <ExternalLink size={13} className="text-gray-700 group-hover:text-gray-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-gray-200 group-hover:text-white transition-colors leading-snug mb-3 flex-1 line-clamp-3">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-auto">
                    {item.summary.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
