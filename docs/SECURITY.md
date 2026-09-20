# Security

## Authentication & session handling

Supabase Auth issues the session; `apps/web/src/middleware.ts` refreshes it on every request and redirects unauthenticated users away from any route not in its `PUBLIC_PATHS` allowlist. Server components read the user via `createClient()` (`apps/web/src/lib/supabase/server.ts`), which derives identity from the verified session cookie — no route trusts a client-supplied user id.

## Row Level Security

Enforced in Postgres, not just in application code — see `docs/DATABASE.md#row-level-security`. This means even a bug in the Next.js API layer can't leak cross-user data, because the database itself refuses the query.

## Secrets

- `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `VAPID_PRIVATE_KEY`, and Google's OAuth client secret are server-only and must never be prefixed `NEXT_PUBLIC_`.
- `.env*.local` is gitignored; `.env.example` documents names only, never values.
- OAuth tokens for Google Calendar are stored in `calendar_integrations.access_token_encrypted` / `refresh_token_encrypted` (`bytea`), intended to be encrypted via Supabase Vault (pgsodium) — decrypting them is restricted to server-side Edge Function code using the service role key.

## Locked notes

A locked note's plaintext lives only in `locked_content_encrypted`; the `content` column is `null` whenever `is_locked = true` (enforced by a `check` constraint — see `notes_locked_content_xor` in the migration). There is no frontend-only "hide" flag standing in for real protection.

## Still to do before launch (tracked, not yet implemented)

- Rate limiting on auth and mutation endpoints.
- CSRF protection review for any non-GET route handler that doesn't go through Supabase's own session verification.
- A dependency/secret scan wired into CI (`.github/workflows/ci.yml` currently runs lint/typecheck/test/build only).
- A pre-launch penetration-style pass per the product spec's Security Testing checklist (unauthorized API access, RLS bypass attempts, malformed input, auth bypass).
