"use client";
import { createContext, useContext } from "react";
import { useGeoTeraWebSocket, GeoTeraData, ConnectionStatus } from "./useWebSocket";

interface GeoTeraContextType {
  data: GeoTeraData | null;
  status: ConnectionStatus;
  refresh: () => Promise<void>;
}

const GeoTeraContext = createContext<GeoTeraContextType>({
  data: null,
  status: "connecting",
  refresh: async () => {},
});

export function GeoTeraProvider({ children }: { children: React.ReactNode }) {
  const ws = useGeoTeraWebSocket();
  return <GeoTeraContext.Provider value={ws}>{children}</GeoTeraContext.Provider>;
}

export function useGeoTera() {
  return useContext(GeoTeraContext);
}
