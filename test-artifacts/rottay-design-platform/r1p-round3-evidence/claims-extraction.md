# Round 3 claims extraction — official reconciled audit doc

- Source doc: `/Users/daniel/Developer/Rottay/docs-engineering/archive/audits/2026-07-26-ds-modern-whitelabel-independent-audit-davila.md`
- Size: 685 lines / 63,143 bytes
- Git state at extraction: `docs-engineering` is a git repo, **working tree CLEAN (0 porcelain entries)**, HEAD = `ca53acf docs(ds): record R1 visual authority closure`. The doc has exactly 2 commits touching it: `ca53acf` and `b56b129 docs(design-system): record R0 architecture and audit`.
- Extraction date: 2026-07-27

**Headline for the correction**: the doc contains **zero occurrences** of `extension.css`, `compileBrandTheme`, `build-vertical-artifacts`, or `_source`. It treats the per-vertical artifact as one opaque emitted unit. The dual-authoring fact is entirely absent from the record.

---

## (a) Full heading structure with line numbers

```
   1  # Independent Audit — Rottay Design Platform / Modern / White-label (+ Codex Meta-Audit Reconciliation)
  12  ## 1. Executive verdict (post-reconciliation)
  26  ## 2. Codex meta-audit adjudication
  48  ### Round 2 adjudication (same day)
  71  ## 3. Official authority model (replaces "four authorities")
  91  ## 4. Confirmed findings (evidence digests; full file:line in the evidence bundle)
  93  ### 4.1 Gates (P0, owner Claude per new model; mechanical)
  98  ### 4.2 Cascade (P0, NEEDS_OWNER_DECISION)
 101  ### 4.3 App paint interference (P0 for the verified mechanisms; :root collisions downgraded pending validation — round-2 correction)
 107  ### 4.4 Tenant dark + theme attribute (P1, Kimi visual/Claude writers)
 110  ### 4.5 Dead/emitted-not-consumed channels (P1, Kimi wire-or-retire; baseline = tenant-channel gate)
 113  ### 4.6 Anatomy/material/chrome ownership collision (P1, NEEDS_OWNER_DECISION then Kimi)
 116  ### 4.7 Composition tier (P1, Kimi)
 119  ### 4.8 i18n / RTL (P1 platform-level default; RTL off critical path except DS readiness)
 122  ### 4.9 A11y (P1, Kimi visual + Claude gate scope)
 125  ### 4.10 Performance (P1 structural; numbers = SNAPSHOT-VOLATILE)
 129  ### 4.11 Security (no launch blocker on the DB path)
 132  ### 4.12 Evidence & tests
 137  ## 5. R0 — Reconciliation of findings vs current WIP (states)
 175  ## 6. Owners (corrected model, adopted)
 181  ## 7. Corrected roadmap
 189  ## 8. Metric corrections (normative wording)
 198  ## 9. Genuinely good (keep and generalize)
 202  ## 10. Prior claims corrected by this audit cycle
 206  ## 11. Scorecard (unchanged values; scope tags added)
 210  ## 12. Estimates (unchanged)
 219  # R1 — Launch architectural truth (Claude, 2026-07-26, implementation-in-progress)
 224  ## R1.A Official authority model (supersedes section 3's table where they differ)
 256  ## R1.B Channel matrix — declared / emitted / consumed-in-Modern / tenant-reachable
 280  ## R1.C Why the acid test fails — now quantified
 297  ## R1.D Root-attribute writers
 310  ## R1.E i18n (implemented)
 323  ## R1.F Cascade conflicts found (app tier) — measured, not inherited
 339  ## R1.G Gate truthfulness (verified, all P0)
 353  ## R1.H Other confirmed defects (recorded, not fixed in R1)
 369  ## R1.I What R1 changed
 392  # R1 closure wave — corrections and completions (Claude, 2026-07-26)
 397  ## C1. Claims corrected in this wave
 407  ## C2. A vacuous test, found and removed
 424  ## C3. CI is now fail-closed
 444  ## C4. The app boundary law (replaces the "907 files" framing)
 460  ## C5. Root-attribute ownership
 475  ## C6. Arabic root tracking — fixed
 484  ## C7. Still open
 498  ## C8. Honest completion
 510  # R1 — Codex remediation round (2026-07-26)
 516  ## R1.1 Blocker matrix
 527  ## R1.2 CRA-12: reconciled to the accepted commit, and blocking again
 564  ## R1.3 Workflow `v1.8.3` — prepared, not published
 591  ## R1.4 Status
 604  # R1 final audit and publication decision (Codex, 2026-07-26)
 611  ## F1. Additional defects found by the final audit
 638  ## F2. Final evidence
 660  ## F3. CI publication
 671  ## F4. Exit verdict          <-- LAST section; doc ends at line 685/686
```

