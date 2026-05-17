"use client";
import { motion } from "framer-motion";
import {
  Globe, TrendingUp, BarChart3, ArrowLeftRight, Flame,
  Shield, Building2, Brain, LayoutGrid, MapPin, Target,
  Star, ChevronLeft, ChevronRight,
} from "lucide-react";
import type { ViewId } from "@/components/eco/types";

const NAV_ITEMS: {
  id: ViewId;
  icon: React.ElementType;
  label: string;
  color: string;
  group?: string;
}[] = [
  { id: "overview",    icon: Globe,          label: "Global Overview",     color: "#00d4ff", group: "EXPLORE" },
  { id: "markets",     icon: TrendingUp,     label: "Financial Markets",   color: "#00ff9d" },
  { id: "macro",       icon: BarChart3,      label: "Macroeconomics",      color: "#f59e0b" },
  { id: "trade",       icon: ArrowLeftRight, label: "Trade & Capital",     color: "#a78bfa", group: "ANALYSIS" },
  { id: "commodities", icon: Flame,          label: "Commodities & Energy",color: "#fb923c" },
  { id: "geo",         icon: Shield,         label: "Geopolitical Impact", color: "#f43f5e" },
  { id: "banking",     icon: Building2,      label: "Banking & Monetary",  color: "#38bdf8", group: "INTELLIGENCE" },
  { id: "ai",          icon: Brain,          label: "AI Forecasting",      color: "#c084fc" },
  { id: "sectors",     icon: LayoutGrid,     label: "Sector Intelligence", color: "#4ade80" },
  { id: "countries",   icon: MapPin,         label: "Country Explorer",    color: "#fbbf24", group: "TOOLS" },
  { id: "risk",        icon: Target,         label: "Risk Radar",          color: "#ef4444" },
  { id: "watchlist",   icon: Star,           label: "Watchlists",          color: "#e879f9" },
];

interface Props {
  activeView: ViewId;
  setActiveView: (v: ViewId) => void;
  expanded: boolean;
  setExpanded: (e: boolean) => void;
}

export default function SideNav({ activeView, setActiveView, expanded, setExpanded }: Props) {
  return (
    <motion.aside
      animate={{ width: expanded ? 220 : 60 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="flex-shrink-0 bg-[#030810] border-r border-white/[0.05] flex flex-col overflow-hidden"
    >
      {/* Toggle */}
      <div className="flex items-center justify-between px-2 py-2.5 border-b border-white/[0.04]">
        {expanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[8px] font-black text-[#00d4ff] tracking-[3px] uppercase pl-2 whitespace-nowrap overflow-hidden"
          >
            GeoTera Eco
          </motion.span>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto p-1.5 rounded-lg text-gray-600 hover:text-[#00d4ff] hover:bg-[#00d4ff]/8 transition-all flex-shrink-0"
        >
          {expanded ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {NAV_ITEMS.map((item, i) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <div key={item.id}>
              {/* Group label */}
              {item.group && expanded && (
                <div className="px-4 pt-3 pb-1">
                  <span className="text-[8px] font-bold text-gray-700 tracking-widest uppercase">
                    {item.group}
                  </span>
                </div>
              )}
              {item.group && !expanded && i > 0 && (
                <div className="h-px bg-white/[0.04] mx-3 my-1.5" />
              )}

              <motion.button
                onClick={() => setActiveView(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                title={!expanded ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 mx-1 rounded-xl transition-all relative
                  ${isActive
                    ? "bg-white/[0.06]"
                    : "hover:bg-white/[0.03] text-gray-500 hover:text-gray-300"
                  }`}
                style={{ width: "calc(100% - 8px)" }}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
                    style={{ background: item.color }}
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all
                    ${isActive ? "shadow-lg" : ""}`}
                  style={{
                    background: isActive ? `${item.color}18` : "transparent",
                    color: isActive ? item.color : undefined,
                    boxShadow: isActive ? `0 0 12px ${item.color}30` : undefined,
                  }}
                >
                  <Icon size={14} />
                </div>

                {/* Label */}
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`text-[11px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis
                      ${isActive ? "text-white" : ""}`}
                    style={{ color: isActive ? item.color : undefined }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            </div>
          );
        })}
      </nav>

      {/* Bottom label */}
      {expanded && (
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <p className="text-[8px] text-gray-700 leading-relaxed">
            Real-time global economic intelligence. Data refreshes every 15 minutes.
          </p>
        </div>
      )}
    </motion.aside>
  );
}
