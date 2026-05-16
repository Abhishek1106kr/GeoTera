import aiohttp
from datetime import datetime

MAJOR_CITIES = [
    ("New York", 40.71, -74.01),
    ("London", 51.51, -0.13),
    ("Tokyo", 35.68, 139.69),
    ("Mumbai", 19.08, 72.88),
    ("Sydney", -33.87, 151.21),
    ("Dubai", 25.20, 55.27),
    ("Moscow", 55.75, 37.62),
    ("Beijing", 39.90, 116.40),
]

async def fetch_climate() -> dict:
    data = {"weather": [], "earthquakes": [], "co2_ppm": None, "timestamp": datetime.utcnow().isoformat()}

    # Weather for major cities via Open-Meteo (free, no API key)
    try:
        async with aiohttp.ClientSession() as session:
            for city, lat, lon in MAJOR_CITIES:
                url = (
                    f"https://api.open-meteo.com/v1/forecast"
                    f"?latitude={lat}&longitude={lon}"
                    f"&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation"
                    f"&temperature_unit=celsius"
                )
                try:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=8)) as resp:
                        if resp.status == 200:
                            d = await resp.json()
                            cur = d.get("current", {})
                            data["weather"].append({
                                "city": city,
                                "lat": lat,
                                "lon": lon,
                                "temp_c": cur.get("temperature_2m"),
                                "humidity": cur.get("relative_humidity_2m"),
                                "wind_kph": cur.get("wind_speed_10m"),
                                "weather_code": cur.get("weather_code"),
                                "precipitation": cur.get("precipitation"),
                            })
                except Exception as e:
                    print(f"[climate] Weather error {city}: {e}")
    except Exception as e:
        print(f"[climate] Session error: {e}")

    # Recent earthquakes via USGS GeoJSON feed
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    eq = await resp.json()
                    for feature in eq.get("features", [])[:10]:
                        props = feature.get("properties", {})
                        coords = feature.get("geometry", {}).get("coordinates", [])
                        data["earthquakes"].append({
                            "place": props.get("place", "Unknown"),
                            "magnitude": props.get("mag"),
                            "time": props.get("time"),
                            "lat": coords[1] if len(coords) > 1 else None,
                            "lon": coords[0] if len(coords) > 0 else None,
                            "depth_km": coords[2] if len(coords) > 2 else None,
                        })
    except Exception as e:
        print(f"[climate] Earthquake error: {e}")

    # Latest CO2 from NOAA (Mauna Loa)
    try:
        async with aiohttp.ClientSession() as session:
            url = "https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_weekly_mlo.txt"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    text = await resp.text()
                    lines = [l for l in text.splitlines() if not l.startswith("#") and l.strip()]
                    if lines:
                        last = lines[-1].split()
                        if len(last) >= 5 and last[4] != "-999.99":
                            data["co2_ppm"] = float(last[4])
    except Exception as e:
        print(f"[climate] CO2 error: {e}")

    return data
