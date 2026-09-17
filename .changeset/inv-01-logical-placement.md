---
"@rottay/design-system": minor
---

WO-INV-01, placement vocabulary. The overlay placement API is logical end to
end in Modern: `OverlayPlacement`'s inline sides are `inline-start` and
`inline-end` (the block axis keeps `top`/`bottom`, which no reading direction
moves), the `position-area` lowering emits the `self-*` logical family
(`self-inline-start span-self-block-end`), the anchor-facing gap is
`marginInlineStart`/`marginInlineEnd`/`marginBlockStart`/`marginBlockEnd`, the
flip chain follows the logical side, and the measured branch resolves the side
against the direction the REQUEST carries instead of assuming a physical edge.

`self-*` rather than the plain logical keywords is measured, not preferred: a
plain `inline-start` resolves against the containing block -- for a top-layer
overlay, the root element -- while the offset margin resolves against the
overlay's own writing mode, so with `dir="rtl"` on a wrapper the two disagreed
and the gap landed on the far side. Verified in Chromium 1228.

ONE DIRECTION PER REQUEST. The two branches read direction from different
places by construction. `anchor-css` lowers to `self-*`, which CSS resolves
against the OVERLAY element's own writing mode -- the `dir` its anchor subtree
declares -- and never asks anybody. `js` has to resolve the logical side into
viewport coordinates itself, and it asked the app locale. Those are two
different questions, and a tree can answer them differently: an anchor inside a
bare `dir="rtl"` under an `en` locale, or a nested `I18nProvider` that flips
the context while nothing in the ancestry declares `dir`. For ONE request in
ONE such tree the two branches painted on OPPOSITE physical sides, and the
measured branch then stamped `data-preferred-placement` and
`data-collision-adjusted` against a direction its own paint had not used --
naming a side it had not taken and reporting an adjustment nothing had forced.
`OverlayPositionRequest` therefore carries an optional `direction`, defaulting
to `useOptionalDirection()` so no existing caller changes; `useFieldOverlay`
forwards it; and Tooltip, Popover and HoverCard pass the direction they already
resolve for their anchor -- for the two portalled panels that is the anchor
context read their `direction-authority` exception declares authoritative, and
for HoverCard, which has no such reader, it is the locale, now also stamped as
`dir` on the surface so the `anchor-css` branch resolves `self-*` against the
same answer. Popconfirm, whose panel stays in-tree in both branches, gained the
same reader: it resolves its anchor's direction through the shared
`readLocaleContext`, passes it as the request's `direction`, mirrors its own
block-axis alignment against it and stamps `dir` on the surface. Placement,
paint and every stamped attribute are computed against that one direction in
both branches, for Tooltip, Popover, HoverCard and Popconfirm alike.

What this does NOT claim: one request does not mean the same thing in two trees
whose anchors declare different reading directions. It is not supposed to. The
anchor's direction is the authority, and reproducing it is exactly what a panel
rendered outside the anchor's subtree owes.

Tooltip moved with it: `TooltipPlacement`'s inline sides are
`inline-start`/`inline-end`, the prop is normalized once at the engine
boundary, the placement it resolves from geometry is read back in the logical
vocabulary, and the physical spelling appears only at the stamp. The stamped
placement channels, by name:

- **Tooltip `data-placement`** -- the RESOLVED side, lowered to the physical
  spelling its skin selects on (`[data-placement^='left']`).
- **Tooltip `data-preferred-placement`** -- was the raw prop; is now the
  REQUESTED side lowered the same way, so the two attributes are comparable and
  both name the direction the bubble was actually placed in.
- **Tooltip `data-collision-adjusted`** -- compares two LOGICAL placements
  resolved in the same direction as the paint. A bubble that merely mirrored
  reports no collision; the flag now fires only when geometry moved it.
- **Popover** follows the same rule, so the two engines agree:
  `data-placement` is the resolved side lowered to the physical spelling, and
  `data-preferred-placement` was the antd-shaped prop (`leftTop`) and is now
  the requested overlay side lowered the same way (`left-start` / `right-start`
  under RTL). `data-collision-adjusted` compares logical placements.

The Slider's vertical value readout moved with the vocabulary: its
`tooltip.placement` takes `inline-start`/`inline-end`, its anchor is
`insetInlineStart`, and the Modern skin mirrors the placement transforms under
`:dir(rtl)`.

