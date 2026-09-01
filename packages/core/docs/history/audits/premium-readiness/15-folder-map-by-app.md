# Folder Map By App

This file turns the recommended template into app-specific guidance.

## Shared standard for all apps

All three apps should converge on:

```text
src/
  app/
  providers/
  lib/
  vertical/
  features/
  components/
  actions/
  styles/
  types/
```

## App Platform

## Vertical identity

- security
- DevOps
- control-room
- command-first

## Recommended `vertical/`

```text
vertical/
  profile/
  shell/
  navigation/
  page-chrome/
  workspace/
  dashboard/
  settings/
```

## What should move here

- `components/_shared/layouts/app-layout/*` -> `vertical/shell/`
- `components/_shared/global-search/*` -> `vertical/shell/` or DS if promoted
- `components/_shared/layout/command-header-component/*` -> `vertical/page-chrome/` or DS
- `surfaces/dashboard/*` visual grammar wrappers -> `vertical/dashboard/`
- workspace chrome recipes from `entity-table-workspace` -> `vertical/workspace/`

## What should remain in `features/`

- identity
- permissions
- security
- tenants
- notifications
- compliance
- feature flags

Each feature should expose:

- `screens/`
- `components/`
- `data/`
- `actions/`

## App Evnto

## Vertical identity

- rounded
- animated
- hospitality/nightlife
- lively event ops

## Recommended `vertical/`

```text
vertical/
  profile/
  shell/
  navigation/
  page-chrome/
  workspace/
  dashboard/
  settings/
  venue-ops/
```

## What should move here

- `components/_shared/layout/*` -> `vertical/shell/`
- `components/_shared/search/global-search/*` -> `vertical/shell/` or DS if promoted
- `components/_shared/layout-parts/page-header/*` -> `vertical/page-chrome/`
- `components/dashboard/*` shared dashboard chrome -> `vertical/dashboard/`
- table/list presentation recipes that are truly app-level -> `vertical/workspace/`

## What should remain in `features/`

- events
- bar
- staff
- inventory
- venues
- vip-tables
- analytics

## App BitHire

## Vertical identity

- professional recruiting
- talent network
- profile-first
- credible and editorial

## Recommended `vertical/`

```text
vertical/
  profile/
  shell/
  navigation/
  page-chrome/
  workspace/
  dashboard/
  settings/
  profile-surfaces/
```

## What should move here

- `components/layout/*` -> `vertical/shell/`
- `components/layout/command-header-component/*` -> `vertical/page-chrome/`
- `components/_shared/cards/*` that define app-wide surface language -> `vertical/workspace/` or `vertical/profile-surfaces/`
- recruiting list/profile page recipes -> `vertical/workspace/`

## What should be removed or isolated

- `components/v2/layout/*`

Rule:

- either promote it as the single shell direction
- or quarantine/remove it

It cannot remain as a parallel architecture indefinitely.

## Migration rules

### Rule 1

When moving files out of `_shared`, pick the new home by ownership:

- DS-worthy -> upstream to DS
- app-wide visible grammar -> `vertical/`
- domain-only -> `features/<domain>/components`

### Rule 2

Do not put new shell/page/workspace code into `_shared`.

### Rule 3

Every new app-owned visual abstraction must answer:

- is this app-wide?
- is this cross-app?
- is this domain-only?

That answer determines:

- `vertical/`
- DS
- `features/`

## Recommended decision

If you want a world-class template that gives:

- shared functionality
- distinct vertical identity
- maintainable ownership

then standardize on:

- one DS
- one app template
- one `vertical/` layer per app
- feature modules under `features/`
- no more `_shared` catch-all growth

