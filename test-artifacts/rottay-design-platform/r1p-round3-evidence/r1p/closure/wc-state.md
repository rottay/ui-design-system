# W-C state — Phase 3: drain all application/component UI out of the static vertical extensions

Status: COMPLETE. Provenance gate GREEN, 23/23 drills pass, acid delta ZERO.

## Result in one table (bithire extension, before → after)

| metric | before | after |
|---|---:|---:|
| declared regions | 29 | 8 |
| rules | 388 | 8 |
| declarations | 1971 | 412 |
| `!important` | 462 | **0** |
| app-selector occurrences | 642 | **0** |
| engine-selector occurrences | 39 | **0** |
| `component-local` regions | 15 | **0** |
| `media` regions | 3 | **0** |
| `reduced-motion` regions | 2 | 1 (root-level only) |
| `structural` regions | 2 | **0** |
| `capability-gap` regions | 7 | 7 (untouched, byte-identical) |
| lines | 5731 | 1127 |
| bytes | 166833 | 40028 |
| provenance-gate outstanding debt | 752 | **9** |

evnto and rottay: unchanged, 2 capability-gap regions each, 0 app / 0 engine /
0 `!important` / 0 component-local. Verified, nothing to drain (brief step 5).

## Checkpoints (one batch, one gate run each)

| batch | regions | destination | gate exit |
|---|---|---|---|
| B1 inventory + ledger | all 29 | — | report only |
| B2 execute (single deterministic pass) | 4-7, 9-11, 12-15, 17-19, 21-28 | app / retired / kept | — |
| B3 regenerate + gate | — | — | **0 GREEN** |
| B4 baseline re-seed (downward) | — | — | **0 GREEN** |

## Destination totals (ledger `phase3-ledger.json`)

| destination | regions | rules | declarations | `!important` |
|---|---:|---:|---:|---:|
| app-bithire | 16 (+2 partial) | 355 | 1465 | 462 |
| retired-dead | 4 (+3 partial) | 10 | 39 | 0 |
| DS-extension-kept | 8 | 9 | 413 | 0 |

## Files written

DS (`ui-design-system/packages/core`):
- `src/foundation/tokens/css/facade/artifacts/bithire/_source/extension.css` — trimmed
- `src/foundation/tokens/css/facade/artifacts/{bithire,evnto,rottay}/index.css` — regenerated with the SOURCE builder (dist is stale; the dist-backed builder was never run)
- `scripts/artifact-provenance-gate.baseline.json` — re-seeded DOWNWARD (752 → 9)
- `scripts/artifact-provenance-gate.test.mjs` — drill 23 re-anchored (W-A's file, this wave's)
- `src/foundation/tokens/__tests__/bithire-motion-interaction.test.ts` — 3 assertions re-anchored

app-bithire:
- `src/styles/collection-preview-chrome.css` — NEW, 2153 lines, 212 rules, 63 `!important`
- `src/styles/detail-editor-chrome.css` — NEW, 2140 lines, 141 rules, 399 `!important`
- `src/styles/tenant-component-defaults.css` — NEW, 48 lines, 3 rules, 0 `!important`
- `src/app/globals.css` — 8-line import block after the DS bundle import (line 21)

## Porcelain proof

Every file above was clean-or-ours before I touched it:
- `globals.css`, `bithire-motion-interaction.test.ts`, `ux-budget-baseline.json`, `classic/theme.css`, `modern/skin/tag.css` — all CLEAN, verified per-file with `git status --porcelain <path>` and absent from `phase0-bithire-porcelain.txt` / `phase0-uids-porcelain.txt`.
- The six artifact files and the two gate files were already ` M`/`??` from W-A/W-B of THIS wave (declared in `wa-state.md` / `wb-state.md`).
- NOT TOUCHED (foreign-dirty): `src/styles/foundation.css`, all 60+ dirty `modern/skin/*.css` and `presentation/components/skin/*.css`, `app-ds-boundary-gate.*`, `build-vertical-artifacts.mjs`, every dirty `src/features/candidates/**` file.

