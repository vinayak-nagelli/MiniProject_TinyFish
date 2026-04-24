import redis.asyncio as redis
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    client: redis.Redis = None

cache = RedisCache()

async def connect_to_redis():
    logger.info("Connecting to Redis...")
    cache.client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    logger.info("Connected to Redis.")

async def close_redis_connection():
    logger.info("Closing Redis connection...")
    if cache.client:
        await cache.client.close()
        logger.info("Redis connection closed.")
