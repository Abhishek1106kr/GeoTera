import asyncio
import json
import logging
from contextlib import asynccontextmanager
from typing import Set
from pydantic import BaseModel
import asyncio

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

import cache
from scrapers.news import fetch_news
from scrapers.economy import fetch_economy
from scrapers.climate import fetch_climate
from scrapers.population import fetch_population
from scrapers.about import send_subscription_email

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("geoterra")

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


async def scrape_all():
    logger.info("Starting full scrape cycle...")
    try:
        news, economy, climate, population = await asyncio.gather(
            fetch_news(),
            fetch_economy(),
            fetch_climate(),
            fetch_population(),
            return_exceptions=True,
        )

        if not isinstance(news, Exception):
            cache.update("news", news)
        if not isinstance(economy, Exception):
            cache.update("economy", economy)
        if not isinstance(climate, Exception):
            cache.update("climate", climate)
        if not isinstance(population, Exception):
            cache.update("population", population)

        await broadcast({"type": "update", "data": cache.get_all()})
        logger.info("Scrape cycle complete, broadcasted to %d clients", len(connected_clients))
    except Exception as e:
        logger.error("Scrape cycle error: %s", e)


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initial scrape on startup
    asyncio.create_task(scrape_all())
    scheduler.add_job(scrape_all, "interval", minutes=15, id="scrape_all")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(title="GeoTera API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/data")
async def get_data():
    return cache.get_all()


@app.post("/api/refresh")
async def trigger_refresh():
    asyncio.create_task(scrape_all())
    return {"status": "refresh triggered"}

class SubscribeRequest(BaseModel):
    email: str

@app.post("/api/subscribe")
async def subscribe_user(req: SubscribeRequest):
    try:
        loop = asyncio.get_event_loop()
        # run blocking smtplib call in threadpool
        await loop.run_in_executor(None, send_subscription_email, req.email)
        return {"status": "success", "message": "Subscription confirmed"}
    except Exception as e:
        logger.error("Subscription error: %s", e)
        # We can return an error or fake success if the SMTP isn't configured
        return {"status": "error", "message": str(e)}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    logger.info("Client connected. Total: %d", len(connected_clients))

    # Send current cached data immediately on connect
    current = cache.get_all()
    if current.get("last_updated"):
        await websocket.send_text(json.dumps({"type": "update", "data": current}))

    try:
        while True:
            # Keep connection alive, handle ping/pong
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        connected_clients.discard(websocket)
        logger.info("Client disconnected. Total: %d", len(connected_clients))
    except Exception as e:
        connected_clients.discard(websocket)
        logger.error("WebSocket error: %s", e)
