# W-A — Phase 1A: harden the artifact provenance gate (Codex C2 / C6.4)

Status: COMPLETE. Gate GREEN on the real tree, 23/23 drills pass.

## Files written (WRITE scope only)

- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/artifact-provenance-gate.mjs` (rewritten, ~700 lines)
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/artifact-provenance-gate.baseline.json` (re-seeded, 41 KB)
- `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/scripts/artifact-provenance-gate.test.mjs` (rewritten, 23 tests)

`ci-gates.manifest.mjs` NOT touched — the prior wave already registered both
entries (`artifact-provenance-drill`, `artifact-provenance`) in the right order
(after the two artifact-freshness gates). No change needed.

## Porcelain check (run before editing, per the law)

```
 M packages/core/scripts/ci-gates.manifest.mjs      <- prior wave, gate registration (ours)
?? packages/core/scripts/artifact-provenance-gate.mjs
?? packages/core/scripts/artifact-provenance-gate.baseline.json
?? packages/core/scripts/artifact-provenance-gate.test.mjs
```

The three gate files were untracked (authored by the prior wave) = clean-or-ours.
NOT MINE, already dirty before I started, never touched by me:
`app-ds-boundary-gate.{mjs,test.mjs,baseline.json}`, `build-vertical-artifacts.mjs`,
`cra-12-motion-governance.registry.json`, `i18n-key-parity-gate.baseline.json`,
and all six `artifacts/{bithire,evnto,rottay}/{index.css,_source/extension.css}`.
The baseline was seeded from that current (dirty) tree state, which is the state
Codex audited — my measured 388 rules / 2132 declarations reproduce the audit
table exactly, so the audited artifact and the seeded artifact are the same file.

## Measured per-vertical metrics (seeded as the baseline)

| vertical | bytes | lines | regions | rules | decls | !important | literals (color/space/motion) | custom props | redecl-of-compiled | root/desc arms | app sel | engine sel |
|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---|---:|---:|
| bithire | 173001 | 5900 | 29 | 388 | 2132 | 462 | 969 (198/680/91) | 609 | 121 | 10/396 | 642 | 39 |
| evnto | 9075 | 269 | 2 | 2 | 147 | 0 | 149 (125/24/0) | 146 | 55 | 3/0 | 0 | 0 |
| rottay | 100087 | 2849 | 2 | 2 | 1747 | 0 | 1976 (1704/260/12) | 1745 | 341 | 3/0 | 0 | 0 |

bithire per-kind: mode-block 1 region / 1 rule / 191 decls; media 3 / 27 / 60
(22 !important); reduced-motion 2 / 4 / 7 (3); component-local 15 / 346 / 1487
(437 !important, 579 app, 38 engine, 112065 bytes = 65 % of the file);
structural 2 / 4 / 8; capability-gap 6 / 6 / 379.

Reconciliation with the audit's C2 table: rules 388 ✓, declarations 2132 ✓,
Ant selectors 25 ✓ (of 39 engine occurrences; the other 14 are DaisyUI
`.badge*` / `.btn-*` / `.tooltip*`). `!important` 462 vs the audit's 464 — the
audit counted raw text occurrences, this gate counts postcss `decl.important`
(the two extra are inside comments/values). Region count 29 ✓.

## Grandfather inventory (the debt the laws still see)

bithire only; evnto and rottay are empty on every law, so ANY instance there is
red immediately.

- 15 `component-local` regions (ids `component-local#8c73a7bc#1..15`, emitted in
  the report as the drain backlog)
- 207 application selector tokens (`.bithire-*`, `.rt-*`, `[data-bithire-*]`)
- 33 framework/engine selector tokens (`.ant-*` + DaisyUI classes)
- 122 selectors carrying `!important` (462 occurrences, counted per selector)
- 26 media/reduced-motion descendant skins
- 0 structural component-paint rules

Total outstanding debt printed on green: **822 items**.

## Design decisions worth reviewing

