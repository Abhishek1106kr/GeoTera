import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Set

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import cache
from scrapers.news import fetch_news
from scrapers.economy import fetch_economy
from scrapers.climate import fetch_climate
from scrapers.population import fetch_population
from scrapers.worldbank import fetch_worldbank

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("geoterra")

# ── AI setup ────────────────────────────────────────────────────────────────
try:
    from anthropic import AsyncAnthropic
    _anthropic = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY", ""))
    AI_ENABLED = bool(os.getenv("ANTHROPIC_API_KEY"))
    logger.info("AI assistant %s", "enabled" if AI_ENABLED else "disabled (no ANTHROPIC_API_KEY)")
except ImportError:
    _anthropic = None  # type: ignore
    AI_ENABLED = False

# ── WebSocket hub ────────────────────────────────────────────────────────────
connected_clients: Set[WebSocket] = set()


async def broadcast(data: dict):
    if not connected_clients:
        return
    payload = json.dumps(data)
    dead = set()
    for ws in connected_clients:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.add(ws)
    connected_clients.difference_update(dead)


# ── Scrape loop ──────────────────────────────────────────────────────────────
async def scrape_all():
    logger.info("Starting full scrape cycle…")
    try:
        news, economy, climate, population, worldbank = await asyncio.gather(
            fetch_news(), fetch_economy(), fetch_climate(),
            fetch_population(), fetch_worldbank(),
            return_exceptions=True,
        )
        if not isinstance(news, Exception):       cache.update("news", news)
        if not isinstance(economy, Exception):    cache.update("economy", economy)
        if not isinstance(climate, Exception):    cache.update("climate", climate)
        if not isinstance(population, Exception): cache.update("population", population)
        if not isinstance(worldbank, Exception):  cache.update("worldbank", worldbank)

        await broadcast({"type": "update", "data": cache.get_all()})
        logger.info("Scrape done → %d clients", len(connected_clients))
    except Exception as e:
        logger.error("Scrape error: %s", e)


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(scrape_all())
    scheduler.add_job(scrape_all, "interval", minutes=15, id="scrape_all")
    scheduler.start()
    yield
    scheduler.shutdown()


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="GeoTera API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)


@app.get("/api/data")
async def get_data():
    return cache.get_all()


@app.post("/api/refresh")
async def trigger_refresh():
    asyncio.create_task(scrape_all())
    return {"status": "refresh triggered"}


# ── AI endpoint ───────────────────────────────────────────────────────────────
class AIQuery(BaseModel):
    message: str
    context: str | None = None


@app.post("/api/ai/query")
async def ai_query(body: AIQuery):
    if not AI_ENABLED or not _anthropic:
        return {"response": "AI assistant is disabled. Set ANTHROPIC_API_KEY in your environment to enable it.", "enabled": False}

    eco = cache._store.get("economy", {})
    news_titles = [n["title"] for n in cache._store.get("news", [])[:12]]
    worldbank = cache._store.get("worldbank", {})
    macro = eco.get("macro", {})

    def _fmt(items: list, keys: tuple = ("name", "price", "change_pct")) -> str:
        return json.dumps([{k: v for k, v in i.items() if k in keys} for i in items], indent=2)

    wb_sample = {
        code: worldbank.get("countries", {}).get(code, {})
        for code in ("US", "CN", "IN", "DE", "BR", "JP")
    }

    client_ctx = f"\n\nUser dashboard context: {body.context}" if body.context else ""

    context = f"""=== LIVE GEOTERRA MARKET DATA ===
INDICES:     {_fmt(eco.get('indices', []))}
CRYPTO:      {_fmt(eco.get('crypto', []))}
COMMODITIES: {_fmt(eco.get('commodities', []))}
S&P SECTORS: {_fmt(eco.get('sectors', []), ('name', 'change_pct'))}

MACRO INDICATORS:
  VIX (Volatility):   {macro.get('vix')} {"(HIGH FEAR)" if (macro.get('vix') or 0) > 30 else ""}
  DXY (Dollar Index): {macro.get('dxy')}
  10Y Treasury Yield: {macro.get('treasury_10y')}%
  2Y Treasury Yield:  {macro.get('treasury_2y')}%
  Yield Curve Status: {"INVERTED (recession signal!)" if (macro.get('treasury_2y') or 0) > (macro.get('treasury_10y') or 999) else "Normal"}
  Fear & Greed Index: {macro.get('fear_greed')}/100

FOREX (1 USD =): {json.dumps(eco.get('forex', {}), indent=2)}

RECENT HEADLINES: {json.dumps(news_titles, indent=2)}

WORLD BANK DATA (key economies):
{json.dumps(wb_sample, indent=2)}{client_ctx}
"""

    msg = await _anthropic.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=(
            "You are GeoTera's AI Economic Intelligence System — a sharp, data-driven macro economist "
            "with live access to global markets, treasuries, and World Bank data. "
            "Lead with the single most important insight. Use specific numbers from the live data. "
            "Be concise (4–7 sentences max). Use bullet points for comparisons or lists. "
            "Never say you lack real-time access — the data above is live."
        ),
        messages=[{"role": "user", "content": f"Live data:\n{context}\n\nQuestion: {body.message}"}],
    )
    return {"response": msg.content[0].text, "enabled": True}


# ── WebSocket ─────────────────────────────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    logger.info("Client connected. Total: %d", len(connected_clients))
    current = cache.get_all()
    if current.get("last_updated"):
        await websocket.send_text(json.dumps({"type": "update", "data": current}))
    try:
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connected_clients.discard(websocket)
    except Exception:
        connected_clients.discard(websocket)
