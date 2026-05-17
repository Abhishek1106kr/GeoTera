"use client";
import { useCallback, useEffect, useRef, useState, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, User, Send, Sparkles, RefreshCw } from "lucide-react";
import { useGeoTera } from "@/lib/GeoTeraContext";

interface Message { role: "user" | "assistant"; text: string; ts: string; }

const QUICK_QUERIES = [
  "What's driving markets today?",
  "Analyze yield curve inversion",
  "Best performing sectors?",
  "Recession probability?",
  "Gold vs dollar correlation",
  "Compare US vs EU outlook",
  "Crypto market sentiment",
  "Top inflation risks",
];

export default function AICopilot({ onClose }: { onClose: () => void }) {
  const { data } = useGeoTera();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "I'm your AI Economic Intelligence Copilot. Ask me anything about markets, macro trends, risk factors, or country economics. I have access to live data.",
      ts: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildContext = useCallback(() => {
    const eco   = data?.economy;
    const macro = eco?.macro;
    const wb    = data?.worldbank?.countries ?? {};
    const indices = (eco?.indices ?? []).map(i => `${i.name}:${i.price} (${i.change_pct?.toFixed(2)}%)`).join(", ");
    const inv   = macro?.treasury_2y != null && macro?.treasury_10y != null && macro.treasury_2y > macro.treasury_10y;
    return `VIX:${macro?.vix?.toFixed(1)} DXY:${macro?.dxy?.toFixed(2)} 10Y:${macro?.treasury_10y?.toFixed(3)}% 2Y:${macro?.treasury_2y?.toFixed(3)}% F&G:${macro?.fear_greed}/100 ${inv ? "YIELD_CURVE_INVERTED" : ""} | ${indices} | US GDP:${wb["US"]?.gdp_growth?.toFixed(1)}% INF:${wb["US"]?.inflation?.toFixed(1)}% | CN GDP:${wb["CN"]?.gdp_growth?.toFixed(1)}%`;
  }, [data]);

  const send = useCallback(async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setHistory(p => [q, ...p.slice(0, 49)]);
    setHistIdx(-1);
    setMessages(p => [...p, { role: "user", text: q, ts: new Date().toLocaleTimeString() }]);
    setLoading(true);
    try {
      const r = await fetch("http://localhost:8000/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q, context: buildContext() }),
      });
      const j = await r.json();
      setMessages(p => [...p, {
        role: "assistant",
        text: j.response ?? "No response received.",
        ts: new Date().toLocaleTimeString(),
      }]);
    } catch {
      setMessages(p => [...p, {
        role: "assistant",
        text: "Connection error — ensure the backend is running on port 8000.",
        ts: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading, buildContext]);

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") send(input);
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx);
      setInput(history[idx] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : history[idx] ?? "");
    }
  };

  const clear = () => setMessages([{
    role: "assistant",
    text: "Conversation cleared. How can I help you?",
    ts: new Date().toLocaleTimeString(),
  }]);

  return (
    <div className="h-full bg-[#030810] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-gradient-to-r from-[#8b5cf6]/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/20 flex items-center justify-center">
            <Sparkles size={13} className="text-[#8b5cf6]" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white">AI Copilot</p>
            <p className="text-[8px] text-gray-600">Economic Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clear} className="p-1.5 text-gray-600 hover:text-gray-400 hover:bg-white/[0.05] rounded-lg transition-all">
            <RefreshCw size={11} />
          </button>
          <button onClick={onClose} className="p-1.5 text-gray-600 hover:text-gray-400 hover:bg-white/[0.05] rounded-lg transition-all">
            <X size={11} />
          </button>
        </div>
      </div>

      {/* Quick queries */}
      <div className="px-3 py-2 border-b border-white/[0.04] flex-shrink-0">
        <p className="text-[8px] text-gray-700 uppercase tracking-widest font-bold mb-1.5">Quick Queries</p>
        <div className="flex flex-wrap gap-1">
          {QUICK_QUERIES.map(q => (
            <button
              key={q}
              onClick={() => send(q)}
              disabled={loading}
              className="text-[8px] px-2 py-1 rounded-full border border-white/[0.06] text-gray-500 hover:border-[#8b5cf6]/40 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/5 transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                ${msg.role === "assistant" ? "bg-[#8b5cf6]/20 text-[#8b5cf6]" : "bg-[#00d4ff]/15 text-[#00d4ff]"}`}>
                {msg.role === "assistant" ? <Bot size={11} /> : <User size={11} />}
              </div>

              {/* Bubble */}
              <div className={`flex-1 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                <div
                  className={`rounded-xl px-3 py-2.5 text-xs leading-relaxed max-w-[90%]
                    ${msg.role === "assistant"
                      ? "bg-white/[0.04] border border-white/[0.06] text-gray-300"
                      : "bg-[#00d4ff]/10 border border-[#00d4ff]/15 text-[#00d4ff]"
                    }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.text}
                </div>
                <p className="text-[8px] text-gray-700 mt-1 px-1">{msg.ts}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2.5"
          >
            <div className="w-6 h-6 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0">
              <Bot size={11} className="text-[#8b5cf6]" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:border-[#8b5cf6]/40 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            disabled={loading}
            placeholder="Ask about markets, macro, risks…"
            className="flex-1 bg-transparent text-[11px] text-white placeholder-gray-600 outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="p-1 rounded-lg bg-[#8b5cf6] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#7c3aed] transition-all"
          >
            <Send size={11} className="text-white" />
          </button>
        </div>
        <p className="text-[8px] text-gray-700 text-center mt-1.5">Not financial advice · For informational purposes only</p>
      </div>
    </div>
  );
}
