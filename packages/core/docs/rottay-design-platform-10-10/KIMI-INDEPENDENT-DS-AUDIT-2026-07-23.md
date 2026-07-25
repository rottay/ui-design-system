# Kimi Independent Design-System Audit — 2026-07-23

Status: independently audited by Codex; partially accepted with factual
corrections. The authoritative reconciliation is
`CODEX-RECONCILIATION-KIMI-AUDIT-2026-07-23.md`. In particular, the
`MaterialSurface`, 1,026-literal, canonical-surface and public-density-helper
claims must not be implemented as originally written.

Original status: independent audit and proposal only. No implementation, dependency,
ledger, registry, generated-artifact, commit, push, PR or publish change was
made. The dirty worktree and stash were preserved.
Auditor: Kimi (independent senior frontend / design-systems auditor)
Scope: the Rottay Design Platform 10/10 program, verified from code and
executable gates, not from program documentation.

Method note: every claim below was checked against source, colocated tests,
gate baselines or a live read-only gate run. Where documentation and code
disagree, the code wins and the disagreement is listed as doc drift. I did not
run the showroom or a browser: starting the Next dev server or Playwright
writes `.next`/test artifacts (generated output this engagement forbids), and
the committed production evidence matrices are current. Visual findings are
therefore code-evidence-based and advisory; Codex remains the sighted
authority.

---

## 1. Verification of the program's current claims

| Claim | Verdict | Evidence |
| --- | --- | --- |
| 92 public primitive families | **Confirmed as the ledger denominator; physically 93 exported** | All 89 engine-backed families exist with physical `engines/{classic,modern,rustic}/index.tsx` siblings, plus public `CodeBlock`, `MarkdownView`, `VoiceInputButton`. But `layout/SemanticSurface` is also publicly exported (`ui/primitives/layout/index.ts:19-27`, single implementation, "CodeBlock precedent" header) and has **no ledger row** — a 93rd public family outside the certification denominator. `layout/MaterialSurface` is dead code (contracts + tests, no `index.tsx`, zero references). |
| 14/92 certified primitives (15.2%) | **Confirmed, exact** | `COMPONENT-LEDGER.md`: exactly 14 `accepted/accepted` rows (Card 96, Tooltip 95, Typography 97, Button 96, AspectRatio 90, Box 92, Container 93, Divider 93, Flex 91, Grid 92, Space 91, Stack 91, Tabs 95, Popover 95). |
| 119 total certification artifacts; 14/119 (11.8%) | **Confirmed** | 92 primitives + 15 cross-product + 6 surfaces + 6 AI families; 14 accepted. |
| 1,615 tenant channels, 236 acknowledged dead | **Confirmed live** | Read-only run of `scripts/tenant-channel-consumer-gate.mjs`: 1,615 inventoried (293 override tokens, 1,302 emitted chrome, 10 chart-series, 10 anatomy), 236 dead, 0 new, 0 revived. Dead-channel breakdown: 213 premium-card namespace fields, 19 contract/chrome, 4 dark-seed tokens. **Zero `--ds-material-*`/`--ds-surface-*` channels are dead** — the OLA-1 finding "119 semantic-material channels with no consumer" has been genuinely remediated by the OLA-4 `SemanticSurface` work. |
| Ownership ratchet of 4,074 findings | **Confirmed, exact** | `pattern-surface-ownership-gate.baseline.json` (scope `src/ui/patterns` + `src/ui/surfaces`): local-svg 49, native-interactive 296, primitive-reconstruction 94, shared-chrome-literal 3,308, utility-class 327 = 4,074. Decrease-only, path-keyed. |
| 89 engine-backed primitives + CodeBlock/MarkdownView/VoiceInputButton | **Confirmed** | Exhaustive engine-trio check; 87/89 dispatch via `createEngineComponent()` (Message and Notification dispatch imperatively via `useEngineContext()` — a deliberate but undocumented exception). |
| Classic, Modern and Rustic engines exist; Modern prioritized | **Confirmed** | 136/132/130 physical engine implementations (primitive+pattern+structure) per the documented count method. |
| DaisyUI 5.5.19 confined to an internal Modern projection | **Confirmed, and better than documented** | Single `@plugin "daisyui"` integration (`foundation/tokens/css/runtime/engines/modern/compiled.css:6`), pinned projection contract (`scripts/daisy-projection-contract.test.mjs`, `PINNED_DAISY_VERSION = "5.5.19"`). Baseline `daisy.classConsumers = 15`; **live count is 12** — the ratchet is ahead of its locked ceiling and should be re-locked at 12. Residuals: Alert, Callout, Carousel, Progress, Statistic, Timeline, Slider, Steps, Stepper, AlertDialog + two patterns. |
| Static `BrandTheme` and DB Appearance emit the same canonical `--ds-*` channels | **Confirmed** | Both compilers share `chromeToVariables` (`infrastructure/compilers/kernel/runtime/brand-theme/index.ts:44,928`; `.../appearance/index.ts:50,511` — comment "Full chrome parity with BrandTheme"). Same APCA pass, same merge order (DS base → vertical → BrandTheme → Appearance General → Advanced → compiler ramps last). Selector scoping differs by design. |
| Application code cannot become another design system | **Partially true** | The boundary gates are real and honest (application-boundary: 165 sites/47 distinct private-anatomy reaches, 563/170 raw shared-chrome literals, 17/13 undocumented `--ds-*` writes, 0 supplier imports, 0 tenant branches). But these are **debt baselines, not remediated debt**; one Candidates stylesheet still carries a 5× repeated-class specificity hack to out-specify the DS secondary-button skin (`app-bithire .../evaluation/styles/index.css:32-34`, admitted in its own comment), and the i18n-bypass detector is declared-not-implemented. |

### Documentation drift found (doc says X, artifact says Y)

