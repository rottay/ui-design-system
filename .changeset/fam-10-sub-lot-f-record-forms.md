---
"@rottay/design-system": patch
---

WO-FAM-10 sub-lot F: the record family (one family — panel, action-bar,
field-grid, field, summary-strip), form-sections, edit-fields and the four
form surfaces (form, wizard, detail-form, guided-draft-form) on the ledger
doctrine: the record blocks, the section containers and the surfaces paint one
page rhythm — ruled sections on a flat canvas, hairline seams, recessed
surfaces, no nested card stacks.

SIX NEW CHROME DERIVERS, each owning its family's namespace at the resting
values its skins already read, none registered yet (registration is
DT-serialized): `derivation/chrome/record`
(`--ds-record-heading-font-size`, the one name the record skin read with no
producer), `derivation/chrome/form-sections`
(`--ds-form-sections-facts-title-font-size`; the eleven per-tone
`--ds-form-sections-*` names stay the skin's authored declarations — a second
producer would be a second authority), `derivation/chrome/form-surface`
(`--ds-form-action-dock-reserved-space` plus the drained actions gap,
description margin and error-banner padding), `derivation/chrome/wizard-surface`
and `derivation/chrome/detail-form-surface` (the drained description margins
and error-banner padding), and `derivation/chrome/guided-draft-form`
(`--ds-guided-draft-form-heading-font-weight`, the one legal runtime inline
channel through which the profile heading-weight bias stays reachable).
edit-fields holds no deriver by measurement: its two grid channels become the
skin's authored defaults (an authored declaration is the producer) and its
other drains are enum-keyed skin arms.

RUNTIME/SKIN MIGRATION at resting paint. Every inline `style={{}}` paint in
the seven families is drained: enum-keyed geometry (field `span`, control
`width`, edit-field `span`) becomes `data-span`/`data-width` stamps the skins
own; runtime geometry (the field-grid `columns` prop, the sticky
more-fields toggle) becomes `--ds-*` channels, the only legal inline;
fixed gaps become skin channels. The three near-empty surface skins are
rebuilt keyed on `data-part` — every stamped part has an honest rule, the
composed primitives keep their class selectors, and the error banner is a
ruled alert (recessed error ground, emphasis inline-start edge, rhythm-plane
padding) instead of a bordered card — a declared visual change. State is
decided once: the ledger cell, the field link, and the section disclosure
adopt the shared interaction kernel and the skins pair
`:is([data-state~='…'], :pseudo)` — the record family's 7, form-sections' 3
and every other unpaired pseudo selector are paired. All seven families'
loading states are the shared anatomy-derived skeleton renderer; the
hand-made constructs (record 20, form-sections 8, guided-draft-form 8) and
their `-skeleton-*` part stamps are retired, so the wait now mirrors the real
anatomy — a declared visual change. guided-draft-form gains its first
keyboard path: Enter on the surface resolves submit intent through the shared
kernel (editable targets and IME composition pass through), and its suite
gains the executable accessibility assertions the census measured missing.

ROUTED, NOT FIXED, with measured reasons: `--ds-material-raised-shadow-selected`
stays an unproduced read on form-sections (the name never entered the material
vocabulary; the material lane owns it); the two `--ds-stale-banner-padding-*`
renames belong to sub-lot G's files, the only readers/stampers; the `panel`
fan-out stays registered `routed` (the catalog row is WO-CAT-02's), with the
record skin now consuming the hairline/standard edge roles the control
produces; record's `partsStampedNotConsumed` measures the whole
`structures/record` tree against `skin/record` alone, so the blocks' parts
consumed by their own skins still count — a pin/attribution decision for the
DT. Axe contrast debt on muted-ink pairings at bithire/evnto light is pinned
by node identity, not fixed, in the record and form-sections causality
suites. Under a `heavier` personality profile the guided-draft headings now
render the personality system's 700 like the rest of the app, not the
retired surface-override 800 — measured, resting profiles unchanged.
