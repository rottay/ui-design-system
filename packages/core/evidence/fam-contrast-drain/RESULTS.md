# Contrast debt drain — WO-FAM-08 / WO-FAM-10

Writer packet, base `3b54a1818`. Evidence root:
`packages/core/evidence/fam-contrast-drain/`. Repair mechanism: the family scope re-derives
its quiet ink from the governed reading-ink channel INTO the ground the part
actually sits on, so the sign follows the mode by construction. No axe
exclusion, no relaxed assertion, no per-node literal, no threshold moved.

## Channels added (three families, four channels)

| channel | graded against | read by |
| --- | --- | --- |
| `--ds-column-settings-quiet-ink` | `--ds-surface-canvas` → `--ds-color-bg-primary` | the counter, a hidden column's label |
| `--ds-file-manager-quiet-ink` | `--ds-surface-card` (the family's own loaded-root ground) | the four column headers, the size/date cells |
| `--ds-record-quiet-ink` | `--ds-color-bg-secondary` (every strip well is a blend of it) | summary-item labels (default/technical/metrics) + helper |
| `--ds-record-canvas-quiet-ink` | `--ds-surface-canvas` → `--ds-color-bg-primary` | field labels, action-bar meta label + text |

Each is `color-mix(in srgb, var(--ds-color-text-primary) 72%, <ground>)`, stated
once in the family deriver and read by the skin with that same value as its
`var()` fallback (the record contract test enforces the single-fallback rule).

## Pins drained, by identity

| suite | scope | before | after |
| --- | --- | --- | --- |
| ColumnSettings | bithire light | 2 | **0** |
| ColumnSettings | evnto light | 2 | **0** |
| ColumnSettings | rottay dark | 1 | 1 (routed, arm 1) |
| PatternFileManager | bithire light | 9 | **0** (scope removed from the map) |
| PatternFileManager | evnto light | 12 | 3 (routed, arm 3) |
| PatternFileManager | bithire dark | 4 | 4 (routed, arm 3) |
| PatternFileManager | rottay dark | 2 | 2 (routed, arm 2) |
| Record | bithire light | 8 | **0** |
| Record | evnto light | 8 | **0** — `AXE_DEBT = {}` |

26 of 36 pinned nodes drained. The 10 that stand are all composed-primitive or
shared-material ink; see `DEBRIEF-routed-arms.md`.

## Weight drill — is 72% load-bearing?

Serious `color-contrast` nodes across all three families x four scopes, with the
weight mutated in all 13 formula sites and reverted byte-identically each time
(`cmp` verified 6/6 files after every pass):

| weight | serious nodes | reading |
| --- | --- | --- |
| 40% | 86 | every scope red, including ones that were clean |
| 55% | 48 | |
| 60% | 14 | 4 repaired pairings relapse |
| 62% | 14 | |
| 63% | 12 | 2 relapse |
| **64%** | **10** | exactly the routed residue — the WCAG binding point |
| 65% | 10 | |
| **72% (shipped)** | **10** | the fleet's governed quiet weight |

72% is NOT this packet's local minimum and the deriver comments say so: it is
the weight the data-table repair already governs (`51454e03b`), taken so the DS
carries one quiet rung instead of three families each sitting on their own
floor. Margin over the measured binding point: 8 percentage points.

## Declared paint changes

1. **Light scopes**: the repaired quiet text darkens from ~2.2–2.9:1 to
   6.1–7.2:1. The primary ink is untouched at 16.7–17.9:1, so the quiet tier
   stays unmistakably subordinate.
2. **Dark scopes**: the same formula regrades them too. file-manager's cells go
   10.72 → 8.1:1 and record's strip helper 12.0 → 8.8:1 (both quieter, both far
   above the floor); column-settings' counter and record's labels go UP
   (7.3 → 9.1:1, 6.2 → 7.7:1). This is the point of a mode-following formula:
   one rule instead of a role that only happened to work in one mode.
3. **record collapses three quiet roles into one.** `text-muted`, `text-tertiary`
   and `text-secondary` span 0.5 of a contrast point in light and do not hold
   their RANK across modes. `text-secondary` (`#A0A0A5` light, `#cbd5e1` dark) is
   lighter than `text-muted` (`#96969E` / `#94a3b8`) in BOTH modes, so it is the
   QUIETER of the two on a light ground (helper 2.43:1 vs label 2.74:1) and the
   LOUDER on a dark one (12.0:1 vs 7.0:1); `text-tertiary` equals `text-muted` in
   dark. Preserving that ranking would have preserved an inconsistency, so the
   family states one quiet rung. Recorded in the suite docblock.

