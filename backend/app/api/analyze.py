from __future__ import annotations

import hashlib
import asyncio
from typing import Optional, List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.cache import get_cached, set_cached
from app.services.llm import score_content
from app.services.search import find_sources

router = APIRouter()


class AnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)
    url: Optional[str] = None


class Source(BaseModel):
    title: str
    url: str
    published: Optional[str] = None
    similarity: Optional[float] = None


class ScoreExplanation(BaseModel):
    score: float = Field(..., ge=0, le=10)
    reason: str


class AnalyzeResponse(BaseModel):
    content_hash: str
    signal: ScoreExplanation
    novelty: ScoreExplanation
    slop: ScoreExplanation
    sources: List[Source]
    summary: str


def make_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode()).hexdigest()[:16]


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze(req: AnalyzeRequest):
    content_hash = make_hash(req.text)

    cached = await get_cached(content_hash)
    if cached:
        return AnalyzeResponse(**cached)

    try:
        sources_task = find_sources(req.text, req.url)
        llm_task = score_content(req.text)

        sources_result, llm_result = await asyncio.gather(
            sources_task, llm_task
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Upstream error: {str(e)}")

    novelty_score, novelty_reason = _calc_novelty(sources_result)
    slop_score, slop_reason = _calc_slop(sources_result, llm_result)

    response = AnalyzeResponse(
        content_hash=content_hash,
        signal=ScoreExplanation(
            score=llm_result["signal_score"],
            reason=llm_result["signal_reason"],
        ),
        novelty=ScoreExplanation(score=novelty_score, reason=novelty_reason),
        slop=ScoreExplanation(score=slop_score, reason=slop_reason),
        sources=[
            Source(
                title=s.get("title", "Untitled"),
                url=s.get("url", ""),
                published=s.get("published"),
                similarity=s.get("similarity"),
            )
            for s in sources_result
        ],
        summary=llm_result.get("summary", ""),
    )

    await set_cached(content_hash, response.model_dump())
    return response


def _calc_novelty(sources: list) -> tuple:
    if not sources:
        return 9.0, "No earlier sources found — likely original content."
    earlier = [s for s in sources if s.get("similarity", 0) > 0.5]
    count = len(earlier)
    if count >= 3:
        return 2.0, f"Found {count} highly similar earlier sources. This is widely covered territory."
    if count >= 1:
        return 5.0, f"Found {count} similar earlier source(s). Partially novel."
    return 8.0, "Earlier sources exist but are only loosely related. Mostly novel angle."


def _calc_slop(sources: list, llm_result: dict) -> tuple:
    if not sources:
        return 1.0, "No earlier sources to compare — low slop indicators."

    top = sources[0]
    sim = top.get("similarity", 0)
    adds_value = llm_result.get("adds_value", True)

    if sim > 0.85 and not adds_value:
        return 9.0, f"Very high similarity ({sim:.0%}) to '{top.get('title', 'source')}' with no added insight. Likely repackaged."
    if sim > 0.7:
        qualifier = "but adds some original perspective" if adds_value else "with minimal new insight"
        return 6.0, f"High similarity ({sim:.0%}) to earlier source, {qualifier}."
    if sim > 0.5:
        return 3.0, f"Moderate similarity ({sim:.0%}) to earlier content. Some overlap but substantive differences."
    return 1.0, "Low similarity to known sources. Appears to be original work."


@router.get("/result/{content_hash}", response_model=AnalyzeResponse)
async def get_result(content_hash: str):
    cached = await get_cached(content_hash)
    if not cached:
        raise HTTPException(status_code=404, detail="Result not found or expired.")
    return AnalyzeResponse(**cached)
