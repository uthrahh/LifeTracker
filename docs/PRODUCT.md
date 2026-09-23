# Product Spec — Wayfare

> Working name: **Wayfare** (placeholder — trivial to rename; only appears in `apps/web/src/config/brand.ts` and marketing copy).

## Positioning

"One calm place for everything you're trying to improve." Wayfare merges tasks, habits, goals, calendar, notes, and a focus timer into a single low-friction daily surface, so the user spends energy *doing* rather than *planning*. No diagnostic/medical framing anywhere in the product — it's built for anyone whose plans outpace their execution, but it never says so.

## Product principle (the filter every feature must pass)

> "Does this reduce the amount of effort required to manage the user's life?"

If a feature adds maintenance burden without clear benefit: simplify it, automate it, hide it behind progressive disclosure, or cut it.

## Information architecture

```
GOALS ─▶ MILESTONES ─▶ HABITS ─▶ TASKS ─▶ DAILY ACTIONS ─▶ PROGRESS
```

Progress rolls *up* this chain automatically (weighted aggregation, user-overridable). The user only ever has to look *down* one level to know what to do next.

## Core modules (MVP scope, in build order)

Status tags: **live** = real, working, deployed. **partial** = live but narrower than the full spec below. **planned** = not built yet.

1. **Auth & Onboarding** — live. Email/password via Supabase Auth; 3-screen onboarding (name → focus areas → environment) ending in first goal creation.
2. **Home / Today** — live. Greeting, rotating quote, today's progress ring, Next Action, today's tasks/habits, in-progress goals, saga map entry point.
3. **Saga Map** — live. Horizontal date-node journey; only today is expanded; past/future are smaller nodes; clicking a date opens that day.
4. **Tasks** — partial. Create/complete from Home, Day, and Goal detail; no dedicated task-list page or natural-language quick add yet.
5. **Goals** — live. `/goals`, `/goals/new`, `/goals/[id]`: nested goals/milestones, weighted progress aggregation (via `fn_goal_progress`), category, short/long-term type. No AI goal-breakdown yet.
6. **Habits** — live. `/habits`: create, complete, archive, delete; streaks (non-punitive copy); flexible frequency (daily / times-per-week / specific days). Monthly consistency view not built yet (weekly is).
7. **Notes** — partial. `/notes`: create, edit, pin, search, delete — plain text for now (`content` is jsonb, ready for a real rich-text editor later without a migration). No checklists, tags UI, archive, or encrypted lock yet — see `docs/SECURITY.md` for why a fake lock wasn't shipped instead.
8. **Calendar** — partial. `/calendar`: month view, create/delete app-only events. No week/day/agenda views or Google sync yet — see `docs/GOOGLE_CALENDAR.md`.
9. **Focus Timer** — planned. Timestamp-derived (not `setInterval`-derived) Pomodoro, survives refresh/background/close.
10. **Notifications** — planned. In-app center + Web Push, quiet hours, per-category preferences.
11. **Productivity Guide** — planned (content seeded in the database already — `productivity_guides` table — just no UI reads it yet). Short actionable in-app modules, contextual nudges.
12. **Environments** — live. 5 illustrated, time-of-day-aware scenes (Beach, Space, Rainforest, City, Fields) rendered behind the UI.
13. **Settings/Profile/Admin/Billing** — planned. Stripe-backed Free/Premium, feature flags, data export/delete.

## Non-negotiable UX rules

- Never punitive copy ("FAILED", "YOU MISSED", streak-shaming). Use "Continue today," "Pick up where you left off."
- Never silently mutate consequential user data (deleting tasks, changing goals/deadlines, rescheduling events) — always confirm.
- Home screen shows progressive disclosure, not a dashboard dump: Environment → Greeting → Quote → Today's Progress → Next Action → Today's Tasks → Habits → Goals in progress → Saga Map.
- 5-second rule: a new user must understand any given screen in 5 seconds, and complete the primary action in 1–2 interactions.

## Out of MVP (explicitly deferred, tracked but not blocking)

- Native mobile app (Expo) — package boundaries (`packages/types`, `packages/validation`, `packages/utils`) are being built so mobile can reuse them later without a rewrite.
- Google Calendar live sync, Stripe live billing, Web Push delivery — code paths and schema are built, but require the user's own API credentials (Google Cloud OAuth client, Stripe account, VAPID keys) to activate; see `docs/ENVIRONMENT_VARIABLES.md`.
- App Store / Play Store submission — requires the user's Apple/Google developer accounts.

## Business model

Free tier: full core loop (tasks/habits/goals/notes/calendar/timer) with reasonable limits. Premium (Stripe subscription): all 5 environments (free tier gets 1), AI features, advanced calendar sync, unlimited notes, advanced insights. Gated via a feature-flag table (`subscriptions` + `feature_flags`), not hardcoded checks, so pricing can change without redeploying.
