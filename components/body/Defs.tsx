"use client";

/** Shared paint servers and filters for the figure. */
export function Defs() {
  return (
    <defs>
      {/* Cylindrical shading that auto-fits every limb it is applied to. */}
      <linearGradient id="skinRound" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--skin-deep)" />
        <stop offset="14%" stopColor="var(--skin-shade)" />
        <stop offset="38%" stopColor="var(--skin-base)" />
        <stop offset="52%" stopColor="var(--skin-light)" />
        <stop offset="72%" stopColor="var(--skin-base)" />
        <stop offset="90%" stopColor="var(--skin-shade)" />
        <stop offset="100%" stopColor="var(--skin-deep)" />
      </linearGradient>

      <linearGradient id="muscleRound" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#8e2318" />
        <stop offset="30%" stopColor="#b8392a" />
        <stop offset="52%" stopColor="#cf5644" />
        <stop offset="78%" stopColor="#ab3325" />
        <stop offset="100%" stopColor="#7d1d14" />
      </linearGradient>

      <linearGradient id="muscleDeep" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#6e1c14" />
        <stop offset="50%" stopColor="#93281c" />
        <stop offset="100%" stopColor="#63170f" />
      </linearGradient>

      <linearGradient id="boneRound" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#b8ac8c" />
        <stop offset="26%" stopColor="#ddd3b6" />
        <stop offset="50%" stopColor="#f0e9d2" />
        <stop offset="76%" stopColor="#d6cbaa" />
        <stop offset="100%" stopColor="#ac9f7e" />
      </linearGradient>

      <linearGradient id="tendon" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#cfc7ae" />
        <stop offset="50%" stopColor="#eee7d2" />
        <stop offset="100%" stopColor="#c4bba0" />
      </linearGradient>

      <radialGradient id="brainFill" cx="0.4" cy="0.32" r="0.8">
        <stop offset="0%" stopColor="#f0d8cf" />
        <stop offset="60%" stopColor="#dcb3a6" />
        <stop offset="100%" stopColor="#b98577" />
      </radialGradient>

      <radialGradient id="lungFill" cx="0.4" cy="0.3" r="0.85">
        <stop offset="0%" stopColor="#e59a9a" />
        <stop offset="70%" stopColor="#c76f70" />
        <stop offset="100%" stopColor="#9d4f52" />
      </radialGradient>

      <radialGradient id="heartFill" cx="0.38" cy="0.28" r="0.85">
        <stop offset="0%" stopColor="#d94f43" />
        <stop offset="65%" stopColor="#b32e26" />
        <stop offset="100%" stopColor="#801a15" />
      </radialGradient>

      <radialGradient id="liverFill" cx="0.35" cy="0.3" r="0.85">
        <stop offset="0%" stopColor="#9c4630" />
        <stop offset="65%" stopColor="#7d3423" />
        <stop offset="100%" stopColor="#5a2317" />
      </radialGradient>

      <radialGradient id="gutFill" cx="0.4" cy="0.3" r="0.85">
        <stop offset="0%" stopColor="#e3b48c" />
        <stop offset="65%" stopColor="#c99268" />
        <stop offset="100%" stopColor="#a06f4a" />
      </radialGradient>

      <radialGradient id="organPink" cx="0.4" cy="0.3" r="0.85">
        <stop offset="0%" stopColor="#d99b8e" />
        <stop offset="70%" stopColor="#b8756a" />
        <stop offset="100%" stopColor="#8e5147" />
      </radialGradient>

      <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.72">
        <stop offset="55%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0.55)" />
      </radialGradient>

      {/* Soft drop shadow that keeps structures legible on the dark plate. */}
      <filter id="lift" x="-25%" y="-25%" width="150%" height="150%">
        <feDropShadow
          dx="0"
          dy="4"
          stdDeviation="6"
          floodColor="#000"
          floodOpacity="0.55"
        />
      </filter>

      <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}
