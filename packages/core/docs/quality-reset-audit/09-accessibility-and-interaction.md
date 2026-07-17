# Accessibility and Interaction

## Score

- `5.1/10`

## Improved

- command palette semantics improved meaningfully
- focus trap and focus return work better than before

## Still Open

1. Table sorting is mouse-first.
   Evidence:
   - `ui-design-system/packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx`

2. Row click flows are mouse-first.
   Evidence:
   - `ui-design-system/packages/core/src/ui/patterns/data/data-table/engines/modern/index.tsx`

3. `ShortcutsOverlay` still lacks true modal focus behavior.
   Evidence:
   - `ui-design-system/packages/core/src/ui/patterns/navigation/shortcuts-overlay/engines/modern/index.tsx`

4. Dense dark controls are often too small and too muted.
   Evidence:
   - `ui-design-system/packages/core/src/ui/structures/workspace/search-command-bar/index.tsx`

## Product Impact

These are not "nice to have" gaps.
They directly lower the quality of the main operational path.

## 10/10 Standard

- keyboard parity for all primary table actions
- truthful modal semantics
- comfortable hit areas
- stronger contrast for dense operational controls
- accessibility quality treated as part of premium quality, not separate from it
