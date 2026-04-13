# Final Decision

## Recommended architecture

Adopt the strongest form of Option B:

- shared functional core
- vertical identity layer
- feature-owned business modules
- thin app-owned UI layer

Final top-level shape:

```text
src/
  app/
  vertical/
  features/
  core/
  ui/
  styles/
```

## Why this is better than the current mixed state

The current trees mix five different questions at the same level:

- routing
- identity
- business capability
- infrastructure
- app-owned UI

That is why roots such as `surfaces/`, `actions/`, `components/`, `hooks/`, `providers/`, `stores/`, and `constants/` keep colliding.

The final model answers those questions cleanly:

- `app/` = route entrypoints only
- `vertical/` = how this app feels
- `features/` = what this app does
- `core/` = how this app works internally
- `ui/` = app-owned shared presentation
- `styles/` = global style entrypoints only

## Why `core/` is the right umbrella

`constants`, `providers`, `hooks`, `stores`, `types`, and much of `lib/` are not separate business layers.

They are all app infrastructure.

Grouping them under `core/`:

- reduces root noise
- makes the tree easier to scan
- removes arbitrary top-level buckets
- clarifies ownership

## Why `ui/` is better than `components/`

`components/` is too vague and invites drift.

It usually turns into:

- domain UI
- shared UI
- shell UI
- experiments
- legacy code

`ui/` is more honest:

- it means presentation
- it excludes domain ownership
- it makes it easier to say no to business logic living there

Rules:

- domain-specific UI belongs in `features/*/*/components`
- app-wide shared UI belongs in `ui/`
- cross-app reusable UI belongs in the DS

## Why `surfaces/` should stop being a permanent root

`surfaces/` and `features/` both try to be the main business boundary.

That duplication creates confusion:

- which folder owns the screen
- which folder owns the server actions
- which folder owns hooks and types
- which folder owns adapters

The final rule:

- screen entrypoints live in `features/*/*/screens`
- route files import from `@/features/...`

## Why `actions/` should stop being a permanent root

Do not delete backend integration.

Rehome it.

Server actions should live near the capability that owns them:

- business actions -> `features/*/*/actions`
- cross-app infra actions -> `core/*`

This keeps:

- server actions
- screens
- hooks
- types
- supporting adapters

under one owner.

## Final recommendation

Freeze this architecture:

```text
src/
  app/
  vertical/
  features/
  core/
  ui/
  styles/
```

Treat all other current roots as transitional until they are rehomed.
