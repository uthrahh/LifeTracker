import { describe, expect, it } from "vitest";
import { snakeToCamel, snakeToCamelArray } from "./caseTransform";

describe("snakeToCamel", () => {
  it("converts multi-word snake_case columns to camelCase", () => {
    const row = { id: "1", progress_override: 42, due_date: "2026-09-20", category_id: null };
    expect(snakeToCamel(row)).toEqual({ id: "1", progressOverride: 42, dueDate: "2026-09-20", categoryId: null });
  });

  it("leaves single-word and jsonb column values untouched", () => {
    const row = { title: "Test", frequency: { type: "weekly_count", timesPerWeek: 4 } };
    expect(snakeToCamel(row)).toEqual({ title: "Test", frequency: { type: "weekly_count", timesPerWeek: 4 } });
  });

  it("maps arrays of rows", () => {
    const rows = [{ user_id: "a" }, { user_id: "b" }];
    expect(snakeToCamelArray(rows)).toEqual([{ userId: "a" }, { userId: "b" }]);
  });
});
