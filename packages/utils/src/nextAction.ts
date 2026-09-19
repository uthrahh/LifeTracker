import type { TaskPriority } from "@wayfare/types";

export interface NextActionCandidate {
  id: string;
  kind: "task" | "habit";
  title: string;
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:mm
  priority: TaskPriority | null;
  estimatedDurationMinutes: number | null;
  linkedToActiveGoal: boolean;
}

export interface RankedNextAction {
  candidate: NextActionCandidate;
  score: number;
  /** Plain-language reasons, shown in the UI so ranking is never a black box. */
  reasons: string[];
}

const PRIORITY_SCORE: Record<TaskPriority, number> = { high: 20, medium: 10, low: 0 };

/**
 * Deliberately simple, fully explainable ranking — every point added is
 * paired with a human-readable reason. No ML, no hidden weights.
 */
export function rankNextActions(
  candidates: NextActionCandidate[],
  now: Date,
  todayLocal: string,
): RankedNextAction[] {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const ranked = candidates.map((candidate) => {
    let score = 0;
    const reasons: string[] = [];

    if (candidate.dueDate && candidate.dueDate < todayLocal) {
      score += 100;
      reasons.push("Overdue");
    } else if (candidate.dueDate === todayLocal) {
      score += 50;
      reasons.push("Due today");
    }

    if (candidate.dueTime) {
      const [h, m] = candidate.dueTime.split(":").map(Number);
      const dueMinutes = (h ?? 0) * 60 + (m ?? 0);
      const delta = dueMinutes - nowMinutes;
      if (delta >= 0 && delta <= 120) {
        score += 30;
        reasons.push("Coming up soon");
      }
    }

    if (candidate.priority) {
      const p = PRIORITY_SCORE[candidate.priority];
      if (p > 0) {
        score += p;
        reasons.push(`${candidate.priority} priority`);
      }
    }

    if (candidate.linkedToActiveGoal) {
      score += 10;
      reasons.push("Moves a goal forward");
    }

    if (candidate.estimatedDurationMinutes !== null && candidate.estimatedDurationMinutes <= 15) {
      score += 5;
      reasons.push("Quick win");
    }

    if (reasons.length === 0) reasons.push("On your list for today");

    return { candidate, score, reasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
