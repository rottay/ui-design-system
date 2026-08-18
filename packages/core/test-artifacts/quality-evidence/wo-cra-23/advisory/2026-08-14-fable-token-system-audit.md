# Token System Audit — Design System (packages/core)

- Date: 2026-08-14
- Auditor: Fable 5 (cloud auditor). Governance: Kimi 2.7 implementation; Fable 5 + Kimi 3 audit; Codex DT.
- Mode: READ-ONLY audit. This file is the only write authorized. No source/test/ledger/manifest edited; nothing staged or committed.
- Scope of authority: packages/core Design System only. Apps and Showroom are non-authoritative consumers and do not block normalization.
- Evidence base: live worktree + commits dcadb8474..HEAD + uncommitted worktree delta (D1, SEV-DEAD-21, SEV-RECEIPT-MODE, cert-fence, i0 type guard). All counts in this report were measured mechanically (postcss parse of `_source/extension.css`, compiled-segment extraction from generated `index.css`, var()/TS reader scan over core src excluding `facade/artifacts`, plus consumer corpora scans executed earlier this session).

Binding laws audited against (owner-corrected universal law):

- L1 static and DDB are transports only; both resolve to the same complete nested Theme and enter ONE compiler/lowering.
- L2 for equivalent values: identical inventory, keypaths, channel nomenclature, deterministic order, CSS and digest. Subset/intersection parity is prohibited.
- L3 ThemePatch is ingestion-only; resolution against a complete Theme happens before the compiler; compileTheme accepts Theme, never ThemePatch.
- L4 only universal `--ds-*` nomenclature. `event`, `ticket`, `dashboard`, `--rt-*` and vertical slugs are prohibited in contracts, keypaths and channels. id/slug is metadata only.
- L5 the three first-party themes are total structural mirrors (families, nested keypaths, order, semantic comments); only values and explicit capability dispositions differ.
- L6 `_source/extension.css` is a temporary second authority and must reach 0 and be deleted, together with the `extensionCss` API.
- L7 no aesthetics, no invented values; derive from existing canon and flag any effective change.
- L8 no generated/build/browser work in this unit; no commits.

---

## 1. Executive verdict + safety audit of commits/worktree

**Executive verdict: the current tree VIOLATES the universal law in seven pre-existing structures, all born at or before `dcadb8474`. The two commits in range and the entire uncommitted worktree are law-aligned (they only drain, evidence, or consolidate authority) and carry 0 attributable P0/P1. The path to compliance is finite and is specified in sections 3-7: one substantive ISO-CORE atom (contract + single lowering + mirrored themes + total equality), then 6 drain cohorts over the 1,224 remaining extension declarations, then the severance tranche that deletes the three `_source` files and the `extensionCss` API.**

Safety audit of `dcadb8474..HEAD` (2 commits: `358ce9188` authority consolidation, `bd5723e7c` palette authority into brand themes):

- Full-diff grep: **0** added `event|ticket|dashboard|--rt-` channels; **0** added subset/"not equality" doctrine. Both commits move palette authority INTO the themes — the direction the law demands.
- `git log -S` attribution: the "not equality / BOUNDED subset" doctrine in `static-db-channel-vocabulary.test.ts` and the `FirstPartyBrandTheme` "product-specific extras" contract text were authored in `dcadb8474` (the range base) — pre-existing debt, not range debt.
- Uncommitted worktree: D1 (-8 declarations), SEV-DEAD-21 (-34), SEV-RECEIPT-MODE (receipt truth fix), cert-fence (new test only), i0-inventory type guard (6 lines, attributed by DT ruling to the cert atom). All audited this session; verdicts: ACCEPT (see section 12 and annex).

Pre-existing structures that violate the law (each with live path evidence):

