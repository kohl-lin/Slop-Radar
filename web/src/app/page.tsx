"use client";

import { useState } from "react";
import { analyzeContent, type AnalyzeResult } from "@/lib/api";
import { trackEvent } from "@/lib/track";
import ScoreCard from "@/components/ScoreCard";
import PixelBeetle from "@/components/PixelBeetle";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (!input.trim() || input.trim().length < 10) {
      setError("Please enter at least 10 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      trackEvent("click");
      const data = await analyzeContent(input.trim());
      setResult(data);
      trackEvent("analyze_success", data.content_hash);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 relative sand-texture">
      {/* Hero */}
      <div className="text-center mb-10">
        <PixelBeetle size={180} showScene className="mx-auto mb-2" />
        <h1 className="font-pixel text-xl md:text-2xl text-[var(--brown)] tracking-wider mb-3">
          SLOP RADAR
        </h1>
        <p className="text-[var(--text-secondary)] max-w-md text-sm leading-relaxed">
          Fight <span className="text-[var(--red)] font-semibold">GIGO</span>. Paste any AI
          news, tweet, or link — we&apos;ll trace it to the source, score its
          signal, and tell you if it&apos;s slop.
        </p>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-lg mb-8">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Paste a tweet, article URL, or any AI news text...\n\ne.g. https://mp.weixin.qq.com/s/xxx\nor \"🔥 THIS CHANGES EVERYTHING — GPT-5 just dropped!\""}
          className="w-full h-36 bg-[var(--cream)] border-2 border-[var(--sand-dark)] focus:border-[var(--accent)] text-[var(--text-primary)] text-sm p-4 rounded-lg resize-none outline-none transition-colors placeholder:text-[var(--text-muted)]"
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="desert-btn w-full mt-3 py-3 px-6 text-xs tracking-wider rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <PixelBeetle size={20} className="inline-block" />
              ANALYZING...
            </span>
          ) : (
            "🪲 ANALYZE"
          )}
        </button>

        {error && (
          <p className="text-[var(--red)] text-xs mt-3 font-pixel">{error}</p>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="w-full flex flex-col items-center gap-4">
          <ScoreCard data={result} />
          <a
            href={`/r/${result.content_hash}`}
            onClick={() => trackEvent("share", result.content_hash)}
            className="font-pixel text-[10px] text-[var(--accent)] hover:text-[var(--brown)] transition-colors"
          >
            🔗 Shareable link
          </a>
        </div>
      )}

      {/* How it works */}
      {!result && (
        <div className="mt-12 max-w-lg w-full">
          <h2 className="font-pixel text-xs text-[var(--accent)] mb-6 text-center">
            HOW IT WORKS
          </h2>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="desert-card rounded-lg p-4">
              <div className="text-2xl mb-2">📡</div>
              <div className="font-pixel text-[8px] text-[var(--brown)] mb-1">
                SIGNAL
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Is there real information here, or just hype?
              </p>
            </div>
            <div className="desert-card rounded-lg p-4">
              <div className="text-2xl mb-2">✨</div>
              <div className="font-pixel text-[8px] text-[var(--brown)] mb-1">
                NOVELTY
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Is this new, or a rehash of something earlier?
              </p>
            </div>
            <div className="desert-card rounded-lg p-4">
              <div className="text-2xl mb-2">💩</div>
              <div className="font-pixel text-[8px] text-[var(--brown)] mb-1">
                SLOP
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                How much is AI-repackaged fluff vs. original?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Install CTA */}
      <div className="mt-16 text-center">
        <p className="text-[var(--text-muted)] text-xs mb-2">
          Want this on every tweet?
        </p>
        <div className="font-pixel text-[10px] text-[var(--accent)] px-4 py-2 border-2 border-dashed border-[var(--sand-dark)] rounded inline-block bg-[var(--cream)]">
          🪲 Chrome Extension — Coming Soon
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-6 text-center text-[var(--text-muted)] text-xs">
        <p>
          Built to fight{" "}
          <span className="text-[var(--red)] font-semibold">
            Garbage In, Garbage Out
          </span>
        </p>
        <p className="font-pixel text-[8px] mt-1 text-[var(--sand-deep)]">
          AI SLOP RADAR v0.1
        </p>
      </footer>
    </main>
  );
}
