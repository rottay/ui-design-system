---
"@rottay/design-system": major
---

WO-RET-01 (RET-01-BOX-PHYSICAL-TEXT-ALIGN). `BoxProps.textAlign` no longer accepts the physical spellings `'left'` and `'right'`. The prop is typed `BoxTextAlign` (`start | center | end | justify`); the deprecated `LegacyPhysicalBoxTextAlign` type and the `BoxTextAlignInput` union that carried it retire from the package root, together with the internal alias table and normalizer the Modern engine applied. Write `start` for `left` and `end` for `right`.

What renders. On Modern nothing changes for a migrated caller: `left` / `right` were already normalized to `start` / `end` at the style boundary, so `textAlign="start"` emits exactly what `textAlign="left"` emitted. On Classic and Rustic the engines forward the value to `style.textAlign` untouched and never named the physical spellings; `start` / `end` are native CSS and work there unchanged, and no frozen engine file is edited. The plain consequence for those two engines: a consumer that relied on a PHYSICAL edge under a right-to-left reading direction (`left` staying on the left) now gets the logical edge once it migrates to `start`, which is the inline start and sits on the right under RTL. Under LTR the two are the same edge. An untyped caller that still passes `left` / `right` gets the raw CSS value on every engine, Modern included. A physical edge remains reachable on every engine through the style prop: `style={{ textAlign: 'left' }}`.

Census, over `packages/core/src`, `packages/showroom/src` and the `src` roots of app-bithire, app-evnto and app-platform: zero `textAlign="left"` / `textAlign="right"` on any element typed by `BoxProps` (multi-line JSX, ternaries and object-valued props included; the prop is not responsive-typed), zero Box props objects or `createElement(Box, ...)` calls carrying a physical value, and zero imports of either retired type name. The object-literal `textAlign: 'left' | 'right'` occurrences in those trees are CSS style objects, which this change does not touch. The only uses were the four tests that proved the alias (the table's size, the normalizer, and the two Modern alias renders); they retire with it, the logical pass-through and unset tests stay, and a type-level test now asserts that `left` and `right` do not type-check.

The deprecated form dates from 2026-09-17, after the last version bump in this repository (2.19.36, 2026-07-19) and after the 2.19.37 the applications install from the registry (installed files dated 2026-08-09, with no `LegacyPhysicalBoxTextAlign` in their declarations): no release of any kind was cut after it, so the deprecated form never shipped, and no consumer exists to claim a compatibility window.

```contract-diff
export .#LegacyPhysicalBoxTextAlign — removed; the deprecated physical `left | right` alias type, zero consumers; write `start` / `end` (RET-01-BOX-PHYSICAL-TEXT-ALIGN)
export .#BoxTextAlignInput — removed; it was `BoxTextAlign | LegacyPhysicalBoxTextAlign`, use `BoxTextAlign` (RET-01-BOX-PHYSICAL-TEXT-ALIGN)
signature .#BoxProps — member `textAlign` narrows from `BoxTextAlignInput` to `BoxTextAlign`: `left` / `right` are no longer accepted; Modern output unchanged for `start` / `end`, Classic and Rustic forward the value as before (RET-01-BOX-PHYSICAL-TEXT-ALIGN)
```
