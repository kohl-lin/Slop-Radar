const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function trackEvent(
  event: string,
  contentHash?: string,
  meta?: Record<string, unknown>
) {
  fetch(`${API_BASE}/api/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event,
      content_hash: contentHash,
      source: "web",
      meta,
    }),
  }).catch(() => {});
}
