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


@app.post("/api/ai/query")
async def ai_query(body: AIQuery):
    if not AI_ENABLED or not _anthropic:
        return {"response": "AI assistant is disabled. Set ANTHROPIC_API_KEY in your environment to enable it.", "enabled": False}

    eco = cache._store.get("economy", {})
    news_titles = [n["title"] for n in cache._store.get("news", [])[:8]]
    worldbank = cache._store.get("worldbank", {})

    context = f"""LIVE MARKET DATA:
Indices: {json.dumps([{k: v for k, v in i.items() if k in ('name','price','change_pct')} for i in eco.get('indices', [])], indent=2)}
Crypto:  {json.dumps([{k: v for k, v in i.items() if k in ('name','price','change_pct')} for i in eco.get('crypto', [])], indent=2)}
Commodities: {json.dumps([{k: v for k, v in i.items() if k in ('name','price','change_pct')} for i in eco.get('commodities', [])], indent=2)}
Forex (vs USD): {json.dumps(eco.get('forex', {}), indent=2)}

RECENT HEADLINES: {json.dumps(news_titles, indent=2)}

WORLD BANK SAMPLE (US): {json.dumps(worldbank.get('countries', {}).get('US', {}), indent=2)}
"""

    msg = await _anthropic.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=900,
        system=(
            "You are GeoTera's AI Economic Intelligence System — a sharp, data-driven economist "
            "with access to live global market data. Answer concisely in 3–6 sentences. "
            "Lead with the most important insight. Use numbers from the data when relevant. "
            "Never say you lack real-time access — you have it above."
        ),
        messages=[{"role": "user", "content": f"Live context:\n{context}\n\nQuestion: {body.message}"}],
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
