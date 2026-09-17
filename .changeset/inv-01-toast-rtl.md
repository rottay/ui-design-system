---
"@rottay/design-system": patch
---

WO-INV-01, the two RTL residues of the toast/color-picker pair.

**ColorPicker selected-check centring (fixed).** The modern skin anchors the
checkmark with `inset-inline-start: 50%` while the producer pulled it back with
a physical `translate(-50%, ...)`, so under `dir=rtl` the anchored edge became
the right one and the pull-back kept travelling left: measured in Chromium, the
check's border box sat 12px off the swatch centre on a 20px swatch. The
producer now re-declares the channel on the part itself,
`[data-part='preset-swatch']:dir(rtl) { --ds-color-picker-check-transform:
translate(50%, -65%) rotate(-45deg) }`, which mirrors only the x offset and
leaves the rotation — and therefore the glyph — untouched. Both directions now
measure 0 off-centre. The stroke geometry (`border-left` + `border-bottom`)
stays physical by the glyph-geometry ruling.

No published declaration changed shape: this is a stylesheet change that ships
in `dist/styles.css`, hence a patch.

**Toast slide (no change; the earlier claim is corrected).** The four physical
`toast-slide-in/out-left|right` keyframes stay pinned as physical-css debt, but
their reason no longer says the RTL defect is live at their JS consumer. The
only runtime that writes those names is the pre-notifier branch of
`Toast.Container`, taken only when the declared engine is not `modern`, and
that branch places the stack with physical inline `left: 0` / `right: 0` — the
slide side already equals the painted edge in both reading directions. Under
`modern` the container renders `NotifierStack` with a logical placement
(`top-right` -> `top-end`) and a Y-only enter/exit, so it never names a
toast-slide keyframe. What remains is a vocabulary question — whether
`ToastPosition` is physical (as its `top-left`..`bottom-right` names say and
the legacy branch treats it) or logical (as the notifier map treats it) — and
that is the owner's D10 call, not a mirror.
