"use client";

import type { AnalyzeResult } from "@/lib/api";
import { trackEvent } from "@/lib/track";
import PixelBeetle from "@/components/PixelBeetle";

function scoreColor(score: number, invert = false) {
  if (invert) {
    if (score <= 3) return "var(--green)";
    if (score <= 6) return "var(--yellow)";
    return "var(--red)";
  }
  if (score >= 7) return "var(--green)";
  if (score >= 4) return "var(--yellow)";
  return "var(--red)";
}

function ScoreBar({
  label,
  emoji,
  score,
  reason,
  invert = false,
}: {
  label: string;
  emoji: string;
  score: number;
  reason: string;
  invert?: boolean;
}) {
  const color = scoreColor(score, invert);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="font-pixel text-[10px] text-[var(--text-secondary)]">
          {emoji} {label}
        </span>
        <span className="font-pixel text-[10px]" style={{ color }}>
          {score}/10
        </span>
      </div>
      <div className="h-2 bg-[var(--sand-dark)] rounded-sm relative overflow-hidden">
        <div
          className="h-full score-bar-fill rounded-sm"
          style={
            {
              "--bar-width": `${score * 10}%`,
              background: color,
            } as React.CSSProperties
          }
        />
      </div>
      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">{reason}</p>
    </div>
  );
}

export default function ScoreCard({ data }: { data: AnalyzeResult }) {
  return (
    <div className="desert-card rounded-lg p-5 max-w-lg w-full relative sand-texture">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-dashed border-[var(--sand-dark)]">
        <PixelBeetle size={40} />
        <span className="font-pixel text-sm text-[var(--accent)] tracking-wide">
          AI SLOP RADAR
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-[var(--text-secondary)] mb-5 leading-relaxed">
        {data.summary}
      </p>

      {/* Scores */}
      <ScoreBar
        label="SIGNAL"
        emoji="📡"
        score={data.signal.score}
        reason={data.signal.reason}
      />
      <ScoreBar
        label="NOVELTY"
        emoji="✨"
        score={data.novelty.score}
        reason={data.novelty.reason}
      />
      <ScoreBar
        label="SLOP"
        emoji="💩"
        score={data.slop.score}
        reason={data.slop.reason}
        invert
      />

      {/* Sources */}
      {data.sources.length > 0 && (
        <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--sand-dark)]">
          <h3 className="font-pixel text-[9px] text-[var(--accent)] mb-2">
            🌵 EARLIER SOURCES
          </h3>
          <div className="space-y-1">
            {data.sources.slice(0, 5).map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("deep_dive", data.content_hash, { source_url: s.url })}
                className="block text-xs text-[var(--cactus-dark)] hover:text-[var(--cactus)] truncate transition-colors"
              >
                {s.title}
                {s.published && (
                  <span className="text-[var(--text-muted)] ml-2">
                    {s.published.slice(0, 10)}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
