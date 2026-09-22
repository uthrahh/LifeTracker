"use client";

import { useMemo } from "react";
import type { EnvironmentScene, EnvironmentTimeMode } from "@wayfare/types";
import { getLocalDateString } from "@wayfare/utils";
import { EnvironmentRenderer } from "@/components/environment/EnvironmentRenderer";
import { useEnvironmentState } from "@/hooks/useEnvironmentState";
import { useHomeData } from "@/hooks/useHomeData";
import { GreetingHeader } from "@/components/home/GreetingHeader";
import { SignOutButton } from "@/components/home/SignOutButton";
import { QuoteOfTheSession } from "@/components/home/QuoteOfTheSession";
import { NextActionCard } from "@/components/home/NextActionCard";
import { TodayList } from "@/components/home/TodayList";
import { GoalsInProgress } from "@/components/home/GoalsInProgress";
import { SagaMap, type SagaMapDay } from "@/components/home/SagaMap";
import { ProgressRing } from "@/components/ui/ProgressRing";

export interface HomeClientProps {
  userId: string;
  fullName: string;
  scene: EnvironmentScene;
  timeMode: EnvironmentTimeMode;
  showQuotes: boolean;
  quotes: Array<{ text: string; author: string | null }>;
}

export function HomeClient({ userId, fullName, scene, timeMode, showQuotes, quotes }: HomeClientProps) {
  const environment = useEnvironmentState({ scene, timeMode });
  const todayLocal = useMemo(() => getLocalDateString(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone), []);

  const { tasks, habitsWithStreaks, goalsWithProgress, progressPercent, ranked, toggleTask, toggleHabit, isLoading } =
    useHomeData(userId, todayLocal);

  const sagaDays: SagaMapDay[] = useMemo(() => buildSagaDays(todayLocal, progressPercent), [todayLocal, progressPercent]);

  return (
    <>
      <EnvironmentRenderer {...environment} />
      <div className="space-y-8 animate-fade-in">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <GreetingHeader name={fullName.split(" ")[0] ?? fullName} />
            {showQuotes && <QuoteOfTheSession quotes={quotes} />}
          </div>
          <SignOutButton />
        </header>

        <section id="today" className="flex items-center gap-5">
          <ProgressRing percent={progressPercent} label="today" />
          <div>
            <p className="font-display text-lg text-ink">Today&apos;s progress</p>
            <p className="text-sm text-ink-soft">
              {tasks.filter((t) => t.status === "completed").length + habitsWithStreaks.filter((h) => h.completedToday).length} of{" "}
              {tasks.length + habitsWithStreaks.length} complete
            </p>
          </div>
        </section>

        {!isLoading && (
          <NextActionCard
            ranked={ranked}
            onComplete={(id, kind) => (kind === "task" ? toggleTask(id, true) : toggleHabit(id, true))}
          />
        )}

        <section>
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Today</p>
          <TodayList tasks={tasks} habitsWithStreaks={habitsWithStreaks} onToggleTask={toggleTask} onToggleHabit={toggleHabit} />
        </section>

        <section>
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Goals in progress</p>
          <GoalsInProgress goals={goalsWithProgress} />
        </section>

        <section>
          <SagaMap days={sagaDays} reducedMotion={environment.reducedMotion} />
        </section>
      </div>
    </>
  );
}

function buildSagaDays(todayLocal: string, todayProgress: number): SagaMapDay[] {
  const [y, m, d] = todayLocal.split("-").map(Number);
  const base = new Date(Date.UTC(y!, (m ?? 1) - 1, d ?? 1));
  const weekdayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });
  const dayFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3;
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + offset);
    const iso = date.toISOString().slice(0, 10);
    return {
      date: iso,
      label: dayFmt.format(date),
      weekday: weekdayFmt.format(date),
      isToday: offset === 0,
      progressPercent: offset === 0 ? todayProgress : offset < 0 ? null : null,
    };
  });
}
