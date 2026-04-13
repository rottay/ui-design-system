# Folder Organization And Indexing

This file formalizes one additional rule for the refactor:

- use folder indexes intentionally
- keep folder fan-out bounded
- group sibling folders under a coherent shared name when that grouping is real

This is now part of the template.

## Why this matters

Without this rule, even a good architecture drifts into:

- huge flat directories
- mixed ownership
- hard-to-scan trees
- accidental duplication

We already see signs of this in the current codebase.

Examples from the audit pass:

- `app-bithire/src/actions` has `43` top-level subfolders
- `app-platform/src/actions` has `15` top-level subfolders
- `app-evnto/src/components` has `14` top-level subfolders

That does not mean “group everything blindly”.

It means:

- when a meaningful family exists, use it
- when it does not, keep the structure flat

## Core rules

## 1. Stable public entrypoint per meaningful folder

Use `index.ts` when a folder is meant to be consumed from outside itself.

Examples:

```text
vertical/index.ts
features/<domain>/index.ts
features/<domain>/routes/index.ts
features/<domain>/screens/index.ts
features/<domain>/components/index.ts
```

Purpose:

- make import paths predictable
- preserve internal refactor freedom
- keep public surfaces explicit

## 2. Do not build giant wildcard barrels

The point of `index.ts` is not:

- export every file recursively forever

The point is:

- define the public surface of that folder

Good:

- `features/security/index.ts` exports screen entrypoints, public hooks, route metadata

Bad:

- one barrel that re-exports every nested implementation detail

## 3. Fan-out thresholds

Use these as heuristics, not rigid laws:

- `1-7` siblings: usually fine
- `8-12` siblings: evaluate grouping
- `13+` siblings: grouping should be strongly considered

If a folder crosses that threshold and there is a clear shared family:

- create a grouping folder

If there is no honest grouping:

- keep it flat and document why

## 4. Group by shared noun, not by arbitrary file count

Good grouping:

```text
actions/auth/
actions/identity/
actions/navigation/
actions/tenancy/
features/security/policies/
features/security/incidents/
features/security/audit/
```

Bad grouping:

```text
actions/group-a/
actions/group-b/
components/misc-1/
components/misc-2/
```

## 5. Prefer one more semantic level over a chaotic root

If a root becomes noisy, introduce a meaningful shared parent.

Example:

Instead of:

```text
actions/
  mfa/
  passkeys/
  sessions/
  sso/
  tokens/
  oauth/
  password/
```

Prefer:

```text
actions/
  auth/
    mfa/
    passkeys/
    sessions/
    sso/
    tokens/
    oauth/
    password/
```

## 6. Do not over-nest early

Avoid the opposite failure:

- a tree so nested that nobody can find anything

If only three items exist and the grouping adds no clarity:

- do not add the extra folder

## 7. Apply the same logic to `vertical/`

Inside `vertical/`, use stable named sections.

Preferred:

```text
vertical/
  manifest.ts
  index.ts
  profile/
  recipes/
  navigation/
  content/
  iconography/
```

And inside `recipes/`:

```text
vertical/recipes/
  index.ts
  shell.ts
  page-chrome.ts
  workspace.ts
  dashboard.ts
  settings.ts
```

This is cleaner than exploding recipe files directly at the root of `vertical/`.

## 8. Apply the same logic to `features/`

Each feature should expose:

```text
features/<domain>/
  index.ts
  actions/
  data/
  hooks/
  model/
  routes/
  screens/
  components/
```

If one of those folders becomes too broad, group by coherent subdomain.

Example:

```text
features/security/
  routes/
  screens/
  components/
  policies/
  incidents/
  audit/
```

or:

```text
features/security/screens/
  audit/
  incidents/
  policies/
```

Choose the version that preserves the clearest ownership.

## 9. `_shared` is not an allowed escape hatch

This matters especially for the refactor.

When a folder gets too crowded:

- do not create another `_shared` bucket
- regroup by ownership or domain

Decision tree:

- cross-app and reusable -> DS
- app-wide visible grammar -> `vertical/`
- domain-only -> `features/<domain>/...`
- small internal helper -> local file or local subfolder

## 10. Enforcement expectation

This rule should be enforced in review and eventually in CI:

- require `index.ts` at feature and vertical public boundaries
- flag overly broad flat roots above threshold for review
- flag new `_shared` growth for shell/page/workspace concerns
- flag direct deep imports when a public entrypoint exists

## Practical default

During the refactor, use this default:

1. start flat when the surface is small
2. once the sibling count grows and a clear family exists, group it
3. expose a public `index.ts` at the folder boundary
4. never group purely for aesthetics

## Final rule

Yes, this convention should apply across the refactor.

In plain language:

- when many sibling folders share a coherent family, group them
- when a folder is meant to be imported from outside, give it an `index.ts`
- when grouping would be fake, do not force it

That is the balance between:

- order
- clarity
- and not over-architecting
