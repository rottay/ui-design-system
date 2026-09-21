---
"@rottay/design-system": patch
---

The file-manager's delete action takes the governed quiet-danger ink.

Its label was painted by the family's own skin, `color: var(--ds-color-error)`
on `[data-part='item-action'][data-action='delete']` — the FILL role used as
an ink. Because the composed ghost Button's rest wash is
`color-mix(in srgb, currentColor 7%, transparent)`, that single statement also
tinted the ground the label was measured against, so both legs of the pairing
were the family's and `data-tone` measured null on every delete button in every
scope: the Button's quiet-destructive recipe never ran. The call site now asks
for `danger` (keeping `variant="ghost"`, so the quiet recipe runs rather than
the solid one) and the statement is gone.

Paint change, previously-failing scopes only. The resting label moves from
`--ds-color-error` to `--ds-button-error-border`: `bithire dark` 2.59/2.74 →
6.40/6.82 and `evnto light` 3.73/4.35 → 4.93/5.75, the two scopes that were
below the 4.5:1 floor. The ungated scopes ride the same channel —
`rottay light` 3.73/4.35 → 4.93/5.75 (also failing before, declared),
`rottay`/`evnto dark` 5.24 → 7.31, `bithire light` 4.52/5.04 → 9.58/10.69.
Measured across 6 vertical/mode scopes: 0 regressions. The neighbouring
`rename`, folder link, breadcrumb and table cells are byte-identical
everywhere.

No public API, channel or subpath changes: the family stops stating an ink it
did not own and consumes the Button's.