Structural convention: the doc is **append-only in waves**. Each wave is an H1 (`#`) preceded by a `---` rule, with H2 subsections. Waves so far, in order: base audit (H2-numbered 1..12) → R1 → R1 closure wave → R1 Codex remediation round → R1 final audit (Codex). Line 215 states the append-only law explicitly.

> L215: `Historical record: this file supersedes nothing and must not be overwritten; the pre-reconciliation full report and per-line evidence remain in the machine-local bundle listed in the header, pending promotion via EvidenceManifest v1.`

---

## (b) "R1 is technically accepted and closed" — verbatim + surrounding paragraph

Exact phrase found at **line 673**, inside `## F4. Exit verdict` (heading at line 671). Full surrounding block, lines 671-686 verbatim:

```
671  ## F4. Exit verdict
672
673  **R1 is technically accepted and closed.** This means authority, hydration,
674  English-default i18n, DB-fixture compilation, CI failure propagation, cross-repo
675  boundaries and buildability are stable enough to begin the visual canary.
676
677  It does **not** certify premium craft. R2/R3 remain sighted work:
678
679  - BitHire Candidates is the critical product path.
680  - The Management is the real DB-backed visual pivot used to prove that the same
681    Modern tree can look materially different.
682  - the 27 `GLOBAL-OWN` and 97 `SHADOWED` app declarations are a decrease-only
683    migration inventory; their destinations require visual decisions rather than
684    mechanical renames.
685  - live-database operation is still not claimed by a fixture-backed compiler test.
```

Note the exact word **"authority"** in line 673 is the claim the Round 3 correction lands on: R1 was closed on the basis that *authority* is stable, and the authority model as recorded never accounted for the second author of the artifact.

---

## (c) Single-source-of-truth / single-authority claims (verbatim + line)

Literal phrase matches for `single source of truth` / `sole author` / `one writer` / `canonical source` are **only 2** in the whole doc (lines 196, 226). The load-bearing claims are phrased as "ONE authority" / "ONE declared authority" / "both emitters agree". Full inventory, most load-bearing first:

**C-1 · L226 (R1.A, the operative authority law)**
> `ONE authority per channel, resolved by `resolveVisualAuthority``

**C-2 · L73 (section 3, official authority model)**
> `ONE declared authority: DesignSystemProvider + resolveVisualAuthority, consuming either the vertical artifact (static, `authority='provider'`) or the compiled tenant artifact (DB, `authority='compiled-artifact'`, per-channel suppression from the coverage manifest).`

**C-3 · L240-243 (the "both emitters" claim — the single most exposed sentence)**
> `- **Tenant paint is UNLAYERED by law** (`cascade-layers: TENANT_PAINT_IS_UNLAYERED`). Both`
> `  emitters agree: the static vertical artifact in each bundle and the runtime DB artifact`
> `  injected during SSR. Required by the coverage model — the artifact must win every channel`
> `  it declares.`

