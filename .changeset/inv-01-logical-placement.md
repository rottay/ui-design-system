---
"@rottay/design-system": major
---

WO-INV-01, placement vocabulary. The overlay placement API is logical on the
Modern path: `OverlayPlacement`'s inline sides are `inline-start` and
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

## The frozen boundary

THE LOGICAL VOCABULARY IS RESOLVED ON THE MODERN PATH AND NOWHERE ELSE.
`OverlayPositionRequest.inlineSides` says how the shared runtime resolves an
inline side, and it defaults to `'physical'`: `inline-start` takes the LEFT edge
and `inline-end` the RIGHT one, in both reading directions, which is what every
adopter written before this vocabulary asked for and got. `'logical'` resolves
the side against the request's direction and therefore mirrors under RTL.

It is declared in exactly one place: `runtime/overlay/field-overlay`, the only
door a Modern engine reaches the positioning runtime through. The frozen
Classic and Rustic engines call `useOverlayPosition` themselves, declare
nothing, and keep the geometry they have always painted -- `anchor-css` lowers
their requests to the physical `position-area` family (`left`,
`left span-bottom`) with physical offset margins, and the measured branch
resolves the same physical edge, identically under `dir=ltr` and `dir=rtl`. No
frozen file is edited and no frozen paint moves.

The first version of this lot got that wrong: it normalized the physical
spellings to logical INSIDE the shared runtime, and the frozen Rustic HoverCard,
Popover and Popconfirm read the same maps, so their established physical
placements began mirroring under RTL. That was a behaviour change to frozen
engines, made through shared code rather than through their directories, and it
is what the boundary above exists to prevent. Found by the 2026-09-17
independent audit (R17-03).

## One direction per request

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
both branches, for Tooltip, Popover, HoverCard and Popconfirm alike. Under the
physical default the direction decides nothing: a physical side names its own
edge without asking anybody.

What this does NOT claim: one request does not mean the same thing in two trees
whose anchors declare different reading directions. It is not supposed to. The
anchor's direction is the authority, and reproducing it is exactly what a panel
rendered outside the anchor's subtree owes.

## Tooltip

Tooltip moved with it on its Modern engine: `TooltipPlacement`'s inline sides
are `inline-start`/`inline-end`, the prop is normalized once at the Modern
engine boundary, the placement it resolves from geometry is read back in the
logical vocabulary, and the physical spelling appears only at the stamp. The
stamped placement channels, by name:

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

TOOLTIP'S LOGICAL SIDES ARE MODERN-ONLY, AND THAT IS A LIMITATION, NOT A
CAPABILITY. The frozen Classic and Rustic engines read the raw prop through a
physical placement map. The physical spellings keep their edge in both reading
directions; the six logical spellings are not rows in that map and resolve to
`top` -- deterministically, for every one of them, never guessing an inline
edge and never mirroring. That fallback is a documented refusal and it is now
test-pinned per spelling per engine, so it cannot drift into a
half-implementation and cannot be read as cross-engine support. Target the
frozen engines with a physical spelling until they are unfrozen.

## Slider and skins

The Slider's vertical value readout moved with the vocabulary: its
`tooltip.placement` takes `inline-start`/`inline-end`, its anchor is
`insetInlineStart`, and the Modern skin mirrors the placement transforms under
`:dir(rtl)`. It resolves the vocabulary inside its own Modern engine and never
reaches the shared positioning runtime, and no frozen Slider engine reads
`tooltip.placement` at all.

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

## What changes for callers

The physical spellings are kept as documented, deprecated aliases -- `left` ->
`inline-start`, `right` -> `inline-end`, and their aligned forms -- rewritten
to the logical NAME at the positioning owner. That rewrite is a spelling
change and decides no geometry; `inlineSides` does.

WHAT DOES CHANGE is behaviour under `dir="rtl"` ON THE MODERN ENGINE: an alias
mirrors there instead of pinning to the physical edge its name used to promise.
This is the breaking change in this release. The live Modern consumers, re-derived
by grep:

- **Tooltip** (Modern) -- `placement="left"`/`"right"` and their aligned forms
  mirror; an RTL tooltip that asked for `left` stamps `data-placement="right"`.
- **Popover** (Modern) -- the antd-shaped `left`/`leftTop`/`leftBottom`/
  `right`/`rightTop`/`rightBottom` family maps onto the logical sides through
  `POPOVER_TO_OVERLAY_PLACEMENT`; the public prop NAMES are unchanged.
- **Popconfirm** (Modern) -- the same family through
  `POPCONFIRM_TO_OVERLAY_PLACEMENT`; it stamps no `data-placement`.
