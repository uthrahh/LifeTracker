import { z } from "zod";

export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const goalTypeSchema = z.enum(["short_term", "long_term"]);

export const taskRecurrenceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("daily") }),
  z.object({ type: z.literal("weekly"), days: z.array(z.number().min(0).max(6)).min(1) }),
  z.object({ type: z.literal("monthly"), dayOfMonth: z.number().min(1).max(31) }),
]);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Give this a title").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().date().optional().nullable(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .nullable(),
  priority: taskPrioritySchema.default("medium"),
  categoryId: z.string().uuid().optional().nullable(),
  goalId: z.string().uuid().optional().nullable(),
  milestoneId: z.string().uuid().optional().nullable(),
  estimatedDurationMinutes: z.number().int().positive().max(24 * 60).optional().nullable(),
  recurrenceRule: taskRecurrenceSchema.optional().nullable(),
  reminderAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(5000).optional(),
});
export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
});

export const createGoalSchema = z.object({
  title: z.string().trim().min(1, "Give this a name").max(150),
  description: z.string().max(2000).optional(),
  parentGoalId: z.string().uuid().optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  type: goalTypeSchema,
  startDate: z.string().date().optional().nullable(),
  targetDate: z.string().date().optional().nullable(),
});
export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const createMilestoneSchema = z.object({
  goalId: z.string().uuid(),
  title: z.string().trim().min(1).max(150),
  description: z.string().max(2000).optional(),
  weight: z.number().positive().max(100).default(1),
  targetDate: z.string().date().optional().nullable(),
});
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;

export const habitFrequencySchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("daily") }),
  z.object({ type: z.literal("weekly_count"), timesPerWeek: z.number().int().min(1).max(7) }),
  z.object({ type: z.literal("specific_days"), days: z.array(z.number().min(0).max(6)).min(1) }),
]);

export const createHabitSchema = z.object({
  title: z.string().trim().min(1).max(150),
  categoryId: z.string().uuid().optional().nullable(),
  frequency: habitFrequencySchema,
  targetStreak: z.number().int().positive().optional().nullable(),
  startDate: z.string().date(),
  reminderAt: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .optional()
    .nullable(),
});
export type CreateHabitInput = z.infer<typeof createHabitSchema>;

export const createNoteSchema = z.object({
  title: z.string().trim().max(200).default(""),
  content: z.unknown(),
  color: z.string().max(20).optional().nullable(),
  tags: z.array(z.string().max(30)).max(20).default([]),
  isPinned: z.boolean().default(false),
  isLocked: z.boolean().default(false),
});
export type CreateNoteInput = z.infer<typeof createNoteSchema>;

export const createCalendarEventSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().max(2000).optional(),
  location: z.string().max(300).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  allDay: z.boolean().default(false),
  taskId: z.string().uuid().optional().nullable(),
  goalId: z.string().uuid().optional().nullable(),
});
export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;

export const dailyPlanSchema = z.object({
  planDate: z.string().date(),
  priorities: z.array(z.string().trim().min(1).max(200)).max(3, "Keep it to 3 priorities — that's the point"),
});
export type DailyPlanInput = z.infer<typeof dailyPlanSchema>;

export const userQuoteSchema = z.object({
  text: z.string().trim().min(1).max(280),
  author: z.string().trim().max(120).optional(),
});
export type UserQuoteInput = z.infer<typeof userQuoteSchema>;

/**
 * The parsed, still-editable result of natural-language quick add.
 * We never silently commit a low-confidence parse — the UI shows this
 * back to the user for confirmation before creating anything.
 */
export const quickAddParseResultSchema = z.object({
  rawInput: z.string(),
  title: z.string(),
  dueDate: z.string().date().nullable(),
  dueTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
    .nullable(),
  confidence: z.enum(["high", "low"]),
});
export type QuickAddParseResult = z.infer<typeof quickAddParseResultSchema>;

export const onboardingSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  focusAreas: z.array(z.string()).min(1).max(6),
  environmentScene: z.enum(["beach", "space", "rainforest", "city", "fields"]),
  firstGoalTitle: z.string().trim().min(1).max(150),
});
export type OnboardingInput = z.infer<typeof onboardingSchema>;