| Document claim | Artifact reality |
| --- | --- |
| `states.spec.ts` records 132 computed cells | `state-matrix.json` holds **216** cells (36 × 3 tenants × 2 engines); 132 is the Button-only subset. |
| "1,026 existing hardcoded values" (OLA-4 audit) | No such counter exists in `engine-token-audit.baseline.json` (nearest: 1,126 files scanned). |
| "3,227 counters" (OLA-2) / "3,232" (OLA-4) | Baseline has exactly **3,232 keys**; the 3,227 figure matches nothing. |
| "stable 50-role icon facade corpus" (`CLAUDE.md`) | The governed corpus is **282 names** (`graphics/icons/.../corpus/manifest.json`, `expectedCounts.global: 282`); the `IconRole` union has 5 members. No 50-role set exists. |
| `css-layer-paint-gate` chained into `pretest` (`CLAUDE.md`) | It is **not** in the 14-gate `pretest` chain (runs as separate `csspaint:check`). |
| "6 canonical surfaces" exist as program targets | Only `ListSurface` exists in code (`surfaces/presentation/pages/data/list/index.tsx:273`). `OverviewSurface`, `RecordSurface`, `DecisionSurface`, `WidgetWorkspace`, `AIWorkspace` have **zero matches** in `src`; shipped analogues are `DashboardSurface`, `DetailSurface`, `CompareSurface`, `CollectionWorkspaceSurface`, `ChatSurface`. |
| `theme.css` is 626 lines | 617 lines (drifted down; the aggregate `themeCss.lineCount = 1,345` baseline counter is correctly labeled historical). |

None of this drift is dangerous by itself, but it is the exact failure mode the
program's own rule 17 warns about: counters and claims the baseline has never
heard of guard air. One documentation-hygiene ticket should reconcile them.

---

## 2. Current state and attainable ceiling (26-category scorecard)

Scores are 1–10: current quality today / realistic attainable ceiling with the
existing architecture (no rewrite). Each row cites evidence, the root cause
holding the score down, the highest-leverage improvement and its difficulty
(S/M/L).

| # | Category | Now | Ceiling | Evidence / root cause | Highest-leverage improvement | Diff. |
| --- | --- | ---: | ---: | --- | --- | --- |
| 1 | Foundation token architecture | 7.5 | 9.5 | Single canonical `--ds-*` authority verified; no second token system (zero `--ds-*` declarations in `theme.css`/`framework-bridge.css`). Root cause of remaining gap: 236 dead channels (15% of inventory) and historical-aggregate counters that no longer map to files. | Drain the 213 premium-card dead fields by wiring or deleting them; re-key historical counters. | M |
| 2 | Semantic-token completeness | 7.0 | 9.5 | 8 surface roles, 9 type roles, density/motion/state channels all declared and consumed (agent-verified). Gap: no border-strategy (style/dash), texture, or high-contrast-specific channel families. | Add border-style and texture channels only when a recipe consumes them. | M |
| 3 | Static `BrandTheme` | 8.0 | 9.5 | Typed, compiled, versioned; 3 first-party themes + fixtures. Gap: **no first-party theme selects a `recipeProfile`** — the contract's flagship feature is unused by its owners. | Set `recipes.profile` in the rottay/bithire/evnto themes. | S |
| 4 | DB Appearance and validation | 8.0 | 9.5 | Fail-closed compiler (`unsupported_schema_version`, unsafe-var rejection, byte/count caps, schema digests, `compilerVersion`, sha256 digest). Gap: DB `recipeProfile` typed as plain `string` (validation-time safety only). | Closed union type + migration alias. | S |
| 5 | Static-vs-DB equivalence | 8.0 | 9.5 | Shared chrome mapper; in-place static→DB→static switch proven green (`brand-locale-visual-matrix`, 12 cells). Gap: no same-tree density × locale equivalence proof (F2). | Deliver the F2 same-tree matrix (see §7). | S |
| 6 | Recipe/profile architecture | 6.5 | 9.5 | Typed namespaced profiles (`rottay/technical-sharp@1`, `rottay/editorial-round@1`), governed defaults for 6 families, provider precedence DB > static, fail-closed. Root cause: only 2 profiles, consumed by 6 of 92 families, selected by zero first-party themes. | Profile consumption as a certification requirement per family; author 2 more profiles (compact-technical, soft-humanist). | M |
| 7 | Typography | 6.0 | 9.0 | 9 semantic roles with declared defaults and Modern consumption via `textStyle`; Arabic-safe fallback is a final compiler invariant (idempotent, verified `appearance/index.ts:548-557`). Root cause: roles are **opt-in only** — implicit `Text` stays legacy `md`, so most rendered text never touches the role system; `Heading` has no accepted semantic default. | Deterministic default-migration fixture, then migrate `md`→`body` with sighted evidence. | M |
| 8 | Density | 6.5 | 9.0 | Three-plane separation is correct in code (structural scale / semantic mode factor / local scope with `:not(:root)` guard); root derives from Appearance only; 44px coarse floor irreducible. Root cause: only Input/Button geometry consume it end-to-end; no probe can sweep density. | Density-sweepable probe + wire control geometry family by family. | M |
| 9 | Color and emphasis | 7.0 | 9.0 | APCA pass in both compiler paths; ramps compiler-owned; 6 APCA exceptions baselined and visible. | Drain the 6 exceptions; keep colorDistance floors in matrices. | S |
| 10 | Surface/depth grammar | 7.0 | 9.5 | `SemanticSurface` 8 roles fully consumed (`semantic-surface.css`, 169 `var(--ds-material-*)` refs); dark-aware elevation hairline is a measured shared invariant (`signature.spec.ts`). Gap: glass backdrop cue unmeasured; product surfaces don't yet compose roles. | Adopt surface roles in patterns/surfaces; open-overlay glass fixture. | M |
| 11 | Border/radius/segmentation grammar | 6.0 | 9.0 | Radius scales compile per tenant (10px BitHire vs 6.08px The Management verified). Root cause: paint split across skins, `theme.css`, bridge and inline styles produces border/radius seams in uncertified families (Table inline literals). | One paint owner per family during certification. | M |
| 12 | Icon system and optical alignment | 8.0 | 9.5 | Semantic facade, 282-name governed corpus, 282 generated roles, Phosphor pinned and confined (302 refs, all inside `graphics/icons/`), `label` XOR `decorative` a11y contract, mirroring under `:dir(rtl)`. Gaps: no `@rottay/no-direct-phosphor` lint (test-enforced only); per-tenant icon weight/container recipes not exposed. | Add the lint rule; document icon-container tokens as a recipe axis. | S |
| 13 | Motion and transitions | 7.5 | 9.5 | 16 bounded typed recipes (≤500ms, compositor-only), reduced-motion resolves to final state at zero duration, legacy aliases drain to 120/200/320/500ms, cadence divergence measured (0.12s vs 0.3s). Gap: consumption breadth across the 78 uncertified families is unverified. | Recipe-consumption check per family certification. | M |
| 14 | Responsive/container behavior | 7.0 | 9.0 | 44 `@container` rules across 27 files incl. `ds-page/ds-collection/ds-rail/ds-detail`; DataTable mobile anatomy fixed with deterministic specificity. Gap: some viewport-driven behavior remains; hover/state evidence is desktop-skewed. | Container-first rule in certification; mobile state cells in matrices. | M |
| 15 | Accessibility and input-modality parity | 6.5 | 9.5 | axe-core Playwright with decrease-only baseline; 44px floor enforced in CSS; focus-indicator invariants in `states.spec.ts`. Root cause: the hardest controls (Select 1,138 LOC, DatePicker 1,267 LOC) are hand-built ARIA with no screen-reader evidence; state matrices cover Button/Card/table-row only. | Behavior-supplier bake-off (DS-S002) for complex controls. | L |
| 16 | i18n and RTL | 7.5 | 9.5 | 5 locales (en/es/ar/pt/fr), namespaced catalogs, Intl formatters, RTL real (logical properties, mirrored icons, RTL resize math). Gaps: **no `Intl.PluralRules`/ICU plurals**; app-bithire runs a parallel app-level `useT` beside DS `I18nProvider`; i18n-bypass detector missing. | Plural support in the formatter layer; one translation hook contract. | M |
| 17 | Primitive contract quality | 7.0 | 9.0 | Consistent `data-*`/slot contracts, engine dispatch uniform (87/89), 62-prop DataTable contract. Gaps: two Modal families; Message/Notification imperative exception; `densityScopeAttributes` not root-exported. | DS-CAN009 consolidation; export the canonical density helper. | S |
| 18 | Primitive default visual quality | 4.5 | 9.0 | The certified 14 prove the bar is reachable. Root cause for the fleet: hand-made engines with mixed idioms — Table modern has 38 inline-style sites incl. `fontSize: 12` literals; Upload modern mixes 17 inline styles + 12 raw Tailwind utilities (`z-[9999]`); Slider still Daisy-`range`; 12 Daisy class consumers remain. | Certification waves K1–K4 (see plan document). | L |
| 19 | Patterns and structures | 5.5 | 8.5 | DataTable/WidgetBoard are functionally deep (8-direction RTL-aware resize, keyboard sliders, persistence). Root cause: 4,074 ownership findings inside patterns/surfaces — patterns reconstruct chrome and own private paint. | Drain the ownership baseline family-first as patterns get certified. | L |
| 20 | Canonical surfaces | 3.0 | 8.5 | 51 physical surface entrypoints exist, but 5 of the 6 canonical names don't exist in code; surfaces overwrite primitive `data-part` anatomy (fixed by Codex in OLA 3 after 4 real failures). | Build the 6 canonical surfaces as named owners on accepted patterns. | L |
| 21 | Application boundary | 6.0 | 9.0 | Two executable decrease-only gates with honest "what we don't prove" banners; zero supplier imports; zero tenant branches; symlinked local DS verified. Root cause: 165/47 + 563/170 + 17/13 baselined debt; one admitted specificity hack; i18n-bypass invisible. | Migrate app reaches to public `data-part` slots; implement i18n-bypass detector. | M |
| 22 | White-label differentiation | 6.5 | 9.5 | Divergence beyond color is proven (type pairing, radii 0 vs pill, density 0.92 vs spacious, depth, control anatomy; colorDistance > 24 primary; full-page divergence > 0.20). Root cause: proven only on the specimen families (6); recipe profiles unused by first-party themes. | Profiles on first-party themes + per-family divergence assertions. | M |
| 23 | Automated gates | 8.5 | 9.5 | 14-gate serial pretest; decrease-only ratchets with checked-in baselines; drills that prove gates bite; supplier contract regeneration. Gaps: doc drift (above); two advertised gates not in pretest; Daisy ceiling stale at 15 vs live 12. | Reconcile docs; re-lock tightened baselines in the same commit that earns them. | S |
| 24 | Deterministic visual evidence | 6.0 | 9.5 | 462 committed pixel baselines; 12-cell cross-brand locale matrices with divergence floors; 216-cell state matrix; torture/divergence specs. Root causes: **density axis unprovable** (no probe accepts density); hover/focus pixel baselines only on `rottay`; all baselines darwin-locked; sighted sign-off is out-of-band. | Density-swept probe; cross-tenant hover cells; in-repo sighted sign-off artifact. | M |
| 25 | Developer ergonomics | 7.0 | 9.0 | Strong taxonomy, ownership docs, storybook helpers, symlink dev loop documented. Gaps: two Modal names; dead `MaterialSurface`; imperative Message/Notification; giant composite files (DataTable 3,300 LOC). | Consolidation decisions + per-family README refresh during certification. | M |
| 26 | Speed of creating a new product | 4.0 | 8.5 | Breadth exists but only 15.2% is certified; an app team today must either use uncertified families or wait. Root cause: certification throughput (see §3.4), not catalog breadth. | Parallel family lanes on the frozen foundation (plan document). | L |

