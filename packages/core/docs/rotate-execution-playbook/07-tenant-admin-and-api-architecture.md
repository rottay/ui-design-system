# Tenant, Admin, And API Architecture

## Current Truth

The backend and storage story is not fundamentally broken.

In fact, an important part is already in place:

- [actions/tenancy/whitelabel/index.ts](/Users/daniel/Developer/Rottay/app-platform/src/actions/tenancy/whitelabel/index.ts) already exposes a JSONB-backed whitelabel config flow
- [get-tenant-branding.ts](/Users/daniel/Developer/Rottay/app-platform/src/lib/tenancy/get-tenant-branding.ts) already centralizes public branding payload building
- `whitelabelConfigs.config` already behaves like a flexible JSON config container
- draft and publish flows already exist via `whitelabelDraft`

## What Is Actually Wrong

1. The live admin authoring path still uses legacy branding-first actions.
   [settings/overview.tsx](/Users/daniel/Developer/Rottay/app-platform/src/surfaces/settings/overview.tsx) writes through [updateBranding](/Users/daniel/Developer/Rottay/app-platform/src/actions/tenancy/workflows/index.ts), not through a DS-first `appearance.general` authoring model.

2. The DB adapter only maps a subset of the frozen model.
   [branding-to-tenant-config.ts](/Users/daniel/Developer/Rottay/app-platform/src/lib/tenancy/branding-to-tenant-config.ts) currently emits colors, `fontFamilyBase`, derived `density`, and derived `elevation`, but not the full bounded authoring story.

3. Public branding endpoints are still legacy-shaped.
   [tenant-branding/[slug]/route.ts](/Users/daniel/Developer/Rottay/app-platform/src/app/api/public/tenant-branding/[slug]/route.ts) and [by-host/route.ts](/Users/daniel/Developer/Rottay/app-platform/src/app/api/public/tenant-branding/by-host/route.ts) return branding-oriented payloads.

4. The app still maintains parallel paths:
   legacy branding blobs, whitelabel JSONB, draft preview, and DS normalization.

## Important Decision

Do not start this track with a new schema migration unless it becomes necessary for indexing or analytics.

Reason:

- `whitelabelConfigs.config` is already JSONB
- `appearance.general` can live inside that JSON today
- the main blockers are authoring, normalization, and boundary consistency

## Backend / API Moves

1. Make `appearance.general` the authored source for DB tenants.
   Use `updateWhitelabelConfig()` as the primary persistence path instead of `updateBranding()` for DS-facing customization.

2. Keep legacy fields as read-only migration shims during transition.

3. Add one normalized tenant-config adapter path for runtime and preview.
   The same normalization rules should power:
   - server layout boot
   - auth boot
   - preview/draft flows
   - public tenant-branding responses when needed

4. Decide whether public branding endpoints stay legacy or gain a normalized sibling endpoint.

5. Move settings authoring UI toward the bounded contract:
   - palette.primary
   - palette.secondary
   - palette.accent
   - palette.backgroundMode
   - typography.fontFamilyBase
   - typography.fontFamilyHeading
   - shape.buttonStyle
   - density
   - surfaces.elevation
   - navigation.sidebarTone

## API Readiness Verdict

The API / persistence layer is mostly ready for this track.

The main work is:

- re-centering authoring on the right action path
- unifying adapters
- tightening public contract shape

It is not primarily a database-schema problem.

