import asyncio
import aiohttp
from datetime import datetime

INDICES = ["^GSPC", "^DJI", "^IXIC", "^FTSE", "^N225", "^HSI"]
CRYPTO = ["BTC-USD", "ETH-USD"]
COMMODITIES = ["GC=F", "CL=F", "SI=F"]  # Gold, Oil, Silver

async def fetch_economy() -> dict:
    data = {"indices": [], "crypto": [], "commodities": [], "forex": {}, "timestamp": datetime.utcnow().isoformat()}

    symbols = INDICES + CRYPTO + COMMODITIES
    try:
        import yfinance as yf
        loop = asyncio.get_event_loop()

        def _fetch():
            result = {}
            tickers = yf.Tickers(" ".join(symbols))
            for sym in symbols:
                try:
                    info = tickers.tickers[sym].fast_info
                    result[sym] = {
                        "price": round(info.last_price, 2) if info.last_price else None,
                        "change_pct": round(
                            ((info.last_price - info.previous_close) / info.previous_close * 100), 2
                        ) if info.last_price and info.previous_close else None,
                    }
                except Exception:
                    result[sym] = {"price": None, "change_pct": None}
            return result

        quotes = await loop.run_in_executor(None, _fetch)

        NAMES = {
            "^GSPC": "S&P 500", "^DJI": "Dow Jones", "^IXIC": "NASDAQ",
            "^FTSE": "FTSE 100", "^N225": "Nikkei 225", "^HSI": "Hang Seng",
            "BTC-USD": "Bitcoin", "ETH-USD": "Ethereum",
            "GC=F": "Gold", "CL=F": "Crude Oil", "SI=F": "Silver",
        }

        for sym in INDICES:
            data["indices"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})
        for sym in CRYPTO:
            data["crypto"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})
        for sym in COMMODITIES:
            data["commodities"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})

    except Exception as e:
        print(f"[economy] Error: {e}")

    # Forex rates via Open Exchange Rates (free, no key needed via frankfurter)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get("https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,INR,CNY,AUD", timeout=aiohttp.ClientTimeout(total=10)) as resp:
                if resp.status == 200:
                    fx = await resp.json()
                    data["forex"] = fx.get("rates", {})
    except Exception as e:
        print(f"[economy] Forex error: {e}")

    return data
