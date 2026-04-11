# Data Workspace

## Score Baseline

- `5.4/10`

## Main Problems

1. Table readability is too gray and too uniform.
2. The toolbar/search area is overpacked and under-prioritized.
3. Row affordances are ambiguous.
4. "Smart refine" sounds smarter than it behaves.
5. Core table interactions are still not keyboard-credible enough.

## Key Files

- [users/workspace-config.tsx](/Users/daniel/Developer/Rottay/app-platform/src/surfaces/users/workspace-config.tsx)
- [entity-table-workspace/index.tsx](/Users/daniel/Developer/Rottay/app-platform/src/components/_shared/tables/entity-table-workspace/index.tsx)
- [SearchCommandBar](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/structures/workspace/search-command-bar/index.tsx)
- [DataTable modern](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/data/data-table/engines/modern.tsx)

## Required Changes

1. Simplify the top rail.
   Primary search first, 2-3 operator presets second, utilities last.

2. Make the first column the primary affordance.
   The row can stay clickable as a convenience, but the entry point must be explicit.

3. Rebalance table typography and density for scanning.

4. Turn "smart refine" into operator presets with counts and clear effect.

5. Upgrade `DataTable.Modern` interaction quality:
   keyboard sorting, `aria-sort`, keyboard row activation, non-mouse-only reorder path.

## Acceptance Criteria

- the table can be scanned quickly without reading every helper line
- the primary row entry point is obvious
- the toolbar feels focused instead of crowded
- keyboard users can sort and navigate credibly