## Named residue, measured and deliberately NOT repaired

record's `editorial` and `governance` summary-strip variants keep their own
authored label tints over gradient wells. Neither variant is mounted by the
causality suite, so no pin would hold a change to them — a repair without an
alarm is how debt returns. Flagged for the next record lot.

## Ratio table (every pairing whose ink moved)

| scope | pairing | ink before | before | ink after | after |
| --- | --- | --- | --- | --- | --- |
| column-settings :: rottay dark | counter | `#94a3b8` | 7.3 | `#b2b5ba` | **9.1** |
| column-settings :: rottay dark | hiddenLabel | `#94a3b8` | 7.3 | `#b2b5ba` | **9.1** |
| file-manager :: rottay dark | th | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: rottay dark | thPlain | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: rottay dark | sizeCell | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: rottay dark | dateCell | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: rottay dark | sizeCellSelected | `#cbd5e1` | 10.81 | `#b6b9c0` | **8.17** |
| file-manager :: rottay dark | dateCellSelected | `#cbd5e1` | 10.81 | `#b6b9c0` | **8.17** |
| record :: rottay dark | summaryLabelDefault | `#94a3b8` | 6.97 | `#b4b6bc` | **8.81** |
| record :: rottay dark | summaryLabelMetrics | `#94a3b8` | 6.98 | `#b4b6bc` | **8.83** |
| record :: rottay dark | summaryHelper | `#cbd5e1` | 12.03 | `#b4b6bc` | **8.81** |
| record :: rottay dark | fieldLabel | `#94a3b8` | 6.21 | `#b2b5ba` | **7.74** |
| record :: rottay dark | metaLabel | `#94a3b8` | 7.3 | `#b2b5ba` | **9.1** |
| record :: rottay dark | metaText | `#94a3b8` | 7.3 | `#b2b5ba` | **9.1** |
| column-settings :: bithire light | counter | `#96969e` | 2.94 | `#585858` | **7.11** |
| column-settings :: bithire light | hiddenLabel | `#96969e` | 2.94 | `#585858` | **7.11** |
| file-manager :: bithire light | th | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: bithire light | thPlain | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: bithire light | sizeCell | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: bithire light | dateCell | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: bithire light | sizeCellSelected | `#a0a0a5` | 2.33 | `#585858` | **6.37** |
| file-manager :: bithire light | dateCellSelected | `#a0a0a5` | 2.33 | `#585858` | **6.37** |
| record :: bithire light | summaryLabelDefault | `#96969e` | 2.74 | `#555555` | **6.96** |
| record :: bithire light | summaryLabelMetrics | `#96969e` | 2.74 | `#555555` | **6.96** |
| record :: bithire light | summaryHelper | `#a0a0a5` | 2.43 | `#555555` | **6.96** |
| record :: bithire light | fieldLabel | `#96969e` | 2.94 | `#585858` | **7.11** |
| record :: bithire light | metaLabel | `#9a9aa2` | 2.79 | `#585858` | **7.11** |
| record :: bithire light | metaText | `#96969e` | 2.94 | `#585858` | **7.11** |
| column-settings :: bithire dark | counter | `#94a3b8` | 7.72 | `#b2b2b4` | **9.35** |
| column-settings :: bithire dark | hiddenLabel | `#94a3b8` | 7.72 | `#b2b2b4` | **9.35** |
| file-manager :: bithire dark | th | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: bithire dark | thPlain | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: bithire dark | sizeCell | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: bithire dark | dateCell | `#cbd5e1` | 10.72 | `#b6b9c0` | **8.1** |
| file-manager :: bithire dark | sizeCellSelected | `#cbd5e1` | 10.04 | `#b6b9c0` | **7.59** |
| file-manager :: bithire dark | dateCellSelected | `#cbd5e1` | 10.04 | `#b6b9c0` | **7.59** |
| record :: bithire dark | summaryLabelDefault | `#94a3b8` | 7.04 | `#b4b6bc` | **8.9** |
| record :: bithire dark | summaryLabelMetrics | `#94a3b8` | 7.11 | `#b4b6bc` | **8.99** |
| record :: bithire dark | summaryHelper | `#cbd5e1` | 12.15 | `#b4b6bc` | **8.9** |
| record :: bithire dark | fieldLabel | `#94a3b8` | 6.21 | `#b2b2b4` | **7.52** |
| record :: bithire dark | metaLabel | `#94a3b8` | 7.72 | `#b2b2b4` | **9.35** |
| record :: bithire dark | metaText | `#94a3b8` | 7.72 | `#b2b2b4` | **9.35** |
| column-settings :: evnto light | counter | `#96969e` | 2.81 | `#575757` | **6.92** |
| column-settings :: evnto light | hiddenLabel | `#96969e` | 2.81 | `#575757` | **6.92** |
| file-manager :: evnto light | th | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: evnto light | thPlain | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: evnto light | sizeCell | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: evnto light | dateCell | `#a0a0a5` | 2.6 | `#585858` | **7.11** |
| file-manager :: evnto light | sizeCellSelected | `#a0a0a5` | 2.22 | `#585858` | **6.08** |
| file-manager :: evnto light | dateCellSelected | `#a0a0a5` | 2.22 | `#585858` | **6.08** |
| record :: evnto light | summaryLabelDefault | `#96969e` | 2.73 | `#555555` | **6.93** |
| record :: evnto light | summaryLabelMetrics | `#96969e` | 2.72 | `#555555` | **6.9** |
| record :: evnto light | summaryHelper | `#a0a0a5` | 2.42 | `#555555` | **6.93** |
| record :: evnto light | fieldLabel | `#96969e` | 2.94 | `#575757` | **7.23** |
| record :: evnto light | metaLabel | `#9a9aa2` | 2.68 | `#575757` | **6.92** |
| record :: evnto light | metaText | `#96969e` | 2.81 | `#575757` | **6.92** |

