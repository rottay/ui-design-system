# Runtime census harness

Measures **what a vertical actually paints**, not what its artifact declares.
Built for WO-CRA-23; left here because the next lane inherits an instrument
nobody else has run.

Run everything from `packages/core`. Node only, no build step, no dev server.

---

## The question these scripts exist to ask

`BARE-ROOT-CENSUS.md` asks *"is this name absent from the vertical's
unconditional block"* — a **static** question about authorship. That is not the
same as *"does this vertical paint differently"*, and the gap between the two is
large and systematic: a vertical diverges without redeclaring anything whenever
the DS value is a formula over its own inputs.

Measured error rate of the static method against runtime, on the partial bucket:
**evnto 43% false-positive, rottay 61%**. Its per-vertical figures for the
*fully tenant-free* bucket were never checked at all.

**A name is SILENT for a vertical only when its resolved value equals the
tenant-less value in BOTH themes.** That is the definition every script here
uses, and it is a runtime question, so it is asked at runtime.

---

## Scripts

| script | what it does |
|---|---|
| `render-artifact.mjs` | Renders any vertical's artifact **in memory** from its authored `.ts` + `_source/extension.css`, exactly as `build:vertical-css` would. Library, not a CLI. |
| `census.mjs` | The three buckets, re-derived at runtime for all three verticals. Writes `census-runtime.json`. |
| `compare.mjs` | Before/after proof over the full corpus. Reads 8 pre-composed bundles. |
| `resnapshot.mjs` | Builds both arms from **one** disk state (see trap 3). |
| `snapshot.mjs` | Earlier one-arm-at-a-time version. Superseded by `resnapshot.mjs`; kept because it is simpler when the tree is quiet. |
| `four-cell.mjs` | Tenant-less + before + after, one vertical. The silence test in its smallest form. |
| `blast-radius.mjs` | Who inherits a base value — 8 cells across all three verticals. |
| `extra-fixtures.json` | Painted-longhand fixtures the shipped roster does not cover (control block-size, card body padding, badge radius). |

`census-runtime.json` is the current output: every `--ds-*` name with which
verticals speak on it and its paint role.

---

## Six traps. Each one drew blood.

**1 — `dist/` is behind `src/`, so a dist-backed render is wrong.**
`scripts/build-vertical-artifacts.mjs` imports the compiler from `dist/`. At the
time of writing dist emits `--ds-tabs-item-radius: 6px` where the committed
artifact carries `calc(6px * var(--ds-radius-scale, 1))`. `render-artifact.mjs`
therefore esbuild-bundles the renderer from **`src/`**. If you use dist you will
silently reintroduce the pre-radius-scale form into every measurement.

**2 — the probe's own canary pair cannot measure a tenant-less document.**
`resolution-probe`'s `CANARY_PROPERTIES` includes `--ds-radius-scale`, which is
declared by the three tenant artifacts and by **nothing** in the base layer. With
the artifact withheld it is legitimately empty and the harness refuses the run —
correctly. Use base-declared canaries instead: `--ds-radius-md` and
`--ds-font-size-sm` (`foundation/themes/default.css`). Do **not** delete the
canary; an unapplied stylesheet reads exactly like a genuinely inert channel.

**3 — a shared tree moves between runs, so two runs are not two arms.**
Three consecutive compositions of the same vertical produced three different
bundle sha256s while other lanes were writing. A before-run and an after-run in
separate processes differ by whatever else landed in between, and nothing is
attributable. **Both arms, one process, one read of the tree.** Better still,
`resnapshot.mjs` composes the *after* bundle and produces *before* by
substituting the pristine file text back into it — so sibling verticals are not
merely asserted identical across arms, they are **unable to differ**.

**4 — role, not luminance. On the source block too.**
A luminance filter over `foundation/themes/default.css`'s `:root` reports **129**
dark literals. About **111 are correct light-mode ink** — a dark tooltip on a
light page is right. The real defect set was **13**. Classify by what the value
paints (ground / ink / edge) before counting anything. The same filter applied to
resolved values collapsed 365 → 104 → ~13. A raw bucket count without roles is
the number that produces 129.

**5 — re-derive at write time, never from an earlier measurement.**
Three saves in one session: the evnto lane authored `--ds-color-border{,-subtle,
-tertiary}` as `color-mix(…)` between measurement and write; the bithire lane
grew its theme by 355 lines between proof and handoff. Record a sha per file
immediately before writing and re-measure if anything moved.

**6 — after a rewire, two blocks can become textually identical.**
Anchoring an edit on declaration lines aborted because the light block, once
rewired to the ramp, carried byte-identical text to the `.dark` block. Anchor on
the **selector**. Unchecked, that edit would have inserted six dark pins into the
light block — the exact defect being fixed, doubled. Keep edits fail-closed:
assert the old text occurs exactly once before replacing.

---

## Two laws this instrument is built on

**An outcome test survives a false premise; a mechanism argument does not.**
A belief used here (".dark is a complete override") turned out to be true only of
the colour families and false of the file — 48 of 1059 `:root` names. It cost
nothing, because the conclusion rested on a measured outcome (`dark: 0 moved`
across 4,027 names in four scopes) rather than on the belief. A mechanism
argument built on the same premise would have shipped the defect silently.

**Every scope re-measured at execution time collapsed by roughly an order of
magnitude.** 585→333, 485→190, 365→104, 129→13, 53→2. Five instances, no
exceptions. A census sizes a wave; it does not authorise one. If a
re-measurement *confirms* a census number, suspect the re-measurement first.

---

## What is measured, and what is not

Counted: every `--ds-*` name declared anywhere in any composed bundle, read at
`:root` via `getComputedStyle`, per vertical per theme, engine `modern`, viewport
1280×800, `prefers-reduced-motion: reduce`.

Not counted, and each will mislead you if forgotten:

- **Reduced motion is on.** Any `--ds-motion-*` channel reads `0s`. That is the
  harness's context, not the vertical's value. Re-run with
  `reducedMotion: 'no-preference'` before concluding anything about motion.
- **A custom-property read returns the substituted token stream**, not an
  evaluated length: `calc(8px * 1)`, not `8px`. Diagnostic. Painted longhands
  settle arguments; that is what `extra-fixtures.json` is for.
- **Anything originating in React** — recipe-profile prop defaults, attributes a
  component stamps at render, inline styles. A CSS fixture states the DOM; it
  does not derive it.
- **Appearance.** These scripts prove values, never that a result looks right.
