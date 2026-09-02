# Kimi K3 — Token-System Massive Audit (advisory, independent)

Date: 2026-08-14. Auditor: Kimi K3 (independent). Scope: `packages/core` only; apps/showroom are
non-authoritative consumers and do not block. Method: live tree + `dcadb8474..HEAD` + worktree,
read-only. No source/test/ledger/manifest was edited. This file is the only write.
Vocabulary note: `Theme` / `ThemePatch` / `compileTheme` are target-architecture names (they exist
in no source file today); current code equivalents are named inline. `SEV-RECEIPT-MODE` exists in
no contract (grep-verified); §12 defines it as a proposal.

## 1. Executive verdict + audited commits/worktree

VERDICT: the audit plumbing is closed and trustworthy; the elimination architecture is NOT closed.
The zero-effective drain era is over (`capabilityGaps: 0/0/0`); what remains is 1,224 extension
declarations that the contract cannot yet express, a non-isomorphic triad of BrandThemes, a live
second compiler, and forbidden vocabulary in two extensions. The gap is architecture (derivation
law + mirror law + single compiler), not certification volume.

Audited range `dcadb8474..HEAD` (2 commits, 53 files, +12,441/−2,768):
- `358ce9188` authority consolidation: tenant-theme artifact-protocol (+tests), kernel sha-256,
  visual-authority split into admission/retention, root-attributes registry (765+) with 2,487-line
  test, DEAD-61 extension drains, whitelabel canary contracts e2e.
- `bd5723e7` palette authority into brand themes: PALETTE-90/89 moved byte-equivalent channels into
  the three BrandTheme `.ts`; extensions drained (R −35, B −29, E −25); i0-inventory +365.

Worktree (unstaged, live at audit): the D1 four (baseline, residue test, rottay extension, ledger)
PLUS further drains — bithire `_source/extension.css` −16 (incl. `--rt-premium-card-grid` removed),
evnto −2, rottay −32 — `i0-inventory.test.ts` ±6, and untracked
`cert-fence-conflict9.test.ts` (901 lines, the CERT-FENCE atom). All green under their focals.

## 2. Current vs target architecture

CURRENT: two compile paths. (a) Static: `compileBrandTheme` →
`infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts` assembles
`index.css = compiled block + mode blocks + extensionCss` (`extensionCss` at :105,:120,:169-175,
:187,:205-218; read at `scripts/build-vertical-artifacts.mjs:154`). (b) DB/dynamic: tenant generator
(`runtime/tenant/storage/static/generator`) + ThemeProvider live `<style>` — a second emitter with
its own channel assembly (WO-TOK-09 already removed a third copy, `personalityVariables`).
New in range: `compilers/composition/tenant-theme` + `artifact-protocol` — the seam where the two
transports converge, but convergence is not yet equality.

TARGET (owner laws): static and DDB are transports over ONE total nested Theme and ONE
`compileTheme`; parity = equal inventory/keypaths/names/order/CSS/digest with equivalent values;
universal `--ds-*` only (no event/ticket/dashboard/`--rt-`/slug channels); the three first-party
themes are total mirrors (structure/order/comments equal; only values/dispositions differ);
`_source/extension.css` drains to 0 and is deleted with its API.

Delta current→target: (1) extension mechanism exists at all; (2) component-channel population has
no contract expression; (3) triad not mirrored (§4 C0); (4) second compiler emits its own names.

## 3. Theme / ThemePatch / compileTheme — exact current mapping

- "Theme total anidada" ≙ `BrandTheme` (`ts/presentation/brand-themes/<slug>/index.ts`):
  palette(+ramps)/typography/surfaces(density,radius,shadows,glass,gradients,overlays)/motion/
  charts/chrome(14-30 subkeys)/capabilities/recipes/expressive/responsive/engineBridge.
- "compileTheme único" ≙ `compileBrandTheme` (`kernel/runtime/brand-theme/index.ts`), emitting ~118
  unique `--ds-*` channels: color roles+ramps, typography stacks/scales/letter-spacing/line-height,
  radius scale, shadow sm..xl, glass, gradients, overlays, motion durations/easings/springs,
  surface-card/control/panel, tints, density/rhythm scales. NO component channels, NO per-vertical
  vocabulary (grep-verified: zero event/ticket/dashboard emissions).
- "ThemePatch" ≙ `modes.dark|light.palette` partials + `verticalTokenOverrides` (compiler input).
- Second emitter to retire or fold: tenant generator + provider path (dynamic transport must call
  the same compiler and digest-compare against static output per Theme input).

