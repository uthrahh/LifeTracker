# Deployment

**Status: live.**

- Web app: https://web-rah22.vercel.app (Vercel project `rah22/web`)
- Database/Auth: Supabase project `LifeTracker` (ref `urequortpjryilczhnbu`)
- Migrations applied: `0001_init.sql`, `0002_reference_data.sql`
- Verified end-to-end: signup creates an auth user, the `handle_new_user` trigger populates `profiles`/`user_settings`/`environment_preferences`/`subscriptions`, RLS blocks unauthenticated reads, and a full signup → onboarding → sign out → sign back in loop returns the same remembered data (tested via a real browser click-through, not just API calls).
- Auth is autoconfirm (no email-verification step) — see `docs/ARCHITECTURE.md#authentication--authorization` for why.
- Not yet configured: Google Calendar sync (needs a Google Cloud OAuth client), Stripe, Web Push. See `docs/ENVIRONMENT_VARIABLES.md`. Sign-in is email/password only — no social login.

This section below is kept as the reference procedure for redeploying, adding a custom domain, or standing up staging.

## 1. Supabase (database, auth, storage, edge functions)

1. Create a project at supabase.com (pick a region close to your users).
2. `supabase link --project-ref <ref>` then `supabase db push` to apply `supabase/migrations/`.
3. In Authentication → Providers, confirm Email is enabled (it is by default).
4. In Authentication → URL Configuration, set the Site URL to your production domain and add `/auth/callback` as a redirect URL.
5. Copy the Project URL, anon key, and service role key into your deployment environment's variables (never into a committed file).

## 2. Vercel (web app)

1. Import the repo, set the root directory to `apps/web`.
2. Framework preset: Next.js. Build command: `npm run build --workspace=apps/web` (or let Vercel's monorepo detection handle it — it reads `apps/web/package.json`).
3. Add the environment variables from `docs/ENVIRONMENT_VARIABLES.md` for Production and Preview.
4. Deploy. Vercel gives you the production URL — set that as `NEXT_PUBLIC_SITE_URL` and update the Supabase redirect URL to match.

## 3. Staging first

Create a second Supabase project and a second Vercel environment (or a Preview deployment pinned to a `staging` branch) before touching production. Verify auth, task/goal/habit CRUD, the focus timer, and (if configured) Google Calendar sync and Stripe checkout end-to-end on staging.

## 4. Environments to keep separate

Never point a Preview/staging deployment at the production Supabase project, and never use production Stripe keys outside the production Vercel environment. Use Stripe test mode for staging.

## Mobile (Expo) — not yet scaffolded

`apps/mobile` doesn't exist yet (see `docs/PRODUCT.md` → Out of MVP). When it's built, release builds go through `eas build` / `eas submit`, which requires your own Apple Developer and Google Play Console accounts.
