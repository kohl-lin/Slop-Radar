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
    const detail = await resp.text();
    throw new Error(`Analysis failed (${resp.status}): ${detail}`);
  }

  return resp.json();
}