## 4. Census — 1,224 extension declarations by cohort (live, postcss-counted)

 rottay 1,027 decls (531 unique names) · bithire 172 (165) · evnto 25 (25) · TOTAL 1,224 (721 unique).
 Confirms the owner figure (1.224). Verdicts are per cohort, not per token.

- C0 MIRROR-GAP (cross-cutting, 0 decls): triad not isomorphic — bithire-only top-level
  (`schemaVersion, experienceProfile, profiles, effectIntensity, colorScheme, surfaceRoles` +
  chrome: metricCard/signalCard/workspaceCard/compactCard/tallCard/collectionCard/listingGrid/
  list/detail/toolbar/filterPill/breadcrumb/search); evnto lacks `surfaces.shadows/glass/gradients/
  overlays` + `interactiveBg*`; signed emission rosters 35/29/25. Verdict: REAL_BLOCKER for any
  per-cohort drain until the mirror law (§5 cohort L) lands — it defines where drained values live.
- C1 ROTTAY COMPONENT LITERALS (~860 decls, ~60 Ant-style families; select 52, upload 44, avatar
  40, tag 38, menu/badge/alert 32, tooltip 30, radio/inputnumber 28, textarea/stats 26,
  checkbox/toggle/steps 24, datepicker/timepicker/live/list 22, button/autocomplete 20, slider/
  pagination 18, switch/form 16, floatbutton/dropdown/command 14, popover/drawer/collapse 12,
  transfer/text/progress 10, tree/timeline/statistic/message/descriptions/card/calendar 8,
  segmented 7, skeleton/result/rate/notification/empty/divider/backtop/anchor 6, breadcrumb 5,
  spinner 4, watermark/page/overlay/image/gradient/focus ≤2): flat hex per component per mode.
  Owner actual: extension. Owner target: derivation from semantic canon. Verdict: UNIVERSALIZE by
  derivation law (component channel := function of palette/surface role); DELETE subset where the
  consumer census proves zero readers (precedent: DEAD-61/DEAD-4 zero-reader classes).
- C2 ROTTAY ALPHA RAMPS (~48: color-alpha-white/black ×12, primary/secondary/success/warning/
  error ×4): transparent steps of a seed. Verdict: UNIVERSALIZE — one `color-mix` derivation rule.
- C3 ROTTAY FOUNDATION RESTO (~70: shadow 12, border 12, elevation 6, overlay 2, gradient 2,
  focus 2, radius 1, text 10, page 2): channels the contract already families (shadows, overlays,
  gradients) or one field away. Verdict: MIGRATE to existing contract fields.
- C4 BITHIRE SURFACE/PREMIUM (~90: surface 15, premium 14, shell/sidebar 8, breadcrumb 4, detail 7,
  expanded 4, cell 3, card/chart/icon/preview singletons): mostly `var()`/`color-mix` derivations
  already pointing at canon. Verdict: MIGRATE (surface/card contract sections exist); the premium
  stack is the mirror decision — contract section emitted for all three or retired.
- C5 BITHIRE COMPONENT (~60: button 34, badge 17, select 16, control 8, list 8, table 3, input 3,
  action 3, tooltip/timepicker/datepicker singletons): same shape as C1 but derivation-ready.
  Verdict: UNIVERSALIZE with C1 law; button is the calibration family.
- C6 EVNTO FORBIDDEN VOCABULARY (16: event 10, ticket 6): vertical-named channels — owner law
  forbids them in contracts/keypaths/channels. Verdict: DELETE after zero-reader proof; any live
  reader forces UNIVERSALIZE to a universal name, never a rename to another vertical name.
- C7 BITHIRE `--rt-` SITES (5 read sites: :362,:371,:413,:419,:426 + prose at :440; the
  `--rt-premium-card-grid` declaration was already removed in the worktree): forbidden namespace.
  Verdict: DELETE — the `var(--rt-*, fallback)` reads collapse to their fallbacks.
- C8 EVNTO/SIDEBAR+MISC (9: sidebar 4, button 2, radius 1, input 1, focus 1): Verdict: MIGRATE
  (radius/focus exist in contract) / UNIVERSALIZE (sidebar geometry into shell contract).

REAL_BLOCKER count: exactly one (C0). Everything else is work, not blockage: capabilityGaps are
0/0/0, no component-local/app-selector/`!important` grandfather entries remain in any extension,
and the rottay raw-selector grandfather is the default-mode block, which the compiler already emits.

## 5. Executable cohorts (parallelizable), write-sets, dependencies

Law for all: per cohort = contract/derivation emitter + 3 theme values + extension deletions +
signed roster/value hashes + decrease-only baseline re-seed + ledger receipt. Write-sets below are
maximal per cohort; dependencies are hard.

