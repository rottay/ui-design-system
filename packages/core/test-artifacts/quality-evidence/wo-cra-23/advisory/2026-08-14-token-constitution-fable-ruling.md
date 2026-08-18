# Token Constitution — Fable Final Ruling (WO-CRA-23)

- Date: 2026-08-14
- Auditor: Fable 5, maximum-instance auditor (read-only; this advisory is the only write; no stage/commit/push; no product edits).
- Reread in full this pass: modern-rescue `README.md` (worktree, with the new "Binding constitution" section), `program.json`, `customization-model.json` (worktree, with `namespaceLifecycle` + `transportEquality`), `evidence-contract.json`, `quality-rubric.json` (channel/tenant-authority sections), `tenant-art-direction.json` (laws + targets), `visual-craft-contract.json` (prior pass), `manifest/schema.json`, `manifest/rules.mjs`, `packages/core/tokens/controls/README.md` (generated catalog, digest `4e188f77…`), root `CLAUDE.md` + DS `CLAUDE.md` (worktree, with Bootstrap + Theme-ISO sections), `agent-orchestration.json` (worktree, fixed roles), `AGENTS.md` (T-1 draft, 50 lines), the four advisories (`fable-token-system-audit`, `fable-token-namespace-addendum`, `kimi-k3-token-system-audit`, `kimi-k3-token-namespace-addendum`) and `dt-token-system-consensus.md`. The T-1 draft was inspected live and NOT edited. `program-check.mjs` was executed (exit: `CONSTITUTION_READY`); both drill suites were executed (results in section D).

This ruling decides the twelve constitutional points with evidence, lists every finite disagreement, and seals.

---

## The twelve decisions

**1. Namespace: `--ds-*` public canon vs `--_ds-*` governed private sockets; channel ≠ product control — RATIFIED.**
Machine law already: `manifest/rules.mjs:34` and `manifest/schema.json` fix `CHANNEL_PREFIXES = ['--ds-','--_ds-','data-']`; internal channels require `semanticOwner` (an ACTIVE public control), `producer`, `fallbackAuthority`, productive consumers and a `replacementDisposition`. Live measurement: 482-483 unique `--_ds-*` names across ~210 core CSS files, 0 in any `_source/extension.css` (both auditors, independently). A channel is plumbing; the product surface is exactly the bounded dial set (decision 5). The worktree `customization-model.json#namespaceLifecycle` codifies this correctly.

**2. Deny-list of product/app/vertical names in BOTH namespaces, Theme keypaths and compiler — RATIFIED.**
`namespaceLifecycle.publicCanon.forbiddenPatterns = [event, ticket, dashboard, rottay, bithire, evnto, --rt-]`, and the README constitution section extends it to "both token namespaces, contracts and Theme keypaths". Consistent with my base audit census (compiler emissions already clean — K3 verified zero event/ticket/dashboard emissions; residual dialect lives in evnto extension 16 decls, `--rt-*` reads, and `skin/dashboard*.css` grammar) and with the T7 sweep of the DT consensus. id/slug stays metadata: `FirstPartyBrandTheme.id` narrows to the closed union and never decides lowering or naming.

