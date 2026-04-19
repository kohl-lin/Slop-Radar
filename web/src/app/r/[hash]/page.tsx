"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ScoreCard from "@/components/ScoreCard";
import PixelBeetle from "@/components/PixelBeetle";
import type { AnalyzeResult } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ResultPage() {
  const params = useParams();
  const hash = params.hash as string;
  const [data, setData] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hash) return;

    fetch(`${API_BASE}/api/result/${hash}`)
      .then((r) => {
        if (!r.ok) throw new Error("Result not found");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [hash]);

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-12 sand-texture relative">
      <div className="text-center mb-8">
        <a href="/" className="inline-block">
          <PixelBeetle size={64} showScene className="mx-auto" />
          <h1 className="font-pixel text-lg text-[var(--brown)] tracking-wider mt-2">
            SLOP RADAR
          </h1>
        </a>
      </div>

      {loading && (
        <div className="text-center">
          <PixelBeetle size={80} rolling showScene className="mx-auto" />
          <p className="font-pixel text-[10px] text-[var(--text-muted)] mt-3">
            LOADING RESULT...
          </p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="font-pixel text-xs text-[var(--red)] mb-4">
            {error}
          </p>
          <a
            href="/"
            className="desert-btn inline-block py-2 px-6 text-[10px] rounded"
          >
            ANALYZE SOMETHING
          </a>
        </div>
      )}

      {data && (
        <div className="w-full flex flex-col items-center gap-4">
          <ScoreCard data={data} />
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
              }}
              className="desert-btn py-2 px-4 text-[9px] rounded"
            >
              📋 COPY LINK
            </button>
            <a href="/" className="desert-btn inline-block py-2 px-4 text-[9px] rounded">
              🪲 ANALYZE MORE
            </a>
          </div>
        </div>
      )}

      <footer className="mt-auto pt-16 pb-6 text-center text-[var(--text-muted)] text-xs">
        <p>
          Built to fight{" "}
          <span className="text-[var(--red)] font-semibold">Garbage In, Garbage Out</span>
        </p>
      </footer>
    </main>
  );
}
