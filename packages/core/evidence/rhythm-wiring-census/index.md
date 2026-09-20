# Rhythm-axis wiring census

- Measured: 2026-09-20
- Tree: `main` @ `e1a939f68`. This lot authored no source change, so every
  reading below is HEAD's own paint. The working tree also carried another
  writer's uncommitted edits (slider, activity-x4, header-hero-shared,
  collection-workspace-render-dispatch, the tag deriver, navigation); none of
  them changes a `padding`, `margin`, `gap`, `--ds-spacing-*`,
  `--ds-rhythm-effective-scale` or `--ds-density-effective-scale` declaration
  — verified with `git diff -U0` over the whole tree — so they do not reach
  this axis.
- Instrument: the `axis-difference` probe's own bundle, compiler door and mount
  law, read back in Chromium. No new denominator, no new mount, no new scene.

The lot was dispatched against a 58-family rhythm residual with the thesis that
its literal sites "wire to the rhythm/spacing vocabulary where an honest rung
exists, byte-equal at rest in ALL THREE verticals". This file is the
enumeration of that thesis. **The thesis does not survive it, and it does not
survive for a sharper reason than shape's did**: on this axis a byte-equal wire
is not merely absent, it is a contradiction in terms.

It is evidence, not a gate. Nothing reads it and nothing fails when it goes
stale; re-measure before quoting it.

## Method

Four readings, all in the browser, all on the CSS `axis-difference` itself
hands the page (`resolveBundle`, mode `fresh`), with the two arms applied
exactly as the probe applies them (inline on `documentElement`, because a
second `:root` block loses to the tenant artifact on specificity):

- **channel rests and arm movement** — every `--ds-*` channel in the bundle
  whose name carries rhythm vocabulary, probed as `padding-top: var(<name>)` on
  a bare node, at rest and under each arm of the probe's own `rhythm` scenario.
- **site reach** — for each residual family, the probe's own mounted anatomy
  (`familyElements` + `familyAxisParts`), read for the rhythm longhands at rest
  and under both arms, per vertical.
- **as-mounted vs as-rendered** — the same root, measured twice: once as
  `familyElement` builds it, once carrying the attributes the family's own
  rhythm-declaring rules require.
- **named traps** — `tree`'s legacy bridge A/B'd by removing its declaration
  from the bundle text, `kbd` at `[data-size='']` against `[data-size='md']`.

## 1. bithire's resting theme IS arm A of the rhythm pair

This is the whole finding, and it is not a coincidence of today's values.

| row | bithire | evnto | rottay | the probe's rhythm arms |
| --- | --- | --- | --- | --- |
| `density.mode` | **`compact`** | `normal` | `normal` | A `compact` -> B `spacious` |
| `spacing.rhythm` | **`tight`** | `normal` | `normal` | A `tight` -> B `airy` |

`packages/core/src/foundation/presets/verticals/bithire/document/index.json`
sets both rows to arm A's values, byte for byte. Measured at rest:

| channel | bithire | evnto | rottay |
| --- | --- | --- | --- |
| `--ds-rhythm-scale` | **0.85** | 1 | 1 |
| `--ds-density-mode-factor` | **0.85** | 1 | 1 |
| root `font-size` (the fluid root) | **14.1px** | 15px | 15px |

So "byte-equal at rest in all three verticals" and "moves on the rhythm dial"
are **mutually exclusive by construction**: a channel that responds to
`density.mode` / `spacing.rhythm` must read differently in a vertical that
already sets those rows to a non-default point, and a flat literal is
vertical-constant by definition. Shape's empty solution set came from bithire
happening to run `radius-scale: 0.8`; rhythm's comes from the axis's own two
decision rows being part of bithire's identity.

## 2. The byte-equal dial wire has an empty solution set

Every `--ds-*` rhythm-named channel reachable in the bundle, probed as a length:

| reading | count |
| --- | --- |
| rhythm-named channels reachable | 1172 |
| of which resolve to a non-zero length at rest in all three | 869 |
| of those, MOVE between the two rhythm arms | **558** |
| of those, flat on this axis | 311 |