**3. Lifecycle promote/derive/retire for privates; timing inside R0-R6; R7 prohibited — RATIFIED, with the DT consensus anti-parking law.**
`privateProvisional.allowedDispositions = [PROMOTE, DERIVE, RETIRE]` with required owner/producer/fallback/consumers/promotion-criteria/retirement-criteria; forbidden in Theme keypaths, compiled tenant emissions, public declaredOutputs, contracts and documentation. Lifecycle exits execute inside R0-R6 as part of control-calibration/cohort atoms; `r7Enabled: false` stands and R7 authorizes nothing retroactively. A provisional that never exits is a dormancy defect, not a namespace crime (K3's formulation, correct).

**4. `extension.css` drains by cohorts MIGRATE/DERIVE/RETIRE and is never dumped into `--_ds-*` — RATIFIED.**
`namespaceLifecycle.drainLaw` states it verbatim ("may not move an extension declaration into --_ds-* merely to defer a decision"). The 1,224-declaration census (R1,027/B172/E25 — both auditors byte-agree) drains through the DT programme T1-T7 with per-cohort signed rosters/hashes and decrease-only baselines, ending in T8 severance (files + `extensionCss` API + renderer inputs + permanent single-author gate, resurrection prohibited).

**5. Operational model stays 13 Standard + 7 Pro until a later atomic migration; target 9+7 stays PROPOSED; Expert = exact 294 allowlist, max 200/document, frozen without owner order — RATIFIED.**
Triple-anchored: `customization-model.json#standard.current` (13 ids) + `#pro.capabilities` (7) + `program.json#controlBaselines {standard:13, proCapabilities:7, expertExactAllowlist:294, expertMaximumOverridesPerDocument:200}` + the generated catalog `tokens/controls/README.md` (13 Standard table, 7 Pro table, Expert closed allowlist with domain split and `TENANT_THEME_OVERRIDE_TOKENS` contract). `targetControlModel.implementationState: PROPOSED_NOT_IMPLEMENTED` with pinned migrationOrder; one model operational at a time; proposed names never count as coverage. The README constitution section adds the Expert drain-freeze explicitly.

**6. Static and DDB are equivalent ingress into ONE total Theme and ONE `compileTheme`; identical artifact both modes: inventory, order, serialization, digest — RATIFIED.**
`customization-model.json#transportEquality` now bans, verbatim: second compiler, subset/intersection parity fixture, invented neutral Theme, silent default vertical, slug/product branch in compiler. Equality inventory is public-layer (my addendum §5, adopted): `--ds-*` emissions + root attributes + order + CSS + digest; `--_ds-*` sockets are downstream and resolve identically because they read the same derived channels. `ThemePatch` is ingestion-only; DDB documents resolve over `FIRST_PARTY_THEMES[verticalKey]`, fail-closed. The subset test (`static-db-channel-vocabulary.test.ts`, "not equality / BOUNDED subset") is condemned by this constitution and is replaced under T0 — never accommodated.

**7. Three BrandThemes/Themes with mirror structure, order and semantic comments; only values/dispositions differ — RATIFIED.**
DT consensus law 7 + my nested-totality representation (`Governed<T>` at family and subfamily governance points; no optional-by-absence; `BrandCapabilityAbsenceReason` reused, not reinvented) + K3's C0 finding (emission rosters 35/29/25 divergent today) agree: the mirror is NOT true today and is T0 work, gated by shape-hash equality (id excluded) and per-theme compiled-digest invariance so mirroring provably changes zero effective values.

**8. Manifest 255 × 20 = 5,100 as FINAL assessment, not a parallel authority — RATIFIED.**
`manifest/index.json` denominators (255 families, 5,100 cells, all UNKNOWN, accepted 0, `skeletonsCountAsProgress: false`). Two directions both hold: the drain awards zero manifest progress (K3 §8, correct), and the manifest cannot honestly advance while extension CSS bypasses its control model (DT consensus). Reconciliation happens at T9, after channel identities stabilize; the denominator does not move; doing severance before propagation costs zero already-emitted evidence (accepted = 0 today).

**9. Apps are irrelevant as authority — RATIFIED.**
`program.json#referenceLab.authorityLaw` ("product applications are later integration consumers and cannot certify or reject DS craft") + owner steers. App readers inform DELETE-vs-UNIVERSALIZE evidence (a courtesy census), never block; the app-bithire `--rt-*` dialect (~18k names) is a separate later program.

**10. Roles: Codex DT coordinates; Fable 5 + Kimi K3 audit and decide by double-ACCEPT; Kimi 2.7 implements — RATIFIED.**
The worktree `agent-orchestration.json` fixes actors ("Roles are fixed for the Modern Rescue programme… not a reason to substitute actors or weaken a fence"); AGENTS.md carries the same table; README roles section rewritten to match. One precision this ruling records: auditors "decide by double-ACCEPT" operates within the audit lane — Codex/owner retain final sighted acceptance and commit authorization; an auditor double-ACCEPT is necessary, not sufficient, for a packet to request the owner order. That reading is consistent with all three contracts and with `program.json` invariant "only Codex may accept sighted quality".

**11. Never commit/stage/push/R7 without explicit owner order — RATIFIED, and STRENGTHENED in the draft.**
The T-1 wave corrected the one contradiction I would otherwise have flagged: the README's old "local commits are allowed after an audited packet" and resume-step-8 "create a local commit" are rewritten in the worktree to "**No stage, commit or merge** without an explicit owner order for that exact change… an audited packet is a prerequisite for requesting the order, not permission". AGENTS.md repeats it as a hard fence. R7 `enabled:false` intact everywhere.

**12. Persistent constitution: AGENTS.md + CLAUDE.md pointers + Modern README/program/customization/orchestration + causal anti-drift gate — RATIFIED IN DESIGN; two implementation defects listed below.**
The draft materializes correctly: AGENTS.md (read order, hard fences, roles, verification commands), DS CLAUDE.md Bootstrap section (programme contracts override the general file; Theme-ISO section restates invariants without competing), README "Binding constitution" (machine-checked, "not subject to prose reinterpretation"), `customization-model.json` namespaceLifecycle/transportEquality, orchestration fixed roles, and `program-check.mjs` rewritten as the fail-closed T-1 cross-check (executed by me: `CONSTITUTION_READY`, exit 0). The DESIGN is exactly what point 12 demands. The current IMPLEMENTATION has the defects in section D.

---

## D. Finite disagreements (complete list — nothing else is contested)

**D1 (P0, blocks any owner commit-order on the T-1 packet): the constitution checker REPLACED the manifest contract gate instead of adding to it.**
Old `program-check.mjs` (HEAD, ~1,450 lines) imported `validateCustomizationManifest` from `manifest/generator.mjs` and cross-checked inventory partitions, cohort counts and contract webs; it is the blocking CI gate `modern-rescue-program-contract`. The worktree version (310 lines) checks ONLY constitution consistency — the deep manifest validation no longer runs under that gate name. Partial mitigation: `manifest/generator.test.mjs` still validates the manifest (executed: 27 pass / 0 fail) under the separate drills gate. Required fix: the program-contract gate must run BOTH (constitution cross-check AND `validateCustomizationManifest` + the retained contract cross-checks), or a new named blocking gate must carry the old validation explicitly. Silent narrowing of a blocking gate is precisely the drift this constitution exists to prevent.

**D2 (P0, same packet): the constitution drill is red.**
`program-check.test.mjs` (part of blocking gate `modern-rescue-tooling-drills`) fails wholesale against the rewritten checker (executed: 1 fail, `testCodeFailure` at load — it targets the old API). AGENTS.md orders these two commands run "before and after any T-1 constitution edit. Fail-closed on drift" — today the second command fails. The drill must be rewritten with the checker, including planted-drift mutants (e.g., a mutated role table, a 14th Standard id, a dropped `--_ds-` prefix must each turn the checker red) so the anti-drift gate is causal, not decorative.

**D3 (P1, hygiene, ISO/T-1 worktree): scratch files outlaw themselves.**
`packages/core/gen-iso-shape.cjs` and `packages/core/src/_tmp_extract.test.ts` sit in the worktree while AGENTS.md's own hard fence says "No `.tmp`/scratch files left in the final worktree". Implementer WIP is fine mid-packet; both must be gone before any owner order. (`src/_tmp_extract.test.ts` additionally risks being collected by vitest globs.)

**D4 (P1, wording, one line): "decide by double-ACCEPT" should be written into `agent-orchestration.json` exactly as scoped in decision 10** (double-ACCEPT = audit-lane gate required to request the owner order; Codex keeps sighted acceptance and commit authorization). Today the phrase exists only in owner prose; encoding it prevents a future reading where auditor consensus substitutes for owner authorization — or the inverse.

No other disagreement exists. Specifically NOT contested: the namespace triad; the deny-list contents; the 13+7/9+7 split; Expert freeze; transport-equality inventory definition; the drain law; the mirror law; the manifest denominators; role fixation; the K3-vs-Fable differences already resolved by the DT consensus (derivation-over-flat-leaves for component channels — K3's direction, which I accept; total-input compiler — my direction, which K3 accepts; SEV-RECEIPT-MODE — my verdict authoritative, K3 §12 withdrawn).

---

## Cross-advisory reconciliation (for the record)

- Census: both auditors independently measured 1,224 (R1,027/B172/E25). Unique-name counts differ by counting method (Fable 659 bucket-uniques per slug-cohort vs K3 721 global uniques including cross-slug repeats) — not a conflict; the declaration total and per-slug split are byte-identical.
- All signed hashes re-derived and agreed: D1 `6b3a7286…/1cfe1b35…/e86e5139…`; SEV-21 `e2301dc7…/191837a2…/57f8bdba…`; CONFLICT-9 `7d9ea09a…`; cert-fence PRE/POST literals; manifest `inputsDigest efe941d4…`; controls catalog digest `4e188f77…`.
- The DT consensus T0-T9 programme is consistent with both audits and with this constitution; T0 (THEME-ISO) is already in flight in the worktree (iso.ts, iso-shape.ts, first-party-themes.ts, migrate-v1.ts, theme-iso.test.ts + compiler edits) — NOT audited here; it will be audited as its own packet under the cohort acceptance law.

## Seal

- File: `packages/core/test-artifacts/quality-evidence/wo-cra-23/advisory/2026-08-14-token-constitution-fable-ruling.md`
- The SHA-256 of this file is computed over its content excluding this line's value and is recorded in the audit reply that accompanies this ruling (a file cannot contain its own final hash); the accompanying reply states it and the DT records it in the consensus tree.

## Verdict

The twelve constitutional points are ratified with evidence; the four finite disagreements are D1/D2 (gate regression + red drill, both inside the T-1 packet and fixable there) and D3/D4 (hygiene + one wording line). None contests the constitution's content.

**ACCEPT_PROPOSAL**
