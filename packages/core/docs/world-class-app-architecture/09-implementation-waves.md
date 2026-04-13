# Implementation Waves

This is the recommended migration sequence.

## Wave 1. Freeze the target taxonomy

Deliver:

- approve the final six roots
- approve family names per app
- approve `vertical/recipes` without `page-chrome`
- approve `ui/` as the replacement for app-owned shared `components/`

## Wave 2. Build the new permanent roots

Deliver:

- create `core/`
- create `ui/`
- keep `vertical/`
- keep `features/`
- add `index.ts` boundaries

No business moves yet.

## Wave 3. Rehome app infrastructure into `core/`

Move:

- `constants` -> `core/config`
- `providers` -> `core/providers`
- `stores` -> `core/state`
- cross-app `hooks` -> `core/hooks`
- app-global `types` -> `core/types`
- infra `lib` -> `core/lib`
- `database` -> `core/database`

## Wave 4. Rehome screen entrypoints into `features/*/*/screens`

Move:

- `surfaces/` contents into the owning feature

Rule:

- route files should import from `@/features/...`

## Wave 5. Rehome server actions into feature ownership

Move:

- business actions into owning features
- only infra actions remain in `core/`

This is the key wave for removing the root `actions/` forest.

## Wave 6. Rehome domain components into features and converge shared UI into `ui/`

Move:

- `src/components/<domain>` -> owning feature `components/`
- `src/components/_shared/*` -> `ui/*` or DS

## Wave 7. Delete compat layers and dead roots

Delete when empty:

- root `surfaces/`
- root `actions/`
- root `constants/`
- root `providers/`
- root `stores/`
- root `hooks/`
- root `types/`
- old domain folders under `components/`

## Wave 8. Guardrails

Enforce in CI:

- routes may not import from `@/surfaces/`
- root `actions/` may not grow
- root `components/<domain>` may not grow
- new roots may not be introduced casually
- `index.ts` is required on public boundaries

## Success criteria

The migration is done when:

- each app has the same root semantics
- `surfaces/` is gone as a permanent root
- `actions/` is gone as a permanent root
- domain UI lives with its feature
- app-wide shared UI lives in `ui/`
- infra lives in `core/`
- route files enter through `@/features/...`