**Aggregate read:** architecture and governance score 7–8.5; default craft of
the uncertified fleet scores 4.5–6. The platform's problem is not direction —
it is that the certified island (14 families + authority infrastructure) is
much smaller than the governed territory.

---

## 3. Review of previous work (OLA 1–5)

### 3.1 What OLA 1–5 got right

- **Authority before polish was the correct call.** The single-`--ds-*`
  authority, shared chrome mapper, fail-closed DB compiler and
  `visualAuthority="compiled-artifact"` hydration path are genuinely
  well-engineered (verified in §1). Every later craft wave depends on them.
- **The recipe-profile loop is closed end-to-end** (contract → schema →
  compiler → provider → 6 families → same-tree matrix), and Codex's OLA-2
  remediation of 8 material inaccuracies shows the audit layer works.
- **Honest ratchets.** Baselines declare what they do not prove (i18n-bypass
  banner; glass cue explicitly unmeasured; historical counters labeled
  historical). This is rare and worth keeping.
- **Sighted checks catch what schemas cannot** — the OLA-3 editorial Tabs
  dark-tray defect was found by looking, after the harness went green.
- **The OLA-5 F2 remediation is correct in code** (verified §7): density is
  no longer double-applied, the Arabic-safe suffix is a true final invariant,
  and the implicit-Text regression was prevented.

### 3.2 What should be frozen

