import type { SupabaseClient } from "@supabase/supabase-js";
import type { Goal, Milestone, Task, MilestoneStatus, GoalStatus } from "@luma/types";
import type { CreateGoalInput, CreateMilestoneInput } from "@luma/validation";
import { snakeToCamel, snakeToCamelArray } from "@luma/utils";

export async function fetchGoals(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .is("parent_goal_id", null)
    .neq("status", "archived")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return snakeToCamelArray<Goal>(data ?? []);
}

/** Delegates to fn_goal_progress in Postgres — the same recursive, weighted
 * aggregation defined in packages/utils/src/progress.ts, so a nested goal's
 * progress is always correct without re-implementing the recursion client-side. */
export async function fetchGoalProgress(supabase: SupabaseClient, goalId: string): Promise<number> {
  const { data, error } = await supabase.rpc("fn_goal_progress", { p_goal_id: goalId });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function fetchGoalById(supabase: SupabaseClient, userId: string, goalId: string) {
  const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId).eq("id", goalId).single();
  if (error) throw error;
  return snakeToCamel<Goal>(data);
}

export async function fetchChildGoals(supabase: SupabaseClient, userId: string, parentGoalId: string) {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("parent_goal_id", parentGoalId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return snakeToCamelArray<Goal>(data ?? []);
}

export async function fetchMilestonesForGoal(supabase: SupabaseClient, userId: string, goalId: string) {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return snakeToCamelArray<Milestone>(data ?? []);
}

export async function fetchTasksForGoal(supabase: SupabaseClient, userId: string, goalId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .is("milestone_id", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return snakeToCamelArray<Task>(data ?? []);
}

export async function createGoal(supabase: SupabaseClient, userId: string, input: CreateGoalInput) {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description ?? null,
      parent_goal_id: input.parentGoalId ?? null,
      category_id: input.categoryId ?? null,
      type: input.type,
      start_date: input.startDate ?? null,
      target_date: input.targetDate ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return snakeToCamel<Goal>(data);
}

export async function updateGoalStatus(supabase: SupabaseClient, goalId: string, status: GoalStatus) {
  const { error } = await supabase.from("goals").update({ status }).eq("id", goalId);
  if (error) throw error;
}

export async function deleteGoal(supabase: SupabaseClient, goalId: string) {
  const { error } = await supabase.from("goals").delete().eq("id", goalId);
  if (error) throw error;
}

export async function createMilestone(supabase: SupabaseClient, userId: string, input: CreateMilestoneInput) {
  const { data, error } = await supabase
    .from("milestones")
    .insert({
      user_id: userId,
      goal_id: input.goalId,
      title: input.title,
      description: input.description ?? null,
      weight: input.weight,
      target_date: input.targetDate ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return snakeToCamel<Milestone>(data);
}

export async function updateMilestoneStatus(supabase: SupabaseClient, milestoneId: string, status: MilestoneStatus) {
  const { error } = await supabase.from("milestones").update({ status }).eq("id", milestoneId);
  if (error) throw error;
}

export async function deleteMilestone(supabase: SupabaseClient, milestoneId: string) {
  const { error } = await supabase.from("milestones").delete().eq("id", milestoneId);
  if (error) throw error;
}

export async function createGoalTask(supabase: SupabaseClient, userId: string, goalId: string, title: string) {
  const { error } = await supabase.from("tasks").insert({ user_id: userId, goal_id: goalId, title, priority: "medium" });
  if (error) throw error;
}

export async function toggleGoalTaskCompletion(supabase: SupabaseClient, taskId: string, completed: boolean) {
  const { error } = await supabase
    .from("tasks")
    .update({ status: completed ? "completed" : "pending", completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId);
  if (error) throw error;
}

export const MILESTONE_STATUS_CYCLE: MilestoneStatus[] = ["pending", "in_progress", "completed"];
