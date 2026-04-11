# Modern Primitives and Patterns

## Diagnosis

The Modern engine is technically healthier than before, but many visible surfaces are still not premium enough.

## Current Pattern

- tokenized, but visually generic
- polished, but repetitive
- flexible, but not authored strongly enough

## High-Impact Surfaces Still Holding Quality Back

- `ui-design-system/packages/core/src/components/primitives/display/Card/engines/modern.tsx`
- `ui-design-system/packages/core/src/components/primitives/navigation/Menu/engines/modern.tsx`
- `ui-design-system/packages/core/src/components/structures/headers/collection/index.tsx`
- `ui-design-system/packages/core/src/components/structures/workspace/search-command-bar/index.tsx`
- `ui-design-system/packages/core/src/components/primitives/display/Statistic/engines/modern.tsx`

## Important Truth About The Recent 4 Fixes

### Fully or Mostly Fixed

- `ConnectedCommandPalette` barrel cycle: fixed
- command palette ARIA pattern: materially improved
- `17-10-10-action-plan.md` wording: improved in that file

### Not Fully Fixed

- `Statistic`
  The loading animation improved, but the component still does not truly consume the statistic-specific surface end to end. It remains more generic than canonical.

## Quality Direction

- raise semantic differences between component variants
- reduce overuse of the same glossy dark treatment
- make high-value display primitives more expressive
- stop assuming tokenization alone creates premium quality