- **HoverCard** (Modern) -- `side="left"`/`"right"` mirror; the surface lowers
  the resolved side for `data-placement`.
- **Slider** (Modern) -- `tooltip.placement` `left`/`right` mirror.
- **Modern Dropdown** is NOT in this list: its `bottomLeft`/`bottomRight`
  vocabulary was already logical (`*Left` = the reading-start edge) and its
  skin already keyed on `inset-inline-*`. Only its arrow facets moved.

The FROZEN engines are not in this list and there is nothing to migrate in
them. Rustic HoverCard, Popover and Popconfirm reach the shared runtime and
take its physical default; Classic and Rustic Tooltip never reach it at all;
the Rustic dropdown, context menu and tour place on the block axis only. Every
one of them resolves `left`/`right` on the edge it names, in both reading
directions, under both positioning strategies, exactly as before this lot.

In-package call sites that pass a physical alias are the three story files
(`Tooltip.stories`, `Popover.stories`, `Popconfirm.stories`). `Drawer`'s and
`Sheet`'s `placement`/`side` are viewport surfaces, not overlay placement, and
do not go through this owner.

A Modern caller that truly wants a physical edge in both directions no longer
has a spelling for it; that request was never expressible as a placement and is
a layout decision, not an overlay one.

## Evidence

`OverlayPositioning.test.tsx` (unit, happy-dom: the alias map, both lowering
tables, the physical default in LTR and RTL, the declared logical mirror, and
the margin/area keyword-family pairing), `OverlayPlacement.frozen-boundary` --
`primitives/overlay/tests/FrozenPlacementBoundary.contract.test.tsx` (unit,
happy-dom: that Rustic HoverCard, Popover and Popconfirm declare no resolution
while the Modern door declares `'logical'`, and that their exact requests land
on the pre-migration physical edge in both directions and both strategies),
`Tooltip.frozen-placement-reach.test.tsx` (unit, happy-dom: the closed physical
map, the physical spellings' unchanged edges and the per-spelling `top` refusal
in Classic and Rustic), `Slider.mark-label-direction.test.tsx` (unit,
happy-dom: the derived cascade), `Tooltip.modern.test.tsx` (unit, happy-dom:
both spellings under an `ar` locale, the lowered attribute and the absent
collision flag) and `OverlayPlacement.browser-geometry.integration.test.ts`
(the `integration` vitest project, but measured in real Chromium via
`--dump-dom`: a Modern popover, a Modern tooltip and both slider readouts under
`dir=ltr` and `dir=rtl`, plus the two NON-UNIFORM-direction scenes -- a
contradicting `dir` wrapper and a nested locale provider -- each measured
twice, plain for the `anchor-css` branch and under `OverlayPortalBoundary` for
the `js` branch, asserting both branches take the same physical side, report no
collision, name the side they painted, and keep the arrow on the anchor-facing
edge, plus the same contradicting-`dir` scene measured through the Popconfirm
contract, which carries no arrow and stamps no placement channel and so owes
the physical side and an honest collision flag).

The two mutations the boundary is proved against: defaulting the runtime to
`'logical'` reddens 11 assertions across the two unit suites, and dropping the
declaration at the Modern door reddens the door pin.

## Physical-properties ledger

The slider's debt pin (`primitives/inputs/slider/engines/modern/index.tsx`, 1
site) is drained. The positioning owner's two are NOT: under the physical
resolution `offsetMargins` emits `marginRight`/`marginLeft`, because a logical
margin beside a physical `position-area: left` resolves in the overlay's own
writing mode and puts the gap on the far side under RTL. Those two sites are
the gate's own PHYSICAL PLACEMENT VOCABULARY class -- a site whose paired
placement keywords are physical by contract, where the logical spelling is the
bug -- and they belong in `namedExceptions`, not in `pinnedDebt`. The baseline
is outside this lot's write set; the rows are owed with it.

```contract-diff
export .#HoverCardSide — changed; adds the logical sides `inline-start`/`inline-end`, keeps `left`/`right` as deprecated aliases of them; the logical sides are honoured by the Modern engine only
export .#TooltipPlacement — changed; adds the logical sides `inline-start`/`inline-end` and their aligned forms, keeps `left`/`right` and theirs as deprecated aliases; the logical sides are honoured by the Modern engine only and the frozen engines refuse them to `top`
export .#SliderProps — changed; `tooltip.placement` adds `inline-start`/`inline-end`, keeps `left`/`right` as deprecated aliases of them
```
