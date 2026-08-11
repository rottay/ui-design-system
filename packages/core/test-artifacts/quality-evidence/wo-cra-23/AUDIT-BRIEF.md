# WO-CRA-23 `modern-rescue` — adversarial audit brief

**For an independent auditor. Your job is to falsify what is written here, not to summarise it.**

This programme ran one overnight session on `ui-design-system`, ~300 local commits, none pushed.
Every claim below is stated with the evidence that produced it and the command that re-derives it.
Where a number is a floor rather than a total, it says so. Where we did not verify something, it is
listed in §7 rather than omitted.

**Write the resulting report to** `/docs-engineering/archive/audits/YYYY-MM-DD-wo-cra-23-audit-{user}.md`.

---

## 0. How to attack this efficiently

The programme's own failure modes are the fastest attack surface, because they recurred:

1. **A green that does not name its scope.** Four contracts described a compiler that no longer
   exists with no visible red, because nobody ran the suite whole. Assume more of these exist.
2. **A count that is a floor.** Every re-measured scope collapsed — 585→333, 35→3, 16→13. Assume any
   headline number is an upper bound on confidence, not on size.
3. **A mechanism argument instead of an outcome test.** Every time one was tried it lost. Look for
   claims justified by reading source rather than by running something.
4. **A control that mirrors the code rather than the corpus.** Several instruments passed their own
   controls while sharing the implementation's blind spot.

**The single most valuable thing you can do:** re-run
`pnpm --filter @rottay/design-system exec vitest run --project unit src/foundation/tokens` (40 files,
355 tests) and every gate below at HEAD, then check whether the numbers in §2 still hold. We only
discovered that command mattered near the end.

---

## 1. What the programme set out to do, and what changed

**Goal, unchanged:** *from each tenant's configuration, the same React tree must render as genuinely
different companies.*

**The coordinator's opening thesis was wrong and was refuted by measurement**, not by argument: the
verticals were assumed to under-diverge because they lack channels. A runtime census put bithire at
1984 channels and rottay at 1876 — 6% apart. **Audit target: was the refutation itself sound, or did
the census measure the wrong thing?**

What replaced it is in §2.1 and is the programme's central claim.

---

## 2. Claims, with their evidence and how to break them

### 2.1 CENTRAL — reach is near-identical; ~⅓ of painted surface cannot diverge

```
families reached      bithire 253 · evnto 252 · rottay 253   of 258
naming table          spread of 562 families
terminal in DS-literal / inline fallback / undeclared
                      bithire 33.3% light · 33.6% dark
                      rottay  33.0%       · 32.2%
                      evnto   39.5%       · 42.8%
```

Method: every `var()` chain in 381 skin files resolved to its terminal, per cell — 258 families,
14,666 painted declarations, six cells. Instrument and control in `harness/primitives/`.

**Attack it:** the census resolves each declaration's chain *as written* and explicitly does **not**
model cascade between rules competing for one property, nor `@media`/container conditions. Does that
omission change the ⅓? Its control lifts four terminals from the tree, the decisive one being
`--ds-font-family-base`, which rottay authors only in its dark-default block — the same declaration
must read `VERTICAL` in rottay/dark and `DS-LITERAL` in rottay/light. **Check that the control
actually inverts.** rottay is dark-first and its default block is `:not([data-theme='light'])`
carrying 646 declarations; a light-else classifier bins it backwards, and one instrument did exactly
that before correction.

### 2.2 The authorship table counts names, not identity — and was corrected twice

```
                DIRECT families   own channels   per family   top-5   median generic
rottay/platform      48 / 113           593          12        51%         11
bithire              24 / 113           723          30        51%         12
evnto                13 / 113           113           9        76%         10
```

**Two published versions were wrong before this one.** v1 claimed bithire concentrated 80% of its
authorship into five families — it is 51%, identical to platform's. v1 also had the totals tying at
396/409; they do not. The mechanism is **depth per family**, not concentration.

Caveat we attached ourselves and which you should test: **the direct column measures which families
a vertical NAMES, not which look different.** A vertical diverges with zero own-prefix channels
wherever a DS value is a formula over inputs it does author. Honest caption: *these are the families
each vertical names; divergence is at least this and probably more.*

**Attack it:** the prefix map derives from what each family reads, corroborated against the filename
or requiring ≥50% dominance **with an absolute floor of 3**. That floor was added only after three
families were misfiled by a ratio with no floor. Are there others?

### 2.3 Severance — the largest defect class, repaired

`data-part` is the anatomy hook; P-79 gives the caller's value priority; every skin was written
against the literal `root`. So a composing family that names a part **deletes the primitive's whole
skin**.

