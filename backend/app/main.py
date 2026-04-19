from __future__ import annotations

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.api.analyze import router as analyze_router  # noqa: E402
from app.api.events import router as events_router  # noqa: E402
from app.middleware.rate_limit import RateLimitMiddleware  # noqa: E402
from app.services.cache import redis_client  # noqa: E402


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    if redis_client:
        await redis_client.aclose()


app = FastAPI(title="AI Slop Radar", version="0.1.0", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware, max_requests=30, window_seconds=60)


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


app.include_router(analyze_router, prefix="/api")
app.include_router(events_router, prefix="/api")
