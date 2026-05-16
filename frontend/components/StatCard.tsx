"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  label: string;
  value: string | null;
  sub?: string;
  change?: number | null;
}

export default function StatCard({ label, value, sub, change }: Props) {
  const positive = change != null && change > 0;
  const negative = change != null && change < 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col gap-1 min-w-0">
      <span className="text-xs text-gray-500 uppercase tracking-wider truncate">{label}</span>
      <span className="text-2xl font-bold text-white tabular-nums truncate">
        {value ?? <span className="text-gray-600">—</span>}
      </span>
      {(sub || change != null) && (
        <div className="flex items-center gap-2 mt-0.5">
          {sub && <span className="text-xs text-gray-500 truncate">{sub}</span>}
          {change != null && (
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${positive ? "text-green-400" : negative ? "text-red-400" : "text-gray-500"}`}>
              {positive ? <TrendingUp size={12} /> : negative ? <TrendingDown size={12} /> : <Minus size={12} />}
              {Math.abs(change).toFixed(2)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
