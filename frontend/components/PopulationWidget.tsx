"use client";
import { PopulationData } from "@/lib/useWebSocket";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmtPop(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const REGION_COLORS: Record<string, string> = {
  Asia: "#60a5fa",
  Europe: "#34d399",
  Africa: "#fb923c",
  Americas: "#a78bfa",
  Oceania: "#f472b6",
};

export default function PopulationWidget({ population }: { population: PopulationData | null }) {
  if (!population) {
    return <div className="text-gray-600 text-sm text-center py-8">Fetching population data...</div>;
  }

  const top10 = population.countries.slice(0, 10).map((c) => ({
    name: c.name.length > 8 ? c.name.slice(0, 8) + "…" : c.name,
    fullName: c.name,
    population: c.population,
    region: c.region,
    flag: c.flag,
    pop_m: +(c.population / 1_000_000).toFixed(1),
  }));

  return (
    <div className="space-y-6">
      {/* World Population Counter */}
      {population.world_population != null && (
        <div className="bg-blue-950 border border-blue-800 rounded-xl px-5 py-4 text-center">
          <p className="text-xs text-blue-400 uppercase tracking-widest font-bold mb-1">World Population</p>
          <p className="text-4xl font-bold text-white tabular-nums">
            {population.world_population.toLocaleString()}
          </p>
        </div>
      )}

      {/* Top 10 Bar Chart */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Top 10 by Population</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={top10} layout="vertical" margin={{ left: 8, right: 40, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={72} tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
                    <p className="font-bold text-white">{d.fullName}</p>
                    <p className="text-gray-400">{fmtPop(d.population)}</p>
                    <p className="text-gray-500">{d.region}</p>
                  </div>
                );
              }}
            />
            <Bar dataKey="pop_m" radius={[0, 4, 4, 0]}>
              {top10.map((entry, index) => (
                <Cell key={index} fill={REGION_COLORS[entry.region] ?? "#6b7280"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Health Stats */}
      {population.health?.global_life_expectancy && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">🏥</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest">Global Life Expectancy (WHO)</p>
            <p className="text-xl font-bold text-white">{population.health.global_life_expectancy.toFixed(1)} years</p>
          </div>
        </div>
      )}
    </div>
  );
}
