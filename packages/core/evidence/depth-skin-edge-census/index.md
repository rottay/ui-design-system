# Depth-axis skin-edge census

- Measured: 2026-09-20
- Tree: the depth skin lot, uncommitted, over `main` @ `f952656cd`
- Predecessor: `evidence/depth-derivation-census/index.md` (the derivation lot,
  `6d80b1468`). This file closes the backlog that census named in its section 3.
- Instrument: a source walker over the Modern skin corpus for the classification,
  and `scripts/check/theme/axis-difference` in a browser for the measurement.

The derivation census ended on a specific claim: "those 73 files are not a
backlog of missing wires; they are a backlog of missing *channels*, and closing
them is a skin edit, not a derivation edit." This lot is that skin edit. This
file is its denominator, its four refusals and its before/after.

It is evidence, not a gate. The gate is
`tests/architecture/modern-skin-edge-vocabulary/`, which holds the corpus at the
state measured here and fails on a single new bare literal.

## Method

The population is every `border*` declaration in the Modern engine skins,
`src/foundation/tokens/css/runtime/engines/modern/skin/**/*.css`, that carries a
**width literal of its own** — a length token that is not inside a `var()`.
Comments are blanked rather than deleted so a prose apostrophe cannot desync the
walk, and the delimiter is matched by lookahead rather than consumed, so one
declaration cannot swallow the next.

Each declaration is read with its selector and at-rule stack, because the stack
is what decides whether the literal is sanctioned.

## 1. The pool at HEAD

| Reading | HEAD |
| --- | --- |
| Modern skin folders | 124 |
| border declarations carrying their own width literal | 274 |
| of which the literal is exactly `1px` | **246** |
| of which it is not (`2px` 21, `3px` 3, `2.5px` 1, `0.28em` 2, `0.48em` 1) | 28 |

Only the `1px` pool is addressable. `--ds-edge-hairline-width` is the sole edge
role resting at `1px` in all three verticals; `standard` rests `1.5px` on bithire
and `emphasis` rests `2px`, so no wire to either is byte-equal and the 28
non-`1px` literals are out of scope by arithmetic, not by neglect.

## 2. The cut: 159 wired, 87 kept

| class | count | disposition |
| --- | --- | --- |
| **keyline** | **159** | wired to `var(--ds-edge-hairline-width, 1px)` |
| forced-colors | 52 | kept |
| state-border | 16 | kept |
| transparent-reserve | 11 | kept |
| affordance | 8 | kept |

The three refusal classes are not this lot's invention. Two are quoted from the
edge grammar's own law at `expressive-profiles/expansion`: "Selection/error/focus
states never ride these roles (they keep their own state channels), so no edge
value can make a state border-only-invisible."

- **forced-colors** — a `1px solid ButtonText` under `@media (forced-colors:
  active)` exists to paint a frame when shadows are forced away. Wiring it makes
  the frame vanish at `borderStyle: none`, which is exactly the render it is
  there to rescue.
- **state-border** — a focus ring, a selected row, an invalid field. Retracting
  these with a border posture would make a state invisible.
- **transparent-reserve** — `border: 1px solid transparent` paired with a state
  border that paints colour in the same place. Wiring only the reserve makes the
  two widths disagree at `none` and the row jumps.
- **affordance** — a drag grip, a drop indicator, a resize handle. These must
  survive the gesture; a tenant's border posture has no claim on them.

After the lot: **0** keylines painted by a bare literal, corpus-wide.

## 3. The wire

One form, everywhere: `var(--ds-edge-hairline-width, 1px)`.

The fallback is not decoration. It is the byte-equal floor for a render with no
compiled artifact: the skin then paints exactly the `1px` it painted before the
lot. The gate asserts that **every** hairline read in the corpus carries this
fallback and no other.

`var(--ds-border-width-1, 1px)` was rejected as the target. It is declared once,
at `foundation/themes/default/index.css:690`, with no producer and no
per-vertical writer — and the expansion's own comment makes the reason explicit:
"Structural `--ds-border-width-{0,1,2,4,8}` scale tokens are deliberately
untouched — a profile modulates roles, never the scale." Wiring a literal to the
scale renames it without making it move. Only the role reaches the dial.

47 families were touched; 51 now read the wire form (four already did).

## 4. The shadow half: nothing was wireable, and here is the enumeration

The brief's rule was "where the shadow IS an elevation rung's resting value,
wire to it; where not, keep and report". Measured independently of the
derivation census, which predicted this:

| Reading | count |
| --- | --- |
| `box-shadow` declarations in the Modern skins | 556 |
| already reading `--ds-elevation-{1..6}` | 121 |
| carrying a bespoke literal of their own | 138 |
| **bespoke values byte-equal to an elevation rung** | **0** |

Zero, and structurally so: every rung is a three- or four-layer `color-mix()`
chain over `--ds-shadow-tint` and the key/ambient strength dials. No single
authored value in the corpus is byte-identical to one, so every elevation wire
is a repaint by construction.

The bespoke pool by shape, which is the useful part for the next lot:

