from fastapi import FastAPI
from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection
from app.db.redis import connect_to_redis, close_redis_connection
import contextlib

from app.api import intent, agent, user, auth
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging so we can see the TinyFish agent live logs!
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Connect to databases
    await connect_to_mongo()
    # await connect_to_redis()
    yield
    # Shutdown: Close connections
    await close_mongo_connection()
    # await close_redis_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Include the routers
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(intent.router, prefix="/api/v1", tags=["Intent"])
app.include_router(agent.router, prefix="/api/v1", tags=["Agent"])
app.include_router(user.router, prefix="/api/v1", tags=["User"])

@app.get("/")
async def root():
    return {"message": "Welcome to LifePilot API"}
