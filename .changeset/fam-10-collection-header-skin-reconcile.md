---
"@rottay/design-system": patch
---

WO-FAM-10 reconcile. The `collection-header` skin retires its second
responsive authority; the adapt slot is the only owner of what renders.

The skin carried `@container ds-collection-header (max-width: 34rem)`, a
threshold that could read neither the tenant posture ladder nor the app's
`adapt`. It was live, not dead code: the DS sets no `html` font-size, so 34rem
is 544px at the browser default, while the expansive ladder resolves `regular`
up to 519px — between 520px and 544px the TSX rendered the full composition and
the query hid two of its elements. It also defeated the new escape hatch, since
`adapt={{ compact: { compactLayout: false } }}` in a 480px box rendered the
editorial divider and rule straight into a `display: none`.

The block is gone. Its `title` rule was a byte-duplicate of the skin's own
`[data-compact-layout='true']` rule and retires with it; the two `display: none`
rules for `subtitle-divider` and `editorial-tech-rule` were structural
decisions and retire outright. The two genuine paint rules — the
`shortcuts-label-icon` glyph and the `shortcut-pill` inline padding — keep
their declarations verbatim and re-key onto
`.ds-structure.ds-collection-header[data-part='root'][data-compact='true']`,
the resolution the TSX already stamps, so paint now follows the decision taken
under the tenant ladder and the app override. `container-type` and
`container-name` stay on the root: the family's `cqi` fluid steps depend on
them.

No public API, contract, registry or rendered markup changes. A static test
beside the adapt suite pins the law: zero `@container` at-rules and no `34rem`
in the skin, no skin rule hiding a rendered element, and both paint rules
present under the stamp.
