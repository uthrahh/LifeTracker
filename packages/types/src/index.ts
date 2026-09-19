// Shared domain types, mirrored 1:1 with supabase/migrations/0001_init.sql.
// Keep this file and the migration in sync by hand until we wire up
// `supabase gen types typescript` in CI.

export type UUID = string;
export type ISODate = string; // YYYY-MM-DD
export type ISODateTime = string; // full timestamptz

export type GoalType = "short_term" | "long_term";
export type GoalStatus = "active" | "completed" | "archived";
export type MilestoneStatus = "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "pending" | "completed" | "cancelled";
export type HabitStatus = "active" | "archived";
export type NoteLinkType = "goal" | "task" | "habit" | "event" | "date";
export type CalendarEventSource = "app" | "google";
export type FocusSessionType = "focus" | "short_break" | "long_break";
export type FocusSessionStatus = "running" | "paused" | "completed" | "cancelled";
export type SubscriptionPlan = "free" | "premium";
export type EnvironmentScene = "beach" | "space" | "rainforest" | "city" | "fields";
export type EnvironmentTimeMode = "auto" | "always_day" | "always_night";
export type NotificationType =
  | "task_reminder"
  | "habit_reminder"
  | "goal_reminder"
  | "calendar_reminder"
  | "focus_complete"
  | "system";

export interface Profile {
  id: UUID;
  fullName: string | null;
  avatarUrl: string | null;
  timezone: string;
  createdAt: ISODateTime;
}

export interface Category {
  id: UUID;
  userId: UUID | null; // null = built-in default category
  name: string;
  color: string;
  isDefault: boolean;
}

export interface Goal {
  id: UUID;
  userId: UUID;
  parentGoalId: UUID | null;
  title: string;
  description: string | null;
  categoryId: UUID | null;
  type: GoalType;
  startDate: ISODate | null;
  targetDate: ISODate | null;
  progressOverride: number | null; // 0-100, wins over computed aggregate when set
  status: GoalStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface Milestone {
  id: UUID;
  userId: UUID;
  goalId: UUID;
  title: string;
  description: string | null;
  weight: number; // relative weight within the parent goal's aggregation
  status: MilestoneStatus;
  targetDate: ISODate | null;
  sortOrder: number;
  createdAt: ISODateTime;
}

export type TaskRecurrenceRule =
  | { type: "daily" }
  | { type: "weekly"; days: number[] } // 0=Sunday
  | { type: "monthly"; dayOfMonth: number };

export interface Task {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  dueDate: ISODate | null;
  dueTime: string | null; // HH:mm
  priority: TaskPriority;
  categoryId: UUID | null;
  goalId: UUID | null;
  milestoneId: UUID | null;
  estimatedDurationMinutes: number | null;
  status: TaskStatus;
  completedAt: ISODateTime | null;
  recurrenceRule: TaskRecurrenceRule | null;
  parentTaskId: UUID | null; // set on generated recurring instances
  reminderAt: ISODateTime | null;
  notes: string | null;
  sortOrder: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export type HabitFrequency =
  | { type: "daily" }
  | { type: "weekly_count"; timesPerWeek: number }
  | { type: "specific_days"; days: number[] };

export interface Habit {
  id: UUID;
  userId: UUID;
  title: string;
  categoryId: UUID | null;
  frequency: HabitFrequency;
  targetStreak: number | null;
  startDate: ISODate;
  reminderAt: string | null; // HH:mm local
  status: HabitStatus;
  createdAt: ISODateTime;
}

export interface HabitCompletion {
  id: UUID;
  habitId: UUID;
  userId: UUID;
  completedDate: ISODate;
  createdAt: ISODateTime;
}

export interface Note {
  id: UUID;
  userId: UUID;
  title: string;
  content: unknown; // rich-text document (Tiptap JSON)
  color: string | null;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isLocked: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface NoteLink {
  id: UUID;
  noteId: UUID;
  linkedType: NoteLinkType;
  linkedId: UUID | null;
  linkedDate: ISODate | null;
}

export interface CalendarEvent {
  id: UUID;
  userId: UUID;
  title: string;
  description: string | null;
  location: string | null;
  startAt: ISODateTime;
  endAt: ISODateTime;
  allDay: boolean;
  source: CalendarEventSource;
  googleEventId: string | null;
  googleEtag: string | null;
  calendarIntegrationId: UUID | null;
  taskId: UUID | null;
  goalId: UUID | null;
  status: "confirmed" | "cancelled";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FocusSession {
  id: UUID;
  userId: UUID;
  sessionType: FocusSessionType;
  startedAt: ISODateTime;
  expectedEndAt: ISODateTime;
  endedAt: ISODateTime | null;
  pausedAt: ISODateTime | null;
  accumulatedPauseSeconds: number;
  status: FocusSessionStatus;
  taskId: UUID | null;
  goalId: UUID | null;
  sessionNumber: number;
  createdAt: ISODateTime;
}

export interface DailyPlan {
  id: UUID;
  userId: UUID;
  planDate: ISODate;
  priorities: string[]; // free text or task ids, max 3 enforced client-side
  createdAt: ISODateTime;
}

export interface Notification {
  id: UUID;
  userId: UUID;
  type: NotificationType;
  title: string;
  body: string;
  relatedType: string | null;
  relatedId: UUID | null;
  isRead: boolean;
  createdAt: ISODateTime;
}

export interface UserSettings {
  userId: UUID;
  theme: "light" | "dark" | "system";
  reducedMotion: boolean;
  quietHoursStart: string | null; // HH:mm
  quietHoursEnd: string | null;
  quoteFrequency: "every_open" | "daily" | "never";
  showQuotesOnHome: boolean;
}

export interface EnvironmentPreferences {
  userId: UUID;
  scene: EnvironmentScene;
  timeMode: EnvironmentTimeMode;
}

export interface Subscription {
  id: UUID;
  userId: UUID;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  plan: SubscriptionPlan;
  status: "active" | "trialing" | "past_due" | "canceled" | "none";
  currentPeriodEnd: ISODateTime | null;
}

/** A goal card's progress, always computed the same way on client and server. */
export interface GoalProgress {
  goalId: UUID;
  percent: number; // 0-100
  isManualOverride: boolean;
  nextAction: { type: "milestone" | "task" | "habit"; id: UUID; title: string } | null;
}