- L MIRROR LAW (blocks all): name-set equality test over `compileBrandTheme(slug)` per mode +
  schema alignment of the three `.ts` (structure/order/comments). Write-set: brand-theme compiler
  tests + 3 theme files. Depends on: nothing. This is C0's fix.
- K1 alpha ramps (C2, ~48) — depends L.
- K2 shadows/elevation/gradient/overlay (C3 core, ~30) — depends L.
- K3 form-field cluster (input/textarea/select/inputnumber/checkbox/radio/switch/toggle; ~200 R +
  ~27 B) — depends L, K2 (focus rings).
- K4 feedback cluster (alert/message/notification/progress/result/skeleton/spinner; ~70) — L.
- K5 nav cluster (menu/dropdown/breadcrumb/pagination/steps/tabs; ~90) — L.
- K6 data-display (table/list/tree/descriptions/statistic/stats/calendar/datepicker/timepicker;
  ~120) — L.
- K7 buttons (56 across R/B/E) — L; calibrate derivation law here first (smallest live family).
- K8 surfaces/cards/premium (C4, ~90) — L + premium mirror decision (owner point, not aesthetic:
  contract section vs retirement).
- K9 upload/transfer (~54) — L, K3.
- K10 forbidden sweep (C6+C7, 22 decls/sites) — depends nothing; owner law makes it cohort-zero
  alongside L. Write-set: evnto/bithire extensions + ledger receipt only.
- K11 shell/sidebar (C8 + rottay sidebar 13 + bithire shell 4; ~25) — L.
Parallel: K1-K9, K11 are pairwise disjoint file-regions (per-family emitter sections + per-family
extension blocks); L then K7 sequence first as calibration, then 4-6 lanes concurrently.

## 6. Mass elimination of event/ticket/dashboard/`--rt-`

Compiler: clean (zero emissions — verified). Extensions: 16 evnto decls (`--ds-event-*`,
`--ds-ticket-*`), 5 bithire `--rt-*` read sites + 1 prose mention. Dashboard: zero channel hits in
extensions and compiler. Plan: K10 — consumer scan (residue-test scanner shape, exact-boundary),
zero-reader proof, delete; any live reader is rewritten to the nearest universal canon channel in
the same commit (never renamed to another vertical name). Ledger receipts per name, hash-signed.

## 7. Severance: extensionCss API / files / gates

When cohorts land: delete `artifacts/{rottay,bithire,evnto}/_source/extension.css`; remove
`extensionCss` from artifact-renderer (:105,:120,:169-175,:187,:205-218) and the read at
`build-vertical-artifacts.mjs:154`; drop "2. extension" from the generated header; artifact-provenance
gate keeps laws L-A..L-G with an EMPTY grandfather (the gate becomes the anti-regression fence:
any new region is red); residue/fence tests convert from absence-of-name to absence-of-file +
header-shape assertions; i0-inventory keeps the compiled inventory as the only inventory.

## 8. Connection to the active manifest (255 / 5,100)

`modern-rescue/manifest/index.json`: 255 canonicalFamilies × 20 activePublicControls (13 standard
+ 7 pro) = 5,100 controlFamilyCells; rollups: familyMaximumClaims SOURCE_BOUND 6 / INVENTORIED_ONLY
249 / ASSESSED+ 0; controlFamilyDispositions UNKNOWN 5,100/5,100; `skeletonsCountAsProgress: false`.
inputsDigest `efe941d4…`. Connection: the 1,224 extension declarations are un-floored paint over
the same families the manifest certifies; until C0-L lands and each component channel is derived
from a governed control, no control→family cell over these families can honestly leave UNKNOWN —
the extension is precisely the layer that bypasses "one semantic input reaches every declared
family". The drain is therefore R0/R1 substrate: it feeds the static-vs-db parity baseline and is a
precondition for SOURCE_BOUND→ASSESSED elevation on every family these cohorts touch, not a
parallel track. Conversely the drain must NOT claim manifest progress: cohort completion = derived
channel + gate green, never a family claim.

## 9. Gates / commands per cohort

Per cohort, in order: `pnpm -C packages/core build:vertical-css` (regen) →
`node packages/core/scripts/build-vertical-artifacts.mjs --check` (staleness) →
`node packages/core/scripts/artifact-provenance-gate.mjs --check` (ratchets decrease-only; gap
regions shrink) → focals: `i0-inventory.test.ts`, `brand-authored-residue-retirement.test.ts`,
`cert-fence-conflict9.test.ts`, `first-party-artifacts-{generated,parity}.test.ts` →
`node scripts/engine-token-audit.mjs --check` and `scripts/css-layer-paint-gate.mjs` (touch only if
CSS entrypoints move) → `program-check.mjs` (manifest untouched by drain cohorts). Closure
additionally: mirror name-set test + absence-of-file assertions (§7).

