from __future__ import annotations

import json
import time
from typing import Optional

from fastapi import APIRouter, Request
from pydantic import BaseModel

from app.services.cache import redis_client

router = APIRouter()


class Event(BaseModel):
    event: str  # "click", "share", "deep_dive", "thumbs_down"
    content_hash: Optional[str] = None
    source: str = "web"  # "web" or "extension"
    meta: Optional[dict] = None


@router.post("/event")
async def track_event(event: Event, request: Request):
    entry = {
        "event": event.event,
        "content_hash": event.content_hash,
        "source": event.source,
        "meta": event.meta,
        "ts": time.time(),
        "ip": request.client.host if request.client else None,
    }

    if redis_client:
        try:
            await redis_client.lpush("slop:events", json.dumps(entry))
            await redis_client.ltrim("slop:events", 0, 9999)
        except Exception:
            pass

    return {"ok": True}


@router.get("/stats")
async def get_stats():
    """Basic aggregate stats for the dashboard."""
    if not redis_client:
        return {"total_events": 0, "message": "No Redis connected."}

    try:
        total = await redis_client.llen("slop:events")
        recent_raw = await redis_client.lrange("slop:events", 0, 99)
        recent = [json.loads(r) for r in recent_raw]

        counts = {}
        for e in recent:
            ev = e.get("event", "unknown")
            counts[ev] = counts.get(ev, 0) + 1

        return {
            "total_events": total,
            "recent_100_breakdown": counts,
        }
    except Exception:
        return {"total_events": 0, "error": "Redis read failed."}
