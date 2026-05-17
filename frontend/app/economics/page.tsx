"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import type { ViewId } from "@/components/eco/types";
import IntelBar   from "@/components/eco/IntelBar";
import SideNav    from "@/components/eco/SideNav";
import AICopilot  from "@/components/eco/AICopilot";
import GlobalOverview     from "@/components/eco/views/GlobalOverview";
import FinancialMarkets   from "@/components/eco/views/FinancialMarkets";
import MacroIndicators    from "@/components/eco/views/MacroIndicators";
import TradeFlow          from "@/components/eco/views/TradeFlow";
import Commodities        from "@/components/eco/views/Commodities";
import GeopoliticalImpact from "@/components/eco/views/GeopoliticalImpact";
import BankingMonetary    from "@/components/eco/views/BankingMonetary";
import AIForecasting      from "@/components/eco/views/AIForecasting";
import SectorIntelligence from "@/components/eco/views/SectorIntelligence";
import CountryExplorer    from "@/components/eco/views/CountryExplorer";
import RiskRadar          from "@/components/eco/views/RiskRadar";
import Watchlists         from "@/components/eco/views/Watchlists";

const VIEWS: Record<ViewId, React.ComponentType> = {
  overview:    GlobalOverview,
  markets:     FinancialMarkets,
  macro:       MacroIndicators,
  trade:       TradeFlow,
  commodities: Commodities,
  geo:         GeopoliticalImpact,
  banking:     BankingMonetary,
  ai:          AIForecasting,
  sectors:     SectorIntelligence,
  countries:   CountryExplorer,
  risk:        RiskRadar,
  watchlist:   Watchlists,
};

export default function EconomicsPage() {
  const [activeView, setActiveView] = useState<ViewId>("overview");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [aiOpen, setAiOpen] = useState(true);

  const ActiveView = VIEWS[activeView];

  return (
    <div
      className="h-screen bg-[#03060d] flex flex-col overflow-hidden"
      style={{ paddingTop: 64 }}
    >
      {/* Intelligence ribbon */}
      <IntelBar />

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <SideNav
          activeView={activeView}
          setActiveView={setActiveView}
          expanded={sidebarExpanded}
          setExpanded={setSidebarExpanded}
        />

        {/* Main content */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.995 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="h-full"
            >
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* AI Copilot panel */}
        <AnimatePresence>
          {aiOpen && (
            <motion.div
              key="ai-panel"
              initial={{ x: 340, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 340, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-80 flex-shrink-0 border-l border-white/[0.05]"
            >
              <AICopilot onClose={() => setAiOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI toggle button when closed */}
        {!aiOpen && (
          <motion.button
            initial={{ x: 40 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setAiOpen(true)}
            className="flex-shrink-0 w-9 border-l border-white/[0.05] bg-[#8b5cf6]/5 hover:bg-[#8b5cf6]/15 flex items-center justify-center text-[#8b5cf6] transition-all"
            title="Open AI Copilot"
          >
            <MessageSquare size={15} />
          </motion.button>
        )}
      </div>
    </div>
  );
}
