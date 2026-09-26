import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Goal, Milestone } from "@luma/types";
import type { GoalProgressResult } from "@luma/utils";

export interface GoalWithProgress {
  goal: Goal;
  progress: GoalProgressResult;
  nextMilestone: Milestone | null;
}

export function GoalsInProgress({ goals }: { goals: GoalWithProgress[] }) {
  if (goals.length === 0) {
    return (
      <Card>
        <p className="font-display text-lg text-ink">Nothing you&apos;re working toward yet.</p>
        <p className="mt-1 text-sm text-ink-soft">Start with one thing that matters.</p>
        <Link href="/goals/new" className="focus-ring mt-3 inline-block text-sm font-medium text-accent">
          + Add a goal
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {goals.map(({ goal, progress, nextMilestone }) => (
        <Link key={goal.id} href={`/goals/${goal.id}`} className="focus-ring block">
          <Card className="h-full">
            <p className="text-xs uppercase tracking-wide text-ink-faint">{goal.type === "long_term" ? "Long-term" : "Short-term"}</p>
            <p className="mt-1 font-display text-lg text-ink">{goal.title}</p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-accent transition-all duration-700" style={{ width: `${progress.percent}%` }} />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              {progress.percent}% {nextMilestone ? `· Next: ${nextMilestone.title}` : null}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
