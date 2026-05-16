"use client";
import { useState } from "react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line, ReferenceLine,
} from "recharts";

type Tab = "indices" | "forex" | "commodities" | "radar";

const TABS: { id: Tab; label: string }[] = [
  { id: "indices",     label: "Indices" },
  { id: "forex",       label: "Forex" },
  { id: "commodities", label: "Commodities" },
  { id: "radar",       label: "Overview" },
];

function EcoTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#03060d] border border-[#00d4ff]/20 rounded-xl px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-mono font-bold" style={{ color: p.color ?? "#00d4ff" }}>
          {p.name}: {typeof p.value === "number" ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
}

export default function ChartPanel() {
  const { data } = useGeoTera();
  const [tab, setTab] = useState<Tab>("indices");
  const eco = data?.economy;

  const indicesData = (eco?.indices ?? []).map((m) => ({
    name: m.name.replace(" ", "\n"),
    change: m.change_pct ?? 0,
  }));

  const forexData = Object.entries(eco?.forex ?? {}).map(([cur, rate]) => ({
    name: cur,
    rate: rate as number,
  }));

  const commData = (eco?.commodities ?? []).map((m) => ({
    name: m.name,
    price: m.price ?? 0,
    change: m.change_pct ?? 0,
  }));

  const radarData = [
    { subject: "Stocks", value: Math.min(100, Math.max(0, 50 + ((eco?.indices?.[0]?.change_pct ?? 0) * 5))) },
    { subject: "Crypto",  value: Math.min(100, Math.max(0, 50 + ((eco?.crypto?.[0]?.change_pct ?? 0) * 3))) },
    { subject: "Gold",    value: Math.min(100, Math.max(0, 50 + ((eco?.commodities?.find(c => c.name === "Gold")?.change_pct ?? 0) * 8))) },
    { subject: "Oil",     value: Math.min(100, Math.max(0, 50 + ((eco?.commodities?.find(c => c.name === "Crude Oil")?.change_pct ?? 0) * 6))) },
    { subject: "USD",     value: 60 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-1 mb-3 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              tab === t.id
                ? "bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/30"
                : "text-gray-600 hover:text-gray-400 border border-transparent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="flex-1 min-h-0">
        {tab === "indices" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={indicesData} margin={{ left: -10, right: 5, top: 5, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<EcoTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Bar dataKey="change" name="Change %" radius={[4, 4, 0, 0]}>
                {indicesData.map((d, i) => (
                  <Cell key={i} fill={d.change >= 0 ? "#00ff9d" : "#ff3366"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === "forex" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={forexData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={40} tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<EcoTooltip />} />
              <Bar dataKey="rate" name="Rate" radius={[0, 4, 4, 0]}>
                {forexData.map((_, i) => (
                  <Cell key={i} fill="#00d4ff" fillOpacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === "commodities" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={commData} margin={{ left: -10, right: 5, top: 5, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4b5563", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<EcoTooltip />} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Bar dataKey="change" name="Change %" radius={[4, 4, 0, 0]}>
                {commData.map((d, i) => (
                  <Cell key={i} fill={d.change >= 0 ? "#ffd700" : "#f97316"} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === "radar" && (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 10 }} />
              <Radar name="Sentiment" dataKey="value" stroke="#00d4ff" fill="#00d4ff" fillOpacity={0.15} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
