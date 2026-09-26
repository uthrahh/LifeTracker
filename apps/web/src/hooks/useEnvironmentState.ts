"use client";

import { useEffect, useState } from "react";
import { getTimeOfDay, type TimeOfDay } from "@luma/utils";
import type { EnvironmentScene, EnvironmentTimeMode } from "@luma/types";
import type { EnvironmentState } from "@/components/environment/types";

export interface UseEnvironmentStateOptions {
  scene: EnvironmentScene;
  timeMode: EnvironmentTimeMode;
}

function resolveTimeOfDay(timeMode: EnvironmentTimeMode, timezone: string): TimeOfDay {
  if (timeMode === "always_day") return "afternoon";
  if (timeMode === "always_night") return "night";
  return getTimeOfDay(new Date(), timezone);
}

/**
 * Derives the environment's render state from the user's local timezone —
 * never a hard-coded region — re-evaluated every minute so a session left
 * open overnight drifts through dusk into night on its own.
 */
export function useEnvironmentState({ scene, timeMode }: UseEnvironmentStateOptions): EnvironmentState {
  const timezone = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() => resolveTimeOfDay(timeMode, timezone));
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const tick = () => setTimeOfDay(resolveTimeOfDay(timeMode, timezone));
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [timeMode, timezone]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Weather is derived server-side per scene in a later phase (real conditions
  // for Rainforest rain, etc.); for now it follows a calm time-of-day default.
  const rainIntensity = scene === "rainforest" && (timeOfDay === "afternoon" || timeOfDay === "night") ? 0.4 : 0;

  return {
    scene,
    timeOfDay,
    weather: { rainIntensity, cloudCover: 0.3 },
    reducedMotion,
  };
}