## Test / gate output

- `vitest run --project integration` on the three causality files: **23/23 green**
  (ColumnSettings 5, PatternFileManager 11, Record 7).
- The three family folders: **180/180 green** (18 files).
- The record + file-manager deriver contract batteries: **15/15 green**, including
  record's "states every declared channel at the single resting value the skin
  reads it with".
- `tsc --noEmit`: clean.
- `root-catalog:check`, `root-exposure:check`, `csssource:check`,
  `ds-prefix:check`: PASS.
- `engine-audit:check`, `theme-parity:check`: FAIL, **byte-identical at HEAD**
  (A/B'd in a `/tmp` worktree at `3b54a1818`) — not this packet's.
- `cascade-ratchet:check`: FAIL at HEAD too, and the A/B isolates my delta:
  `debt` 2116 and `transitivelyUnwired` 2121 are IDENTICAL before and after;
  only the denominator moves 5819 → 5823. The four new channels add to the
  denominator and ZERO to the debt: every one is wired to a produced root.
- `ds:derive:check`: FAIL on dist build-freshness (dist was already stale from
  other writers). Not rebuilt — dist is disposable output outside this write set.

## Captures

`before/` and `after/`, 12 PNGs each: `{column-settings,file-manager,record}--{bithire-light,evnto-light,bithire-dark,rottay-dark}.png`,
captured through the same compile door at deviceScaleFactor 2.

**Sighted verdict: PASS.** Hierarchy preserved in all twelve pairs. In
`record--bithire-light` the labels/helper/meta become readable grey while
`Active`, `$1.2M`, `42`, `Ada Lovelace`, `REC-1` stay full black and lead. In
`file-manager--bithire-light` the Name/Size/Modified headers and the size/date
cells lift off the page while the file names still dominate. In
`column-settings--bithire-light` the hidden `Owner` row and the `2 / 3 visible`
counter become legible while visible rows stay black — the visible/hidden state
cue survives. No primary text was washed out anywhere; the dark scopes read
cleanly with no muddied text. The two routed defects are visible in the
captures: the white search box in `column-settings--rottay-dark` (arm 1) and the
white "Workspace" crumb pill in `file-manager--rottay-dark` (arm 2).

## Reproducing

`instrument/` holds the three throwaway probes (axe dump with fg/bg/ratio, the
canvas-based ratio reader, the capture harness). They were run from
`packages/core/tests/integration/zz-axe-probe/` and removed from the source tree
afterwards; copy them back there and run
`PROBE_TAG=<tag> pnpm exec vitest run --project integration tests/integration/zz-axe-probe/`.
Their output paths point at `packages/core/evidence/fam-contrast-drain/`, so a
re-run lands beside this file.

Note for anyone re-measuring: the ratio reader resolves colours through a 1x1
canvas rather than by regex over the computed string — Chromium serialises
`color-mix()` results as `color(srgb 0.96 0.96 0.96 / 0.88)`, and a
`[\d.]+` regex reads those fractions as 0–255 bytes and reports a near-black
ground for a near-white one.
