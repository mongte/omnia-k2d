import feedparser
import requests
from datetime import datetime

def fetch_rss_news(feed_url: str, limit: int = 5) -> list[dict]:
    """Fetch news from generic RSS feed."""
    try:
        # Use requests to get content with a user agent to avoid blocking
        response = requests.get(feed_url, headers={'User-Agent': 'PharosAgent/1.0'})
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        items = []
        
        for entry in feed.entries[:limit]:
            # Extract basic info
            published = getattr(entry, 'published', getattr(entry, 'updated', str(datetime.now())))
            
            # Basic cleanup of summary/description
            summary = getattr(entry, 'summary', getattr(entry, 'description', ''))
            
            items.append({
                "title": entry.title,
                "link": entry.link,
                "summary": summary,
                "published": published
            })
            
        return items
    except Exception as e:
        print(f"Error fetching RSS from {feed_url}: {e}")
        return []

def fetch_crypto_news(limit: int = 5) -> list[dict]:
    """Fetch crypto news from CoinDesk."""
    return fetch_rss_news("https://www.coindesk.com/arc/outboundfeeds/rss", limit)

def fetch_market_news(limit: int = 5) -> list[dict]:
    """Fetch market news from Google News (Finance)."""
    return fetch_rss_news("https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWvfSkwyMHZNRGx6TVdZU0FBUWlHZ0pMVWlnQVAB?hl=en-US&gl=US&ceid=US:en", limit)
