"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchGoals, fetchGoalProgress } from "@/lib/queries/goals";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Goal } from "@wayfare/types";

export function GoalsListClient({ userId }: { userId: string }) {
  const supabase = createClient();

  const { data: goals, isLoading } = useQuery({
    queryKey: ["all_goals", userId],
    queryFn: () => fetchGoals(supabase, userId),
  });

  const { data: progressByGoal } = useQuery({
    queryKey: ["all_goals_progress", userId, (goals ?? []).map((g) => g.id)],
    queryFn: async () => {
      const entries = await Promise.all((goals ?? []).map(async (g) => [g.id, await fetchGoalProgress(supabase, g.id)] as const));
      return Object.fromEntries(entries) as Record<string, number>;
    },
    enabled: !!goals && goals.length > 0,
  });

  const shortTerm = (goals ?? []).filter((g) => g.type === "short_term");
  const longTerm = (goals ?? []).filter((g) => g.type === "long_term");

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-ink">Goals</h1>
        <Link href="/goals/new">
          <Button size="sm">+ New goal</Button>
        </Link>
      </header>

      {!isLoading && (goals ?? []).length === 0 && (
        <Card>
          <p className="font-display text-lg text-ink">Nothing you&apos;re working toward yet.</p>
          <p className="mt-1 text-sm text-ink-soft">Start with one thing that matters.</p>
          <Link href="/goals/new" className="focus-ring mt-3 inline-block text-sm font-medium text-accent">
            + Add a goal
          </Link>
        </Card>
      )}

      {longTerm.length > 0 && (
        <section>
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Long-term</p>
          <GoalGrid goals={longTerm} progress={progressByGoal} />
        </section>
      )}

      {shortTerm.length > 0 && (
        <section>
          <p className="mb-3 text-xs uppercase tracking-wide text-ink-faint">Short-term</p>
          <GoalGrid goals={shortTerm} progress={progressByGoal} />
        </section>
      )}
    </div>
  );
}

function GoalGrid({ goals, progress }: { goals: Goal[]; progress: Record<string, number> | undefined }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {goals.map((goal) => {
        const percent = progress?.[goal.id] ?? 0;
        return (
          <Link key={goal.id} href={`/goals/${goal.id}`} className="focus-ring block">
            <Card className="h-full">
              <p className="font-display text-lg text-ink">{goal.title}</p>
              {goal.targetDate ? <p className="mt-1 text-xs text-ink-faint">Target {goal.targetDate}</p> : null}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
                <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink-faint">{percent}%</p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
