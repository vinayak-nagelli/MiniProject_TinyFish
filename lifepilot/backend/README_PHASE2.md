# Phase 2: Core Services (The Brains)

We've successfully built the "intelligence" of the application! Here is the breakdown:

## What We Built

1. **`app/models/schemas.py`**
   - **What it does:** Defines the "blueprints" for the data our app will handle. It specifies exactly what a `UserIntent` (the parsed user command) and a `DealItem` (a food result) should look like.
   - **Why it matters:** It acts as a safety check, ensuring the AI and the databases always send and receive data in the correct, expected format.

2. **`app/services/groq_service.py`**
   - **What it does:** Connects to the Groq API (using the extremely fast LLaMA 3.3 70B AI model). It takes raw text like "Find me veg biryani under ₹200" and magically transforms it into a clean JSON object (extracting the budget, diet, and category).
   - **Why it matters:** This is the intent parser. Without it, the application wouldn't properly understand the constraints of what the user wants.

3. **`app/services/tinyfish_service.py`**
   - **What it does:** Connects to the TinyFish AI cloud browser. It takes the clean JSON intent and instructs two separate AI web agents to go to Swiggy and Zomato *simultaneously* to search for the food.
   - **Why it matters:** This replaces traditional, fragile web scrapers (like Playwright/Selenium) with smart agents that understand the web pages naturally using plain text commands.

4. **`app/services/ranker.py`**
   - **What it does:** Takes all the results from Swiggy and Zomato, calculates the "True Price" (Item Price + Delivery Fee - Discount), and sorts them from best to worst.
   - **Why it matters:** It ensures the user is always presented with the absolute best deal without hidden fees.

## What's Next? (Phase 3)
In the next phase, we will connect these "brains" to FastAPI routes (endpoints/URLs) so that the frontend can actually trigger them!
