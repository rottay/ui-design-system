# Hooks, Surfaces, and Patterns

## Core Judgment

This layer is split into two realities:

- a strong DS-internal infrastructure set
- a larger exported utility surface that still is not truly fused into product/runtime

## Strongest Hook Families

### Real DS infrastructure

- `useTokens`
- responsive hooks
- motion hooks
- voice integration

These are actually wired into DS runtime, DS surfaces/patterns, or app hosts.

### Evidence

- `ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/tokens/index.ts`
- `ui-design-system/packages/core/src/infrastructure/runtime/theming/presentation/adapters/react/css-variables-bridge/index.tsx`
- `ui-design-system/packages/core/src/ui/surfaces/runtime/helpers/states/index.tsx`
- `ui-design-system/packages/core/src/ui/patterns/data/data-table/PatternDataTable.tsx`
- `ui-design-system/packages/core/src/ui/structures/dashboard/stats-header/StatsHeader.tsx`
- `ui-design-system/packages/core/src/ui/structures/workspace/search-command-bar/index.tsx`

## Weakest Hook Families

### Commands and search

The registry is mounted and the bridge exists, but the product host still does not activate the full path.

Main issue:

- `app-platform/src/composition/components/_shared/tables/entity-table-workspace/index.tsx` still mounts `SearchCommandBar` without real `commands`

### Data / routing / state

These are now more honestly labeled as app-facing, but that also means the DS does not yet own a canonical data/surface workflow.

### Notifications / DnD / AI

These are exported and tested, but not truly fused into DS or app product flows.

## Hooks Scorecard

| Family | Score | Verdict |
|---|---:|---|
| Token + theme runtime | 9 | strong |
| Responsive + motion + voice | 8 | strong |
| Commands + search | 4 | partial |
| Data + routing + state | 3 | mostly app-facing |
| Notifications + DnD + AI | 2 | exported, largely dormant |

## Patterns / Surfaces View

Patterns and surfaces are stronger than the dormant hook families, but they are still not fully fused to the broader exported hook catalog.

Examples:

- `PageShell` and `ActivityLog` are strong
- `PatternDataTable` uses responsive hooks well
- `NotificationCenter` is still too local
- `useSurfaceQuery` is honestly app-facing rather than false-core

## Decision Needed

The team should explicitly choose one of these two directions:

### Direction A - make these hooks truly core

Then:

- activate command/search in the live product host
- pick one canonical surface data flow
- add a real consumer for notifications, DnD, and AI

### Direction B - narrow the story

Then:

- keep only tokens/responsive/motion/voice as true DS infrastructure
- document others clearly as app utilities
- stop presenting them as fused system primitives

## Recommended Waves

- `H1`: command/search activation
- `H2`: data/routing/state decision
- `H3`: notifications/DnD/AI closure or narrowing
- `H4`: guardrails for claimed-internal hooks with no non-test consumers
