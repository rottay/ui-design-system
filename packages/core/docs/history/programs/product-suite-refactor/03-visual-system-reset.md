# Visual System Reset

## Main Diagnosis

The current Rotate path often tries to feel premium through:

- subtle grid overlays
- faint gloss gradients
- compact eyebrow labels
- low-contrast muted copy

That combination reads as decorative noise, not premium authorship.

## Highest-Impact Targets

- [CollectionHeader](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/structures/headers/collection/index.tsx)
- [SearchCommandBar](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/structures/workspace/search-command-bar/index.tsx)
- [Card modern](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/primitives/display/Card/engines/modern/index.tsx)
- [DataTable modern](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx)
- [Statistic modern](/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/ui/primitives/display/Statistic/engines/modern/index.tsx)

## Implementation Rules

1. Remove faux-premium texture first.
   Reduce grids, gloss, inner lines, and ambient decoration unless they help hierarchy.

2. Strengthen the material ladder.
   Primary panel, secondary panel, utility slab, and inset surface must be visually distinct at a glance.

3. Increase typographic decisiveness.
   Important numbers and titles need more authority.
   Secondary notes must stop competing with primary information.

4. Reduce repeated microcopy.
   Use fewer muted helper lines and less all-caps metadata.

5. Prefer proportion over decoration.
   Bigger headline zones, calmer spacing, and stronger grouping should do more of the work.

## Acceptance Criteria

- the page no longer reads as a wall of similar dark rectangles
- one layer owns hierarchy on each screen
- the control room and user workspace stop sharing the same generic slab language
- Rotate feels distinguishable from a generic dark enterprise dashboard