| shape | count | why an elevation wire has no claim on it |
| --- | --- | --- |
| inset-detail | 100 | an inner highlight or hairline; a rung is a drop shadow |
| focus-ring | 26 | a state, by the law quoted above |
| flat-ring | 6 | `0 0 0 Npx` is a ring, not an elevation |
| drop-shadow | 6 | the only pool a rung could ever claim |

Of those six drop shadows, two already read a rung (`dropdown`, `popover` read
`var(--ds-elevation-5, <literal>)`; the literal is only the no-artifact floor)
and one is a drop-indicator affordance. The three genuinely open:

- `pattern-timeline` `var(--ds-shadow-md, ...)` — already dial-wired;
  `--ds-shadow-md: var(--ds-elevation-2)`.
- `pattern-timeline` `0 1px 2px 0 color-mix(...)` — one layer against
  `--ds-elevation-1`'s three. Not byte-equal; wiring repaints.
- `widget-board` `-28px 0 72px -44px color-mix(...)` — a directional edge scrim,
  not an elevation posture at all.

**The shadow side of depth is not a wiring problem.** It is 100 inset details
and 26 focus rings that no elevation decision should govern, plus three drop
shadows that would each repaint. A future lot that wants the elevation half has
to change what those skins paint, not what they read — and it should say so
rather than reporting a wire count.

## 5. The measurement

`axis-difference`, browser, `--families=<the 47>`, `--no-write`, part mounts on,
same tree, same instrument, HEAD arm via `git stash` back to back:

| arm | depth | all six (vertical, mode) cells |
| --- | --- | --- |
| HEAD | 21/46 = **45.7 %** | identical in all six |
| lot | 34/46 = **73.9 %** | identical in all six |

Denominator unchanged at 46 (199 declared − 0 unmountable − 6 unsettled). The
`palette-only` negative control reads 0 % on the depth axis in both arms, so the
move is attributable to the border decision and not to colour.

**+13 families crossed into depth movers; 0 regressed.** The same thirteen in
every one of the six cells:

```
calendar  detail-panel  form-builder  kbd  list-toolbar
pattern-calendar-view  pattern-map-view  pricing-table  qrcode
saved-views  statistic  upload  workbench-header
```

The probe records a root-node property for five of them (`border-top-width`);
the mover set the percentage uses is `movedIds`, which also counts a family that
moves on a mounted part, and this run published no per-property record for those.

## 6. The generated-doc delta this lot owes the next regeneration window

`docs-engineering/.../tokens/catalog/families/edge.md` is generated by
`pnpm tokens:catalog:write` and gate-checked. The lot changes exactly one cell
of it:

```
--ds-edge-hairline-width   Consumers (css):  engine:modern(17)  ->  engine:modern(62)
```

`Consumers` counts files, not declarations: 47 families were wired and 45 Modern
skin files gain the role as a new consumer. No other row, column or view moves.

It was NOT regenerated here, deliberately. The gate is already red at HEAD with
14 stale views (`avatar`, `badge`, `border`, `collapse`, `column`, `edge`,
`list`, `motion`, `stats`, `tag`, `tree`, `catalog.md`, `exposure-tiers.md`,
`impact-map.md`) left by the preceding derivation and motion lots, and
`docs-engineering` carries other writers' uncommitted work. The stale SET is
byte-identical with and without this lot, verified by running the check on both
arms, so regenerating would fold thirteen other files of somebody else's drift
into this commit. The one-cell delta above is stated here so the serialized DT
regeneration window can absorb it with the rest.

## Honest negatives

- **Thirteen of the 47 wired families are still not depth movers**: `carousel`,
  `cockpit-header`, `column-settings`, `command-palette`, `descriptions`,
  `file-manager`, `filter-panel`, `form`, `image`, `invoice-template`, `result`,
  `table`, `widget-board`. A wire is real and invisible at the same time when the
  edge it paints sits behind a variant the scene does not mount — the same
  finding the derivation lot recorded for `list` and `tree`. `cockpit-header` is
  additionally excluded from the denominator as unsettled, so it could not have
  counted whatever it painted.
- **The classifier is a heuristic over selectors, not a semantic reading.** It is
  published as source in the gate so a disagreement is arguable against a
  specific line rather than against a number. Each of the four refusal classes is
  a decrease-only ceiling, so a reclassification can only shrink them.
- **Detection is property-shaped.** An edge drawn with `outline`, a gradient, a
  sized block or a pseudo-element is invisible to a `border*` scan, exactly as in
  the predecessor census. 246 is a floor on the bare-literal pool, not a ceiling.
- **The 28 non-`1px` literals are untouched and unexplained.** They are out of
  scope because no edge role rests byte-equal to them, not because they are
  correct. A `2px` literal is as unreachable by a tenant as a `1px` one was.
- **This lot changed no deriver and no channel.** It changed what skins read. A
  family with no component channel still has none; it now reads a governed root
  directly, which is the chained-fallback idiom the architecture prescribes, not
  a substitute for a channel it should eventually own.
- **The census is not the gate.** Nothing fails when this file goes stale.
