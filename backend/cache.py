from datetime import datetime

_store: dict = {
    "news": [],
    "economy": {},
    "climate": {},
    "population": {},
    "worldbank": {},
    "last_updated": None,
}

def get_all() -> dict:
    return {**_store, "last_updated": _store["last_updated"]}

def update(key: str, value):
    _store[key] = value
    _store["last_updated"] = datetime.utcnow().isoformat()
