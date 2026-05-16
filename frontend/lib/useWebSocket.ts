"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

export interface GeoTeraData {
  news: NewsItem[];
  economy: EconomyData;
  climate: ClimateData;
  population: PopulationData;
  last_updated: string | null;
}

export interface NewsItem {
  source: string;
  title: string;
  link: string;
  summary: string;
  published: string;
  timestamp: string;
}

export interface EconomyData {
  indices: MarketItem[];
  crypto: MarketItem[];
  commodities: MarketItem[];
  forex: Record<string, number>;
  timestamp: string;
}

export interface MarketItem {
  symbol: string;
  name: string;
  price: number | null;
  change_pct: number | null;
}

export interface ClimateData {
  weather: WeatherItem[];
  earthquakes: EarthquakeItem[];
  co2_ppm: number | null;
  timestamp: string;
}

export interface WeatherItem {
  city: string;
  lat: number;
  lon: number;
  temp_c: number | null;
  humidity: number | null;
  wind_kph: number | null;
  weather_code: number | null;
  precipitation: number | null;
}

export interface EarthquakeItem {
  place: string;
  magnitude: number | null;
  time: number | null;
  lat: number | null;
  lon: number | null;
  depth_km: number | null;
}

export interface PopulationData {
  world_population: number | null;
  countries: CountryItem[];
  health: Record<string, number>;
  timestamp: string;
}

export interface CountryItem {
  name: string;
  population: number;
  region: string;
  capital: string;
  flag: string;
  area_km2: number;
}

const WS_URL = "ws://localhost:8000/ws";
const RECONNECT_DELAY = 3000;

export function useGeoTeraWebSocket() {
  const [data, setData] = useState<GeoTeraData | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const wsRef = useRef<WebSocket | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus("connecting");

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setStatus("connected");
      pingRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, 25000);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "update" && msg.data) {
          setData(msg.data);
        }
      } catch {}
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus("disconnected");
      if (pingRef.current) clearInterval(pingRef.current);
      reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      wsRef.current?.close();
      if (pingRef.current) clearInterval(pingRef.current);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  const refresh = useCallback(async () => {
    await fetch("http://localhost:8000/api/refresh", { method: "POST" });
  }, []);

  return { data, status, refresh };
}
