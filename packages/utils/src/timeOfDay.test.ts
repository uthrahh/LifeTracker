import { describe, expect, it } from "vitest";
import { getTimeOfDay, getLocalDateString } from "./timeOfDay";

describe("getTimeOfDay", () => {
  it("derives time of day from the given IANA timezone, not the server clock", () => {
    // 2026-09-19T06:30:00Z is 12:00 local in Asia/Kolkata (UTC+5:30) -> afternoon
    const date = new Date("2026-09-19T06:30:00Z");
    expect(getTimeOfDay(date, "Asia/Kolkata")).toBe("afternoon");
    // Same instant is 23:30 local in America/Los_Angeles the prior day (UTC-7 in Sept, DST) -> night
    expect(getTimeOfDay(date, "America/Los_Angeles")).toBe("night");
  });

  it("buckets dawn/morning/evening correctly", () => {
    expect(getTimeOfDay(new Date("2026-09-19T05:30:00Z"), "UTC")).toBe("dawn");
    expect(getTimeOfDay(new Date("2026-09-19T09:00:00Z"), "UTC")).toBe("morning");
    expect(getTimeOfDay(new Date("2026-09-19T18:00:00Z"), "UTC")).toBe("evening");
  });
});

describe("getLocalDateString", () => {
  it("formats as YYYY-MM-DD in the target timezone", () => {
    expect(getLocalDateString(new Date("2026-09-19T23:30:00Z"), "UTC")).toBe("2026-09-19");
  });
});
