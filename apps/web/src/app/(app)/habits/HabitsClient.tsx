"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchActiveHabits, fetchHabitCompletionsInRange, toggleHabitCompletion } from "@/lib/queries";
import { createHabit, archiveHabit, deleteHabit } from "@/lib/queries/habits";
import { computeHabitStreak, getLocalDateString } from "@wayfare/utils";
import type { HabitFrequency } from "@wayfare/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { CheckCircle } from "@/components/ui/CheckCircle";

type FrequencyType = HabitFrequency["type"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HabitsClient({ userId }: { userId: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const todayLocal = useMemo(() => getLocalDateString(new Date(), Intl.DateTimeFormat().resolvedOptions().timeZone), []);
  const rangeStart = useMemo(() => shiftDate(todayLocal, -30), [todayLocal]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>("daily");
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [days, setDays] = useState<number[]>([1, 3, 5]);

  const habitsQuery = useQuery({ queryKey: ["all_habits", userId], queryFn: () => fetchActiveHabits(supabase, userId) });
  const completionsQuery = useQuery({
    queryKey: ["all_habit_completions", userId, rangeStart, todayLocal],
    queryFn: () => fetchHabitCompletionsInRange(supabase, userId, rangeStart, todayLocal),
  });

  const invalidateHabits = () => {
    queryClient.invalidateQueries({ queryKey: ["all_habits", userId] });
    queryClient.invalidateQueries({ queryKey: ["all_habit_completions", userId] });
  };

  const toggle = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      toggleHabitCompletion(supabase, userId, habitId, todayLocal, completed),
    onSuccess: invalidateHabits,
  });

  const create = useMutation({
    mutationFn: () => {
      const frequency: HabitFrequency =
        frequencyType === "daily"
          ? { type: "daily" }
          : frequencyType === "weekly_count"
            ? { type: "weekly_count", timesPerWeek }
            : { type: "specific_days", days };
      return createHabit(supabase, userId, { title: title.trim(), frequency, startDate: todayLocal });
    },
    onSuccess: () => {
      setTitle("");
      setShowForm(false);
      invalidateHabits();
    },
  });

  const archive = useMutation({ mutationFn: (id: string) => archiveHabit(supabase, id), onSuccess: invalidateHabits });
  const remove = useMutation({ mutationFn: (id: string) => deleteHabit(supabase, id), onSuccess: invalidateHabits });

  const habitsWithStreak = useMemo(() => {
    const completions = completionsQuery.data ?? [];
    return (habitsQuery.data ?? []).map((habit) => {
      const habitCompletions = completions.filter((c) => c.habitId === habit.id).map((c) => c.completedDate);
      const streak = computeHabitStreak(habit.frequency, habitCompletions, todayLocal);
      const completedToday = habitCompletions.includes(todayLocal);
      return { habit, streak, completedToday };
    });
  }, [habitsQuery.data, completionsQuery.data, todayLocal]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Habits</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New habit"}
        </Button>
      </header>

      {showForm && (
        <Card>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) create.mutate();
            }}
          >
            <TextField label="Habit" placeholder="e.g. Read, Exercise, Drink water" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select label="Frequency" value={frequencyType} onChange={(e) => setFrequencyType(e.target.value as FrequencyType)}>
              <option value="daily">Every day</option>
              <option value="weekly_count">A few times a week</option>
              <option value="specific_days">Specific days</option>
            </Select>
            {frequencyType === "weekly_count" && (
              <TextField
                label="Times per week"
                type="number"
                min={1}
                max={7}
                value={timesPerWeek}
                onChange={(e) => setTimesPerWeek(Number(e.target.value))}
              />
            )}
            {frequencyType === "specific_days" && (
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setDays((prev) => (prev.includes(i) ? prev.filter((d) => d !== i) : [...prev, i]))}
                    className={`focus-ring rounded-full border px-3 py-1.5 text-xs ${
                      days.includes(i) ? "border-accent bg-accent text-paper" : "border-border text-ink-soft"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Create habit"}
            </Button>
          </form>
        </Card>
      )}

      {habitsWithStreak.length === 0 ? (
        <Card>
          <p className="font-display text-lg text-ink">No habits yet.</p>
          <p className="mt-1 text-sm text-ink-soft">Start with one you can keep up.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {habitsWithStreak.map(({ habit, streak, completedToday }) => (
            <Card key={habit.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle checked={completedToday} onToggle={() => toggle.mutate({ habitId: habit.id, completed: !completedToday })} label={habit.title} />
                  <div>
                    <p className="text-sm text-ink">{habit.title}</p>
                    <p className="text-xs text-ink-faint">
                      {streak.currentStreak > 0 ? `${streak.currentStreak}-day streak` : "Continue today"} · {streak.weeklyConsistencyPercent}% this week
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-ink-faint">
                  <button type="button" onClick={() => archive.mutate(habit.id)} className="focus-ring hover:text-ink-soft">
                    Archive
                  </button>
                  <button type="button" onClick={() => remove.mutate(habit.id)} className="focus-ring hover:text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + days));
  return date.toISOString().slice(0, 10);
}
