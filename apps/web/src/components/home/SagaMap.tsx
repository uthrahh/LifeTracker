"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion } from "framer-motion";

export interface SagaMapDay {
  date: string; // YYYY-MM-DD
  label: string; // "Sep 19"
  weekday: string; // "Fri"
  isToday: boolean;
  progressPercent: number | null; // null = no data loaded / future day
}

export function SagaMap({ days, reducedMotion }: { days: SagaMapDay[]; reducedMotion: boolean }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Your journey</p>
      <div className="flex gap-3 overflow-x-auto pb-2" role="list">
        {days.map((day, i) => (
          <motion.div
            key={day.date}
            role="listitem"
            initial={reducedMotion ? undefined : { opacity: 0, y: 8 }}
            animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={day.isToday ? "#today" : `/day/${day.date}`}
              className={clsx(
                "focus-ring flex shrink-0 flex-col items-center justify-center rounded-xl2 border transition-all duration-200",
                day.isToday
                  ? "h-24 w-24 border-accent bg-accent text-paper shadow-glow"
                  : "h-16 w-16 border-border bg-paper-raised/60 text-ink-soft hover:border-accent/60",
              )}
            >
              <span className={clsx("text-xs", day.isToday ? "text-paper/80" : "text-ink-faint")}>{day.weekday}</span>
              <span className={clsx("font-display", day.isToday ? "text-lg" : "text-sm")}>{day.label}</span>
              {day.progressPercent !== null && (
                <span className={clsx("mt-0.5 text-[10px]", day.isToday ? "text-paper/80" : "text-ink-faint")}>
                  {day.progressPercent}%
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
