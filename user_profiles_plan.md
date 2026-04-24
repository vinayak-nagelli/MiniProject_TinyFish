# Implementation Plan: User Profiles & Authentication

## Objective
To build a robust authentication system and user profile module. By storing user preferences (diet, location, favorite restaurants/dishes) in MongoDB, we can automatically inject this context into Groq (LLaMA 70B). This allows the AI to generate highly optimized, specific goals for the TinyFish API, drastically reducing the number of steps the web agent needs to take, resulting in faster and more accurate deal hunting.

---

## Phase 1: Authentication Infrastructure
**Goal:** Securely register and authenticate users.
- **Backend (`models/user.py`)**: Create a `User` schema using Pydantic, including fields for `email`, `hashed_password`, and an embedded `UserProfile` schema.
- **Backend (`core/security.py`)**: Implement password hashing (using `passlib`/`bcrypt`) and JWT (JSON Web Token) generation.
- **Backend (`api/auth.py`)**: Build `/register` and `/login` endpoints.
- **Frontend**: Create a sleek Login/Signup Modal with Framer Motion and update the Zustand `useStore` to hold the `authToken` and `currentUser`.

## Phase 2: User Profile Management (MongoDB)
**Goal:** Allow users to define their ordering preferences.
- **Database Schema**: 
  ```json
  {
    "diet": "veg" | "non-veg" | "both",
    "locations": ["Solapur", "Pune", "Bengaluru"],
    "favorite_dishes": ["Biryani", "Pizza"],
    "preferred_restaurants": ["Behrouz", "Dominos"]
  }
  ```
- **Backend (`api/user.py`)**: Build endpoints `GET /profile` and `PUT /profile` to read/update these preferences in MongoDB.
- **Frontend**: Create a "Profile Dashboard" UI where users can visually select their dietary preferences, add multiple locations, and type in their favorite dishes/restaurants using nice tag-based inputs.

## Phase 3: AI Context Injection (Groq Optimization)
**Goal:** Make the LLM smarter by giving it the user's profile before it parses the intent.
- **Update `groq_service.py`**: When the user says *"Find me the best deals near me"*, the backend will fetch their profile from MongoDB and feed it to Groq.
- **New System Prompt Logic**: 
  *"The user asked for deals. They are located in Solapur. Their diet is strictly 'veg'. Their favorite dish is 'Biryani'. Parse this intent combining their request with their profile constraints."*
- **Result**: The user types less, but the intent output is mathematically richer.

## Phase 4: TinyFish Agent Optimization
**Goal:** Use the enriched intent to reduce TinyFish web navigation steps.
- **Update `tinyfish_service.py`**: Pass the highly specific constraints directly into the TinyFish `goal` prompt.
- **Impact**: Instead of TinyFish wasting steps guessing a location or manually clicking through multiple diet filters, the goal becomes: *"Go to Swiggy Solapur, search directly for Veg Biryani from Behrouz, and return the top 3 prices."* 
- **Benefit**: Fewer steps = Faster execution = Lower API cost.

---
### Next Steps
If you approve this plan, we will start with **Phase 1: Authentication Infrastructure**. We will need to re-enable the MongoDB connections we commented out earlier. Shall we begin Phase 1?
