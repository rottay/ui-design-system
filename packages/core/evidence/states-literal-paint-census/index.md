# States-axis literal-state-paint census

- Measured: 2026-09-20
- Tree: the states literal-state-paint lot, uncommitted, over `main` @ `e1a939f68`
- Instrument: `scripts/check/theme/axis-difference` (catalog `d9e1541e203de194`,
  chromium 149.0.7827.55, part mounts ON — 191 families / 1544 parts / 1748
  nodes), plus a source walker over the same skins the population module reads.
- Companion: `index.json` carries the same adjudication row by row.

It is evidence, not a gate. The gates are the per-family causality suites this
lot lands.

## The premise, measured

The dispatch brief states: *"26 'literal state paint on measured node' sites —
focus rings with literal width/offset/color, press scales, disabled opacities
NOT reading the governed states channels"*, to be wired **byte-equal at rest in
all three verticals**.

That premise measured **FALSE as stated, and the correction runs in the lot's
favour.** Enumerated on the node the probe actually measures:

| of the 26 | n | |
| --- | --- | --- |
| already read the governed channels — blocked by REACH, not by a literal | 6 | wired byte-equal |
| carry a flat family ring channel | 2 | wired, declared change |
| carry no governed non-chromatic lever on a measured node at all | 18 | residual, reason-coded below |

| of the pseudo-only 10 | n | |
| --- | --- | --- |
| blocked by REACH, governed already | 1 | `collection-workspace-render-dispatch`, wired byte-equal |
| residual | 9 | reason-coded below |

"Literal" was the wrong diagnosis for most of the 26. The blockers are three
REACH mechanisms, and each has a different repair:

1. **a pseudo on a part compound.** `partCompound` refuses any `:`, so
   `.view-all-anchor:focus-visible` never projects and the part is never mounted
   for the states axis — even though its declaration reads
   `var(--ds-focus-ring-width, 2px)`. The lot-2 twin
   `:is([data-state~='focus-visible'], :focus-visible)` expands to an
   attribute-only alternative that does project.
2. **a prop echo at the head.** `projectPartChain` refuses a head attribute the
   mounted root does not carry, and `STATE_ATTRIBUTE` is `/(^|-)state$/` — so
   `data-disabled` is a variant gate, not a state. Slider's four muting rules
   were headed by `[data-disabled='true']` alone and their parts were never
   mounted. Pairing the kernel token with the prop echo at the head fixes it
   without removing either attribute.
3. **an adapter contract with no stamp.** The header back chip's ring is drawn
   on a node whose focus lives on the app-injected anchor above it, and
   `NavigationLinkProps` admitted no `data-state` and no handlers. The skin file
   said so in prose, and named widening that contract as the close. This lot
   widens it.

## Arms and resting values

The states pair is `{emphasis: subtle, focus-style: ring}` against
`{emphasis: strong, focus-style: glow}`. Compiled per vertical, the five
non-chromatic levers and their resting values:

| channel | arm A | arm B | bithire rest | evnto rest | rottay rest |
| --- | --- | --- | --- | --- | --- |
| `--ds-focus-ring-width` | 2px | 1px | 2px | 2px | 2px |
| `--ds-focus-ring-offset` | 2px | 0px | 2px | 2px | 2px |
| `--ds-focus-ring` | two-layer ring | glow | ring | ring | ring |
| `--ds-state-press-scale` | 0.99 | 0.965 | 0.965 | 0.98 | 0.98 |
| `--ds-state-disabled-opacity` | 0.68 | 0.5 | 0.5 | 0.6 | 0.6 |

Only the two focus-ring geometry roots rest at the same value in all three
verticals. That is why every byte-equal wire in this lot is a focus-ring or a
reach repair, and why the two press/disabled channels are not wired anywhere
they did not already reach — a flat literal cannot be byte-equal to both
0.965 and 0.98, nor to both 0.5 and 0.6.

## The wires

| family | mechanism | byte-equal |
| --- | --- | --- |
| activity-cards | twin + stamp (shared `NavLinkAnchor`) | yes |
| activity-compact | twin + stamp | yes |
| activity-ticker | twin + stamp, plus its own nav-button and ticker-dot | yes |
| activity-timeline | twin + stamp | yes |
| collection-workspace-render-dispatch | twin + stamp (fallback open link) | yes |
| header-hero-shared | twin + stamp + the adapter contract | yes |
| slider | head pairing + root stamp | yes, in every state |
| tag | deriver: `--ds-tag-close-focus-ring` | **no — declared** |
| status-filter-pills | `:root` default: `--ds-filter-pill-focus-ring` | **no — declared** |

### Byte-equality, measured rather than asserted

The composed bundle and the same bundle with exactly this lot's declarations
textually restored, mounted in ONE page per vertical and mode, read over every
axis longhand at rest and under each of the five stamped states:

**4176 cells, 66 differing, and every one of the 66 is under the
`focus-visible` stamp.** Zero at rest. Zero under hovered, pressed, selected or
disabled. Under the platform's own `:focus-visible` the twin keeps that arm
verbatim inside the same rule at the same specificity — `:is()` takes the
specificity of its most specific argument, and `[data-state~='x']` and `:x` are
both (0,1,0).

