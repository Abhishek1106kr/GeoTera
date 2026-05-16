"use client";
import { NewsItem } from "@/lib/useWebSocket";
import { ExternalLink } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  "BBC World": "bg-red-700",
  "Reuters": "bg-orange-600",
  "AP News": "bg-blue-700",
  "Al Jazeera": "bg-yellow-700",
};

export default function NewsWidget({ news }: { news: NewsItem[] }) {
  if (!news.length) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
        Fetching news...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
      {news.map((item, i) => (
        <a
          key={i}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-lg p-3 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${SOURCE_COLORS[item.source] ?? "bg-gray-700"}`}>
              {item.source}
            </span>
            <ExternalLink size={12} className="text-gray-600 group-hover:text-gray-400 mt-0.5 flex-shrink-0" />
          </div>
          <p className="text-sm font-semibold text-gray-200 leading-snug line-clamp-2 mb-1">
            {item.title}
          </p>
          {item.summary && (
            <p className="text-xs text-gray-500 line-clamp-2">{item.summary.replace(/<[^>]*>/g, "")}</p>
          )}
        </a>
      ))}
    </div>
  );
}
