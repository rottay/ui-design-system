# Cross-App Coherence

## Score Baseline

- `4.9/10`

## Biggest Gaps

1. Tenant identity resolution differs across apps.
2. `DesignSystemProvider` boot paths are not consistent.
3. CSS entrypoint strategy differs by app.
4. Shell geometry is still app-local.
5. DB customization and authoring parity are incomplete.

## Important Files

- [app-platform/layout.tsx](/Users/daniel/Developer/Rottay/app-platform/src/app/layout.tsx)
- [app-platform/dashboard-providers](/Users/daniel/Developer/Rottay/app-platform/src/components/providers/dashboard-providers/index.tsx)
- [app-platform/tenant-provider](/Users/daniel/Developer/Rottay/app-platform/src/components/providers/tenant-provider/index.tsx)
- [app-evnto/layout.tsx](/Users/daniel/Developer/Rottay/app-evnto/src/app/layout.tsx)
- [app-evnto/providers/index.tsx](/Users/daniel/Developer/Rottay/app-evnto/src/providers/index.tsx)
- [app-bithire/layout.tsx](/Users/daniel/Developer/Rottay/app-bithire/src/app/layout.tsx)
- [app-bithire/providers/index.tsx](/Users/daniel/Developer/Rottay/app-bithire/src/providers/index.tsx)

## Required Decisions

1. Create one shared server-side tenant resolver for all apps.
2. Standardize `DesignSystemProvider` boot precedence across apps.
3. Standardize CSS entrypoints to one vertical artifact strategy per app.
4. Extract one DS shell contract that all three apps can consume.

## Acceptance Criteria

- bundled tenants short-circuit DB everywhere
- metadata, manifest, auth boot, and dashboard boot use the same tenant identity rules
- shell geometry no longer diverges by app through local constants

