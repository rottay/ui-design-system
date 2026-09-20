# Depth-axis derivation census

- Measured: 2026-09-20
- Tree: the depth-derivation lot, uncommitted, over `main` @ `f4777e8f9`
- Instrument: static, source-only. No probe run, no browser, no build
- Independent review of the lot this census backs:
  `docs-engineering/archive/audits/2026-09-20-depth-derivation-review-davila.md`

The lot wires six chrome derivers to `--ds-edge-hairline-width`. The question a
reader asks next is "six out of what, and why not the rest". This file is that
denominator and the reasons, written down so the numbers have a source in-tree
rather than in a session.

It is evidence, not a gate. Nothing reads it and nothing fails when it goes
stale; re-measure before quoting it.

## Method

Four source populations, all under
`packages/core/src/foundation/tokens/css/`:

- the paint: every `border*`/`box-shadow` declaration in the 124 Modern engine
  skins, `runtime/engines/modern/skin/**/index.css`, comments stripped
- the component defaults: every `--ds-*` declaration under
  `presentation/**` and `runtime/**`
- the base: `foundation/themes/default/index.css`
- the compiled per-vertical output: `facade/artifacts/{rottay,bithire,evnto}/index.css`

A cascade map is built per vertical in that precedence order, artifact last and
winning (the artifact's `:is(html[data-tenant=...], ...)` selector beats the
component `:root`). Then, for each `--ds-*` channel a skin reads on a depth
property:

- **dial-wired** = resolving the channel's value transitively through the map
  reaches `--ds-elevation-1..6` or `--ds-edge-{hairline,standard,emphasis}-width`
- **flat** = it does not: no border-style or elevation-posture decision can move
  it, whatever the tenant authors
- **byte-equal candidate** = a flat channel whose fully-resolved resting value
  is byte-identical to an edge role's resting value in all three verticals —
  i.e. a channel that can be re-pointed at the dial without repainting anything

HEAD readings come from `git archive HEAD` of the same subtree, measured with
the identical script.

## 1. The border-width pool, HEAD -> candidate