The 4176-cell reading was taken with a per-lot page harness that is not shipped.
The verification of record is the independent lot review's rerun on the
axis-difference probe runtime: 17 nodes covering every changed selector, one
page per vertical and mode with `html[data-tenant]` set, every computed
longhand at rest and under the five stamps — 288,864 cells, 106 differing, all
outline/box-shadow longhands under the `focus-visible` stamp, zero at rest and
zero under hovered/pressed/selected/disabled. Without `html[data-tenant]` on
the page the tag row falsely reads byte-equal.

A draft claim that `FormHeader`'s first render throws `Element type is invalid`
in a fresh module graph was **retracted on review**: neither `e1a939f68` nor
this candidate shows it under the stated two-import shape. If it resurfaces it
needs the exact reproducing test attached, not prose.

### Declared changes

Two family ring channels stop being flat. Neither is a byte-equal wire and
neither is claimed as one.

| channel | before | after | what repaints |
| --- | --- | --- | --- |
| `--ds-tag-close-focus-ring` | `0 0 0 2px color-mix(in srgb, currentColor 26%, transparent)` | `var(--ds-focus-ring, <the same literal>)` | the tag close button's keyboard ring, all three verticals, both modes |
| `--ds-filter-pill-focus-ring` | `0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 22%, transparent)` | `var(--ds-focus-ring, <the same literal>)` | the pill's and the badge's keyboard rings (`list-toolbar` reads the same channel) |

Both follow an in-tree precedent rather than inventing one: `--ds-tag-focus-ring`
and `--ds-header-back-focus-ring` already state their rings exactly this way, and
a tenant's `chrome.filterPill.focusRing` still outranks the default.

## Fleet before / after

Both readings on ONE tree, same catalog, same browser, same mounts — the
"before" is `main` @ `e1a939f68` in a worktree, the "after" is this tree.

| axis | before | after |
| --- | --- | --- |
| typography | 173/174 (99.4%) | 173/174 (99.4%) |
| shape | 136/205 (66.3%) | 136/205 (66.3%) |
| rhythm | 151/209 (72.2%) | 151/209 (72.2%) |
| depth | 91/187 (48.7%) | 91/187 (48.7%) |
| **states** | **77/147 (52.4%)** | **88/147 (59.9%)** |
| motion | 154/195 (79.0%) | 154/195 (79.0%) |

+11 families, none lost, every other axis byte-identical by `movedIds`, all 48
negative-control cells at 0, 6/6 states cells identical across verticals and
modes.

Gained: `activity-cards`, `activity-compact`, `activity-ticker`,
`activity-timeline`, `badge`, `collection-workspace-render-dispatch`,
`edit-header`, `header-hero-shared`, `slider`, `status-filter-pills`, `tag`.

Two of those were not targets. `badge` reads `--ds-filter-pill-focus-ring`, and
`edit-header` is its own family sharing the back chip `header-hero-shared`
declares. Both are named rather than absorbed.

## The residual, reason-coded

28 of the 36 families the brief named do not move, and the reasons are not one
reason.

| reason | n | families |
| --- | --- | --- |
| no non-chromatic state paint at all | 4 | active-filters-bar, operational-ledger, record-facts, scope-switcher |
| no governed lever (the paint exists, on no states channel) | 9 | collection-header, collection-workspace, decision-comparison, descriptions, metrics-minimal, notification-center, presence, search, visual-excellence-preview |
| foreign root (the state rule is headed by another family's root) | 3 | card-compounds, float-button, input-compounds |
| prop-gated part (`[data-interactive='true']`) | 2 | activity-log, stats-grid |
| channel declared, paint delivered by a composed primitive | 2 | field-filters-panel, search-command-bar |
| nothing reaches a measured node even fully twinned | 7 | anchor, ascii-diagram, data-terminal-card, drawer-compounds, grid-view, scheduler-surface, tree-view-connector |
| portal (`head-not-the-family-root`) | 1 | tooltip |

Three of these buckets are honest wiring backlogs and one is not:

- **prop-gated part (2).** The ring is already governed; only the
  `[data-interactive]` gate stands between it and the probe. Dropping the gate
  is a selector generalisation — a focus ring can only ever paint on a focusable
  node, so the gate is redundant *for that rule* — but it is a reviewed edit and
  not a wire, so it is not in this lot.
- **foreign root (3) and portal (1).** Instrument-side: the probe mounts one
  root per family and these rules hang off another.
- **channel-not-paint (2).** These families do their part correctly: they
  declare `--ds-button-focus-ring` from the governed roots and a composed
  `Button` paints it. The probe does not mount a composed primitive.
- **no governed lever (9) and no state paint (4).** Not wiring. Giving
  `collection-header`'s quick-actions a press scale, or `metrics-minimal` a
  governed hover scale, is NEW paint — a reviewed visual decision, and the same
  owner question H2 that the fleet analysis raised for the colour-only cluster.
  `--ds-state-{hover,active,selected}-shift` and `--ds-state-disabled-mix` are
  colour channels and can never move a non-chromatic axis.

## Registered, not fixed here

- `typecheck:tests` is red at `e1a939f68` on one TS2344 in
  `LiveFeed.shape.integration.test.tsx`. This lot adds zero; the gate reads the
  same count before and after.
- The ticker's two nav-buttons are unreachable in a static SSR prelude: their
  chevron icons suspend, and the prelude parks the whole subtree in a hidden
  reveal block outside every wrapper. Their stamp is drilled in
  `ActivityTicker.focus-stamp`; their paint is measured by the fleet run.