The doc counts **two** emitters (static vertical artifact, runtime DB artifact). With dual authoring there are two *authors* inside the first emitter alone, and only one of them (BrandTheme) is bounded by the coverage/allowlist model.

**C-4 · L196 (metric correction, normative wording)**
> `- Four authorities → one authority + paint layers (section 3).`

**C-5 · L80 (authority-model table row for the vertical artifact — describes it as one code-owned unit)**
> `| Vertical artifact (unlayered; `:is(html[data-tenant='bithire'], :where(...))`) | Code-owned vertical baseline | Specificity (0,1,1) for ALL tenants (`:is()` = max of list, static — round-2 correction); expected to beat app :root; residual risk = same-specificity app rules + class-scoped re-derivations, pending computed-style validation |`

"Code-owned vertical baseline" is the closest the doc comes to naming authorship, and it collapses both authors into one cell.

**C-6 · L16 (executive verdict — pipeline framed as closed and provable end to end)**
> `1. The DB-tenant pipeline (closed schema → per-vertical envelope → compiler with APCA autocorrect and chart guard → sha256 digest with coverage → SSR embed → per-channel visual authority) is the strongest code in the tree. A tenant cannot change vertical, engine, permissions, or inject CSS — proven by schema, code, and behavior tests.`

**C-7 · L315 (precedent: a "single declaration" claim already proved false once)**
> `  real mount point hardcoded the literal `'en'` (`bootstrap/.../provider:644`), bypassing the`
> `  constant — so the constant's own claim to be the single declaration was false. Now wired.`

This is the exact failure archetype the Round 3 correction repeats on the theming axis: a declared single source that a second, unnoticed writer bypasses.

**C-8 · L434-436 (single-inventory claim for gates)**
> `  The 16-gate `pretest` chain now runs in CI: `scripts/ci-gates.manifest.mjs` is`
> `  the single inventory, `pretest` and the CI step both call `gates:ci`.`
> `  **19 blocking gates**, deterministic order, fail-fast, per-gate summary.`

**C-9 · L468-469 (canonical projection claim, root attributes)**
> ``runtime/foundation/root-attributes/ssr` is the canonical projection —`
> ``data-theme`, `data-tenant-theme-mode`, `data-engine`, `lang`, `dir`, tenant`
> `scope — and is exported from the server entrypoint.`

**C-10 · L523 (one-source claim for BitHire SSR contract)**
> `... `lang`/`dir` are destructured from the SAME projection so `jsx-a11y/html-has-lang` can still prove them — one source, statically checkable.`

**C-11 · L208 (scorecard dimension name)**
> `arquitectura 7.5 · single-authority(model) 5.0 · ...`

The scorecard already scores `single-authority(model)` at **5.0** — the Round 3 finding is evidence *for* that low score, not a contradiction of it.

---

## (d) What the doc says about the specific mechanisms in scope

### CLEAR MODE GUARD — 2 occurrences only (L108, L152)

**L108** (section 4.4, verbatim, complete):
> `- Bithire artifact "CLEAR MODE GUARD" pins `color-scheme: light` at vertical scope, later-in-source than its own dark block (~270 dead dark lines); `color-scheme` is not a --ds-* property so no tenant artifact can override it. App also forces it (dead-but-dangerous rule neutralized only by the head script). data-theme has 3 writers with a light→base hydration flip and destructive removeAttribute cleanup.`

**L152** (section 5 R0 state table, verbatim):
> `| Tenant dark inert (CLEAR MODE GUARD) | OPEN (artifacts regenerating in WIP; guard present at read) |`

Two things to note for the correction:
1. The doc attributes the guard to "**Bithire artifact**" — i.e. to the generated output, with no awareness that the guard is *authored by hand upstream*.
2. The R0 state literally expects regeneration to be the resolution vector: "artifacts regenerating in WIP; guard present at read". **Regeneration can never remove it** — see (f) for the verified reason.

