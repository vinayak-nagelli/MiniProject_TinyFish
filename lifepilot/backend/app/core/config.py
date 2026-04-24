import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LifePilot API"
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    TINYFISH_API_KEY: str = os.getenv("TINYFISH_API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-for-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week

    class Config:
        env_file = ".env"

settings = Settings()
