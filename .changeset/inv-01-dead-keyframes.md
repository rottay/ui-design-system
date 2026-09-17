---
"@rottay/design-system": patch
---

WO-INV-01. Nine `@keyframes` steps that no rule anywhere animated with are
removed from the shipped stylesheets, and the two physical-css debt rows that
had pinned them as dead code drain with them (debt 102 -> 92).

Removed from `foundation/animations/keyframes/index.css` (7 keyframes,
8 pinned sites): `ds-foundation-fade-in-left`, `ds-foundation-fade-in-right`,
`ds-foundation-slide-in-left`, `ds-foundation-slide-in-right`,
`ds-foundation-slide-out-left`, `ds-foundation-slide-out-right` and
`ds-foundation-shake`. Removed from
`runtime/engines/modern/skin/list-toolbar/index.css` (2 pinned sites):
`ds-list-toolbar-sheen`. `ds-foundation-shake-vertical` is kept — it travels on
`translateY` and was never a site.

The names left `dist/styles.css`, so this is a published change: a consumer that
named one of them from its own `animation` shorthand loses the frames. None did.
The census resolved `animation`/`animation-name` across the whole CSS corpus,
`src` TSX/TS and style objects, the motion recipes under `foundation/behavior`
and `infrastructure/runtime/motion`, tests, stories, `packages/showroom/src`,
`docs/**`, `src/entrypoints/**`, `contracts/runtime/suppliers/index.json` and
the three app repositories read-only; every one of the nine steps had zero
consumers everywhere. `ds-list-toolbar-sheen` additionally leaves its opt-in
channel intact: `--ds-toolbar-sheen-animation` (default `none`) and the resting
`::before` sheen with its `[dir='rtl']` translate mirror are untouched, so a
tenant that supplies its own animation is unaffected.

Not removed: the four `toast-slide-{in,out}-{left,right}` steps in
`presentation/components/skin/toast-animation-keyframes/index.css`. They have no
consumer inside the CSS corpus, but their consumer is the toast runtime
(`primitives/feedback/toast/runtime/animation`), whose `getAnimationName()` maps
a `ToastPosition` onto the keyframe name and writes it into an inline
`animation` shorthand — the names are a public JS handle. Their physical-css row
keeps its pin and now names that consumer instead of implying dead code.