- The token/compiler authority chain and merge order.
- `visualAuthority="compiled-artifact"` and the SSR artifact identity guard.
- The three-plane density separation and root-metadata rule.
- The 16-recipe motion registry and reduced-motion policy (F3).
- `SemanticSurface` / `surfaceRole` vocabulary and the Daisy projection
  contract.
- The 14-gate serial pretest and the decrease-only ratchet discipline.
- Implicit Modern `Text` = `md` (until a deterministic migration fixture).

### 3.3 What is overengineered

- **Gate-metadata surface area exceeds certified output.** 100 scripts,
  14-gate pretest, baselines embedding historical aggregates
  (`themeCss.lineCount = 1,345` for a 617-line file) and numbers that match no
  artifact (1,026; 3,227; 132). The machinery is excellent; its *reporting
  layer* needs one hygiene pass, not more gates.
- **Two public Modal families** (`feedback/Modal`, `overlay/Modal`) with
  compound anatomy on both — debt deferred since before the ledger existed.
- **`MaterialSurface` dead code** — contracts and tests for a component that
  does not exist, polluting the layout category.
- **Recipe-profile machinery for exactly 2 profiles selected by zero
  first-party themes** — contract ahead of consumption by a wide margin.

### 3.4 Why progress is only 14/92 — and whether certification is too slow

Root causes, ranked:

1. **The waves paid for authority, not artifacts.** OLA 1–5 delivered
   compilers, providers, gates and vocabularies — deliberately worth 0
   certified families. That was correct sequencing, but it means the count
   measures the program's second act, not its total effort.
2. **Every wave required Codex remediation** (8 inaccuracies in OLA 2, 10
   findings in OLA 4, 9 in OLA 5 Phase 1, 2 P0s in F2). Implement-then-remediate
   doubles cycle time. The defect class repeats: handoff narrative ahead of
   verified code.
3. **No parallel family lanes ever ran.** Waves were sequential
   infrastructure; the "up to four lanes" policy exists on paper only.
4. **The per-family bar is high by design** (90/95 score, two passes, live
   matrix, sighted audit). This is a feature. The bottleneck is not the bar —
   it is that the bar is applied serially by one auditor reviewing one wave's
   narrative instead of batch-reviewing standardized per-family evidence
   matrices.

Verdict: **the certification process is not too strict; its throughput model
is broken.** Fix throughput (plan document), keep the bar.

### 3.5 Do the accepted 14 still deserve their status?

Yes — their evidence is concrete and reproducible (17 focused files/246
assertions; 49 files/1,337 assertions; 12-cell cross-brand matrices; state and
signature specs). **One flag for Codex, no reopening:** the 7 certified layout
families (AspectRatio, Box, Container, Flex, Grid, Space, Stack) paint from
`layout-primitives.css`, `skin/layout.css` and — for all of Grid's responsive
`data-cols-*` rules — `framework-bridge.css`, the file earmarked for
elimination. When the bridge drains, their evidence must be re-anchored; the
families themselves are sound.

### 3.6 What moved complexity instead of removing it

- **PatternDataTable**: 3,300 LOC of hand runtime (2,313 modern renderer +
  editors + presentation + mobile cards). The DS-S003 TanStack bake-off exists
  precisely because this complexity is maintained, not reduced.
- **The 2,101-LOC bespoke overlay runtime** (positioning, layer-stack,
  focus-trap) duplicates what React Aria/Base UI maintain upstream — the
  DS-S002 bake-off is the planned exit.
- **`framework-bridge.css`** still owns Grid's responsive paint — debt moved
  into a labeled box.

### 3.7 What should be simplified / eventually deleted

- Simplify: gate reporting/counter naming; the Modal pair into one canonical
  owner + compat alias.
- Delete: `MaterialSurface` dead code; the 12 residual Daisy class consumers
  (re-lock baseline at 12 now, drain to 0); `theme.css` Daisy class paint as
  consumers drain; deprecated `SemanticMaterial*` schema-v1 aliases after one
  migration cycle.

---

## 4. Ranked causes of crude-looking screens (causal chain, with owning layer)

Not "all of them." Ordered by how much each contributes to the current
first-impression deficit, with the layer that owns each fix:

1. **Uncertified primitive default craft** — hand-made engines with inline
   literals (`fontSize: 12`, `opacity: 0.6` in Table), raw utilities
   (`z-[9999]` in Upload), Daisy residues (Slider, Alert, Steps). *Owner:
   primitive/engine layer.* This is ~half the visible problem: screens are
   made of primitives.
2. **Typography hierarchy not actually consumed** — 9 roles exist but implicit
   text renders legacy `md`; hierarchy is carried by ad-hoc sizes. *Owner:
   foundation tokens + Modern engine (default-migration fixture).*
3. **Recipe axes not reaching first-party themes** — profiles exist but
   rottay/bithire/evnto select none, so personality differences that should be
   automatic still require manual fixture work. *Owner: tokens/recipes.*
4. **Pattern/surface composition weakness** — 4,074 internal ownership
   findings: patterns rebuild chrome, headers/toolbars diverge per route, 5/6
   canonical surfaces missing. *Owner: patterns/surfaces layer.*
5. **Multiple paint owners per family** — skins vs `theme.css` vs bridge vs
   inline styles produce border/radius/state seams. *Owner: CSS ownership
   (one paint owner per family during certification).*
6. **Surface rhythm / rectangular uniformity** — `SemanticSurface` roles are
   consumed by CSS but not yet composed by product surfaces, so screens read
   as flat rows of identical rectangles. *Owner: surfaces layer (adopt roles
   in canonical surfaces).*
7. **App-side chrome remnants** — 563 raw shared-chrome literals in shared app
   roots + one admitted specificity hack. *Owner: application boundary
   (migrate to public slots).*
8. **State/motion gaps in the uncertified fleet** — hover/press/focus proven
   only for Button/Card/table-row; overlays beyond Tooltip/Popover unmeasured.
   *Owner: engines + evidence matrices.*
9. **Deterministic-review blind spots** — density axis unprovable, cross-tenant
   hover unphotographed, sighted sign-off out-of-band. *Owner: gates/evidence.*
10. **Icon geometry** — *not a cause*; the facade and corpus are strong.
11. **Token values themselves** — *not a primary cause*; values compile and
    diverge correctly. Crudeness comes from consumption, not the ramps.

The chain: (1) primitive craft is amplified by (2) flat typography and (5)
paint seams; (4)(6) make whole screens feel uniform even when primitives are
fine; (3) keeps tenants looking like recolors of one product; (7)(8)(9) let
defects ship undetected.

