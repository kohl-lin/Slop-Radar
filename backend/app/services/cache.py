from __future__ import annotations

import os
import json
from typing import Optional

import redis.asyncio as redis

REDIS_URL = os.getenv("UPSTASH_REDIS_URL", "")
CACHE_TTL = 7 * 24 * 3600  # 7 days

redis_client: Optional[redis.Redis] = None

if REDIS_URL:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)


async def get_cached(content_hash: str) -> Optional[dict]:
    if not redis_client:
        return None
    try:
        data = await redis_client.get(f"slop:{content_hash}")
        return json.loads(data) if data else None
    except Exception:
        return None


async def set_cached(content_hash: str, data: dict) -> None:
    if not redis_client:
        return
    try:
        await redis_client.set(
            f"slop:{content_hash}",
            json.dumps(data),
            ex=CACHE_TTL,
        )
    except Exception:
        pass
