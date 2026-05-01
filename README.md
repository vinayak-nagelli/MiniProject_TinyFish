# Food Agent AI (LifePilot) 🤖🍔

Food Agent AI is an Intent-Driven Autonomous Shopping Agent designed to revolutionize food ordering. Instead of manually searching through Swiggy and Zomato, users simply provide a natural language command (e.g., "Find the best veg biryani under 300"). The system leverages Large Language Models (LLMs) to understand user intent and an Autonomous Browser Agent (TinyFish) to navigate the platforms, compare prices, and fetch the best deals automatically.

## ✨ Key Features
- **Intent-Driven Search**: Understands natural language queries using Groq LLaMA 3.3 70B.
- **Autonomous Navigation**: Uses TinyFish SDK to browse Swiggy and Zomato simultaneously without manual intervention.
- **Personalized Context Layer**: Integrates user profiles (Diet, Allergies, Budget, Saved Locations) to enforce constraints autonomously.
- **Smart Deal Ranking**: Calculates the "True Price" (Base + Delivery - Discount) to rank and identify the absolute best deal.
- **High-Fidelity Dashboard**: React-based UI with side-by-side platform comparisons, winner banners, and live agent status.

## 🛠️ Technology Stack
### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion (Animations)
- Zustand (State Management)
- Lucide React (Icons)

### Backend
- FastAPI (Python 3)
- Motor (Async MongoDB Driver)
- JWT & bcrypt (Authentication)
- AsyncGroq (LLM Integration)
- TinyFish SDK (Browser Automation)

### Infrastructure & Deployment
- MongoDB Atlas (Database)
- Render (Backend Hosting)
- Vercel (Frontend Hosting)

## 📈 Current Implementation Progress

### ✅ Completed Milestones
1. **Full-Stack Setup**: Initialized FastAPI backend and React frontend with proper routing and CORS.
2. **Database & Authentication**: Configured MongoDB Atlas, implemented secure JWT login/registration flows with bcrypt hashing.
3. **User Profiles (Context Layer)**: Built a dynamic frontend dashboard to save dietary constraints, allergies, and locations, securely synced with the database.
4. **LLM Integration**: Integrated Groq API with highly optimized prompts to accurately parse user requests and profile constraints into structured JSON intents.
5. **Autonomous Agents**: Implemented true parallel execution of TinyFish agents for both Swiggy and Zomato.
6. **Agent Optimization**: Applied direct URL bypassing (city-specific routing for Zomato, search routing for Swiggy) to bypass homepages, popups, and redirects, saving ~40 seconds per run.
7. **Ranking System**: Developed a robust ranking algorithm to determine the best value deal based on True Price.
8. **UI Modernization**: Revamped the frontend with a premium dark-mode aesthetic, platform-specific color coding, clear price breakdowns, and side-by-side comparison grids.
9. **Deployment Readiness**: Successfully prepared `vercel.json` and `.env` setups for live deployment on Vercel and Render.

### ⏳ Future/Pending Tasks
1. **Live Browser Streaming**: Fully embed the TinyFish streaming URLs (`event.streaming_url`) directly into the React UI so users can watch the AI browse live.
2. **Automated Checkout Staging**: Transition from "Discovery-Only" to "Cart-Staging" by securely managing session cookies to add the selected item directly to the user's cart.
3. **Advanced Taxonomy**: Implement a comprehensive Food Taxonomy table in the LLM prompt to map vague queries (e.g., "something good") to specific, real dishes.

## 🚀 How to Run Locally

### Prerequisites
- Node.js & npm
- Python 3.10+
- MongoDB Atlas URI
- Groq API Key
- TinyFish API Key(s)

### Backend Setup
```bash
cd lifepilot/backend
python -m venv .venv
# Activate venv: `source .venv/bin/activate` (Linux/Mac) or `.venv\Scripts\activate` (Windows)
pip install -r requirements.txt
# Create a .env file with your API keys and MONGODB_URL
uvicorn app.main:app --reload --port 10000
```

### Frontend Setup
```bash
cd lifepilot/frontend
npm install
# Ensure .env contains VITE_API_URL=http://localhost:10000/api/v1
npm run dev
```

Visit `http://localhost:5173` to interact with Food Agent AI!
