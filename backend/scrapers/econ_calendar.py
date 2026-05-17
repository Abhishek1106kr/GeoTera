"""Static economic calendar — major events through end of 2026."""

EVENTS = [
    # ── FOMC Meetings ──────────────────────────────────────────────────────────
    {"date": "2026-06-17", "time": "14:00", "event": "FOMC Rate Decision", "country": "US", "impact": "HIGH", "prev": "4.25%", "expected": "4.25%", "actual": None},
    {"date": "2026-06-18", "time": "14:30", "event": "Fed Chair Press Conference", "country": "US", "impact": "HIGH", "prev": None, "expected": None, "actual": None},
    {"date": "2026-07-29", "time": "14:00", "event": "FOMC Rate Decision", "country": "US", "impact": "HIGH", "prev": "4.25%", "expected": "4.00%", "actual": None},
    {"date": "2026-09-16", "time": "14:00", "event": "FOMC Rate Decision", "country": "US", "impact": "HIGH", "prev": "4.00%", "expected": "3.75%", "actual": None},
    {"date": "2026-11-04", "time": "14:00", "event": "FOMC Rate Decision", "country": "US", "impact": "HIGH", "prev": "3.75%", "expected": "3.75%", "actual": None},
    {"date": "2026-12-16", "time": "14:00", "event": "FOMC Rate Decision", "country": "US", "impact": "HIGH", "prev": "3.75%", "expected": "3.50%", "actual": None},
    # ── CPI Releases ───────────────────────────────────────────────────────────
    {"date": "2026-05-13", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.8%", "expected": "2.6%", "actual": "2.5%"},
    {"date": "2026-06-11", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.5%", "expected": "2.4%", "actual": None},
    {"date": "2026-07-15", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.4%", "expected": "2.3%", "actual": None},
    {"date": "2026-08-13", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.3%", "expected": "2.2%", "actual": None},
    {"date": "2026-09-10", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.2%", "expected": "2.1%", "actual": None},
    {"date": "2026-10-14", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.1%", "expected": "2.0%", "actual": None},
    {"date": "2026-11-12", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.0%", "expected": "2.0%", "actual": None},
    {"date": "2026-12-10", "time": "08:30", "event": "CPI (YoY)", "country": "US", "impact": "HIGH", "prev": "2.0%", "expected": "2.0%", "actual": None},
    # ── Non-Farm Payrolls ──────────────────────────────────────────────────────
    {"date": "2026-06-05", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "185K", "expected": "175K", "actual": None},
    {"date": "2026-07-10", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "175K", "expected": "170K", "actual": None},
    {"date": "2026-08-07", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "170K", "expected": "168K", "actual": None},
    {"date": "2026-09-04", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "168K", "expected": "165K", "actual": None},
    {"date": "2026-10-02", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "165K", "expected": "162K", "actual": None},
    {"date": "2026-11-06", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "162K", "expected": "160K", "actual": None},
    {"date": "2026-12-04", "time": "08:30", "event": "Non-Farm Payrolls", "country": "US", "impact": "HIGH", "prev": "160K", "expected": "158K", "actual": None},
    # ── GDP ────────────────────────────────────────────────────────────────────
    {"date": "2026-05-29", "time": "08:30", "event": "GDP Q1 (2nd Est.)", "country": "US", "impact": "HIGH", "prev": "1.9%", "expected": "2.1%", "actual": None},
    {"date": "2026-07-29", "time": "08:30", "event": "GDP Q2 Advance", "country": "US", "impact": "HIGH", "prev": "2.1%", "expected": "2.3%", "actual": None},
    {"date": "2026-10-29", "time": "08:30", "event": "GDP Q3 Advance", "country": "US", "impact": "HIGH", "prev": "2.3%", "expected": "2.2%", "actual": None},
    # ── ECB ────────────────────────────────────────────────────────────────────
    {"date": "2026-06-05", "time": "13:15", "event": "ECB Rate Decision", "country": "EU", "impact": "HIGH", "prev": "2.65%", "expected": "2.40%", "actual": None},
    {"date": "2026-07-24", "time": "13:15", "event": "ECB Rate Decision", "country": "EU", "impact": "HIGH", "prev": "2.40%", "expected": "2.15%", "actual": None},
    {"date": "2026-09-11", "time": "13:15", "event": "ECB Rate Decision", "country": "EU", "impact": "HIGH", "prev": "2.15%", "expected": "2.00%", "actual": None},
    {"date": "2026-10-23", "time": "13:15", "event": "ECB Rate Decision", "country": "EU", "impact": "HIGH", "prev": "2.00%", "expected": "2.00%", "actual": None},
    {"date": "2026-12-11", "time": "13:15", "event": "ECB Rate Decision", "country": "EU", "impact": "HIGH", "prev": "2.00%", "expected": "1.75%", "actual": None},
    # ── Bank of England ────────────────────────────────────────────────────────
    {"date": "2026-06-19", "time": "12:00", "event": "BoE Rate Decision", "country": "UK", "impact": "HIGH", "prev": "4.25%", "expected": "4.00%", "actual": None},
    {"date": "2026-08-06", "time": "12:00", "event": "BoE Rate Decision", "country": "UK", "impact": "HIGH", "prev": "4.00%", "expected": "3.75%", "actual": None},
    {"date": "2026-09-17", "time": "12:00", "event": "BoE Rate Decision", "country": "UK", "impact": "HIGH", "prev": "3.75%", "expected": "3.75%", "actual": None},
    # ── PCE ────────────────────────────────────────────────────────────────────
    {"date": "2026-05-29", "time": "08:30", "event": "Core PCE Price Index", "country": "US", "impact": "HIGH", "prev": "2.6%", "expected": "2.5%", "actual": None},
    {"date": "2026-06-26", "time": "08:30", "event": "Core PCE Price Index", "country": "US", "impact": "HIGH", "prev": "2.5%", "expected": "2.4%", "actual": None},
    {"date": "2026-07-31", "time": "08:30", "event": "Core PCE Price Index", "country": "US", "impact": "HIGH", "prev": "2.4%", "expected": "2.3%", "actual": None},
    {"date": "2026-08-28", "time": "08:30", "event": "Core PCE Price Index", "country": "US", "impact": "HIGH", "prev": "2.3%", "expected": "2.2%", "actual": None},
    # ── PPI ────────────────────────────────────────────────────────────────────
    {"date": "2026-06-12", "time": "08:30", "event": "PPI (YoY)", "country": "US", "impact": "MED", "prev": "2.4%", "expected": "2.2%", "actual": None},
    {"date": "2026-07-14", "time": "08:30", "event": "PPI (YoY)", "country": "US", "impact": "MED", "prev": "2.2%", "expected": "2.0%", "actual": None},
    # ── Retail Sales ───────────────────────────────────────────────────────────
    {"date": "2026-05-16", "time": "08:30", "event": "Retail Sales (MoM)", "country": "US", "impact": "MED", "prev": "0.6%", "expected": "0.4%", "actual": "0.3%"},
    {"date": "2026-06-16", "time": "08:30", "event": "Retail Sales (MoM)", "country": "US", "impact": "MED", "prev": "0.3%", "expected": "0.4%", "actual": None},
    {"date": "2026-07-16", "time": "08:30", "event": "Retail Sales (MoM)", "country": "US", "impact": "MED", "prev": "0.4%", "expected": "0.3%", "actual": None},
    # ── ISM / PMI ──────────────────────────────────────────────────────────────
    {"date": "2026-06-01", "time": "10:00", "event": "ISM Manufacturing PMI", "country": "US", "impact": "MED", "prev": "49.8", "expected": "50.2", "actual": None},
    {"date": "2026-06-03", "time": "10:00", "event": "ISM Services PMI", "country": "US", "impact": "MED", "prev": "51.6", "expected": "51.8", "actual": None},
    {"date": "2026-07-01", "time": "10:00", "event": "ISM Manufacturing PMI", "country": "US", "impact": "MED", "prev": "50.2", "expected": "50.5", "actual": None},
    # ── Consumer Confidence ────────────────────────────────────────────────────
    {"date": "2026-05-27", "time": "10:00", "event": "Consumer Confidence", "country": "US", "impact": "MED", "prev": "98.4", "expected": "99.1", "actual": None},
    {"date": "2026-06-24", "time": "10:00", "event": "Consumer Confidence", "country": "US", "impact": "MED", "prev": "99.1", "expected": "100.2", "actual": None},
    # ── Jackson Hole ───────────────────────────────────────────────────────────
    {"date": "2026-08-27", "time": "10:00", "event": "Fed Jackson Hole Symposium", "country": "US", "impact": "HIGH", "prev": None, "expected": None, "actual": None},
    {"date": "2026-08-28", "time": "10:00", "event": "Fed Chair Speech (JH)", "country": "US", "impact": "HIGH", "prev": None, "expected": None, "actual": None},
]


def get_econ_calendar(limit: int = 20) -> list[dict]:
    """Return upcoming events sorted by date, capped at limit."""
    from datetime import date
    today = date.today().isoformat()
    upcoming = [e for e in EVENTS if e["date"] >= today]
    upcoming.sort(key=lambda e: (e["date"], e["time"]))
    return upcoming[:limit]
