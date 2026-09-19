import { describe, expect, it } from "vitest";
import { computeHabitStreak } from "./streaks";

describe("computeHabitStreak — daily habit", () => {
  it("counts a current streak that includes today when today is done", () => {
    const result = computeHabitStreak(
      { type: "daily" },
      ["2026-09-17", "2026-09-18", "2026-09-19"],
      "2026-09-19",
    );
    expect(result.currentStreak).toBe(3);
  });

  it("does not zero out the streak just because today isn't done yet", () => {
    const result = computeHabitStreak(
      { type: "daily" },
      ["2026-09-17", "2026-09-18"],
      "2026-09-19",
    );
    expect(result.currentStreak).toBe(2);
  });

  it("resets to 0 after a genuine gap", () => {
    const result = computeHabitStreak(
      { type: "daily" },
      ["2026-09-10", "2026-09-17"],
      "2026-09-19",
    );
    expect(result.currentStreak).toBe(0);
  });
});

describe("computeHabitStreak — weekly_count habit (e.g. exercise 4x/week)", () => {
  it("counts a week as a streak only once the target count is met", () => {
    // Week of Mon 2026-09-14..Sun 2026-09-20: 4 completions -> meets target of 4
    const result = computeHabitStreak(
      { type: "weekly_count", timesPerWeek: 4 },
      ["2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17"],
      "2026-09-19",
    );
    // current in-progress week isn't counted as a completed streak week yet
    expect(result.currentStreak).toBe(0);
    expect(result.weeklyConsistencyPercent).toBe(100);
  });
});

describe("computeHabitStreak — specific_days habit", () => {
  it("only requires completion on scheduled weekdays", () => {
    // Mon/Wed/Fri schedule (1, 3, 5); 2026-09-19 is a Saturday
    const result = computeHabitStreak(
      { type: "specific_days", days: [1, 3, 5] },
      ["2026-09-14", "2026-09-16", "2026-09-18"], // Mon, Wed, Fri of that week
      "2026-09-19",
    );
    expect(result.currentStreak).toBe(3);
  });
});
