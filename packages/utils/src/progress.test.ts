import { describe, expect, it } from "vitest";
import { computeGoalProgress } from "./progress";

describe("computeGoalProgress", () => {
  it("uses a manual override when present, ignoring children", () => {
    const result = computeGoalProgress({
      progressOverride: 42,
      childGoals: [{ id: "a", weight: 1, percent: 0 }],
      milestones: [],
      directTaskCompletionRatio: null,
    });
    expect(result).toEqual({ percent: 42, isManualOverride: true });
  });

  it("weight-averages child goals and milestones matching the internship example", () => {
    // Resume 100%, Portfolio 90%, DSA 60%, Applications 70% -> 80% overall
    const result = computeGoalProgress({
      progressOverride: null,
      childGoals: [
        { id: "resume", weight: 1, percent: 100 },
        { id: "portfolio", weight: 1, percent: 90 },
        { id: "dsa", weight: 1, percent: 60 },
        { id: "applications", weight: 1, percent: 70 },
      ],
      milestones: [],
      directTaskCompletionRatio: null,
    });
    expect(result.percent).toBe(80);
    expect(result.isManualOverride).toBe(false);
  });

  it("derives milestone percent from linked task completion ratio when available", () => {
    const result = computeGoalProgress({
      progressOverride: null,
      childGoals: [],
      milestones: [{ id: "m1", weight: 1, status: "in_progress", taskCompletionRatio: 0.75 }],
      directTaskCompletionRatio: null,
    });
    expect(result.percent).toBe(75);
  });

  it("falls back to status-based milestone percent without linked tasks", () => {
    const result = computeGoalProgress({
      progressOverride: null,
      childGoals: [],
      milestones: [{ id: "m1", weight: 1, status: "completed", taskCompletionRatio: null }],
      directTaskCompletionRatio: null,
    });
    expect(result.percent).toBe(100);
  });

  it("falls back to direct task ratio for leaf goals with no milestones", () => {
    const result = computeGoalProgress({
      progressOverride: null,
      childGoals: [],
      milestones: [],
      directTaskCompletionRatio: 0.5,
    });
    expect(result.percent).toBe(50);
  });

  it("returns 0 for a brand new goal with nothing linked", () => {
    const result = computeGoalProgress({
      progressOverride: null,
      childGoals: [],
      milestones: [],
      directTaskCompletionRatio: null,
    });
    expect(result.percent).toBe(0);
  });
});