## 10. P0 / P1 / DONE

- P0-1 Forbidden vocabulary live: 16 evnto event/ticket decls + 5 bithire `--rt-` read sites
  (§4 C6/C7). Owner law violation in the tree today. Fix: cohort K10.
- P0-2 Certification path red by accumulation: regenerate-and-diff guards red across 4 committed
  atoms + current worktree drains; CONFLICT9 `generatedProjection: PENDING` with 6 sightedPending
  (fenced, not yet sighted). Fix: CERT-FENCE tranche (already fenced by `cert-fence-conflict9.test.ts`)
  → regenerate → sighted → green BEFORE cohort L changes compiled output, else attribution dies.
- P1-1 Mirror non-isomorphism (§4 C0): emission rosters 35/29/25; key-set divergence listed.
- P1-2 Second compiler live (tenant generator/provider) — "not another compiler" law pending
  convergence onto one compileTheme with digest parity.
- P1-3 12 browser receipts outstanding (6 CONFLICT9 fence rows + 6 ledger SIGHTED_PENDING rows, all
  projected in bundles; FASE M).
- P1-4 Census↔manifest cross-reference missing: the 721 unique names carry no family attribution
  against the 255-family inventory; needed before cohort drains can report manifest-side impact.
DONE (drain programme): extensions deleted + API severed + mirror name-set test green + manifest
rollups unchanged-or-better with zero UNKNOWN introduced by the drain + guards green + 12 sighted
receipts closed. DONE is not: bytes removed, cohorts landed, or screenshots taken.

## 11. Annex — hashes / counts / paths (consensus substrate)

- Counts (postcss, live): rottay 1,027/531 unique; bithire 172/165; evnto 25/25; total 1,224/721.
- D1 signed hashes (re-derived by me, match): global `6b3a72860e140376a58029e7824cfbc06e5b3810d8
  055c1a96f9fb9d515da06a`; modeMembership `1cfe1b350da8f79a2e1869f9a12ace776ec35c26d2238e9dd43cce3
  fe033ecb9`; value `e86e51390530f9df1e3a358cec14a2741265a4c582ce4cad88b6224f59291b05`.
- CONFLICT9 rosterSha256 `7d9ea09aed4297978cb2e789f6e242a63fb2978639204b371f415dd68ce78cfb`.
- Manifest inputsDigest `efe941d4ccece37e0a38ff6c75c7132265ad1a6b56227e7b1670f23c413eea79`.
- Paths: extensions `packages/core/src/foundation/tokens/css/facade/artifacts/{rottay,bithire,
  evnto}/_source/extension.css`; renderer `src/infrastructure/compilers/runtime/tenant-css/
  artifact-renderer/index.ts`; compiler `src/infrastructure/compilers/kernel/runtime/brand-theme/
  index.ts`; themes `src/foundation/tokens/ts/presentation/brand-themes/{rottay,bithire,evnto}/
  index.ts`; ledger `src/foundation/tokens/residual-adjudication.json` (301 entries; distribution
  196 EXECUTED / 64 KEEP_ACTIVE / 35 OWNER_DECISION / 6 SIGHTED_PENDING); baseline
  `scripts/artifact-provenance-gate.baseline.json`; manifest `scripts/quality-evidence/programs/
  modern-rescue/manifest/index.json`.

## 12. SEV-RECEIPT-MODE (proposal — term absent from all contracts, grep-verified)

Proposed mode for this programme's findings: every finding is emitted as a machine receipt
`{id, sev, evidence: {paths, lines, hashes}, owner, gate, status}` with sev ∈ SEV-0 (owner-law
violation live in tree; blocks all drains — maps to my P0s), SEV-1 (architecture gap; blocks the
cohort it gates — P1-1/P1-2), SEV-2 (certification debt; blocks release, not architecture — P0-2,
P1-3), SEV-3 (hygiene/observation — P1-4). Receipts are hashed into the cohort ledger like roster
hashes; a cohort's GO requires zero open SEV-0/SEV-1 within its write-set; release GO requires zero
open SEV-0..2. This file's findings as receipts: SEV-0: P0-1 (K10). SEV-2: P0-2, P1-3 (CERT-FENCE
tranche). SEV-1: P1-1 (cohort L), P1-2 (compiler convergence). SEV-3: P1-4 (census cross-reference).
Adoption is the owner's call; nothing in the active manifest reads SEV receipts today.

— Kimi K3, independent advisory. Read-only audit; this file is the only write.
