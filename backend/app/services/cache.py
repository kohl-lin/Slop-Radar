from __future__ import annotations

import os
import json
import logging
from typing import Optional

REDIS_URL = os.getenv("UPSTASH_REDIS_URL", "")
CACHE_TTL = 7 * 24 * 3600  # 7 days

logger = logging.getLogger(__name__)

redis_client = None
_memory_cache: dict[str, str] = {}

if REDIS_URL:
    try:
        import redis.asyncio as redis
        redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        logger.info("Redis client initialized with URL: %s...", REDIS_URL[:30])
    except Exception as e:
        logger.warning("Failed to initialize Redis: %s — falling back to memory cache", e)
        redis_client = None
else:
    logger.info("No UPSTASH_REDIS_URL set — using memory cache")


async def get_cached(content_hash: str) -> Optional[dict]:
    key = f"slop:{content_hash}"

    if redis_client:
        try:
            data = await redis_client.get(key)
            if data:
                logger.info("Redis cache HIT for %s", content_hash)
                return json.loads(data)
            logger.info("Redis cache MISS for %s", content_hash)
        except Exception as e:
            logger.warning("Redis get failed: %s — trying memory cache", e)

    data = _memory_cache.get(key)
    if data:
        logger.info("Memory cache HIT for %s", content_hash)
        return json.loads(data)
    return None


async def set_cached(content_hash: str, data: dict) -> None:
    key = f"slop:{content_hash}"
    serialized = json.dumps(data)

    _memory_cache[key] = serialized

    if redis_client:
        try:
            await redis_client.set(key, serialized, ex=CACHE_TTL)
            logger.info("Redis cache SET for %s", content_hash)
        except Exception as e:
            logger.warning("Redis set failed: %s — stored in memory only", e)
