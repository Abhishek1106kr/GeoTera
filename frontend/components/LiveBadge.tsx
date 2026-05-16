"use client";
import { ConnectionStatus } from "@/lib/useWebSocket";

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  connected: "bg-green-400",
  connecting: "bg-yellow-400",
  disconnected: "bg-red-500",
};

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connected: "LIVE",
  connecting: "CONNECTING",
  disconnected: "OFFLINE",
};

export default function LiveBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase">
      <span className={`inline-block w-2 h-2 rounded-full ${STATUS_COLOR[status]} ${status === "connected" ? "animate-pulse" : ""}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
