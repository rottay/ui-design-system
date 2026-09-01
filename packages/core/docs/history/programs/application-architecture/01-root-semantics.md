# Root Semantics

This file defines exactly what each root means.

## `app/`

Meaning:

- route entrypoints
- route-level layouts
- route-level error/loading files

Allowed:

- `page.tsx`
- `layout.tsx`
- tiny route wrappers

Not allowed:

- domain logic
- server actions
- large view composition
- app-owned UI systems

Rule:

- routes should be thin and import from `@/features/...` or `@/vertical/...`

## `vertical/`

Meaning:

- app identity
- visible product grammar
- shell posture
- navigation posture
- recipe defaults
- route metadata registry

Allowed:

- `manifest.ts`
- shell composition
- navigation sections
- recipe objects
- route-meta registry
- profile defaults for density, shape, motion, tone

Not allowed:

- business queries
- business mutations
- domain models
- domain-specific server actions

Short definition:

- `vertical/` answers: "How does this app feel?"

## `features/`

Meaning:

- business capability modules

Allowed:

- feature-owned actions
- feature-owned screens
- feature-owned hooks
- feature-owned adapters
- feature-owned types
- feature-owned components

Short definition:

- `features/` answers: "What does this app do?"

## `core/`

Meaning:

- app infrastructure and runtime internals

Allowed:

- config
- providers
- state stores
- app-wide hooks
- technical utilities
- DB and schema code
- app-global types

Short definition:

- `core/` answers: "How does this app work internally?"

## `ui/`

Meaning:

- app-owned shared presentation that is not DS-worthy and not domain-owned

Allowed:

- brand elements
- thin app-specific wrappers around DS primitives
- empty states shared across many features
- app-wide form/layout wrappers
- app-owned tables or feedback pieces that are truly cross-feature

Not allowed:

- feature-specific cards or rows
- shell ownership
- business logic
- data loading

Short definition:

- `ui/` answers: "What reusable app-wide presentation do we still own locally?"

## `styles/`

Meaning:

- global style entrypoints only

Allowed:

- `globals.css`
- app-level theme entrypoints
- temporary migration styles with expiration notes

Not allowed:

- hidden component systems
- domain styling buckets

## Transitional roots

These may exist during migration, but they are not permanent:

- `surfaces/`
- `actions/`
- `components/`
- `constants/`
- `hooks/`
- `providers/`
- `stores/`
- `types/`

Each of those should be converged into:

- `features/`
- `core/`
- `ui/`
- `vertical/`

depending on ownership.
