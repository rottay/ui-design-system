---
"@rottay/design-system": patch
---

CodeBlock, MarkdownView, SavedViewsMenu and the Record linked value wear the tenant focus signature.

Four families drew keyboard focus as a hand-built ring whose only tenant-driven
part was `--ds-focus-ring-width`, so `states.focus-style` moved its thickness
and never its form. Each focus target now paints `box-shadow: var(--ds-focus-ring)`
with a transparent outline:

- **CodeBlock** — the copy button directly. The scroll region fills a root that
  clips, so its signature rides a `::before` overlay hung from the root (now
  `position: relative`), inset by the signature's own reach. Before, only a
  strip of the region's ring showed, under the header.
- **MarkdownView** — the link, the table wrapper and the default code fence,
  behind the family's raw `--ds-markdown-focus-ring` escape hatch.
- **SavedViewsMenu** — the trigger, the view-select row (was an inset ring),
  the active-card actions and the delete affordance.
- **Record** — the linked value's wrapper (was a solid outline). The field's
  focus-within keyline and border are a container cue and are unchanged.

DECLARED VISUAL CHANGE, measured in Chromium on the real components' markup
with `data-engine="modern"` on `html`, the rottay, bithire and evnto compiled
themes, under `ring`, `underline` and `glow`: each target's computed
`box-shadow` equals the tenant's `--ds-focus-ring`. The 24%/55% primary tints
of the old rings are gone; the ring colour is `--ds-focus-ring-color`.

Forced colors is unchanged on every target (2px `Highlight` outline) except the
CodeBlock scroll region, whose outline moves to `outline-offset: -2px`: at
offset 0 the clipping root cut it on three sides. ListToolbar already wore the
signature and is untouched. No Classic or Rustic file is touched.
