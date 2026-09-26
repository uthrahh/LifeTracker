import type { SceneProps } from "../types";
import type { TimeOfDay } from "@luma/utils";

const SKY: Record<TimeOfDay, { top: string; bottom: string; building: string; buildingLit: boolean }> = {
  dawn: { top: "#F5C2A0", bottom: "#FBE0C0", building: "#7A6C7A", buildingLit: false },
  morning: { top: "#9AD1F0", bottom: "#E4F4FA", building: "#8F94A3", buildingLit: false },
  afternoon: { top: "#5FB0E8", bottom: "#CDEBF7", building: "#8F94A3", buildingLit: false },
  evening: { top: "#E4805F", bottom: "#F3B583", building: "#5C5468", buildingLit: true },
  night: { top: "#0A0E22", bottom: "#161B36", building: "#22273F", buildingLit: true },
};

const BUILDINGS = [
  { x: 40, w: 90, h: 260 }, { x: 150, w: 60, h: 180 }, { x: 230, w: 110, h: 340 },
  { x: 360, w: 70, h: 220 }, { x: 450, w: 130, h: 400 }, { x: 600, w: 80, h: 260 },
  { x: 700, w: 100, h: 320 }, { x: 820, w: 60, h: 200 }, { x: 900, w: 140, h: 420 },
  { x: 1060, w: 90, h: 280 }, { x: 1170, w: 110, h: 360 }, { x: 1300, w: 100, h: 240 },
];

export function CityScene({ timeOfDay, reducedMotion }: SceneProps) {
  const p = SKY[timeOfDay];

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="city-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.top} />
          <stop offset="100%" stopColor={p.bottom} />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#city-sky)" />

      {/* far skyline */}
      <g opacity="0.5" fill={p.building}>
        {BUILDINGS.map((b, i) => (
          <rect key={i} x={b.x} y={620 - b.h * 0.7} width={b.w} height={b.h * 0.7} />
        ))}
      </g>

      {/* near skyline */}
      <g fill={p.building}>
        {BUILDINGS.map((b, i) => (
          <g key={i}>
            <rect x={b.x + 700} y={640 - b.h} width={b.w} height={b.h} />
            {p.buildingLit &&
              Array.from({ length: Math.floor(b.h / 34) }).map((_, wi) => (
                <rect
                  key={wi}
                  x={b.x + 700 + 10}
                  y={640 - b.h + 12 + wi * 34}
                  width={8}
                  height={12}
                  fill={(wi + i) % 3 === 0 ? "#F5D98A" : "transparent"}
                  className={reducedMotion || (wi + i) % 3 !== 0 ? undefined : "city-window"}
                />
              ))}
          </g>
        ))}
      </g>

      <rect x="0" y="640" width="1440" height="260" fill={p.buildingLit ? "#0B0D1C" : "#3C4150"} />

      {!reducedMotion && (
        <g className="city-traffic" fill="#F2C572" opacity="0.85">
          <circle cx="120" cy="700" r="3" />
          <circle cx="500" cy="710" r="3" />
          <circle cx="900" cy="700" r="3" />
        </g>
      )}

      {!reducedMotion && (
        <g className="city-plane" opacity="0.7">
          <circle cx="0" cy="0" r="2.5" fill="#F4F6FF" transform="translate(200,140)" />
        </g>
      )}

      <style>{`
        .city-window { animation: city-flicker 6s ease-in-out infinite; }
        .city-traffic circle { animation: city-move 4s linear infinite; }
        .city-traffic circle:nth-child(2) { animation-delay: 1.3s; }
        .city-traffic circle:nth-child(3) { animation-delay: 2.6s; }
        .city-plane circle { animation: city-fly 30s linear infinite; }
        @keyframes city-flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes city-move { from { transform: translateX(0); } to { transform: translateX(260px); } }
        @keyframes city-fly { from { transform: translate(0,0); } to { transform: translate(1100px, -60px); } }
      `}</style>
    </svg>
  );
}