| family | exposure | repair |
|---|---|---|
| Button | 123 of 127 production sites, 38 files, 411 declarations | `[data-variant]`, weight-identical at 7 selectors |
| Badge | 16 sites / 9 patterns, 10 truly bare | scope class at (0,2,0), **deliberately below** the (0,3,0)–(0,4,0) pattern rules |
| Segmented | 2 shipped switchers, 29 selectors / 97 declarations | `[role='radiogroup']`, weight-identical |
| list-toolbar | 34 selectors / 117 declarations, dead against its own engine | `[data-variant]`, weight-identical |
| Tag | 3 of 4 sites, two engines | adjudicated, **deliberately unshipped** — specificity drops unequally |

Second-order, invisible to any "properties lost" measurement because the suffering rule stays alive
and matching: **`prefers-reduced-transparency: reduce` was silently not honoured on 123 buttons** —
its one suppressing declaration lived inside the severed block.

**Attack it:** Badge's repair drops specificity on purpose. We measured 0 of 6 compensated sites
losing pattern paint, in Chromium against three shipped bundles. Re-measure. Also check the claim
that `[data-variant]` is total — it was asserted across a 28-cell matrix, not read off the source.

### 2.4 Contrast — eight failures on shipped controls, repaired

```
platform/dark segmented label   3.51 → 6.32      evnto/dark label        2.40 → 7.77
Badge success dark              1.36 → 6.62      Badge warning dark      1.32 → 7.04
Badge default light             3.82 → 10.09     Badge default evnto/dark 4.39 → 8.58
DS semantic success text        41.3 → 56.7 Lc   DS semantic warning     38.8 → 55.5 Lc
```

**Three of these were not regressions — a repair stopped hiding them.** The semantic colours failed
because the light block's `--ds-color-bg-primary` had been `#0A0A0C`, a near-black contaminating the
light block; fixing that revealed colours that were never legible on a real light ground. Same shape
twice more.

**Attack it:** `bithire` was held byte-identical as the control for the base change — verify that.
And Badge `info` dark reaches only **3.68**, still under AA, declared and not repaired.

### 2.5 A public surface that shipped 2,248 lines and painted no colour

`oauth-transition` read `--rh-*`, a namespace **declared in zero files**, with no fallbacks — every
colour-bearing declaration invalid at computed-value time. Partition: 156 declarations lost across 8
properties, all chromatic; 966 survive across 69, all geometric. Repaired by renaming into the
private composition namespace and declaring 13 channels once, mapped to DS channels, with glow
derived from the tenant accent via `color-mix`.

**Attack it:** three foreign namespaces were found this way (`--rh-*`, `--rt-*`,
`--ds-progress-line-*`). **Are there more?** The instrument that finds them is a var-chain resolver,
not a grep.

### 2.6 The sighted evidence, and the run that was thrown away

Six captures in `sighted/`. Read them as three products.

**The first run of that capture came out untenanted and identical** — `rootAttributesToHtml` takes
the attributes object and was handed the scope, so all six rendered at the DS default primary. Six
images that would have "proved" the three verticals look the same. Kept run asserts the resolved
root attribute and primary per cell.

**Attack it:** one variant family of four, one provider, one phase, resting states only. Is the
conclusion robust to the other three variant families?

---

## 3. Rulings — architecture decisions taken by the coordinator, not the owner

Each is a decision an auditor may disagree with. All were taken under the standing law that
aesthetic and typographic choices are never escalated.

1. **Prefer an anchor the caller cannot remove** over one it merely happens not to use. Test is not
   "is the attribute present" but "can a caller remove it" — a question about the engine's prop
   spreading, not the CSS.
2. **Weight preservation is correct only when nothing competes in the band you would occupy.**
3. **A family compensation expires when its underlying channel is fixed.** Removing it is part of the
   repair, and only its author remembers it exists. Demonstrated: a segmented patch would have become
   the one place still below the band after the authority was raised.
4. **`oklab` over `oklch`** — the mix's second endpoint is the page ground, achromatic, and hue is
   undefined at chroma 0, exactly where cylindrical interpolation is unstable. Attributed to
   `8d2062008`, a deliberate `feat`. **Four contracts name `oklch` and are aged.**
5. **The fill is not supposed to separate; the edge is.** `track/page` is 1.00–1.07 in all five
   cells. A border-only track is still a track when the border is healthy.
6. **Do not mint a public channel for one surface** — derive from the tenant accent instead.
7. **Retire an undeclared chain arm; never declare it.** Declaring a name that was undeclared flips
   every read site at once without any being edited.
8. **A dark ramp spaced linearly in hex cannot express a boundary.** rottay's eight steps span
   `#0A0A0C`–`#252529` and produce 0.19 of contrast spread; it got a new rung (`#28282C`) rather than
   a re-point.
