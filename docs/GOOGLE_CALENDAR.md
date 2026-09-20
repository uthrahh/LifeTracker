# Google Calendar Integration

**Status: designed, not yet implemented.** The schema (`calendar_integrations`, `calendar_events.google_event_id`/`google_etag`) and sync design are in place (see `docs/ARCHITECTURE.md#calendar-sync`); the OAuth flow and the sync Edge Function are the next piece of work once a Google Cloud OAuth client exists (needs your Google Cloud project — see `docs/ENVIRONMENT_VARIABLES.md`).

## Planned flow

1. User clicks "Connect Google Calendar" in Settings → Integrations.
2. Redirect to Google's OAuth consent screen (`calendar.events` scope only — not full account access).
3. On callback, exchange the code for access/refresh tokens, store them encrypted in `calendar_integrations`.
4. An Edge Function (`supabase/functions/sync-calendar`, not yet written) does the two-way sync on a `pg_cron` schedule and immediately after local writes.

## Conflict rules (see ARCHITECTURE.md for the full rationale)

- Idempotent upsert on `google_event_id` — never create a duplicate for the same Google event.
- A deletion on either side always wins over a stale update; a resurrected "deleted" event is treated as a bug, not a feature.
- Last-write-wins by `updated_at` for genuine edit conflicts.

## Testing checklist (once implemented)

Initial import, app→Google push, Google→app pull, edits both directions, deletion both directions, duplicate prevention, revoked access mid-session, token expiry/refresh, timezone differences, and a simulated sync failure (network error mid-batch shouldn't leave partial/duplicate state).
