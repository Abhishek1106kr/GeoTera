"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { NewsItem } from "@/lib/useWebSocket";

const BUREAUX = [
  { source: "BBC World",  lat: 51.51,  lng: -0.13,  city: "London",   color: "#ef4444" },
  { source: "Reuters",    lat: 40.71,  lng: -74.01, city: "New York",  color: "#f97316" },
  { source: "AP News",    lat: 40.71,  lng: -73.95, city: "New York",  color: "#3b82f6" },
  { source: "Al Jazeera", lat: 25.29,  lng: 51.52,  city: "Doha",     color: "#fbbf24" },
];

export default function NewsMap({ news }: { news: NewsItem[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;

  const bySource: Record<string, NewsItem[]> = {};
  for (const item of news) {
    if (!bySource[item.source]) bySource[item.source] = [];
    bySource[item.source].push(item);
  }

  return (
    <MapContainer
      center={[25, 10]}
      zoom={2}
      style={{ height: "100%", width: "100%", background: "#03060d" }}
      zoomControl={false}
      attributionControl={false}
      worldCopyJump
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={10}
      />

      {BUREAUX.map((b) => {
        const stories = bySource[b.source] ?? [];
        return (
          <CircleMarker
            key={b.source}
            center={[b.lat, b.lng]}
            radius={14}
            pathOptions={{ color: b.color, fillColor: b.color, fillOpacity: 0.25, weight: 2 }}
          >
            <Popup maxWidth={280}>
              <div className="min-w-[240px] font-sans text-xs space-y-2">
                <p className="font-black text-sm mb-3" style={{ color: b.color }}>
                  📡 {b.source} — {b.city}
                </p>
                {stories.slice(0, 4).map((s, i) => (
                  <a key={i} href={s.link} target="_blank" rel="noopener noreferrer"
                    className="block text-blue-400 hover:text-blue-300 line-clamp-2 leading-snug">
                    {s.title}
                  </a>
                ))}
                {!stories.length && <p className="text-gray-500">No recent stories</p>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
