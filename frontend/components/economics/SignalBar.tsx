"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { AlertTriangle, TrendingUp, Zap } from "lucide-react";

interface Signal {
  icon: "up" | "down" | "alert";
  label: string;
  value: string;
  color: string;
}

export default function SignalBar() {
  const { data } = useGeoTera();
  const eco = data?.economy;
  const signals: Signal[] = [];

  const all = [
    ...(eco?.indices ?? []),
    ...(eco?.crypto ?? []),
    ...(eco?.commodities ?? []),
  ];

  for (const m of all) {
    if (m.change_pct == null) continue;
    if (m.change_pct >= 3) {
      signals.push({ icon: "up", label: m.name, value: `+${m.change_pct.toFixed(2)}%`, color: "text-[#00ff9d]" });
    } else if (m.change_pct <= -2.5) {
      signals.push({ icon: "down", label: m.name, value: `${m.change_pct.toFixed(2)}%`, color: "text-[#ff3366]" });
    }
  }

  if (!signals.length) {
    signals.push({ icon: "alert", label: "Markets calm", value: "No major moves", color: "text-gray-500" });
  }

  const iconMap = {
    up: <TrendingUp size={11} className="text-[#00ff9d]" />,
    down: <AlertTriangle size={11} className="text-[#ff3366]" />,
    alert: <Zap size={11} className="text-yellow-500" />,
  };

  return (
    <div className="flex items-center gap-3 px-6 py-2 bg-[#030810]/80 border-b border-[#00d4ff]/8 overflow-x-auto scrollbar-thin">
      <span className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest flex-shrink-0 flex items-center gap-1.5">
        <Zap size={10} className="animate-pulse" /> Signals
      </span>
      <div className="flex gap-4 items-center">
        {signals.map((s, i) => (
          <span key={i} className="flex items-center gap-1.5 whitespace-nowrap">
            {iconMap[s.icon]}
            <span className="text-xs text-gray-500">{s.label}</span>
            <span className={`text-xs font-bold font-mono ${s.color}`}>{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
