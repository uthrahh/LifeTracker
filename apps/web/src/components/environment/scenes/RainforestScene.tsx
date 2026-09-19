import type { SceneProps } from "../types";
import type { TimeOfDay } from "@wayfare/utils";

const SKY: Record<TimeOfDay, { top: string; bottom: string; canopy: string; canopyDark: string }> = {
  dawn: { top: "#B7CDA0", bottom: "#E7DFC0", canopy: "#4F7A4A", canopyDark: "#33502F" },
  morning: { top: "#A9D6B0", bottom: "#DDEFD6", canopy: "#3F7A44", canopyDark: "#27502B" },
  afternoon: { top: "#8FCB9B", bottom: "#CBE9CE", canopy: "#356B3B", canopyDark: "#204524" },
  evening: { top: "#C79A6B", bottom: "#E7C89A", canopy: "#2F5A38", canopyDark: "#1C3A22" },
  night: { top: "#0E2016", bottom: "#173023", canopy: "#12261A", canopyDark: "#0A160F" },
};

export function RainforestScene({ timeOfDay, weather, reducedMotion }: SceneProps) {
  const p = SKY[timeOfDay];
  const showRain = weather.rainIntensity > 0.15;

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="rf-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.top} />
          <stop offset="100%" stopColor={p.bottom} />
        </linearGradient>
        <linearGradient id="rf-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.25" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#rf-sky)" />

      {/* layered canopy silhouettes for depth */}
      <g opacity="0.55" fill={p.canopy}>
        <ellipse cx="200" cy="120" rx="260" ry="140" />
        <ellipse cx="620" cy="70" rx="300" ry="150" />
        <ellipse cx="1080" cy="110" rx="280" ry="160" />
        <ellipse cx="1400" cy="60" rx="220" ry="140" />
      </g>
      <g opacity="0.85" fill={p.canopyDark}>
        <ellipse cx="0" cy="260" rx="320" ry="200" />
        <ellipse cx="420" cy="220" rx="360" ry="220" />
        <ellipse cx="880" cy="250" rx="380" ry="220" />
        <ellipse cx="1300" cy="210" rx="320" ry="220" />
      </g>

      {/* vertical vine/tree silhouettes framing the scene */}
      <rect x="0" y="0" width="90" height="900" fill={p.canopyDark} opacity="0.9" />
      <rect x="1350" y="0" width="90" height="900" fill={p.canopyDark} opacity="0.9" />

      <rect x="0" y="700" width="1440" height="200" fill={p.canopyDark} />
      <rect width="1440" height="900" fill="url(#rf-mist)" />

      {!reducedMotion && (
        <g className="rf-fireflies" opacity={timeOfDay === "night" ? 0.9 : 0.35}>
          <circle cx="300" cy="500" r="3" fill="#E9F5A0" />
          <circle cx="760" cy="560" r="2.5" fill="#E9F5A0" />
          <circle cx="1050" cy="480" r="3" fill="#E9F5A0" />
        </g>
      )}

      {showRain && !reducedMotion && (
        <g className="rf-rain" stroke="#DDEDE0" strokeWidth="2" strokeLinecap="round" opacity="0.5">
          {RAIN_LINES.map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={x - 10} y2={y + 40} />
          ))}
        </g>
      )}

      <style>{`
        .rf-fireflies circle { animation: rf-flicker 3s ease-in-out infinite; }
        .rf-fireflies circle:nth-child(2) { animation-delay: 1s; }
        .rf-fireflies circle:nth-child(3) { animation-delay: 2s; }
        .rf-rain { animation: rf-fall 0.6s linear infinite; }
        @keyframes rf-flicker { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @keyframes rf-fall { from { transform: translateY(-20px); } to { transform: translateY(20px); } }
      `}</style>
    </svg>
  );
}

const RAIN_LINES: Array<[number, number]> = Array.from({ length: 40 }, (_, i) => [
  120 + ((i * 137) % 1200),
  ((i * 211) % 700),
]);
