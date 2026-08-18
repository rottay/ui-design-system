# Token Namespace and Control-Model Addendum — corrects and completes the 2026-08-14 token system audit

- Date: 2026-08-14
- Auditor: Fable 5 (cloud auditor, read-only). Only write authorized: this file.
- Corrects: `2026-08-14-fable-token-system-audit.md` (same directory) and the DT consensus where noted in section 7.
- Trigger: owner correction of a DT simplification — `--ds-*` is the public canon; `--_ds-*` are private/provisional channels used to evaluate promotion, derivation or retirement. They are NOT automatically illegal.
- Sources read in full this pass: `programs/modern-rescue/README.md`, `program.json`, `customization-model.json`, `evidence-contract.json`, `manifest/schema.json`, `manifest/rules.mjs`, and the channel/tenant-authority sections of `quality-rubric.json`, `tenant-art-direction.json`, `visual-craft-contract.json`. Live measurements: `--_ds-*` = **482 unique names across 210 core CSS files**, **0 occurrences in any `_source/extension.css`**.

---

## 1. Current operational model (13 Standard + 7 Pro) vs proposed target (9 Standard + 7 Pro)

Operational today (authority: capability registry, recorded in `customization-model.json#standard.current` and `program.json#controlBaselines {standard:13, proCapabilities:7}`):

- **13 Standard**: `palette.seeds`, `typography.pairing`, `typography.families`, `typography.scale`, `shape.radius-scale`, `shape.button-style`, `density.mode`, `spacing.rhythm`, `motion.dial`, `surfaces.elevation-posture`, `surfaces.effect-intensity`, `navigation.sidebar-tone`, `experience.profile`. Frontier candidate (closed until 7 preconditions): `palette.status-seeds`.
- **7 Pro capabilities**: `chrome.families`, `chrome.anatomy`, `token-overrides`, `recipe-profile`, `profiles.expressive`, `profiles.icon`, `responsive.posture`. Editor projects them into 20-30 grouped fields, never new capability IDs.
- **Expert**: exact allowlist baseline 294; max 200 overrides/document; presented as a searchable domain browser, not sliders.

Proposed target (`customization-model.json#targetControlModel`, `implementationState: PROPOSED_NOT_IMPLEMENTED`):

- **9 Standard**: `brand.color-seeds`, `shape.geometry`, `layout.density`, `spacing.rhythm`, `surface.edge`, `surface.depth`, `type.voice`, `type.weight`, `focus.identity`.
- **7 Pro**: `motion.energy`, `motion.character`, `type.foundations`, `iconography.style`, `chrome.suite`, `surface.motif`, `control.size`.
- Law: only ONE model is operational at a time; a target name becomes operational only through an atomic migration proving unique owner, static/DB lowering, consumer propagation, exact restore and predecessor retirement. Proposed names never count as coverage. Migration order pinned: `spacing.rhythm` ACTIVE_CALIBRATION (no rename); `surface.edge` BLOCKED_ON_PRODUCT_ADJUDICATION (must not be created beside `profiles.expressive` edge axis); `brand.color-seeds` PENDING_GLOBAL_CLOSURE (predecessor `palette.seeds`); `motion.character` PROPOSED_ONLY (motion authorities consolidate first).

**Ruling: no ambiguity remains.** The token drain (cohorts C1-C8 of the base report) must land its values under the OPERATIONAL model's ingress (Standard controls, Pro `chrome.families`/`chrome.anatomy`, Expert allowlist where already listed) — never under a target-model name, and never by minting a new public control beside an existing one.

## 2. Not thousands of tokens: closed dials with stops and calibrations

The product surface is dials, not tokens. The cardinality law (`customization-model.json:4`) is: one public control -> one semantic lowering authority -> MANY governed internal channels -> many families/parts/states. Concretely:

- `program.json#currentImpactTruth` records 4,398 operational tokens; they are internal plumbing, an evidence deficit to classify — not 4,398 product inputs.
- Stops are closed and falsifiable (e.g., `spacing.rhythm`: `tight=0.85 / normal=1 / airy=1.2` over one shared factor table for both transports).
- The C4 cohort of the base report (1,035 declarations / 559 unique component-chrome channels) drains into typed per-mode Theme sections REACHED by the existing dials and the Pro chrome capabilities — it must NOT become 559 new public dials, and it must NOT expand the Expert allowlist beyond individually-adjudicated entries (each new Expert entry requires the 8 `newEntryRequirements`).
- Standard requirements are structural: a Standard global control must move more than one property group across at least three UI layers with no component reading tenant/profile directly; duplicates are merged when consumer Jaccard > 0.80.

