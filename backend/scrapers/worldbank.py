import aiohttp
from datetime import datetime

INDICATORS = {
    "gdp_growth":    "NY.GDP.MKTP.KD.ZG",
    "inflation":     "FP.CPI.TOTL.ZG",
    "unemployment":  "SL.UEM.TOTL.ZS",
    "debt_to_gdp":   "GC.DOD.TOTL.GD.ZS",
    "gdp_per_capita": "NY.GDP.PCAP.CD",
}

async def fetch_worldbank() -> dict:
    result: dict[str, dict] = {}
    timeout = aiohttp.ClientTimeout(total=20)

    async with aiohttp.ClientSession(timeout=timeout) as session:
        for key, code in INDICATORS.items():
            url = (
                f"https://api.worldbank.org/v2/country/all/indicator/{code}"
                f"?format=json&per_page=300&mrv=1"
            )
            try:
                async with session.get(url) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if len(data) > 1 and data[1]:
                            for item in data[1]:
                                iso2 = item.get("country", {}).get("id", "")
                                value = item.get("value")
                                if iso2 and len(iso2) == 2 and value is not None:
                                    if iso2 not in result:
                                        result[iso2] = {}
                                    result[iso2][key] = round(float(value), 2)
            except Exception as e:
                print(f"[worldbank] {key}: {e}")

    return {"countries": result, "timestamp": datetime.utcnow().isoformat()}
