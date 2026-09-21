# Reusable styles and tenant revision history — independent roadmap review

Date: 2026-09-20 (America/New_York).

Requested directly by the owner. Review only: no product-code certification, no agent execution transfer, no standing Codex role.

- CLI: normal Claude, authenticated as daniel.avila@rottay.com (firstParty).
- Effective model in both receipts: claude-fable-5-1.
- Session: f11d91c9-2346-4a15-97b8-638c7dbd0190.
- Tools permitted: Read, Glob, Grep only; no command execution, writes, worktrees, external MCP or subagents.
- First disposition: ACCEPT WITH CHANGES.
- Final disposition: ACCEPT on the corrected scope and non-racing roadmap integration plan.
- Canonical planning scope: roadmap/proposals.md, section Owner-approved styles and tenant history — 2026-09-20. README's execution policy requires the sole DT to register it at the next serialized checkpoint. Proposed IDs are not executable until registered; registry and STATUS were left to their active owner.
- This evidence file is a review record, not an additional plan or implementation authority. The second verdict supersedes conflicting recommendations in the first, notably grouped files, transport-version choice, cross-vertical byte-equality and complete app-owned history scope.

## Initial review (verbatim)

Reads are done. Writing the review now.

## Verdict: ACCEPT WITH CHANGES

The direction is sound and the current seams can carry it without a second compiler or authority. Five findings must be corrected before the specification is written into the roadmap.

### Findings

**F1. A tenant-selected style cannot enter as a baseline.** `ThemeIntent.baseline` is produced only at the compile door from the closed `THEME_BASELINE_SOURCES`, and the resolver arity law is gate-pinned (`docs/architecture/index.md:297-304`). `baselineFor` composes neutral + vertical preset before any ledger exists (`document-v2/presentation/admission/index.ts:286-308`). A style the tenant picks must therefore enter through ingress as a claim producer, the same way profile expansion does (`admission/index.ts:67`), never as a baseline option.

**F2. `preset-inherited` is never produced in production.** The only producer is a test (`provenance/tests/index.test.ts:192`). Baseline leaves are outside the ledger today, so the ledger cannot attribute an inherited value to its source. A style reference is the first real producer of that class. This is a gap the style work fixes, not one it creates.

**F3. Style leaves must rank BELOW `profile-derived`, or the style beats the tenant.** Precedence is class first (`provenance/index.ts:72-78`), then specificity. If style leaves carried `direct-override` (transitivity from a tenant selection), a tenant who picks a style and also authors `typography.pairing` would win the pairing leaf but LOSE the family leaves to the style's expansion. Style claims must be `preset-inherited` (rank 0) regardless of who selected the style. The ref, not the class, records that the tenant chose it.

**F4. The ledger refuses a selection that is not one of the 29.** `assertAuthoredSelectionRef` refuses unknown decision ids (`provenance/index.ts:260-267`). The 29 stay closed, so the style selection needs a third `AuthoredSelectionKind`, `style-reference`, with `{ id, version }`, tier `null`, exactly as `sanctioned-override` is modelled today. Its gate is a style entitlement check at the document door beside `assertOverrideEntitlement` (`document/index.ts:270-304`), not a catalog tier. The tier station already skips null tiers (`admission/runtime/tier/index.ts:55-64`).

**F5. The v2 document has a closed field set.** `assertTenantThemeDocumentV2` refuses any key outside `version | plan | decisions | overrides` (`document/index.ts:122-126`). A `style` field is a document-contract change, and the DB schema is generated from the contract, so the generator `--check` and the CAT-03 preview/document parity population both move.

### Corrections

**Tier and laundering.** Adopt the owner's own law literally: the plan limits editing, never inherited quality. Style CONTENT is inherited and is not tier-judged, so a style may carry Pro-class rows and a Standard tenant compiles byte-equal to a Pro tenant with the same document. The laundering path closes structurally, not by policy: styles are registered on the internal seat at build time, the tenant document carries only `{ id, version }`, and an inline style body is refused by name. The selectable style set per vertical is an envelope fact under D-28; the style selection itself defaults to Standard tier so a new preset is never a paywall. Owner decision needed: whether any style may be envelope-locked per vertical at all, or whether every registered style is selectable everywhere.

