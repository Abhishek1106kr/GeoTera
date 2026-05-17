"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useGeoTera } from "@/lib/GeoTeraContext";
import { ArrowLeftRight } from "lucide-react";

const NODES: { id: string; label: string; flag: string; x: number; y: number; color: string }[] = [
  { id: "US", label: "United States", flag: "🇺🇸", x: 0.18, y: 0.38, color: "#00d4ff" },
  { id: "EU", label: "Eurozone",      flag: "🇪🇺", x: 0.48, y: 0.28, color: "#a78bfa" },
  { id: "CN", label: "China",         flag: "🇨🇳", x: 0.78, y: 0.35, color: "#f59e0b" },
  { id: "JP", label: "Japan",         flag: "🇯🇵", x: 0.82, y: 0.50, color: "#38bdf8" },
  { id: "IN", label: "India",         flag: "🇮🇳", x: 0.65, y: 0.52, color: "#fb923c" },
  { id: "GB", label: "United Kingdom",flag: "🇬🇧", x: 0.42, y: 0.22, color: "#00ff9d" },
];

const FLOWS = [
  { from: "US", to: "CN", value: 536, label: "$536B", color: "#f59e0b" },
  { from: "US", to: "EU", value: 820, label: "$820B", color: "#a78bfa" },
  { from: "CN", to: "EU", value: 740, label: "$740B", color: "#6366f1" },
  { from: "CN", to: "JP", value: 360, label: "$360B", color: "#38bdf8" },
  { from: "US", to: "GB", value: 280, label: "$280B", color: "#00ff9d" },
  { from: "IN", to: "US", value: 150, label: "$150B", color: "#fb923c" },
  { from: "EU", to: "GB", value: 410, label: "$410B", color: "#94a3b8" },
  { from: "CN", to: "IN", value: 100, label: "$100B", color: "#f43f5e" },
];

const STATS = [
  { label: "Global Trade Volume",   value: "$28.5T",  sub: "Annual merchandise trade",    color: "#00d4ff" },
  { label: "US Trade Deficit",      value: "-$773B",  sub: "12-month rolling deficit",     color: "#ff3366" },
  { label: "China Surplus",         value: "+$878B",  sub: "Largest trade surplus nation", color: "#f59e0b" },
  { label: "EU Trade Balance",      value: "+$290B",  sub: "Goods & services combined",    color: "#a78bfa" },
  { label: "Shipping Cost Index",   value: "1,842",   sub: "Baltic Dry Index (approx)",    color: "#38bdf8" },
  { label: "FDI Global Flows",      value: "$1.37T",  sub: "Foreign direct investment",    color: "#00ff9d" },
];

function AnimatedFlow({ from, to, value, color, svgW, svgH, active }: {
  from: typeof NODES[0]; to: typeof NODES[0]; value: number; color: string; svgW: number; svgH: number; active: boolean;
}) {
  const x1 = from.x * svgW, y1 = from.y * svgH;
  const x2 = to.x * svgW,   y2 = to.y * svgH;
  const mx  = (x1 + x2) / 2, my = (y1 + y2) / 2 - 30;
  const d   = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
  const sw  = Math.max(1, Math.min(4, value / 200));
  const id  = `flow-${from.id}-${to.id}`;

  return (
    <g opacity={active ? 1 : 0.25}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={from.color} stopOpacity={0.6} />
          <stop offset="100%" stopColor={to.color} stopOpacity={0.6} />
        </linearGradient>
      </defs>
      {/* Static path */}
      <path d={d} fill="none" stroke={`url(#grad-${id})`} strokeWidth={sw} strokeOpacity={0.3} strokeDasharray="4 6" />
      {/* Animated dot */}
      <circle r="4" fill={color} opacity={0.9} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
        <animateMotion dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" path={d} />
      </circle>
    </g>
  );
}

