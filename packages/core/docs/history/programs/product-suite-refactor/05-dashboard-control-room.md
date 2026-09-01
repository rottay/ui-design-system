# Dashboard Control Room

## Score Baseline

- `4.6/10`

## Main Problems

1. No dominant story.
   The hero, brief, alerts, queue, filter slab, and widget board compete at similar weight.

2. Too many local surface dialects.
   The builder currently authors several card species with near-identical dark treatment.

3. Too much dense microcopy.
   Small labels and secondary notes dilute urgency.

4. Control zones are fragmented.
   Tune, mode, detail, edit, and queue actions are spread across too many areas.

5. The DS primitives underneath are not strong enough to carry flagship hierarchy by themselves.

## Key Files

- [dashboard/builder/index.tsx](/Users/daniel/Developer/Rottay/app-platform/src/surfaces/dashboard/builder/index.tsx)
- [dashboard/global-filter-bar/index.tsx](/Users/daniel/Developer/Rottay/app-platform/src/surfaces/dashboard/global-filter-bar/index.tsx)
- [dashboard/widget-grid/index.tsx](/Users/daniel/Developer/Rottay/app-platform/src/surfaces/dashboard/widget-grid/index.tsx)
- [Card modern](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/primitives/display/Card/engines/modern/index.tsx)
- [Statistic modern](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/primitives/display/Statistic/engines/modern/index.tsx)

## Required Changes

1. Recompose the above-the-fold layout into three zones:
   headline and brief, one primary attention panel, one compact actions/mode rail.

2. Collapse the local card zoo into a shared DS control-room surface family.

3. Replace microcopy-heavy summaries with real metric hierarchy.

4. Turn the filter slab into a compact command dock.

5. Make widget edit chrome explicit and mostly dormant outside edit/focus modes.

## Acceptance Criteria

- above the fold is readable in one scan
- one primary attention surface dominates
- supporting rails are quieter and shorter
- fewer local card dialects exist in the builder

