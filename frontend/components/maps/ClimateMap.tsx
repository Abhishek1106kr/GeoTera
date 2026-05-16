"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import type { ClimateData } from "@/lib/useWebSocket";

const WMO_ICON: Record<number, string> = {
  0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",51:"🌦️",61:"🌧️",63:"🌧️",
  65:"🌧️",71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",95:"⛈️",
};

function tempColor(c: number | null): string {
  if (c == null) return "#6b7280";
  if (c >= 35) return "#ef4444";
  if (c >= 25) return "#f97316";
  if (c >= 15) return "#eab308";
  if (c >= 5)  return "#22d3ee";
  return "#818cf8";
}

function magColor(m: number | null): string {
  if (m == null) return "#6b7280";
  if (m >= 7) return "#ef4444";
  if (m >= 5) return "#f97316";
  return "#eab308";
}

export default function ClimateMap({ climate }: { climate: ClimateData | null }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  if (!ready) return null;

  const cities = climate?.weather ?? [];
  const quakes = (climate?.earthquakes ?? []).filter((e) => e.lat != null && e.lon != null);

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

      {/* Weather city markers */}
      {cities.map((w) => (
        <CircleMarker
          key={w.city}
          center={[w.lat, w.lon]}
          radius={9}
          pathOptions={{ color: tempColor(w.temp_c), fillColor: tempColor(w.temp_c), fillOpacity: 0.8, weight: 1.5 }}
        >
          <Tooltip direction="top" offset={[0, -8]} permanent={false}>
            <span className="font-sans text-xs">
              {WMO_ICON[w.weather_code ?? 0] ?? "🌡️"} {w.city} {w.temp_c != null ? `${w.temp_c.toFixed(0)}°C` : ""}
            </span>
          </Tooltip>
          <Popup>
            <div className="min-w-[160px] text-xs font-sans space-y-1">
              <p className="font-bold text-base mb-2">{WMO_ICON[w.weather_code ?? 0]} {w.city}</p>
              <p>🌡️ <b>{w.temp_c?.toFixed(1)}°C</b></p>
              <p>💧 Humidity: {w.humidity ?? "—"}%</p>
              <p>💨 Wind: {w.wind_kph?.toFixed(0)} km/h</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {/* Earthquake markers */}
      {quakes.map((eq, i) => (
        <CircleMarker
          key={i}
          center={[eq.lat!, eq.lon!]}
          radius={5 + (eq.magnitude ?? 1) * 2}
          pathOptions={{ color: magColor(eq.magnitude), fillColor: magColor(eq.magnitude), fillOpacity: 0.55, weight: 1 }}
        >
          <Popup>
            <div className="text-xs font-sans space-y-1">
              <p className="font-bold">🌍 {eq.place}</p>
              <p>Magnitude: <b>M{eq.magnitude?.toFixed(1)}</b></p>
              <p>Depth: {eq.depth_km?.toFixed(0)} km</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
