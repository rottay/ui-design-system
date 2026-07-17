# User Workspace and Data UX

## Score

- `5.8/10` functional
- `4.8/10` premium quality

## What Works

- the workspace model is rich
- search, filters, views, columns, and selection all exist
- the shell can support heavy operational tables

## What Still Feels Poor

- rows are too low-contrast
- sorting is not accessible enough
- row click flows are mouse-first
- the search/filter strip is visually cramped
- the table occupies huge horizontal territory without strong editorial framing

## Evidence

- `app-platform/src/composition/components/_shared/tables/entity-table-workspace/index.tsx`
- `ui-design-system/packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx`
- `ui-design-system/packages/core/src/ui/structures/workspace/search-command-bar/index.tsx`
- `app-platform/src/surfaces/users/workspace-config.tsx`

## UX Truth

This is closer to "strong back-office tooling" than to "best-in-class premium control software".

## 10/10 Table UX Would Require

- stronger row hierarchy
- clearer column emphasis
- better keyboard support for sorting and row activation
- more comfortable toolbar controls
- more deliberate framing around the list itself

## Immediate Moves

- add keyboard-sortable headers with `aria-sort`
- make row actions and row activation keyboard reachable
- enlarge key control targets in the workspace toolbar
- simplify and clarify the search/filter chrome
