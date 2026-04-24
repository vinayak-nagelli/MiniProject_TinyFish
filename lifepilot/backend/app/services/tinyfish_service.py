import asyncio
import urllib.parse
from tinyfish import TinyFish, CompleteEvent
from app.core.config import settings
from app.models.schemas import UserIntent, DealItem
import logging
from typing import List

logger = logging.getLogger(__name__)

# Two dedicated clients — one per platform for TRUE parallel execution
swiggy_client = TinyFish(api_key=settings.TINYFISH_API_KEY)
zomato_client = TinyFish(api_key=settings.TINYFISH_API_KEY_2 or settings.TINYFISH_API_KEY)


def _build_goal(platform: str, intent: UserIntent) -> str:
    """Builds a highly platform-specific, concise goal string for TinyFish."""
    base = intent.agent_goal or f"Search for {intent.category}. Diet: {intent.diet}. Budget under {intent.budget} INR."
    
    if platform == "Swiggy":
        return f"""
SPEED MODE: You are on Swiggy's search results page. Do the following instantly:
1. Look at the visible restaurant cards on screen. Do NOT scroll more than once.
2. Find up to 3 items matching: {base}
3. For each item extract: restaurant name, item name, price, delivery fee, discount, rating, and URL.
4. Return JSON immediately and STOP. Do not click anything else.
"""
    else:  # Zomato
        return f"""
SPEED MODE: You are on Zomato's search results page. Do the following instantly:
1. You will see restaurant cards. Do NOT scroll more than once.
2. Find up to 3 restaurants matching: {base}
3. For each result extract: restaurant name, item name (the searched dish), price, delivery fee, discount, rating, and URL.
4. Return JSON immediately and STOP. Do not open any restaurant. Do not click menus.
"""


def _run_agent_sync(platform: str, client: TinyFish, url: str, intent: UserIntent) -> List[DealItem]:
    """
    Synchronous function to run a TinyFish agent. Wrapped in a thread to avoid blocking FastAPI.
    """
    goal = _build_goal(platform, intent)
    
    # Log the exact prompt so you can monitor it in Render logs
    logger.info(f"\n{'='*60}\n🧠 PROMPT → {platform}:\n{goal}\n{'='*60}")

    output_format = """
    You MUST return ONLY valid JSON in this exact format, nothing else:
    {
        "results": [
            {
                "restaurant_name": "string",
                "item_name": "string",
                "price": number,
                "delivery_fee": number,
                "discount": number,
                "rating": number,
                "item_url": "string"
            }
        ]
    }
    """
    
    full_goal = goal + output_format
    deals = []
    
    try:
        with client.agent.stream(url=url, goal=full_goal) as stream:
            logger.info(f"⏳ {platform} agent started. Watching live...")
            for event in stream:
                if event.type.name == "STREAMING_URL":
                    logger.info(f"📺 LIVE → {platform}: {event.streaming_url}")
                if isinstance(event, CompleteEvent):
                    logger.info(f"✅ {platform} complete!")
                    result_data = event.result_json
                    for item in result_data.get("results", []):
                        deals.append(DealItem(
                            platform=platform,
                            restaurant_name=item.get("restaurant_name", "Unknown"),
                            item_name=item.get("item_name", "Unknown"),
                            price=float(item.get("price", 0)),
                            delivery_fee=float(item.get("delivery_fee", 0)),
                            discount=float(item.get("discount", 0)),
                            rating=float(item.get("rating", 0.0)),
                            item_url=item.get("item_url", url)
                        ))
                    break
    except Exception as e:
        logger.error(f"❌ {platform} agent error: {e}")

    return deals


async def run_swiggy_agent(intent: UserIntent) -> List[DealItem]:
    """Runs the Swiggy agent using the dedicated Swiggy TinyFish client."""
    search_query = urllib.parse.quote(intent.category)
    url = f"https://www.swiggy.com/search?query={search_query}"
    logger.info(f"🚀 Swiggy agent starting at: {url}")
    return await asyncio.to_thread(_run_agent_sync, "Swiggy", swiggy_client, url, intent)


async def run_zomato_agent(intent: UserIntent) -> List[DealItem]:
    """Runs the Zomato agent using the dedicated Zomato TinyFish client."""
    search_query = urllib.parse.quote(intent.category)
    
    # Extract city from intent location to build a direct city URL.
    # This avoids Zomato's generic-to-city redirect which causes TinyFish to spawn a 2nd browser session!
    city = "pune"  # Default fallback city
    if intent.location:
        # Try to extract last word from location as city (e.g. "pimpri chinchwad" -> "pimpri-chinchwad")
        city = intent.location.strip().lower().replace(" ", "-")
    
    # Direct city URL → no redirect → single browser session → saves 30-45 seconds!
    url = f"https://www.zomato.com/{city}/search?q={search_query}"
    logger.info(f"🚀 Zomato agent starting at: {url} (city-direct to avoid redirect)")
    return await asyncio.to_thread(_run_agent_sync, "Zomato", zomato_client, url, intent)
