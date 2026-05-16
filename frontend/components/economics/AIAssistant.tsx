"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Loader2 } from "lucide-react";

interface Message { role: "user" | "ai"; text: string; }

const QUICK_QUERIES = [
  "Why is gold rising?",
  "Recession risk outlook",
  "Best performing markets today",
  "Compare USD vs major currencies",
  "Oil price drivers right now",
  "Which sectors benefit from rate cuts?",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "I'm GeoTera's AI Economic Intelligence System. I have access to live market data — ask me anything about the global economy, market movements, or economic trends." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setAiEnabled(data.enabled !== false);
      setMessages((m) => [...m, { role: "ai", text: data.response }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: "Connection error. Make sure the GeoTera backend is running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#00d4ff]/10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00d4ff] to-violet-500 flex items-center justify-center">
          <Sparkles size={13} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-white">AI Economic Intelligence</p>
          <p className="text-[9px] text-gray-600">Powered by Claude · Live market context</p>
        </div>
        {aiEnabled === false && (
          <span className="ml-auto text-[9px] text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded px-2 py-0.5">
            Set ANTHROPIC_API_KEY
          </span>
        )}
      </div>

      {/* Quick queries */}
      <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
        {QUICK_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            disabled={loading}
            className="text-[10px] text-gray-500 hover:text-[#00d4ff] border border-white/5 hover:border-[#00d4ff]/30 rounded-full px-2.5 py-1 transition-all disabled:opacity-40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-thin min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${m.role === "ai" ? "bg-[#00d4ff]/10" : "bg-violet-500/20"}`}>
              {m.role === "ai" ? <Bot size={12} className="text-[#00d4ff]" /> : <User size={12} className="text-violet-400" />}
            </div>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${m.role === "ai" ? "bg-white/[0.04] border border-white/8 text-gray-300" : "bg-violet-500/10 border border-violet-500/20 text-gray-300"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#00d4ff]/10">
              <Bot size={12} className="text-[#00d4ff]" />
            </div>
            <div className="bg-white/[0.04] border border-white/8 rounded-xl px-3 py-2">
              <Loader2 size={12} className="text-[#00d4ff] animate-spin" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-white/5">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about global economy…"
            disabled={loading}
            className="flex-1 bg-white/[0.04] border border-white/10 focus:border-[#00d4ff]/40 rounded-xl px-3 py-2 text-xs text-gray-300 placeholder-gray-700 outline-none transition-colors disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-[#00d4ff]/10 hover:bg-[#00d4ff]/20 border border-[#00d4ff]/20 text-[#00d4ff] disabled:opacity-30 transition-all"
          >
            <Send size={13} />
          </button>
        </form>
      </div>
    </div>
  );
}
