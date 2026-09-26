"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  fetchGoalById,
  fetchGoalProgress,
  fetchMilestonesForGoal,
  fetchChildGoals,
  fetchTasksForGoal,
  createMilestone,
  updateMilestoneStatus,
  deleteMilestone,
  createGoalTask,
  toggleGoalTaskCompletion,
  deleteGoal,
  updateGoalStatus,
  MILESTONE_STATUS_CYCLE,
} from "@/lib/queries/goals";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { CheckCircle } from "@/components/ui/CheckCircle";
import type { MilestoneStatus } from "@luma/types";

const STATUS_LABEL: Record<MilestoneStatus, string> = { pending: "Pending", in_progress: "In progress", completed: "Completed" };

export function GoalDetailClient({ userId, goalId }: { userId: string; goalId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const [newMilestone, setNewMilestone] = useState("");
  const [newTask, setNewTask] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId] });

  const goalQuery = useQuery({ queryKey: ["goal_detail", goalId, "goal"], queryFn: () => fetchGoalById(supabase, userId, goalId) });
  const progressQuery = useQuery({ queryKey: ["goal_detail", goalId, "progress"], queryFn: () => fetchGoalProgress(supabase, goalId) });
  const milestonesQuery = useQuery({
    queryKey: ["goal_detail", goalId, "milestones"],
    queryFn: () => fetchMilestonesForGoal(supabase, userId, goalId),
  });
  const childGoalsQuery = useQuery({
    queryKey: ["goal_detail", goalId, "children"],
    queryFn: () => fetchChildGoals(supabase, userId, goalId),
  });
  const tasksQuery = useQuery({ queryKey: ["goal_detail", goalId, "tasks"], queryFn: () => fetchTasksForGoal(supabase, userId, goalId) });

  const addMilestone = useMutation({
    mutationFn: () => createMilestone(supabase, userId, { goalId, title: newMilestone.trim(), weight: 1 }),
    onSuccess: () => {
      setNewMilestone("");
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "milestones"] });
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "progress"] });
    },
  });

  const cycleMilestone = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MilestoneStatus }) => updateMilestoneStatus(supabase, id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "milestones"] });
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "progress"] });
    },
  });

  const removeMilestone = useMutation({
    mutationFn: (id: string) => deleteMilestone(supabase, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "milestones"] });
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "progress"] });
    },
  });

  const addTask = useMutation({
    mutationFn: () => createGoalTask(supabase, userId, goalId, newTask.trim()),
    onSuccess: () => {
      setNewTask("");
      queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "tasks"] });
    },
  });

  const toggleTask = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => toggleGoalTaskCompletion(supabase, id, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goal_detail", goalId, "tasks"] }),
  });

  const markComplete = useMutation({
    mutationFn: () => updateGoalStatus(supabase, goalId, "completed"),
    onSuccess: invalidate,
  });

  const removeGoal = useMutation({
    mutationFn: () => deleteGoal(supabase, goalId),
    onSuccess: () => router.push("/goals"),
  });

  const goal = goalQuery.data;

  return (
    <div className="space-y-6 animate-fade-in">
      <Link href="/goals" className="focus-ring text-sm text-ink-soft">
        ← Goals
      </Link>

      {goal && (
        <>
          <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-faint">{goal.type === "long_term" ? "Long-term" : "Short-term"}</p>
              <h1 className="mt-1 font-display text-2xl text-ink">{goal.title}</h1>
              {goal.description ? <p className="mt-2 text-sm text-ink-soft">{goal.description}</p> : null}
              {goal.targetDate ? <p className="mt-2 text-xs text-ink-faint">Target {goal.targetDate}</p> : null}
            </div>
            <ProgressRing percent={progressQuery.data ?? 0} />
          </Card>

          <div className="flex gap-2">
            {goal.status !== "completed" && (
              <Button size="sm" variant="secondary" onClick={() => markComplete.mutate()} disabled={markComplete.isPending}>
                Mark complete
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (window.confirm("Delete this goal? This can't be undone.")) removeGoal.mutate();
              }}
              disabled={removeGoal.isPending}
            >
              Delete goal
            </Button>
          </div>

          <section>
            <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Milestones</p>
            <Card className="divide-y divide-border">
              {(milestonesQuery.data ?? []).length === 0 && <p className="py-2 text-sm text-ink-faint">No milestones yet.</p>}
              {(milestonesQuery.data ?? []).map((m) => {
                const nextStatus = MILESTONE_STATUS_CYCLE[(MILESTONE_STATUS_CYCLE.indexOf(m.status) + 1) % 3]!;
                return (
                  <div key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <button
                      type="button"
                      onClick={() => cycleMilestone.mutate({ id: m.id, status: nextStatus })}
                      className={`focus-ring rounded-full border px-3 py-1 text-xs ${
                        m.status === "completed" ? "border-accent bg-accent text-paper" : "border-border text-ink-soft"
                      }`}
                    >
                      {STATUS_LABEL[m.status]}
                    </button>
                    <p className={`flex-1 text-sm ${m.status === "completed" ? "text-ink-faint line-through" : "text-ink"}`}>{m.title}</p>
                    <button type="button" onClick={() => removeMilestone.mutate(m.id)} className="focus-ring text-xs text-ink-faint hover:text-red-500">
                      Remove
                    </button>
                  </div>
                );
              })}
              <form
                className="flex gap-2 pt-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newMilestone.trim()) addMilestone.mutate();
                }}
              >
                <input
                  value={newMilestone}
                  onChange={(e) => setNewMilestone(e.target.value)}
                  placeholder="Add a milestone…"
                  className="focus-ring h-10 flex-1 rounded-xl2 border border-border bg-paper-raised px-3 text-sm"
                />
                <Button type="submit" size="sm" disabled={addMilestone.isPending}>
                  Add
                </Button>
              </form>
            </Card>
          </section>

          {(childGoalsQuery.data ?? []).length > 0 && (
            <section>
              <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Sub-goals</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(childGoalsQuery.data ?? []).map((child) => (
                  <Link key={child.id} href={`/goals/${child.id}`} className="focus-ring block">
                    <Card>
                      <p className="text-sm text-ink">{child.title}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Tasks</p>
            <Card className="divide-y divide-border">
              {(tasksQuery.data ?? []).length === 0 && <p className="py-2 text-sm text-ink-faint">No tasks linked yet.</p>}
              {(tasksQuery.data ?? []).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <CheckCircle
                    checked={t.status === "completed"}
                    onToggle={() => toggleTask.mutate({ id: t.id, completed: t.status !== "completed" })}
                    label={t.title}
                  />
                  <p className={`text-sm ${t.status === "completed" ? "text-ink-faint line-through" : "text-ink"}`}>{t.title}</p>
                </div>
              ))}
              <form
                className="flex gap-2 pt-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newTask.trim()) addTask.mutate();
                }}
              >
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a task…"
                  className="focus-ring h-10 flex-1 rounded-xl2 border border-border bg-paper-raised px-3 text-sm"
                />
                <Button type="submit" size="sm" disabled={addTask.isPending}>
                  Add
                </Button>
              </form>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
