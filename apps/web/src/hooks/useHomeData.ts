"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchTasksForDate,
  fetchActiveHabits,
  fetchHabitCompletionsInRange,
  fetchGoalsInProgress,
  fetchMilestonesForGoals,
  toggleTaskCompletion,
  toggleHabitCompletion,
} from "@/lib/queries";
import { computeHabitStreak, computeGoalProgress, rankNextActions, type NextActionCandidate } from "@wayfare/utils";

export function useHomeData(userId: string | undefined, todayLocal: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ["tasks", userId, todayLocal],
    queryFn: () => fetchTasksForDate(supabase, userId!, todayLocal),
    enabled: !!userId,
  });

  const habitsQuery = useQuery({
    queryKey: ["habits", userId],
    queryFn: () => fetchActiveHabits(supabase, userId!),
    enabled: !!userId,
  });

  const rangeStart = useMemo(() => shiftDate(todayLocal, -30), [todayLocal]);
  const completionsQuery = useQuery({
    queryKey: ["habit_completions", userId, rangeStart, todayLocal],
    queryFn: () => fetchHabitCompletionsInRange(supabase, userId!, rangeStart, todayLocal),
    enabled: !!userId,
  });

  const goalsQuery = useQuery({
    queryKey: ["goals_in_progress", userId],
    queryFn: () => fetchGoalsInProgress(supabase, userId!),
    enabled: !!userId,
  });

  const goalIds = useMemo(() => (goalsQuery.data ?? []).map((g) => g.id), [goalsQuery.data]);
  const milestonesQuery = useQuery({
    queryKey: ["milestones_for_goals", userId, goalIds],
    queryFn: () => fetchMilestonesForGoals(supabase, userId!, goalIds),
    enabled: !!userId && goalIds.length > 0,
  });

  const goalsWithProgress = useMemo(() => {
    const milestones = milestonesQuery.data ?? [];
    return (goalsQuery.data ?? []).map((goal) => {
      const goalMilestones = milestones.filter((m) => m.goalId === goal.id);
      const progress = computeGoalProgress({
        progressOverride: goal.progressOverride,
        childGoals: [],
        milestones: goalMilestones.map((m) => ({ id: m.id, weight: m.weight, status: m.status, taskCompletionRatio: null })),
        directTaskCompletionRatio: null,
      });
      const nextMilestone = goalMilestones.find((m) => m.status !== "completed") ?? null;
      return { goal, progress, nextMilestone };
    });
  }, [goalsQuery.data, milestonesQuery.data]);

  const toggleTask = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      toggleTaskCompletion(supabase, taskId, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks", userId] }),
  });

  const toggleHabit = useMutation({
    mutationFn: ({ habitId, completed }: { habitId: string; completed: boolean }) =>
      toggleHabitCompletion(supabase, userId!, habitId, todayLocal, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["habit_completions", userId] }),
  });

  const habitsWithStreaks = useMemo(() => {
    const completions = completionsQuery.data ?? [];
    return (habitsQuery.data ?? []).map((habit) => {
      const habitCompletions = completions.filter((c) => c.habitId === habit.id).map((c) => c.completedDate);
      const streak = computeHabitStreak(habit.frequency, habitCompletions, todayLocal);
      const completedToday = habitCompletions.includes(todayLocal);
      return { habit, streak, completedToday };
    });
  }, [habitsQuery.data, completionsQuery.data, todayLocal]);

  const tasks = tasksQuery.data ?? [];
  const totalItems = tasks.length + habitsWithStreaks.length;
  const completedItems = tasks.filter((t) => t.status === "completed").length + habitsWithStreaks.filter((h) => h.completedToday).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const nextActionCandidates: NextActionCandidate[] = useMemo(() => {
    const fromTasks: NextActionCandidate[] = tasks
      .filter((t) => t.status === "pending")
      .map((t) => ({
        id: t.id,
        kind: "task",
        title: t.title,
        dueDate: t.dueDate,
        dueTime: t.dueTime,
        priority: t.priority,
        estimatedDurationMinutes: t.estimatedDurationMinutes,
        linkedToActiveGoal: !!t.goalId,
      }));
    const fromHabits: NextActionCandidate[] = habitsWithStreaks
      .filter((h) => !h.completedToday)
      .map(({ habit }) => ({
        id: habit.id,
        kind: "habit",
        title: habit.title,
        dueDate: todayLocal,
        dueTime: habit.reminderAt,
        priority: null,
        estimatedDurationMinutes: null,
        linkedToActiveGoal: false,
      }));
    return [...fromTasks, ...fromHabits];
  }, [tasks, habitsWithStreaks, todayLocal]);

  const ranked = useMemo(
    () => rankNextActions(nextActionCandidates, new Date(), todayLocal),
    [nextActionCandidates, todayLocal],
  );

  return {
    isLoading: tasksQuery.isLoading || habitsQuery.isLoading || goalsQuery.isLoading,
    tasks,
    habitsWithStreaks,
    goals: goalsQuery.data ?? [],
    goalsWithProgress,
    progressPercent,
    completedItems,
    totalItems,
    ranked,
    toggleTask: (taskId: string, completed: boolean) => toggleTask.mutate({ taskId, completed }),
    toggleHabit: (habitId: string, completed: boolean) => toggleHabit.mutate({ habitId, completed }),
  };
}

function shiftDate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y!, (m ?? 1) - 1, (d ?? 1) + days));
  return date.toISOString().slice(0, 10);
}
