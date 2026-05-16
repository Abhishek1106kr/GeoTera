"use client";
import { useEffect, useRef, useState } from "react";
import type { EarthquakeItem, WeatherItem } from "@/lib/useWebSocket";

interface Props {
  earthquakes: EarthquakeItem[];
  weather: WeatherItem[];
}

const NEWS_BUREAUX = [
  { lat: 51.51, lng: -0.13,  label: "BBC London" },
  { lat: 40.71, lng: -74.01, label: "Reuters New York" },
  { lat: 25.29, lng: 51.52,  label: "Al Jazeera Doha" },
  { lat: 35.68, lng: 139.69, label: "AP Tokyo" },
];

export default function HomeGlobe({ earthquakes, weather }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [dim, setDim] = useState({ w: 800, h: 600 });

  // Track container size
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setDim({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Init globe once
  useEffect(() => {
    if (!mountRef.current) return;
    let mounted = true;

    import("react-globe.gl").then((mod) => {
      if (!mounted || !mountRef.current) return;
      const GlobeComponent = mod.default;

      const eqPoints = earthquakes
        .filter((e) => e.lat != null && e.lon != null)
        .map((e) => ({
          lat: e.lat!,
          lng: e.lon!,
          size: Math.min(0.9, ((e.magnitude ?? 1) - 1) * 0.15 + 0.08),
          color:
            (e.magnitude ?? 0) >= 7
              ? "#ef4444"
              : (e.magnitude ?? 0) >= 5
              ? "#f97316"
              : "#eab308",
          label: `M${e.magnitude?.toFixed(1)} — ${e.place}`,
        }));

      const cityPoints = weather.map((w) => ({
        lat: w.lat,
        lng: w.lon,
        size: 0.22,
        color: "#06b6d4",
        label: `${w.city}${w.temp_c != null ? ": " + w.temp_c.toFixed(0) + "°C" : ""}`,
      }));

      const bureauPoints = NEWS_BUREAUX.map((b) => ({
        lat: b.lat,
        lng: b.lng,
        size: 0.18,
        color: "#a78bfa",
        label: b.label,
      }));

      const arcs = NEWS_BUREAUX.flatMap((b) =>
        weather.slice(0, 4).map((c) => ({
          startLat: b.lat,
          startLng: b.lng,
          endLat: c.lat,
          endLng: c.lon,
          color: ["rgba(167,139,250,0.7)", "rgba(6,182,212,0.7)"],
        }))
      );

      const { createElement } = require("react");
      const { createRoot } = require("react-dom/client");

      const root = createRoot(mountRef.current);
      const el = createElement(GlobeComponent, {
        ref: (g: any) => {
          if (g) {
            globeRef.current = g;
            g.controls().autoRotate = true;
            g.controls().autoRotateSpeed = 0.4;
            g.controls().enableZoom = true;
          }
        },
        width: dim.w,
        height: dim.h,
        backgroundColor: "rgba(0,0,0,0)",
        globeImageUrl: "//unpkg.com/three-globe/example/img/earth-night.jpg",
        atmosphereColor: "#1e40af",
        atmosphereAltitude: 0.18,
        pointsData: [...eqPoints, ...cityPoints, ...bureauPoints],
        pointLat: "lat",
        pointLng: "lng",
        pointColor: "color",
        pointRadius: "size",
        pointAltitude: 0.01,
        pointLabel: "label",
        arcsData: arcs,
        arcColor: "color",
        arcDashLength: 0.5,
        arcDashGap: 0.3,
        arcDashAnimateTime: 2000,
        arcStroke: 0.4,
        arcAltitude: 0.25,
      });

      root.render(el);
    });

    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earthquakes, weather]);

  // Resize when dim changes
  useEffect(() => {
    if (globeRef.current?.renderer) {
      globeRef.current.renderer().setSize(dim.w, dim.h);
    }
  }, [dim]);

  return <div ref={mountRef} className="w-full h-full" />;
}
