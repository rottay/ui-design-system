# Premium Customization and Appearance

## The Most Important Truth

Today, the most live premium customization source is still `brandTheme`.

`appearance` is now partially real and materially better than before, but it is not yet the single premium truth across:

- runtime
- static generation
- previews
- DB authoring
- app adapters

## Live Today

### Strong and real

- `brandTheme` compiler pipeline
- palette/chrome/personality outputs from `brandTheme`
- `appearance.general` fields that now reach runtime provider behavior
- a narrowed `appearance.advanced` subset

### Files

- `ui-design-system/packages/core/src/infrastructure/compilers/kernel/runtime/brand-theme/index.ts`
- `ui-design-system/packages/core/src/infrastructure/compilers/runtime/appearance/index.ts`
- `ui-design-system/packages/core/src/infrastructure/compilers/runtime/appearance/tests/appearance-runtime.test.tsx`
- `ui-design-system/packages/core/src/infrastructure/runtime/bootstrap/composition/react/provider/index.tsx`
- `ui-design-system/packages/core/src/infrastructure/runtime/theming/composition/react/provider/index.tsx`

## Still Partial

### `brandThemeId`

Declared, not truly resolved/consumed end to end.

### `appearance` in the static path

Still not at parity in:

- `ui-design-system/packages/core/src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts`
- `ui-design-system/packages/core/src/ui/patterns/misc/tenant-preview/engines/modern/index.tsx`

### `useTokens()` visibility of appearance

`useTokens()` only consumes part of `appearance` directly. The broader appearance effect is still heavily CSS-var/provider mediated.

### Dynamic premium parity for non-bundled tenants

For DB-backed non-bundled tenants, runtime parity is still partial because the app path is legacy and the CSS loading story is not fully symmetrical.

## Scorecard

| Sub-area | Score | Notes |
|---|---:|---|
| `brandTheme` compiler depth | 9 | strongest premium pipeline in the repo |
| Declared-vs-live honesty of `appearance` | 6 | far better than before, still incomplete |
| Runtime merge coherence | 6 | strong but not yet universal |
| DB tenant readiness | 4 | still legacy and partial |
| Modern leverage of premium vars | 7 | good in high-value shells and controls |

## Recommendation

### For bundled first-party verticals

Use:

- `brandTheme`
- product profile
- bundled CSS artifacts

### For DB tenants v1

Use:

- `branding`
- `appearance.general`
- optionally a very bounded `appearance.advanced`

### For DB tenants premium v2

Only then consider:

- `brandTheme`
- `brandThemeId`
- richer advanced chrome

## Required Cleanup

1. static generator parity for `appearance`
2. authoring/UI parity in app-platform
3. either implement or remove `brandThemeId`
4. document clearly that `brandTheme` remains the premium truth for first-party bundled tenants