| # | Violation | Law | Evidence |
|---|-----------|-----|----------|
| V1 | Subset doctrine test ("not equality", "BOUNDED subset", "static-only expected") | L2 | `src/infrastructure/compilers/composition/tenant-theme/tests/static-db-channel-vocabulary.test.ts:13-23` |
| V2 | Dual lowering: DDB path emits via `compileAppearanceVariables`, static via `compileBrandTheme` | L1 | `src/infrastructure/compilers/composition/tenant-theme/index.ts:1463` vs `src/infrastructure/compilers/kernel/runtime/brand-theme/` |
| V3 | `BrandTheme` all-optional families; `FirstPartyBrandTheme` keeps `recipes/expressive/responsive/engineBridge` as optional "product-specific EXTRAS"; comment says equality of common inventory, not total mirror | L5 | `src/foundation/contracts/composition/tenants/themes/index.ts` (~:260-340) |
| V4 | Product dialects live in core: `--ds-dashboard-*` 29 unique/98 occ; `--ds-event-*` 10/80; `--ds-ticket-*` 6/30; `--rt-*` 6/32 residual | L4 | `src/foundation/tokens/css/presentation/components/skin/dashboard.css`, `dashboard-header.css`; evnto `_source/extension.css`; evidence strings in tests/ledger/generated |
| V5 | `_source/extension.css` second authority: **1,224 declarations remaining** (R1027/B172/E25) | L6 | three `src/foundation/tokens/css/facade/artifacts/*/_source/extension.css` |
| V6 | `chrome.*` contract is single-mode while palette is light+dark — the shape gap that forces rottay's 495-declaration light region into the side channel | L1/L5 | contract `themes/index.ts` (BrandChrome) vs `artifacts/rottay/_source/extension.css` region `capability-gap:mode:light` |
| V7 | `TenantThemeDocument` v1 + `tokenOverrides` (max 200 raw vars): DB-only escape hatch, transport-specific capability | L1/L3 | `src/foundation/contracts/composition/tenants/themes/tenant-theme/index.ts` |

---

## 2. Current architecture graph and violations

```
STATIC transport                          DDB transport
--------------------                      -----------------------------
brand-themes/{rottay,bithire,evnto}.ts    TenantThemeDocument (v1, bounded)
        |                                        |
        | (full BrandTheme)                      | normalize (TenantAppearanceAdvanced)
        v                                        v
  compileBrandTheme  <── LAW: ONE ──X──  compileAppearanceVariables      [V2: two lowerings]
        |                                        |
        v                                        v
  compiled block ─────────┐               bounded CSS vars
                          v
  _source/extension.css ──┤  [V5: second authority, 1,224 decls]
                          v
  generated artifacts/{slug}/index.css  (renderer embeds extension verbatim)
                          v
  SSR compiled-artifact hydration
```

- The static path has a capability the DDB path lacks (the extension side channel); the DDB path has a capability the static path lacks (`tokenOverrides`). Both are L1 violations in mirror image.
- The vocabulary test (V1) certifies the asymmetry instead of failing on it.
- The contract (V3) makes partiality legal at the type level, so nothing upstream can enforce mirror totality.
- Positive findings that the target builds on: `FIRST_PARTY_BRAND_THEME_REQUIRED_KEYS` already declares authoring order as load-bearing with order-sensitive digests; `BrandCapabilityCatalog` + `BrandCapabilityAbsenceReason` already exist as the explicit-absence mechanism; `TenantThemeDocument.verticalKey` exists (`tenant-theme/index.ts:485,521`), so a first-party base theme per vertical is addressable without inventing a neutral theme; `FirstPartyVerticalId` is a closed union, id-as-metadata is already near-true.

---

## 3. Target: Theme / ThemePatch / compileTheme (exact)

```ts
// foundation/contracts/composition/tenants/themes/
type Governed<T> =
  | { readonly value: T }
  | { readonly disposition: BrandCapabilityAbsenceReason };

interface Theme {
  readonly id: FirstPartyVerticalId;   // metadata only; excluded from shape-hash; never decides lowering/naming
  readonly name: string;               // metadata only
  appearance: BrandAppearance;
  modes: BrandThemeModes;
  palette: BrandPalette;               // nested-total: no `?` on leaves
  typography: BrandTypography;
  surfaces: BrandSurfaces;
  motion: Governed<BrandMotion>;       // deprecated family enters as governed disposition, not live authority
  charts: Governed<Partial<ChartPersonalityTokens>>;
  recipes: Governed<BrandRecipeSelection>;
  expressive: Governed<BrandExpressiveSelection>;
  responsive: Governed<BrandResponsiveSelection>;
  chrome: BrandChrome;                 // per-section Governed<Section>; inside a present section, every leaf required
  engineBridge: Governed<Partial<Record<EngineName, Record<string, unknown>>>>;
  capabilities: BrandCapabilityCatalog; // cross-checked 1:1 with every Governed.disposition
}

type ThemePatch = DeepPartial<Omit<Theme, "id">>;          // recursive; leaves optional at every depth
interface ThemePatchEnvelope { schemaVersion: string; source: "static" | "tenant-document-v1" | "appearance-compat"; patch: ThemePatch; }
function migrateV1(doc: TenantThemeDocument): ThemePatchEnvelope;      // total function, golden-tested
function resolveTheme(base: Theme, ...patches: ThemePatch[]): Theme;   // fail-closed: unknown key -> throw; missing disposition -> throw; schema defaults materialize HERE, once
function compileTheme(theme: Theme): CompiledTheme;                    // = compileBrandTheme made total-input: internal fallbacks removed (moved to resolveTheme), proven value-neutral by digest
```

