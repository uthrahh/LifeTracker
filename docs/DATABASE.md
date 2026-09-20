# Database

Schema lives in `supabase/migrations/0001_init.sql`; dev/staging seed data in `supabase/seed/seed.sql`. See `docs/ARCHITECTURE.md` for the entity overview.

## Local development

```bash
npm install -g supabase   # if you don't have the CLI
supabase init             # only if supabase/ wasn't already set up (it is, in this repo)
supabase start             # spins up local Postgres + Auth + Studio via Docker
supabase db push           # applies supabase/migrations/*.sql
psql "$(supabase status -o json | jq -r .DB_URL)" -f supabase/seed/seed.sql
```

Studio runs at http://localhost:54323. Point `apps/web/.env.local` at the local values printed by `supabase status`.

## Applying to a real Supabase project

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

Then run `supabase/seed/seed.sql` once against that project (dev/staging only — never seed fake data into production).

## Row Level Security

Every table is `alter table ... enable row level security` with an owner policy (`user_id = auth.uid()`), except:
- `categories`, `quotes`, `productivity_guides`, `feature_flags` — readable by everyone, writable only by the owning user (categories) or not writable by clients at all (the rest are admin-managed).
- `subscriptions`, `audit_events` — client can `select` its own rows only; all writes go through server-side code using the service-role key (Stripe webhook, account-deletion flow), so a compromised client session can never grant itself Premium or forge an audit trail.

## Progress aggregation

`fn_goal_progress(goal_id)` in the migration mirrors `packages/utils/src/progress.ts` exactly — same override-first, weighted-average-of-milestones-and-child-goals logic. If you change one, change the other and add a regression test in `packages/utils/src/progress.test.ts`.
