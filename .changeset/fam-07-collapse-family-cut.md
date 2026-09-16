---
"@rottay/design-system": minor
---

WO-FAM-07 / L7: the `Collapse` family gets one paint owner, and its Modern path
gets tokens of its own.

Modern Collapse was painted from four places at once. The engine wrote seven
inline `style` objects and injected a `<style>` tag once per mounted Collapse;
`engines/modern/theme/index.css` kept a second "bridge" block; and the skin read
a token recipe shared with the frozen Classic path. The cut leaves one: the
modern skin, keyed on the `data-part` / `data-expanded` / `data-state` anatomy
the engine stamps.

What that repaired, each measured rather than asserted:

- **Dark mode.** Three declarations reaching Modern were fixed light values
  while everything around them flipped with the mode: the panel surface and the
  content surface resolved to `--ds-color-white`, and the theme bridge painted
  the content track `#ffffff` outright. An expanded header's label was
  `--ds-color-primary-600`, which on a monochrome brand is near-black, over a
  header ground that DOES flip — 1.05:1 in a real browser. All three now ride
  mode-aware channels the family's deriver mints, and the family carries no
  serious axe finding in any first-party scope beyond a harness-ground defect a
  bare `<p>` reproduces with no Collapse in the tree.
- **The rhythm decision reaches the family for the first time**, and density
  stops being counted twice. The padding rungs multiplied `--ds-spacing-N` by
  `--ds-density-effective-scale`, but the ramp already carries density
  (11.25px → 12.9375px under `density.mode: spacious`, measured) and carries no
  rhythm at all. One factor each, applied once.
- **The motion dial reaches it too.** The reveal, the header state change and
  the arrow turn read `--ds-collapse-{reveal,state,arrow}-motion-*` off the
  semantic motion ramp. `--ds-collapse-transition-duration` is the frozen
  Classic path's channel, pinned at a literal `0.2s`, and re-pointing it would
  have moved Classic's paint.
- **Hover, press and the focus ring come from the shared interaction-state
  kernel** and are stamped as `data-state`, so the skin decides each state once
  (`:is([data-state~='hovered'], :hover)`) instead of a second time in a bare
  pseudo-class.

The Classic path is untouched. Its stylesheet moved from
`runtime/bridges/collapse/` to `runtime/engines/classic/skin/collapse/` —
byte-identical, because a bridge is not a third authority beside the engine
that stamps its classes, and only Classic stamps `.ds-collapse*`. The address
raises its cascade layer from `rottay-components` to `rottay-engines`; every
non-custom computed property of 19 nodes of the Classic anatomy, plus a really
hovered header, is identical in both layers across all three first-party
verticals.

For a consumer: `Collapse`'s props, exports and classes are unchanged. The
modern engine no longer writes an inline `style` on the content track or
injects a `<style>` element, so a test that read the reveal off either of those
reads `data-expanded` instead. A Modern Collapse in a dark theme now shows the
tenant's card surface where it used to show white.