---

## 5. White-label capability audit

Compared through the committed executable evidence (12-cell brand/locale
matrix, recipe-profile matrix, divergence + torture specs) — identical markup,
four identities:

| Axis | BitHire static | The Management DB | Technical radius-zero fixture | Editorial rounded fixture |
| --- | --- | --- | --- | --- |
| Typography | Public Sans / Space Grotesk | Optima / Fraunces | IBM Plex Sans/Mono, uppercase labels | Fraunces serif pairing |
| Geometry | radius 10px card | radius 6.08px, radiusScale 0.76 | all radii 0 | pill buttons, radiusScale 1.35, radii to 36px |
| Borders | neutral/blue edge | teal edge | outlined everything | minimal/soft |
| Depth | standard shadows | elevated 0.45 | `shadows: none`, effect 0 | elevated cards |
| Density | default | spacious | 0.92 scale | spacious |
| Motion | default cadence | default | effectIntensity 0 | 0.75/1.08 subtle |
| Canvas | `rgb(243,242,239)` | `rgb(251,243,231)` warm | flat | warm rounded |

**What is proven:** divergence far beyond palette — type pairing, corner
strategy, depth policy, density, control anatomy and overlay chrome all change
from identical trees, with pixel floors (full-page > 0.20) and computed-style
channel checks, across EN/ES/AR + RTL + mobile. Static→DB→static switches in
place without leakage. DB documents are fail-closed and cannot inject CSS,
remote fonts or arbitrary markup.

**Axes that exist but are not consumed:**

