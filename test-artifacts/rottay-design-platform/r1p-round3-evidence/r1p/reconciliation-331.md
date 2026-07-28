# R1-P — Exhaustive reconciliation of removed declarations (correction 4) + bundle plan (correction 8)

Machine-derived from `migration-plan.json` (name-level lists; every count recomputable).
Verified by the independent true-acid recomputation (`true-acid-delta.json`, committed-HEAD
vs current artifacts).

## The 331 deleted extension declarations — closure table

| Category | bithire | evnto | rottay | Total |
|---|---|---|---|---|
| Absorbed by BrandTheme (extension value adopted, then deleted) | 40 | 0 | 10 | **50** |
| Identical duplication deleted (compiled already equal) | 20 | 79 | 180 | **279** |
| Compiled-canonical deleted (deliberate: evnto Arabic-fallback restoration) | 0 | 2 | 0 | **2** |
| Obsolete channel deleted | 0 | 0 | 0 | 0 |
| Pending/blocked | 0 | 0 | 0 | 0 |
| **Sum (= deleteNames)** | **60** | **81** | **190** | **331** ✓ |

Notes: "50 names adopted" maps to 49 BrandTheme field writes (one field can feed two vars,
e.g. card radius pair) — both lists are in migration-plan.json `sets[]` with from/to values.
No declaration disappeared without a category.

## Separately accounted removals (not part of the 331)

| Item | Count | Category |
|---|---|---|
| BITHIRE CLEAR MODE GUARD region (banner + 2 rules) | 208 declarations | Contradictory/obsolete block deleted per AD-3 (authorized; dark now serves the declared dark palette) — visible in true-acid bithire dark: -94 keys / ~86 values |
| rottay duplicate `color-scheme: dark` | 1 | Redundant with compiler-emitted color-scheme |

## Retained (NOT deleted) — declared exceptions with headers

capability-gap 2 (bithire: incl. `--ds-color-bg-primary` — palette seed cannot hold the
non-derivable adopted value) + 77 (rottay light-block channels not contract-expressible) +
1 (evnto) = **80 gap channels, decrease-only baseline in
artifact-provenance-gate.baseline.json (2/0/77 + 1 evnto)**; plus mode-block / media /
reduced-motion / component-local / structural regions (29 bithire, 2 evnto, 2 rottay).
Status: PROVISIONAL_IMPLEMENTED; NEEDS_CODEX_ACCEPTANCE.

## Bundle reconciliation plan (correction 8 — BLOCKED, documented)

- Affected bundles: ALL FIVE `packages/core/styles/{bithire,evnto,index,platform,rottay}.css`
  (each splices its vertical artifact verbatim after scope projection).
- Current hashes: recorded in `phase0-live-hashes.txt` (artifacts) and the bundles carry
  concurrent-WIP state (dirty since before the wave, mtime 06:12).
- Source→artifact expected diff: `true-acid-delta.json` (per state, per channel, exact
  values) + `git -C ui-design-system diff -- packages/core/src/foundation/tokens/css/facade/artifacts/`.
- Expected bundle hashes: **cannot be honestly precomputed** — the bundler composes from
  source CSS that includes Kimi's un-landed WIP; any "expected" hash computed now would
  embed a moving concurrent state and be unreproducible. Generating them in a temp dir was
  evaluated and rejected for the same reason.
- Reconciliation procedure (one command, post-WIP-landing, single owner):
  1. Kimi's WIP lands (or is stashed by its owner).
  2. `node scripts/build-vertical-artifacts.mjs --check` (requires rebuilt dist — see
     serial-validation log) → must be green.
  3. `pnpm -C packages/core build:vertical-css` once.
  4. Verify each bundle's tenant tail equals the artifact content (the provenance gate +
     bundle parity checks cover this).
- R1-P is therefore NOT CLOSED: source and shipped bundles diverge until this runs.
  Status: BLOCKED (concurrent WIP), by design per AD-9.
