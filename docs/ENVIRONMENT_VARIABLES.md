# Environment Variables

Copy `.env.example` (repo root) to `apps/web/.env.local` and fill in what you need. Nothing here is committed — `.env*.local` is gitignored.

| Variable | Required | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase project → Settings → API → `anon` `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only | Supabase project → Settings → API → `service_role` key. **Never** prefix with `NEXT_PUBLIC_`, never ship to the client. Used only in Edge Functions / server routes (Stripe webhook, calendar sync). |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your deployed URL (`http://localhost:3000` locally) |
| `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` | Only for Calendar sync | Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web application). Add `https://<your-supabase-project>.supabase.co/auth/v1/callback` and `${NEXT_PUBLIC_SITE_URL}/auth/callback` as authorized redirect URIs, and enable the Google Calendar API. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Only for Web Push | Generate with `npx web-push generate-vapid-keys` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Only for billing | Stripe Dashboard → Developers → API keys / Webhooks |
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM_MONTHLY` | Only for billing | Stripe Dashboard → Product catalog |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional | Sentry project settings |

## What works with just the two required Supabase variables

Auth, tasks, goals, milestones, habits, notes, calendar (app-only, no Google sync), focus timer, home/saga map, onboarding. Everything else (Google Calendar sync, Web Push, Stripe billing) degrades gracefully — the corresponding settings section shows a "connect" prompt instead of erroring.
