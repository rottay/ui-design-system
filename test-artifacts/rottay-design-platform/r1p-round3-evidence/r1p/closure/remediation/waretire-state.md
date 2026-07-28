# W-A · safe retirement + zero-repaint ground migration

## Step 0 — baseline

Both builders green against the committed artifacts before any edit:

* `node packages/core/scripts/build-vertical-artifacts.mjs --check` → 3/3 up to date
* `node .../r1p/scripts/build-artifacts-from-source.mjs --check` → 3/3 up to date

Effective BEFORE: `bithire 1381/1381/1291 · evnto 383/383/347 · rottay 1172/1155/1172`
(default/light/dark) — reproduces W-C's snapshot exactly.

## Step 1 — reader census re-verification (the retire set is NOT what v1 said)

The v1 evidence rates 466 rows / 285 channels as owner (d) `retire` on `readers: 0`,
where "reader" means a `var(--x)` occurrence. That test is too weak to retire on.
Five independent reader classes were measured over 11,640 files across the five
census roots **plus** two roots the P1 census never looked at (`packages/core/scripts`,
the package root that holds the published `hooks-manifest.json`):

| class | what it catches that `var()` alone does not |
|---|---|
| R1 `var()` read | the P1 method, reproduced |
| R2 literal name | `getPropertyValue('--x')`, TS token maps, inline style writers, second declarations |
| R3 hooks-manifest | a published public hook is a reader by contract |
| R4 dynamic prefix | `` var(`--ds-input-${size}-gap`) `` reads a name no literal grep can see |
| R5 test reference | a test that names the channel breaks when it disappears |

Comment-only mentions are prose, not reads, so the literal scan runs with comments
blanked (length-preserving). Two singletons were exactly that and correctly cleared:
`--ds-card-side-accent` (the illustrative example in `ds-hook-manifest.mjs`'s rationale
header) and `--ds-progress-fill` (a prose note in an app-bithire stylesheet).

