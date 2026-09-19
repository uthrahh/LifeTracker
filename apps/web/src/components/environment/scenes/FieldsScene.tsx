import type { SceneProps } from "../types";
import type { TimeOfDay } from "@wayfare/utils";

const SKY: Record<TimeOfDay, { top: string; bottom: string; hill: string; hillFar: string; flower: string }> = {
  dawn: { top: "#F7D6C2", bottom: "#FCEBD6", hill: "#8FAE72", hillFar: "#B7CDA0", flower: "#F2A5B0" },
  morning: { top: "#B7E1F5", bottom: "#EAF7EA", hill: "#7EB05C", hillFar: "#A9CE8B", flower: "#F5B4C4" },
  afternoon: { top: "#8FD0F0", bottom: "#DFF4E0", hill: "#6BA34C", hillFar: "#99C67D", flower: "#F0C64C" },
  evening: { top: "#E6957A", bottom: "#F3C98C", hill: "#5C7A47", hillFar: "#8AA36C", flower: "#E88BA0" },
  night: { top: "#111A34", bottom: "#20304E", hill: "#1E2A22", hillFar: "#293A2C", flower: "#5C6FA0" },
};

export function FieldsScene({ timeOfDay, reducedMotion }: SceneProps) {
  const p = SKY[timeOfDay];

  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="fields-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.top} />
          <stop offset="100%" stopColor={p.bottom} />
        </linearGradient>
      </defs>

      <rect width="1440" height="900" fill="url(#fields-sky)" />

      {!reducedMotion && (
        <g className="fields-clouds" opacity={timeOfDay === "night" ? 0.15 : 0.8}>
          <ellipse cx="300" cy="140" rx="100" ry="26" fill="white" />
          <ellipse cx="900" cy="100" rx="80" ry="22" fill="white" />
        </g>
      )}

      <path d="M0 480 Q360 400 720 460 T1440 440 V900 H0 Z" fill={p.hillFar} />
      <path d="M0 560 Q400 500 800 550 T1440 540 V900 H0 Z" fill={p.hill} />

      <g className={reducedMotion ? undefined : "fields-sway"}>
        {FLOWERS.map(([x, y], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <line x1="0" y1="0" x2="0" y2="18" stroke="#4E6B3A" strokeWidth="2" />
            <circle cx="0" cy="-2" r="5" fill={p.flower} />
          </g>
        ))}
      </g>

      {!reducedMotion && (
        <g className="fields-butterfly" opacity="0.8">
          <path d="M0 0 Q6 -8 12 0 Q6 8 0 0 Z" fill="#F2E5A0" transform="translate(500,650)" />
        </g>
      )}

      <style>{`
        .fields-clouds { animation: fields-drift 70s linear infinite; }
        .fields-sway { animation: fields-sway 4s ease-in-out infinite; transform-origin: bottom center; }
        .fields-butterfly { animation: fields-flutter 12s ease-in-out infinite; }
        @keyframes fields-drift { from { transform: translateX(-50px); } to { transform: translateX(50px); } }
        @keyframes fields-sway { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1.5deg); } }
        @keyframes fields-flutter { 0% { transform: translate(0,0); } 50% { transform: translate(200px,-40px); } 100% { transform: translate(0,0); } }
      `}</style>
    </svg>
  );
}

const FLOWERS: Array<[number, number]> = Array.from({ length: 26 }, (_, i) => [
  60 + ((i * 53) % 1320),
  620 + ((i * 37) % 220),
]);
