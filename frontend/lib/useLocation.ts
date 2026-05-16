"use client";
import { useState, useEffect } from "react";

export interface LocationData {
  city: string;
  country: string;
  country_code: string;
  region: string;
  lat: number;
  lon: number;
  timezone: string;
  currency: string;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(6000) });
        if (res.ok) {
          const d = await res.json();
          if (d.city) {
            setLocation({
              city: d.city,
              country: d.country_name,
              country_code: d.country_code,
              region: d.region,
              lat: d.latitude,
              lon: d.longitude,
              timezone: d.timezone,
              currency: d.currency,
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Browser geolocation fallback
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({
              city: "Your Location",
              country: "",
              country_code: "",
              region: "",
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              currency: "",
            });
            setLoading(false);
          },
          () => setLoading(false),
          { timeout: 5000 }
        );
      } else {
        setLoading(false);
      }
    }

    detect();
  }, []);

  return { location, loading };
}
