# Independent Audit — Rottay Design Platform / Modern / White-label (+ Codex Meta-Audit Reconciliation)

- Date: 2026-07-26 (audit executed 09:37-10:20; meta-audit reconciled same day)
- Requested by: davila
- Auditors: Claude (Fable 5 orchestrating a 14-agent read-only fleet, zero repo writes/builds during audit) + Codex (meta-audit of the audit)
- Worktree state during audit: LIVE (parallel session editing; ui-design-system 164 M + 57 ?? at HEAD 6ce8cd54; app-bithire 185 M + 14 ?? at HEAD 468f5c2a; HEADs stable start-to-finish; delta during window = 1 file)
- Extended evidence bundle (machine-local, to be promoted via EvidenceManifest v1): /private/tmp/rottay-design-platform-independent-audit/ (FINAL-REPORT.md + line-01..13 + supports + verification-notes + porcelain snapshots)
- Evidence labels: VERIFIED-SOURCE / VERIFIED-BEHAVIOR-EXISTING / VISUAL-EVIDENCE-EXISTING / INFERRED / CONTRADICTED / UNKNOWN / SIGHTED-PENDING

---

## 1. Executive verdict (post-reconciliation)

The white-label CONTRACT is world-class; ADOPTION is halfway; and much of the VERIFICATION layer that should prove it does not run.

