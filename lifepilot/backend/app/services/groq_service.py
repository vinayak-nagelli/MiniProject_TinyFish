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

    allergies = ", ".join(user_profile.get('allergies', [])) or 'None'
    favorite_dishes = ", ".join(user_profile.get('favorite_dishes', [])) or 'None'
    preferred_platforms = ", ".join(user_profile.get('preferred_platforms', [])) or 'Swiggy, Zomato'
    saved_locations = [loc['name'] + ' = ' + loc['address'] for loc in user_profile.get('saved_locations', [])]
    saved_locations_str = ", ".join(saved_locations) if saved_locations else 'None'
    diet = user_profile.get('diet', 'Any')
    budget = user_profile.get('default_budget_inr', 500)

    system_prompt = f"""You are the AI brain of an autonomous food delivery agent. Convert the user's request into a structured JSON object following their profile constraints.

USER PROFILE:
- Diet: {diet}
- Allergies: {allergies}
- Default Budget: {budget} INR
- Favorite Dishes: {favorite_dishes}
- Preferred Platforms: {preferred_platforms}
- Saved Locations: {saved_locations_str}

RULES:
1. Enforce profile diet unless the user explicitly overrides it.
2. Use profile default budget if user does not specify one.
3. Allergies are HARD BLOCKS. Always write them as: STRICTLY AVOID [allergy].
4. RESTAURANT vs LOCATION: If the user says "in hotel X" or "at cafe X", X is a RESTAURANT NAME to filter by, NOT a delivery address. Only treat it as a delivery address if it matches a saved location label like "Home" or "Office".
5. The agent_goal is injected into a browser AI that is already on the search results page. So NEVER say "go to Swiggy" or "set location". Write it as if the agent is already seeing search results on screen.
6. Keep agent_goal under 3 direct sentences. Always end with: "Find 3 results. Extract JSON and STOP."

EXAMPLES:
- User says "best veg dish in hotel Ajinkya with discount" -> agent_goal: "Look ONLY at results from Hotel Ajinkya. Find veg dishes with the highest discount. Find 3 results. Extract JSON and STOP."
- User says "chicken biryani under 300" -> agent_goal: "Find non-veg chicken biryani under 300 INR. STRICTLY AVOID Peanuts. Find 3 results. Extract JSON and STOP."

Return ONLY this JSON with no extra text, comments, or markdown:
{{
    "category": "specific food item name",
    "diet": "veg or non-veg",
    "budget": 500,
    "location": null,
    "task_type": "Search",
    "agent_goal": "2-3 sentence TinyFish instruction ending with Extract JSON and STOP.",
    "preferred_platforms": ["Swiggy", "Zomato"]
}}"""

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
        
        result_json = json.loads(response.choices[0].message.content)
        logger.info(f"Groq output: {result_json}")
        
        # Ensure preferred_platforms is always a list
        if not isinstance(result_json.get("preferred_platforms"), list):
            result_json["preferred_platforms"] = ["Swiggy", "Zomato"]
        
        # Ensure budget is always a number
        if result_json.get("budget") is None:
            result_json["budget"] = budget
        
        # Clean up string 'null' that Groq sometimes outputs
        if result_json.get("location") in ["null", "None", ""]:
            result_json["location"] = None

        # Ensure task_type has a valid value
        if not result_json.get("task_type"):
            result_json["task_type"] = "Search"

        logger.info(f"Final intent going to TinyFish: category={result_json.get('category')}, agent_goal={result_json.get('agent_goal')}")
        intent = UserIntent(**result_json)
        return intent
        
    except Exception as e:
        logger.error(f"Error parsing intent: {e}")
        raise ValueError(f"Failed to parse intent: {str(e)}")
