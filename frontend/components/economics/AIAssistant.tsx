"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
import { useGeoTera } from "@/lib/GeoTeraContext";
import type { GeoTeraData } from "@/lib/useWebSocket";

interface Message {
  role: "user" | "ai";
  text: string;
  ts: number;
}

const QUERY_GROUPS = [
  {
    label: "📈 Markets",
    queries: [
      "Why is the S&P 500 moving today?",
      "What's driving Bitcoin's price action?",
      "Best performing sectors right now",
      "Explain gold price movement",
    ],
  },
  {
    label: "🏦 Macro",
    queries: [
      "What does yield curve inversion mean?",
      "How does VIX affect portfolios?",
      "Explain current recession risks globally",
      "Fed rate trajectory analysis",
    ],
  },
  {
    label: "🌍 Global",
    queries: [
      "Compare India vs China GDP growth",
      "Which economies have highest inflation?",
      "How do sanctions impact currency markets?",
      "Emerging market outlook",
    ],
  },
  {
    label: "🔮 Forecast",
    queries: [
      "Inflation outlook for next 6 months",
      "Which assets benefit from rate cuts?",
      "Oil price forecast and drivers",
      "Recession probability assessment",
    ],
  },
];

function buildContext(data: GeoTeraData | null): string {
  if (!data?.economy) return "";
  const eco = data.economy;
  const macro = eco.macro ?? {};
  const parts: string[] = [];

  if (macro.vix)          parts.push(`VIX ${macro.vix.toFixed(1)}`);
  if (macro.fear_greed)   parts.push(`F&G ${macro.fear_greed}/100`);
  if (macro.treasury_10y) parts.push(`10Y ${macro.treasury_10y.toFixed(2)}%`);
  if (macro.treasury_2y && macro.treasury_10y) {
    const inv = macro.treasury_2y > macro.treasury_10y;
    parts.push(inv ? "⚠ Curve INVERTED" : "Curve normal");
  }

  const spx = eco.indices?.find(i => i.symbol === "^GSPC");
  if (spx?.price) parts.push(`S&P ${spx.price.toLocaleString()}(${spx.change_pct != null ? (spx.change_pct >= 0 ? "+" : "") + spx.change_pct.toFixed(2) + "%" : ""})`);

  const gold = eco.commodities?.find(c => c.symbol === "GC=F");
  const oil  = eco.commodities?.find(c => c.symbol === "CL=F");
  if (gold?.price) parts.push(`Gold $${gold.price.toLocaleString()}`);
  if (oil?.price)  parts.push(`Oil $${oil.price.toFixed(2)}`);

  return parts.join(" · ");
}

function renderText(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("- ") || line.startsWith("• ")) {
      return (
        <div key={i} className="flex gap-1.5 items-start">
          <span className="text-[#00d4ff] mt-0.5 flex-shrink-0 text-[10px]">▸</span>
          <span>{line.slice(2)}</span>
        </div>
      );
    }
    if (/^\*\*.+\*\*/.test(line)) {
      return <p key={i} className="font-semibold text-white">{line.replace(/\*\*/g, "")}</p>;
    }
    if (line.trim() === "") return <div key={i} className="h-1.5" />;
    return <p key={i}>{line}</p>;
  });
}

export default function AIAssistant() {
  const { data } = useGeoTera();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "I'm GeoTera's AI Economic Intelligence System with live access to markets, macro data, and global economics. Ask me anything — or pick a quick query below.",
      ts: Date.now(),
    },
  ]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [openGroup, setOpenGroup] = useState<string>("📈 Markets");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text, ts: Date.now() }]);
    setLoading(true);

    const ctx = buildContext(data);

    try {
      const res = await fetch("http://localhost:8000/api/ai/query", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, context: ctx || undefined }),
      });
      const json = await res.json();
      setAiEnabled(json.enabled !== false);
      setMessages(m => [...m, { role: "ai", text: json.response, ts: Date.now() }]);
    } catch {
      setMessages(m => [...m, {
        role: "ai",
        text: "Connection error. Make sure the GeoTera backend is running at localhost:8000.",
        ts: Date.now(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  const ctx = buildContext(data);

  return (
    <div className="flex flex-col h-full">
      {/* ── Header ── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#00d4ff]/10 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00d4ff] to-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#00d4ff]/20">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white">AI Economic Intelligence</p>
          <p className="text-[9px] text-gray-600 truncate">
            {ctx ? ctx.slice(0, 60) + "…" : "Connecting to live data…"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {aiEnabled === false && (
            <span className="text-[8px] text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded px-1.5 py-0.5">
              No API Key
            </span>
          )}
          {aiEnabled && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
          )}
        </div>
      </div>

      {/* ── Query groups ── */}
      <div className="border-b border-white/5 flex-shrink-0 px-3 py-1">
        {QUERY_GROUPS.map(group => (
          <div key={group.label}>
            <button
              onClick={() => setOpenGroup(openGroup === group.label ? "" : group.label)}
              className="flex items-center gap-1.5 text-[9px] text-gray-600 hover:text-[#00d4ff] uppercase tracking-widest font-bold transition-colors py-1 w-full"
            >
              {openGroup === group.label ? <ChevronDown size={9} /> : <ChevronRight size={9} />}
              {group.label}
            </button>
            {openGroup === group.label && (
              <div className="flex flex-wrap gap-1 pb-1.5 pl-3">
                {group.queries.map(q => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    disabled={loading}
                    className="text-[9px] text-gray-500 hover:text-[#00d4ff] border border-white/5 hover:border-[#00d4ff]/25 bg-white/[0.02] hover:bg-[#00d4ff]/5 rounded-full px-2 py-0.5 transition-all disabled:opacity-40"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3 scrollbar-thin min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                m.role === "ai" ? "bg-[#00d4ff]/10" : "bg-violet-500/20"
              }`}
            >
              {m.role === "ai"
                ? <Bot  size={12} className="text-[#00d4ff]" />
                : <User size={12} className="text-violet-400" />
              }
            </div>
            <div
              className={`max-w-[88%] rounded-xl px-3 py-2 text-[11px] leading-relaxed space-y-0.5 ${
                m.role === "ai"
                  ? "bg-white/[0.04] border border-white/8 text-gray-300"
                  : "bg-violet-500/10 border border-violet-500/20 text-gray-300"
              }`}
            >
              {m.role === "ai" ? renderText(m.text) : m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#00d4ff]/10">
              <Bot size={12} className="text-[#00d4ff]" />
            </div>
            <div className="bg-white/[0.04] border border-white/8 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 size={11} className="text-[#00d4ff] animate-spin" />
              <span className="text-[10px] text-gray-600 animate-pulse">Analysing market data…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      <div className="px-3 py-2.5 border-t border-white/5 flex-shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about global economy, markets, macro…"
            disabled={loading}
            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#00d4ff]/40 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-700 outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => { setMessages(m => [m[0]]); }}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/8 text-gray-600 hover:text-gray-400 transition-all flex-shrink-0"
            title="Clear chat"
          >
            <RefreshCw size={11} />
          </button>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 text-[#00d4ff] disabled:opacity-30 transition-all flex-shrink-0"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
