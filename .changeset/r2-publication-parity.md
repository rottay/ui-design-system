---
"@rottay/design-system": minor
---

RT05 + WO-CON-06. One document, one effective compile, and a v2 publication
seam.

Profile expansion moves out of the artifact terminal's private preprocess and
into a common ingress station (`expandProfileDefaults`) that every publish
terminal runs exactly once. Publishing a document that selects an experience
profile used to compile the profile's fonts, `--ds-motion-intensity` and
`--ds-radius-scale` from a replacement document the terminal built for itself
while the CSS came from the unexpanded selection, so one artifact could state
two different effective values; artifact metadata and CSS are now two
projections of one effective document, and every field the station fills is
recorded as `profile-derived` rather than as new tenant authorship. A partially
authored `motion` dial keeps its authored member and receives the profile's
default for the members left empty; previously an authored `intensity`
suppressed the profile's `durationScale` and `ambient` entirely. The preview
door does not yet run the station, so previewing a profile still shows less than
publishing it compiles; that arm belongs to the ingress owner in flight.

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
export ./server#CompileTenantThemeDocumentV2Input — added: the adapter's input — the v2 document, the artifact identity (`tenantId`, `slug`, `verticalKey`, `rowVersion`) a `ThemeIntent` does not carry, and the same optional `verticalEnvelope` `compileTenantThemeConfig` takes; the roster resolves the default when it is omitted
export ./server#TenantThemeDocumentV2Compilation — added: the adapter's result — `{ artifact, admission, ledger }`; the admission is the door's own report so a surface never re-derives which decisions went unlit, and the ledger is the same one serialized inside the artifact
export ./server#DecisionProvenance — added: the closed class vocabulary `"direct-override" | "profile-derived" | "preset-inherited"` a ledger entry is read as
export ./server#DecisionProvenanceEntry — added: one raw selection and the effective leaves it owns — `{ ref, provenance, tier, authoredValue, effectiveLeaves }`; the element type of `DecisionProvenanceLedger.entries`
export ./server#TenantThemeArtifactProvenance — added: the artifact's serialized provenance metadatum, `{ entries }`; the shape `TenantThemeArtifact.provenance` publishes
export ./server#TenantThemeArtifactProvenanceEntry — added: one serialized entry — `{ ref, provenance, tier, effectiveLeaves }`; deliberately NOT `authoredValue`, so an artifact carries no raw authored payload
export .#assembleTenantThemeArtifact — added: the ONE artifact builder both publication transports share — digest, scopes, chart floor, CSS and the engine projection stated once; it takes `{ intent, identity, verticalEnvelope, document }` and reads provenance only from the resolution, never from a parameter beside the intent
export .#TenantThemeArtifactAssembly — added: that builder's input type
export .#artifactProvenanceOf — added: projects a resolved ledger onto the artifact metadatum, dropping every authored value; `undefined` when the compile resolved no ledger, which is what keeps pre-existing artifacts unchanged
```
