"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { PopulationData } from "@/lib/useWebSocket";

const REGION_COLOR: Record<string, string> = {
  Asia: "#22d3ee", Europe: "#34d399", Africa: "#fb923c",
  Americas: "#a78bfa", Oceania: "#f472b6",
};

// Approximate capital coords for top countries
const CAP_COORDS: Record<string, [number, number]> = {
  China: [39.9, 116.4], India: [28.6, 77.2], "United States": [38.9, -77.0],
  Indonesia: [-6.2, 106.8], Pakistan: [33.7, 73.1], Brazil: [-15.8, -47.9],
  Nigeria: [9.1, 7.5], Bangladesh: [23.7, 90.4], Russia: [55.75, 37.6],
  Ethiopia: [9.0, 38.7], Mexico: [19.4, -99.1], Japan: [35.7, 139.7],
  Philippines: [14.6, 120.9], Egypt: [30.1, 31.2], "DR Congo": [-4.3, 15.3],
  Vietnam: [21.0, 105.8], Iran: [35.7, 51.4], Turkey: [39.9, 32.9],
  Germany: [52.5, 13.4], Thailand: [13.75, 100.5],
  "United Kingdom": [51.5, -0.1], France: [48.9, 2.3], Tanzania: [-6.8, 39.3],
  "South Africa": [-25.7, 28.2], Kenya: [-1.3, 36.8], Colombia: [4.7, -74.1],
  Myanmar: [19.8, 96.1], Argentina: [-34.6, -58.4], Algeria: [36.8, 3.1],
  Sudan: [15.6, 32.5], Uganda: [0.3, 32.6], Iraq: [33.3, 44.4],
  Ukraine: [50.4, 30.5], Canada: [45.4, -75.7], Morocco: [34.0, -6.8],
  "Saudi Arabia": [24.7, 46.7], Uzbekistan: [41.3, 69.3], Peru: [-12.1, -77.0],
  Malaysia: [3.1, 101.7], Afghanistan: [34.5, 69.2], Ghana: [5.6, -0.2],
  "Ivory Coast": [6.8, -5.3], Nepal: [27.7, 85.3], Australia: [-35.3, 149.1],
  Venezuela: [10.5, -66.9], Mozambique: [-25.9, 32.6], Cameroon: [3.9, 11.5],
};

export default function PopulationMap({ population }: { population: PopulationData | null }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;

  const countries = population?.countries ?? [];
  const maxPop = Math.max(...countries.map((c) => c.population));

  return (
    <MapContainer
      center={[20, 10]}
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

      {countries.slice(0, 50).map((c) => {
        const coord = CAP_COORDS[c.name];
        if (!coord) return null;
        const ratio = Math.sqrt(c.population / maxPop);
        const radius = Math.max(5, ratio * 30);
        const color = REGION_COLOR[c.region] ?? "#6b7280";

        return (
          <CircleMarker
            key={c.name}
            center={coord}
            radius={radius}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 1 }}
          >
            <Popup>
              <div className="text-xs font-sans space-y-1 min-w-[160px]">
                <p className="font-black text-sm mb-2">
                  {c.flag && <img src={c.flag} className="inline w-5 mr-1.5 rounded-sm align-middle" alt="" />}
                  {c.name}
                </p>
                <p>👥 {c.population.toLocaleString()}</p>
                <p>🌍 {c.region}</p>
                <p>🏛️ {c.capital}</p>
                {c.area_km2 > 0 && <p>📏 {c.area_km2.toLocaleString()} km²</p>}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
