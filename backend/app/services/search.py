from __future__ import annotations

import os
from typing import Optional, List, Dict

import httpx

EXA_API_KEY = os.getenv("EXA_API_KEY", "")
EXA_BASE = "https://api.exa.ai"


async def find_sources(text: str, url: Optional[str] = None) -> List[Dict]:
    """Search Exa for earlier sources semantically similar to the given text."""
    if not EXA_API_KEY:
        return []

    headers = {
        "Authorization": f"Bearer {EXA_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "query": text[:1000],
        "type": "neural",
        "numResults": 5,
        "useAutoprompt": True,
        "category": "research paper",
        "includeDomains": [
            "arxiv.org",
            "openai.com",
            "anthropic.com",
            "deepmind.google",
            "ai.meta.com",
            "huggingface.co",
            "x.com",
            "twitter.com",
            "github.com",
            "blog.google",
        ],
    }

    if url:
        payload["excludeSourceUrl"] = url

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{EXA_BASE}/search",
            json=payload,
            headers=headers,
        )
        resp.raise_for_status()
        data = resp.json()

    results = []
    for item in data.get("results", []):
        results.append({
            "title": item.get("title", "Untitled"),
            "url": item.get("url", ""),
            "published": item.get("publishedDate"),
            "similarity": item.get("score", 0),
        })

    return results