### Inert dark blocks (~270 lines)

Only stated at **L108** ("~270 dead dark lines") and referenced obliquely at **L17**:
> `... tenant dark mode is structurally inert in bithire, ...`

No statement anywhere about which authored source those dark lines come from.

### extension.css / `_source/`

**ABSENT — zero occurrences.** `grep -n -i 'extension\.css'` and `grep -n '_source'` both return nothing across all 685 lines.

### compileBrandTheme

**ABSENT — zero occurrences.** The doc references "the compiler" generically (L16, L192, L598) and `BrandTheme` only as a static/security object:
- L34: `... verified evidence is a BrandTheme fixture projected to TenantAppearance; DB→SSR→browser uncertified`
- L35: `| 4 | Static BrandTheme does not need DB-grade security; verticals are trusted file-owned code; manifest is a parity/freshness tool, not a security P1 | ACCEPTED | Finding reclassified: P1 authority-model → P2 parity/freshness tooling. ...`
- L173: `| Static BrandTheme manifest | OPEN as P2 parity tooling (reclassified per adjudication #4) |`
- L192: `- TMM evidence level: compiler-deterministic (fixture-projected) + repo snapshots of the live row.`

Adjudication #4 (L35) is directly implicated: it downgraded the "static BrandTheme manifest" finding to P2 parity tooling on the reasoning that "verticals are trusted file-owned code". That reasoning is *strengthened* for BrandTheme but says nothing about a second hand-authored CSS file that no manifest covers.

### build-vertical-artifacts / `--check`

