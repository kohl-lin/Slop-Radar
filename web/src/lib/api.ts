const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Source {
  title: string;
  url: string;
  published: string | null;
  similarity: number | null;
}

export interface ScoreExplanation {
  score: number;
  reason: string;
}

export interface AnalyzeResult {
  content_hash: string;
  signal: ScoreExplanation;
  novelty: ScoreExplanation;
  slop: ScoreExplanation;
  sources: Source[];
  summary: string;
}

export async function analyzeContent(
  text: string,
  url?: string
): Promise<AnalyzeResult> {
  const resp = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, url }),
  });

  if (!resp.ok) {
    let message: string;
    try {
      const body = await resp.json();
      message = body.detail || JSON.stringify(body);
    } catch {
      message = await resp.text();
    }
    throw new Error(message);
  }

  return resp.json();
}