The four Modern skins that consume the placement channel were migrated with it
(`skin/{tooltip,popover,hover-card,dropdown}/index.css`). The stamp the engines
emit is PHYSICAL, so the declarations that answer it are physical too: a
logical `inset-inline-*` or `border-inline-*` mirrors under RTL while
`[data-placement^='left']` does not. That mismatch was a live, pre-existing
defect -- under RTL the Tooltip and Popover arrow tip landed on the edge facing
AWAY from the anchor, and the Tooltip, Popover and Dropdown arrows hid the
wrong two facets of the rotated square, so the tip pointed sideways. The arrow
edge and the hidden facets are now spelled physically; the block-axis insets,
which no reading direction moves, stay logical, and the `-start`/`-end`
ALIGNMENT vocabulary is untouched by owner ruling. HoverCard needed no change:
it has no arrow and its `transform-origin` was already physical.

The physical spellings are kept as documented, deprecated aliases -- `left` ->
`inline-start`, `right` -> `inline-end`, and their aligned forms -- normalized
at the positioning owner, so existing callers and the frozen Classic/Rustic
engines build unchanged.

What DOES change is behaviour under `dir="rtl"`: an alias now mirrors instead
of pinning to the physical edge its name used to promise. These are the live
Modern consumers whose physical placement names now mirror, re-derived by
grep:

- **Tooltip** (Modern) -- `placement="left"`/`"right"` and their aligned forms
  mirror; an RTL tooltip that asked for `left` stamps `data-placement="right"`.
- **Popover** (Modern) -- the antd-shaped `left`/`leftTop`/`leftBottom`/
  `right`/`rightTop`/`rightBottom` family maps onto the logical sides through
  `POPOVER_TO_OVERLAY_PLACEMENT`; the public prop NAMES are unchanged.
- **Popconfirm** (Modern) -- the same family through
  `POPCONFIRM_TO_OVERLAY_PLACEMENT`; it stamps no `data-placement`.
- **HoverCard** (Modern) -- `side="left"`/`"right"` mirror; the surface lowers
  the resolved side for `data-placement`.
- **HoverCard** (Rustic, frozen) -- reaches the alias through the shared
  `resolveOverlayPlacement`. The Rustic dropdown uses `top`/`bottom` only and
  is unaffected.
- **Popover** (Rustic, frozen) -- passes the now-logical
  `POPOVER_TO_OVERLAY_PLACEMENT` map (`popover/engines/rustic/index.tsx:140`),
  so its physical alias names mirror with it.
- **Popconfirm** (Rustic, frozen) -- the same, through
  `POPCONFIRM_TO_OVERLAY_PLACEMENT`
  (`popconfirm/engines/rustic/index.tsx:131`).
- **Modern Dropdown** is NOT in this list: its `bottomLeft`/`bottomRight`
  vocabulary was already logical (`*Left` = the reading-start edge) and its
  skin already keyed on `inset-inline-*`. Only its arrow facets moved.

In-package call sites that pass a physical alias are the three story files
(`Tooltip.stories`, `Popover.stories`, `Popconfirm.stories`). `Drawer`'s and
`Sheet`'s `placement`/`side` are viewport surfaces, not overlay placement, and
do not go through this owner.

A caller that truly wanted a physical edge in both directions no longer has a
spelling for it; that request was never expressible as a placement and is a
layout decision, not an overlay one.

Evidence: `OverlayPositioning.test.tsx` (unit, happy-dom: the alias map, the
lowering table and the measured mirror), `Slider.mark-label-direction.test.tsx`
(unit, happy-dom: the derived cascade), `Tooltip.modern.test.tsx` (unit,
happy-dom: both spellings under an `ar` locale, the lowered attribute and the
absent collision flag) and
`OverlayPlacement.browser-geometry.integration.test.ts` (the `integration`
vitest project, but measured in real Chromium via `--dump-dom`: a Modern
popover, a Modern tooltip and both slider readouts under `dir=ltr` and
`dir=rtl`, plus the two NON-UNIFORM-direction scenes -- a contradicting `dir`
wrapper and a nested locale provider -- each measured twice, plain for the
`anchor-css` branch and under `OverlayPortalBoundary` for the `js` branch,
asserting both branches take the same physical side, report no collision, name
the side they painted, and keep the arrow on the anchor-facing edge, plus the
same contradicting-`dir` scene measured through the Popconfirm contract, which
carries no arrow and stamps no placement channel and so owes the physical side
and an honest collision flag).

The physical-properties gate's two debt pins for
`primitives/runtime/overlay/positioning/index.tsx` (2 sites) and
`primitives/inputs/slider/engines/modern/index.tsx` (1 site) are removed,
drained rather than exempted.

```contract-diff
export .#HoverCardSide — changed; adds the logical sides `inline-start`/`inline-end`, keeps `left`/`right` as deprecated aliases of them
export .#TooltipPlacement — changed; adds the logical sides `inline-start`/`inline-end` and their aligned forms, keeps `left`/`right` and theirs as deprecated aliases
export .#SliderProps — changed; `tooltip.placement` adds `inline-start`/`inline-end`, keeps `left`/`right` as deprecated aliases of them
```
