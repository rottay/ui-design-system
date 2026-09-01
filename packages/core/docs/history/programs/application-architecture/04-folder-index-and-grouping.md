# Folder Index And Grouping

This file is the enforcement-ready version of the folder/index rule.

## Rule 1. Every public folder boundary gets an `index.ts`

Required:

- `vertical/index.ts`
- `vertical/shell/index.ts`
- `vertical/navigation/index.ts`
- `vertical/routes/index.ts`
- `vertical/recipes/index.ts`
- `features/<family>/index.ts`
- `features/<family>/<feature>/index.ts`
- `core/<section>/index.ts`
- `ui/<section>/index.ts`

Purpose:

- stable imports
- hidden internal refactors
- predictable ownership

## Rule 2. Do not build giant wildcard barrels

`index.ts` defines the public surface.

It should not:

- export every nested file recursively
- leak internals
- erase ownership

## Rule 3. Group by family when sibling fan-out gets noisy

Heuristic:

- `1-7` siblings: normal
- `8-12` siblings: review
- `13+` siblings: grouping should be strongly considered

## Rule 4. Group by shared noun

Good:

```text
features/ai-operations/
features/hiring-operations/
features/event-operations/
core/providers/
core/state/
```

Bad:

```text
features/group-a/
features/group-b/
actions/misc/
components/stuff/
```

## Rule 5. Never use `_shared` as an escape hatch

Allowed:

- temporary compat folders with explicit migration notes

Not allowed:

- new long-lived `_shared` buckets for mixed concerns

## Rule 6. Preferred feature module layout

```text
features/<family>/<feature>/
  index.ts
  actions/
  components/
  hooks/
  lib/
  screens/
  types/
```

If a feature stays small, not every subfolder is required.

Do not create empty folders just to satisfy the template.

## Rule 7. Prefer meaningful families over flat roots

Example:

Instead of:

```text
src/actions/
  ai-chat/
  ai-copilot/
  ai-models/
  ai-providers/
  ai-studio/
```

Prefer:

```text
src/features/ai-operations/
  copilot/
  providers/
  models/
  studio/
```

## Rule 8. Root names should declare responsibility

Preferred roots:

- `app`
- `vertical`
- `features`
- `core`
- `ui`
- `styles`

Avoid new roots like:

- `shared`
- `common`
- `misc`
- `helpers`
- `services`

at the top level.

Those names are usually too vague to enforce.
