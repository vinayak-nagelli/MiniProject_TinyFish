import asyncio
from tinyfish import TinyFish, CompleteEvent
from app.core.config import settings
from app.models.schemas import UserIntent, DealItem
import logging
from typing import List

logger = logging.getLogger(__name__)

# Initialize the official TinyFish client
client = TinyFish(api_key=settings.TINYFISH_API_KEY)

def _run_agent_sync(platform: str, url: str, intent: UserIntent) -> List[DealItem]:
    """
    Synchronous function to run the TinyFish agent. We will wrap this in a thread
    so it doesn't block the FastAPI async event loop.
    # Log the exact prompt being sent to TinyFish so the user can see it!
    logger.info(f"\n{'='*50}\n🧠 SENDING THIS EXACT PROMPT TO {platform} TINYFISH:\n{intent.agent_goal}\n{'='*50}\n")
    
    goal = f"""
    [CRITICAL SPEED OVERRIDE]: Execute as fast as physically possible. Do NOT explore or scroll excessively. Once you find 3 valid items, extract them and STOP INSTANTLY.
    
    {intent.agent_goal if intent.agent_goal else f"Search for {intent.category}. Diet: {intent.diet}. Budget under {intent.budget} INR."}
    
    You MUST return the result strictly in this exact JSON format:
    {{
        "results": [
            {{
                "restaurant_name": "string",
                "item_name": "string",
                "price": number (extract just the number),
                "delivery_fee": number (extract just the number, 0 if free),
                "discount": number (extract just the number, 0 if none),
                "rating": number (e.g. 4.5),
                "item_url": "string (url to the item or restaurant)"
            }}
        ]
    }}
    """

    deals = []
    try:
        # Using the streaming SDK client exactly as documented
        with client.agent.stream(url=url, goal=goal) as stream:
            logger.info(f"⏳ Connected to {platform}. Agent is analyzing intent and navigating...")
            
            for event in stream:
                if event.type.name == "STREAMING_URL":
                    # You can watch the agent live!
                    logger.info(f"📺 WATCH LIVE ON {platform}: {event.streaming_url}")

                if isinstance(event, CompleteEvent):
                    logger.info(f"✅ {platform} Task Complete!")
                    result_data = event.result_json
                    
                    # Parse the results array
                    for item in result_data.get("results", []):
                        deals.append(DealItem(
                            platform=platform,
                            restaurant_name=item.get("restaurant_name", "Unknown Restaurant"),
                            item_name=item.get("item_name", "Unknown Item"),
                            price=float(item.get("price", 0)),
                            delivery_fee=float(item.get("delivery_fee", 0)),
                            discount=float(item.get("discount", 0)),
                            rating=float(item.get("rating", 0.0)),
                            item_url=item.get("item_url", url)
                        ))
                    break 
                    
    except Exception as e:
        logger.error(f"❌ Error running {platform} agent: {e}")
        
    return deals

async def run_swiggy_agent(intent: UserIntent) -> List[DealItem]:
    """
    Triggers the headless web agent on Swiggy using TinyFish SDK.
    """
    import urllib.parse
    search_query = urllib.parse.quote(intent.category)
    # Start directly on the search page to skip 4 steps and save 30 seconds!
    direct_url = f"https://www.swiggy.com/search?query={search_query}"
    return await asyncio.to_thread(_run_agent_sync, "Swiggy", direct_url, intent)

async def run_zomato_agent(intent: UserIntent) -> List[DealItem]:
    """
    Triggers the headless web agent on Zomato using TinyFish SDK.
    """
    import urllib.parse
    search_query = urllib.parse.quote(intent.category)
    # Start directly on the search page to skip Zomato's complex homepage UI
    direct_url = f"https://www.zomato.com/search?q={search_query}"
    return await asyncio.to_thread(_run_agent_sync, "Zomato", direct_url, intent)
