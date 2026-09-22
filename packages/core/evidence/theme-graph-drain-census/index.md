# Theme-graph drain census

- Measured: 2026-09-22
- Tree: the theme-graph drain lot, uncommitted, over `main` @ `7d5ccf99a`
- Instrument: the official producers only — `cascade:extract --write` then
  `ds:derive` (`scripts/generate/theme-graph/index.mjs --write`). No hand edit
  to any artifact, no second measurement
- Backs: the `SIZE_BUDGET_BYTES` re-anchor in
  `scripts/generate/theme-graph/index.mjs`, 9,437,184 -> 10,031,551 bytes

The committed graph was last written at `31d04caa0` (2026-09-19). 194 commits
landed after it, 59 of them touching the CSS census root and 28 touching the
derivation tree, so `ds:derive:check` was red on four separate grounds at once.
A size re-pin is only honest if the growth it admits is explained, so this file
is the explanation: what moved, which landed lot moved it, and — the question a
re-pin can hide — whether anything the graph dropped is still reachable from a
consumer.

It is evidence, not a gate. Nothing reads it and nothing fails when it goes
stale; re-measure before quoting it.

## The chain, and why the census had to move first

`ds:derive --write` refuses over a stale read census
(`index.mjs` main: "refusing to write a graph over a census that is not this
tree's"), and `cascade:extract --check` was itself red at `7d5ccf99a`. So the
upstream artifact `artifacts/generated/manifest/cascade/edges/index.json`
regenerates first. That is a prerequisite of the graph regeneration, not a
widening of it — the graph cannot be produced any other way.

| census (`cascade/edges`) | before | after |
| --- | ---: | ---: |
| files scanned | 484 | 494 |
| edges | 13,100 | 13,590 |
| read sites | 16,991 | 17,114 |
| literal pins | 2,104 | 2,144 |
| unadjudicated selectors | 83 | 82 |
| scope contradictions | 24 | 24 |

## Graph structure, before -> after

| node kind | before | after | added | removed |
| --- | ---: | ---: | ---: | ---: |
| decision | 29 | 29 | 0 | 0 |
| deriver | 108 | 118 | 10 | 0 |
| channel | 8,404 | 8,739 | 408 | 73 |
| consumer | 16,991 | 17,114 | 2,401 | 2,278 |
| family | 276 | 277 | 1 | 0 |

| edge kind | before | after | added | removed |
| --- | ---: | ---: | ---: | ---: |
| consumes | 557 | 683 | 126 | 0 |
| produces | 2,642 | 3,075 | 435 | 2 |
| aliases | 13,100 | 13,590 | 484 | 136 |
| reads | 28,020 | 28,594 | 4,309 | 3,756 |
| paints | 12,747 | 12,871 | 2,031 | 1,907 |
| **total** | **57,066** | **58,813** | | |

Added/removed are counted over the `(kind, from, to)` triple, which collapses
rows differing only in `via`/`keypath`/`depth`/`role`; the totals column is the
raw emitted row count. Consumer churn is churn by construction: a consumer id is
a hash of `file:line:selector:property`, so editing one declaration re-hashes
every site below it in the file. The +2,401/-2,278 is 123 net new read sites
spread across 59 CSS-touching commits, not 4,679 events.

## The ten new derivers, each attributed

`FAMILY_DERIVERS` is the registry the compiler iterates, so a new deriver is a
landed lot, never a measurement artefact. All ten come from the WO-FAM-11 shell
and chrome wave:

| deriver | landed by |
| --- | --- |
| `app-shell` | `da6b06d41` FAM-11 sub-lot B — app-shell cut, the shell channel split |
| `page-shell`, `workspace-shell`, `surface-chrome` | `b5eca0e4b` FAM-11 sub-lot C — page-shell and the three shells |
| `command-palette`, `search-command-bar`, `shortcuts-overlay` | `9779cab05` FAM-11 sub-lot D — the three derivers, the skins, the provider mount |
| `action-dock`, `scope-switcher`, `view-mode-switcher` | `e33a2c757` FAM-11 sub-lot E — the dock and the two switchers |

The one new family, `page-shell-surface`, is the skin folder sub-lot C added.
`consumes` +126 with zero removals is those ten derivers declaring what they
read; no existing deriver narrowed its declaration.

## The 408 new channels, attributed by the compiler's own provenance

Attribution is read from the `produces` edges — `runDerivation().provenance`,
the compiler's answer — not from the authored `produces` patterns:

| producing deriver | new channels |
| --- | ---: |
| `search-command-bar` | 143 |
| `app-shell` | 55 |
| `command-palette` | 51 |
| `shortcuts-overlay` | 45 |
| `data-table` | 32 |
| `materials` | 24 |
| `scope-switcher` | 15 |
| `page-shell`, `workspace-shell` | 6 each |
| `charts`, `record` | 2 each |
| `column-settings`, `file-manager`, `surface-chrome` | 1 each |
| (no producer — census-observed only) | 24 |

The large rows are the same FAM-11 lots above. `materials` +24 is `7a267f705`
(overlay/raised carry the full facet list, 71 -> 103 roots). `data-table` +32 is
`cefa1becc` (the divergent reads split into per-posture produced rungs) plus
`85cc1085b`/`7dd43cd12`/`fa2a4fff9`. `charts` +2 is `4def25f24` (the twelve chart
slots reach the tenant authority). The 24 producerless entrants are names the
new CSS references that nobody derives — the graph carries them with
`producedBy: []` on purpose, because "which channels has nobody produced" is the
question it exists to answer.

## The 73 removed channels — nothing a consumer can still reference

This is the finding a size re-pin could otherwise bury. Attributing each removal
to the deriver that produced it **before**:

- **71 had no producer in the old graph either.** They were census-observed
  orphan reads: a name some CSS read that no deriver emitted. They left the node
  set because the CSS that read them was rewritten, which means the orphan reads
  were repaired, not that a producer was lost.
- **2 genuinely lost a producer**, both from `typography`.

Every removal pairs with a landed replacement, verified name by name against the
new channel set:

| removed | count | replacement | landed by |
| --- | ---: | --- | --- |
| `--ds-shell-*` | 37 | `--ds-app-shell-*`, exact twin for 36 of 37 | `339a0a7a0` + `da6b06d41` |
| `--ds-table-*` | 25 | `--ds-data-table-*`, exact twin for all 25 | `cefa1becc` |
| `--ds-page-header-*` | 6 | `--ds-page-shell-header-*`, exact twin for all 6 | `8c901556d` |
| `--ds-type-tier-{xs,sm}-letter-spacing` | 2 | retired, no replacement | `ed46c7fc5` |
| `--ds-disabled-opacity` | 1 | reads repointed to the governed channel | `9d64c294f` |
| `--_ds-command-palette-shimmer-duration`, `--ds-page-shell-skeleton-radius` | 2 | reads removed with their rules | FAM-11 sub-lots C/D |

The two typography retirements are the only removal in the window that is not
half of a rename. `ed46c7fc5` took them deliberately with the owner's R5 sign-off
("zero readers across the four repos", the inherited role-tracking route proven
by a bithire witness, and a retirement drill that reds on re-emission). Grepping
`packages/core/src` for both names today returns nothing outside that lot's own
prose. Confirmed retired, not dropped.

The two stragglers and `--ds-disabled-opacity` were re-checked the same way: 8,
1 and 1 `reads` edges in the old graph respectively, zero source references now.

### The one removal that is not a rename and not a retirement

`--ds-shell-main-transition` is the single `--ds-shell-*` name with no
`--ds-app-shell-*` twin, and it is still referenced in source, at
`src/components/structures/shell/app-shell/index.tsx:378`:

```
'--ds-shell-resolved-main-transition': isCompact
  ? 'none'
  : `var(--ds-shell-main-transition, margin-inline-start ${SHELL_COLLAPSE_TRANSITION_READ})`,
```

This is intended and safe. The channel is the app's own escape hatch — the
component's docblock says it "is dead wherever the channel has a producer" — and
the read ends in a literal, so the declaration can never be invalid at
computed-value time when nobody declares it. Having no producer is its design.

It leaves the graph rather than sitting in it with `producedBy: []` for a
boundary reason worth recording: the read census scans
`src/foundation/tokens/css` only, so a read that moves from a CSS rule into a
TSX inline style leaves the census plane entirely. The extractor names
`tsx-inline-stamp` as the fourth plane of its vocabulary but does not scan it.
The consequence is narrow and stated rather than fixed here: a channel read only
from TSX is invisible to this graph. Routed, not touched.

## What else the census refresh moves

`artifacts/generated/manifest/cascade/edges/index.json` is read by six other
instruments besides the graph: `cascade:producers`, `tokens/cascade/slots`,
`tokens/cascade/roots/membership`, `tokens/cascade/normalization`,
`tokens/cascade/purity/references`, and the gates manifest that drives them.
Measured at `7d5ccf99a` **before** this lot, four of those were already red or
crashing against the tree, independently of the census:

| instrument | at HEAD, before this lot |
| --- | --- |
| `cascade:extract --check` | RED — the census this lot regenerates |
| `root-membership --check` | RED — membership does not match the tree |
| `slot-inventory --check` | RED — inventory does not match the tree |
| `normalization-contract --check` | RED — tenant allowlist 292 vs pinned 290 |
| `cascade:producers` | CRASH — stack overflow in `findExportedDecl` |
| `purity/references` | GREEN — 26 rows |

So this lot takes nothing from green to red in that set. Their reds are drift
between their own pins and the tree, owed to their own owners, and each still
wants its own attributed census. They are named here so the next reader knows
the census refresh did not create them.