9. **A three-declaration repair in a brand theme blew a public entrypoint budget.** 43% of
   `runtime/tenant` is brand-theme source reachable from a `"use client"` entrypoint. Repairs were
   routed to `_source/extension.css` instead. **This is unresolved architectural debt, not a fix.**

---

## 4. Self-corrections already made — check for the ones we missed

Listed so you can calibrate how much we caught ourselves. **The existence of this many suggests more
remain.**

| retracted claim | corrected to |
|---|---|
| "`Text` never painted at 28px on three dashboards" | happy-dom's typed parser, not the component |
| "199 deliberately unlayered headers", then 155 | **9** — the matcher counted three senses of one word |
| "bithire authored the fix and nothing reads it" | engine-scoped: `classic/theme.css:662`, `rustic:724` read it |
| "an `xs` tag renders at `md` height" | the pill loses its height entirely; the **close button** carries the wrong one |
| "`list-toolbar` is a false positive" | true of one reading; nine other channels are genuine |
| "segmented gets dark paint via a formula one level down" | its 38 channels are **unconditional** and paint in both themes |
| "the static ramp is missing rungs at the top" | the unbindable value is **1.875rem**, a missing *middle* rung; there are **two** gaps |
| "bithire concentrates 80% into five families" | 51%, identical to platform |
| "the compiler stopped emitting the tone channels" | it emits all 25 — the contract names the wrong colour space |
| "`--ds-color-bg-canvas` dark is an orphaned literal" | a documented deliberate pin the coordinator himself wrote |

---

## 5. Instruments — audit these, not just their outputs

All in `harness/primitives/`, each with a control set and a README carrying its traps.

```
datapart.mjs · selectors.mjs · callsites.mjs · engine-pin.mjs · join.mjs
void-reads.mjs · fallback-reads.mjs · crossfamily-parts.mjs · nonroot-parts.mjs
render-census.test.tsx
```

Known instrument defects **found and fixed during the programme** — verify the fixes:

- a root resolved one level short made 4 of 5 corpora silently report ABSENT
- a `var()` walker skipped nested reads, hiding the family it was written for
- `callsites.mjs` matched JSX tags by name until import resolution was added — it then found **two**
  false LIVE rows (`Link` bound to `next/link`, `QRCode` to AntD's)
- a reachability gate grouped by part name, letting `Button` lend its severability to two primitives
  that do not have it
- a ratio threshold with no absolute floor fired hardest where the denominator was smallest
- a cell classifier whose default branch assumed light mis-binned the one dark-first vertical

---

## 6. Verification commands

```bash
cd ui-design-system
pnpm --filter @rottay/design-system run typecheck
pnpm --filter @rottay/design-system run lint:artifacts     # BEFORE build — build regenerates in place
pnpm --filter @rottay/design-system run gates:ci
pnpm --filter @rottay/design-system exec vitest run --project unit src/foundation/tokens
pnpm --filter @rottay/design-system run test:run
pnpm --filter @rottay/design-system run build               # last
node packages/core/scripts/engine-token-audit.mjs --check
```

Traps that produce false results:

- **A fresh worktree has no `node_modules`** and returns `ERR_MODULE_NOT_FOUND`, which reads exactly
  like a failing gate. Symlink from the repo root and from `packages/core`.
- **`dist` is not one age.** `build:vertical-css` rewrites `dist/*.css` from `src` while leaving
  `dist/**/*.js` untouched, because the artifact half imports the compiler *from* `dist`.
- **Capture exit codes directly, never through a pipe.** A trailing command eats them — a build
  exited 1 three times while the harness reported 0.
- **`rg -r` is `--replace`,** not recursive, and silently corrupts output.

---

## 7. What we did NOT verify — audit these first

1. **Six token contracts were red before the session and four remain red.** `elevation-surface-lift`
   and `reduced-motion-guard` are untouched. `root-component-authority` is repaired but incomplete —
   the contract names one channel at a time and exposed `-hover` after three were fixed.
2. **No full `test:run` was executed at HEAD.** Gates, typecheck, `lint:artifacts` and targeted
   suites are green; the whole suite is unverified.
3. **The visual evidence covers one family in six cells.** No contact sheet across the tier.
4. **`track/page` at 1.00–1.07 and evnto/light's chip-equals-track** are classified as design
   questions rather than failures. That classification is a judgement, not a measurement.
5. **The entrypoint byte debt** — 43% of a `"use client"` entrypoint being brand-theme source — was
   documented and worked around, never fixed.
6. **Three foreign namespaces were found by accident.** No systematic sweep was run for others.
7. **`family-ledger.json` has 252 rows** and was not reconciled against the work actually done this
   session. Treat its `state` column as stale.
8. Whether the repairs **look** right beyond the six captures. The programme's own standard was that
   a paint change on a shipped surface wants eyes; most of them did not get any.
