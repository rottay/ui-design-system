# Cross-App Utilization Matrix

## Executive Read

All three apps are genuinely design-system-heavy. The difference is not whether they use the DS; it is how high up the abstraction stack they consume it.

Shared pattern:

- all three apps lean hard on DS primitives
- all three apps use some local `ui/` wrappers
- all three apps underuse the DS’s higher-level surface/structure platform relative to the size of what the DS exports

## Matrix

| Metric | Platform | BitHire | Evnto |
| --- | ---: | ---: | ---: |
| DS import declarations | `477` | `456` | `404` |
| Files importing DS | `416` | `416` | `328` |
| `@/ui/*` import declarations | `112` | `88` | `119` |
| Files importing `@/ui/*` | `76` | `80` | `82` |
| `@/vertical/*` import declarations | `58` | `54` | `7` |
| Files importing `@/vertical/*` | `50` | `54` | `6` |
| DS stylesheet entry files | `1` effective app entrypoint | `1` | `1` |
| Legacy `_shared` as external consumer API | very low | none | none |

Notes:

- Platform DS styles appear in more repo references because of docs/showroom paths, but the effective app entrypoint is still a single global import.
- Evnto uses `ui/` more than `vertical/` by a very wide margin.
- Platform and BitHire are much closer to each other in vertical wiring than Evnto.

## Most Imported DS Symbols

### Platform

Top symbols from AST-based import scanning:

- `Box 300`
- `Text 282`
- `Button 226`
- `Flex 213`
- `Stack 166`
- `Badge 144`
- `Card 91`
- `Input 86`
- `Grid 79`
- `Spinner 63`
- `useTokens 63`

Representative files:

- [permissions policies](/Users/daniel/Developer/Rottay/app-platform/src/features/identity-access/permissions/screens/policies.tsx)
- [entity table workspace](/Users/daniel/Developer/Rottay/app-platform/src/ui/tables/entity-table-workspace/index.tsx)

### BitHire

Top symbols:

- `Box 361`
- `Text 344`
- `Flex 339`
- `Stack 237`
- `Button 209`
- `Badge 134`
- `Card 121`
- `Grid 116`
- `Input 76`

Representative files:

- [dashboard content](/Users/daniel/Developer/Rottay/app-bithire/src/app/(dashboard)/dashboard/content/index.tsx)
- [quality of hire](/Users/daniel/Developer/Rottay/app-bithire/src/features/analytics/screens/quality-of-hire/index.tsx)

### Evnto

Top symbols:

- `Text 241`
- `Flex 231`
- `Box 212`
- `Button 183`
- `Stack 158`
- `Badge 131`
- `Card 117`
- `Input 45`
- `Grid 43`

Representative files:

- [products list](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/products/screens/list/index.tsx)
- [purchasing detail](/Users/daniel/Developer/Rottay/app-evnto/src/features/commerce-operations/purchasing/screens/detail/index.tsx)

## What The Apps Use Heavily

### Platform

- DS primitives
- DS structures more than the other two apps
- app-owned table workspace wrappers
- breadcrumbs/focus-mode shell behaviors

Signals:

- `primitives` in `350` importing files
- `structures` in `108` files
- `surfaces` in `43` files
- `patterns` in `27` files

### BitHire

- DS primitives
- `vertical/shell/command-header`
- app-owned cards and forms
- a focused `ui/tables` wrapper layer

Signals:

- `primitives/layout` named-import occurrences: `1080`
- `primitives/display`: `676`
- `primitives/inputs`: `364`
- `@/vertical/shell/command-header`: used in `43` files

### Evnto

- DS primitives
- `ui/tables` and shared list chrome
- direct `PatternDataTable`
- page headers and loading/feedback wrappers

Signals:

- DS root import declarations: `404`
- `PatternDataTable`: direct in `13` files
- `StatsHeader`: `38` files via `@/ui/tables`
- `AnimatedContent`: `46` files via `@/ui`

## What The Apps Use Lightly

### Platform

- icons entrypoint
- server entrypoint
- most motion/presentation effects outside showroom
- much of the broader DS runtime/compilers surface

### BitHire

- DS structures: effectively `0/96` exports used
- DS motion: `0/49`
- DS surfaces: only `3/345`, and only foundation types
- DS runtime/hooks: nearly absent outside provider bootstrap

### Evnto

- vertical identity/profile/navigation
- workflow patterns beyond a few isolated screens
- navigation patterns beyond command palette/global search
- richer DS admin/workspace patterns

## Utilization Diagnosis

All three apps are healthy on DS adoption volume.

The real issue is **adoption depth**:

- Platform is the closest to using the DS as a platform.
- BitHire is the most primitive-first and manual-composition-heavy.
- Evnto is DS-heavy but still thin on vertical identity and high-level workflow/admin patterns.

## Most Important Takeaway

The repo does **not** have a “we built a design system nobody uses” problem.

It has a more nuanced problem:

- the primitive layer is clearly successful
- the higher-order DS layers are under-realized
- each app still re-solves enough screen composition and workflow UI locally that the full DS leverage is not being captured