**Result — the good news first.** R1 is **zero for every eligible channel**: no channel
in the set has a real `var()` read anywhere. And **zero public hooks are at risk** —
all 78 hooks-manifest hits land in `foundationTokens` ("root-declared in authored DS
CSS"), none in `publicHooks`, `tenantChannel` or `declaredSlots`. No clear channel
appears anywhere in the manifest at all.

**Result — the finding.** 102 of 286 channels carry a blocker the `var()`-only census
could not see:

| disposition | channels | why |
|---|---:|---|
| **retire — pure orphan** | 184 | no hit of any class, repo-wide |
| **retire — DS value byte-equal** | 8 | DS also declares it with a byte-identical value, so retirement is inert even for a future reader |
| keep — reader-ambiguous | 53 | dynamic prefix (41), test reference (13), real app/compiler literal |
| keep — DS declares a DIFFERENT value | 41 | zero pixels move, but the channel's resolved value would silently change from the tenant's to the DS's; the artifact-scoped acid cannot see that |
| **total** | **286** | |

`--ds-card-side-accent` was re-verified as Q1 flagged: `readersFresh: 0`,
`readerDriftFromCensus: -6`, sole remaining mention is the prose comment above.
Owner (c) in v1, retired here as (d).

## Step 2 — ground migration (12 declarations, acid ZERO)

W-C's recommended follow-up, executed. In all three verticals the extension is gated to
the mode **opposite** the theme's declared arm, so the extension's values belong in the
base palette in every case — a clean swap, not a merge:

| vertical | theme declares | extension gated | migrated into |
|---|---|---|---|
| bithire | `modes.dark.palette` | `:not([data-theme="dark"]):not(.dark)` | base `palette` |
| evnto | `modes.dark.palette` | `:not([data-theme='dark']):not(.dark)` | base `palette` |
| rottay | `modes.light.palette` | `:not([data-theme='light']):not(.light)` | base `palette` |

12 extension declarations deleted, 12 `BrandTheme` palette fields added
(`backgroundSecondaryColor` / `backgroundTertiaryColor` / `backgroundElevatedColor` /
`onPrimaryColor`). Compiled var counts moved `1024→1028`, `319→323`, `462→466` — exactly
the four channels per vertical crossing from the extension into the compiled block.

```
bithire default/light/dark  +0 -0 ~0
evnto   default/light/dark  +0 -0 ~0
rottay  default/light/dark  +0 -0 ~0
TOTAL EFFECTIVE DELTA = 0
```

### The acid was lying, and had to be fixed before this number meant anything

`effective-map.mjs` writes a snapshot at module scope whenever `process.argv[2]` is set.
A comparator that imports it with its own argv in place therefore **overwrites the
baseline with current state and then compares current against current** — a guaranteed
`+0 -0 ~0` regardless of what changed. The first three zero readings this phase produced
were that artifact, not evidence. Two fixes:

1. `wa-acid.mjs` clears `process.argv` across the import.
2. The baseline was rebuilt honestly: `wa-ground-toggle.mjs --off` reverses all 10 edit
   sites (asserting exactly one match each, so a silent miss cannot fake a baseline),
   regenerates, snapshots, then `--on` re-applies. The rebuilt baseline reproduces the
   original counts exactly.

Adversarially verified: planting `--ds-color-primary: #123456` + a novel property makes
the acid report `FAIL +1 ~1` on all three bithire states. The detector is load-bearing.

### dist flag

`scripts/build-vertical-artifacts.mjs` imports the BrandTheme objects from **`dist/`**,
not from source, so it cannot see the TS edits: it regenerated artifacts *without* the
four migrated channels, which is a real repaint. Diagnosis — the dist **compiler is fine**
(`["backgroundSecondaryColor", "--ds-color-bg-secondary"]` is present in
`dist/infrastructure/compilers/kernel/runtime/brand-theme/index.js`); only the dist
**theme objects are stale**, carrying the field once (the mode arm) where source now has
it twice (mode arm + base palette).

**The committed artifacts are the source-builder output** and are correct.
`pnpm -C packages/core build:vertical-css` MUST NOT be run until `pnpm build` refreshes
`dist/`; until then `build-vertical-artifacts.mjs --check` reports 3 stale, which is
expected and is not artifact drift.

## Step 3 — retirement batches

Applied per vertical, each followed by regeneration + provenance gate + acid.
Deletion runs in the postcss AST (round-trip verified byte-lossless on all three
sources first), so untouched declarations keep their exact bytes. A section header
left labelling nothing is removed with its section — run to a fixpoint, since
removing one comment can orphan the one above it.

| vertical | eligible rows | retired rows | retired channels | decls | bytes | comments dropped |
|---|---:|---:|---:|---|---|---:|
| bithire | 178 | **152** | 118 | 400→248 | 39,515→26,440 | 43 |
| evnto | 16 | **13** | 13 | 70→57 | 6,386→4,680 | 24 |
| rottay | 273 | **131** | 66 | 1,338→1,207 | 84,214→71,610 | 96 |
| **total** | **467** | **296** | **192** | **1,808→1,512** | **130,115→102,730** | **163** |

Including the 12 ground-migration deletions the three sources go **1,820 → 1,512**
declarations (-308) and **130,550 → 102,730** bytes (-27,820).

### Acid — every difference is a drop, and every drop was retired on purpose

```
bithire default/light  +0 -118 ~0      evnto default/light  +0 -7 ~0
bithire dark           +0  -76 ~0      evnto dark           +0 -6 ~0
rottay  default/dark   +0  -66 ~0      rottay light         +0 -65 ~0
529 dropped channel-states · 0 added · 0 changed · ACID PASS
```

Every dropped channel was checked against the retire set — zero drops outside it.
Post-hoc verification: **0** retired channels still declared anywhere in the three
sources, **0** kept-back channels wrongly deleted.

## Step 4 — kept back (171 rows / 94 channels), with reasons

| reason | channels | disposition |
|---|---:|---|
| dynamic prefix — `` var(`--ds-input-${size}-gap`) `` style construction can name it | 41 | needs each interpolation site's value set enumerated to bound it |
| DS declares a **different** value — retiring silently changes the resolved value | 41 | needs a cross-file (artifact + DS root) effective check the current acid cannot do |
| test reference — a test names the channel | 11 | needs the assertion read before the channel goes |
| real app/compiler literal (`--rt-premium-card-grid`, declared by `app-bithire/src/styles/foundation.css`) | 1 | `--rt-*` is app-owned; a governance call, not a mechanical retirement |

None of these was forced. Each is a measured blocker, not a suspicion.

## Step 5 — baselines and focal tests

Gate debt **17 → 16** outstanding items (evnto drops from two over-budget regions
`[11, 59]` to one `[52]`). Baselines reseeded downward with the gate's own `--seed`,
which refuses growth:

| baseline | before | after |
|---|---|---|
| provenance · bithire | 404 decls / 39,660 B / 214 literals | 248 / 26,440 / 154 |
| provenance · evnto | 74 / 6,531 / 73 | 57 / 4,680 / 56 |
| provenance · rottay | 1,342 / 84,359 / 1,543 | 1,207 / 71,610 / 1,392 |
| consumer / consumer-modern | 236 / 248 dead | **unchanged** — the debt lists are identical; only the never-enforced `generatedFrom` provenance moved (+4 emitted, the ground channels) |

`KNOWN_SAME_STATE_REDECLARATIONS` is **unchanged at 9 entries**, and the staleness
assertion still passes. The mission expected the ground migration to shrink it; it
could not, because W-C had already dropped those four channels from the static
derivation path, so they were never conflicts. Nothing to drain there.

One test floor moved: `extension-cannot-beat-tenant`'s mode-overlap floor asserted
`> 40` against a count the retirement legitimately took 44 → 40. Its own comment says
the floor exists only to prove the case is real, so it now reads `> 30` and tracks the
drain instead of pinning a number the drain is meant to reduce.

| focal test | result |
|---|---|
| `node --test scripts/artifact-provenance-gate.test.mjs` | 27 passed |
| `artifact-renderer/tests/extension-cannot-beat-tenant.test.ts` | 9 passed |
| `artifact-renderer/tests/` | 31 passed |
| `kernel/runtime/brand-theme/tests/` (19 files) | 657 passed |
| `first-party-artifacts-generated` + `-parity` | 23 passed |
| `artifact-provenance-gate.mjs` | ✓ no debt growth (16 outstanding) |
| `tenant-channel-consumer-gate.mjs` / `--modern` | 0 new dead, 0 revived |
