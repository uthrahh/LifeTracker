# Architecture

## Monorepo layout

```
apps/
  web/                Next.js 14 (App Router, TS) — the production web app + marketing site
  mobile/              (Phase 7, not yet scaffolded) Expo/React Native

packages/
  types/               Shared TypeScript types (DB row types, DTOs) generated + hand-authored
  validation/           Zod schemas shared by web forms, API routes, and (later) mobile
  utils/               Pure functions: date/timezone math, progress aggregation, streak calculation
  config/              Shared constants: categories, environment definitions, plan/feature-flag defs
  ui/                  (added when mobile lands) cross-platform design tokens; web owns its own components for now

supabase/
  migrations/          SQL migrations, timestamp-ordered, applied via Supabase CLI
  seed/                Default quotes, categories, productivity guides — dev/staging only

docs/                  This documentation set
.github/workflows/     CI (lint, typecheck, test, build)
```

We use **npm workspaces** (not pnpm/turborepo) to keep the toolchain to what's already on this machine. Revisit turborepo once `apps/mobile` exists and build graphs get expensive.

## Web stack

- **Next.js 14** App Router, TypeScript strict mode, React Server Components where they reduce client JS.
- **Tailwind CSS** with a token layer (`apps/web/src/styles/tokens.css`) — no arbitrary hex values in components.
- **Supabase** for Postgres, Auth, Row Level Security, Realtime (habit/task sync across tabs), Storage (note attachments), Edge Functions (calendar sync worker, notification dispatch).
- **TanStack Query** for server-state (tasks, goals, habits, notes) with optimistic updates; **Zustand** only for pure client/UI state (timer session, active environment, command palette).
- **React Hook Form + Zod** for all forms; the same Zod schemas live in `packages/validation` so API routes validate with the identical rules.
- **Framer Motion** for the saga map and environment micro-interactions, gated behind `prefers-reduced-motion`.

## Authentication & authorization

- Supabase Auth (email/password). Supabase issues the session; the Next.js app reads it via `@supabase/ssr` cookies, never via a client-only token in localStorage.
- **Every table has Row Level Security enabled.** Policy pattern: `user_id = auth.uid()` on the owning table, and a join-based policy for child tables (e.g. `habit_completions` checks the parent `habits.user_id`). No API route trusts a client-supplied `user_id` — it's always read from the verified session on the server.
- Service-role key is used only inside Edge Functions / server-only routes (calendar sync, Stripe webhooks) and is never bundled into client code.

## Database model (initial migration — see `supabase/migrations`)

Core entities, normalized, with the hierarchy Goals → Milestones → Tasks/Habits expressed as real foreign keys rather than a generic "items" table so RLS and progress aggregation stay simple:

`profiles`, `user_settings`, `environment_preferences`, `categories`, `goals` (self-referential `parent_goal_id` for nested goals), `milestones`, `tasks`, `task_recurrences`, `habits`, `habit_completions`, `notes`, `note_links` (polymorphic link to goal/task/habit/event/date), `calendar_events`, `calendar_integrations` (Google tokens, encrypted at rest via Supabase Vault), `focus_sessions`, `daily_plans`, `quotes`, `user_quotes`, `productivity_guides`, `notifications`, `notification_preferences`, `subscriptions`, `feature_flags`, `audit_events`.

### Progress aggregation

Defined once in `packages/utils/src/progress.ts` (pure function, unit-tested) and mirrored as a Postgres function (`fn_goal_progress`) so the API and any direct SQL report the same number. Weighting: explicit `weight` column on `goal_relationships`/`milestones` (default equal split), manual override via `progress_override` on `goals` — if set, it wins and the UI marks it as manually set.

## Focus timer correctness

The timer never trusts a running JS interval as the source of truth. `focus_sessions` row stores `started_at`, `expected_end_at`, `session_type`, `paused_at`/`accumulated_pause_seconds`. The client computes remaining time as `expected_end_at - now() - accumulated_pause_seconds` on every render/visibility-change/focus event, and reconciles against the row on mount. Session completion is detected by a client tick *and* confirmed server-side (a scheduled Edge Function sweep) so a closed tab still produces a completion notification.

## Calendar sync

Google Calendar OAuth via Supabase's third-party auth token storage (`calendar_integrations`). Sync runs as a Supabase Edge Function on a schedule (`pg_cron` trigger) plus on-demand after local writes. Conflict rule: last-write-wins by `updated_at`, but a deletion on either side is applied, never resurrected — deletions always win over a stale update. Idempotency: every synced event stores its Google `event_id` + `etag`; the function upserts on that key to prevent duplicates.

## Notifications

In-app notification center backed by the `notifications` table (Realtime subscription for live updates). Web Push via VAPID keys (`web-push` library from an Edge Function). Mobile push deferred to Phase 7 (Expo Notifications). Quiet hours and per-category toggles live in `notification_preferences` and are enforced server-side before any send, not just hidden in the UI.

## Environment rendering engine

`EnvironmentRenderer` is a pure presentational component driven entirely by state, never by hard-coded per-scene logic in the page:

```
EnvironmentState = { scene: Beach | Space | Rainforest | City | Fields,
                      timeOfDay: TimeOfDay,   // derived from local tz, not hard-coded
                      weather: WeatherState,  // scene-specific subset
                      reducedMotion: boolean }
```

Each scene is an SVG/CSS layer set (no WebGL/3D — keeps this fast on low-end mobile browsers) driven by `timeOfDay` for palette/lighting and `weather` for particle layers (rain, clouds). `reducedMotion` swaps looping animations for a single static frame per layer.

## Deployment targets (see `docs/DEPLOYMENT.md`)

Web → Vercel. DB/Auth/Storage/Edge Functions → Supabase. Both need project creation and secrets that only the account owner can provide — this repo is structured so `vercel --prod` and `supabase db push` are the only commands needed once secrets are in place.