**Style versus brand partition.** A style is a v2-shaped decision document on the internal seat whose manifest restricts it to the non-chromatic rows. A vertical preset becomes brand rows plus a style reference and may no longer author a style-class row directly. The `preset-without-derivable-values` gate gains that refusal. Owner decision needed: the exact partition of the 29 rows into style-class and brand-class, recorded as a column in the kit without changing the 29. Safe default: `palette.*`, `typography.families`, `navigation.sidebar-tone`, `experience.profile`, `recipe-profile` are brand; everything else is style.

**Document field.** Additive optional `style?: { id, version }` on v2, absence meaning the vertical's default style. No v3: an old reader refuses the key fail-closed rather than misreading it, and package pins govern rollout. Owner decision: additive v2 versus v3.

**Paths.** The per-axis `styles/<id>/{shape,typography,...}/index.ts` split is wrong. It creates five partial authorities per style that must be recomposed, and the decision ids are already namespaced. Mirror the existing vertical preset shape exactly: `<style-id>/{document,manifest}/index.json` plus one registry `index.ts`. On the D-21 contradiction: the target grammar has no root for preset DATA (`docs/architecture/index.md:50-64`), so a new top-level would fail `structure:check`. Resolution: the style CONTRACT is born under the target grammar at `contracts/theme/runtime/styles/` (it consumes `foundation/decisions` and is consumed by `presentation/document`, matching the rung order). The style DATA lives beside its sibling at `foundation/presets/styles/`, keeps the `document: unknown` discipline the verticals use (`verticals/index.ts:61-71`), and moves with the verticals in RET-04. One move, one authority, no cycle.

**Provenance versus history.** The DS owns a serializable `PublishedRevisionDescriptor`: document digest, style ref and digest, vertical preset digest, catalog digest, package version, envelope digest, artifact digest, ledger. Nothing in the compiled contract carries any of this today. Restore is the app re-submitting the old document through the existing admission under the CURRENT plan, envelope and catalog; refusals surface by name. Actor, timestamps, before/after rows, draft/preview/publish state, atomic activation and optimistic versioning are app-owned. The descriptor carries `plan` because admission needs it; it is an entitlement, not billing data. The DS makes no claim about browser reproduction.

### Roadmap placement

Existing closures are not retracted. Three need explicit re-certification as acceptance of the new work: DER-06 metrics after the preset split, CAT-02 schema `--check` after the field, CAT-03 parity suite with style fixtures. ARC-21, CON-06, RET-04 and EVI-02 stay as they are. EVI-02's instrument is reused, not duplicated, as EVI-05 did.

- **WO-CAT-04** Style reference contract and entitlement. Depends on CAT-03, CON-06. Files: `contracts/theme/runtime/styles/`, document field, provenance third kind, intent, a `admission/runtime/style` station. Acceptance: inline style body refused by name; style referencing a brand row refused at registration; Standard and Pro compile byte-equal on the same document; explicit decision beats a style leaf; preview and document refuse identically; `THEME_DECISION_IDS.length` pinned at its current value; single-door gate green.
- **WO-DER-09** First-party styles and the preset split. Depends on CAT-04, DER-06. Acceptance: three first-party artifacts byte-equal before and after through the official generator; DER-06 metrics re-run green; a second non-default style registered so cross-style tests are non-vacuous.
- **WO-CON-08** Published-revision descriptor. Depends on CAT-04, EMI-02, ARC-21. Acceptance: fixture reproduces the artifact digest from descriptor inputs; restore fixture refuses a now-unentitled decision by name; descriptor schema closed with no billing or secret field.
- **AMENDMENT on ARC-21** (text only, no DAG edit): its round-trip fixture carries a style reference once CAT-04 lands.
- **AMENDMENT on RET-04**: `foundation/presets/styles/` joins the move closure.

### Integration strategy

Registry and STATUS are dirty under Kimi. Do not add registry entries now. Place the three blocks in `proposals.md`, the sanctioned inbox, for the owner's 1:1 approval, then Kimi adds lane blocks and registry entries in one serialized commit window. The two AMENDMENT blocks touch lane files only and can land now. None of the three WOs is executable until registered. CAT-04 shares the "Theme, catalog, ingress" reservation with EVI-02, so it dispatches only after EVI-02 yields its ingress touch or through that singleton owner.

### Test matrix

