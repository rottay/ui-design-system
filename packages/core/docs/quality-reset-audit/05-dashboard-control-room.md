# Dashboard Control Room

## Score

- `4.3/10`

## Main Diagnosis

The dashboard tries to feel premium by layering many small visual gestures, but it lacks decisive information hierarchy.

## Evidence

- `app-platform/src/surfaces/dashboard/builder/index.tsx`
- `app-platform/src/surfaces/dashboard/global-filter-bar/index.tsx`
- `ui-design-system/packages/core/src/ui/structures/headers/collection/index.tsx`
- `ui-design-system/packages/core/src/ui/primitives/display/Card/engines/modern/index.tsx`

## What The Screenshot Reveals

- too many small panels
- too little contrast between panel roles
- too much low-contrast chrome before core meaning
- very weak "hero" discipline
- a control room that feels busy, not commanding

## Product-Level Problems

- cards are not grouped into obvious decision bands
- alert pressure is visually similar to ambient information
- operator queues and readouts compete instead of laddering
- the page opens with too much narration and too little decisive structure

## 10/10 Standard For A Control Room

- one dominant board story
- one secondary zone for live pressure
- one tertiary zone for supporting detail
- cards that vary clearly by importance
- aggressive reduction of ornamental chrome in top regions

## Remediation Direction

- reduce the number of visual containers
- use stronger section breaks and bigger differences in card types
- redesign the hero to be calmer and more authoritative
- stop treating every control/metric as its own framed object
