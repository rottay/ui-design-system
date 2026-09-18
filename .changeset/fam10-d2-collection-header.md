---
"@rottay/design-system": minor
---

WO-FAM-10 sub-lot D2: the collection-header family cut — chrome deriver,
drained Modern skin, drained runtime, and the shared anatomy renderer for the
loading state, at the same resting paint everywhere except where the Button
contract already owned the value (stated below).

ONE NEW CHROME DERIVER. `derivation/chrome/collection-header` (rank `derived`)
produces 82 `--ds-collection-header-*` channels at exactly the fallbacks the
Modern skin reads: the hero card's ground gradient, border, radius, resting and
hover elevation, sheen opacity/duration and the opt-in cluster glass (ten names
the skin read and nobody wrote — a channel that looked customizable and was
not); the overline/chip/keycap material rungs and the two title measures
(respelled from family-private `--_ds-collection-header-*` into the family
namespace at byte-identical values — a leading underscore puts a channel
outside every producer census and outside the tenant's reach at once); and the
geometry the component used to paint inline — the root's posture padding
(default / editorial-compact / embedded / minimal), the identity grid gap, the
subtitle type ladder and row rhythm, the quick-actions cluster gaps, the rail's
trailing rhythm and the dotted title's three `-webkit-text-stroke` rungs. The
deriver is written and tested but NOT registered: the DT adds the
`FAMILY_DERIVERS` line at integration, and until then the productive compile
does not emit these channels (the contract test asserts identity, rank,
produces/derive parity, the single-fallback parity per channel, the one
-namespace rule and the precedence yield, without asserting registry
membership).

104 INLINE PAINTS DRAINED TO ZERO. The family's source carried 104
`style={{ }}` violations — root/identity/rail box models, the subtitle and
eyebrow type ladders, the quick-action button overrides, and the dotted title's
`-webkit-*` glyph-clip paint. Geometry and paint now live in the skin keyed on
the stamped attributes (`data-embedded` / `data-compact` / `data-minimal` /
`data-editorial-tech` / `data-title-treatment` / `data-subtitle-treatment` /
`data-tone`); the eyebrow and subtitle converted from composed `Text` to
skin-owned `Box` spans (the title was already a Box), which is what lets their
whole type ladder leave the TSX — a font declaration on a composed Text would
be inert under the later `rottay-engines` typography layer. The family's own
subtree renders zero inline style attributes; the only inline values anywhere
are the composed primitives' own `--ds-*` channels.

CONSUMER-VISIBLE CHANGES, stated rather than implied:

- Quick-action buttons follow the composed Button contract instead of the
  retired inline overrides: `size="sm"` now renders at the Button's own floor
  (36px default / 44px under `(hover: none), (pointer: coarse)`, which the
  Button skin already enforced) with the Button's sm type (13px / 10px
  padding-x), where the inline copy painted 32px / 12px / 12px. The
  coarse-pointer floor the inline style also fired on the responsive
  provider's touch-device class alone is now the Button's media rule only.
- The loading skeleton is the shared `AnatomySkeleton` built from the family's
  real stamped parts (bones follow the actual boxes, including the Button
  heights above) instead of five hand-made `data-block` rectangles; the root
  keeps the single announcement (`role="status"` + `aria-busy` + the loading
  label) and the loading footprint now equals the loaded footprint at the same
  props (the retired hand-made branch ignored the editorial/compact padding).
- The editorial subtitle wrapper now stamps `data-part="subtitle-row"`
  `data-variant="editorial-tech"` (it was anonymous), and the root additionally
  stamps `data-editorial-tech`. The eyebrow/subtitle spans no longer carry the
  typography engine's `data-size`/`data-color` attributes.
- Hover/press on the root card and the quick-actions pill are decided by the
  shared interaction kernel and read off `data-state`, paired with the platform
  pseudo as one `:is()` rule each.

ROUTED, NOT OWNED: twelve channels the skin still read with no producer are
cross-lot residue, named for their owners — the eight `--ds-kbd-*` key-cap
material names (kbd owner) and the four `--ds-page-header-*` group-recipe names
(page-header owner; the type profile drives them). Producing them here would be
a second authority on another family's namespace.

`readWithoutProducer` falls 22 → 12 on this family's row (the ten own-
namespace names now have a producer), `inlineStyleViolations` 104 → 0,
`skeletonHandMade` 10 → 0, `partsStampedNotConsumed` 3 → 0 and
`unpairedStatePseudoSelectors` 4 → 0; the pins are re-measured by the DT at
integration.
