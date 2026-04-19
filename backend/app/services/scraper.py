from __future__ import annotations

import re
import logging
from typing import Optional

import httpx

logger = logging.getLogger(__name__)

_URL_PATTERN = re.compile(r"^https?://\S+$")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
}


def looks_like_url(text: str) -> bool:
    return bool(_URL_PATTERN.match(text.strip()))


def _extract_text_from_html(html: str) -> str:
    """Extract readable text from HTML, stripping tags and scripts."""
    html = re.sub(r"<script[^>]*>[\s\S]*?</script>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<style[^>]*>[\s\S]*?</style>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<head[^>]*>[\s\S]*?</head>", "", html, flags=re.IGNORECASE)
    html = re.sub(r"<!--[\s\S]*?-->", "", html)

    title = ""
    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    if title_match:
        title = title_match.group(1).strip()

    body_match = re.search(r"<body[^>]*>([\s\S]*)</body>", html, re.IGNORECASE)
    content = body_match.group(1) if body_match else html

    # Preserve paragraph breaks
    content = re.sub(r"<br\s*/?>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"</(?:p|div|h[1-6]|li|tr|section|article)>", "\n", content, flags=re.IGNORECASE)

    content = re.sub(r"<[^>]+>", "", content)

    # Decode common HTML entities
    for entity, char in [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                          ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")]:
        content = content.replace(entity, char)

    lines = [line.strip() for line in content.splitlines()]
    lines = [line for line in lines if len(line) > 2]
    text = "\n".join(lines)

    # Collapse excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)

    if title and title not in text[:200]:
        text = f"{title}\n\n{text}"

    return text.strip()


async def fetch_url_content(url: str) -> Optional[str]:
    """Fetch a URL and extract its main text content. Returns None on failure."""
    try:
        async with httpx.AsyncClient(
            timeout=15.0,
            follow_redirects=True,
            headers=HEADERS,
            max_redirects=5,
        ) as client:
            resp = await client.get(url)
            resp.raise_for_status()

            content_type = resp.headers.get("content-type", "")
            if "text/html" not in content_type and "text/plain" not in content_type:
                logger.warning("Unsupported content type: %s", content_type)
                return None

            html = resp.text
            text = _extract_text_from_html(html)

            if len(text) < 20:
                logger.warning("Extracted text too short (%d chars) from %s", len(text), url)
                return None

            # Cap at 5000 chars to stay within LLM context
            return text[:5000]

    except Exception as e:
        logger.warning("Failed to fetch URL %s: %s", url, e)
        return None
