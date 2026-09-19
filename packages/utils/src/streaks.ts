import type { HabitFrequency } from "@wayfare/types";

export interface HabitStreakResult {
  currentStreak: number;
  longestStreak: number;
  /** % of the trailing 7 days (or weeks, for weekly_count habits) that met the target. */
  weeklyConsistencyPercent: number;
  /** % of the trailing 30 days (or ~4 weeks) that met the target. */
  monthlyConsistencyPercent: number;
}

/** Parses a YYYY-MM-DD string as a UTC calendar day so day-math never drifts across DST. */
function toUtcDay(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / 86_400_000;
}

function fromUtcDay(day: number): string {
  return new Date(day * 86_400_000).toISOString().slice(0, 10);
}

function isScheduledDay(frequency: HabitFrequency, dayOfWeek: number): boolean {
  if (frequency.type === "specific_days") return frequency.days.includes(dayOfWeek);
  return true; // daily and weekly_count habits are "eligible" every day
}

export function computeHabitStreak(
  frequency: HabitFrequency,
  completions: string[],
  today: string,
): HabitStreakResult {
  const completedDays = new Set(completions.map(toUtcDay));
  const todayDay = toUtcDay(today);

  if (frequency.type === "weekly_count") {
    return computeWeeklyCountStreak(frequency.timesPerWeek, completedDays, todayDay);
  }

  return computeDailyOrScheduledStreak(frequency, completedDays, todayDay);
}

function computeDailyOrScheduledStreak(
  frequency: HabitFrequency,
  completedDays: Set<number>,
  todayDay: number,
): HabitStreakResult {
  // Current streak: walk backward from today. A habit isn't "broken" just
  // because today isn't done yet — start counting from today if done,
  // otherwise from yesterday, per the non-punitive product rule.
  let cursor = completedDays.has(todayDay) ? todayDay : todayDay - 1;
  let currentStreak = 0;
  while (true) {
    const dow = new Date(cursor * 86_400_000).getUTCDay();
    if (!isScheduledDay(frequency, dow)) {
      cursor -= 1;
      continue;
    }
    if (!completedDays.has(cursor)) break;
    currentStreak += 1;
    cursor -= 1;
  }

  // Longest streak: scan the full completion history.
  const sortedDays = [...completedDays].sort((a, b) => a - b);
  let longestStreak = 0;
  let running = 0;
  let prev: number | null = null;
  for (const day of sortedDays) {
    if (prev !== null && isConsecutiveScheduled(frequency, prev, day)) {
      running += 1;
    } else {
      running = 1;
    }
    longestStreak = Math.max(longestStreak, running);
    prev = day;
  }
  longestStreak = Math.max(longestStreak, currentStreak);

  const weeklyConsistencyPercent = consistencyOverWindow(frequency, completedDays, todayDay, 7);
  const monthlyConsistencyPercent = consistencyOverWindow(frequency, completedDays, todayDay, 30);

  return { currentStreak, longestStreak, weeklyConsistencyPercent, monthlyConsistencyPercent };
}

function isConsecutiveScheduled(frequency: HabitFrequency, prevDay: number, day: number): boolean {
  // Walk from prevDay+1 to day-1; if any of those are scheduled days, the streak broke.
  for (let d = prevDay + 1; d < day; d++) {
    const dow = new Date(d * 86_400_000).getUTCDay();
    if (isScheduledDay(frequency, dow)) return false;
  }
  return true;
}

function consistencyOverWindow(
  frequency: HabitFrequency,
  completedDays: Set<number>,
  todayDay: number,
  windowSize: number,
): number {
  let scheduled = 0;
  let completed = 0;
  for (let d = todayDay - windowSize + 1; d <= todayDay; d++) {
    const dow = new Date(d * 86_400_000).getUTCDay();
    if (!isScheduledDay(frequency, dow)) continue;
    scheduled += 1;
    if (completedDays.has(d)) completed += 1;
  }
  if (scheduled === 0) return 100;
  return Math.round((completed / scheduled) * 100);
}

function computeWeeklyCountStreak(
  timesPerWeek: number,
  completedDays: Set<number>,
  todayDay: number,
): HabitStreakResult {
  const currentWeekStart = todayDay - ((new Date(todayDay * 86_400_000).getUTCDay() + 6) % 7); // Monday start
  const countInWeek = (weekStart: number): number => {
    let count = 0;
    for (let d = weekStart; d < weekStart + 7; d++) if (completedDays.has(d)) count += 1;
    return count;
  };

  // Current streak counts consecutive fully-met weeks, walking backward.
  // The in-progress current week doesn't break the streak — it just isn't counted yet.
  let currentStreak = 0;
  let weekStart = currentWeekStart - 7;
  while (countInWeek(weekStart) >= timesPerWeek) {
    currentStreak += 1;
    weekStart -= 7;
  }

  let longestStreak = currentStreak;
  const allDays = [...completedDays];
  if (allDays.length > 0) {
    const earliest = Math.min(...allDays);
    let running = 0;
    for (let ws = earliest - (((new Date(earliest * 86_400_000).getUTCDay() + 6) % 7)); ws <= currentWeekStart; ws += 7) {
      if (countInWeek(ws) >= timesPerWeek) {
        running += 1;
        longestStreak = Math.max(longestStreak, running);
      } else {
        running = 0;
      }
    }
  }

  const weeklyConsistencyPercent = Math.min(100, Math.round((countInWeek(currentWeekStart) / timesPerWeek) * 100));
  let monthlyCompleted = 0;
  for (let d = todayDay - 29; d <= todayDay; d++) if (completedDays.has(d)) monthlyCompleted += 1;
  const monthlyConsistencyPercent = Math.min(100, Math.round((monthlyCompleted / (timesPerWeek * (30 / 7))) * 100));

  return { currentStreak, longestStreak, weeklyConsistencyPercent, monthlyConsistencyPercent };
}

export { toUtcDay, fromUtcDay };
