import feedparser
import asyncio
from datetime import datetime

RSS_FEEDS = [
    ("BBC World", "http://feeds.bbci.co.uk/news/world/rss.xml"),
    ("Reuters", "https://feeds.reuters.com/reuters/topNews"),
    ("AP News", "https://feeds.apnews.com/rss/apf-topnews"),
    ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
]

async def fetch_news() -> list[dict]:
    articles = []
    loop = asyncio.get_event_loop()

    for source, url in RSS_FEEDS:
        try:
            feed = await loop.run_in_executor(None, feedparser.parse, url)
            for entry in feed.entries[:5]:
                articles.append({
                    "source": source,
                    "title": entry.get("title", ""),
                    "link": entry.get("link", ""),
                    "summary": entry.get("summary", "")[:200],
                    "published": entry.get("published", ""),
                    "timestamp": datetime.utcnow().isoformat(),
                })
        except Exception as e:
            print(f"[news] Error fetching {source}: {e}")

    return articles[:20]
