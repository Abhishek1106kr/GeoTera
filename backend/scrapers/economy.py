import asyncio
import aiohttp
from datetime import datetime

INDICES = [
    "^GSPC",   # S&P 500
    "^DJI",    # Dow Jones
    "^IXIC",   # NASDAQ
    "^FTSE",   # FTSE 100
    "^N225",   # Nikkei 225
    "^HSI",    # Hang Seng
    "^DAX",    # DAX
    "^NSEI",   # NIFTY 50
]

CRYPTO = [
    "BTC-USD",
    "ETH-USD",
    "SOL-USD",
    "BNB-USD",
]

COMMODITIES = [
    "GC=F",   # Gold
    "CL=F",   # Crude Oil
    "SI=F",   # Silver
    "NG=F",   # Natural Gas
    "HG=F",   # Copper
    "ZW=F",   # Wheat
]

MACRO_SYMBOLS = [
    "^VIX",       # CBOE Volatility Index
    "DX-Y.NYB",   # US Dollar Index
    "^TNX",       # 10-Year Treasury Yield
    "^IRX",       # 13-Week T-Bill (short-term rate proxy)
    "^FVX",       # 5-Year Treasury Yield
    "^TYX",       # 30-Year Treasury Yield
]

SECTOR_SYMBOLS = [
    "XLK",    # Technology
    "XLF",    # Financials
    "XLE",    # Energy
    "XLV",    # Health Care
    "XLI",    # Industrials
    "XLC",    # Communication
    "XLP",    # Consumer Staples
    "XLY",    # Consumer Discretionary
    "XLRE",   # Real Estate
    "XLB",    # Materials
    "XLU",    # Utilities
]

NAMES: dict[str, str] = {
    "^GSPC": "S&P 500", "^DJI": "Dow Jones", "^IXIC": "NASDAQ",
    "^FTSE": "FTSE 100", "^N225": "Nikkei 225", "^HSI": "Hang Seng",
    "^DAX": "DAX", "^NSEI": "NIFTY 50",
    "BTC-USD": "Bitcoin", "ETH-USD": "Ethereum", "SOL-USD": "Solana", "BNB-USD": "BNB",
    "GC=F": "Gold", "CL=F": "Crude Oil", "SI=F": "Silver",
    "NG=F": "Nat Gas", "HG=F": "Copper", "ZW=F": "Wheat",
    "^VIX": "VIX", "DX-Y.NYB": "DXY",
    "^TNX": "10Y Yield", "^IRX": "3M T-Bill", "^FVX": "5Y Yield", "^TYX": "30Y Yield",
    "XLK": "Technology", "XLF": "Financials", "XLE": "Energy",
    "XLV": "Health Care", "XLI": "Industrials", "XLC": "Communication",
    "XLP": "Cons. Staples", "XLY": "Cons. Discret.", "XLRE": "Real Estate",
    "XLB": "Materials", "XLU": "Utilities",
}


async def fetch_economy() -> dict:
    data: dict = {
        "indices":    [],
        "crypto":     [],
        "commodities": [],
        "sectors":    [],
        "forex":      {},
        "macro": {
            "vix":          None,
            "dxy":          None,
            "treasury_10y": None,
            "treasury_2y":  None,
            "treasury_5y":  None,
            "treasury_30y": None,
            "fear_greed":   None,
        },
        "timestamp": datetime.utcnow().isoformat(),
    }

    all_symbols = INDICES + CRYPTO + COMMODITIES + MACRO_SYMBOLS + SECTOR_SYMBOLS

    try:
        import yfinance as yf
        loop = asyncio.get_event_loop()

        def _fetch():
            result: dict[str, dict] = {}
            tickers = yf.Tickers(" ".join(all_symbols))
            for sym in all_symbols:
                try:
                    info = tickers.tickers[sym].fast_info
                    price = info.last_price
                    prev  = info.previous_close
                    result[sym] = {
                        "price":      round(float(price), 4) if price else None,
                        "change_pct": round(((price - prev) / prev * 100), 2) if price and prev else None,
                    }
                except Exception:
                    result[sym] = {"price": None, "change_pct": None}
            return result

        quotes = await loop.run_in_executor(None, _fetch)

        for sym in INDICES:
            data["indices"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})
        for sym in CRYPTO:
            data["crypto"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})
        for sym in COMMODITIES:
            data["commodities"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})
        for sym in SECTOR_SYMBOLS:
            data["sectors"].append({"symbol": sym, "name": NAMES[sym], **quotes.get(sym, {})})

        # Extract macro indicators
        vix  = quotes.get("^VIX",     {}).get("price")
        dxy  = quotes.get("DX-Y.NYB", {}).get("price")
        t10y = quotes.get("^TNX",     {}).get("price")
        t3m  = quotes.get("^IRX",     {}).get("price")
        t5y  = quotes.get("^FVX",     {}).get("price")
        t30y = quotes.get("^TYX",     {}).get("price")

        data["macro"]["vix"]          = round(float(vix),  2) if vix  else None
        data["macro"]["dxy"]          = round(float(dxy),  2) if dxy  else None
        data["macro"]["treasury_10y"] = round(float(t10y), 3) if t10y else None
        data["macro"]["treasury_2y"]  = round(float(t3m),  3) if t3m  else None
        data["macro"]["treasury_5y"]  = round(float(t5y),  3) if t5y  else None
        data["macro"]["treasury_30y"] = round(float(t30y), 3) if t30y else None

        # Fear & Greed Index computed from VIX (inverted: low VIX = greed, high VIX = fear)
        if vix:
            v = float(vix)
            if   v < 12:  fg = min(99, 88 + int((12 - v) * 1.5))
            elif v < 15:  fg = int(80 - (v - 12) * 5)
            elif v < 20:  fg = int(65 - (v - 15) * 4)
            elif v < 25:  fg = int(45 - (v - 20) * 4)
            elif v < 30:  fg = int(25 - (v - 25) * 2)
            elif v < 40:  fg = int(15 - (v - 30) * 0.8)
            else:         fg = max(2, 7 - int((v - 40) * 0.2))
            data["macro"]["fear_greed"] = max(0, min(100, fg))

    except Exception as e:
        print(f"[economy] yfinance error: {e}")

    # Forex via Frankfurter (free, no API key)
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://api.frankfurter.app/latest?from=USD&to=EUR,GBP,JPY,INR,CNY,AUD,CHF,CAD,KRW,BRL,MXN",
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                if resp.status == 200:
                    fx = await resp.json()
                    data["forex"] = fx.get("rates", {})
    except Exception as e:
        print(f"[economy] Forex error: {e}")

    return data
