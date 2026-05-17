"use client";
import { useGeoTera } from "@/lib/GeoTeraContext";

const CURRENCY_META: Record<string, { flag: string; name: string; invert?: boolean }> = {
  EUR: { flag: "🇪🇺", name: "Euro"          },
  GBP: { flag: "🇬🇧", name: "Sterling"      },
  JPY: { flag: "🇯🇵", name: "Yen",   invert: true },
  CNY: { flag: "🇨🇳", name: "Yuan"          },
  INR: { flag: "🇮🇳", name: "Rupee", invert: true },
  AUD: { flag: "🇦🇺", name: "AUD"           },
  CHF: { flag: "🇨🇭", name: "Franc"         },
  CAD: { flag: "🇨🇦", name: "CAD"           },
  KRW: { flag: "🇰🇷", name: "Won",   invert: true },
  BRL: { flag: "🇧🇷", name: "Real",  invert: true },
  MXN: { flag: "🇲🇽", name: "Peso",  invert: true },
};

// Rough "normal" ranges for bar sizing (1 USD = x currency)
const NORMAL: Record<string, number> = {
  EUR: 0.95, GBP: 0.80, JPY: 145, CNY: 7.2, INR: 83, AUD: 1.55,
  CHF: 0.90, CAD: 1.37, KRW: 1350, BRL: 5.0, MXN: 17,
};

function barPct(cur: string, rate: number, invert?: boolean): number {
  const norm = NORMAL[cur] ?? 1;
  if (invert) {
    // Higher rate = USD stronger (bad for foreign currency)
    return Math.max(5, Math.min(95, 50 + (norm - rate) / norm * 80));
  } else {
    // Higher rate = you get more foreign currency per USD = USD stronger
    return Math.max(5, Math.min(95, 50 + (norm - rate) / norm * 80));
  }
}

function strengthLabel(pct: number): { label: string; color: string } {
  if (pct > 75) return { label: "Strong vs USD", color: "#00ff9d" };
  if (pct > 55) return { label: "Slightly strong", color: "#34d399" };
  if (pct > 45) return { label: "Near par", color: "#9ca3af" };
  if (pct > 30) return { label: "Slightly weak", color: "#f97316" };
  return { label: "Weak vs USD", color: "#ff3366" };
}

export default function CurrencyMatrix() {
  const { data } = useGeoTera();
  const forex = data?.economy?.forex ?? {};

  const entries = Object.entries(forex)
    .filter(([cur]) => CURRENCY_META[cur])
    .sort(([a], [b]) => {
      const order = ["EUR", "GBP", "JPY", "CNY", "CHF", "AUD", "CAD", "INR", "KRW", "BRL", "MXN"];
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([cur, rate]) => ({
      code: cur,
      rate: rate as number,
      meta: CURRENCY_META[cur]!,
      pct: barPct(cur, rate as number, CURRENCY_META[cur]?.invert),
    }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-[#00d4ff] uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]" /> USD Forex Matrix
        </p>
        <span className="text-[9px] text-gray-700">1 USD =</span>
      </div>

      {!entries.length ? (
        <div className="flex-1 flex items-center justify-center text-gray-700 text-xs animate-pulse">
          Loading forex data…
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1 scrollbar-thin">
          {entries.map(({ code, rate, meta, pct }) => {
            const { label: sLabel, color: sColor } = strengthLabel(pct);
            return (
              <div
                key={code}
                className="group flex items-center gap-2.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg px-2.5 py-1.5 transition-colors cursor-default"
              >
                <span className="text-base leading-none flex-shrink-0">{meta.flag}</span>
                <div className="flex-shrink-0 w-[38px]">
                  <p className="text-[10px] font-black text-white">{code}</p>
                  <p className="text-[8px] text-gray-700">{meta.name}</p>
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${sColor}88, ${sColor})`,
                        boxShadow: `0 0 4px ${sColor}60`,
                      }}
                    />
                  </div>
                  <p className="text-[8px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: sColor }}>
                    {sLabel}
                  </p>
                </div>
                <span className="font-mono text-[10px] text-gray-400 text-right flex-shrink-0 w-18 tabular-nums">
                  {meta.invert ? rate.toFixed(1) : rate.toFixed(4)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[8px] text-gray-700 mt-2">Via Frankfurter API · Updated every 15 min</p>
    </div>
  );
}
