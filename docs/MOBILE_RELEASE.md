# Mobile Release

**Status: not started.** `apps/mobile` doesn't exist yet. `packages/types`, `packages/validation`, `packages/utils`, and `packages/config` were deliberately factored out of `apps/web` so a future Expo app can import them without duplicating business logic (progress aggregation, streak math, next-action ranking, validation schemas).

## When this gets built

Phase 7 of `docs/PRODUCT.md`. Expected shape: `apps/mobile` as an Expo (React Native + TypeScript) app, sharing the same Supabase project and the four packages above, with its own native navigation and components rather than a shrunk copy of the web UI (per the product spec's "mobile is not a secondary version of the website" rule).

## What will be required from you before release builds are possible

- An Apple Developer account (for iOS builds/TestFlight/App Store) and a Google Play Console account (for Android).
- App icon, splash screen, and store listing assets.
- Privacy policy and support URLs (the web app's `/privacy` page can serve this once it has real, counsel-reviewed content).
- Expo Application Services (EAS) project configuration (`eas.json`, build profiles for development/preview/production).

None of this can be completed by an AI coding session on its own — account creation and store submission are actions only you can take.
