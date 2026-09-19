import type { SupabaseClient } from "@supabase/supabase-js";
import type { Task, Habit, HabitCompletion, Goal, Milestone } from "@wayfare/types";

/** Thin, typed query functions. Every one filters through RLS implicitly —
 * the server never needs to add `user_id = ...` itself because Postgres
 * enforces it, but we still scope by the known user id to keep query plans tight. */

export async function fetchTasksForDate(supabase: SupabaseClient, userId: string, date: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("due_date", date)
    .neq("status", "cancelled")
    .order("priority", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Task[];
}

export async function fetchActiveHabits(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active");
  if (error) throw error;
  return (data ?? []) as unknown as Habit[];
}

export async function fetchHabitCompletionsInRange(
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string,
) {
  const { data, error } = await supabase
    .from("habit_completions")
    .select("*")
    .eq("user_id", userId)
    .gte("completed_date", startDate)
    .lte("completed_date", endDate);
  if (error) throw error;
  return (data ?? []) as unknown as HabitCompletion[];
}

export async function fetchGoalsInProgress(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(6);
  if (error) throw error;
  return (data ?? []) as unknown as Goal[];
}

export async function fetchMilestonesForGoals(supabase: SupabaseClient, userId: string, goalIds: string[]) {
  if (goalIds.length === 0) return [] as Milestone[];
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .in("goal_id", goalIds)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as Milestone[];
}

export async function toggleTaskCompletion(supabase: SupabaseClient, taskId: string, completed: boolean) {
  const { error } = await supabase
    .from("tasks")
    .update({ status: completed ? "completed" : "pending", completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId);
  if (error) throw error;
}

export async function toggleHabitCompletion(
  supabase: SupabaseClient,
  userId: string,
  habitId: string,
  date: string,
  completed: boolean,
) {
  if (completed) {
    const { error } = await supabase.from("habit_completions").insert({ user_id: userId, habit_id: habitId, completed_date: date });
    if (error) throw error;
  } else {
    const { error } = await supabase.from("habit_completions").delete().eq("habit_id", habitId).eq("completed_date", date);
    if (error) throw error;
  }
}
