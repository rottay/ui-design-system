# Architecture, Performance, and Maintainability

## Score

- `5.8/10`

## Main Risks

1. Too much host-local shell code.
2. Too many local `color-mix()` recipes and one-off gradients.
3. Build/runtime seams still create confusion during active DS rebuild + app dev cycles.
4. The system is still part DS truth, part app truth.
5. Quality upgrades are harder because macro composition is not centralized enough.

## Evidence

- `app-platform/src/composition/components/_shared/layouts/app-layout/index.tsx`
- `app-platform/src/composition/components/_shared/layouts/app-layout/sidebar/index.tsx`
- `app-platform/src/composition/components/_shared/layouts/app-layout/topbar/index.tsx`
- `app-platform/src/composition/components/_shared/tables/entity-table-workspace/index.tsx`
- `ui-design-system/packages/core/src/ui/structures/headers/collection/index.tsx`
- `ui-design-system/packages/core/src/ui/structures/workspace/search-command-bar/index.tsx`

## Important Distinction

The system is not failing because it is too primitive.
It is failing because quality is distributed across too many local recipes.

## What A Better Architecture Would Look Like

- DS owns more of the visible shell grammar
- app code composes fewer bespoke gradients and local micro-recipes
- high-value page archetypes are promoted into stronger DS structures
- the path from token to product feel is more centralized and more opinionated
