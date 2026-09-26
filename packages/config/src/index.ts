import type { EnvironmentScene } from "@luma/types";

export const DEFAULT_CATEGORIES = [
  { name: "Self-care", color: "#E8A87C" },
  { name: "Fitness", color: "#6FCF97" },
  { name: "Academics", color: "#6FA8DC" },
  { name: "Career", color: "#9B8CD8" },
] as const;

export const ONBOARDING_FOCUS_AREAS = [
  "Career",
  "Health",
  "Fitness",
  "Academics",
  "Relationships",
  "Finances",
  "Personal growth",
  "Other",
] as const;

export interface EnvironmentDefinition {
  scene: EnvironmentScene;
  label: string;
  description: string;
}

export const ENVIRONMENTS: EnvironmentDefinition[] = [
  { scene: "beach", label: "Beach", description: "Tides, sunrise to starlight" },
  { scene: "space", label: "Space", description: "Slow orbits, distant galaxies" },
  { scene: "rainforest", label: "Rainforest", description: "Layered canopy, gentle rain" },
  { scene: "city", label: "City", description: "A skyline that never rushes" },
  { scene: "fields", label: "Fields", description: "Wind through flowers and hills" },
];

export const DEFAULT_QUOTES: Array<{ text: string; author: string | null }> = [
  { text: "If you show up everyday, the results don't have a choice.", author: null },
  { text: "The future starts today, not tomorrow.", author: null },
  { text: "You become what you believe.", author: null },
  { text: "Seize the day.", author: null },
];

export type PlanKey = "free" | "premium";

export interface FeatureFlagDefinition {
  key: string;
  label: string;
  plan: PlanKey; // minimum plan required
}

/** Central source of truth for what's gated — never hardcode a plan check inline. */
export const FEATURE_FLAGS: FeatureFlagDefinition[] = [
  { key: "environments.all", label: "All 5 environments", plan: "premium" },
  { key: "ai.goal_breakdown", label: "AI goal breakdown", plan: "premium" },
  { key: "calendar.advanced_sync", label: "Advanced calendar sync", plan: "premium" },
  { key: "notes.unlimited", label: "Unlimited notes", plan: "premium" },
  { key: "insights.advanced", label: "Advanced goal insights", plan: "premium" },
];

export const FREE_PLAN_NOTE_LIMIT = 50;
export const FREE_PLAN_ENVIRONMENT: EnvironmentScene = "fields";

export const PRODUCTIVITY_GUIDE_SLUGS = [
  "breaking-down-a-large-goal",
  "choosing-todays-priorities",
  "recovering-after-missing-days",
  "avoiding-overplanning",
  "estimating-task-duration",
  "building-sustainable-habits",
  "reducing-task-friction",
  "planning-tomorrow-in-two-minutes",
  "handling-an-overwhelming-list",
  "using-the-focus-timer",
  "reviewing-your-week",
] as const;
