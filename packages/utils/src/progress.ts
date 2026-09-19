import type { MilestoneStatus } from "@wayfare/types";

const MILESTONE_STATUS_PERCENT: Record<MilestoneStatus, number> = {
  pending: 0,
  in_progress: 50,
  completed: 100,
};

export interface WeightedChildGoal {
  id: string;
  weight: number;
  /** Percent for this child goal, already computed by recursing on this same function bottom-up. */
  percent: number;
}

export interface WeightedMilestone {
  id: string;
  weight: number;
  status: MilestoneStatus;
  /** If the milestone has linked tasks, pass their completion ratio (0-1) to override the status-based percent. */
  taskCompletionRatio: number | null;
}

export interface GoalProgressInput {
  /** Manual override always wins when present (0-100). */
  progressOverride: number | null;
  childGoals: WeightedChildGoal[];
  milestones: WeightedMilestone[];
  /** Completion ratio (0-1) of tasks linked directly to the goal (no milestone). Only used when there are no children/milestones. */
  directTaskCompletionRatio: number | null;
}

export interface GoalProgressResult {
  percent: number;
  isManualOverride: boolean;
}

function milestonePercent(m: WeightedMilestone): number {
  if (m.taskCompletionRatio !== null) return Math.round(m.taskCompletionRatio * 100);
  return MILESTONE_STATUS_PERCENT[m.status];
}

/**
 * Weighted-average progress aggregation. Pure and deterministic so the client
 * and the mirrored Postgres function (`fn_goal_progress`) can never disagree
 * on what a given input state should render as.
 */
export function computeGoalProgress(input: GoalProgressInput): GoalProgressResult {
  if (input.progressOverride !== null) {
    return { percent: clamp(input.progressOverride), isManualOverride: true };
  }

  const weighted: Array<{ weight: number; percent: number }> = [
    ...input.childGoals.map((g) => ({ weight: g.weight, percent: g.percent })),
    ...input.milestones.map((m) => ({ weight: m.weight, percent: milestonePercent(m) })),
  ];

  if (weighted.length > 0) {
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight === 0) return { percent: 0, isManualOverride: false };
    const percent = weighted.reduce((sum, w) => sum + w.weight * w.percent, 0) / totalWeight;
    return { percent: clamp(Math.round(percent)), isManualOverride: false };
  }

  if (input.directTaskCompletionRatio !== null) {
    return { percent: clamp(Math.round(input.directTaskCompletionRatio * 100)), isManualOverride: false };
  }

  return { percent: 0, isManualOverride: false };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}
