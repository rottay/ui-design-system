---
"@rottay/design-system": minor
---

WO-EVI-02, owner ruling R32 Q2 (first packet). `./server` publishes
`foldRawTokenOverrides`, the migration an application runs over its stored v1
theme rows before the raw `visualFoundation.advanced.tokenOverrides` door
closes. Nothing is refused yet: every document admitted before is admitted
now, and no existing export changes. `foldRawTokenOverrides` is a migration
tool, not a permanent API: it stays published through the release that closes
the raw door and until every consuming application reports its stored rows
`unchanged`; its removal is a later major.

The fold rewrites a v1 document into a v1 document without the raw field. Of
the 292 names the v1 contract admits, eleven are a catalog decision and move
to the `general` field that writes the same Theme leaf: the brand seeds
(`--ds-color-primary`, `-secondary`, `-accent`, and the three background
aliases), the four status seeds and `--ds-effect-intensity`. That table is
derived from the catalog keypaths and the v1 lowering, not written a third
time. A fold is only returned when the v1 lowering answers the identical Theme
patch before and after, with the caller's replacements in place on both
sides, so a seed that would land in another mode block on this vertical is
reported as `mode-routing` instead of repainting the tenant.

It is all-or-nothing and never silent. Every authored entry appears exactly
once in the report: `folded`, `folded-over-general` (with the authored value
it replaced), `resolved`, or one of the blocking outcomes `unrepresentable`,
`ambiguous`, `mode-routing`, `off-allowlist`, `invalid-value`,
`invalid-resolution`. One blocking entry returns the input untouched with the
full report. A value only disappears through a caller-supplied resolution
(`accept-loss`, or `replace` with a `general` / `advanced.chrome` fragment
that passes the v1 schema and overwrites nothing authored), and each carries
the caller's note into the report. The function is pure and idempotent: its
own output is `unchanged`.

```contract-diff
export ./server#foldRawTokenOverrides — added: folds a v1 document's raw `advanced.tokenOverrides` into the `general` decisions that own the same Theme leaf, all-or-nothing, with a per-entry report
export ./server#RAW_OVERRIDE_BLOCKING_OUTCOMES — added: the report outcomes that block a migration
export ./server#RAW_OVERRIDE_RESOLUTION_ACTIONS — added: `accept-loss` and `replace`
export ./server#RawOverrideMigration — added: `{ status, document, report }`
export ./server#RawOverrideReportEntry — added
export ./server#RawOverrideResolution — added
export ./server#RawOverrideOutcome — added
export ./server#RawOverrideBlockingOutcome — added
export ./server#RawOverrideResolutionAction — added
```