## Cascade-position law (why no winner moved)

The extension section is unlayered and lives INSIDE the artifact, which
`app-bithire/src/app/globals.css` imports at line 21 — before every other app
stylesheet. The three drained files are imported immediately after that line, in
the same relative order they held inside the extension, and every selector is
byte-identical (`html[data-tenant="bithire"]` scope included). Same specificity +
same document position = the same winner for every declaration, and this holds
without needing any argument about "app CSS loads later".

One family needed a second argument. Regions 22-28 (the detail inline-editor
suite) already have a twin in `app-bithire/src/styles/detail-chrome.css` under
`:root[data-ds-root]` (specificity 0,2,0) versus the extension's
`html[data-tenant="bithire"]` (0,1,1). The twin already outranks the moved rule
on specificity alone, so its wins are order-independent and unchanged. 141 of the
142 rules have such a twin; 139 declarations differ in value and 27 have no twin,
which is exactly why the extension copy was migrated verbatim instead of deleted.

`@keyframes` resolve by document order, not specificity.
`rt-detail-floating-toggle-in` is defined in both the extension and
`detail-chrome.css:1446` with identical steps; `detail-chrome.css` still loads
after the drained file, so the winning definition is the same one as before.

## Death proofs recorded for the retired rules

- **`.ant-*` (regions 12, 13, 14, 18, and 21's button arms)** — `app-bithire/src/app/layout.tsx:181` pins `engine: "modern"` statically; antd is imported only under DS `ui/**/engines/classic/`; app-bithire has ZERO antd imports. No `.ant-*` element can exist in a BitHire document. The canonical owner of antd paint is untouched and unaffected: `runtime/engines/classic/theme.css:624-700` declares the same tooltip/badge/tag properties at `html[data-tenant]` scope for every tenant.
- **bare `.rottay-tag` / `.rottay-tag--*`** — emitted only by `Tag/engines/classic` and `Tag/engines/rustic`. Modern Tag emits `rottay-tag-shell rottay-tag-shell--modern` and is painted by the clean `modern/skin/tag.css`.
- **`.rottay-badge` — NOT dead**, `Badge/engines/modern/index.tsx:291,366` emit it. Kept, moved to the app.
- **`.badge`, `.badge-*`, `.btn-*`, `.ds-badge`, `.ds-btn--*`, `.bithire-form-required-pill`, `.bithire-form-section__complete-pill`** — token-exact grep over every `.ts`/`.tsx` in the DS (tests excluded) and in app-bithire returns ZERO emitters for all of them.
- **`.ds-surface-hero` / `.ds-rich-card` / `.ds-surface-card` / `.ds-surface-panel` / `.rt-surface-*` / `.bithire-surface-card` — NOT dead** (3/9/1/3/4/4 app renders). Region 21's final rule was kept and moved.

## Acid test

`wb-acid.mjs` (W-B's snapshot vs now) reports **+0 −0 ~18** across all nine
states — byte-for-byte the same 18 deltas W-B recorded and classified (bithire
dark 7, evnto dark 3, rottay light 8, zero elsewhere). **This wave contributed
zero effective-value change.** Consistent with the drain being descendant-scoped:
the gate's root-arm count went 10 → 9, and the single removed root arm is
`--ds-list-preview-hero-visual-size` inside `@media (max-width: 780px)`, whose
unconditional declaration stays in the kept capability-gap region 8.

## BLOCKED

**`app-bithire/scripts/ux-budget-baseline.json` — per-file CSS budget not updated.**

`node scripts/white-label-token-audit.mjs --strict` was ALREADY RED before this
wave (13 overruns, measured on a scratch copy of the tree with my three files and
my `globals.css` block removed): `detail-chrome.css` +270 lines / +11 important,
`forms.css` +4, `tables-collections.css` +5, `families.detail.important` +29,
`global.bithireClasses` +55, plus 2 namespace-law violations
(`--candidate-details-gap` at `src/features/candidates/surface/screens/record/detail/styles/index.css:155,317`).
Those are foreign — a clean tracked file and Kimi's in-flight work.

I did NOT re-seed, for two reasons: the baseline is outside my declared write
scope (new CSS files + minimal import wiring), and re-seeding now would launder
those 13 pre-existing foreign overruns into an accepted baseline — the exact
failure the decrease-only law exists to prevent.

My wave's contribution is a TRANSFER, not growth: the same 462 `!important` that
left the DS extension (462 → 0, provenance gate) arrived in app CSS. Exact
counters to add once the foreign drift is resolved:

```
families.app-css.cssFiles["src/styles/collection-preview-chrome.css"] = { lines: 2153, important: 63 }
families.app-css.cssFiles["src/styles/detail-editor-chrome.css"]      = { lines: 2140, important: 399 }
families.app-css.cssFiles["src/styles/tenant-component-defaults.css"] = { lines: 48,   important: 0 }
families.app-css.cssFiles["src/app/globals.css"].lines: 40 -> 49
families.app-css.important:            413 -> 875   (+462 transferred)
families.app-css.fragileSelectors:       0 -> 1
families.app-css.fontSizeHardcodes:      1 -> 39
families.app-css.fontWeightHardcodes:   23 -> 52
families.app-css.borderRadiusHardcodes:  4 -> 37
global.bithireClasses:                2156 -> 2544  (+388: 340 detail-editor-chrome, 44 collection-preview-chrome, 4 rounding)
global.hardcodedVisualLines:           906 -> 940
```

Every one of these counters is Kimi's visual work to drive back down; none of
them is new debt. Removing the `!important` was explicitly out of scope for this
wave.

## Gates run (one command at a time, serially)

| command | exit |
|---|---|
| `node scripts/artifact-provenance-gate.mjs` (report, pre-drain) | 0 — 752 outstanding |
| `node r1p/scripts/build-artifacts-from-source.mjs` | 0 |
| `node scripts/artifact-provenance-gate.mjs` (post-drain) | 0 — 9 outstanding |
| `node scripts/artifact-provenance-gate.mjs --seed` | 0 (refuses growth; accepted the decrease) |
| `node scripts/artifact-provenance-gate.mjs --check` | **0 GREEN** |
| `node --test scripts/artifact-provenance-gate.test.mjs` | **0 — 23/23** |
| `node r1p/scripts/wb-acid.mjs` | +0 −0 ~18 (identical to W-B) |
| `npx vitest run src/foundation/tokens/__tests__/bithire-motion-interaction.test.ts` | 0 — 7/7 |
| `npx vitest run src/foundation/tokens/__tests__/` | 0 — 125/125, 16 files |
| `node scripts/app-ds-boundary-gate.mjs --check` | **0 GREEN** (SCOPED 190→201, shadowed/globalOwn/orphan all 0) |
| `node app-bithire/scripts/declarative-css-census.mjs` | 0 — every counter 0, `tenantNamedSelectors` 0 |
| `node r1p/scripts/build-artifacts-from-source.mjs --check` | 0 — 3/3 up to date |
| `node app-bithire/scripts/white-label-token-audit.mjs --strict` | 1 — see BLOCKED (red before the wave too) |

No builds, no typechecks, no full suites, no git operations.

## What I did NOT do

- Did not touch `scripts/build-vertical-artifacts.mjs` or run the dist-backed builder (dist is stale per W-B; the source builder reproduces all three artifacts byte-identically).
- Did not remove a single `!important` — migrated as-is per the brief; that is Kimi's visual work.
- Did not touch any Modern skin or `presentation/components/skin/*.css` file. None was needed: every rule I moved is scoped to one tenant, so hoisting it into a Modern skin would have repainted evnto/rottay/platform — a silent visual change C6.9 forbids. The only Modern-destined candidate (region 19's generic reduced-motion zeroing) was kept in the extension instead, because it is root-level governed emission and moving it to a global DS policy would have zeroed motion for verticals that do not zero it today.
- Did not re-seed `ux-budget-baseline.json` (see BLOCKED).
- Did not touch evnto/rottay extensions (verified clean of every law).