| Case | Proof |
|---|---|
| Same style, bithire and evnto | Non-chromatic channels byte-equal, palette channels differ |
| Two styles, same vertical, same brand | Shape/typography/density axes move; palette byte-equal |
| Standard vs Pro, same document | Compiled CSS byte-equal |
| Standard authors a Pro row | Refused by name via preview and document |
| Inline style body in document | Refused by name |
| Explicit decision plus style | Ledger owner is the decision; style entry retained with empty leaves |
| Style version bump | Old pin unchanged; new pin differs; both admitted |
| Restore old revision under lowered plan | Refused by name, never silently dropped |
| Static preset vs DB document, same inputs | Artifact digest equal |
| Preset split | Three first-party artifacts byte-equal pre and post |

## Final corrected-spec review (verbatim)

## ACCEPT

The seven corrections resolve my findings. The version-label question does not block recording the WOs. Four items must appear in the amendment text so "approved scope" is not read as more than it is.

**Mandatory items to record**

1. **Core review still applies to CAT-04.** It changes provenance (third ref kind), intent transport, the document contract and the admission station. Under the 2026-09-12 policy that is shared core, so Kimi and Fable review the same debrief before adoption. Approved scope is not a pre-reviewed contract. Say so in the block.

2. **The app-bithire repository packet is cross-repo work under the DS-only amendment of 2026-09-17.** ARC-21 already lists `app-bithire` in `touchedRepos`, so precedent exists, but the amendment must state explicitly that the CON-08 app packet is owner-approved under D-31, bithire only, or a delegate will refuse it as unrelated programme work. Other apps receive the recipe, not a migration.

3. **Registering three WOs moves the WO denominator and STATUS counts.** The 2026-09-19 amendment protected the denominator against policy changes, not against owner-approved additions. Record the change as an addition at the DT checkpoint, in the same commit as lane blocks, registry and generated STATUS, so it is visible rather than silent.

4. **"No perpetual parallel route" needs a precise reading.** Migrate-on-read of older document versions is the existing single door (`migrateAndAdmitDocument` already lifts v1 through `migrateDocumentV1ToV2`). That is one route and stays. What the acceptance forbids is a second admission or second compiler for v3, and a v2 authoring path kept alive after rollout without a mechanical retirement check. Per the "a label does not retire anything" law, the retirement condition must be a failing command, not a docstring.

**Why the rest is accepted**

On item 2, `plan` remains on the document per D-02 and the tier station relies on every document-shaped origin carrying it. "Tenant never supplies trusted entitlement" is satisfied because the app writes `plan` server-side. No contract change there; state it to avoid a reader inferring the field is removed.

On item 3, style leaves at `preset-inherited` rank below `profile-derived`, so an explicit tenant pairing and its expanded families both beat a style's expansion. The style-reference entry stays in the ledger with its retained-empty-leaves semantics when displaced. The partition artifact must classify `experience.profile` and `recipe-profile`, whose channels are already provenance-only pins from the DER-06 handoff, and refuse ambiguity by name.

On item 4, recording is not blocked. Acceptance is stated as outcomes: old readers refuse unsupported documents by name, existing tenants compile unchanged, new documents fail closed where unsupported, one compiler. The label, v3 versus additive, is decided in the CAT-04 debrief under CON-05.

On item 5, I withdrew the "five authorities" claim. The condition is the one you stated: a composition root that only composes, a generated document that is never authored twice, and the regenerate-and-diff gate paired with a source-truth check, since regenerate-and-diff alone cannot see a lie shared by generator and output.

On item 6, the cross-vertical comparison measures style-owned decision leaves and declared normalized effects through the existing by-axis instrument under controlled inputs. Brand fonts, functional anatomy and container context may differ. No new instrument.

On item 7, the separation is correct: recorded entitlement is audit data, fresh admission receives the current server-supplied plan, envelope and catalog independently. Four identities stay distinct. Publish persists inputs and artifact before the atomic pointer swap, CAS refuses stale writes, failed attempts log separately. Reproducibility pins the exact build and references, or the archived served artifact, with no browser-replay promise.

Dependency check: CON-08 on CAT-04, EMI-02 (done), CON-06, ARC-21 introduces no cycle, since ARC-21 gains no edge. CAT-04 shares the ingress reservation with the in-flight EVI-02 and dispatches only after that owner yields.
