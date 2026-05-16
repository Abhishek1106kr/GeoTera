"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { useGeoTera } from "@/lib/GeoTeraContext";

// Major country capitals with ISO A2 codes
const COUNTRY_NODES = [
  { code: "US", name: "United States", lat: 38.9,   lng: -77.0  },
  { code: "CN", name: "China",          lat: 39.9,   lng: 116.4  },
  { code: "JP", name: "Japan",          lat: 35.7,   lng: 139.7  },
  { code: "DE", name: "Germany",        lat: 52.5,   lng: 13.4   },
  { code: "GB", name: "United Kingdom", lat: 51.5,   lng: -0.1   },
  { code: "FR", name: "France",         lat: 48.9,   lng: 2.3    },
  { code: "IN", name: "India",          lat: 28.6,   lng: 77.2   },
  { code: "BR", name: "Brazil",         lat: -15.8,  lng: -47.9  },
  { code: "CA", name: "Canada",         lat: 45.4,   lng: -75.7  },
  { code: "KR", name: "South Korea",    lat: 37.6,   lng: 126.9  },
  { code: "AU", name: "Australia",      lat: -35.3,  lng: 149.1  },
  { code: "RU", name: "Russia",         lat: 55.75,  lng: 37.6   },
  { code: "IT", name: "Italy",          lat: 41.9,   lng: 12.5   },
  { code: "ES", name: "Spain",          lat: 40.4,   lng: -3.7   },
  { code: "MX", name: "Mexico",         lat: 19.4,   lng: -99.1  },
  { code: "ID", name: "Indonesia",      lat: -6.2,   lng: 106.8  },
  { code: "NL", name: "Netherlands",    lat: 52.4,   lng: 4.9    },
  { code: "SA", name: "Saudi Arabia",   lat: 24.7,   lng: 46.7   },
  { code: "TR", name: "Turkey",         lat: 39.9,   lng: 32.9   },
  { code: "NG", name: "Nigeria",        lat: 9.1,    lng: 7.5    },
  { code: "ZA", name: "South Africa",   lat: -25.7,  lng: 28.2   },
  { code: "AR", name: "Argentina",      lat: -34.6,  lng: -58.4  },
  { code: "SG", name: "Singapore",      lat: 1.3,    lng: 103.8  },
  { code: "CH", name: "Switzerland",    lat: 46.9,   lng: 7.4    },
  { code: "SE", name: "Sweden",         lat: 59.3,   lng: 18.1   },
  { code: "PL", name: "Poland",         lat: 52.2,   lng: 21.0   },
  { code: "EG", name: "Egypt",          lat: 30.1,   lng: 31.2   },
  { code: "PK", name: "Pakistan",       lat: 33.7,   lng: 73.1   },
  { code: "TH", name: "Thailand",       lat: 13.75,  lng: 100.5  },
  { code: "MY", name: "Malaysia",       lat: 3.1,    lng: 101.7  },
];

function gdpColor(val: number | undefined): string {
  if (val == null) return "#374151";
  if (val >= 6)  return "#00ff9d";
  if (val >= 3)  return "#34d399";
  if (val >= 1)  return "#fbbf24";
  if (val >= 0)  return "#f97316";
  return "#ef4444";
}

function gdpLabel(val: number | undefined): string {
  if (val == null) return "No data";
  return `${val > 0 ? "+" : ""}${val.toFixed(1)}%`;
}

export default function EconomicsMap() {
  const { data } = useGeoTera();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);

  const wb = (data as any)?.worldbank?.countries ?? {};

  if (!ready) {
    return (
      <div className="h-full flex items-center justify-center text-gray-700 text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <MapContainer
      center={[20, 10]}
      zoom={2}
      style={{ height: "100%", width: "100%", background: "#03060d" }}
      zoomControl={false}
      attributionControl={false}
      worldCopyJump
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={10}
      />

      {COUNTRY_NODES.map((c) => {
        const econ = wb[c.code] ?? {};
        const gdp = econ.gdp_growth;
        const color = gdpColor(gdp);
        const radius = 8 + (Math.abs(gdp ?? 0) * 1.5);

        return (
          <CircleMarker
            key={c.code}
            center={[c.lat, c.lng]}
            radius={Math.min(radius, 22)}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.75, weight: 1 }}
          >
            <Popup className="eco-popup">
              <div className="bg-[#03060d] border border-[#00d4ff]/20 rounded-xl p-4 min-w-[200px] text-white font-sans">
                <p className="font-black text-base mb-3">{c.name}</p>
                <div className="space-y-1.5 text-xs">
                  <Row label="GDP Growth" value={gdpLabel(econ.gdp_growth)} color={gdpColor(econ.gdp_growth)} />
                  <Row label="Inflation" value={econ.inflation != null ? `${econ.inflation.toFixed(1)}%` : "—"} color={econ.inflation > 5 ? "#f97316" : "#9ca3af"} />
                  <Row label="Unemployment" value={econ.unemployment != null ? `${econ.unemployment.toFixed(1)}%` : "—"} color="#9ca3af" />
                  <Row label="Debt/GDP" value={econ.debt_to_gdp != null ? `${econ.debt_to_gdp.toFixed(0)}%` : "—"} color="#9ca3af" />
                  <Row label="GDP per Capita" value={econ.gdp_per_capita != null ? `$${(econ.gdp_per_capita).toLocaleString("en-US", { maximumFractionDigits: 0 })}` : "—"} color="#9ca3af" />
                </div>
                <p className="text-[9px] text-gray-700 mt-3">World Bank data · Most recent available</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-mono font-bold" style={{ color }}>{value}</span>
    </div>
  );
}