- `recipeProfile` — selected by **zero** first-party `BrandTheme`s; only
  fixtures use it (the program's flagship white-label mechanism is demo-only).
- Semantic typography roles — opt-in; products render legacy defaults.
- `SemanticSurface` roles — consumed by CSS, not yet composed by product
  surfaces.
- Density — wired for Input/Button only; most controls ignore the scale.
- `DensityScope`/`useDensity` are public, but `densityScopeAttributes` (the
  canonical attribute vocabulary used by ~10 internal components) is not
  root-exported.

**Axes that do not exist (by design or gap):**

- Per-tenant border *style* strategy (dashed/double/none-by-role) — only
  width/color/radius today.
- Texture channels (beyond effect-intensity dial).
- Tenant-selected icon weight family/container — deliberately forbidden today;
  the icon-container *geometry* axis exists but is not a documented recipe axis.
- Per-customer dark mode — deliberately out of scope (owner decision
  2026-07-07: verticals own their baseline scheme).
- High-contrast-specific role variants (forced-colors handled at component
  level only).

**Verdict:** the white-label *machinery* is the strongest part of the platform
(6.5/10 now, 9.5 ceiling). Its deficit is activation: the governed axes must
be selected by the real verticals and consumed by the certified fleet, or the
platform keeps proving divergence on fixtures while shipping recolors.

---

## 6. Audit of the corrected OLA 5 authority (F2 verification)

Verified against code, not the handoff:

| # | Point | Verdict | Evidence |
| --- | --- | --- | --- |
| 1 | Structural `--ds-density-scale`, global `--ds-density-mode-factor` and nested local `data-density` are independent | **Confirmed** | Three distinct channels; `density.css:28-44` applies the local factor under an explicit `:not(:root)` guard with the comment "otherwise the global preference is applied twice". |
| 2 | Root density derives from Appearance, not structural scale | **Confirmed** | `provider/index.tsx:611-617`: `deriveDensityPosture(normalizedConfig.appearance?.general?.density)`; comment explicitly refuses to convert `brandTheme.densityScale` into `data-density`. |
| 3 | Root metadata does not double-apply density | **Confirmed** | Root `data-density` is JS/DOM metadata only; CSS multiplies scale × mode-factor once at root. |
| 4 | Nested density scope affects only its subtree | **Confirmed in code; unproven in fixture** | `DensityScope` stamps scoped boundaries; local factor guarded to non-root. No same-tree nested/restore fixture exists. |
| 5 | Arabic-safe fallback is the final base/heading/display compiler invariant | **Confirmed** | `appearance/index.ts:548-557` — applied after General+Advanced merge, idempotent, tenant family stays first; brand compiler applies at emission (`brand-theme/index.ts:506-516`). Mono intentionally independent. |
| 6 | Implicit Modern `Text` remains stable | **Confirmed** | Default `size: 'md'` preserved with an explicit comment and a focused regression test. |
| 7 | Semantic motion has typed recipes and reduced-motion final states | **Confirmed** | 16 recipes; `finalOnly` → zero-duration final state under reduce/constrained/zero-intensity. |
| 8 | `SemanticSurface` and surface roles are the public surface vocabulary | **Confirmed** | Public export chain verified; 8 roles; `--ds-material-*` channels fully consumed (0 dead). Canonical names post-OLA-4; v1 aliases deprecated one cycle. |
| 9 | Canonical density attributes are non-paint | **Confirmed** | `densityScopeAttributes()` is a data-attribute prop bag; ARC09 certifies only the exact canonical export; productive consumers migrated. Caveat: the helper is **not root-exported** — only `DensityScope`/`useDensity` are public. |
| 10 | DataTable mobile anatomy and specificity fixes work | **Confirmed** | Codex F2-closure remediation verified present; focused DataTable suites green (35/35 per audit record). |

**Is F2 truly closed? No.** The implementation authority is correct and should
be frozen, but the required proof artifact — one deterministic same-tree
matrix of static/DB × compact/comfortable/spacious × EN/ES/AR where compiler
output, CSS effective scale, root DOM metadata, JS context and rendered
geometry agree — **does not exist**. Concretely: no showroom probe or e2e spec
accepts a density parameter today (density can only be observed bound to
opposite fixtures: technical 0.92 vs editorial spacious, never swept
independently × locale on one tree). Until that fixture exists and Codex
inspects it, F2 remains partial. This is a small, well-bounded deliverable
(see plan document, K0).

---

## 7. Complete 92-family census

Legend — Ledger: acc=accepted, aud=audit, q=queued. Contract/behavior/craft
risk: L/M/H. Token+recipe coverage, i18n/RTL, mobile/coarse, motion/RM:
✓ good, ◐ partial, ✗ missing (based on test/skins inspection; uncertified
families default to ◐ unless evidence says otherwise). Size: S/M/L/XL effort
to certification. Verdict: CERT=certify as-is path, REP=repair then certify,
RED=redesign behavior (supplier bake-off), MRG=merge/consolidate, DEF=defer.

The 14 accepted families are listed first for completeness; the remaining 78
are grouped by the recommended macro-wave (K1–K4, detailed in the plan
document).

### Accepted (14) — retain status

| ID | Family | Engines | Contract | Behav. risk | Craft risk | Coverage | i18n/RTL | Mobile | Motion | Tests | Size | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-P005 | display/Card | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | 12-file class | — | CERT (acc 96) |
| DS-P017 | display/Tooltip | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | strong | — | CERT (acc 95) |
| DS-P019 | display/Typography | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | strong; 1 red modern advanced test (baseline) | — | CERT (acc 97) |
| DS-P032 | inputs/Button | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | 12 files/1,771 LOC | — | CERT (acc 96) |
| DS-P078 | navigation/Tabs | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | strong | — | CERT (acc 95) |
| DS-P086 | overlay/Popover | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | strong; 1 red modern advanced test | — | CERT (acc 95) |
| DS-P055/56/58/59/60/61/64/66 | layout 8 (AspectRatio, Box, Container, Divider, Flex, Grid, Space, Stack) | 3 | ✓ | L | L | ✓ | ✓ | ✓ | ✓ | 49 files/1,337 assertions shared | — | CERT; flag: paint partly in `framework-bridge.css` — re-anchor evidence at bridge drain |

### Wave K1 — identity, text/boolean controls, feedback basics (21)

| ID | Family | Ledger | Contract | Behav. | Craft | Coverage | i18n/RTL | Mobile | Motion | Tests | Size | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-P001 | display/Avatar | q | ✓ | L | M | ◐ | ◐ | ◐ | ◐ | base | S | CERT |
| DS-P002 | display/Badge | q | ✓ | L | M | ◐ | ◐ | ◐ | ◐ | base | S | CERT |
| DS-P010 | display/Kbd | q | ✓ | L | M | ◐ | ◐ | ✓ | ◐ | base | S | CERT |
| DS-P072 | navigation/Link | q | ✓ | L | M | ◐ | ◐ | ✓ | ◐ | base | S | CERT |
| DS-P015 | display/Tag | aud | ✓ (profile-wired) | L | M | ✓ recipes | ◐ | ✓ | ◐ | base+profile | S | CERT (recipe proof exists) |
| DS-P039 | inputs/Input | aud | ✓ density-wired | M | M | ✓ | ◐ | ◐ | ◐ | 6-file class | M | CERT |
| DS-P049 | inputs/Textarea | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P043 | inputs/PasswordInput | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | S | CERT |
| DS-P038 | inputs/FormField | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P034 | inputs/Checkbox | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base+modern | M | CERT |
| DS-P044 | inputs/Radio | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P047 | inputs/Switch | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P051 | inputs/Toggle | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P020 | feedback/Alert | aud | ✓ | M | M | ◐ Daisy residual | ◐ | ◐ | ◐ | base | M | REP (drain Daisy `alert`) |
| DS-P004 | display/Callout | aud | ✓ | M | M | ◐ Daisy residual | ◐ | ◐ | ◐ | base | M | REP (drain Daisy `alert`) |
| DS-P022 | feedback/Message | aud | ✓ imperative API | M | M | ◐ | ◐ | ◐ | ◐ | base | M | REP (document engine-dispatch exception) |
| DS-P025 | feedback/Progress | q | ✓ | L | M | ◐ Daisy residual | ◐ | ✓ | ◐ | base | M | REP (drain Daisy `progress`) |
| DS-P028 | feedback/Skeleton | q | ✓ | L | M | ◐ | ◐ | ✓ | ✓ RM-critical | base | M | CERT |
| DS-P029 | feedback/Spinner | q | ✓ | L | M | ◐ | ◐ | ✓ | ✓ RM-critical | base | S | CERT |
| DS-P008 | display/Empty | aud | ✓ | L | M | ◐ | ◐ | ✓ | ◐ | base | M | CERT |
| DS-P027 | feedback/Result | q | ✓ | L | M | ◐ | ◐ | ✓ | ◐ | base | M | CERT |

### Wave K2 — supplier-gated selection controls, value inputs, overlays (19)

Prerequisites: DS-S002 behavior bake-off decision; DS-CAN009 Modal
consolidation decision.

| ID | Family | Ledger | Contract | Behav. | Craft | Coverage | i18n/RTL | Mobile | Motion | Tests | Size | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-P045 | inputs/Select | aud | ✓ 1,138 LOC bespoke | H | M | ◐ | ✗ no RTL tests | ◐ | ◐ | 6 files, no RTL/density | L | RED (bake-off then certify) |
| DS-P031 | inputs/AutoComplete | q | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | base | L | RED |
| DS-P036 | inputs/DatePicker | q | ✓ 1,267 LOC bespoke | H | M | ◐ | ◐ locale-critical | ◐ | ◐ | base | L | RED |
| DS-P050 | inputs/TimePicker | q | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | 6 red tests in baseline | L | REP+RED (fix red first) |
| DS-P033 | inputs/Cascader | q | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | base | L | RED (after Select) |
| DS-P053 | inputs/TreeSelect | aud | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | base | L | RED (after Select+Tree) |
| DS-P040 | inputs/InputNumber | q | ✓ | M | M | ◐ | ◐ locale-critical | ◐ | ◐ | base | M | CERT (bake-off-informed) |
| DS-P046 | inputs/Slider | q | ✓ | M | H | ✗ Daisy `range` + mixed idioms | ◐ | ◐ coarse-critical | ◐ | base | M | REP (drain Daisy, touch floor) |
| DS-P054 | inputs/Upload | q | ✓ | M | H | ✗ 17 inline + raw utilities, `z-[9999]` | ◐ | ◐ | ◐ | base | M | REP |
| DS-P048 | inputs/TagInput | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P037 | inputs/Form | aud | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT (RHF/Zod adapter contract) |
| DS-P026 | feedback/Rate | q | ✓ | M | M | ◐ | ◐ | ◐ coarse | ◐ | base | M | CERT |
| DS-P084 | overlay/Modal | q | ✓ low-level | H | M | ◐ | ◐ | ✓ adaptiveFullscreen | ◐ | base | L | MRG (canonical owner per DS-CAN009) |
| DS-P023 | feedback/Modal | aud | ✓ compound | H | M | ◐ | ◐ | ✓ | ◐ | base | L | MRG (compat alias) |
| DS-P021 | feedback/Drawer | aud | ✓ | H | M | ◐ | ◐ | ✓ mobile-critical | ◐ | base | L | RED (bake-off Dialog/Drawer) |
| DS-P087 | overlay/Sheet | aud | ✓ | H | M | ◐ | ◐ | ✓ mobile-critical | ◐ | base | L | REP after Modal/Drawer decision |
| DS-P079 | overlay/AlertDialog | q | ✓ | H | M | ✗ Daisy `modal-*` | ◐ | ◐ | ◐ | base | M | REP (drain Daisy, unify on canonical Modal) |
| DS-P080 | overlay/ConfirmDialog | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | REP (compose canonical Modal) |
| DS-P085 | overlay/Popconfirm | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT (compose Popover+Button) |

### Wave K3 — data display, navigation, layout behavior (19)

| ID | Family | Ledger | Contract | Behav. | Craft | Coverage | i18n/RTL | Mobile | Motion | Tests | Size | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-P014 | display/Table | aud | ✓ 782 LOC modern | M | H | ✗ 38 inline sites, literals | ◐ | ◐ | ◐ | batch | L | REP (one paint owner) |
| DS-P011 | display/List | q | ✓ | L | M | ◐ 1 red rustic test | ◐ | ◐ | ◐ | 1 red in baseline | M | REP |
| DS-P013 | display/Statistic | aud | ✓ | L | M | ✗ Daisy `stat-*` + 1 red rustic test | ◐ numeric-critical | ✓ | ◐ | 1 red | M | REP |
| DS-P007 | display/Descriptions | aud | ✓ | L | M | ◐ | ◐ | ◐ container | ◐ | base | M | CERT |
| DS-P016 | display/Timeline | q | ✓ | L | M | ✗ Daisy `timeline` ×3 | ◐ RTL order | ◐ | ◐ | base | M | REP |
| DS-P018 | display/Tree | q | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | base | L | RED-lite (collection keyboard model) |
| DS-P073 | navigation/Menu | aud | ✓ | H | M | ◐ | ◐ | ✓ mobile nav | ◐ | base | L | REP |
| DS-P070 | navigation/Breadcrumb | aud | ✓ | L | M | ◐ | ✓ RTL | ✓ | ◐ | base | M | CERT |
| DS-P074 | navigation/Pagination | aud | ✓ | M | M | ◐ | ✓ localized | ◐ | ◐ | base | M | CERT (unify with DataTable pagination per DS-R006) |
| DS-P075 | navigation/Segmented | aud | ✓ | M | M | ◐ | ◐ | ◐ coarse | ◐ | base | M | CERT |
| DS-P077 | navigation/Steps | q | ✓ | M | M | ✗ Daisy `steps` | ◐ RTL | ◐ responsive | ◐ | base | M | REP |
| DS-P076 | navigation/Stepper | q | ✓ | M | M | ✗ Daisy `step` | ◐ | ◐ | ◐ | base | M | REP (merge with Steps anatomy decision) |
| DS-P057 | layout/Collapse | q | ✓ | M | M | ◐ | ◐ | ✓ | ✓ disclosure.reveal | base | M | CERT (consume F3 recipe) |
| DS-P063 | layout/ScrollArea | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P062 | layout/Layout | q | ✓ | M | M | ◐ | ◐ | ✓ shell | ◐ | base | L | CERT |
| DS-P065 | layout/Splitter | q | ✓ | H | M | ◐ | ✓ RTL resize | ◐ | ✓ | base | L | REP (keyboard + RTL resize proof) |
| DS-P067 | navigation/Affix | q | ✓ | M | L | ◐ | ◐ | ✓ | ◐ | base | M | CERT |
| DS-P068 | navigation/Anchor | q | ✓ | M | L | ◐ | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P069 | navigation/BackTop | q | ✓ | L | L | ◐ | ◐ | ✓ | ◐ | base | S | CERT |

### Wave K4 — specialized, AI-adjacent and stress families (19)

| ID | Family | Ledger | Contract | Behav. | Craft | Coverage | i18n/RTL | Mobile | Motion | Tests | Size | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DS-P030 | feedback/Toast | aud | ✓ | M | M | ◐ | ◐ | ✓ | ✓ enter/exit | base | M | REP (pair with Message/Notification stack) |
| DS-P024 | feedback/Notification | aud | ✓ imperative API | M | M | ◐ | ◐ | ✓ | ✓ | base | M | REP |
| DS-P082 | overlay/Dropdown | aud | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | base | L | RED (menu behavior from bake-off winner) |
| DS-P081 | overlay/ContextMenu | q | ✓ | H | M | ◐ | ◐ | ✗ coarse | ◐ | base | L | RED |
| DS-P083 | overlay/HoverCard | q | ✓ | M | M | ◐ | ◐ | ✗ coarse conflict | ◐ | base | M | CERT (define coarse fallback) |
| DS-P088 | overlay/Tour | q | ✓ | H | M | ◐ | ◐ | ◐ | ✓ | base | L | DEF→CERT late |
| DS-P092 | inputs/VoiceInputButton | q | ✓ | H | M | ✗ | ✗ | ✗ | ✗ | **zero tests, zero stories** | L | REP (needs full evidence from scratch) |
| DS-P090 | display/CodeBlock | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT (AI-artifact proof) |
| DS-P091 | display/MarkdownView | q | ✓ | M | M | ◐ density-wired | ◐ | ◐ | ◐ | base | M | CERT |
| DS-P003 | display/Calendar | q | ✓ | H | M | ◐ | ◐ locale-critical | ◐ | ◐ | base | L | RED (share DatePicker runtime) |
| DS-P006 | display/Carousel | q | ✓ | M | M | ✗ Daisy `carousel` | ◐ | ◐ coarse | ✓ | base | M | REP |
| DS-P009 | display/Image | q | ✓ | L | M | ◐ | ◐ | ✓ | ◐ | base | M | CERT |
| DS-P012 | display/QRCode | q | ✓ | L | L | ◐ | ◐ | ✓ | ◐ | base | S | CERT |
| DS-P041 | inputs/Mentions | q | ✓ | H | M | ◐ | ◐ | ◐ | ◐ | base | L | RED-lite |
| DS-P042 | inputs/OTPInput | q | ✓ | M | M | ◐ | ◐ | ✓ mobile | ◐ | base | M | CERT |
| DS-P052 | inputs/Transfer | q | ✓ | H | M | ◐ | ◐ | ✗ | ◐ | base | L | DEF→RED-lite |
| DS-P035 | inputs/ColorPicker | q | ✓ | M | M | ◐ | ◐ | ◐ | ◐ | base | M | CERT (Brand Studio proof) |
| DS-P071 | navigation/FloatButton | q | ✓ | L | L | ◐ | ◐ | ✓ coarse | ◐ | base | S | CERT |
| DS-P089 | overlay/Watermark | q | ✓ | L | L | ◐ | ◐ | ✓ | ◐ | base | S | CERT |

### Census summary

- Verdict mix: 14 accepted; ~48 CERT/REP on existing behavior; ~14 RED/RED-lite
  pending the behavior bake-off; 2 MRG (the Modal pair); 2 DEF→late (Tour,
  Transfer).
- Highest behavior risk concentrates exactly where the hand-built code is:
  Select, AutoComplete, DatePicker, TimePicker, Cascader, TreeSelect, Menu,
  Dropdown, ContextMenu, Calendar, Tree (11 families) — this is the
  irrefutable case for DS-S002 before their certification.
- Zero-test family: VoiceInputButton. Zero-story families: CodeBlock,
  MarkdownView, VoiceInputButton (+ SemanticSurface, the untracked 93rd).

---

## 8. Supplier and engine assessment

### 8.1 Three engines

Keeping Classic/Modern/Rustic still creates value **as contracts and fallback
paths**, but the certification economy should be Modern-first (it is): Classic
is frozen Ant compatibility, Rustic is the minimal baseline that makes
Modern's premium signature measurable (`signature.spec.ts` depends on the
contrast). Do not certify Classic/Rustic visuals per family; certify contract
parity only. Custom (registered packs) is correctly not a fourth physical
engine.