## 3. Namespace law: `--ds-*` canon, `--_ds-*` provisional/private, with lifecycle

**This is already codified in the program and the base report must align to it, not the reverse:**

- `manifest/rules.mjs:34` and `manifest/schema.json:156`: `CHANNEL_PREFIXES = ['--ds-', '--_ds-', 'data-']` — `--_ds-*` is a GOVERNED channel prefix.
- Every declared internal channel row requires: `channelId`, `semanticOwner` (must be an ACTIVE public control id — rules.mjs validates this), `producer`, `fallbackAuthority`, `productiveConsumerFamilyIds`, `sourceBindings`, `replacementDisposition` in `{LIVE, REQUIRED_ADDITION, RETIRED}`.
- Fences already present: "No family writer mints public `--ds-*` channels" (README fence; program.json invariant) and "A visual lane may create a private proposal but never a public `--ds-*` token" (`tenant-art-direction.json:18`). `creativeProposal` allows initial destinations `component-private` and `temporary-family-prototype`, and REQUIRES `promotionCriteria` and `retirementCriteria` on every proposal.

**Lifecycle (fixed, no ambiguity):**

1. **PRIVATE (`--_ds-*`)**: family- or file-scoped socket; may have many productive consumers inside its owner; never appears in Theme keypaths, never in compiled tenant emissions, never in public API or docs; carries a `semanticOwner` (public control) and a `fallbackAuthority` when it derives from canon.
2. **PROMOTION**: rename to `--ds-*` ONLY through the owning control/channel authority with a manifest row, census entry, static/DB lowering and the Expert `newEntryRequirements` if it becomes an override target. Promotion is an atomic migration; the private name is retired in the same change.
3. **DERIVATION**: the private value folds into an existing public channel (its reads retarget to canon); the private name is retired with the writer.
4. **RETIREMENT**: death proof per `quality-rubric.json#deadCssDefinition` + `retirementLaw` receipts (owner attribution, consumer census, successor where visual capacity exists, source-to-generated reconciliation).

Live measurement: 482 unique `--_ds-*` names in 210 core CSS files. **0 in the three `_source/extension.css`** — therefore the 1,224-declaration census, cohorts and dispositions of the base report are unchanged by this correction.

## 4. Five mechanisms, five different things (do not conflate)

| Mechanism | What it is | Namespace/shape | Governed by |
|---|---|---|---|
| Public controls | Standard/Pro/Expert dials through the tenant pipeline | control ids (`spacing.rhythm`), Expert allowlist names | capability registry + `manifest/controls/*` |
| Semantic Theme keypaths | contract families/subfamilies of the complete Theme (ingress shape) | typed keypaths; `--ds-*` only where they name channels | Theme contract (ISO-CORE) + shape-hash |
| Derived component channels | public channels emitted/derived from Theme (`--ds-button-primary-bg` with generic fallback) | `--ds-*` | compiler lowering + channel census |
| Private sockets | provisional/family-private plumbing under evaluation | `--_ds-*` (+ `data-` attributes) | manifest `internalChannels` + lifecycle in section 3 |
| Instance/recipe APIs | typed props/slots/root attributes selecting finite structure | TypeScript/DOM, never CSS tokens | `RECIPE_OR_ANATOMY` / `INSTANCE_API` cell mechanisms |

The README law stands: structural choices (table vs cards, presence of actions, anatomy, rails) are recipes/anatomy/instance APIs, never CSS tokens — in either namespace.

## 5. Static/DDB transport equality: one model, total

Unchanged from the base report and now reconciled with the program's own demands (`README: static and DB stops produce equivalent normalized outputs`; `kpis.pathParity roundExit=1`): both transports resolve to the SAME complete nested Theme and enter ONE `compileTheme`. Precision added by this addendum: **the total-equality inventory is defined over the PUBLIC layer — compiled `--ds-*` emissions, root attributes, deterministic order, CSS and digest.** Private `--_ds-*` sockets sit BELOW the tenant pipeline (pipeline stage `family-private-values`); they are not part of the transport-equality inventory, but each one's `fallbackAuthority`/producer must chain to public canon, so public-layer equality plus the manifest's channel-liveness receipts fully determine them. No second model, no subset fixtures, no `--_ds-*` in Theme keypaths — those three remain P0.

## 6. Reconciling the manifest 255/5100 after drain/severance

