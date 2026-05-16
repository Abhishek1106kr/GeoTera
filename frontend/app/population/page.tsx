"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import PageHero from "@/components/PageHero";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function fmtPop(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

const REGION_COLORS: Record<string, string> = {
  Asia: "#22d3ee",
  Europe: "#34d399",
  Africa: "#fb923c",
  Americas: "#a78bfa",
  Oceania: "#f472b6",
};

const REGION_BG: Record<string, string> = {
  Asia: "bg-cyan-500/10 text-cyan-400",
  Europe: "bg-emerald-500/10 text-emerald-400",
  Africa: "bg-orange-500/10 text-orange-400",
  Americas: "bg-violet-500/10 text-violet-400",
  Oceania: "bg-pink-500/10 text-pink-400",
};

export default function PopulationPage() {
  const { data } = useGeoTera();
  const pop = data?.population;

  const top10 = (pop?.countries ?? []).slice(0, 10).map((c) => ({
    name: c.name.length > 10 ? c.name.slice(0, 9) + "…" : c.name,
    fullName: c.name,
    population: c.population,
    region: c.region,
    flag: c.flag,
    pop_m: +(c.population / 1_000_000).toFixed(1),
  }));

  const byRegion = (pop?.countries ?? []).reduce<Record<string, number>>((acc, c) => {
    acc[c.region] = (acc[c.region] ?? 0) + c.population;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">
      <PageHero
        tag="Demographics"
        title="Population & People"
        subtitle="Live world population counter, top countries by size, regional breakdowns, and global health indicators from WHO."
        gradient="from-violet-400 to-purple-600"
      />

      <div className="max-w-screen-xl mx-auto px-6 pb-20 space-y-16">
        {/* World Population */}
        {pop?.world_population && (
          <div className="bg-gradient-to-r from-blue-950 to-violet-950 border border-violet-800/30 rounded-3xl p-10 text-center">
            <p className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-4">Live World Population</p>
            <p className="text-6xl md:text-7xl font-black text-white tabular-nums">
              {pop.world_population.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm mt-3">Source: REST Countries API</p>
          </div>
        )}

        {/* Region Breakdown */}
        {Object.keys(byRegion).length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-violet-400 to-purple-600" />
              Population by Region
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(byRegion)
                .sort(([, a], [, b]) => b - a)
                .map(([region, pop]) => (
                  <div key={region} className={`border rounded-2xl p-5 text-center ${REGION_BG[region] ?? "bg-white/5 text-gray-400"} border-white/10`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-70">{region}</p>
                    <p className="text-2xl font-black">{fmtPop(pop)}</p>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Top 10 Bar Chart */}
        {top10.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-cyan-400 to-blue-600" />
              Top 10 Countries
            </h2>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={top10} layout="vertical" margin={{ left: 0, right: 60, top: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-gray-900 border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
                          <p className="font-bold text-white mb-1">{d.flag && <img src={d.flag} className="inline w-4 mr-1.5 rounded-sm" alt="" />}{d.fullName}</p>
                          <p className="text-gray-400">{fmtPop(d.population)}</p>
                          <p className="text-gray-600">{d.region}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="pop_m" radius={[0, 6, 6, 0]}>
                    {top10.map((entry, i) => (
                      <Cell key={i} fill={REGION_COLORS[entry.region] ?? "#6b7280"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Health */}
        {pop?.health?.global_life_expectancy && (
          <section>
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-emerald-400 to-teal-600" />
              Global Health (WHO)
            </h2>
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 flex items-center gap-6">
              <span className="text-5xl">🏥</span>
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Global Life Expectancy</p>
                <p className="text-4xl font-black text-white">{pop.health.global_life_expectancy.toFixed(1)} <span className="text-gray-500 text-xl font-normal">years</span></p>
                <p className="text-xs text-gray-700 mt-1">WHO Global Health Observatory, 2019 baseline</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