### 8.2 DaisyUI

Daisy is **no longer architecturally load-bearing as a theme system** — the
projection is pinned, single-point, contract-tested, and theme.css/bridge
declare zero tokens. What remains is 12 residual class consumers that are
*load-bearing paint* in uncertified families (AlertDialog's `modal-*`,
Slider's `range`, Steps' `steps`, etc.). Recommendation: keep the projection
until each consumer's certification wave drains it (per-family, matching the
existing ratchet), re-lock the baseline 15→12 immediately, and do **not** do a
wholesale Daisy removal wave — it would churn files without certification
value. Daisy can remain an internal replaceable projection indefinitely at
consumer count 0.

### 8.3 Behavior supplier (React Aria vs Base UI)

The audit strengthens the case **for** the bake-off rather than for a
specific winner: 11 high-risk families share bespoke focus/collection/overlay
logic (Select 1,138 LOC, DatePicker 1,267, overlay runtime 2,101). This is
precisely the "invisible mechanics" class the supplier policy targets.
Decision memo (per policy, no install performed):

- **React Aria Components 1.19.0** — strengths: i18n/locale/date/RTL depth
  (matches the EN/ES/AR requirement and the DatePicker/Calendar risk),
  mature SR behavior. Weaknesses: hook-level composition cost, Adobe release
  cadence.
