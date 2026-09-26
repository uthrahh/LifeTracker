# Luma

> "One calm place for everything you're trying to improve." See [docs/PRODUCT.md](docs/PRODUCT.md) for the full spec.

A calm, low-friction life-management app: tasks, habits, goals, notes, calendar, and a focus timer in one coherent daily surface, wrapped in a time-of-day-aware illustrated environment.

## Status

**Live at https://web-rah22.vercel.app**, backed by a real Supabase project (schema + RLS applied, signup/auth verified end-to-end). The foundation (monorepo, database schema + RLS, auth, design system, home/saga-map/onboarding flow, five environment scenes) is implemented and deployed. Calendar sync, billing, push notifications, and the mobile app are designed (see `docs/`) but not yet built — each needs accounts/credentials only you can provide. See the docs listed below for exact status per area.

## Repo layout

```
apps/web/        Next.js 14 web app (this is what you run)
packages/        Shared TypeScript: types, validation (Zod), utils (progress/streaks/next-action), config
supabase/        Postgres schema (migrations), seed data
docs/            Product spec, architecture, and per-area status docs
```

## Getting started

```bash
npm install
cp .env.example apps/web/.env.local   # fill in your Supabase project's URL + anon key
npm run dev
```

Requires a Supabase project — see [docs/DATABASE.md](docs/DATABASE.md) to spin one up locally (via the Supabase CLI) or point at a hosted project, and [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md) for what each variable does.

## Scripts

- `npm run dev` — start the web app
- `npm run build` — production build
- `npm run lint` / `npm run typecheck` / `npm run test` — across all workspaces

## Documentation

- [docs/PRODUCT.md](docs/PRODUCT.md) — product spec and scope
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
- [docs/DATABASE.md](docs/DATABASE.md) — schema, RLS, migrations
- [docs/ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- [docs/SECURITY.md](docs/SECURITY.md)
- [docs/GOOGLE_CALENDAR.md](docs/GOOGLE_CALENDAR.md) · [docs/NOTIFICATIONS.md](docs/NOTIFICATIONS.md) · [docs/MOBILE_RELEASE.md](docs/MOBILE_RELEASE.md) — designed, not yet built
