---
"@rottay/design-system": minor
---

RT05 + WO-CON-06. One document, one effective compile, and a v2 publication
seam.

Profile expansion moves out of the artifact terminal and into a common ingress
station (`expandProfileDefaults`), so previewing and publishing the same
document now produce the same effective values instead of two. Publishing a
document that selects an experience profile used to add the profile's fonts,
`--ds-motion-intensity` and `--ds-radius-scale` that previewing the same row
never showed; both doors now emit them, and every field the station fills is
recorded as `profile-derived` rather than as new tenant authorship. A partially
authored `motion` dial keeps its authored member and receives the profile's
default for the members left empty; previously an authored `intensity`
suppressed the profile's `durationScale` and `ambient` entirely.

`compileTenantThemeDocumentV2` publishes a v2 decision document without
flattening it to v1 first, so the document's `plan` and the raw identity of
every selection reach admission. `TenantThemeArtifact` gains an optional
`provenance` metadatum — the ledger's refs, classes, tiers and effective leaves,
never authored values — carried inside the digest the mount proves. Artifacts
compiled without it verify and mount exactly as before.

```contract-diff
signature ./server#compileTenantThemeDocumentV2 — new: publishes a `TenantThemeDocumentV2` to a `TenantThemeArtifact` with the door's admission report and the decision-provenance ledger; refuses a non-v2 document with `unsupported_schema_version` at `$.document.version` and an unrostered vertical with `invalid_value` at `$.verticalKey`; additive, no existing signature changes
signature ./server#TenantThemeArtifact — optional `provenance: { entries: [{ ref, provenance, tier, effectiveLeaves }] }`, included in the artifact digest when present; absent on every artifact compiled before it existed and on the v1 transport, which resolves no ledger, so stored artifacts stay verifiable and mountable without a schemaVersion bump
signature ./server#DecisionProvenanceLedger — published as a type with `DecisionProvenance` and `DecisionProvenanceEntry`; the shape a publication result and an artifact metadatum are read as, additive
signature ./server#DocumentAdmission — gains `profileClaims` (what the profile expansion filled, as `profile-derived` claims) and `effective` (the v1-shape document the patch was lowered from); additive, existing fields unchanged
```
