---
"@rottay/design-system": minor
---

States literal-state-paint wiring lot (WO-EVI-02 states axis): the slider's
disabled muting, the four dashboard activity strips, the collection-workspace
render-dispatch fallback link and the form/edit header back chips now carry the
interaction-state stamp, so their focus-visible rings paint from the tenant's
`states.focus-style` decision instead of `:focus-visible` alone; the four
duplicated view-all anchor copies collapse into one stamped `NavLinkAnchor`
owner. Two declared ring changes ship as such: `--ds-tag-close-focus-ring` and
the new `:root` default `--ds-filter-pill-focus-ring` resolve
`var(--ds-focus-ring, …)` (a tenant's `chrome.filterPill.focusRing` still
overrides the default). Byte-equal at rest and under hover/press/selected/
disabled in all three verticals and both modes; the only repaints are the two
named focus-ring channels and the rings the stamp newly reaches.

Additive contract event: `NavigationLinkProps` admits optional interaction-stamp
props so an injected host `Link` can forward the kernel stamp to the anchor it
renders; every field is optional, and a host `Link` that drops them still gets
the pseudo-class arm in the same rule.

```contract-diff
export .#NavigationLinkProps — changed; additive optional interaction-stamp fields (`data-state` plus pointer/focus/keyboard handlers), no existing field altered
export .#NavigationLinkInteractionStamp — added; the pick type naming the stamp fields a host Link may forward
```
