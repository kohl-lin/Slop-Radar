from __future__ import annotations

import re
import logging
from typing import Optional, Tuple

import httpx

logger = logging.getLogger(__name__)

# Match a URL at the start, stop at whitespace or common CJK punctuation
_URL_RE = re.compile(r"(https?://[^\s，。！？；：、》）\]]+)")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
}

# Domains that require JS rendering — simple HTTP GET won't work
_JS_REQUIRED_DOMAINS = [
    "mp.weixin.qq.com",
    "weixin.qq.com",
]

BOILERPLATE_SIGNALS = [
    "placeholder", "interface snippet", "social media button",
    "var msg", "var appuin", "window.__INITIAL_STATE",
    "rich_media_content", "js_content",
]


def extract_url(text: str) -> Optional[str]:
    """Extract the first URL from text, handling CJK punctuation."""
    m = _URL_RE.search(text.strip())
    return m.group(1) if m else None


def looks_like_url(text: str) -> bool:
    """Check if the input is primarily a URL (possibly with minor surrounding text)."""
    text = text.strip()
    url = extract_url(text)
    if not url:
        return False
    # URL should be the dominant part of the input
    non_url_text = text.replace(url, "").strip(" ，。,.")
    return len(non_url_text) < 20


def _is_js_rendered_domain(url: str) -> bool:
    for domain in _JS_REQUIRED_DOMAINS:
        if domain in url:
            return True
    return False


def _is_boilerplate(text: str) -> bool:
    text_lower = text.lower()
    hits = sum(1 for sig in BOILERPLATE_SIGNALS if sig in text_lower)
    return hits >= 2


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

    content = re.sub(r"<br\s*/?>", "\n", content, flags=re.IGNORECASE)
    content = re.sub(r"</(?:p|div|h[1-6]|li|tr|section|article)>", "\n", content, flags=re.IGNORECASE)

    content = re.sub(r"<[^>]+>", "", content)

    for entity, char in [("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                          ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")]:
        content = content.replace(entity, char)

    lines = [line.strip() for line in content.splitlines()]
    lines = [line for line in lines if len(line) > 2]
    text = "\n".join(lines)

    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r" {2,}", " ", text)

    if title and title not in text[:200]:
        text = f"{title}\n\n{text}"

    return text.strip()


async def fetch_url_content(url: str) -> Tuple[Optional[str], Optional[str]]:
    """Fetch a URL and extract its main text content.

    Returns (text, error_hint). If text is None, error_hint explains why.
    """
    if _is_js_rendered_domain(url):
        return None, (
            "WeChat articles require JavaScript to load content. "
            "Please open the article, copy the text, and paste it here instead."
        )

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
                return None, f"Unsupported content type ({content_type}). Please paste the text directly."

            html = resp.text
            text = _extract_text_from_html(html)

            if len(text) < 50 or _is_boilerplate(text):
                logger.warning("Content appears to be boilerplate or too short from %s", url)
                return None, (
                    "Could not extract meaningful content from this page (it may require JavaScript). "
                    "Please copy the article text and paste it directly."
                )

            return text[:5000], None

    except Exception as e:
        logger.warning("Failed to fetch URL %s: %s", url, e)
        return None, f"Could not fetch this URL ({type(e).__name__}). Please paste the text directly."
