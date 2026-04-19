from __future__ import annotations

import os
import json
from openai import AsyncOpenAI

OPENAI_BASE = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")
LLM_PROVIDER_HEADER = os.getenv("LLM_PROVIDER_HEADER", "")

client = AsyncOpenAI(api_key=OPENAI_KEY, base_url=OPENAI_BASE)

SYSTEM_PROMPT = """You are an AI content quality analyst. You evaluate social media posts about AI/ML technology.

Given a post, you must return a JSON object with exactly these fields:
- signal_score: 0-10 float. How much genuine, useful signal does this contain?
- signal_reason: One sentence explaining the score.
- adds_value: boolean. Does this add original insight beyond restating known information?
- summary: One sentence summarizing the core claim/information.

Scoring guide for signal_score:
- 9-10: Original research findings, novel technical insights, first-hand experiment results, important announcements from primary sources
- 7-8: Thoughtful analysis with original perspective, useful synthesis of multiple sources, expert commentary
- 5-6: Accurate summary of existing information, some useful context but nothing new
- 3-4: Surface-level restatement, clickbait framing of known facts, hype without substance
- 0-2: Misinformation, pure engagement bait, AI-generated slop with no informational value

Examples of HIGH signal (8-10):
- "We just released Llama 4 with 1T params. Here's what's different about the architecture..." (primary source)
- "I fine-tuned GPT on 50k customer support tickets. Surprising finding: smaller context windows actually improved accuracy by 12%..." (original experiment)
- "After 6 months building RAG systems in production, here are the 5 failure modes nobody talks about..." (practitioner insight)

Examples of LOW signal (0-3):
- "🔥 THIS CHANGES EVERYTHING 🔥 AI just got 1000x better! Thread 🧵" (hype, no substance)
- "Here are 10 AI tools that will replace your job (repackaged listicle)" (engagement bait)
- "Summary: Google released Gemini 2.0 [restates press release word for word]" (zero-value repackage)

Return ONLY valid JSON, no markdown fences."""


async def score_content(text: str) -> dict:
    extra = {}
    if LLM_PROVIDER_HEADER:
        extra["extra_headers"] = {"Provider": LLM_PROVIDER_HEADER}

    response = await client.chat.completions.create(
        model=LLM_MODEL,
        max_tokens=300,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Evaluate this post:\n\n{text}"},
        ],
        **extra,
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        result = {
            "signal_score": 5.0,
            "signal_reason": "Could not parse LLM response — defaulting to neutral.",
            "adds_value": True,
            "summary": text[:100],
        }

    return {
        "signal_score": float(result.get("signal_score", 5)),
        "signal_reason": result.get("signal_reason", "No reason provided."),
        "adds_value": bool(result.get("adds_value", True)),
        "summary": result.get("summary", text[:100]),
    }