- Region id = `kind#sha1(purpose)[0:8]#ordinal`, ordinals dense per family.
  Property: draining regions can only shrink the id set (subset of the
  inventory → still green); adding one always mints an unbaselined id → red.
  Independent of WHICH region is drained, so no renumbering hazard.
- L-B grandfathers selector TOKENS, not full selectors: reusing an existing
  token in a new rule is caught by the occurrence ratchet, while a new token is
  caught by the law. L-C grandfathers per NORMALIZED SELECTOR with counts, so a
  net-zero `!important` swap between selectors is still red.
- Framework vocabulary is read from `scripts/lib/daisy-painted-classes.json`
  (the manifest the Modern-engine gates already pin) — no new dependency, no
  second hand-maintained class list.
- `--seed` now REFUSES to raise any decrease-only budget without
  `--allow-growth`, so re-seeding cannot silently launder growth.
- Green wording is `no debt growth (baseline: N items outstanding)`; the word
  "clean" never appears while N > 0, and a drill asserts that.

## Commands run (one at a time, no builds/suites)

| command | exit |
|---|---|
| `node scripts/artifact-provenance-gate.mjs` (report, pre-seed) | 0 |
| `node scripts/artifact-provenance-gate.mjs --seed` | 0 |
| `node scripts/artifact-provenance-gate.mjs --check` (real tree) | **0 GREEN** |
| `node --test scripts/artifact-provenance-gate.test.mjs` | **0 — 23/23 pass** |
| `--check --artifacts-root <copy of real tree>` (unmodified) | 0 |
| `--check --artifacts-root <copy + planted region/ant/app/!important>` | **1 RED** |
| `--seed --baseline <temp>` against the planted copy | **1 (refused growth)** |
| `--seed --allow-growth --baseline <temp>` against the planted copy | 0 |

Adversarial run against the REAL baseline (planted a single new
`component-local` region with `.bithire-candidates-rail .ant-picker` and one
`!important`) fired 4 law findings + all 7 ratchets.

## Drill results (all hermetic temp-dir fixtures, matched control/planted pairs)

Every law drill is volume-neutral, so the ratchets cannot see it and the drill
proves the LAW caught it. Each asserts the exact set of check ids, and asserts
its control twin is green against the same baseline.

| drill | expected checks | result |
|---|---|---|
| `.badge` → `.ant-table` swap | `law:engine-selector` only | RED ✓ |
| `.bithire-preview-rail` → `.bithire-candidates-rail` | `law:app-selector` only | RED ✓ |
| `[data-bithire-preview-focused]` → new data attr | `law:app-selector` only | RED ✓ |
| `structural` region retyped `component-local` | `law:component-local` only | RED ✓ |
| `!important` moved between two selectors (count unchanged) | `law:important` only | RED ✓ |
| descendant skin inside a `media` region | `law:media-scope` only | RED ✓ |
| custom-property-free paint in `structural` | `law:structural-paint` only | RED ✓ |
| capability-gap header missing `retire=` / empty `owner=` | `header` only | RED ✓ |
| one extra rule appended | `ratchet:{bytes,declarations,rules}` only | RED ✓ |
| capability-gap count above baseline | `ratchet:capabilityGaps` only | RED ✓ |
| vertical with no baseline entry | `ratchet:{capabilityGaps,metrics}` | RED ✓ |
| default-mode redeclaration of a compiled channel | `provenance` only | RED ✓ |
| block with no `@ds-exception` header | `provenance` | RED ✓ |
| keyframe steps in a `structural` region | (none) | GREEN ✓ |

## Follow-ups for the closure wave (NOT done here)

- The 15 `component-local` regions + 207 app tokens are the Phase-3 drain
  backlog; C6.4 requires zero. The gate now makes the backlog visible and
  monotone but does not shrink it.
- `rottay` still hand-authors 1747 root declarations (C6.1) — the gate counts
  them (341 redeclarations of compiled channels, 77 in the default state) but a
  dual-mode BrandTheme compiler is the actual fix.
