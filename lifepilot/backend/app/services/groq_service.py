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
    You are the central intelligence layer for an autonomous food delivery AI agent (TinyFish).
    Your goal is to parse the user's raw prompt into structured JSON while strictly applying their profile constraints.
    
    {profile_context}
    
    Instructions:
    1. If the user does not specify a diet, strictly enforce their profile diet.
    2. If the user does not specify a budget, use their profile default budget.
    3. If the user asks for "my favorite food", prioritize their Favorite Dishes.
    4. If the user mentions a location label (e.g. "Home"), replace it with the exact address from Saved Locations.
    5. Formulate an ULTRA-COMPRESSED 'agent_goal' string. Speed is your absolute priority. 
       Do NOT give complex step-by-step logic. Give direct, imperative commands and tell the agent to STOP immediately after finding just 3 matching results to save time.
       Example agent_goal: "Set location to 123 Main St. Search 'Chicken Biryani'. Find 3 results under 300 INR avoiding Peanuts. Extract JSON and STOP INSTANTLY."
    
    Extract the user's intent into the following JSON format:
    {{
        "category": "food category or specific item",
        "diet": "veg or non-veg",
        "budget": maximum price as a number,
        "location": "exact address or location",
        "task_type": "Discovery" or "Search",
        "agent_goal": "The highly specific instruction prompt for the TinyFish autonomous agent.",
        "preferred_platforms": ["Swiggy"] // array of strings based on profile
    }}
    Respond ONLY with valid JSON. Do not include any markdown formatting or extra text.
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
