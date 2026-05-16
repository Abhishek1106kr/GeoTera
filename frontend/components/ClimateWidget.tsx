"use client";
import { ClimateData } from "@/lib/useWebSocket";

const WMO_ICONS: Record<number, string> = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️",
  45: "🌫️", 48: "🌫️", 51: "🌦️", 53: "🌦️", 55: "🌧️",
  61: "🌧️", 63: "🌧️", 65: "🌧️", 71: "🌨️", 73: "❄️", 75: "❄️",
  80: "🌦️", 81: "🌧️", 82: "⛈️", 95: "⛈️", 96: "⛈️", 99: "⛈️",
};

function weatherIcon(code: number | null): string {
  if (code == null) return "🌡️";
  return WMO_ICONS[code] ?? "🌡️";
}

function magColor(mag: number | null): string {
  if (mag == null) return "text-gray-500";
  if (mag >= 7) return "text-red-500";
  if (mag >= 5) return "text-orange-400";
  if (mag >= 3) return "text-yellow-400";
  return "text-green-400";
}

export default function ClimateWidget({ climate }: { climate: ClimateData | null }) {
  if (!climate) {
    return <div className="text-gray-600 text-sm text-center py-8">Fetching climate data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* CO2 Banner */}
      {climate.co2_ppm != null && (
        <div className="flex items-center gap-3 bg-emerald-950 border border-emerald-800 rounded-xl px-4 py-3">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-bold">Atmospheric CO₂ (Mauna Loa)</p>
            <p className="text-xl font-bold text-white">{climate.co2_ppm.toFixed(2)} <span className="text-sm text-gray-400">ppm</span></p>
          </div>
        </div>
      )}

      {/* City Weather Grid */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">City Weather</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {climate.weather.map((w) => (
            <div key={w.city} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500 mb-1">{w.city}</p>
              <p className="text-2xl">{weatherIcon(w.weather_code)}</p>
              <p className="text-lg font-bold text-white">
                {w.temp_c != null ? `${w.temp_c.toFixed(0)}°C` : "—"}
              </p>
              <p className="text-xs text-gray-600">{w.humidity != null ? `${w.humidity}% 💧` : ""}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earthquakes */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
          Significant Earthquakes (past 7 days)
        </h3>
        {climate.earthquakes.length === 0 ? (
          <p className="text-sm text-gray-600">No significant earthquakes this week.</p>
        ) : (
          <div className="space-y-2">
            {climate.earthquakes.map((eq, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 truncate">{eq.place}</p>
                  {eq.depth_km != null && (
                    <p className="text-xs text-gray-600">Depth: {eq.depth_km.toFixed(0)} km</p>
                  )}
                </div>
                <span className={`text-lg font-bold ml-3 flex-shrink-0 ${magColor(eq.magnitude)}`}>
                  M{eq.magnitude?.toFixed(1) ?? "?"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
