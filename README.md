# GeoTera — Live World Data Dashboard

Real-time global dashboard tracking **News**, **Markets**, **Climate**, and **Population** via web scraping and open APIs. Data pushes to the browser instantly over WebSocket.

## Stack
- **Backend**: Python + FastAPI + APScheduler + WebSocket
- **Frontend**: Next.js 14 + Tailwind CSS + Recharts
- **Data sources**: BBC/Reuters/AP RSS · Yahoo Finance · Frankfurter FX · Open-Meteo · USGS · NOAA · REST Countries · WHO

## Quick Start

### 1. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Or on Windows, double-click `backend/start.bat`.

API available at `http://localhost:8000`
- `GET  /api/data`    — current cached data snapshot
- `POST /api/refresh` — trigger immediate re-scrape
- `WS   /ws`         — live data stream

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000**

## Data refresh
- Automatic every **15 minutes** via APScheduler
- Instant push to all connected browsers via WebSocket
- Manual refresh via the ↺ button in the header
