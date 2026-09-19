import type { SceneProps } from "../types";
import type { TimeOfDay } from "@wayfare/utils";

const SKY: Record<TimeOfDay, { top: string; bottom: string; celestial: string; celestialGlow: string; showStars: boolean }> = {
  dawn: { top: "#F6C6A0", bottom: "#FCE3C8", celestial: "#FFE3B0", celestialGlow: "#FFD08A", showStars: false },
  morning: { top: "#8FCBEB", bottom: "#DFF3F8", celestial: "#FFF3C4", celestialGlow: "#FFEE99", showStars: false },
  afternoon: { top: "#4FA8DE", bottom: "#BFE6F2", celestial: "#FFF8DE", celestialGlow: "#FFF3B0", showStars: false },
  evening: { top: "#E07A5F", bottom: "#F2B880", celestial: "#FFD9A0", celestialGlow: "#FF9F6B", showStars: false },
  night: { top: "#0B1226", bottom: "#1C2A4A", celestial: "#E8ECF5", celestialGlow: "#C9D3EE", showStars: true },
};

const SEA: Record<TimeOfDay, { far: string; near: string }> = {
  dawn: { far: "#DDA98C", near: "#E9C3A8" },
  morning: { far: "#2E7FA6", near: "#4FA1C4" },
  afternoon: { far: "#1E6E96", near: "#3C93BC" },
  evening: { far: "#8C4A55", near: "#C97A6C" },
  night: { far: "#0E1B33", near: "#16264A" },
};

const CELESTIAL_Y: Record<TimeOfDay, number> = {
  dawn: 260,
  morning: 120,
  afternoon: 70,
  evening: 250,
  night: 90,
};

export function BeachScene({ timeOfDay, reducedMotion }: SceneProps) {
  const sky = SKY[timeOfDay];
  const sea = SEA[timeOfDay];
  const celestialY = CELESTIAL_Y[timeOfDay];
  const isNight = timeOfDay === "night";

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="beach-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.top} />
          <stop offset="100%" stopColor={sky.bottom} />
        </linearGradient>
        <linearGradient id="beach-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sea.far} />
          <stop offset="100%" stopColor={sea.near} />
        </linearGradient>
        <radialGradient id="beach-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={sky.celestialGlow} stopOpacity="0.55" />
          <stop offset="100%" stopColor={sky.celestialGlow} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#beach-sky)" />

      {sky.showStars && (
        <g className={reducedMotion ? undefined : "beach-stars"}>
          {STAR_POSITIONS.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} fill="#F4F6FF" opacity={0.8} />
          ))}
        </g>
      )}

      <circle cx="1180" cy={celestialY} r="120" fill="url(#beach-glow)" />
      <circle cx="1180" cy={celestialY} r={isNight ? 46 : 56} fill={sky.celestial} />

      {!reducedMotion && (
        <g className="beach-clouds" opacity={isNight ? 0.15 : 0.85}>
          <ellipse cx="260" cy="180" rx="90" ry="26" fill="white" />
          <ellipse cx="330" cy="165" rx="60" ry="20" fill="white" />
          <ellipse cx="620" cy="230" rx="70" ry="20" fill="white" />
        </g>
      )}

      {/* distant sea */}
      <rect x="0" y="540" width="1440" height="120" fill="url(#beach-sea)" opacity="0.9" />

      {/* waves */}
      <g className={reducedMotion ? undefined : "beach-waves"}>
        <path d="M-200 640 Q160 610 520 640 T1240 640 T1960 640 V900 H-200 Z" fill={sea.near} opacity="0.95" />
      </g>
      <g className={reducedMotion ? undefined : "beach-waves-2"}>
        <path d="M-200 680 Q160 655 520 680 T1240 680 T1960 680 V900 H-200 Z" fill={sea.near} />
      </g>

      {/* sand */}
      <path d="M0 760 Q360 720 720 748 T1440 740 V900 H0 Z" fill={isNight ? "#2A2620" : "#EBD9B4"} />
      <path d="M0 800 Q400 780 800 800 T1440 790 V900 H0 Z" fill={isNight ? "#231F1A" : "#DFC79C"} opacity="0.7" />

      <style>{`
        .beach-clouds { animation: beach-drift 60s linear infinite; }
        .beach-waves { animation: beach-wave 9s ease-in-out infinite; transform-origin: center; }
        .beach-waves-2 { animation: beach-wave 7s ease-in-out infinite reverse; transform-origin: center; }
        .beach-stars { animation: beach-twinkle 4s ease-in-out infinite; }
        @keyframes beach-drift { from { transform: translateX(-40px); } to { transform: translateX(40px); } }
        @keyframes beach-wave { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(-30px); } }
        @keyframes beach-twinkle { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
      `}</style>
    </svg>
  );
}

const STAR_POSITIONS: Array<[number, number, number]> = [
  [120, 90, 1.6], [220, 140, 1.2], [340, 70, 1.4], [480, 160, 1], [610, 100, 1.5],
  [760, 60, 1.1], [880, 150, 1.3], [1000, 90, 1], [90, 220, 1.2], [400, 220, 1],
];
