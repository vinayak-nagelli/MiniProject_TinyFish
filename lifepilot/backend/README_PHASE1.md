# Phase 1: Backend Infrastructure & Database Setup

Welcome to the LifePilot Project! This directory contains the backend structure built with FastAPI. Since you're not deeply familiar with the tech stack, here is a simple breakdown of what we accomplished in Phase 1:

## What We Built

1. **`app/main.py`**
   - **What it does:** This is the entry point (the main door) to our backend application. It starts up the FastAPI web server. 
   - **Why it matters:** It also uses a "lifespan" feature to automatically connect to our databases (MongoDB and Redis) when the server starts and disconnects when it shuts down safely.

2. **`app/core/config.py`**
   - **What it does:** It loads settings and secret keys (like API keys or Database URLs) from an environment file (`.env`).
   - **Why it matters:** Hardcoding passwords in code is a bad practice. This file ensures our app reads credentials securely.

3. **`app/db/mongodb.py`**
   - **What it does:** Sets up an asynchronous connection to our primary database, MongoDB Atlas.
   - **Why it matters:** We use a library called `motor` so that database operations don't freeze the rest of the application (asynchronous handling). This will eventually store user history and orders.

4. **`app/db/redis.py`**
   - **What it does:** Sets up a connection to Redis.
   - **Why it matters:** Redis is essentially extremely fast temporary memory. We use it to store "active sessions" or caching so our app responds instantly to users during their searches.

5. **`requirements.txt`**
   - **What it does:** A list of all third-party Python packages needed to run this project.
   - **Why it matters:** It allows another developer (or you, or a server) to install everything needed using one simple command (`pip install -r requirements.txt`).

## What's Next? (Phase 2)
In the next phase, we will implement the "Core Services" — the intelligence of LifePilot. We will build the services that talk to the Groq LLM (to understand what the user wants) and the TinyFish API (to perform autonomous tasks on food delivery apps).