| | vertical-varying at rest | vertical-constant at rest |
| --- | --- | --- |
| the 558 rhythm-moving channels | **558** | **0** |
| the 311 flat channels | 164 | 147 |

The bithire/evnto resting ratio of the 558 movers, which is what a wire would
have to match:

| ratio | channels | what it is |
| --- | --- | --- |
| 0.7990 | 444 | rem root (0.94) x density factor (0.85) |
| 0.6792 / 0.6791 | 109 | doubly scaled — density x rhythm |
| 0.8500 | 4 | dial only, px-authored |
| 0.9541 | 1 | `--ds-app-shell-navigation-body-scroll-padding-block-end` |
| **1.0000** | **0** | — what a flat literal would need |
| **0.9400** | **0** | — what a bare rem literal would need |

And the ratio of the 132 resting rhythm declarations the residual actually
paints, which is the other side of the same join:

| site ratio | declarations | what a byte-equal wire needs |
| --- | --- | --- |
| 1.0000 | 114 | a mover at 1.0000 — **0 exist** |
| 0.9400 | 15 | a mover at 0.9400 — **0 exist** |
| 0.7990 | 3 | already dial-scaled, already moving (§4) |

114 + 15 + 3 = 132, the whole painted population. **WIREABLE-BYTE-EQUAL: 0.**

## 3. Nine of the residual are the mount law, not the fleet

These families are ALREADY dial-wired. They read as non-movers because
`familyElement` drops attributes that vary in value across a skin's candidate
heads, so the probe mounts a node the component never renders. Measured as the
same root twice, at rest and under both arms:

| family | attribute the mount drops | as mounted | as rendered |
| --- | --- | --- | --- |
| `record` | `data-structure='record'` | flat 18px | **moves, all 3** (15.3 -> 20.7) |
| `button` | `data-variant` | no rhythm paint | **moves, all 3** (5.58 -> 7.55) |
| `kbd` | `data-size` (mounts `''`) | no rhythm paint | **moves, all 3** (4.78 -> 6.47) |
| `textarea` | `data-size` | no rhythm paint | **moves, all 3** (6.38 -> 8.63) |
| `action-dock` | `data-placement`, `data-mode` | no rhythm paint | **moves, all 3** (9.56 -> 12.94) |
| `anchor` | `data-direction` | no rhythm paint | **moves, all 3** |
| `grid-view` | `data-empty` | flat | **moves, all 3** |
| `tag-compounds` | `data-gap` | no rhythm paint | **moves, all 3** |
| `detail` | `data-state='error'` | no rhythm paint | **moves, all 3** |

