# Shape-axis chrome-compiler census

- Measured: 2026-09-20
- Tree: the shape chrome-compiler lot, uncommitted, over `main` @ `4230af401`
- Instrument: the `axis-difference` probe's own bundle and its own mount law,
  read back in Chromium. No new denominator, no new mount.

The lot was dispatched against a 69-family shape residual with the thesis that
"the chrome compiler emits the family's radius/shape channel as a FLAT value
instead of the `--ds-radius-*` dial product, so `shape.radius-scale` never
reaches it". This file is the enumeration of that thesis. The thesis does not
survive it: the chrome compiler already emits the dial product almost
everywhere, and where it does not, the byte-equal wire the lot was told to make
has an **empty solution set** — provably, not incidentally.

It is evidence, not a gate. Nothing reads it and nothing fails when it goes
stale; re-measure before quoting it.

## Method

Three readings, all in the browser, all on the CSS `axis-difference` itself
hands the page (`resolveBundle`, mode `fresh`):

- **rung rests** — every `--ds-radius-*` rung probed as `border-radius:
  var(<rung>)` on a bare node, per vertical.
- **channel rests and arm movement** — all 400 `--ds-*radius*` / `--ds-*corner*`
  channels probed the same way, at rest and under each arm of the probe's own
  `shape` scenario (`radius-scale` 0.8 -> 1.15, `button-style` sharp -> pill,
  `control-height` compact -> tall), applied exactly as the probe applies it
  (inline on `documentElement`, because a second `:root` block loses to the
  tenant artifact's `:is(html[data-tenant=…])` on specificity).
- **site reach** — for each residual family, the radius declarations of its own
  Modern skin, projected onto the probe's mounted nodes with the probe's own
  `projectPartChain` / `partCompound`, plus the root-match check the probe gets
  for free by building the node.

## 1. The radius ramp is only four rungs wide

| rung | rottay | bithire | evnto | on the dial |
| --- | --- | --- | --- | --- |
| `--ds-radius-none` | 0px | 0px | 0px | no |
| `--ds-radius-xs` | 3px | 3px | 3px | no |
| `--ds-radius-sm` | 6px | **4.8px** | 6px | yes |
| `--ds-radius-md` | 8px | **6.4px** | 8px | yes |
| `--ds-radius-lg` | 12px | **9.6px** | 12px | yes |
| `--ds-radius-xl` | 16px | **12.8px** | 16px | yes |
| `--ds-radius-2xl` | 20px | 20px | 20px | no |
| `--ds-radius-3xl` | 24px | 24px | 24px | no |
| `--ds-radius-full` | 9999px | 9999px | 9999px | no |

bithire runs `--ds-radius-scale: 0.8`. The control ramp is separate and tighter:
`--ds-radius-button` and `--ds-button-{xs..xl}-radius` rest at 8px / **2px** / 8px.

## 2. The compiler is not the gap

| reading | count |
| --- | --- |
| `--ds-*radius*` / `--ds-*corner*` channels reachable in the bundle | 400 |
| of which MOVE between the two shape arms | **231** |
| of which do not (flat on this axis) | 169 |

## 3. The byte-equal dial wire has an empty solution set

The lot's rule 1 is "where the flat value EQUALS the dial rung's resting value,
emit the dial product, byte-equal at rest in ALL THREE verticals". Measured over
the whole fleet, not just the residual:

| reading | count |
| --- | --- |
| flat channels byte-equal at rest to a shape-MOVING channel in all three verticals | **0** |
| flat channels byte-equal at rest to a DIAL rung in all three verticals | **0** |

And the reason is mechanical rather than a coincidence of today's values:

| | vertical-varying at rest | vertical-constant at rest |
| --- | --- | --- |
| the 231 shape-moving channels | **231** | 0 |
| the 169 flat channels | 9 | 160 |

Every channel the shape axis moves is vertical-dependent at rest, because the
dial itself is (bithire scales it by 0.8). A flat value is vertical-constant by
definition. A constant cannot be byte-equal to a triple that is not constant, so
**no byte-equal dial wire exists for as long as any vertical runs a radius scale
other than 1** — and none can be manufactured without declaring a paint change
on bithire. That is a stronger statement than the depth lot's "exactly ONE
byte-equal wire": here it is zero, and it is zero by construction.

The nine flat channels that DO vary per vertical are not candidates either — see
§6.

## 4. What the 69 residual families actually are

The residual set is re-derived here rather than quoted: the dispatch's source
(`.tmp/dispatch-2026-09-17/fleet-axis-analysis.md`) is not in the tree. A full
`axis-difference --json --no-write` at `4230af401` reads shape at **136 / 205 =
66.3 %**, identical in all six cells, so the residual is the 69 families in
`effectiveFamilies.shape` and not in `movedIds`. The dispatch's bucket split
(21 flat-channel / 11 literal / 6 prop-gated = 38 of 69) does not reconcile with
today's tree; the split below is what the same instrument measures now, and it
accounts for all 69.

Reached sites are the radius declarations that paint a node the probe mounts,
at rest. `rung` is the rung byte-equal to that site in all three verticals.

| family | why it does not move | resting sites | first site r / b / e | rung |
| --- | --- | --- | --- | --- |
| `anchor` | prop-gated | 0 | — / — / — | — |
| `aspect-ratio` | non-dial-rung-only | 1 | 0px / 0px / 0px | none |
| `assistant` | unreached:head-not-the-family-root | 0 | — / — / — | — |
| `avatar` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `avatar-compounds` | prop-gated | 0 | — / — / — | — |
| `back-top` | literal-no-rung | 1 | 50% / 50% / 50% | - |
| `badge` | non-dial-rung-only | 6 | 9999px / 9999px / 9999px | full |
| `bottom-tab-bar` | prop-gated | 0 | — / — / — | — |
| `box` | prop-gated | 0 | — / — / — | — |
| `button` | non-dial-rung-only | 1 | 0px / 0px / 0px | none |
| `button-icon` | unreached: | 0 | — / — / — | — |
| `carousel` | non-dial-rung-only | 2 | 0px / 0px / 0px | none |
| `chart-area` | literal-no-rung | 2 | 2px / 2px / 2px | - |
| `chart-bar` | literal-no-rung | 2 | 2px / 2px / 2px | - |
| `chart-bullet` | prop-gated | 0 | — / — / — | — |
| `chart-c` | unreached:head-not-the-family-root | 0 | — / — / — | — |
| `chart-calendar-heatmap` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `chart-foundation` | prop-gated | 0 | — / — / — | — |
| `chart-heatmap` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `chart-line` | literal-no-rung | 2 | 999px / 999px / 999px | - |
| `chart-pie` | literal-no-rung | 1 | 50% / 50% / 50% | - |
| `chart-radar` | literal-no-rung | 1 | 1px / 1px / 1px | - |
| `chart-treemap` | literal-no-rung | 1 | 2px / 2px / 2px | - |
| `chart-waterfall` | literal-no-rung | 1 | 2px / 2px / 2px | - |
| `collapse` | moves-but-overridden | 2 | 12px / 9.6px / 12px | lg |
| `collection-shell` | prop-gated | 0 | — / — / — | — |
| `column-menu` | prop-gated | 0 | — / — / — | — |
| `container` | non-dial-rung-only | 1 | 0px / 0px / 0px | none |
| `data-table-interactions` | state-gated-only | 0 | — / — / — | — |
| `data-terminal-card` | literal-no-rung | 3 | 50% / 50% / 50% | - |
| `drawer-compounds` | prop-gated | 0 | — / — / — | — |
| `dropdown` | prop-gated | 0 | — / — / — | — |
| `edit-fields` | prop-gated | 0 | — / — / — | — |
| `edit-header` | literal-no-rung | 4 | 20px / 20px / 20px | 2xl |
| `feature-workspace-frame` | prop-gated | 0 | — / — / — | — |
| `filter-panel` | prop-gated | 0 | — / — / — | — |
| `float-button` | prop-gated | 0 | — / — / — | — |
| `form` | prop-gated | 0 | — / — / — | — |
| `form-field` | unreached: | 0 | — / — / — | — |
| `form-header` | literal-no-rung | 2 | 20px / 20px / 20px | 2xl |
| `header-hero-shared` | literal-no-rung | 1 | 14px / 14px / 14px | - |
| `image` | non-dial-rung-only | 2 | 0px / 0px / 0px | none |
| `image-compounds` | prop-gated | 0 | — / — / — | — |
| `layout` | prop-gated | 0 | — / — / — | — |
| `list` | prop-gated | 0 | — / — / — | — |
| `loading-overlay` | non-dial-rung-only | 1 | 0px / 0px / 0px | none |
| `modal-compounds` | prop-gated | 0 | — / — / — | — |
| `overlay-modal-compounds` | prop-gated | 0 | — / — / — | — |
| `presence` | literal-no-rung | 1 | 50% / 50% / 50% | - |
| `progress` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `progress-compounds` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `result` | literal-no-rung | 1 | 50% / 50% / 50% | - |
| `scope-switcher` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `scroll-area` | state-gated-only | 0 | — / — / — | — |
| `search-command-bar` | prop-gated | 0 | — / — / — | — |
| `skeleton` | non-dial-rung-only | 1 | 0px / 0px / 0px | none |
| `spinner` | literal-no-rung | 1 | 50% / 50% / 50% | - |
| `splitter` | unreached:pseudo-element | 0 | — / — / — | — |
| `status-filter-pills` | non-dial-rung-only | 1 | 9999px / 9999px / 9999px | full |
| `stepper-compounds` | prop-gated | 0 | — / — / — | — |
| `table-toolbar` | literal-no-rung | 1 | 1px / 1px / 1px | - |
| `tag` | non-dial-rung-only | 2 | 9999px / 9999px / 9999px | full |
| `terminal-block` | non-dial-rung-only | 1 | 0px / 0px / 0px | none |
| `timeline` | prop-gated | 0 | — / — / — | — |
| `tooltip` | prop-gated | 0 | — / — / — | — |
| `typography` | prop-gated | 0 | — / — / — | — |
| `virtual-list` | state-gated-only | 0 | — / — / — | — |
| `visual-excellence-preview` | non-dial-rung-only | 2 | 20px / 20px / 20px | 2xl |
| `voice-input-button` | literal-no-rung | 1 | 999px / 999px / 999px | - |

### The buckets, and what each one costs

| bucket | families | what it is |
| --- | --- | --- |
| `prop-gated` | 25 | the radius lives on a rule gated by a variant attribute or a sibling root class the default render does not produce. **Already dial-wired in almost every case** — `var(--ds-radius-sm/md/lg)` behind `[data-radius='sm']`, `[data-continuity='seamless']`, `.ds-dropdown-surface`, `.ds-tooltip-bubble`. These move the instant the instrument mounts the variant; de-gating them here would measure a configuration the component does not render. |
| `non-dial-rung-only` | 18 | the site resolves byte-equal to `none`, `full` or `2xl` — a square corner, a pill or a named surface corner. None of the three is on the dial (§1), so these are dial-deaf **by design**, not by omission. |
| `literal-no-rung` | 17 | a bare literal matching no rung in any vertical: `50%`, `999px`, `1px`, `2px`, `10px`, `14px`, `2px 2px 0 0`. Circles and markers. |
| `state-gated-only` | 3 | every reaching site is `[data-state~='focus-visible']`; the shape pair is measured at rest, where no state is stamped. All three are already dial-wired. |
| `moves-but-overridden` | 1 | `collapse` — see §5. |
| `unreached` | 5 | the instrument's own boundary: `assistant` and `chart-c` paint on a root of their own (`head-not-the-family-root`), `splitter` on `::after`, and `button-icon` / `form-field` paint no radius at all — all five are in §5. |

Sum: 69. **`WIREABLE-DIAL`: 0.**

## 5. Four findings that are the instrument, not the fleet

These read as shape non-movers while the component a tenant actually renders
moves. They are named rather than fixed: each would need the probe's mount law
changed, which is not this lot's write set.

**`button`.** The base rule that paints the control corner is
`.ds-button.ds-button--modern[data-variant]` — gated on the *presence* of
`data-variant`. `familyElement` keeps only `data-part` and attributes common to
every candidate head, so `data-variant` is dropped and the mounted root becomes
`.ds-button.ds-button--modern.press`, which the base rule cannot match. The
button's own radius (`--_ds-button-resolved-radius` -> `--ds-button-md-radius`)
is fully dial-wired and rests at 8px / 2px / 8px; the probe reads only the icon
plate's `0px`.

**`collapse`.** `familyElement` scores
`.rottay-collapse.rottay-collapse--ghost[data-part='root']` (two classes + one
attribute) above `.rottay-collapse[data-part='root']`, so the probe mounts the
GHOST variant. The default panel reads
`--ds-collapse-root-default-idle-border-radius` and rests 12px / 9.6px / 12px —
a mover — but the ghost rule that out-specifies it deliberately rests at `0`.
The family is a non-mover only because the instrument picked the one variant
whose corner is square.

**`data-table-interactions`, `scroll-area`, `virtual-list`.** Their only
reaching radius sites are `[data-state~='focus-visible']` focus rings, all three
already dial-wired (`--ds-radius-md`, `--ds-radius-sm`). The shape positive pair
is read at rest; the states stamp belongs to the states axis.

**`button-icon` and `form-field`.** Neither skin contains the string `radius`.
They are in shape's denominator through `byHeadChannel`, because they read
`--ds-control-height-scale` — the `shape.control-height` control. The probe's
`differsOnAxis('shape', …)` compares only the computed `border-radius` corners,
so a family whose entire shape consumption is control HEIGHT is in a denominator
measured on a property it does not paint. Two families of the 205 are
structurally unmeasurable on this axis.

## 6. The nine rem-based radii answer to typography, not to shape

`--ds-tag-radius-{sm,md,lg}`, `--ds-tag-default-radius` and
`--ds-badge-radius-{sm,md,lg}` are authored as `0.125rem` / `0.25rem` /
`0.5rem`. Measured under both axes, per vertical:

| channel | rest (rottay) | `typography.scale` arms | `shape.radius-scale` arms |
| --- | --- | --- | --- |
| `--ds-tag-radius-md` | 3.75px | 3.5625px -> 3.9375px | 3.75px -> 3.75px |
| `--ds-tag-radius-lg` | 7.5px | 7.125px -> 7.875px | 7.5px -> 7.5px |
| `--ds-radius-md` (the dial, for contrast) | 8px | 8px -> 8px | 6.4px -> 9.2px |

A corner radius riding the root font size is the clearest instance in the fleet
of the defect this lot was dispatched against: the shape dial cannot reach it and
the type dial can. It is **not** byte-equal wireable — 3.75px is not
`--ds-radius-xs` (3px) and 7.5px is not `--ds-radius-sm` (6px) — so repointing
these at the ramp is a declared paint change in all three verticals and needs an
owner decision, not a wiring lot. They also sit off the residual families'
measured nodes (`badge` and `tag` both mount on pill parts), so fixing them would
not move the 69 either.

## 7. What the lot changed

Two sites, both byte-equal in all three verticals, both continuing the precedent
of `1cd0e6245` exactly (`9999px` -> `var(--ds-radius-full)`):

| file | selector | before | after |
| --- | --- | --- | --- |
| `runtime/engines/modern/skin/environment-toggle/index.css` | `[data-part='badge']` | `9999px` | `var(--ds-radius-full)` |
| `runtime/engines/modern/skin/live-feed/index.css` | `[data-part='badge']` | `9999px` | `var(--ds-radius-full)` |

That takes the fleet's bare-`9999px` `border-radius` literal count from 2 to
**0**. Neither family is in the residual 69 — both already move on shape — so
the wire buys vocabulary, not a percentage, and the census says so rather than
claiming otherwise.

**One repair outside the thesis, inside the write set.** The depth skin lot
(`7ef3c96b7`) moved `command-palette`'s search and footer keylines onto
`var(--ds-edge-hairline-width, 1px)` in the skin but left `PALETTE_RULE` in
`derivation/chrome/command-palette/index.ts` at the bare `1px solid …`, so the
deriver and the skin disagreed and that suite has been red since. The deriver
and its pinned expectation now state the skin's chain. `--ds-edge-hairline-width`
rests at 1px in all three verticals, so the painted keyline is byte-equal; only
the emitted text changes, and the artifacts were regenerated for it.

## 8. What the lot deliberately did NOT change

**The 65 bare `0` literals.** `0` is byte-equal to `--ds-radius-none` in all
three verticals, so it clears the lot's own bar. It was left alone: `none` is
itself the literal `0` and is not on the dial, so the sweep would touch 65 sites
across ~30 files, move no paint, move no axis, and add a resolution hop to every
square corner in the fleet. It is a vocabulary sweep available to a later lot,
not a shape-residual move. Reversing this call is the owner's.

**The 37 `999px` and 69 `50%` pill/circle literals.** `999px` is not byte-equal
to `--ds-radius-full` (9999px) and `50%` matches no rung. Wiring either is a
declared paint change with zero axis gain.

**The 25 prop-gated families.** Named in §4 with their gates; not de-gated.

## 9. The honest conclusion

Shape's residual is not a chrome-compiler wiring gap. The compiler emits the dial
product for 231 of 400 radius channels, and for the remaining 169 no byte-equal
dial wire exists — provably, because every moving channel is vertical-dependent
at rest and every flat one is not. The 69 decompose into 25 already-dial-wired
families the instrument cannot mount at their gate, 35 that are pills, circles
and square corners the dial is not meant to reach, 9 instrument-boundary cases,
and 0 families waiting on a wire.

The next shape lot is therefore an INSTRUMENT lot, not a wiring lot: the
prop-gated mount (25 families, all already wired), the `button` presence-gate and
the `collapse` root-variant choice (2 flagship families) are where the residual
actually lives. The one authoring defect worth an owner decision is §6.

## 10. Validation

**axis-difference, same instrument, one tree, back to back** over the touched
families plus the shape lot's own precedent set
(`--families=environment-toggle,live-feed,badge,tag,collapse,button,carousel,timeline,float-button,field-filters-panel --no-write`):

| reading | before | after |
| --- | --- | --- |
| shape, each of the six cells | 3 / 10 | 3 / 10 |
| movers | `environment-toggle`, `field-filters-panel`, `live-feed` | unchanged |
| all 84 cells, compared on `(vertical, theme, scenario, axis)` | — | identical |
| `palette-only` / `states-emphasis-only` | 0 % on every evidential cell | 0 % on every evidential cell |

**A second axis-difference, the FULL fleet, HEAD vs the lot** (no `--families`).
All 84 cells — six positive axes and both negative controls, over three
verticals and two modes — are identical on `moved`, `denominator`, `percent`,
`evidential` and the full `movedIds` set:

| axis | HEAD | lot | denominator |
| --- | --- | --- | --- |
| shape | 136 | 136 | 205 |
| typography | 173 | 173 | 174 |
| rhythm | 151 | 151 | 209 |
| depth | 91 | 91 | 187 |
| states | 77 | 77 | 147 |
| motion | 154 | 154 | 195 |

`palette-only` 0 % on 36 evidential cells of 36; `states-emphasis-only` 0 % on 12
of 12. A byte-equal wire is supposed to move nothing, and it moved nothing —
which is also why this lot may not be quoted as a shape improvement.

**Suites and gates.**

| check | result |
| --- | --- |
| `environment-toggle` + `live-feed` | 9 files, 97 tests, green |
| `command-palette` family | 4 files, 63 tests, green |
| the whole `derivation/` tree | 64 files, 562 tests, green (63/64 before the §7 repair) |
| `tsc --noEmit` | clean |
| `structure:check` | `findings=0` |
| `lint:artifacts` | all three verticals up to date |
| `csssource:check`, `exports:artifact:check`, `tenant-theme-fixtures:check` | pass |

**Two gates are red, and they are red at HEAD for other reasons.** Verified by
running both in a detached worktree at `4230af401` and diffing the output —
byte-identical there:

- `csspaint:check` — `modern-theme-ownership` on `--radius-field`, and two
  retired-entrypoint findings in `tokens/data/decisions/writers/unused/system`.
- `theme-parity:check` — `declared-but-unemitted` 28 against a 23 baseline, with
  new `BrandCollapseChrome` / `BrandSidebarChrome` buckets.

Neither names a channel, file or family this lot touches.

**Mutation drill.** Both new suites were re-run with the badge repointed at
`var(--ds-radius-lg)`: both go red on the resting-corner assertion. The
`tight.dialRung !== wide.dialRung` line is the non-vacuity floor — it fails if
the arm never reached the page, so a green run cannot be a silent no-op.

**Engine scope.** Only `runtime/engines/modern/skin/**` was edited. Classic and
Rustic are untouched.
