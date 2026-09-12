---
"@rottay/design-system": minor
---

WO-INV-05 (audit F-31, F-114). Motion invariant: one vocabulary, one icon size
scale, reduced motion universal.

**The defect.** `no-motion-literals` saw `cubic-bezier()` and sub-second
durations but not the CSS easing keywords, so `Aurora` and `GridPattern` animated
on a hard-coded `ease-in-out` and `GradientBackground`/`GlowEffect` on Motion's
`linear`/`easeInOut`, none of which followed the tenant's `motion.character`.
The icon token sheet declared its transition as `0.2s ease-in-out`, and the icon
size scale lived in the stylesheet and in three TypeScript copies with two
different fallback units. The view-transition recipes all travelled on
`--ds-motion-ease-out`, which the character does not own, and the page-root
crossfade escaped the reduced-motion media query because a `*` argument carries
no specificity against `::view-transition-old(root)`.

**What replaces it.** The rule also reports `ease`, `ease-in`, `ease-out`,
`ease-in-out`, `step-start`, `step-end` and `steps()` inside a
`transition`/`animation` value in `engines/modern/**` and `graphics/motion/**`;
`linear` stays legal for constant-velocity loops. The ambient effects read
`--ds-motion-ease-in-out`. The icon transition resolves on
`--ds-motion-normal`/`--ds-motion-ease-in-out`. `ICON_SIZE_MAP` is the one scale
every icon runtime resolves a named size through, with a rem fallback that
mirrors the icon sheet. List -> record morphs, modal promote and panel groups
travel on `--ds-motion-ease-move`, entering content on `--ds-motion-ease-enter`
and leaving content on `--ds-motion-ease-exit`, so each character gives them its
own curve and travel; the root pair is neutralized by name under reduced motion.
The undo-toast countdown holds full under reduced motion instead of collapsing
to empty.

```contract-diff
export ./eslint#rules — changed; `no-motion-literals` also reports keyword easing in motion values
export ./icons#ICON_SIZE_MAP — changed; values carry a rem fallback (`var(--ds-icon-md-size, 1.25rem)`)
```
