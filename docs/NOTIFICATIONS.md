# Notifications

**Status: schema and preferences model in place; delivery not yet wired up.**

`notifications` (in-app center) and `notification_preferences` (per-category toggles + quiet hours + Web Push subscription) tables exist in `supabase/migrations/0001_init.sql`. The in-app notification center UI and the Web Push send path (an Edge Function using the `web-push` library and the VAPID keys from `docs/ENVIRONMENT_VARIABLES.md`) are the next pieces of work.

## Design

- Every send checks `notification_preferences` server-side before dispatch — a disabled category or an active quiet-hours window blocks the send, it isn't just hidden client-side.
- Focus-session completion is the first notification type worth wiring up, since `docs/ARCHITECTURE.md#focus-timer-correctness` already requires a server-side sweep to catch sessions that finished in a closed tab — that sweep is the natural place to also fire the notification.
- Mobile push (Expo Notifications) is deferred until `apps/mobile` exists (Phase 7).
