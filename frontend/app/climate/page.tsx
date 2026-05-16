"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import PageHero from "@/components/PageHero";

const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  61: { label: "Slight rain", icon: "🌧️" },
  63: { label: "Moderate rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Slight snow", icon: "🌨️" },
  73: { label: "Moderate snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
};

function magColor(mag: number | null) {
  if (mag == null) return "text-gray-600";
  if (mag >= 7) return "text-red-500";
  if (mag >= 5) return "text-orange-400";
  if (mag >= 3) return "text-yellow-400";
  return "text-green-400";
}

function magBg(mag: number | null) {
  if (mag == null) return "bg-gray-800/50";
  if (mag >= 7) return "bg-red-500/10 border-red-500/20";
  if (mag >= 5) return "bg-orange-500/10 border-orange-500/20";
  if (mag >= 3) return "bg-yellow-500/10 border-yellow-500/20";
  return "bg-emerald-500/10 border-emerald-500/20";
}

export default function ClimatePage() {
  const { data } = useGeoTera();
  const climate = data?.climate;

  return (
    <div className="min-h-screen">
      <PageHero
        tag="Earth Systems"
        title="Climate & Environment"
        subtitle="Live weather across major cities, significant earthquake activity, and atmospheric CO₂ measurements from Mauna Loa."
        gradient="from-orange-400 to-red-500"
      />

      <div className="max-w-screen-xl mx-auto px-6 pb-20 space-y-16">
        {/* CO2 Banner */}
        {climate?.co2_ppm != null && (
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-800/40 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl">🌍</div>
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Atmospheric CO₂ — Mauna Loa Observatory, NOAA</p>
              <p className="text-5xl font-black text-white tabular-nums">
                {climate.co2_ppm.toFixed(2)}
                <span className="text-2xl text-gray-400 font-normal ml-2">ppm</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">Pre-industrial baseline: ~280 ppm</p>
            </div>
            <div className="md:ml-auto text-center">
              <div className="text-3xl font-black text-orange-400">+{((climate.co2_ppm - 280) / 280 * 100).toFixed(1)}%</div>
              <p className="text-xs text-gray-600">above pre-industrial</p>
            </div>
          </div>
        )}

        {/* City Weather */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-sky-400 to-blue-600" />
            City Weather
          </h2>
          {climate?.weather?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {climate.weather.map((w) => {
                const wmo = w.weather_code != null ? WMO[w.weather_code] : null;
                return (
                  <div key={w.city} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-center hover:border-white/20 transition-all">
                    <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">{w.city}</p>
                    <div className="text-4xl mb-2">{wmo?.icon ?? "🌡️"}</div>
                    <p className="text-2xl font-black text-white mb-1">
                      {w.temp_c != null ? `${w.temp_c.toFixed(0)}°C` : "—"}
                    </p>
                    <p className="text-xs text-gray-600">{wmo?.label ?? ""}</p>
                    {w.humidity != null && (
                      <p className="text-xs text-gray-700 mt-1">💧 {w.humidity}% · 💨 {w.wind_kph?.toFixed(0)} km/h</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-36 flex items-center justify-center text-gray-700 bg-white/[0.02] border border-white/5 rounded-2xl text-sm">Fetching weather...</div>
          )}
        </section>

        {/* Earthquakes */}
        <section>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-orange-400 to-red-600" />
            Significant Earthquakes — Past 7 Days
          </h2>
          {!climate?.earthquakes?.length ? (
            <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-2xl p-8 text-center">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-gray-400 font-semibold">No significant earthquakes this week</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {climate.earthquakes.map((eq, i) => (
                <div key={i} className={`flex items-center gap-4 border rounded-2xl p-5 transition-all ${magBg(eq.magnitude)}`}>
                  <div className="text-center flex-shrink-0 w-16">
                    <p className={`text-3xl font-black ${magColor(eq.magnitude)}`}>
                      M{eq.magnitude?.toFixed(1) ?? "?"}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-200 truncate">{eq.place}</p>
                    {eq.depth_km != null && (
                      <p className="text-xs text-gray-600 mt-0.5">Depth: {eq.depth_km.toFixed(0)} km</p>
                    )}
                    {eq.time && (
                      <p className="text-xs text-gray-700 mt-0.5">{new Date(eq.time).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