| Reading | HEAD | candidate |
| --- | --- | --- |
| Modern skin files | 124 | 124 |
| distinct `--ds-*` channels read on a border-width property | 291 | 291 |
| of which declared somewhere in the token tree | 256 | 256 |
| of which declared nowhere (the skin's inline fallback is the only value) | 35 | 35 |
| dial-wired | 45 | **51** |
| flat | 211 | **205** |

The six channels that crossed:

```
--ds-card-border-width
--ds-card-bordered-border-width        (transitive: it reads --ds-card-border-width)
--ds-collapse-root-default-idle-border-width
--ds-list-border-width
--ds-tag-border-width
--ds-tree-line-width
```

`--ds-dashboard-header-rule` is the lot's sixth *wire* and does not appear here:
the header paints in `presentation/components/skin/dashboard-header/`, not in a
Modern engine skin, so it sits outside this population. Six wires, six crossings,
different six — see the negatives.

## 2. The shadow pool (unchanged by this lot)

Same instrument, `box-shadow` instead of border width:

| Reading | HEAD = candidate |
| --- | --- |
| distinct `--ds-*` channels read on `box-shadow` | 317 |
| declared / undeclared | 292 / 25 |
| dial-wired (chain reaches an elevation rung) | 87 |
| flat | 205 |

No channel here is a byte-equal candidate, and none can be. `--ds-elevation-1..6`
in the default theme are three- and four-layer `color-mix()` chains over
`--ds-shadow-tint` and the key/ambient strength dials. No flat value in the tree
is byte-identical to one, so every elevation wire is a repaint by construction
and none was in scope for this lot.

## 3. Reachability: why most of the flat pool is not addressable at all

| Modern skin files (124) | count |
| --- | --- |
| paint at least one border width as a **bare literal**, no channel | **73** |
| channel every border width they paint | 33 |
| paint no border width | 18 |

A deriver produces channels. It cannot reach a literal. Those 73 files are not a
backlog of missing wires; they are a backlog of missing *channels*, and closing
them is a skin edit, not a derivation edit. Unchanged by this lot: 73 at HEAD,
73 in the candidate.

## 4. The byte-equal targets this lot enumerated

Eight channels rest at exactly `1px` in rottay, bithire and evnto, each via
`var(--ds-border-width-1, 1px)` or a bare `1px`. `--ds-border-width-1: 1px` is
declared exactly once — `foundation/themes/default/index.css:690` — with no
per-vertical producer, which is what makes the equality hold in all three.

Resting edge roles, measured per vertical:

| role | rottay | bithire | evnto |
| --- | --- | --- | --- |
| `--ds-edge-hairline-width` | 1px | 1px | 1px |
| `--ds-edge-standard-width` | 1px | **1.5px** | 1px |
| `--ds-edge-emphasis-width` | 1px | **2px** | 1px |

So `hairline` is the only byte-equal role. A `standard` wire would have repainted
bithire at 1.5px and an `emphasis` wire at 2px; every one of the eight is a
hairline target or nothing.

| # | channel | value at HEAD | verdict |
| --- | --- | --- | --- |
| 1 | `--ds-card-border-width` | `var(--ds-border-width-1, 1px)` | wired |
| 2 | `--ds-collapse-root-default-idle-border-width` | `var(--ds-border-width-1, 1px)` | wired |
| 3 | `--ds-dashboard-header-rule` | `var(--ds-border-width-1, 1px)` | wired |
| 4 | `--ds-list-border-width` | `var(--ds-border-width-1, 1px)` | wired |
| 5 | `--ds-tag-border-width` | `var(--ds-border-width-1, 1px)` | wired |
| 6 | `--ds-tree-line-width` | `1px` (bare literal) | wired |
| 7 | `--ds-stack-divider-size` | `var(--ds-border-width-1, 1px)` | left flat |
| 8 | `--ds-search-command-bar-divider-block-size` | `var(--ds-border-width-1, 1px)` | left flat |

Rows 7 and 8 are left because neither divider is a border: both are drawn as a
filled block sized by `block-size`, so a border-style decision has no claim on
them. Wiring them would make `surfaces.border-style` move a box's height. They
are named here so the next reader does not rediscover them as an oversight.

## 5. Per-family verdicts for the six wired

| family | channel | reads now | probe visibility |
| --- | --- | --- | --- |
| `card` | `--ds-card-border-width` | hairline | excluded from the depth denominator as unsettled |
| `collapse` | `--ds-collapse-root-default-idle-border-width` | hairline | **new depth mover** |
| `dashboard-header` | `--ds-dashboard-header-rule` | hairline | already a mover via `--ds-elevation-1`; the wire adds a border channel |
| `list` | `--ds-list-border-width` | hairline | not reached: the frame paints only under `[data-bordered='true']` |
| `tag` | `--ds-tag-border-width` | hairline | **new depth mover** |
| `tree` | `--ds-tree-line-width` | hairline | not reached: the lines paint on the `[data-axis]` connector part |

Probe visibility is the reviewer's one-tree A/B, not this static instrument.
Each family also declares `surfaces.borderStyle` in its `consumes` list and
carries a suite arm proving the causality (`none` -> 0px, `hairline` -> 1px) and
the per-vertical rest. Suites at the time of writing: 7 files, 83/83.

## 6. The queue this lot did not take

Byte-equal candidates still open in the border-width pool after the lot, each
already read by a Modern skin on a border property:

| channel | skin |
| --- | --- |
| `--ds-badge-frame-width` | badge |
| `--ds-card-footer-border-width` | card |
| `--ds-card-header-border-width` | card |
| `--ds-divider-width` | menu |
| `--ds-list-split-width` | list |
| `--ds-menu-nested-thread-size` | menu |
| `--ds-qrcode-border-width` | qrcode |

None was adjudicated by this lot. They are candidates by arithmetic only; each
still needs the question this census does not answer — is this edge a keyline a
border-style decision should govern, or is it structure.

## Honest negatives

- **This census is not the probe.** It proves a channel is wired to the dial. It
  cannot prove the wire paints, and the reviewer's A/B shows two that do not
  reach the instrument (`list`, `tree`). A wired channel behind an unmounted
  variant is real and invisible at the same time.
- **The two populations are not the same six.** Section 1 counts channel
  crossings in the Modern skin pool and section 4 counts wires. They both come
  to six for unrelated reasons: `--ds-dashboard-header-rule` is outside the
  skin pool, and `--ds-card-bordered-border-width` crossed transitively without
  being authored. Do not read the agreement as a check.
- **The session brief's headline "214 flat channels" is not reproduced.** The
  instrument of record here reads **211** flat at HEAD. The brief's number came
  from a wider, unrecorded name filter; this file supersedes it, and the figure
  to quote is 211 -> 205 with the method above.
- **Detection is property-shaped, so it has blind spots.** A divider drawn as a
  sized block (rows 7 and 8) is invisible to a `border*` scan; so is any edge
  painted through `outline`, a gradient or a pseudo-element. The 205 is a floor
  on the flat pool, not a ceiling.
- **35 channels are declared nowhere.** A skin reads them on a border width and
  only its inline fallback answers. They are counted flat here, which is true but
  understates the problem: they are not even addressable by a tenant.
- **`bare` is meaningful only on the border side.** The same literal test on
  `box-shadow` would flag every offset, so section 2 publishes no literal count.
- **Nothing enforces this.** No gate reads this file. It is a receipt.
