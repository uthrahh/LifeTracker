"use client";

import Link from "next/link";
import { useHomeData } from "@/hooks/useHomeData";
import { TodayList } from "@/components/home/TodayList";
import { ProgressRing } from "@/components/ui/ProgressRing";

export function DayClient({ userId, date }: { userId: string; date: string }) {
  const { tasks, habitsWithStreaks, progressPercent, isLoading, toggleTask, toggleHabit } = useHomeData(userId, date);

  const label = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/home" className="focus-ring text-sm text-ink-soft">
        ← Today
      </Link>
      <header className="flex items-center gap-5">
        <ProgressRing percent={progressPercent} />
        <h1 className="font-display text-2xl text-ink">{label}</h1>
      </header>

      {!isLoading && (
        <TodayList tasks={tasks} habitsWithStreaks={habitsWithStreaks} onToggleTask={toggleTask} onToggleHabit={toggleHabit} />
      )}
    </div>
  );
}
