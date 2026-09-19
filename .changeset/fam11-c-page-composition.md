---
"@rottay/design-system": minor
---

WO-FAM-11 sub-lot C: the `page-shell`, `page-shell-surface`, `workspace-shell`
and `surface-chrome` cuts — one page-composition doctrine, three chrome
derivers, one paint created from nothing, and five namespace decisions that
MEASURED UNSAFE.

THE SKELETON. `page-shell` carried 29 of the shell cut's 43 hand-made skeleton
constructs: a second render tree of `[data-part='skeleton-*']` blocks in the
engine and 29 geometry rules for them in the skin, including their own ≤640px
reorder. All of it is gone. The engine builds its header chrome once and the
loading branch renders it through `AnatomySkeleton` — the `cockpit-header`
idiom, one directory away — so the wait has the shape of the header the caller
asked for and cannot drift from it. The tier's own contract file said this
family "speaks a second skeleton vocabulary"; it no longer does.

Two parts were renamed to close the same defect at its root rather than
deferring it: `data-part='rule'` → `divider` and `data-part='metadata'` →
`caption`. `SKELETON_PART_ROLES` gives an unknown name the `block` role, so the
bare shell's decorative hairline drew a solid bone and the register line drew a
box where a text line belongs. Both names now resolve to the roles the shared
vocabulary already carries (`omit`, `line`), and this family's
`skeletonPartsWithoutRole` is 0 rather than routed.

THE STATE CONTRACT. The panel, the crumb links and the tabs run
`useInteractionState` and stamp `partAttributes`, so the skin's nine bare
`:hover` / `:active` / `:focus-visible` rules become paired arms of one
decision (`:is([data-state~='hovered'], :hover)`). `unpairedStatePseudoSelectors`
9 → 0.

THE PAINT THAT DID NOT EXIST. `page-shell-surface` had zero skin files anywhere
— the family-cut gate refuses that outright — and one BLOCKING
`style={{ viewTransitionName }}` as its only visual statement. It now stamps
`data-part='body'` under one class vocabulary (`ds-page-shell-surface`) and
`skin/page-shell-surface` states the seam as a channel with its rest declared
on the element, because a `view-transition-name` that resolves to nothing is
invalid at computed value time and the seam would simply disappear. Under
`prefers-reduced-motion: reduce` the body stops being a morph target.

THE PARTICLE FIELD. `workspace-shell` held 21 of the cut's 26 BLOCKING inline
paints and both of its BLOCKING visual literals, all in one decorative feature.
The stacking context, both live canvases' geometry and both mask ramps moved
into `skin/collection-shell`; the two `color-mix()` strings became channels.
The canvas is painted by script off its own computed style, so the structure
names a resolution relay (`--_ds-workspace-shell-particle-*-resolved`) that the
skin resolves from the public channel with the literal rest as the terminal
fallback — a tenant statement reaches the canvas and a canvas with no producer
at all still paints. `data-cra-14-static-fallback`, the last `data-cra-*` in
the package, is retired; the quarantine is carried by the anatomy and the
runtime/state pair that always carried it.

THE THREE DERIVERS. `derivation/chrome/page-shell` (8 channels),
`.../workspace-shell` (5) and `.../surface-chrome` (4). Every produced value is
the single chained fallback its skin reads it with, and each contract suite
pins the two texts equal, so producing a name changes WHO can reach the value
and not what it rests at. The DT registers all three in `derivation/index.ts`.

FIVE NAMESPACE DECISIONS, ALL REFUSED ON MEASUREMENT.

  `--ds-page-header-*` is NOT renamed to the folder name. It is a published
  cross-owner group: `collection-header`'s own deriver states
  `--ds-collection-header-overline-size`, `-overline-tracking`, `-overline-case`
  and both title measures as reads THROUGH it, `skin/detail-header`,
  `skin/edit-fields` and `skin/card-compounds` read its case channel, and all
  three first-party artifacts compile it.

  Four names of that group are not produced either, because each has a SECOND
  correct rest: `-eyebrow-size` (10px here, `--ds-font-size-xs` there),
  `-eyebrow-tracking` (0.11em / 0.13em), `-title-max-width` (32ch / 35rem and
  42.5rem) and `-subtitle-max-width` (72ch / 45rem). Producing either rest
  silently repaints the other family. `--ds-page-header-bg` is not produced for
  a different measured reason: the expressive `contour` motif already authors
  it at `profile` rank, and `derived` outranks `profile`.

  `--ds-workspace-shell-bg` / `-border` / `-overlay` / `-shadow` are not
  produced. `:where(.ds-workspace-frame)` paints its own ground, frame,
  elevation and wash from the same four names at different rests — an
  unresolved background, `--ds-color-border`, `--ds-card-shadow` — so a derived
  value would repaint `feature-workspace-frame` with this shell's atmosphere.

  `ds-collection-shell` and `ds-section-card` keep their names. The first is
  compounded on by `skin/collection-workspace` and asserted into the published
  artifact by `scripts/package/public-api/barrel`; the second is GENERATED by
  the governed section-card recipe, which is public API with a
  `--ds-section-card-` manifest prefix. The roster's `skins` pins carry the
  difference instead.

  `--ds-workspace-card-icon-bg` / `-border` / `-color` are routed, not
  produced. `cockpit-header`, `workbench-header`, `page-shell` and
  `surface-chrome` read the same three names with the same fallbacks for the
  same identity tile: a tenant that states one expects every tile to follow.

THE EVIDENCE. Four cut suites own the anatomy, the state contract, the drain
and the refusals; three causality suites in Chromium prove each `consumes`
plane moves the family's own computed paint against a literal control that
holds — shape and surfaces on the page panel and its tile, palette on the
workspace atmosphere, density on the section card's rooms and its tab label.
`palette.*` and `motion` left `page-shell`'s `consumes` because the probes
measured that neither reaches a channel its deriver states; `shape.*` left
`surface-chrome`'s for the same reason. A/B of the three derivers against the
whole roster measured ZERO movement in any other family.

MEASURED. `page-shell` `readWithoutProducer` 17 → 8, `unpairedStatePseudoSelectors`
9 → 0, hand-made skeletons 29 → 0, roleless parts 2 → 0.
`workspace-shell` inline paints 21 → 0, visual literals 2 → 0.
`surface-chrome` `readWithoutProducer` 6 → 3, inline paints 3 → 0,
`partsConsumedNotStamped` 2 → 0. `page-shell-surface` enters the roster with a
skin for the first time: 1 class vocabulary, 0 legacy classes, 0 unproduced
reads, 12 executable accessibility assertions.

OWED TO THE DT, NOT FIXED HERE. Three registration lines in
`derivation/index.ts`; one `@import` of `skin/page-shell-surface/index.css` in
`facade/entrypoints/base/index.css` (layer `rottay-structures`), without which
the new paint is not in the bundle; the four roster re-pins and the
`page-shell-surface` admission; and two `SKELETON_PART_ROLES` entries —
`particle-field-static-fallback` and `header-actions` — which are the shared
renderer's singleton vocabulary and are shared with `notification-center`,
so they are adjudicated once per name rather than per family.