1. The DB-tenant pipeline (closed schema → per-vertical envelope → compiler with APCA autocorrect and chart guard → sha256 digest with coverage → SSR embed → per-channel visual authority) is the strongest code in the tree. A tenant cannot change vertical, engine, permissions, or inject CSS — proven by schema, code, and behavior tests.
2. "Two products from one tree" is today "one product, deeply re-skinned": color, typography, and surface geometry genuinely diverge; STRUCTURE does not, because anatomy variants destroy authored chrome (ownership collision — see section 4.6), density reaches ~12% of padding, tenant dark mode is structurally inert in bithire, and a long tail of emitted channels has no Modern consumer (236 never-consumed + 12 frozen-only per the DS's own gate baseline).
3. Gate truthfulness is risk #1: the app deploy gate cannot fail (exit-code laundering), the real certification chain does not run on the branch the team ships from, and nine DS gates live only in a `pretest` hook that `test:ci` never fires — while their self-drills DO run, making the dashboard greener than the code.

The current architecture CAN reach the goal. No visual-framework replacement is needed. Blockers are: (a) coherence decisions (cascade model, anatomy/material/chrome axis ownership), (b) mechanical drains (app `:root`, dead channels, pattern recomposition), (c) wiring the verification that already exists.

Scope law (owner decision via Codex meta-audit, adopted): **Modern + BitHire are the absolute launch priority. The Management is a DB-contract/fixture-backed canary over the same component tree, pending live DB→SSR→browser certification in R2 — not a second functional product. Evnto/Platform and Classic/Rustic are off the critical path** (Classic/Rustic stay frozen; Evnto keeps shared contracts only; Platform envelope can wait). Platform-scope findings remain recorded but do not gate the Modern+BitHire exit.

---

## 2. Codex meta-audit adjudication

Codex agreed with ~80-85% and confirmed all headline findings (nine gates in pretest / test:ci gap; missing push:main trigger; deliberate unlayered tenant artifact in the build; 150 app `:root` --ds-* vars + 1,316 !important; forced color-scheme light; DEFAULT_LOCALE='es'; evnto nested I18nProvider; tri-engine bundles; static antd import; pattern/surface reconstruction; 236/12 dead channels). Adjudication of its corrections:

| # | Codex correction | Verdict | Resolution |
|---|---|---|---|
| 1 | "Four authorities" is imprecise: one declared authority + several paint layers with ambiguous ownership/precedence | ACCEPTED (reformulation) | Adopted as the official model (section 3). Verified interference mechanisms stand: 106 literal !important paint locks unreachable at any specificity, 52 class-scoped --ds-button-* re-derivations, same-specificity app rules winning by source order. The ":root wins 97 names" sub-claim was RETRACTED in round 2 (see below). |
| 2 | 16,470 vs ~10,500 are different metrics (static declarations cross-repo vs executed DS suite results), not a contradiction | ACCEPTED with hygiene note | CONTRADICTED downgraded to metric-clarification (STALE). Residual (unchanged from audit): no in-repo artifact records the ~10,500 executed run; the number should be re-produced and pinned via EvidenceManifest rather than cited from memory. |
| 3 | TMM does not yet prove a live DB row; verified evidence is a BrandTheme fixture projected to TenantAppearance; DB→SSR→browser uncertified | ACCEPTED | Re-verified during reconciliation: tenant-divergence-matrix.test.ts builds the "DB representation" via brandThemeToTenantAppearance(fixture) — the file's own comment says the fixture is the authoring source (VERIFIED-SOURCE). Audit evidence level restated as: deterministic compiler proof + repo snapshots of the live row (w10-tmm-deepened-document.json, tmm-live-config.json) — NOT a certified DB→SSR→browser pass. Certification = R2 canary. |
| 4 | Static BrandTheme does not need DB-grade security; verticals are trusted file-owned code; manifest is a parity/freshness tool, not a security P1 | ACCEPTED | Finding reclassified: P1 authority-model → P2 parity/freshness tooling. The real motivation stands and is proven elsewhere: dev-vs-dist cascade divergence (section 4.2) is exactly the parity failure a build manifest would catch. Never framed as a security defect by the audit (L10 did not list it); severity now matches. |
| 5 | Anatomy is not "simply a bug" — it is an ownership collision between anatomy/material/chrome; define per-axis property ownership FIRST, then token-indirection; do not blanket-convert none/0 into overrides | ACCEPTED (sequencing) | Reclassified NEEDS_OWNER_DECISION (axis-ownership law) before any code change. Evidence intact: `framed` respects authored chrome (var-indirect) while `underline` hard-codes resets (modern/skin/card.css:457-471), and TMM's $decisions record semantic conflicts (e.g. panel "imposes rhythm tokens tuned for a different item grammar") that indirection alone cannot fix. |
| 6 | Surfaces/anatomy percentages are not global quality; label denominators | ACCEPTED | Official phrasing: "1/35 = BitHire adoption of DS surface page recipes (adoption gap, not packaging gap — all 35 are exported and showroom-exercised)"; "15-20% = anatomy coverage over the 20 ELIGIBLE families only". Scorecard notes updated; scores themselves unchanged (they already measured the stated dimension). |
| 7 | Sizes/budgets are a volatile snapshot; recompute after a clean post-WIP build | ACCEPTED | Already marked VOLATILE in the audit; now normative: structural causes (tri-engine splice in build-vertical-css.mjs; static antd import) are CONFIRMED; exact KB/percentages are SNAPSHOT-2026-07-26 and must be re-measured on a clean build before being quoted. |
| 8 | 16.5k→9.5k test target is arbitrary; KPI = covered properties, negative drills, redundancy, runtime | ACCEPTED | The number is demoted to a non-normative projection of the subtractive doctrine (delete self-testing mocks, vacuous tenant/engine matrices, shape tests, path-frozen arch files). Official KPIs:每 property has a test + negative drill; gate wired-by-name in a workflow; fast-PR wall-clock; redundancy ratio. No count target. |
| 9 | Evnto/Platform/Classic/Rustic off critical path; must not drag Modern+BitHire readiness | ACCEPTED (scope law) | Adopted in section 1. Scorecard keeps platform-scope dimensions (they answer the original charter) with an explicit scope tag; launch readiness is tracked on the Modern+BitHire subset. Two exceptions stay on critical path because they are DS-level and bite BitHire: DEFAULT_LOCALE='es' (re-verified still 'es' at reconciliation) and the cascade model. |
| 10 | Owner reassignment (Claude=architecture/CI/cascade/contracts/providers/i18n/attribute-writers/bundle-assembly; Kimi=Modern visual+composition+BitHire CSS+responsive/motion/a11y-visual; Codex=browser/computed-styles/BitHire-vs-TMM acceptance) | ACCEPTED (owner decision) | All finding owners remapped in section 6/roadmap. |
| 11 | R0 reconciliation (OPEN/CLOSED_IN_WIP/STALE/NEEDS_OWNER_DECISION/SIGHTED_PENDING) before any tickets — the audit ran against >200 moving files | ACCEPTED | Executed in section 5 for the top findings, using the WIP file census taken during the audit plus same-day spot re-verification. |
| 12 | Roadmap reorder R1 launch-architecture / R2 canary / R3 Modern+Candidates quality / R4 performance+tests | ACCEPTED | Section 7. The audit's lot structure folds into Codex's R-phases. |

Points where the audit's original claim is retained against a possible weaker reading:
- The nine-gates finding was re-verified TODAY against the current worktree: `engine-audit:check` IS explicitly wired (ci.yml:128, with the :126 comment admitting the pretest gap), and the nine named gates have ZERO occurrences in ci.yml. The archetype is documented in the file itself and was fixed for exactly one gate.

### Round 2 adjudication (same day)

| # | Codex correction | Verdict | Resolution |
|---|---|---|---|
| R2-1 | TMM must not be called "DB-backed visual canary" yet; correct name: "DB-contract/fixture-backed canary, pending live DB→SSR→browser certification in R2" | ACCEPTED | Renamed at every occurrence (sections 1, 2#3, 7-R2, 8). |
| R2-2 | "App :root wins 97 variables" is wrong: per Selectors Level 4, `:is()` carries the specificity of its MOST SPECIFIC list argument, computed statically and independent of which arm matches. The vertical artifact selector is therefore (0,1,1) — from the `html[data-tenant='bithire']` arm — even when only the `:where()` arm matches operationally (custom tenants), and it beats app `:root` (0,1,0) regardless of source order | ACCEPTED — original claim RETRACTED | The audit's L1-F3 "(0,0,0) surviving arm" reasoning (and the orchestrator's verification pass, which did not catch it) mis-applied the spec: :is() specificity is not per-matched-arm. Selector shape re-confirmed in the artifact (artifacts/bithire/index.css:14). Reclassification executed below; no mass :root drain may be premised on the retracted claim. Name collisions are NOT proof of effective authority. |
| R2-3 | Daisy: class consumers are now 0, while the plugin + ~128 KB of Daisy CSS remain in the bundle — two distinct properties | ACCEPTED | Verified: `engine-token-audit.baseline.json:17` reads `"daisy.classConsumers": 0` in the current worktree. R0 split into two rows: consumer drain (CLOSED_IN_WIP, confirmed at 0) vs framework-in-bundle (`@plugin "daisyui"` in compiled.css + Daisy portion of modern-engine.css spliced into every vertical bundle — OPEN). |

Reclassification of the 97 :root name collisions (static pre-classification by this reconciliation; final classification requires computed-style DOM validation — Codex, on BitHire static, a projected custom tenant, and later TMM live):

| Category | Count (static estimate) | Evidence |
|---|---|---|
| Shadowed fallback (artifact should win by (0,1,1) vs (0,1,0)) | ~97 pending confirmation | Includes the previously-cited --ds-command-grid-size "divergence" example (artifact emits 22px; app :root 0px is expected SHADOWED — the example is RETRACTED as proof of divergence and moved to SIGHTED-PENDING); also table-sheen, premium-card-sheen, workspace-shell-overlay (all emitted by the artifact) |
| Override with !important (from :root) | 0 | Verified: zero !important inside foundation.css:13-210 |
| Local re-derivation (class-scoped, wins via custom-property inheritance on descendants — independent of the :root battle) | 52 --ds-button-* names ×6 files | Unaffected by R2-2; still a verified interference mechanism |
| Effective override via same-specificity + source order | The separate set of app rules deliberately prefixed `html[data-tenant] :where(...)` (tables-collections.css:275+, forms.css:3) | Ties at (0,1,1), app later in import order — still valid (this is L4-F2, a different selector set from :root) |
| Selector not active / app-owned uncontested | 53 :root names the artifact does not emit + shell-shimmer-* (artifact emits 0, app defines 4) | App-owned by absence, not by victory |
| Indeterminate / SIGHTED-PENDING | Everything above until computed-style validation | Codex R2 canary instrumentation |

Attribution correction that follows: "tenants cannot re-enable pinned decoration" is primarily a CONTRACT property (decoration tokens are not in TENANT_THEME_OVERRIDE_TOKENS — verified absent from the allowlist), not an app-CSS theft. The app duplication remains DEBT (ownership/clarity), but its effective severity now depends on measured behavior, not name overlap.

---

## 3. Official authority model (replaces "four authorities")

ONE declared authority: DesignSystemProvider + resolveVisualAuthority, consuming either the vertical artifact (static, `authority='provider'`) or the compiled tenant artifact (DB, `authority='compiled-artifact'`, per-channel suppression from the coverage manifest).

PAINT LAYERS, each with a distinct intended role, currently with ambiguous precedence/ownership on specific channels:

| Layer | Intended role | Current defect |
|---|---|---|
| Compiled tenant artifact (unlayered, (0,4,0)) | Bounded tenant aesthetics | Correct where it compiles; coverage suppression works |
| Vertical artifact (unlayered; `:is(html[data-tenant='bithire'], :where(...))`) | Code-owned vertical baseline | Specificity (0,1,1) for ALL tenants (`:is()` = max of list, static — round-2 correction); expected to beat app :root; residual risk = same-specificity app rules + class-scoped re-derivations, pending computed-style validation |
| Personality bridge (`@layer rottay-personality`) | Complete channels the artifact does not cover | Declared subordinate-with-override; mechanically LOSES to the unlayered artifact (inverted vs documented law); 11/6/3 contested channels pinned by test |
| App CSS (unlayered, source-after-DS) | Domain/feature styling via public tokens | Redefines 150 DS names at :root; 52 --ds-button-* re-derived at class scope; decoration pinned off; 1,316 !important (106 literal paint locks) |
| Skin packs (inline root styles) | Registered custom packs | Outside the coverage model; zero packs registered today |
| Engine skins (`@layer rottay-engines`) | Modern paint | Correct position |
| Framework layer (`rottay-framework`/`rottay-reset`) | Tailwind/Daisy/antd substrate | Correctly below tokens; cannot defeat the theme |

The launch decision (NEEDS_OWNER_DECISION, Claude): ONE cascade model — either (a) keep the artifact unlayered as LAW, delete `rottay-tenants`/`rottay-personality` from the declared order, move the 11 contested channels into the compiler; or (b) make the build emit the layered artifact the source declares. Then test the DIST, not the source (current parity test reads src under happy-dom, which degrades the bridge to unlayered — the test world is the opposite of production).

---

## 4. Confirmed findings (evidence digests; full file:line in the evidence bundle)

### 4.1 Gates (P0, owner Claude per new model; mechanical)
- nextjs-ci.yml@v1.8.2 Typecheck/Lint/Test all launder exit codes (`set +e` + pipe to tee, pipefail off) → deploy gate cannot fail. app-bithire-pr-gates.yml lost its push:main trigger 2026-07-19 (commit 7a3036493) while its decision record still claims it; work-on-main convention → certification chain effectively never runs for shipped commits.
- Nine DS gates (engine-freeze, tenant-channel-consumer --check/--modern-check, i18n-key-parity, application-boundary, theme-channel-parity, pattern-surface-ownership, size-axis-law, anatomy-variant, portal-substrate) wired only into `pretest`; CI runs `test:ci` which bypasses it (re-verified at reconciliation: 0 hits in ci.yml; ci.yml:126 comment documents the archetype; engine-audit:check got the explicit-step fix, the rest did not). Their drills run in CI (`test:scripts`) and pass.
- Law adopted: a gate does not exist until it appears BY NAME in a workflow file; every gate runs with its blocking flag.

### 4.2 Cascade (P0, NEEDS_OWNER_DECISION)
- Source entrypoint declares `layer(rottay-tenants)`; build-vertical-css.mjs:285-307 deliberately strips it; dist/bithire.css:115 declares the layer ORDER but ships the artifact unlayered (:83010 literal comment). Dev/symlink and prod can resolve the cascade differently; the layered personality bridge loses, inverting the documented subordination.

### 4.3 App paint interference (P0 for the verified mechanisms; :root collisions downgraded pending validation — round-2 correction)
- VERIFIED mechanisms (unaffected by R2-2): 1,316 !important in app CSS, of which 106 literal-valued paint neutralizers on collection/detail chrome are unreachable by any tenant at any specificity (largest file ui/tables/collection/preview/render/styles/index.css = 647); 52 --ds-button-* re-derived at CLASS scope (custom-property inheritance on descendants discards tenant-published button chrome regardless of the :root battle); app rules deliberately prefixed `html[data-tenant] :where(...)` tie the artifact at (0,1,1) and win by source order.
- DOWNGRADED (round 2): the 150 :root --ds-* definitions / 97 artifact collisions are, per corrected specificity, expected SHADOWED FALLBACKS (artifact (0,1,1) beats :root (0,1,0); zero !important in the block). Classification table in section 2 round-2; final verdict requires computed styles (SIGHTED-PENDING). The 53 non-emitted names + shell-shimmer-* remain app-owned by absence. No mass :root drain until classified; duplication remains ownership debt.
- Decoration re-enable attribution corrected: primarily an allowlist (contract) property, not app theft.
- Padding 82% raw px (density reaches ~12%); gap 85% and radius 95.4% tokenized (the benchmark exists in-house).

### 4.4 Tenant dark + theme attribute (P1, Kimi visual/Claude writers)
- Bithire artifact "CLEAR MODE GUARD" pins `color-scheme: light` at vertical scope, later-in-source than its own dark block (~270 dead dark lines); `color-scheme` is not a --ds-* property so no tenant artifact can override it. App also forces it (dead-but-dangerous rule neutralized only by the head script). data-theme has 3 writers with a light→base hydration flip and destructive removeAttribute cleanup.

### 4.5 Dead/emitted-not-consumed channels (P1, Kimi wire-or-retire; baseline = tenant-channel gate)
- 236/1,615 channels never consumed + 12 frozen-only (gate's own numbers). Zero Modern reads: --ds-chart-category-*, glass-bg/border, overlay-light/medium/heavy, gradient-mesh, surface-shell, material-card-border, density-scale (Modern uses -effective-scale), personality-* (rustic-only). Near-dead, all in the Daisy shim: accent(1), radius-button(1), effect-intensity(2). Typography per-facet ~40% inert (font: shorthand consumption); materials 22/160 tokens (13.75%, 9/122 files); motion-intensity fully dead while duration-scale is genuinely consumed.

### 4.6 Anatomy/material/chrome ownership collision (P1, NEEDS_OWNER_DECISION then Kimi)
- Anatomy variants hard-code resets (underline: box-shadow:none, border:0, literal radius) while sibling `framed` proves the correct var-indirect pattern; the real tenant (TMM) explicitly reverted all four axes to `default` with per-axis rationale, choosing chrome over anatomy. Required first: a law defining which properties each axis governs (anatomy vs material vs chrome); then targeted token-indirection to make axes composable. Not a blanket none→override conversion.

### 4.7 Composition tier (P1, Kimi)
- 27/40 Modern pattern engines import zero primitives; 19 rebuild controls with inline geometry (filter-builder worst: 16 raw controls, widths 80/112/144). 34/35 DS surface page recipes have zero package imports from BitHire (adoption-from-BitHire metric; all are exported+showroom-exercised); the one adoption goes through a ~1,830-line wrapper; app "DetailSurface" is a 15,964-LOC local homonym. Surface state kit consumed by 1/36 of its own pages (error handling 16/40). Six card-like families skip `<Card>` so card anatomy cannot inherit. Motion recipes are primitive-only vocabulary (10/16 recipes zero production call sites, including all three ai.*).

### 4.8 i18n / RTL (P1 platform-level default; RTL off critical path except DS readiness)
- DEFAULT_LOCALE='es' in DS kernel (re-verified 2026-07-26 post-audit, still 'es') violates the English-default law; bithire safe only via local `?? 'en'`; evnto resolves 'es' for session-less visitors AND nests a second I18nProvider (the documented anti-pattern). No compile/lint validation that t() keys resolve; app translate() fails open silently. RTL: DS mechanically ~ready (93% logical properties, :dir() icon mirroring, PortalScope); app CSS ~636 physical directional declarations; ar catalog 6/25 real + 19 honest stubs; triple-gated off by design.

### 4.9 A11y (P1, Kimi visual + Claude gate scope)
- Drawer modern: role=dialog aria-modal with ZERO focus management (false modal). Canonical Modal weaker than internal OverlayModal (no Tab cycling; description never wired; ReactNode titles get no accessible name). Four focus-trap mechanisms at four completeness levels. 73-75 primitive suites vi.mock the engine factory (tests assert their own mocks; Drawer's a11y suite structurally cannot see its real defect). CI axe gate covers 8 flagship galleries; serious/critical only; app a11y e2e real but report-only (A11Y_STRICT commented out). Excellent islands: Tabs (textbook APG roving + RTL), Tooltip (WCAG 1.4.13), FormField wiring, ChartScaffold universal on all 18 chart families, real keyboard focus-visibility spec.

### 4.10 Performance (P1 structural; numbers = SNAPSHOT-VOLATILE)
- Structural (confirmed): every vertical CSS bundle splices Classic+Rustic+Modern (build-vertical-css.mjs); AntdConfigProvider statically imports antd in the root provider of Modern-only apps. Snapshot (recompute after clean build): bundles ~3.3-3.7MB raw / 542-595KB gzip, 29-32% over their own CI-enforced budgets; charts facade +143%.
- Healthy: engine code-splitting via createEngineComponent, provider memoization, attribute-swap theme/tenant switching, hand-rolled virtualization, granular budget-gated exports, sideEffects correct.

### 4.11 Security (no launch blocker on the DB path)
- No reachable cross-tenant compromise or CSS/HTML injection on the production DB path (closed grammar + egress re-validation + fails-closed everywhere + adversarial tests). Open: no CSP (needs per-request nonce for the inline script+style); two preview patterns interpolate stylesheets without the sanitizer (reachability UNKNOWN); brand asset URLs allow any https host (product decision to write); digest is provenance, not verified integrity (document before any out-of-process artifact cache).

### 4.12 Evidence & tests
- Gold standard exists (cra-17 hash chain independently re-verified 12/12; honest-incompleteness culture) but the roadmap ledger's evidence field is unverified free text; 417MB of artifacts are machine-local and unreferenced; visual baselines are 462/462 chromium-darwin against a Linux self-hosted runner (CI cannot compare; local-green claims recorded as done). Test estate: 16,470 static declarations cross-repo (metric clarified per adjudication #2); inverted pyramid (52% primitives; <10% where the target property is decided); 437 app arch files freeze the file tree for one law already owned by three censuses; zero snapshots and clean decrease-only baselines (genuinely good hygiene).

---

## 5. R0 — Reconciliation of findings vs current WIP (states)

Method: WIP file census captured at audit start (164 M + 57 ?? DS; 185 M + 14 ?? app) + same-day spot re-verification. CLOSED_IN_WIP means the parallel session has visible work targeting the finding — re-verify at landing, do not close on faith.

| Finding | State |
|---|---|
| Deploy gate cannot fail (nextjs-ci) | OPEN |
| Certification chain not on push:main | OPEN |
| Nine DS gates absent from CI | OPEN (re-verified today; engine-audit:check wired, the nine not) |
| Cascade declared-vs-shipped | NEEDS_OWNER_DECISION (WIP-adjacent: new cascade-layers/ + visual-authority/ + tests) |
| Personality subordination inversion | CLOSED_IN_WIP candidate (new personality-subordination + personality-cascade-layer tests) |
| App :root 150 vars / 97 collisions | RECLASSIFIED (round 2): expected shadowed fallbacks per corrected :is() specificity; SIGHTED_PENDING computed-style validation; ownership debt OPEN; NO mass drain on the retracted premise |
| 1,316 !important / 106 literal locks | OPEN mechanism; RE-COUNT at landing (candidates CSS migration touches carrier files) |
| --ds-button-* re-derivation ×6 | OPEN (form-controls styles in WIP → re-verify counts) |
| Anatomy/material/chrome collision | NEEDS_OWNER_DECISION |
| Tenant dark inert (CLEAR MODE GUARD) | OPEN (artifacts regenerating in WIP; guard present at read) |
| data-theme ×3 writers + base→light flip | Partially CLOSED_IN_WIP (DS root-attribute-authority tests NEW); app writers OPEN |
| DEFAULT_LOCALE='es' | OPEN (re-verified today: still 'es') |
| Evnto nested I18nProvider | OPEN — off critical path (scope law) |
| Dead channels 236/12 | OPEN (tenant-channel modern baseline NEW in WIP → re-baseline at landing) |
| Type facets / materials under-consumption | OPEN |
| Charts identical-blue root cause | SIGHTED_PENDING (browser probe --ds-chart-series-1; fix silent hex/light-dark guard regardless) |
| TMM DB→SSR→browser certification | SIGHTED_PENDING (= R2 canary) |
| Patterns rebuild 27/40 | OPEN (decision-comparison/panorama mid-refactor in WIP — excluded from counts, re-audit) |
| Surfaces adoption 1/35 + state kit | OPEN + NEEDS_OWNER_DECISION (adopt-vs-prune catalog) |
| Drawer/Modal focus | OPEN (WIP overlay work is top-layer promotion, not focus) |
| Picker z-index 1050 | OPEN (re-verified twice during audit on dirty files) |
| Reduced-motion wrong namespace + 9 unguarded skins + 11 Tailwind-motion files | OPEN |
| Tri-engine bundle + antd static | OPEN (structural); budget FIGURES STALE (recompute post-WIP clean build) |
| Visual baselines darwin-only / runner Linux | OPEN |
| a11y gate scope + A11Y_STRICT | OPEN |
| i18n key-parity gate | CLOSED_IN_WIP candidate (gate NEW in WIP); CI wiring still OPEN |
| Arabic direction/language groundwork | CLOSED_IN_WIP candidate (language-arabic.css + direction/ + ar catalogs); app logical-CSS migration OPEN |
| Daisy class consumers | CLOSED_IN_WIP — CONFIRMED at 0 (engine-token-audit.baseline.json:17 `daisy.classConsumers: 0`) |
| Daisy plugin + ~128 KB CSS in every vertical bundle | OPEN (distinct property: `@plugin "daisyui"` in compiled.css + splice via build-vertical-css.mjs; removable now that consumers = 0) |
| "~10,500 tests" claim | STALE (metric clarified; pin executed count via manifest) |
| Static BrandTheme manifest | OPEN as P2 parity tooling (reclassified per adjudication #4) |

## 6. Owners (corrected model, adopted)

- Claude: cascade decision + implementation law, contracts, CI wiring/exit propagation/push triggers, provider stack, DS_PUBLIC_TOKENS manifest, i18n defaults/providers, attribute writers unification, bundle assembly (per-engine split), docs promotion.
- Kimi: Modern visual quality, primitives/patterns/surfaces composition, BitHire CSS drain (:root, !important, button re-derivation, padding tokenization), responsive, motion, visual accessibility (focus/overlays), dead-channel wire-or-retire execution.
- Codex: browser/computed-styles validation, BitHire-vs-TMM comparison and acceptance, Actions-history checks, runner OS confirmation, all SIGHTED_PENDING items.

## 7. Corrected roadmap

- R0 — Reconciliation (DONE in section 5; refresh at WIP landing). No tickets from raw findings without a state.
- R1 — Launch architectural truth (Claude): gates run in CI by name with blocking flags; exit propagation + push:main; ONE cascade model tested against dist; publish public/tenant-editable/private token partition; unify data-theme/data-engine/locale/anatomy writers (base→light normalization, save/restore, SSR data-engine stamp); English default global (DEFAULT_LOCALE + evnto provider fix, no nested I18nProvider); Classic/Rustic stay frozen.
- R2 — Real white-label canary (Codex accept, Claude/Kimi enable): same component tree, Candidates list + Candidate detail; BitHire static vs The Management (DB-contract/fixture-backed today; this phase performs the live DB→SSR→browser certification); desktop/mobile × EN/ES = 16 canonical captures (supersedes the earlier generic 16-shot matrix; hash-manifested per cra-17 schema). Must diverge perceptibly in typography, radii, borders, elevation, density, sidebar, materials, motion — with identical functionality, focus, and responsive safety. This certifies DB→SSR→browser (adjudication #3).
- R3 — Modern + BitHire premium (Kimi): drain conflicting Candidates CSS first; replace patterns that rebuild inputs/buttons/cards; adopt DS surfaces where they genuinely help (or record the prune decision); fix focus/overlays/responsive/motion; two sighted iterations per family with Codex; zero overlap/overflow/dead-space/untokenizable paint.
- R4 — Performance + simplification: Modern-only bundle for BitHire; remove Daisy from the build when the last real consumer is drained; antd lazy/classic-only; rationalize tests by BEHAVIOR with KPIs = covered properties, negative drills, redundancy, runtime (no count target); regenerate visual evidence on the correct runner; recompute budgets after the clean build.

## 8. Metric corrections (normative wording)

- Tests: 16,470 = static it/test declarations cross-repo (DS 8,685 + app 7,785, .each unexpanded). ~10,500 = previously reported executed DS suite results (different unit; plausible vs our ~8.8k src-only runtime expansion + scripts + showroom). Not contradictory. Action: pin the executed number with a recorded run.
- TMM evidence level: compiler-deterministic (fixture-projected) + repo snapshots of the live row. NOT live-DB-certified. Official designation: "DB-contract/fixture-backed canary, pending live DB→SSR→browser certification in R2". R2 closes it.
- Cascade specificity (round 2): `:is()` carries the specificity of its most specific list argument, statically — the vertical artifact selector is (0,1,1) for all tenants; name collision is not proof of effective authority; per-channel winners require computed-style validation.
- Surfaces "1/35": BitHire adoption of DS surface pages, not system function. Anatomy "15-20%": over 20 eligible families. Channels "236/1,615": the gate's own baseline.
- Bundle/budget figures: SNAPSHOT 2026-07-26 on a dirty-source build; structural causes confirmed; numbers must be re-measured clean.
- Four authorities → one authority + paint layers (section 3).

## 9. Genuinely good (keep and generalize)

Tenant intake pipeline; resolveVisualAuthority; PatternDataTable end-to-end; spring-to-linear() compiler + fail-closed motion dial + three real vertical motion personalities; 44px touch system; paint locality (1 color literal in 89 Modern engines) + in-comment contrast measurements; cra-17 hash chain + honest-incompleteness culture; engine-freeze + tenant-channel gate designs; identity/branding/locale/appearance separation; airtight app JS import boundary and zero tenant-slug leakage.

## 10. Prior claims corrected by this audit cycle

- "~10,500 tests" → different metric (see 8). "i18n census 9451→0 SEALED" → true history, unenforced counter (no --check, unwired). "880 factories / 63.3% reach UI" → unlocatable (UNKNOWN). "declarative-CSS →0/0" → utilities 0 confirmed; inline →96, all declarative custom-property parameters. "TMM font-slot broken live" → retracted (mis-read of $decisions; snapshots use the legal slot). "Daisy = 16 files residue" → true at class level (ratcheted); false at build level (whole framework compiled into every bundle). "Two doors 100% parity" → contradicted by its own registry (pre-existing self-documented gap IA-DOOR-02).

## 11. Scorecard (unchanged values; scope tags added)

arquitectura 7.5 · single-authority(model) 5.0 · contratos WL 8.5 · adopción WL Modern 5.5 · diferenciación verticales 5.0 [platform-scope] · static-vs-DB 6.5 · i18n 6.0 · RTL 4.5 [DS-ready/app-gated] · a11y 5.5 · responsive 6.5 · motion 7.0 · primitives 7.5 · patterns 5.0 · structures 7.0 · surfaces 5.0 [adoption-metric] · app adoption 6.0 · test strategy 4.5 · gate truthfulness 3.5 · evidence governance 5.5 · security 8.0 · performance 5.5 [snapshot] · DX 6.0 · craft potencial Modern 7.5 [SIGHTED-PENDING] · GLOBAL 6.3. Launch-readiness (Modern+BitHire subset) is gated by: gate truthfulness, cascade decision, app paint drain, anatomy law, dead channels, a11y overlays — not by platform-scope dimensions.

## 12. Estimates (unchanged)

6.5→7.5: R1 + verified-interference drain (!important literal census, button re-derivation, tie-selectors — :root only after computed-style classification) + anatomy law + top-8 dead channels + i18n default + Drawer/Modal ≈ 3-5 engineer-weeks. 7.5→8.5: pattern recomposition + surface adopt-or-prune + density/padding + bundle split + test doctrine phase 1 ≈ 6-10 weeks. 8.5→9+: sighted craft loop (R2/R3 cadence) + evidence manifest universal ≈ one quarter. No structural ceiling identified.

---
Historical record: this file supersedes nothing and must not be overwritten; the pre-reconciliation full report and per-line evidence remain in the machine-local bundle listed in the header, pending promotion via EvidenceManifest v1.

---

# R1 — Launch architectural truth (Claude, 2026-07-26, implementation-in-progress)

Appended, not overwritten. Everything below is re-measured against the live WIP; audit
numbers were NOT taken on faith, and three of them are corrected here.

## R1.A Official authority model (supersedes section 3's table where they differ)

ONE authority per channel, resolved by `resolveVisualAuthority`
(`theming/foundation/visual-authority/index.ts`), which suppresses per-channel from the
artifact's own `coverage` manifest and throws on an invalid declaration.

**Cascade law, now singular** — production precedence, ascending:

```
rottay-framework < rottay-reset < rottay-tokens < rottay-motion < rottay-components
  < rottay-engines < rottay-personality < rottay-responsive
  < consumer components/utilities
  < [UNLAYERED] font-pack :root -> tenant artifact (0,1,1) -> ds-chrome-<tenant> -> skin-pack -> app CSS
  < inline documentElement.style
```

- **Tenant paint is UNLAYERED by law** (`cascade-layers: TENANT_PAINT_IS_UNLAYERED`). Both
  emitters agree: the static vertical artifact in each bundle and the runtime DB artifact
  injected during SSR. Required by the coverage model — the artifact must win every channel
  it declares.
- **`rottay-tenants` is DELETED from the declared order.** It received zero rules in all five
  shipped bundles while sitting one rank BELOW `rottay-personality`, i.e. the source asserted
  that the subordinate bridge outranked the tenant authority. Production always did the
  opposite, correctly.
- **CORRECTION to the audit's 4.2**: there was no dev-vs-prod cascade divergence. Every
  `./styles/*` package export resolves to `dist/`, and `build-vertical-css.mjs` composes from
  `base.css` + the artifact **by path**, never reading the vertical entrypoints. Those
  entrypoints are dead source; their `layer(rottay-tenants)` described a layer no bundle ever
  had. The defect was a false claim, not a divergence.
- The guard now reads the **shipped bundles**, not `src/`
  (`cascade-layers.test.ts` -> `shipped bundle parity`).

## R1.B Channel matrix — declared / emitted / consumed-in-Modern / tenant-reachable

Emitted column measured by compiling a real DB row; Modern-consumption from the
tenant-channel gate (1615 channels; 248 dead-in-modern = 236 never-consumed + 12 frozen-only).

| Axis | Emitted from DB doc | Modern consumers | Tenant-reachable | Verdict |
|---|---|---|---|---|
| color/semantic palette | yes (ramps 50-900, bg/text/border, chart 1-10) | 270 modern blocks | 31 tokens | LIVE |
| typography | yes (family base/heading, type-scale, tracking) | 132; `--ds-type-*` 77 reads | 76 tokens | LIVE |
| shape/radius | yes (`--ds-radius-scale`, `-button`) | 47; 417 reads | 4 tokens | LIVE |
| elevation | yes (`--ds-elevation-1..3`) | 88 | 4 tokens | LIVE |
| textures/effects | yes (`--ds-effect-intensity`) | 5; 15 reads | via chrome families | THIN |
| anatomy/material/chrome | partial (sidebar only from doc) | 152; 20 anatomy selectors | 167 tokens | PARTIAL |
| density | yes (`--ds-density-mode-factor`) | **0 direct**; derived to `--ds-spacing-*`; 33.6% of modern padding/gap | 1 token | INDIRECT |
| motion | not in this row | 22; 797 reads | via `general.motion`, not allowlist | LIVE, off-allowlist |
| borders | color only | 144 | 2 tokens | GEOMETRY UNREACHABLE |
| spacing | **no** | 81 | 1 token | NOT REACHABLE from doc |
| overlays | **no** | 11 (thinnest) | 7 tokens | NOT REACHABLE from doc |
| responsive posture | **no** | 5, undeclared | **no route at all** | ABSENT |
| recipe profile | yes (`--ds-recipe-profile`) | **0 `var()` reads** | registry select only | NOT A CSS AXIS |

`--ds-type-*` and `--ds-material-*` ARE Modern-consumed (0 in the dead baseline) — correcting a
common assumption. 213 of the 236 never-consumed are premium-card namespaces.

## R1.C Why the acid test fails — now quantified

Numeric axes are clamped TWICE: by the global schema, then more tightly by the owning vertical
envelope (`tenant-theme/index.ts:71-88`). For a **bithire** tenant:

| Axis | Range | Movement |
|---|---|---|
| typeScale | 0.92–1.08 | ±8% |
| radiusScale | 0.8–1.2 | ±20% |
| densityScale | 0.85–1.15 | ±15% |
| effectIntensity | 0–0.65 | capped |

Geometry therefore *cannot* carry a "different system" impression; only palette, font family
and chrome can. That, plus four axes with no document route at all, is the mechanical reason
the platform reads as one product re-skinned. This is a **product decision to revisit**, not a
bug: widening the envelope is a one-line change per vertical, with visual consequences.

## R1.D Root-attribute writers

| Attribute | Writers | State |
|---|---|---|
| `data-theme` | app layout JSX + app head script + DS ThemeProvider `provider/index.tsx:1113` | **3** — OPEN |
| `color-scheme` (inline) | app head script + DS `:1115` | 2 — OPEN |
| `lang` / `dir` | app `layout.tsx:170` (server) + DS `I18nProvider:159` (client) | 2 mechanical, 1 logical; **inputs differ** (server never reads session) — OPEN |
| `data-engine` | DS only, **client-only, no SSR stamp** | OPEN |
| `data-density` | DS `foundation/density/index.ts:125` | single |

DS `ThemeProvider` cleanup at `:1137-1156` unconditionally `removeAttribute('data-theme')` —
including the value the SERVER stamped, which it never created. OPEN.

## R1.E i18n (implemented)

- `DEFAULT_LOCALE: 'es' -> 'en'` (`i18n/kernel/contracts:27`).
- **CORRECTION to 4.8**: `'es'` was live in exactly ONE path with zero non-test callers. The
  real mount point hardcoded the literal `'en'` (`bootstrap/.../provider:644`), bypassing the
  constant — so the constant's own claim to be the single declaration was false. Now wired.
- Invalid locale used to CRASH (`LOCALE_CONFIGS[locale]` -> `undefined` -> `config.code` throws).
  Now normalized through `toSupportedLocale`. **Fixed.**
- New terminal `floor` tier: a miss renders English instead of echoing a raw dotted key. The
  configured fallback is still consulted FIRST, and a caller's `tOr` floor outranks English.
- Root `lang`/`dir` writers remain 2; server/client inputs still differ. OPEN.
- BitHire excludes `ar` (`APP_SUPPORTED_LOCALES = ['en','es']`), so RTL is unreachable there.

## R1.F Cascade conflicts found (app tier) — measured, not inherited

| Finding | Prior claim | Measured |
|---|---|---|
| app `--ds-*` definitions | "150 at `:root`" | **409** across 44 files; 150 at bare `:root` in ONE file |
| of those, hard literal colors | "106 paint locks" | **ZERO**; 82% re-derive from DS tokens |
| app `:root` vs artifact | "wins 97" (retracted) | **LOSES 97** — dead code that reads as authority |
| `!important` | "1,316, 106 locks" | 1316 confirmed; **exactly 1** hard literal colour lock; 968 are geometry |
| **app `@layer` usage** | not measured | **ZERO in all 907 app CSS files**, while DS dist is 89.7% layered |
| app selectors beating the artifact | "tie by source order" | **168 `:root[data-ds-root]` at (0,2,0) beat it outright**, all in `detail-chrome.css` |

**The dominant finding is the layer asymmetry**: unlayered app CSS categorically outranks 89.7%
of the DS artifact with no `!important` needed, so the `!important` census is largely
cascade-redundant. Corollary: an app that *correctly* layers its CSS cannot override the tenant
artifact at all. **Recommended R3 action: give app CSS an `@layer`** — highest leverage available.

## R1.G Gate truthfulness (verified, all P0)

1. **The production deploy gate cannot fail.** `rottay/.github-workflows/nextjs-ci.yml@v1.8.2`
   uses `set +e` + `pnpm typecheck 2>&1 | tee`, then reads `$?` — the exit code of `tee`.
   `set -o pipefail` appears nowhere in the file. Typecheck, lint and test all `exit 0`
   regardless of failures; the summary prints "Failed" under a green check.
   `deploy-production` needs only that job.
2. **`app-bithire-pr-gates.yml` has no `push: main`** while its own decision-record comment
   claims it does. With work-on-main convention the certification chain never runs on shipped commits.
3. **16 of 17 `pretest` gates never fire in CI** — CI runs `test:ci`, and npm fires `pre*` only
   for the exact script `test`. Their drills DO run, so the dashboard is greener than the code.
4. `cra12:check` is laundered with `|| echo`. 9 gates have no negative drill; `cra-14` and
   `csssource` are BLOCKING with zero self-proof. 12 gate scripts are orphaned entirely.

## R1.H Other confirmed defects (recorded, not fixed in R1)

- **`personality-paint.css` is ORPHANED** — no entrypoint imports it; its content is absent from
  `dist/bithire.css`. The MOT-03 reduced-motion zeroing of `--ds-motion-*` and the unlayered
  preflight-defeat channel are NOT SHIPPING.
- **Inline `documentElement.style` writers outrank everything**, including the tenant artifact:
  `ThemeProvider:408-414` and `:883-891` (gated by `visualAuthority`, which **defaults to
  `'provider'`**), plus the skin-pack runtime.
- **Arabic tracking guard is outranked by tenant paint.** It is layered; tenant paint is not, so
  the artifact wins `--ds-letter-spacing-{display,heading,body,mono}` on a root-Arabic document.
  Comment corrected; behaviour left for sighted certification (`ar` is not enabled in production).
- **`app-bithire/CLAUDE.md` cites `--ds-button-ghost-text` as a real engine hook — it does not
  exist** in the DS, and it is the stated justification for keeping `DS_DEFINITION_ALLOWLIST` empty.
- Anatomy variants hard-code REMOVAL (`border: 0`, `box-shadow: none`) and var-indirect
  REPLACEMENT, so a tenant cannot re-enable geometry a variant zeroed.

## R1.I What R1 changed

| File | Change |
|---|---|
| `theming/foundation/cascade-layers/index.ts` | `rottay-tenants` removed; `TENANT_PAINT_IS_UNLAYERED` added with the law |
| `theming/facade/index.ts` | export `TENANT_CASCADE_LAYER` -> `TENANT_PAINT_IS_UNLAYERED` |
| `tokens/css/facade/entrypoints/{base,styles,bithire,evnto,platform}.css` | artifacts unlayered; order corrected; false precedence note replaced |
| `scripts/build-vertical-css.mjs` | rationale rewritten (dead DaisyUI premise removed) |
| `styles/*.css`, `dist/*.css` | regenerated; declared order no longer names an empty layer |
| `i18n/kernel/contracts/index.ts` | `DEFAULT_LOCALE='en'`; `TRANSLATION_FLOOR_LOCALE`; `floor` tier |
| `i18n/runtime/resolution/translation/index.ts` | English terminal floor; `tOr` outranks it |
| `runtime/i18n/.../provider/index.tsx` | delegates tier decisions instead of duplicating them |
| `runtime/bootstrap/.../provider/index.tsx` | locale normalized; hardcoded `'en'` literal removed |
| `tenant-theme/fixtures/themanagement-db-row/` | **NEW** — realistic DB row |
| `compilers/composition/tenant-theme/tests/db-row-canary.test.ts` | **NEW** — 20 assertions |
| `cascade-layers.test.ts`, `personality-subordination.test.ts` | pin the new law; drill re-anchored |
| `responsive/language-arabic.css` | false override claim corrected |

Validation (serial, one at a time): typecheck 0 · pretest 0 (17 gates) · build 0 ·
`git diff --check` clean · focal suites 289/289 across 28 files.

---

# R1 closure wave — corrections and completions (Claude, 2026-07-26)

Appended. This section CORRECTS several claims in the R1 section above, including
some of my own. Every number below was re-measured after the changes landed.

## C1. Claims corrected in this wave

| Earlier claim | Status | What is true |
|---|---|---|
| "168 `:root[data-ds-root]` selectors beat the tenant artifact" (as a category) | **OVERSTATED** | Selector shape alone does not decide it. Measured properly: of 401 app `--ds-*` declarations, **253 are SCOPED** feature-level hook assignments and are legitimate by construction. The real violation class is bare-`:root` declarations, and it splits three ways (C4). |
| "MOT-03 reduced-motion and P-76 paint are NOT SHIPPING" (`personality-paint.css` orphaned) | **FALSE** | Verified directly: `transitions.css:427` (`@media reduce`, 13 tokens, `!important`) and `personality.css:776` (`[data-ds-motion='reduced']`, 13 tokens, `!important`) both ship. The orphan zeroed only 5 tokens without `!important` and its `.card .card-title` selectors are Daisy-era classes that no longer exist. It was SUPERSEDED LEGACY, and has been deleted. |
| "`--ds-button-ghost-text` does not exist / was invented" | **IMPRECISE** | It was REAL at 2.19.29 as a legacy second fallback: `color: var(--ds-button-ghost-color, var(--ds-button-ghost-text, …))`. The DS removed it, leaving 8 app writes painting nothing. All 8 removed; `app-bithire/CLAUDE.md` corrected to `--ds-button-ghost-color`. |
| "dev and prod resolved the cascade differently" | **CORRECTED IN-WAVE** | Every `./styles/*` export resolves to `dist/`; the vertical entrypoints are dead source. It was a false CLAIM in the source, not a divergence in behaviour. |
| R1 "~72% complete" | superseded | See C8. |

## C2. A vacuous test, found and removed

`personality-subordination.test.ts` asserted
`indexOf(PERSONALITY) > indexOf('rottay-tenants')`. After `rottay-tenants` was
deleted from the order, `indexOf` returned `-1`, so the assertion was `8 > -1` —
true for every possible input, including a total inversion of the cascade. It was
green because it had stopped measuring anything.

Replaced with the property read off **shipped bytes** (personality layered,
tenant paint unlayered, no layer reserved, contention resolves to `artifact`),
plus a drill that reintroduces a tenant layer and proves the bridge would win.

The same defect existed in the DB canary: it filtered to axes both sides declared
and asserted `comparable.length > 0`, and it probed `--ds-density-scale`, which
the DB path never emits. Rewritten as an exact 9-axis table; drill verified by
collapsing the tenant's radius to the baseline and confirming only that axis fails.

## C3. CI is now fail-closed

- `nextjs-ci.yml` typecheck/lint/test read `result=$?` after `cmd | tee` — the exit
  code of `tee`. Fixed with `${PIPESTATUS[0]}`. The workflow declares no `shell:`,
  so GitHub runs `bash -e` **without pipefail**; that is why the defect existed.
  Hermetic drill at `.github-workflows/tests/pipeline-exit-code.test.sh`.
  **Not published or tagged** — `app-bithire` stays pinned to `v1.8.2` until the
  owner publishes. This is the one item that needs external authority.
- `app-bithire-pr-gates.yml` gained the `push: main` trigger its own decision
  record claimed. `notify-main-failure` is no longer dead code.
- The 16-gate `pretest` chain now runs in CI: `scripts/ci-gates.manifest.mjs` is
  the single inventory, `pretest` and the CI step both call `gates:ci`.
  **19 blocking gates**, deterministic order, fail-fast, per-gate summary.
  `blocking: false` structurally REQUIRES a recorded owner and reason, so
  `|| echo "::warning"` is unrepresentable.
- CRA-12 split: `--repositories` restricts the audit, and stale-row detection is
  scoped to audited repos (36 → 12 findings). It is **genuinely RED** — ratchets
  grew (`593 > 507`) from concurrent work — so it is EXCLUDED with an owner and a
  reason. The baseline was **not** widened.

## C4. The app boundary law (replaces the "907 files" framing)

`scripts/app-ds-boundary-gate.mjs` classifies every app `--ds-*` declaration by
its enclosing selector, measured against what the DS actually ships:

| Bucket | Count | Verdict |
|---|---|---|
| SCOPED — feature-level hook assignment | **253** | **legitimate**; this is how an app tunes a component it renders |
| SHADOWED — bare `:root`, artifact also declares it | **97** | dead code that reads as authority; artifact (0,1,1) beats app `:root` (0,1,0). Decrease-only debt |
| GLOBAL-OWN — bare `:root`, DS defines it only inside a layer | **27** | the real violation: unlayered app CSS outranks every DS layer, so the app IS the global authority |
| ORPHAN — bare `:root`, nothing consumes it | 24 → **0** | removed |

The 27 GLOBAL-OWN are frozen (never allowed to grow) rather than drained, because
each needs a destination decision — vertical BrandTheme, DS owner, or `--rt-*`.
That is R3 work with visual review, not a mechanical rename.

## C5. Root-attribute ownership

`data-theme` had three writers and the provider cleaned up with a bare
`removeAttribute`, deleting the SSR stamp on every dependency change, on unmount,
and twice per mount under StrictMode. Replaced with ownership-aware claims
(`runtime/foundation/root-attributes`): record the prior value, restore it only
while still the owner, idempotent, and distinguish absent from empty.

`runtime/foundation/root-attributes/ssr` is the canonical projection —
`data-theme`, `data-tenant-theme-mode`, `data-engine`, `lang`, `dir`, tenant
scope — and is exported from the server entrypoint. It **never** resolves `auto`
on the server; the pre-paint script does exactly that one refinement and returns
early for any explicit mode. `data-engine` now has an SSR stamp, so engine-scoped
CSS matches on the first paint.

## C6. Arabic root tracking — fixed

The layered guard could not reach the one unlayered emitter, so a tenant's
negative display tracking won on a wholly-Arabic document. `language-arabic-root.css`
adds an UNLAYERED `html[lang]:lang(ar)` at (0,2,1) — beating the artifact's
(0,1,1) **without `!important`**, so an application can still override it
deliberately. Nested `lang="ar"` was never affected (custom properties resolve
from the nearest declaring ancestor). A drift test pins the two token lists equal.

## C7. Still open

- **Phase 6 remainder**: the canary is compiler-level and fixture-backed. The
  `DB row → reader → SSR style → hydration reuse` integration path is NOT covered.
  It must not be called "live DB".
- **27 GLOBAL-OWN** app declarations, and the 97 SHADOWED, await destination
  decisions.
- **App cascade layers** (`rottay-app-*`) not introduced: ordering them against
  DS-layered + tenant-unlayered needs the GLOBAL-OWN decisions first.
- **CRA-12** motion debt (12 DS findings).
- **`v1.8.2` publish** of the fixed reusable workflow — owner action.
- **SIGHTED_PENDING (Codex)**: BitHire vs The Management on one tree; Arabic root
  rendering; anything the anatomy axes touch.

## C8. Honest completion

R1 is **~85%** by the exit criteria of the closure wave: 6 of 8 phases closed
(1, 2A/2B/2C, 3, 4, 5-gate, 7.2, 7.4), Phase 6 partially, Phase 8 here. The
remaining 15% is concentrated in the DB→SSR→hydrate integration and the
GLOBAL-OWN destination decisions.

No capability in this section is described as LIVE on fixture or source evidence
alone.

---

# R1 — Codex remediation round (2026-07-26)

Codex audited the closure wave and did not accept it. Six blockers; five closed
here, one requires external publish authority. Every claim below was reproduced
before it was acted on.

## R1.1 Blocker matrix

| Blocker | Cause | Fix | Evidence |
|---|---|---|---|
| CI step referenced a script that does not exist | `pnpm run gates:ci:list` from the repo root; the script lives only in `packages/core`. The step was also mislabelled "CRA-12 motion governance" while it only printed a manifest. | Step removed. New `workflow-script-wiring-gate` resolves every `pnpm run <script>` in every workflow against the directory the step actually runs in. | Re-injected the exact bug → gate red with the precise message. 31 references scanned; a non-vacuity floor fails a scan that matches nothing. 7 permanent drills in `workflow-script-wiring-gate.test.mjs`. |
| Boundary gate green without a corpus | `app-ds-boundary-gate.mjs` returned 0 when `app-bithire` was absent, while wired as blocking — "green because it did not look", inside the gate meant to prevent exactly that. | Fail-closed. `--optional` is explicit and the manifest validator **forbids** it in any blocking entry. `--app-root` / `APP_BITHIRE_ROOT` accept an explicit corpus; the DS workflow now checks `rottay/app-bithire` out at a pinned ref and passes the path by environment. The gate prints the corpus path and SHA. | 8 drills, including a GitHub-Actions path layout (corpus OUTSIDE the workspace) proving the sibling default fails and the env var resolves. |
| Ownership decided by value | Two claims carrying the SAME value were indistinguishable: `SSR=light; A→dark; B→dark; release(A)` restored `light` while B was still mounted. | Rewritten around claim IDENTITY: a `WeakMap` registry with a per-element, per-channel stack. Releasing a non-top claim mutates no DOM; releasing the top restores the next claim or the SSR baseline. | Codex's exact scenario reproduced as a failing test, then fixed. 31 assertions, with same-value drills for attributes, inline styles **and** classes, plus registry-drain checks. |
| BitHire ignored the canonical SSR contract | `layout.tsx` assembled `lang`/`dir`/`data-theme` by hand and never stamped `data-engine`, so engine-scoped CSS missed the first paint. | Migrated to `resolveDocumentRootAttributes` + `buildThemePrepaintScript`. `lang`/`dir` are destructured from the SAME projection so `jsx-a11y/html-has-lang` can still prove them — one source, statically checkable. | 9 behavioural tests. The test that pinned the literal JSX string `data-tenant-theme-mode={configuredTheme}` was rewritten to assert values; it had passed while the attribute was hand-assembled and could never have caught the missing `data-engine`. |
| CRA-12 excluded | 12 findings looked like R1 regressions. | See R1.2. | — |
| Reusable workflow unpublished | `${PIPESTATUS[0]}` fix is correct but `v1.8.2` is still the published tag. | Release note prepared; pin left at `v1.8.2`. | Requires publish authority — see R1.3. |

## R1.2 CRA-12: reconciled to the accepted commit, and blocking again

**The finding that changes the verdict.** Scanning a clean `git archive` of the
ACCEPTED commit `a5a4c3b4` reproduces every current finding exactly:

| Channel / scope | At `a5a4c3b4` | Registry (2026-07-17) |
|---|---|---|
| `raw-motion-timing` / `ds-internal` | **593 in 234 files** | 507 in 174 |
| `raw-motion-timing` / `test` | **48 in 16** | 38 in 7 |
| `global-keyframes` / `test` | **25 in 6** | 22 in 4 |

None of the 12 is an R1 regression. The registry was authored before the R0
commit that was later reviewed and accepted, and never caught up.

The `ui-design-system` rows were therefore re-anchored **once**, to that named
commit. Two channels moved DOWN and were tightened accordingly:

| Channel / scope | Before → after | Direction |
|---|---|---|
| `global-keyframes` / `ds-internal` | 243 → 130 (56 → 16 files) | tightened |
| `transition-all` / `ds-internal` | 86 → 76 (52 → 46 files) | tightened |
| `raw-motion-timing` / `ds-internal` | 507 → 593 (174 → 234) | inherited debt |
| `raw-motion-timing` / `test` | 38 → 48 (7 → 16) | inherited debt |
| `global-keyframes` / `test` | 22 → 25 (4 → 6) | inherited debt |

Each re-anchored channel carries a `reanchor` record naming the snapshot SHA,
the date, the owner, and two statements the drills enforce: that **593 is
inherited motion debt, not an achievement and not a licence to add more**, and
that this is a one-off reconciliation against a named commit, **not** the routine
way to update a baseline.

`blocking: true`. `excluded` is gone from the manifest. `gates:ci` reports
**23 PASS, zero SKIP**.

Reducing the 593 is a Kimi visual wave scoped to Modern and prioritised by
impact. It is **not** R1 work, and R1 does not depend on it.

## R1.3 Workflow `v1.8.3` — prepared, not published

`RELEASE-NOTES-v1.8.3.md` is written. `app-bithire` remains pinned to `v1.8.2`;
the working tree does **not** reference a tag that does not exist.

Sequence for Codex:

```
a. cd .github-workflows
   git add .github/workflows/nextjs-ci.yml tests/ RELEASE-NOTES-v1.8.3.md
   git commit && git push origin main
b. git tag v1.8.3 && git push origin v1.8.3
c. cd app-bithire && edit .github/workflows/ci.yml: @v1.8.2 -> @v1.8.3
d. git commit && git push origin main
e. git rev-parse HEAD   # pin this SHA into the DS cross-repo checkout
   (ui-design-system/.github/workflows/ci.yml, repository variable
    APP_BITHIRE_BOUNDARY_REF)
f. cd ui-design-system && git commit && git push origin main
```

Expect previously-green pipelines to go red on the first `v1.8.3` run. Those are
real failures that were being suppressed.

**Secret required:** `ORG_REPO_READ_TOKEN`, fine-grained, `Contents: read` on
`rottay/app-bithire`. `GITHUB_TOKEN` is scoped to a single repository and cannot
clone the sibling.

## R1.4 Status

- Closed: workflow wiring, boundary corpus, claim ownership, BitHire SSR
  adoption, CRA-12 reconciliation, permanent wiring drills.
- Pending external authority: publishing `v1.8.3` and pinning the corpus SHA.
- **Not visually accepted.** No claim here rests on rendered output; the
  BitHire-vs-The-Management comparison is Codex's R2 work.
- The DB canary remains **compiler-and-fixture level**. The reader → compiler →
  SSR → hydration seam is covered; a live database is not, and is not described
  as one.

---

# R1 final audit and publication decision (Codex, 2026-07-26)

This section supersedes the publication details and completion percentage above.
Codex reproduced the handoff, audited the residual suite instead of accepting
the historic baseline, repaired the remaining contract defects, and authorized
publication.

## F1. Additional defects found by the final audit

The reported legacy baseline was not acceptable as an exit condition. A focused
run of its 20 affected files initially produced 36 failures. Each was adjudicated
against observable runtime ownership:

- Modern-only deep-anatomy assertions no longer require frozen Rustic engines to
  expose private Modern parts. Rustic remains protected by the engine-freeze gate.
- `TagInput` now preserves the canonical `tag-chip` part through its composed
  `Tag`, following caller-wins anatomy.
- selection previews, loading overlays, bulk-select labels, inline edit fields,
  Tooltip collision placement, Transfer opacity, Slider focus, Upload progress,
  OAuth transition and preview CSS contracts were updated to their shipped
  observable behaviour rather than stale topology or byte pins.
- the root-attribute authority test was hardened so helper stack frames and
  release-only frames cannot masquerade as independent writers.
- responsive Input/TextArea radius is emitted through canonical custom
  properties instead of an inline `border-radius`, preserving tenant control.
- the last full DS run found one additional stale contract: `MarkdownView`
  expected `layer(rottay-engines)` after R0 had already removed the generic
  `[data-tenant] a.link` bridge that justified that workaround. The family skin
  is correctly owned by `layer(rottay-components)`; the contract now pins that
  owner and negatively asserts that the legacy bridge cannot return.

No test was skipped, deleted to hide a runtime contract, or replaced with a
snapshot/hash assertion.

## F2. Final evidence

| Check | Result |
|---|---|
| R1 residual DS tranche | **411/411 passed** across 20 files |
| Root-attribute authority focal | **5/5 passed** |
| MarkdownView final focal | **13/13 passed** |
| Last full DS run before the one-line Markdown contract correction | **10,627 passed, 1 failed, 18 skipped** across 840 files; the sole failure was the corrected Markdown ownership pin |
| DS blocking gates | **23/23 passed**, zero excluded |
| DS typecheck | exit 0 |
| DS production build | exit 0 |
| BitHire contract suite | **1,203/1,203 passed** across 114 suites |
| BitHire typecheck | exit 0 |
| BitHire ESLint (`--max-warnings 0`) | exit 0 |
| BitHire production build | exit 0; **141/141 pages** generated |
| Reusable-workflow positive/negative drill | exit 0 |

The full DS suite was not repeated for another ~30 minutes after changing only
the stale Markdown expectation. Its sole red file was rerun directly and all 13
tests passed; every blocking gate, typecheck and production build was then run
from the final tree.

## F3. CI publication

The reusable workflow patch is released as **`v1.8.6`**, not the earlier
provisional `v1.8.3`:

1. `.github-workflows` publishes the `PIPESTATUS[0]` fix, its hermetic negative
   drill, changelog and release note under tag `v1.8.6`.
2. `app-bithire` pins `rottay/.github-workflows/.../nextjs-ci.yml@v1.8.6`.
3. The DS boundary workflow pins the exact published BitHire commit as its
   cross-repository corpus, so a moving `main` cannot silently change the gate.

## F4. Exit verdict

**R1 is technically accepted and closed.** This means authority, hydration,
English-default i18n, DB-fixture compilation, CI failure propagation, cross-repo
boundaries and buildability are stable enough to begin the visual canary.

It does **not** certify premium craft. R2/R3 remain sighted work:

- BitHire Candidates is the critical product path.
- The Management is the real DB-backed visual pivot used to prove that the same
  Modern tree can look materially different.
- the 27 `GLOBAL-OWN` and 97 `SHADOWED` app declarations are a decrease-only
  migration inventory; their destinations require visual decisions rather than
  mechanical renames.
- live-database operation is still not claimed by a fixture-backed compiler test.
