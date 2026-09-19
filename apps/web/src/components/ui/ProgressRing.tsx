export interface ProgressRingProps {
  percent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

/** Calm, non-punitive progress indicator — no red, no "failure" color. */
export function ProgressRing({ percent, size = 96, strokeWidth = 8, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="stroke-border" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className="stroke-accent transition-all duration-700 ease-out"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl text-ink">{clamped}%</span>
        {label ? <span className="text-xs text-ink-faint">{label}</span> : null}
      </div>
    </div>
  );
}
