"use client";

/**
 * Desert-themed pixel dung beetle with layered SVG animation:
 *  - Layer 1 (back): Desert scene — sand dunes, cactus, wind particles
 *  - Layer 2 (mid): Rolling dung ball (rotates via SVG animateTransform)
 *  - Layer 3 (front): Brown beetle pushing the ball (bobs via SVG animate)
 */
export default function PixelBeetle({
  size = 128,
  rolling = false,
  showScene = false,
  className = "",
}: {
  size?: number;
  rolling?: boolean;
  showScene?: boolean;
  className?: string;
}) {
  const s = size;

  return (
    <div className={`inline-block relative ${className}`} style={{ width: s, height: showScene ? s * 0.85 : s * 0.55 }}>
      <svg
        width={s}
        height={showScene ? s * 0.85 : s * 0.55}
        viewBox={showScene ? "0 0 32 27" : "4 6 24 18"}
        style={{ imageRendering: "pixelated" }}
      >
        {/* === LAYER 1: Desert Background === */}
        {showScene && (
          <g>
            {/* Sand ground */}
            <rect x="0" y="22" width="32" height="5" fill="#e8d5a3" />
            <rect x="0" y="23" width="32" height="4" fill="#dcc78e" />
            <rect x="2" y="22" width="1" height="1" fill="#d4ba78" />
            <rect x="7" y="22" width="1" height="1" fill="#d4ba78" />
            <rect x="15" y="22" width="2" height="1" fill="#d4ba78" />
            <rect x="22" y="22" width="1" height="1" fill="#d4ba78" />
            <rect x="28" y="22" width="1" height="1" fill="#d4ba78" />

            {/* Cactus left */}
            <rect x="3" y="14" width="2" height="8" fill="#6b9e5a" />
            <rect x="2" y="15" width="1" height="1" fill="#6b9e5a" />
            <rect x="1" y="13" width="1" height="3" fill="#6b9e5a" />
            <rect x="5" y="16" width="1" height="1" fill="#6b9e5a" />
            <rect x="6" y="14" width="1" height="3" fill="#6b9e5a" />
            <rect x="4" y="14" width="1" height="6" fill="#7db56a" opacity="0.6" />
            <rect x="1" y="13" width="1" height="1" fill="#7db56a" />
            <rect x="6" y="14" width="1" height="1" fill="#7db56a" />

            {/* Cactus right */}
            <rect x="27" y="17" width="2" height="5" fill="#6b9e5a" />
            <rect x="26" y="18" width="1" height="1" fill="#6b9e5a" />
            <rect x="26" y="16" width="1" height="2" fill="#6b9e5a" />
            <rect x="28" y="17" width="1" height="3" fill="#7db56a" opacity="0.6" />

            {/* Wind particles with native SVG animation */}
            {rolling && (
              <>
                <rect x="10" y="8" width="2" height="1" fill="#d4ba78" opacity="0.4">
                  <animate attributeName="x" values="10;16;10" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
                </rect>
                <rect x="18" y="5" width="3" height="1" fill="#d4ba78" opacity="0.3">
                  <animate attributeName="x" values="18;25;18" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2.5s" repeatCount="indefinite" />
                </rect>
                <rect x="24" y="10" width="2" height="1" fill="#d4ba78" opacity="0.35">
                  <animate attributeName="x" values="24;30;24" dur="2.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.8s" repeatCount="indefinite" />
                </rect>
                <rect x="8" y="3" width="1" height="1" fill="#d4ba78" opacity="0.25">
                  <animate attributeName="x" values="8;14;8" dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0;0.25" dur="3.5s" repeatCount="indefinite" />
                </rect>
                <rect x="14" y="11" width="2" height="1" fill="#d4ba78" opacity="0.3">
                  <animate attributeName="x" values="14;20;14" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2.2s" repeatCount="indefinite" />
                </rect>
              </>
            )}
          </g>
        )}

        {/* === LAYER 2: Dung Ball === */}
        <g>
          {rolling && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 20.5 15.5"
              to="360 20.5 15.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          )}
          <rect x="18" y="13" width="5" height="5" fill="#c4943a" />
          <rect x="19" y="12" width="3" height="1" fill="#c4943a" />
          <rect x="19" y="18" width="3" height="1" fill="#b07e2a" />
          <rect x="17" y="14" width="1" height="3" fill="#c4943a" />
          <rect x="23" y="14" width="1" height="3" fill="#b07e2a" />
          <rect x="19" y="13" width="2" height="2" fill="#d4a84a" />
          <rect x="19" y="12" width="1" height="1" fill="#dbb85a" />
          <rect x="21" y="16" width="1" height="1" fill="#a0701e" />
          <rect x="19" y="15" width="1" height="1" fill="#a0701e" />
          <rect x="22" y="14" width="1" height="1" fill="#b07e2a" />
        </g>

        {/* === LAYER 3: Beetle === */}
        <g>
          {rolling && (
            <animate
              attributeName="transform"
              type="translate"
              values="0,0; 0,-0.4; 0,0"
              dur="0.5s"
              repeatCount="indefinite"
            />
          )}
          {/* Legs back */}
          <rect x="10" y="20" width="1" height="2" fill="#3d2b1a" />
          <rect x="9" y="21" width="1" height="1" fill="#3d2b1a" />
          <rect x="15" y="20" width="1" height="2" fill="#3d2b1a" />
          <rect x="16" y="21" width="1" height="1" fill="#3d2b1a" />
          <rect x="8" y="19" width="1" height="2" fill="#3d2b1a" />
          <rect x="7" y="20" width="1" height="1" fill="#3d2b1a" />

          {/* Body */}
          <rect x="10" y="14" width="6" height="6" fill="#5c3d1e" />
          <rect x="9" y="15" width="1" height="4" fill="#5c3d1e" />
          <rect x="16" y="15" width="1" height="4" fill="#4a2f14" />
          <rect x="11" y="13" width="4" height="1" fill="#5c3d1e" />
          <rect x="11" y="20" width="4" height="1" fill="#4a2f14" />

          {/* Shell pattern */}
          <rect x="11" y="15" width="2" height="2" fill="#6e4d2a" />
          <rect x="13" y="17" width="2" height="2" fill="#6e4d2a" />
          <rect x="12" y="14" width="1" height="1" fill="#6e4d2a" />

          {/* Head */}
          <rect x="15" y="14" width="3" height="3" fill="#4a2f14" />
          <rect x="16" y="13" width="2" height="1" fill="#4a2f14" />
          {/* Eyes */}
          <rect x="17" y="14" width="1" height="1" fill="#f0e6c8" />
          <rect x="16" y="13" width="1" height="1" fill="#f0e6c8" />
          {/* Horn */}
          <rect x="17" y="12" width="1" height="1" fill="#3d2b1a" />
          <rect x="18" y="11" width="1" height="1" fill="#3d2b1a" />

          {/* Front legs pushing ball */}
          <rect x="17" y="17" width="1" height="1" fill="#3d2b1a" />
          <rect x="16" y="19" width="1" height="1" fill="#3d2b1a" />
        </g>
      </svg>
    </div>
  );
}
