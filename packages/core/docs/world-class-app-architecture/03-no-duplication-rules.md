# No-Duplication Rules

This is the most important file in the package.

The goal is not only a nicer tree.

The goal is a tree where ownership is singular and obvious.

## One owner per concern

For any given concern, only one layer should own it.

## Identity

Owner:

- `vertical/`

Includes:

- shell posture
- route metadata
- navigation labels/groups
- recipe defaults
- motion, shape, density posture

## Business capability

Owner:

- `features/`

Includes:

- server actions
- domain screens
- domain hooks
- domain types
- domain adapters

## App infrastructure

Owner:

- `core/`

Includes:

- provider stack
- app stores
- app config
- cross-feature infra hooks
- tenancy wiring
- auth/runtime clients
- schema and database support

## Shared local presentation

Owner:

- `ui/`

Includes:

- app-owned shared UI patterns that are not DS-owned

## Where common mistakes go wrong

### Mistake 1

Putting screen entrypoints in `surfaces/` and domain logic in `features/`.

Result:

- duplicated business boundary

Fix:

- put screen entrypoints in `features/*/*/screens`

### Mistake 2

Keeping all server actions in a root `actions/`.

Result:

- backend ownership is separated from the feature that needs it

Fix:

- feature actions live in the feature
- infra actions live in `core/`

### Mistake 3

Putting domain cards and rows in `components/`.

Result:

- domain UI becomes root-level clutter

Fix:

- domain UI belongs in the feature

### Mistake 4

Putting shell and workspace behavior in `_shared`.

Result:

- app-owned design systems grow in secret

Fix:

- vertical grammar belongs in `vertical/`
- cross-app grammar belongs in DS

## Decision table

If the code is about:

- app identity -> `vertical/`
- business capability -> `features/`
- global runtime infra -> `core/`
- shared local presentation -> `ui/`
- cross-app reusable system -> DS

## Rehome, do not delete

When removing a top-level root:

- do not delete backend integration
- do not delete screens
- do not delete adapters

Rehome them to the correct owner.

That is the rule for:

- `actions/`
- `surfaces/`
- `components/`
- `constants/`
- `hooks/`
- `providers/`
- `stores/`
- `types/`
