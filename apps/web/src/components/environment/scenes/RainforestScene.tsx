import type { SceneProps } from "../types";
import type { TimeOfDay } from "@luma/utils";

const SKY: Record<TimeOfDay, { top: string; bottom: string; canopy: string; canopyMid: string; canopyDark: string; floor: string }> = {
  dawn: { top: "#B7CDA0", bottom: "#E7DFC0", canopy: "#4F7A4A", canopyMid: "#3B5E38", canopyDark: "#243A24", floor: "#1B2A1B" },
  morning: { top: "#A9D6B0", bottom: "#DDEFD6", canopy: "#3F7A44", canopyMid: "#2E5C33", canopyDark: "#1F3B22", floor: "#182D1A" },
  afternoon: { top: "#8FCB9B", bottom: "#CBE9CE", canopy: "#356B3B", canopyMid: "#26502A", canopyDark: "#19331C", floor: "#132615" },
  evening: { top: "#C79A6B", bottom: "#E7C89A", canopy: "#2F5A38", canopyMid: "#22421F", canopyDark: "#172B17", floor: "#101F10" },
  night: { top: "#0E2016", bottom: "#173023", canopy: "#12261A", canopyMid: "#0D1C13", canopyDark: "#08130C", floor: "#050D07" },
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
          <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#rf-sky)" />

      {/* canopy ceiling — hangs from the top of the frame */}
      <g opacity="0.55" fill={p.canopy}>
        <ellipse cx="200" cy="60" rx="280" ry="150" />
        <ellipse cx="620" cy="10" rx="320" ry="160" />
        <ellipse cx="1080" cy="50" rx="300" ry="170" />
        <ellipse cx="1400" cy="0" rx="240" ry="150" />
      </g>
      <g opacity="0.9" fill={p.canopyMid}>
        <ellipse cx="0" cy="140" rx="340" ry="200" />
        <ellipse cx="420" cy="110" rx="380" ry="220" />
        <ellipse cx="880" cy="130" rx="400" ry="220" />
        <ellipse cx="1300" cy="100" rx="340" ry="220" />
      </g>

      {/* mid-story: tall trunk silhouettes bridging canopy to floor, so there is
          no empty band of bare sky between the ceiling and the ground */}
      <g fill={p.canopyDark} opacity="0.9">
        {TRUNKS.map(([x, w], i) => (
          <rect key={i} x={x} y={240} width={w} height={640} rx={w / 2} />
        ))}
      </g>

      {/* dense low foliage, full width, no gaps down to the floor */}
      <g fill={p.canopyDark}>
        <ellipse cx="120" cy="620" rx="260" ry="180" />
        <ellipse cx="480" cy="600" rx="300" ry="200" />
        <ellipse cx="860" cy="610" rx="320" ry="200" />
        <ellipse cx="1250" cy="600" rx="280" ry="190" />
        <ellipse cx="1440" cy="580" rx="260" ry="200" />
      </g>

      {/* forest floor */}
      <rect x="0" y="740" width="1440" height="160" fill={p.floor} />

      <rect width="1440" height="900" fill="url(#rf-mist)" />

      {!reducedMotion && (
        <g className="rf-fireflies" opacity={timeOfDay === "night" ? 0.9 : 0.35}>
          <circle cx="300" cy="560" r="3" fill="#E9F5A0" />
          <circle cx="760" cy="600" r="2.5" fill="#E9F5A0" />
          <circle cx="1050" cy="540" r="3" fill="#E9F5A0" />
        </g>
      )}

      {showRain && !reducedMotion && (
        <g className="rf-rain" stroke="#DDEDE0" strokeWidth="2" strokeLinecap="round" opacity="0.45">
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

const TRUNKS: Array<[number, number]> = [
  [60, 22], [260, 16], [520, 26], [760, 18], [980, 24], [1180, 16], [1360, 22],
];

const RAIN_LINES: Array<[number, number]> = Array.from({ length: 40 }, (_, i) => [
  120 + ((i * 137) % 1200),
  240 + ((i * 211) % 500),
]);
