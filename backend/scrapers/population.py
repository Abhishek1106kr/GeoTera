import aiohttp
from datetime import datetime
from bs4 import BeautifulSoup

async def fetch_population() -> dict:
    data = {
        "world_population": None,
        "countries": [],
        "health": {},
        "timestamp": datetime.utcnow().isoformat(),
    }

    # REST Countries API for country data
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://restcountries.com/v3.1/all?fields=name,population,region,capital,flags,area", timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status == 200:
                    countries = await resp.json()
                    sorted_countries = sorted(countries, key=lambda x: x.get("population", 0), reverse=True)
                    data["countries"] = [
                        {
                            "name": c["name"]["common"],
                            "population": c.get("population", 0),
                            "region": c.get("region", ""),
                            "capital": c.get("capital", [""])[0] if c.get("capital") else "",
                            "flag": c.get("flags", {}).get("png", ""),
                            "area_km2": c.get("area", 0),
                        }
                        for c in sorted_countries[:50]
                    ]
                    data["world_population"] = sum(c.get("population", 0) for c in countries)
    except Exception as e:
        print(f"[population] Countries error: {e}")

    # Worldometers live counter scrape
    try:
        async with aiohttp.ClientSession(headers={"User-Agent": "Mozilla/5.0"}) as session:
            async with session.get("https://www.worldometers.info/world-population/", timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    html = await resp.text()
                    soup = BeautifulSoup(html, "lxml")
                    counter = soup.find("span", {"class": "rts-counter"})
                    if counter:
                        pop_str = counter.get_text(strip=True).replace(",", "")
                        if pop_str.isdigit():
                            data["world_population"] = int(pop_str)
    except Exception as e:
        print(f"[population] Worldometers error: {e}")

    # World health stats from WHO Global Health Observatory (open API)
    try:
        async with aiohttp.ClientSession() as session:
            # Life expectancy global average
            url = "https://ghoapi.azureedge.net/api/WHOSIS_000001?$filter=SpatialDim eq 'GLOBAL' and TimeDim eq 2019"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    d = await resp.json()
                    items = d.get("value", [])
                    if items:
                        data["health"]["global_life_expectancy"] = items[0].get("NumericValue")
    except Exception as e:
        print(f"[population] WHO health error: {e}")

    return data