- **Base UI 1.6.0** — strengths: compound parts map cleanly onto the existing
  `data-part`/slot contract; strong overlay/transition work; unstyled.
  Weaknesses: younger i18n surface.
- **Recommendation: bake-off (S-02) as scheduled before wave K2**, scoped to
  Select/ComboBox, Drawer/Dialog, DatePicker (the locale-intensive control
  most likely to separate them). Do not adopt either for layout primitives or
  feedback. Alternatives considered and rejected per existing policy: Radix /
  Ark / Ariakit (third overlapping runtime), wholesale headless adoption
  without the same-facade comparison. A tie or sub-85 score means keep the
  bespoke runtime and fix its red tests instead.

### 8.4 Other suppliers

- **Tailwind Variants 3.2.2** — already behind the Rottay facade with proven
  profiles; accept formally once DS-S001's remaining exit evidence lands; keep
  the `tv()` confinement gate.
- **TanStack Table v8.21.3** — bake off (S-03) against the 3,300-LOC runtime
  with the same renderer; the current runtime may legitimately win.
- **React Grid Layout 2.2.3** — bake off (S-04) for WidgetBoard; preserve the
  verified 8-direction/RTL/keyboard baseline.
- **Tailwind 4 / Motion / D3 / Phosphor** — correctly confined; no change.
- **Mantine/MUI/Chakra/shadcn/Tailwind UI** — correctly rejected as visual
  authorities; this audit found no evidence to revisit.

---

## 9. Evidence and gate sufficiency

Strengths: 14-gate serial pretest; decrease-only ratchets with drills;
462 committed pixel baselines; cross-brand locale matrices with divergence
floors; state matrix (216 cells); axe baseline; torture/divergence specs;
supplier contract regeneration.

Gaps, ranked:

1. **Density axis unprovable** — no probe/spec accepts density; F2's missing
   proof is the single largest hole (see §6).
2. **State evidence is tenant-skewed** — hover/focus pixel baselines (90+11)
   exist only for `rottay`; cross-brand matrices never hover/press/focus.
3. **Sighted review is out-of-band** — `themanagementmiami-sighted.spec.ts`
   has zero assertions; no in-repo sign-off artifact; certification depends on
   process discipline, not a check.
4. **Darwin-locked baselines** — zero Linux baselines; CI would self-certify
   on first `--update-snapshots`.
5. **Doc drift** — §1 table; two advertised gates not in pretest; Phosphor
   confinement test-enforced only (no lint rule).

---

## 10. Summary judgments

- The platform's **architecture is real and verified**: one token authority,
  two theme sources compiling to the same channels, fail-closed DB path,
  honest gates. Nothing found here justifies a rewrite or a new authority.
- The platform's **craft deficit is real and concentrated**: 78 uncertified
  families with mixed paint idioms, opt-in typography, unconsumed recipe
  profiles, and a pattern/surface layer carrying 4,074 ownership findings.
- The **certification throughput model**, not the quality bar, is what must
  change (see `KIMI-PROPOSED-EXECUTION-PLAN-2026-07-23.md`).
- F2 is **not closed**; the missing same-tree density matrix is small and
  should be the very next deliverable.
- The 14 accepted families **keep their status**; one evidence re-anchor flag
  for the 7 layout families at bridge-drain time.
- `SemanticSurface` must be added to the ledger (93rd family) or explicitly
  ruled out of the denominator; `MaterialSurface` should be deleted.