export default function TradeFlow() {
  const { data }   = useGeoTera();
  const wb         = data?.worldbank?.countries ?? {};
  const svgRef     = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ w: 600, h: 300 });
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    if (svgRef.current) obs.observe(svgRef.current.parentElement!);
    return () => obs.disconnect();
  }, []);

  const activeFlows = selected
    ? FLOWS.filter(f => f.from === selected || f.to === selected)
    : FLOWS;

  return (
    <div className="h-full flex flex-col overflow-hidden p-3 gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <ArrowLeftRight size={14} className="text-[#a78bfa]" />
        <h2 className="text-sm font-black text-white">Trade & Capital Flow</h2>
        <div className="flex-1 h-px bg-white/[0.04]" />
        <span className="text-[9px] text-gray-600">Click a node to filter flows</span>
      </div>

      {/* Main grid */}
      <div className="flex-1 min-h-0 grid grid-cols-3 gap-3">

        {/* Flow visualization */}
        <div className="col-span-2 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden relative">
          {/* Background grid */}
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(rgba(0,212,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }} />

          <div className="absolute inset-0">
            <svg ref={svgRef} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              {/* Flows */}
              {FLOWS.map(flow => {
                const fromNode = NODES.find(n => n.id === flow.from)!;
                const toNode   = NODES.find(n => n.id === flow.to)!;
                const isActive = !selected || flow.from === selected || flow.to === selected;
                return (
                  <AnimatedFlow
                    key={`${flow.from}-${flow.to}`}
                    from={fromNode} to={toNode}
                    value={flow.value} color={flow.color}
                    svgW={dims.w} svgH={dims.h}
                    active={isActive}
                  />
                );
              })}

              {/* Nodes */}
              {NODES.map(node => {
                const cx = node.x * dims.w, cy = node.y * dims.h;
                const isSelected = selected === node.id;
                const gdp = wb[node.id]?.gdp_growth;
                return (
                  <g key={node.id} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === node.id ? null : node.id)}>
                    {/* Glow ring */}
                    <circle cx={cx} cy={cy} r={isSelected ? 24 : 18} fill={node.color}
                      opacity={isSelected ? 0.15 : 0.05} />
                    <circle cx={cx} cy={cy} r={isSelected ? 16 : 12} fill={node.color}
                      opacity={isSelected ? 0.25 : 0.08}
                      style={{ filter: isSelected ? `drop-shadow(0 0 12px ${node.color})` : undefined }} />

                    {/* Node dot */}
                    <circle cx={cx} cy={cy} r={8} fill={node.color} opacity={0.85}
                      style={{ filter: `drop-shadow(0 0 6px ${node.color}cc)` }} />

                    {/* Flag label */}
                    <text x={cx} y={cy + 26} textAnchor="middle" fontSize={10} fill="white" fontWeight="700">
                      {node.flag} {node.id}
                    </text>

                    {/* GDP annotation */}
                    {gdp != null && (
                      <text x={cx} y={cy + 38} textAnchor="middle" fontSize={8}
                        fill={gdp >= 0 ? "#00ff9d" : "#ff3366"}>
                        {gdp >= 0 ? "▲" : "▼"} {Math.abs(gdp).toFixed(1)}%
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[8px] text-gray-600">
              <div className="w-8 h-px border-t-2 border-dashed border-gray-600" />
              Trade route
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-gray-600">
              <div className="w-2 h-2 rounded-full bg-[#00d4ff]" />
              Capital node
            </div>
          </div>
        </div>

        {/* Right: stats + trade flows list */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {/* Flow list */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden flex-shrink-0">
            <div className="px-3 py-2 border-b border-white/[0.04]">
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Trade Corridors</p>
            </div>
            {FLOWS.map((flow, i) => {
              const isActive = !selected || flow.from === selected || flow.to === selected;
              return (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 border-b border-white/[0.03] transition-all ${!isActive ? "opacity-30" : ""}`}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: flow.color }} />
                  <span className="text-[9px] font-bold text-white flex-1">
                    {NODES.find(n => n.id === flow.from)?.flag} {flow.from} → {NODES.find(n => n.id === flow.to)?.flag} {flow.to}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: flow.color }}>{flow.label}</span>
                </div>
              );
            })}
          </div>

          {/* Stats grid */}
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2.5 flex-shrink-0"
            >
              <p className="text-[8px] text-gray-600 uppercase tracking-widest font-bold">{stat.label}</p>
              <p className="text-[13px] font-black font-mono mt-0.5" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[8px] text-gray-700">{stat.sub}</p>
            </motion.div>
          ))}

          <p className="text-[8px] text-gray-700 text-center flex-shrink-0">
            Trade data: approximate annual estimates · World Bank sourced
          </p>
        </div>
      </div>
    </div>
  );
}