**ABSENT — zero occurrences.** The doc only ever discusses the *downstream* CSS bundler `build-vertical-css.mjs`:
- L99: `Source entrypoint declares `layer(rottay-tenants)`; build-vertical-css.mjs:285-307 deliberately strips it; dist/bithire.css:115 declares the layer ORDER but ships the artifact unlayered (:83010 literal comment).`
- L126: `- Structural (confirmed): every vertical CSS bundle splices Classic+Rustic+Modern (build-vertical-css.mjs); ...`
- L171: `| Daisy plugin + ~128 KB CSS in every vertical bundle | OPEN (distinct property: `@plugin "daisyui"` in compiled.css + splice via build-vertical-css.mjs; removable now that consumers = 0) |`
- L249-252: `... Every `./styles/*` package export resolves to `dist/`, and `build-vertical-css.mjs` composes from `base.css` + the artifact **by path**, never reading the vertical entrypoints. ...`
- L376: `| `scripts/build-vertical-css.mjs` | rationale rewritten (dead DaisyUI premise removed) |`

L249-252 is important: the doc traces provenance **from** the artifact path onward, and explicitly stops there ("composes from `base.css` + the artifact **by path**"). The chain upstream of the artifact file was never opened.

### engine-token-audit — 2 occurrences (L54, L170)

- L54: `| R2-3 | Daisy: class consumers are now 0, ... | ACCEPTED | Verified: `engine-token-audit.baseline.json:17` reads `"daisy.classConsumers": 0` in the current worktree. ...`
- L170: `| Daisy class consumers | CLOSED_IN_WIP — CONFIRMED at 0 (engine-token-audit.baseline.json:17 `daisy.classConsumers: 0`) |`

Also relevant, L95 and L46 — `engine-audit:check` is the *one* gate the doc credits as properly CI-wired:
> L46: `- The nine-gates finding was re-verified TODAY against the current worktree: `engine-audit:check` IS explicitly wired (ci.yml:128, with the :126 comment admitting the pretest gap), and the nine named gates have ZERO occurrences in ci.yml. The archetype is documented in the file itself and was fixed for exactly one gate.`

### Artifact generation / reproducibility gates

The doc's final gate evidence (L646) is:
> `| DS blocking gates | **23/23 passed**, zero excluded |`

and L558-559:
> ``blocking: true`. `excluded` is gone from the manifest. `gates:ci` reports`
> `**23 PASS, zero SKIP**.`

The doc never enumerates which 23, and never names the artifact-freshness gate among them.

---

## (e) Verdict / scoring structure and where an "R1-P" phase slots in

### Verdict

- **GLOBAL 6.3** at L208, inside `## 11. Scorecard (unchanged values; scope tags added)`. Full line 208 verbatim:
> `arquitectura 7.5 · single-authority(model) 5.0 · contratos WL 8.5 · adopción WL Modern 5.5 · diferenciación verticales 5.0 [platform-scope] · static-vs-DB 6.5 · i18n 6.0 · RTL 4.5 [DS-ready/app-gated] · a11y 5.5 · responsive 6.5 · motion 7.0 · primitives 7.5 · patterns 5.0 · structures 7.0 · surfaces 5.0 [adoption-metric] · app adoption 6.0 · test strategy 4.5 · gate truthfulness 3.5 · evidence governance 5.5 · security 8.0 · performance 5.5 [snapshot] · DX 6.0 · craft potencial Modern 7.5 [SIGHTED-PENDING] · GLOBAL 6.3. Launch-readiness (Modern+BitHire subset) is gated by: gate truthfulness, cascade decision, app paint drain, anatomy law, dead channels, a11y overlays — not by platform-scope dimensions.`

Directly touched dimensions if Round 3 rescores: `single-authority(model) 5.0`, `static-vs-DB 6.5`, `evidence governance 5.5`, `gate truthfulness 3.5`.

### Rounds

- **R1** = "Launch architectural truth (Claude)" — L184, and the H1 waves at L219 / L392 / L510 / L604. Closed at L673.
- **R2** = the visual canary. Definition at L185 verbatim:
> `- R2 — Real white-label canary (Codex accept, Claude/Kimi enable): same component tree, Candidates list + Candidate detail; BitHire static vs The Management (DB-contract/fixture-backed today; this phase performs the live DB→SSR→browser certification); desktop/mobile × EN/ES = 16 canonical captures (supersedes the earlier generic 16-shot matrix; hash-manifested per cra-17 schema). Must diverge perceptibly in typography, radii, borders, elevation, density, sidebar, materials, motion — with identical functionality, focus, and responsive safety. This certifies DB→SSR→browser (adjudication #3).`

**R2 is pending on**: live DB→SSR→browser certification (the DB-contract/fixture-backed canary becoming real), plus Codex sighted acceptance of BitHire-vs-The-Management. Restated at L486-488 (C7), L596-600 (R1.4), L677-685 (F4).

### The roadmap list where an R1-P phase slots in

`## 7. Corrected roadmap`, heading L181, entries at **L183 (R0), L184 (R1), L185 (R2), L186 (R3), L187 (R4)**. An `R1-P` ("R1 postscript" / provenance) phase belongs **between L184 and L185** if inserted inline — but note the doc's append-only law (L215). The safe pattern, consistent with every prior wave, is:

- Append a new H1 wave at **EOF (after L685/686)**, preceded by `---`, titled in the established style, e.g. `# R1-P — Artifact provenance correction (…, 2026-07-27)`.
- Reference back to the specific lines it corrects (L108, L152, L226, L240-243, L673) rather than editing them, exactly as the R1 closure wave did at L394-395:
> `Appended. This section CORRECTS several claims in the R1 section above, including`
> `some of my own. Every number below was re-measured after the changes landed.`

and as R1 did at L221-222:
> `Appended, not overwritten. Everything below is re-measured against the live WIP; audit`
> `numbers were NOT taken on faith, and three of them are corrected here.`

Precedent for a later wave declaring supersession of an earlier one — L606-609:
> `This section supersedes the publication details and completion percentage above.`

---

## (f) Statements called into question by dual authoring

Verified in-repo during this extraction (read-only), which is what makes these claims answerable:

- `ui-design-system/packages/core/scripts/build-vertical-artifacts.mjs:5` — header comment states the composition law verbatim:
  > `*   index.css = compileBrandTheme(<slug>BrandTheme) + <slug>/_source/extension.css`
- Same file `:114` reads `src/foundation/tokens/css/facade/artifacts/${slug}/_source/extension.css`; `:116` calls `compileBrandTheme({ brandTheme, tenantSlug: slug })`; `:125` passes `extensionCss: readFileSync(extensionPath, 'utf-8')`.
- Three hand-authored sources exist: `packages/core/src/foundation/tokens/css/facade/artifacts/{bithire,rottay,evnto}/_source/extension.css`.
- **The CLEAR MODE GUARD is hand-authored, not generated**: `BITHIRE CLEAR MODE GUARD` appears at `_source/extension.css:641` and is reproduced verbatim into `artifacts/bithire/index.css:1682`. `color-scheme` count and `data-theme='dark'` block count are **identical (2 and 4) in both files** — i.e. every dark/`color-scheme` construct in the artifact originates in the hand-authored half. BitHire: extension.css is 6,247 lines of the 7,288-line artifact (~86%).
- The freshness gate **is** wired and blocking: `ui-design-system/packages/core/scripts/ci-gates.manifest.mjs:36`
  > `{ id: 'build-vertical-artifacts', run: ['node', 'scripts/build-vertical-artifacts.mjs', '--check'], blocking: true },`
  and `package.json:311` `"lint:artifacts": "node scripts/build-vertical-artifacts.mjs --check"`.

### Claims now in question

| # | Doc claim (line) | Why dual authoring undermines it |
|---|---|---|
| F-1 | L226 `ONE authority per channel, resolved by resolveVisualAuthority` | `resolveVisualAuthority` arbitrates between *emitters* (provider vs compiled-artifact). It cannot arbitrate *within* the static artifact, where ~188 custom-property names (Codex) are declared by both compileBrandTheme output and hand-authored extension.css. Intra-artifact precedence is decided by concatenation order in `build-vertical-artifacts.mjs`, not by any authority resolver. |
| F-2 | L240-243 "Both emitters agree… the artifact must win every channel it declares" | True but incomplete: the artifact winning says nothing about *which of its two authors* wins a contested name. "Every channel it declares" is now ambiguous — declared by BrandTheme, or by extension.css? |
| F-3 | L80 "Code-owned vertical baseline" | Collapses a typed, bounded, APCA-checked TS source and a free-form hand-authored CSS file into one cell. Only the first is bounded by the coverage manifest / allowlist model. |
| F-4 | L108 "Bithire artifact 'CLEAR MODE GUARD'" | Misattributes authorship to the generated artifact. The guard lives in hand-authored `_source/extension.css:641`. Consequence: it is invisible to BrandTheme, to the tenant allowlist, and to any regeneration. |
| F-5 | L152 `OPEN (artifacts regenerating in WIP; guard present at read)` | **The most actionable error.** It implies regeneration is a plausible resolution path. Regeneration *reproduces* the guard by construction — `--check` would fail if it did not. Removing the guard requires editing the hand-authored file; no amount of BrandTheme work touches it. |
| F-6 | L646 `DS blocking gates 23/23 passed` + L558-559 `23 PASS, zero SKIP` | The artifact gate among those 23 proves **reproducibility** (artifact byte-equals `compile(BrandTheme) + extension.css`), not **authority**. A green `--check` is fully compatible with unbounded hand-authored overrides and with the ~188-name collision. Passing gates were read as evidence of a clean single-author pipeline. |
| F-7 | L35 / L173 adjudication #4 — "Static BrandTheme does not need DB-grade security; verticals are trusted file-owned code; manifest is a parity/freshness tool" → P2 | The trusted-file-owned-code argument covers BrandTheme. It was never tested against a second author that is *also* file-owned but carries none of BrandTheme's structure (no schema, no envelope clamps, no APCA autocorrect, no coverage manifest). The P1→P2 downgrade rested on an incomplete picture of what "the static path" contains. |
| F-8 | L16 "closed schema → per-vertical envelope → compiler … → per-channel visual authority … proven by schema, code, and behavior tests" | This describes the **DB tenant** path. The static vertical path shares the artifact filename but not the pipeline; the extension.css half bypasses schema, envelope clamps (L282-291) and the coverage manifest entirely. |
| F-9 | L249-252 "build-vertical-css.mjs composes from base.css + the artifact **by path**" | Correct as far as it goes, and it is exactly where the provenance trace stopped. The upstream generator step was never in the doc's model. |
| F-10 | L673 "R1 is technically accepted and closed… **authority** … stable enough to begin the visual canary" | The closure explicitly rests on authority being stable. If intra-artifact authorship is unmodelled, "authority" was certified against an incomplete map. |
| F-11 | L104 / L67 "tenants cannot re-enable pinned decoration is primarily a CONTRACT property (decoration tokens are not in TENANT_THEME_OVERRIDE_TOKENS)" | The allowlist bounds the DB path. Hand-authored extension.css is upstream of and unconstrained by that allowlist, so contract-level reasoning about what can/cannot be pinned needs a second axis. |
| F-12 | L192 "TMM evidence level: compiler-deterministic (fixture-projected)" | Compiler determinism is a property of the BrandTheme half only. The static comparand (BitHire) is ~86% hand-authored by line count. |

---

## (g) Sections added by other sessions / clobber risk

**Clobber risk is currently LOW and verifiable.**

- `git status --porcelain` on `docs-engineering` returns **0 entries** — the doc has no uncommitted modifications from any concurrent session at extraction time.
- HEAD is `ca53acf docs(ds): record R1 visual authority closure`, matching the brief exactly.
- Only 2 commits ever touched the file (`b56b129`, then `ca53acf`).

**Multi-author structure inside the file** (all committed, none to be edited by Round 3):

| Wave | Lines | Stated author |
|---|---|---|
| Base audit + Codex reconciliation | 1-215 | Claude (14-agent fleet) + Codex meta-audit |
| R1 — Launch architectural truth | 219-388 | Claude |
| R1 closure wave | 392-506 | Claude |
| R1 — Codex remediation round | 510-600 | Codex |
| R1 final audit and publication decision | 604-685 | **Codex** — most recent wave, contains F4/L673 |

The last wave is Codex's, and it is the one whose exit verdict Round 3 qualifies. Since `ca53acf` is committed and clean, a Round 3 append at EOF cannot clobber anything; the risk to watch is a *different* live session appending concurrently, which would show as a conflict at commit time, not now.

An unrelated program's snapshot dir also exists at `/private/tmp/rottay-design-platform-independent-audit-round-3/snapshots/` (artifact + `_source/extension.css` for bithire/evnto/rottay, plus `official-doc-before-round3.md`, byte-identical size 63,143 to the live doc).

---

## (h) R1 methodology for the static-theme claims

**The referenced evidence bundle no longer exists.** The doc header (L7) points to:
> `- Extended evidence bundle (machine-local, to be promoted via EvidenceManifest v1): /private/tmp/rottay-design-platform-independent-audit/ (FINAL-REPORT.md + line-01..13 + supports + verification-notes + porcelain snapshots)`

That path is **gone** — `/private/tmp` was reaped (dir timestamps show a reboot at 13:09 today); no `FINAL-REPORT.md` or `line-0*` files survive anywhere under `/private/tmp` or the repo. The checkpoint `/private/tmp/rottay-design-platform-independent-audit.md` is likewise absent. This is itself a finding: L133 already flagged the pattern —
> `417MB of artifacts are machine-local and unreferenced`

and L215 called the bundle "pending promotion via EvidenceManifest v1". It was never promoted, and it is now unrecoverable. Any Round 3 claim about R1 methodology must be sourced from the doc's own self-descriptions plus the repo.

### Methodology as self-described in the doc

- **Overall posture** (L5-L6): `Claude (Fable 5 orchestrating a 14-agent read-only fleet, zero repo writes/builds during audit)`; live worktree, `HEADs stable start-to-finish; delta during window = 1 file`.
- **R0 reconciliation method** (L139): `Method: WIP file census captured at audit start (164 M + 57 ?? DS; 185 M + 14 ?? app) + same-day spot re-verification. CLOSED_IN_WIP means the parallel session has visible work targeting the finding — re-verify at landing, do not close on faith.`
- **Static-theme / cascade claims were text-and-selector analysis, not computed style.** This is stated repeatedly and is the crux: L53 (`Selector shape re-confirmed in the artifact (artifacts/bithire/index.css:14)`), L56 (`static pre-classification by this reconciliation; final classification requires computed-style DOM validation`), L65 (`Indeterminate / SIGHTED-PENDING | Everything above until computed-style validation`), L103 (`final verdict requires computed styles (SIGHTED-PENDING)`), L193 (`name collision is not proof of effective authority; per-channel winners require computed-style validation`).
- **Counting was census/grep-shaped**, and its numbers moved substantially when re-measured — L327-332 (R1.F) is the record: `app --ds-* definitions` "150 at `:root`" → **409 across 44 files**; "106 paint locks" → **ZERO**; `app @layer usage` `**ZERO in all 907 app CSS files**`. L325 heading: `Cascade conflicts found (app tier) — measured, not inherited`.
- **The one parser-grade instrument** is the app boundary gate, described at L446-447:
  > ``scripts/app-ds-boundary-gate.mjs` classifies every app `--ds-*` declaration by`
  > `its enclosing selector, measured against what the DS actually ships:`
  Its four-bucket output (SCOPED 253 / SHADOWED 97 / GLOBAL-OWN 27 / ORPHAN 24→0) is at L451-454. Note its corpus is **app-bithire CSS**, not DS artifacts — it classifies the *app* side of the collision and never inspects artifact authorship.
- **Gates actually run, per the doc's own final evidence** (L640-653): DS blocking gates 23/23; DS typecheck exit 0; DS production build exit 0; BitHire contract suite 1,203/1,203; last full DS run 10,627 passed / 1 failed / 18 skipped across 840 files; reusable-workflow drill exit 0. Earlier R1 validation at L387-388: `typecheck 0 · pretest 0 (17 gates) · build 0 · git diff --check clean · focal suites 289/289 across 28 files`.
- **What was never run against the static artifact**: no computed-style/browser probe (all deferred to R2/Codex, L179 `Codex: browser/computed-styles validation … all SIGHTED_PENDING items`), and no provenance/authorship analysis of the artifact's inputs. The artifact was read as a *file* (selector shape at `index.css:14`, guard "present at read" L152), never as a *build output with two inputs*.

### Repo paths that substantiate the correction (verified read-only, 2026-07-27)

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/build-vertical-artifacts.mjs` (153 lines) — composition law `:5`, extension path `:114`, `compileBrandTheme` call `:116`, `extensionCss` read `:125`, `--check` flag `:45` and staleness exit `:129-150`.
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/ci-gates.manifest.mjs:36` — `build-vertical-artifacts --check`, `blocking: true`.
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/package.json:275-276, 310-311` — `build:vertical-artifacts`, `build:vertical-css`, `lint`, `lint:artifacts`.
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/foundation/tokens/css/facade/artifacts/{bithire,rottay,evnto}/_source/extension.css` — the three hand-authored sources.
- Snapshots for measurement: `/private/tmp/rottay-design-platform-independent-audit-round-3/snapshots/{bithire,evnto,rottay}/index.css` and `.../_source/extension.css`.