`record` is the clearest: its skin declares the family's private density factor
on `.ds-structure.ds-record[data-structure='record']`, and
`summary-strip/index.tsx` stamps exactly that attribute — but `data-structure`
is not common to every candidate head, so the mounted root loses it and
`--_ds-record-density` falls back to `1`. The comment above that declaration
("every root stamps both scope classes + data-structure, so a single
declaration covers the family") is correct about production and invisible to
the probe.

`flex` and `grid` belong to the same class and already use the exact
`calc(x * var(--ds-rhythm-effective-scale, 1))` idiom this lot was told to
introduce — behind `[data-gap-preset]`, which the mount does not produce.

## 4. Two are the instrument's part-axis scoping

Both paint a rhythm value that MOVES on the dial, on a node the probe mounts
and reads, and neither is credited:

- **`tree-select`** — `margin-inline-start: var(--ds-tree-select-clear-gap)` on
  `[data-part='arrow-icon']`, measured 18.75px -> 21.56px between the arms in
  all three verticals. Its declaring rule's head is
  `[data-part='root']:has([data-part='clear-button'])`, which the part-admission
  law refuses, so the part is admitted from the *other* rule that targets the
  same selector (a `transition`) and carries `axes: ['motion']` only. The scene
  satisfies the `:has()` — the paint is real and the probe will not read it for
  rhythm.
- **`qrcode`** — a moving `row-gap`/`column-gap` on an intermediate chain node
  that carries no `data-axis-part` at all, so no axis reads it.

Neither is a wiring defect. Both belong to the instrument lane.

## 5. `tree`'s legacy bridge — the bug is real, the repair is not this lot's

`presentation/components/tree/index.css:28` declares
`--ds-tree-node-padding: 4px 8px` at `:root`. The Modern skin's row rule reads
it as the FIRST var in a governed chain, so the dial-bearing fallback never
paints. A/B'd by deleting that declaration from the bundle text:

| vertical | bridge present (today) | bridge removed | verdict |
| --- | --- | --- | --- |
| evnto | 4px / 8px, flat | 4px / 8px, **moves** (3.4 -> 4.6) | byte-equal |
| rottay | 4px / 8px, flat | 4px / 8px, **moves** (3.4 -> 4.6) | byte-equal |
| bithire | 4px / 8px, flat | **3.4px / 6.8px**, moves | **repaints x0.85** |

The bithire delta is not a side effect — it is bithire's own `density.mode:
compact` finally reaching tree rows, which is precisely what the bridge
suppresses. But the repair is larger than a skin edit and larger than this
write set:

1. `--ds-tree-node-padding` has three consumers, not one: the Modern skin row,
   the Modern theme bridge (`[data-engine='modern'] .rottay-tree
   .rottay-tree-node`), and **the Classic theme** (`html[data-tenant] .ant-tree
   .ant-tree-treenode`). Deleting the declaration leaves the latter two with an
   unresolvable `var()` — `padding` becomes invalid at computed-value time and
   drops to `0`. Classic is frozen; breaking it is not an option and neither is
   working inside it.
2. The family already has TWO disagreeing node-padding authorities. The row
   part resolves the bridge (`4px 8px`); the `.rottay-tree-node` compound
   resolves the deriver's `--ds-tree-node-padding-block/-inline`, which the
   compiler emits as `var(--ds-spacing-1)` / `var(--ds-spacing-2)` — 3.75px /
   7.5px in evnto. Whichever authority wins, some resting paint moves.

That is an owner decision on which authority is canonical and whether Classic
moves with it, not a mechanical wire. **Reported, not landed.**

## 6. A landed claim that does not hold in bithire

`7dd43cd12` ("data-table's thirteen rootless channels wire to the governed
vocabulary") states "every wire is byte-equal at rest". Its rhythm wires take
the form `calc(<rem literal> * var(--ds-rhythm-effective-scale, 1))`. Measured
here, back to back on one page:

| | bithire | evnto | rottay |
| --- | --- | --- | --- |
| pre-lot `0.375rem` | 5.2875px | 5.625px | 5.625px |
| post-lot wire | **4.49438px** | 5.625px | 5.625px |

Byte-equal in evnto and rottay; a **-15% repaint in bithire**, shipped under a
byte-equal claim. Six channels carry the idiom in that deriver
(`mobile-actions-padding-block`, `mobile-bulk-padding`,
`mobile-pagination-padding`, `mobile-summary-padding-block`,
`mobile-summary-padding-inline`, and the skin's `swipe-actions-bar`). This is
outside the rhythm cluster and outside this write set — named here because the
census is what makes it visible, and because the same idiom was prescribed to
this lot.

## 7. Per-family resting reach

Ratios are bithire/evnto of the resting value. `1.0000` is a flat literal,
`0.9400` a bare rem under the fluid root, `0.7990` a value already on the dial.

| family | resting rhythm sites | flat (ratio 1.0000) | bare rem (0.9400) | dial-scaled (0.7990) | moving | first site b/e/r |
| --- | --- | --- | --- | --- | --- | --- |
| `action-dock` | 0 | 0 | 0 | 0 | 0 | — |
| `activity-cards` | 14 | 14 | 0 | 0 | 0 | 16px / 16px / 16px |
| `activity-compact` | 14 | 14 | 0 | 0 | 0 | 16px / 16px / 16px |
| `activity-ticker` | 15 | 15 | 0 | 0 | 0 | 16px / 16px / 16px |
| `activity-timeline` | 14 | 14 | 0 | 0 | 0 | 16px / 16px / 16px |
| `anchor` | 0 | 0 | 0 | 0 | 0 | — |
| `auto-complete` | 0 | 0 | 0 | 0 | 0 | — |
| `avatar-compounds` | 2 | 0 | 2 | 0 | 0 | -7.05px / -7.5px / -7.5px |
| `back-top` | 0 | 0 | 0 | 0 | 0 | — |
| `bottom-tab-bar` | 0 | 0 | 0 | 0 | 0 | — |
| `button` | 0 | 0 | 0 | 0 | 0 | — |
| `carousel` | 2 | 0 | 2 | 0 | 0 | 3.525px / 3.75px / 3.75px |
| `data-terminal-card` | 8 | 8 | 0 | 0 | 0 | 5px / 5px / 5px |
| `descriptions` | 5 | 0 | 5 | 0 | 0 | 10.575px / 11.25px / 11.25px |
| `detail` | 0 | 0 | 0 | 0 | 0 | — |
| `feature-workspace-frame` | 0 | 0 | 0 | 0 | 0 | — |
| `field-filters-panel` | 21 | 21 | 0 | 0 | 0 | 12px / 12px / 12px |
| `flex` | 0 | 0 | 0 | 0 | 0 | — |
| `grid` | 0 | 0 | 0 | 0 | 0 | — |
| `grid-view` | 4 | 4 | 0 | 0 | 0 | 2px / 2px / 2px |
| `header-hero-shared` | 4 | 4 | 0 | 0 | 0 | 8px / 8px / 8px |
| `image` | 4 | 0 | 4 | 0 | 0 | 5.2875px / 5.625px / 5.625px |
| `kbd` | 0 | 0 | 0 | 0 | 0 | — |
| `password-input` | 2 | 0 | 2 | 0 | 0 | 7.05px / 7.5px / 7.5px |
| `qrcode` | 8 | 6 | 0 | 2 | 2 | 5.9925px / 7.5px / 7.5px |
| `record` | 6 | 6 | 0 | 0 | 0 | 18px / 18px / 18px |
| `saved-views-menu` | 0 | 0 | 0 | 0 | 0 | — |
| `tag-compounds` | 0 | 0 | 0 | 0 | 0 | — |
| `terminal-block` | 0 | 0 | 0 | 0 | 0 | — |
| `textarea` | 0 | 0 | 0 | 0 | 0 | — |
| `tree` | 8 | 8 | 0 | 0 | 0 | 4px / 4px / 4px |
| `tree-select` | 1 | 0 | 0 | 1 | 1 | 14.9813px / 18.75px / 18.75px |
| `tree-view-connector` | 0 | 0 | 0 | 0 | 0 | — |
| `typography` | 0 | 0 | 0 | 0 | 0 | — |
| `voice-input-button` | 0 | 0 | 0 | 0 | 0 | — |
TOTALS sites 132 flat 114 rem 15 scaled 3 moving 3

Totals: **132** resting rhythm declarations — 114 flat, 15 bare rem, 3 already
dial-scaled (and already moving). Families showing `0` sites paint no rhythm on
the node the probe mounts; §3 and §4 say which of those are the mount law.

## 8. Disposition

| disposition | families | n |
| --- | --- | --- |
| instrument — mount law drops a stamped attribute (§3) | `action-dock`, `anchor`, `button`, `detail`, `grid-view`, `kbd`, `record`, `tag-compounds`, `textarea` | 9 |
| instrument — part-axis scoping (§4) | `qrcode`, `tree-select` | 2 |
| instrument — reaching rule needs a descendant compound the probe does not mount | `auto-complete`, `bottom-tab-bar`, `feature-workspace-frame`, `flex`, `grid`, `saved-views-menu`, `terminal-block` | 7 |
| G1-blocked — flat literal, no byte-equal mover exists (§2) | `activity-cards`, `activity-compact`, `activity-ticker`, `activity-timeline`, `data-terminal-card`, `field-filters-panel`, `header-hero-shared` | 7 |
| G1-blocked — bare rem, no byte-equal mover exists (§2) | `avatar-compounds`, `carousel`, `descriptions`, `image`, `password-input` | 5 |
| repair escalated to owner (§5) | `tree` | 1 |
| no rhythm paint at all — (c) review | `back-top`, `tree-view-connector`, `typography`, `voice-input-button` | 4 |

Sum: 35, the families this lot was pointed at. **WIRED: 0** — not for want of
candidates but because §2's join is empty.
