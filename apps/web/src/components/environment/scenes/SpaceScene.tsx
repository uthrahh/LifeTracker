import type { SceneProps } from "../types";
import type { TimeOfDay } from "@luma/utils";

// Space doesn't literally have day/night, but the product spec asks time-of-day
// to still influence density/brightness so the scene stays in sync with the
// rest of the app rather than feeling disconnected.
const INTENSITY: Record<TimeOfDay, number> = {
  dawn: 0.55,
  morning: 0.4,
  afternoon: 0.35,
  evening: 0.65,
  night: 1,
};

export function SpaceScene({ timeOfDay, reducedMotion }: SceneProps) {
  const intensity = INTENSITY[timeOfDay];

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <radialGradient id="space-bg" cx="30%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#1B1E3C" />
          <stop offset="60%" stopColor="#0B0C1E" />
          <stop offset="100%" stopColor="#05050F" />
        </radialGradient>
        <radialGradient id="space-galaxy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B39CF0" stopOpacity={0.5 * intensity} />
          <stop offset="45%" stopColor="#6E7BD6" stopOpacity={0.25 * intensity} />
          <stop offset="100%" stopColor="#6E7BD6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="space-planet" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F2C9A0" />
          <stop offset="100%" stopColor="#B5754A" />
        </radialGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#space-bg)" />
      <ellipse cx="420" cy="260" rx="480" ry="320" fill="url(#space-galaxy)" />

      <g opacity={0.5 + intensity * 0.5}>
        {STARS.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#F4F6FF" className={reducedMotion ? undefined : i % 5 === 0 ? "space-twinkle" : undefined} />
        ))}
      </g>

      <g className={reducedMotion ? undefined : "space-orbit"} style={{ transformOrigin: "1100px 320px" }}>
        <circle cx="1100" cy="320" r="70" fill="url(#space-planet)" />
        <ellipse cx="1100" cy="320" rx="120" ry="18" fill="none" stroke="#E8D5B7" strokeOpacity="0.5" strokeWidth="3" />
      </g>

      <circle cx="260" cy="620" r="30" fill="#8EA7D6" opacity={0.5 * intensity + 0.2} />

      {!reducedMotion && (
        <g className="space-ship" opacity={0.7}>
          <path d="M0 0 L26 6 L0 12 L6 6 Z" fill="#DCE3F5" transform="translate(680,140) rotate(20)" />
        </g>
      )}

      <style>{`
        .space-twinkle { animation: space-twinkle 3.5s ease-in-out infinite; }
        .space-orbit { animation: space-orbit 40s linear infinite; }
        .space-ship { animation: space-fly 26s linear infinite; }
        @keyframes space-twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes space-orbit { from { transform: rotate(0deg) translateX(6px) rotate(0deg); } to { transform: rotate(360deg) translateX(6px) rotate(-360deg); } }
        @keyframes space-fly { 0% { transform: translate(-100px, 0); opacity: 0; } 10% { opacity: 0.7; } 90% { opacity: 0.7; } 100% { transform: translate(500px, -160px); opacity: 0; } }
      `}</style>
    </svg>
  );
}

const STARS: Array<[number, number, number]> = Array.from({ length: 90 }, (_, i) => {
  const x = (i * 197) % 1440;
  const y = (i * 311) % 900;
  const r = 0.6 + ((i * 53) % 10) / 10;
  return [x, y, r];
});
