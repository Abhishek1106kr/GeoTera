import asyncio
import math
from datetime import datetime


def _safe(val) -> float | None:
    try:
        f = float(val)
        return None if (math.isnan(f) or math.isinf(f)) else f
    except Exception:
        return None


async def fetch_market_history(
    symbol: str,
    period: str = "5d",
    interval: str = "1h",
) -> dict:
    """Fetch OHLCV history for any yfinance-compatible symbol."""
    loop = asyncio.get_event_loop()

    def _fetch():
        import yfinance as yf
        try:
            hist = yf.Ticker(symbol).history(period=period, interval=interval)
            if hist.empty:
                return []
            rows = []
            for idx, row in hist.iterrows():
                c = _safe(row.get("Close"))
                if c is None:
                    continue
                rows.append({
                    "time":   idx.isoformat(),
                    "open":   round(_safe(row.get("Open"))   or c, 4),
                    "high":   round(_safe(row.get("High"))   or c, 4),
                    "low":    round(_safe(row.get("Low"))    or c, 4),
                    "close":  round(c, 4),
                    "volume": int(_safe(row.get("Volume")) or 0),
                })
            return rows
        except Exception as e:
            print(f"[history] {symbol}: {e}")
            return []

    data = await loop.run_in_executor(None, _fetch)
    return {"symbol": symbol, "period": period, "interval": interval, "data": data}
