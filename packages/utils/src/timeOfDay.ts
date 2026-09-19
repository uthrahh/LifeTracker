export type TimeOfDay = "dawn" | "morning" | "afternoon" | "evening" | "night";

/**
 * Derives time-of-day from the viewer's IANA timezone, never the server's
 * clock and never hard-coded to a single region. Boundaries are local-hour
 * based so the environment engine stays correct across DST and travel.
 */
export function getTimeOfDay(date: Date, timezone: string): TimeOfDay {
  const hour = getLocalHour(date, timezone);
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export function getLocalHour(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hourCycle: "h23",
  });
  return Number(formatter.format(date));
}

export function getLocalDateString(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date); // en-CA formats as YYYY-MM-DD
}
