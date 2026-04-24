import json
from groq import AsyncGroq
from app.core.config import settings
from app.models.schemas import UserIntent
import logging

logger = logging.getLogger(__name__)

# Initialize the async Groq client
client = AsyncGroq(api_key=settings.GROQ_API_KEY)

async def parse_intent(user_input: str, user_profile: dict = None) -> UserIntent:
    """
    Uses LLaMA 3.3 70B via Groq to parse natural language into a structured JSON intent,
    injecting user constraints directly into the context window for TinyFish optimization.
    """
    logger.info(f"Parsing intent for input: {user_input}")
    
    if user_profile is None:
        user_profile = {}
        
    profile_context = f"""
    USER PROFILE CONSTRAINTS (MUST STRICTLY FOLLOW):
    - Diet: {user_profile.get('diet', 'Any')}
    - Spice Tolerance: {user_profile.get('spice_tolerance', 'Medium')}
    - Allergies/Avoid: {", ".join(user_profile.get('allergies', [])) if user_profile.get('allergies') else 'None'}
    - Default Budget: ₹{user_profile.get('default_budget_inr', 'Any')}
    - Favorite Dishes: {", ".join(user_profile.get('favorite_dishes', [])) if user_profile.get('favorite_dishes') else 'None'}
    - Preferred Platforms: {", ".join(user_profile.get('preferred_platforms', [])) if user_profile.get('preferred_platforms') else 'Any'}
    - Saved Locations: {[loc['name'] + ' - ' + loc['address'] for loc in user_profile.get('saved_locations', [])]}
    """
    
    system_prompt = f"""
    You are the AI brain of an autonomous food delivery agent. Your only job is to convert the user's raw text request into a structured JSON, following their saved profile constraints exactly.

    {profile_context}

    CRITICAL RULES:
    1. Diet: Always enforce profile diet UNLESS user explicitly overrides it.
    2. Budget: Use profile default budget if user doesn't mention one.
    3. Allergies: These are HARD blocks. They must ALWAYS appear in agent_goal as "STRICTLY AVOID [allergy]".
    4. RESTAURANT vs LOCATION DETECTION (very important!):
       - If user says "in hotel X", "at restaurant X", "from cafe X" → X is a RESTAURANT NAME, NOT a delivery location.
       - If user says "deliver to X", "near X", "in [city/area]" → X is a DELIVERY LOCATION.
       - Only replace with saved address if user says a saved location label like "Home" or "Office".
    5. AGENT GOAL FORMAT: The agent_goal will be injected into a browser AI that is ALREADY on the search results page of Swiggy or Zomato. So:
       - DO NOT say "go to Swiggy" or "open Zomato" — the agent is already there.
       - DO NOT say "set location" — location is already set by the search URL.
       - If user mentioned a restaurant: start with "Look for items ONLY from [Restaurant Name] in the visible results."
       - Keep it under 3 sentences. Be imperative and direct.
       - Always end with: "Find 3 results. Extract JSON and STOP."

    GOOD example (restaurant filter):
    User: "best veg dish in hotel Ajinkya with discount"
    agent_goal: "Look for items ONLY from Hotel Ajinkya in the visible results. Filter for veg dishes with maximum discount. Find 3 results. Extract JSON and STOP."

    GOOD example (general search):
    User: "chicken biryani under 250"
    agent_goal: "Find veg chicken biryani under ₹250. STRICTLY AVOID Peanuts. Find 3 results. Extract JSON and STOP."

    Extract the user's intent into the following JSON:
    {{
        "category": "specific food item or dish name",
        "diet": "veg or non-veg",
        "budget": maximum price as a number or null,
        "location": "delivery address if explicitly mentioned, else null",
        "task_type": "Discovery or Search",
        "agent_goal": "concise 2-3 sentence TinyFish browser instruction",
        "preferred_platforms": ["Swiggy", "Zomato"] // based on profile, or both if not specified
    }}
    Respond ONLY with valid JSON. No markdown, no explanation.
    """
    
    try:
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_input}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON response
        result_json = json.loads(response.choices[0].message.content)
        intent = UserIntent(**result_json)
        return intent
        
    except Exception as e:
        logger.error(f"Error parsing intent: {e}")
        # Fallback or raise error
        raise ValueError("Failed to parse intent")
