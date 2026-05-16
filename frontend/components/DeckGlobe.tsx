"use client";
import { useEffect, useRef, useCallback } from "react";
import type { EarthquakeItem, WeatherItem } from "@/lib/useWebSocket";

interface Props {
  earthquakes: EarthquakeItem[];
  weather: WeatherItem[];
}

export default function DeckGlobe({ earthquakes, weather }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const lonRef = useRef(0);
  const pauseRef = useRef(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildLayers = useCallback(
    async (
      ScatterplotLayer: any,
      TileLayer: any,
      BitmapLayer: any,
      ArcLayer: any
    ) => {
      const eqData = earthquakes.filter(
        (e) => e.lat != null && e.lon != null && e.magnitude != null
      );
      const cityData = weather;

      // Arc sources: real news bureau locations → random destinations for visual effect
      const bureauxArcs = [
        { source: [-0.13, 51.51], name: "BBC London" },
        { source: [-74.01, 40.71], name: "Reuters NY" },
        { source: [51.52, 25.29], name: "Al Jazeera Doha" },
        { source: [139.69, 35.68], name: "AP Tokyo" },
      ].flatMap(({ source, name }) =>
        cityData.slice(0, 4).map((c) => ({
          sourcePosition: source,
          targetPosition: [c.lon, c.lat],
          name,
        }))
      );

      return [
        // Dark satellite tile basemap
        new TileLayer({
          id: "basemap",
          data: "https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          minZoom: 0,
          maxZoom: 10,
          tileSize: 256,
          renderSubLayers: (props: any) => {
            const { west, south, east, north } = props.tile.bbox;
            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north],
            });
          },
        }),

        // News bureau → city arcs
        new ArcLayer({
          id: "news-arcs",
          data: bureauxArcs,
          getSourcePosition: (d: any) => d.sourcePosition,
          getTargetPosition: (d: any) => d.targetPosition,
          getSourceColor: [6, 182, 212, 60],
          getTargetColor: [139, 92, 246, 60],
          getWidth: 0.8,
          widthUnits: "pixels",
          greatCircle: true,
          getHeight: 0.5,
        }),

        // Tracked weather cities — cyan glow
        new ScatterplotLayer({
          id: "cities",
          data: cityData,
          getPosition: (d: any) => [d.lon, d.lat],
          getRadius: 180000,
          getFillColor: [6, 182, 212, 220],
          stroked: true,
          getLineColor: [6, 182, 212, 60],
          lineWidthMinPixels: 1,
          radiusUnits: "meters",
          radiusMinPixels: 5,
          radiusMaxPixels: 10,
          pickable: true,
        }),

        // City outer pulse ring
        new ScatterplotLayer({
          id: "cities-ring",
          data: cityData,
          getPosition: (d: any) => [d.lon, d.lat],
          getRadius: 450000,
          getFillColor: [6, 182, 212, 0],
          stroked: true,
          getLineColor: [6, 182, 212, 35],
          lineWidthMinPixels: 1,
          radiusUnits: "meters",
          radiusMinPixels: 10,
          radiusMaxPixels: 22,
        }),

        // Earthquakes — heat-map coloring by magnitude
        new ScatterplotLayer({
          id: "earthquakes",
          data: eqData,
          getPosition: (d: any) => [d.lon, d.lat],
          getRadius: (d: any) => Math.pow(2.4, d.magnitude ?? 1) * 18000,
          getFillColor: (d: any) => {
            const m = d.magnitude ?? 0;
            if (m >= 7) return [239, 68, 68, 230];
            if (m >= 6) return [251, 113, 60, 210];
            if (m >= 5) return [251, 146, 60, 190];
            return [234, 179, 8, 170];
          },
          stroked: false,
          radiusUnits: "meters",
          radiusMinPixels: 4,
          radiusMaxPixels: 22,
          pickable: true,
        }),

        // Earthquake outer glow
        new ScatterplotLayer({
          id: "earthquakes-glow",
          data: eqData,
          getPosition: (d: any) => [d.lon, d.lat],
          getRadius: (d: any) => Math.pow(2.4, d.magnitude ?? 1) * 40000,
          getFillColor: (d: any) => {
            const m = d.magnitude ?? 0;
            if (m >= 7) return [239, 68, 68, 50];
            if (m >= 5) return [251, 146, 60, 40];
            return [234, 179, 8, 30];
          },
          stroked: false,
          radiusUnits: "meters",
          radiusMinPixels: 8,
          radiusMaxPixels: 35,
        }),
      ];
    },
    [earthquakes, weather]
  );

  useEffect(() => {
    if (!containerRef.current) return;
    let mounted = true;

    async function init() {
      const { DeckGL, TileLayer, BitmapLayer, ScatterplotLayer, ArcLayer } =
        await import("deck.gl");
      const { _GlobeView } = await import("@deck.gl/core");

      if (!mounted || !containerRef.current) return;

      const layers = await buildLayers(
        ScatterplotLayer,
        TileLayer,
        BitmapLayer,
        ArcLayer
      );

      const INIT = { longitude: 0, latitude: 20, zoom: 0 };

      const deck = new (DeckGL as any)({
        parent: containerRef.current,
        views: new _GlobeView({ id: "globe" }),
        initialViewState: INIT,
        controller: { dragPan: true, scrollZoom: false, doubleClickZoom: false },
        layers,
        style: { background: "transparent", width: "100%", height: "100%" },
        parameters: { clearColor: [0, 0, 0, 0] },
        getTooltip: ({ object }: any) => {
          if (!object) return null;
          if (object.magnitude != null) {
            return {
              html: `<div style="font:12px/1.4 system-ui;padding:8px 12px;background:rgba(10,14,30,0.95);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;pointer-events:none"><b style="color:#f97316">M${(object.magnitude).toFixed(1)}</b> — ${object.place}</div>`,
              style: { background: "none", border: "none", padding: 0 },
            };
          }
          if (object.city != null) {
            return {
              html: `<div style="font:12px/1.4 system-ui;padding:8px 12px;background:rgba(10,14,30,0.95);border:1px solid rgba(255,255,255,0.12);border-radius:10px;color:#fff;pointer-events:none"><b style="color:#06b6d4">${object.city}</b><br/>${object.temp_c != null ? object.temp_c.toFixed(0) + "°C" : ""} ${object.humidity != null ? "· 💧" + object.humidity + "%" : ""}</div>`,
              style: { background: "none", border: "none", padding: 0 },
            };
          }
          return null;
        },
        onDragStart: () => {
          pauseRef.current = true;
          if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        },
        onDragEnd: () => {
          pauseTimerRef.current = setTimeout(() => {
            pauseRef.current = false;
          }, 2500);
        },
      });

      deckRef.current = deck;

      // Auto-rotate
      const rotate = () => {
        if (!mounted) return;
        if (!pauseRef.current && deckRef.current) {
          lonRef.current -= 0.04;
          deckRef.current.setProps({
            viewState: { longitude: lonRef.current, latitude: 20, zoom: 0 },
          });
        }
        rafRef.current = requestAnimationFrame(rotate);
      };
      rafRef.current = requestAnimationFrame(rotate);
    }

    init();

    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (deckRef.current?.finalize) {
        deckRef.current.finalize();
        deckRef.current = null;
      }
    };
  }, [buildLayers]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: "relative" }}
    />
  );
}