- The denominators are independent of `extension.css`: 255 = `family-inventory.json` rows; 5,100 = 255 x 20 operational controls (13+7). Drain and severance change NEITHER.
- Current manifest state (README derived-at-write): accepted 0, assessedNotElevated 0, unreviewed 255 — the bootstrap awards zero progress. **Therefore severance BEFORE broad family propagation costs zero manifest evidence**, while severance after propagation would mass-invalidate receipts under `evidence-contract.json#regenerationLaw` (digest invalidation). This is the same order the README itself imposes ("competing human authorities retired and the spacing rhythm trace source-bound before broad family propagation").
- What DOES change at drain/severance and must be re-emitted or re-derived: source digests and bindings (receipts emitted from then on bind post-severance SHAs), the token census (`customization-surface-report.json`), channel-liveness rollups, and path-keyed paint counters (relocated with `engine-audit:relocate-paths`, never regenerated).
- C4's landing zone in manifest terms: values become `staticSourceBindings`/`dbSourceBindings` of APPLICABLE cells under the operational chrome capabilities — i.e., the drain is exactly the material the calibration slices need. Sequence stands: ISO-CORE -> drains -> severance -> regeneration -> THEN control calibration/family closure execute the 255/5100 matrix on a stable floor.

## 7. Corrections to the base report and the DT consensus

1. **CORRECTED — namespace law statement.** The base report's law recital ("solo `--ds-*` universal") over-compressed the owner's law. Correct form: `--ds-*` is the public canon; `--_ds-*` is a legal, governed, provisional/private tier with the section-3 lifecycle; `data-` attributes are the third governed prefix. The product-name deny-list (`event|ticket|dashboard|rottay|bithire|evnto|--rt-`) is orthogonal to namespace tier and continues to apply to BOTH tiers.
2. **CORRECTED — ISO-CORE name-law gate scope.** `theme-name-law.test.ts` must: forbid `--_ds-*` in Theme keypaths and in compiled tenant emissions; ALLOW `--_ds-*` in family CSS; keep the product-name deny-list on both namespaces; and not count private sockets in the keypath->channel totality gate (totality is public-layer only).
3. **UNCHANGED — census and cohorts.** 0 `--_ds-*` declarations exist in the extensions (measured), so the 1,224 count, the 8 cohorts, dispositions and the A0-A8 plan stand as written.
4. **UNCHANGED — DT consensus core.** Single lowering, nested-total Theme, ThemePatch ingestion-only, `FIRST_PARTY_THEMES[verticalKey]` base, total-equality fixture, digest invariance, mirror themes: all stand.
5. **CLARIFIED — evidence already consistent.** The cert-fence suite's use of `--_ds-chart-reveal-duration` (chart-foundation.css) is an example of a legitimate private socket deriving from public canon (`var(--ds-motion-fast)`); no prior verdict changes.
6. **CLARIFIED — C4 target owner.** The base report said "new per-mode chrome contract sections"; the addendum pins that these land under the OPERATIONAL Pro capabilities (`chrome.families` / `chrome.anatomy`) and the Theme chrome families — not under the target-model name `chrome.suite`, which remains PROPOSED_NOT_IMPLEMENTED and must not be created beside them.

## 8. Real questions left for the owner (finite)

1. **Private-tier naming grammar**: must `--_ds-*` names also satisfy the product-name deny-list immediately (my recommendation: yes, both tiers), or do provisional names get a grace window until their promotion/retirement adjudication?
2. **Promotion timing**: is `--_ds-* -> --ds-*` promotion allowed during R0-R6 as part of control-calibration atoms, or frozen until R7's customization-depth round?
3. **Expert allowlist pressure**: when C4 drains 559 chrome channels into typed sections, may a bounded subset be ADDED to the Expert 294 allowlist (each through the 8 `newEntryRequirements`), or is the allowlist frozen during the drain?
4. **Manifest control axis**: if the 9+7 target model is adopted mid-programme, the 5,100-cell denominator changes (255 x new control count). Confirm that any target-model adoption is deferred until after the current 255/5100 bootstrap is executed, or that adoption re-bootstraps the matrix explicitly.

---

**Architectural verdict: the owner's correction is not a new rule — it is already the program's written law (`CHANNEL_PREFIXES`, internalChannels governance, private-proposal fences, promotion/retirement requirements). The DT simplification and my base report's law recital are corrected per section 7; nothing in the census, cohort plan, ISO-CORE design or severance sequence changes except the two gate-scope corrections (7.1, 7.2). No source/test/ledger/manifest was modified; nothing staged or committed.**
