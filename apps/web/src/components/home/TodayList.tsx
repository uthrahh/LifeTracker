"use client";

import { Card } from "@/components/ui/Card";
import { CheckCircle } from "@/components/ui/CheckCircle";
import type { Task, Habit } from "@luma/types";
import type { HabitStreakResult } from "@luma/utils";

export interface TodayListProps {
  tasks: Task[];
  habitsWithStreaks: Array<{ habit: Habit; streak: HabitStreakResult; completedToday: boolean }>;
  onToggleTask: (taskId: string, completed: boolean) => void;
  onToggleHabit: (habitId: string, completed: boolean) => void;
}

export function TodayList({ tasks, habitsWithStreaks, onToggleTask, onToggleHabit }: TodayListProps) {
  const isEmpty = tasks.length === 0 && habitsWithStreaks.length === 0;

  if (isEmpty) {
    return (
      <Card>
        <p className="font-display text-lg text-ink">Your day is clear.</p>
        <p className="mt-1 text-sm text-ink-soft">Enjoy the space, or add something meaningful.</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-border">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <CheckCircle
            checked={task.status === "completed"}
            onToggle={() => onToggleTask(task.id, task.status !== "completed")}
            label={task.title}
          />
          <div className="min-w-0 flex-1">
            <p className={task.status === "completed" ? "truncate text-sm text-ink-faint line-through" : "truncate text-sm text-ink"}>
              {task.title}
            </p>
            {task.dueTime ? <p className="text-xs text-ink-faint">{task.dueTime}</p> : null}
          </div>
        </div>
      ))}
      {habitsWithStreaks.map(({ habit, streak, completedToday }) => (
        <div key={habit.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <CheckCircle checked={completedToday} onToggle={() => onToggleHabit(habit.id, !completedToday)} label={habit.title} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink">{habit.title}</p>
            <p className="text-xs text-ink-faint">{streak.currentStreak > 0 ? `${streak.currentStreak}-day streak` : "Continue today"}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}
