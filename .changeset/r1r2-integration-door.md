---
"@rottay/design-system": minor
---

WO-EMI-01 + WO-CON-06. One door, one expansion, one ledger for both document
transports.

`admitDocument` is now the single station that expands a selected experience
profile, for v1 and v2 alike and for preview and publication alike. It reports
the effective document it expanded and the profile defaults it filled, so the
two publication terminals read that one answer instead of re-running the
expansion privately. R1's decision-provenance ledger and R2's publication
parity are resolved together in that one pass: a profile default is recorded as
`profile-derived` against the selection that caused it, and the tenant's own
selections keep `direct-override` at their catalog tier.

Three authorship rules land with it. A profile default fills an ABSENT field
only — a supplied `""`, `null`, `false` or `0` is authorship, and is refused by
name at its own document keypath on every door rather than silently replaced by
the profile's value. A selection naming a member the document transport cannot
write (`typography.families: { mono }`, whose document column carries
`fontFamilyBase|fontFamilyHeading`) is retained with its tier and owns no
effective leaf; the pairing that really writes `--ds-font-family-mono` keeps it.
And a v1 row that writes a font family directly is captured as its own
`direct-override` authorship before profile-derived claims are folded in, so v1
and v2 report the same class for the same authorship instead of attributing the
tenant's font to the profile's pairing.

BEHAVIOR CHANGE — PREVIEW. Preview now shows the profile-expanded effective
document: a document that selects an experience profile previews with the
profile's fonts, `--ds-motion-intensity` and `--ds-radius-scale`, which
publishing it already compiled. A caller that hands a publish terminal a
narrowed `verticalEnvelope` should hand the same `ranges` to `admitDocument`,
`documentThemeIntent` or `previewThemeIntent`, because an envelope's ranges now
bind at preview: profile defaults clamp into them exactly as they clamp at
publication, and without them the preview shows the registered vertical's clamp.

PROVENANCE AND DIGESTS. Artifact metadata now carries the unified ledger —
tenant selections and profile defaults resolved together, rather than only what
a terminal-local builder could see — so an artifact recompiled from an unchanged
stored document can gain, lose or re-attribute provenance entries and its digest
recomputes over them. Stored artifacts remain verifiable and mountable; a
consumer that compares digests across this upgrade should expect them to differ
and re-publish rather than treat the difference as tampering.

```contract-diff
signature ./server#DocumentAdmission — REQUIRED output fields `profileClaims: readonly DecisionProvenanceClaim<ThemeDecisionId>[]` (what the profile-expansion station filled, as `profile-derived` claims) and `effective: TenantThemeDocument` (the v1-shape document the patch was lowered from, profile defaults included); both are always present, so a consumer that constructs a `DocumentAdmission` value itself must supply them
signature .#DocumentAdmission — same two required output fields on the root barrel's re-export of the same declaration
signature ./server#admitDocument — optional `ranges?: TenantThemeVerticalEnvelope["ranges"]` on its input object: the clamp bounds a profile default may not cross; omitted, the station reads the vertical's registered envelope, so existing calls compile and clamp as before
signature .#admitDocument — same optional `ranges` input field on the root barrel's re-export
signature ./server#DocumentThemeIntentInput — optional `ranges?: TenantThemeVerticalEnvelope["ranges"]`, forwarded to the door so a persisted producer previews under the same envelope its publish clamps into; additive
signature .#DocumentThemeIntentInput — same optional `ranges` field on the root barrel's re-export
signature ./server#PreviewThemeIntentInput — optional `ranges?: TenantThemeVerticalEnvelope["ranges"]`, the preview counterpart of the same envelope; additive
signature .#PreviewThemeIntentInput — same optional `ranges` field on the root barrel's re-export
```