Flow (both transports, one lowering): static `.ts` authors a complete `Theme` -> `compileTheme`. DDB: document v1 -> `migrateV1` -> envelope/patch -> `resolveTheme(FIRST_PARTY_THEMES[doc.verticalKey], patch)` -> the SAME `compileTheme`. `verticalKey` missing or outside the closed roster throws in admission and in resolve — never a silent default. `BrandTheme` survives one wave only as a deprecated alias of the COMPLETE `Theme` (it is publicly re-exported from `src/entrypoints/server/index.ts`, so this is a declared breaking change with changeset). No partial public theme type survives.

---

## 4. Census of ALL 1,224 extension.css declarations, by cohort

Measured live this session (post-D1, post-SEV-DEAD-21): **1,224 declarations = rottay 1,027 + bithire 172 + evnto 25.** Region split: rottay `shipped(dark-default)` 532 + `mode:light` 495; bithire `shipped` 166 + `mode:dark` 3 + `reduced-motion:media` 3; evnto `shipped` 22 + `mode:dark` 3. Classifier: emitted-set = compiled segment of each generated artifact (R663/B1106/E384 channels); readers = var()/TS scan over core src (artifacts excluded), showroom, three apps.

| Cohort | Decls (R/B/E) | Unique | Source owner | Target owner | Disposition |
|--------|---------------|--------|--------------|--------------|-------------|
| C1 redecl-same-slug | 31 (21/9/1) | 31 | extension re-declares a channel its own compiled block already emits (breadcrumb, segmented, sidebar spacing, radius-full, card-image-placeholder, bg-surface, interactive-border; bithire reduced-motion trio) | brand-theme compiler (value alignment) / motion capability for the reduced-motion trio | **MIGRATE** (CONFLICT-9 method: prove compiled==authored or align seed; reduced-motion becomes a compiler capability) |
| C2 owner-typed-existente | 28 (3/21/4) | 28 | channel another slug's compiled block already emits (bithire button/badge/shell fields, evnto sidebar spacing, rottay elevation-1..3) | existing typed BrandTheme fields, authored in the missing theme | **MIGRATE** (author the field, delete the declaration) |
| C3 dead-ds-declared | 3 (2/1/0) | 2 | `--ds-empty-title-color` (rottay), `--ds-surface-card-grid-line-strong` (bithire): zero readers anywhere, but also declared in DS base CSS | none | **DELETE** (double retirement: extension + base declaration; pixel-neutral) |
| C4 base-override component chrome | 1,035 (944/89/2) | 559 (474/83/2) | brand values for DS-base component tokens (`--ds-{component}-*` declared in `foundation/themes/default.css` with fallbacks). Rottay top families: color 29, select 26, avatar 19, upload 19, tag 18, badge 16, alert 16, menu 16, tooltip 15, radio 14, inputnumber 14, checkbox 13, textarea 13, stats 13 (Ant-vocabulary chrome). Bithire: select 15, badge 15, premium 10, surface 8, control 8, button 7, detail 6 | **new per-mode chrome contract sections** (the single largest contract extension; V6 must fall first) | **UNIVERSALIZE** (channel names are already product-agnostic `--ds-*`; the values move into typed per-mode Theme fields; the drain is per component family) |
| C5 invented (non-product) | 106 (54/52/2*) | 83 (30/51/2) | extension-only channels with live readers, product-agnostic names: rottay steps/sidebar/transfer/upload/drawer/message/pagination; bithire button/list/surface/expanded/breadcrumb/table/insight/action/shell (36 of bithire's read only by app-bithire) | typed Theme fields where a generic role exists; otherwise role-canonization table decides | **UNIVERSALIZE** (map to canonical roles; app-only readers do NOT block — apps consume the canon afterwards) |
| C6 product-named (evnto) | 16 (0/0/16) | 16 | `--ds-event-*` (10) + `--ds-ticket-*` (6) in evnto extension; app-evnto reads them 0 times (measured) | canonical roles (live-banner/announce, credential/pass) or nothing | **UNIVERSALIZE-or-DELETE** (L4: prohibited names; delete the dead ones after one app-side confirmation pass, canonize the painting ones; relocation to apps is PROHIBITED) |
| C7 ramp residue | 2 (2/0/0) | 1 | `--ds-color-alpha-black-100` (dark+light) — last survivor of the alpha ramps after SEV-DEAD-21 | palette (if a reader exists) or delete | **MIGRATE-or-DELETE** (adjudicate its single reader status in the drain atom) |
| C8 root-non-custom | 1 (1/0/0) | 1 | one raw CSS `color` declaration in a rottay gap region (grandfathered L-I) | none | **DELETE** (with L-I grandfather removal) |
| **Total** | **1,224** | | | | |

*evnto invented decls: 18 unique appear in section-4 classifier as invented; 16 are product-named (C6) and 2 are `--ds-button-*` (folded into C5 counts above; see annex reconciliation).

REAL_BLOCKER register (the only two):

- **B1 (blocks C4):** the chrome contract is single-mode (V6). Per-mode chrome sections must land (inside ISO-CORE or as its immediate successor) before the 495-declaration rottay light region can drain.
- **B2 (blocks C6 partially):** role-canonization table (channel -> universal role) needs one owner sign-off; the DELETE half of C6 needs one app-side reader confirmation pass (non-blocking for the DS write-set, blocking only for the final delete of channels that might paint).

No other cohort has a blocker. Nothing in this census requires inventing values: every MIGRATE/UNIVERSALIZE moves an existing authored value into a typed field; every effective-value risk is gated by digest/equality tests (L7).

---

## 5. Implementation plan: 8 cohort atoms, write-sets, dependencies

| Atom | Cohort(s) | Write-set (disjoint where possible) | Depends on |
|------|-----------|-------------------------------------|------------|
| A0 ISO-CORE-1 | contract+lowering+mirror (V1,V2,V3,V6,V7) | see section 3 target + exact roster in annex A3; includes per-mode chrome sections (kills B1) and DELETES the subset test (V1) | nothing (first) |
| A1 | C3+C7+C8 | 3 `_source` files, ledger receipt, baseline, residue test (D1/SEV pattern) | nothing (can run before or parallel to A0; pixel-neutral) |
| A2 | C1 | `_source` files + brand-theme seed alignment + ledger + i0-style pins; reduced-motion trio -> compiler capability | A0 (compiler capability) for the trio; rest independent |
| A3 | C2 | the 3 `brand-themes/*.ts` (author missing fields) + `_source` + ledger + equality fixtures | A0 (mirrored themes) |
| A4 | C4-evnto+bithire (91 uniques) | per-family: theme chrome sections authored + `_source` drain + baseline ratchet | A0 |
| A5 | C4-rottay (474 uniques, dark+light per family) | same, split in 3-4 family-batched atoms (inputs; data display; feedback/overlay; navigation) | A0, A4 pattern proven |
| A6 | C5 | role table for invented channels + theme fields + `_source` drain | A0; B2 sign-off for names without an obvious role |
| A7 | C6 + dashboard skin | evnto product channels canonized/deleted; `skin/dashboard*.css` renamed to universal roles (panel/metric) | B2 owner sign-off |
| A8 | severance | section 7 | A1-A7 all at 0 |

Dependencies are a DAG, not a chain: A1 is independent; A2/A3 depend only on A0; A4-A6 are mutually disjoint by file-family and can interleave. Every atom keeps the D1/SEV evidence pattern: signed roster + rederivable hashes + shared enforcer/scanner + causal mutants + decrease-only provenance baseline + honest GENERATED-PENDING.

## 6. Mass elimination of event/ticket/dashboard/--rt-

- `--ds-event-*` (10) / `--ds-ticket-*` (6): all live ONLY in evnto's extension + generated echo + one pilot story. App-evnto reads: 0 (measured). Ruling: canonize the ones that paint into universal roles authored in the evnto Theme (values preserved, names universal); delete the rest. The evnto extension header's retire condition ("BrandTheme gains fields for the evnto-only marquee channels") is rewritten — per-vertical fields are prohibited (L4/L5).
- `--ds-dashboard-*` (29 unique, 98 occ in `skin/dashboard.css` + `dashboard-header.css`): live readers exist — MIGRATE by renaming the family to universal roles (`panel-header`/`metric`/`skeleton` grammar) in one atom (A7); consuming apps follow the canon afterwards (non-blocking by owner law).
- `--rt-*` in core (6 unique / 32 occ): all residual evidence strings (tests/ledger) + generated artifacts; the only production declaration died in SEV-DEAD-21. They disappear at regeneration and receipt-closure; the residue test already enforces "no `--rt-*` in any `_source`" as a live invariant. The app-bithire `--rt-*` dialect (~18k unique) is a separate program outside DS authority and does not block (law: apps are consumers).
- Enforcement: `theme-name-law.test.ts` (A0) carries the deny-list `event|ticket|dashboard|rottay|bithire|evnto|--rt-` — HARD (no baseline) over Theme keypaths and compiled channel output; decrease-only enumerated baseline over existing core CSS until A7 lands.

## 7. Severance tranche (extensionCss API/files/gates)

Preconditions: A1-A7 leave all three `_source` files at 0 declarations; CONFLICT-9 certification (sighted-6 + regeneration; cert-fence is phase-aware and flips to POST) completed.

1. Delete the three `src/foundation/tokens/css/facade/artifacts/{rottay,bithire,evnto}/_source/extension.css`.
2. Remove the `extensionCss` API surface (~13 files, measured): `compilers/runtime/tenant-css/artifact-renderer/index.ts` (+5 test files), `compilers/kernel/foundation/css/scope-projection/tests`, `compilers/kernel/runtime/brand-theme/tests/tenant-color-propagation.test.ts`, `scripts/build-vertical-artifacts.mjs`, `scripts/artifact-provenance-gate.mjs` (+test), `scripts/certified-data-css-producers.vitest.test.ts`, `first-party-artifacts-generated.test.ts`.
3. Collapse `artifact-provenance-gate` to compiler-only provenance (layers 2-3 die with the extension; the baseline file shrinks to compiled metrics).
4. Regenerate artifacts (`build:vertical-css`), close every GENERATED-PENDING receipt, rebuild dist, flip staleness gates green, final sighted certification.

## 8. Relation to the active modern-rescue manifest (255/5100)

`packages/core/scripts/quality-evidence/programs/modern-rescue/manifest` (active manifest, 255/5100) consumes stable channel identities and paint counters. Theme normalization changes the FLOOR under that program: channel renames (A7), chrome contract moves (A4/A5) and regeneration (A8) all move path-keyed counters. Ruling: modern-rescue manifest execution resumes AFTER A8 (severance + regen), when channel identity is final — running it interleaved would churn its evidence twice. The `engine-audit:relocate-paths` tooling handles path-keyed counter relocation at A8 without ceiling changes. Until then the program's dual counters stay frozen at their recorded state.

## 9. Canaries/gates per cohort, and commands

Every cohort atom ships, in the D1/SEV pattern: (a) signed roster + rederivable hashes (global/modeMembership/slugChannel recipes as in `sevDead21SourceDrain`); (b) shared enforcer asserting `_source` absence with re-insertion mutants per slug/mode; (c) shared consumer scanner (var() + CSSOM/TS recognizers) proving zero productive readers for DELETE cohorts, or reader-preservation for MIGRATE cohorts; (d) receipt validator deriving canonicalLines from historicalValues (stored<->derived<->signed cross-check) with same-count/wrong-mode/value mutants; (e) decrease-only provenance baseline arithmetic matching the removal exactly; (f) for MIGRATE/UNIVERSALIZE atoms additionally: transport-equality fixture green and per-theme compiled-digest invariance (value-neutrality proof, L7).

Commands (focal, per atom):

```
pnpm exec vitest run src/foundation/tokens/__tests__/brand-authored-residue-retirement.test.ts
pnpm exec vitest run src/foundation/tokens/__tests__/cert-fence-conflict9.test.ts
pnpm exec vitest run <new cohort/equality/name-law tests>
pnpm exec tsc -p tsconfig.tests.json --noEmit
node scripts/artifact-provenance-gate.mjs --check
```

## 10. Risks P0/P1 and definition of DONE

P0 (atom-blocking, fail-closed):

- P0-R1 any atom that closes with `compileAppearanceVariables` still emitting (dual lowering survives).
- P0-R2 any equality fixture over an intersection/subset instead of total inventory.
- P0-R3 silent `verticalKey` default in resolve/admission.
- P0-R4 A3/A5 landing without the compiled-digest invariance gate (mirror or chrome moves that silently change pixels).
- P0-R5 severance before every `_source` is at 0 and CONFLICT-9 sighted certification is closed.

P1:

- P1-R1 DDB stored digests change when the lowering unifies — admission/retention recompute must be inventoried in the ISO-CORE receipt, not discovered.
- P1-R2 `compileBrandTheme` internal fallbacks moving to `resolveTheme` must be proven value-neutral by digest.
- P1-R3 C6 delete half requires one app-side reader confirmation (evnto) before final deletion of channels that might paint.
- P1-R4 baseline pressure: each drain widens the already-red staleness gates until A8; keep the pending window short.

DONE definition: three `_source` files deleted; `extensionCss` API removed; one `Theme` type, one `compileTheme`, `resolveTheme` sole entry; transport-equality test green over TOTAL inventory with an EMPTY debt baseline; shape-hash identical across the three mirrored themes; name-law deny-list green with EMPTY baseline; provenance gate collapsed to compiler-only; artifacts regenerated, all GENERATED-PENDING receipts closed, staleness gates green; final sighted certification recorded. Then modern-rescue 255/5100 resumes.

## 11. Annex — hashes/counts/paths for DT<->K3 reconciliation

Census (post-D1+SEV, measured live): total 1,224 = rottay 1,027 + bithire 172 + evnto 25. Emitted channel sets (compiled segments): rottay 663, bithire 1,106, evnto 384. Regions: rottay shipped 532 / light 495; bithire shipped 166 / dark 3 / reduced-motion 3; evnto shipped 22 / dark 3.

Cohort uniques per slug: base-override R474/B83/E2; invented R30/B51/E18 (16 of E are product-named -> C6); redecl R21/B9/E1; owner-typed R3/B21/E4; dead-ds-declared R1/B1; ramp R1; root-non-custom R1.

Signed receipts already in ledger (`src/foundation/tokens/residual-adjudication.json`), all rederived byte-exact this session:

- `verticalDead4SourceDrain` (D1): roster 4, decls 8; global `6b3a72860e140376a58029e7824cfbc06e5b3810d8055c1a96f9fb9d515da06a`; modeMembership `1cfe1b350da8f79a2e1869f9a12ace776ec35c26d2238e9dd43cce3fe033ecb9`; value `e86e51390530f9df1e3a358cec14a2741265a4c582ce4cad88b6224f59291b05`.
- `sevDead21SourceDrain`: roster 21, decls 34 (R12/24, B7/8, E2/2); global `e2301dc78bcc2c159a5241bb5bd3b8d413a9b1c9f1d2bda538bee1aa1a0fddfe`; modeMembership (post SEV-RECEIPT-MODE, modes dark/light/all) `191837a2296706048f12274cdda65240daadd7f24fa16851e866185cea86b8f0`; slugChannel `57f8bdba52dbed3a3d63b52cb083bd5668f4465ae07821776925391b0fbff7a5`. B7 includes `--rt-premium-card-grid`.
- `verticalConflict9Execution`: roster 9, rosterSha256 `7d9ea09aed4297978cb2e789f6e242a63fb2978639204b371f415dd68ce78cfb`; zeroEffective 3; sightedPending 6.
- cert-fence signed literals (`cert-fence-conflict9.test.ts`, untracked): A6 PRE `d08ee3e7df182f40092aee9d699e38938b478d7addb9313284dc75af60e5e73f`, A6 POST `f7ddd4a700b0343b4639a5643188cfea68ae0749cf6282854d63fe700c633778`, MATRIX12 PRE `bbe5929d7b3ac84e6ccc142333c62055ef50eac3b03af9b2e2ae4ee5d3f7c4da`, MATRIX12 POST `343483658e7f2a622fe744e4d2633f4dc83a7266552c3fdba13d01309c88f641`.

C1 roster (31): bithire: color-interactive-border, motion-calm, motion-deliberate, motion-instant, radius-full, sidebar-group-margin-bottom, sidebar-group-margin-top, sidebar-group-padding-top, sidebar-item-indent; evnto: radius-full; rottay: breadcrumb-active-color, breadcrumb-color, breadcrumb-color-active, breadcrumb-color-hover, breadcrumb-separator-color, card-image-placeholder-bg, card-image-placeholder-color, color-bg-surface, color-interactive-border, radius-full, segmented-bg, segmented-item-bg, segmented-item-bg-selected, segmented-item-color, segmented-item-color-hover, segmented-item-color-selected, segmented-shadow, sidebar-group-margin-bottom, sidebar-group-margin-top, sidebar-group-padding-top, sidebar-item-indent (all `--ds-` prefixed).

C2 roster (28): bithire: badge-line-height, button-default-bg-active, button-error-{bg,bg-hover,border,color}, button-ghost-bg-active, button-info-color, button-link-{color,color-active,color-hover}, button-primary-bg-active, button-secondary-bg-active, button-success-color, button-text-{bg,bg-active,bg-hover,color}, button-warning-color, shell-sidebar-collapsed-width, shell-sidebar-width; evnto: sidebar-group-margin-{bottom,top}, sidebar-group-padding-top, sidebar-item-indent; rottay: elevation-1, elevation-2, elevation-3 (all `--ds-`).

C3 roster (2): rottay `--ds-empty-title-color`, bithire `--ds-surface-card-grid-line-strong`. C7: rottay `--ds-color-alpha-black-100`. C8: one raw `color` declaration, rottay gap region.

Product-name census (core src): `--ds-dashboard-*` 29 unique / 98 occ; `--ds-event-*` 10/80; `--ds-ticket-*` 6/30; `--rt-*` 6/32 (evidence/generated only). Vertical-slug channels (`--ds-{rottay|bithire|evnto}-*`): 0.

Key paths: contract `src/foundation/contracts/composition/tenants/themes/index.ts` (+ `tenant-theme/index.ts`, fixture `tenant-theme/fixtures/themanagement-db-row/`); compilers `src/infrastructure/compilers/kernel/runtime/brand-theme/`, `src/infrastructure/compilers/composition/tenant-theme/index.ts` (:1380 entry, :1463 appearance emission); themes `src/foundation/tokens/ts/presentation/brand-themes/{rottay,bithire,evnto}/index.ts`; extensions `src/foundation/tokens/css/facade/artifacts/{slug}/_source/extension.css`; public export `src/entrypoints/server/index.ts`; gates `scripts/artifact-provenance-gate.mjs` + `.baseline.json`, `first-party-artifacts-generated.test.ts`; evidence tests `src/foundation/tokens/__tests__/brand-authored-residue-retirement.test.ts`, `src/foundation/tokens/__tests__/cert-fence-conflict9.test.ts`.

## 12. Separate verdict: SEV-RECEIPT-MODE

**ACCEPT — 0 P0, 0 P1.** Write-set exactly `residual-adjudication.json` + `brand-authored-residue-retirement.test.ts`. `canonicalLines.modeMembership` now `bithire/all` (2: the root-region `--ds-premium-card-header-top-line-display` and `--rt-premium-card-grid`) + `bithire/light` (6); `historicalValues.bithire` split `all{2}+light{6}`; recipe rewritten to "modes dark/light/all"; mode hash re-signed `191837a2296706048f12274cdda65240daadd7f24fa16851e866185cea86b8f0` and rederived byte-exact by this auditor; global/slugChannel hashes unchanged. `assertSevDead21Ledger` now DERIVES roster/modeLines/slugLines from `historicalValues` and cross-checks stored<->derived<->signed, with wrong-mode/same-count/value mutants through the shared helper. Focal 106/106 green; `tsc -p tsconfig.tests.json --noEmit` 0 errors; `artifact-provenance-gate.mjs --check` exit 0.

— End of audit. No source/test/ledger/manifest was modified; nothing staged or committed.
