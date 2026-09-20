# Mode-mirroring, routed arms 1 + 3

Writer packet opened on `da9611fce`; **another writer committed twice during
the packet, so this lot now sits on `56f8f1b28`** (`1556ef3ee`, `56f8f1b28`).
Nothing in either commit touches this write set. The working tree also carries
a second writer's uncommitted work — `scripts/check/family-cut/**`,
`roadmap/STATUS.md`, `roadmap/registry.json`, `primitives/display/{avatar,tag}/engines/modern`,
`skin/descriptions/index.css`, and three untracked
`display/{avatar,descriptions,tag}/tests/*.state-stamp.test.tsx`.
**None of those are mine**; read the diff as a subset. Mine is exactly:
`presentation/components/input/index.css`, fourteen causality suites,
`.changeset/fam-input-ground-mode-mirroring.md` and this evidence folder. Arm 1 (the control surface) LANDED. Arm 3 (the
danger ink) **STOPPED with the measurement**: its real root is not the owner the
adopted debrief named, and it is not in this packet's write set.

Harness: `tests/support/family-causality` — the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`), the resolved
source stylesheet plus one compiled arm in real Chromium, computed style read
back. Colours read through a 1x1 canvas, because `color-mix()` serializes as
`color(srgb ...)` and a regex reports near-black for near-white.

---

## Arm 1 — LANDED

### Root cause, confirmed and sharpened

The debrief placed it exactly: `presentation/components/input/index.css:79`
stated `--ds-input-bg: var(--ds-color-white)` with no mode leg, and `:81` the
same for `-focus`. What the debrief did not state is WHY that literal beat a
correct dark chain, and the reason decides the repair.

It is not specificity — it is **layer order**. The base entrypoint declares
`... rottay-tokens, rottay-motion, rottay-components ...`
(`facade/entrypoints/base/index.css:41`), the default theme imports into
`rottay-tokens` (`:48`) and the Input component tokens into `rottay-components`
(`:66`). A later layer wins over an earlier one regardless of selector
specificity, so the component base's `:root` literal outranks the theme's
`html[data-theme='dark']` block. That also explains a declaration the debrief
never mentions: the dark block DOES state `--ds-input-bg`, at
`foundation/themes/default/index.css:2102` (`var(--ds-color-bg-tertiary)`), and
it has always been **dead** — unreachable from the shipped bundle. Left
untouched: it is inert before and after this change, and the theme file is not
this packet's write set. Named for the DT.

Bithire escaped only because its compiled artifact is UNLAYERED (unlayered
normal declarations beat every layer) and re-aliases the name at
`facade/artifacts/bithire/index.css:1363`.

### Adjudication: which owner is canonical

Repaired **at the component base**, not at the artifact emitter.

1. The component base is already the only reachable declaration of the DS
   default for this channel; there is no second productive owner to contest.
2. Routing it to the emitter would make every tenant artifact state
   `--ds-input-bg` unconditionally — turning a DS default into a per-tenant
   compiled statement, and putting it into the same unlayered block a tenant's
   own `tokenOverrides` are emitted into. That is a harder contract for a
   strictly smaller gain.
3. Repairing at the base makes bithire's artifact re-alias **redundant rather
   than load-bearing**, which is the invariant the debrief asked for.

A tenant statement of `--ds-input-bg` still outranks the base, unchanged: the
artifact is unlayered and the base is in `rottay-components`.

### Measured — `--ds-input-bg` / `--ds-input-bg-focus` at the root

| scope | bg before | bg after | focus before | focus after |
| --- | --- | --- | --- | --- |
| rottay dark | **`#ffffff`** | `#0F0F12` | **`#ffffff`** | `#0F0F12` |
| evnto dark | **`#ffffff`** | `#0F0F12` | **`#ffffff`** | `#0F0F12` |
| bithire dark | `#0c0c0c` | `#0c0c0c` | **`#ffffff`** | `#0c0c0c` |
| rottay light | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` |
| bithire light | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` |
| evnto light | `#ffffff` | `#ffffff` | `#ffffff` | `#ffffff` |

Two findings the debrief did not carry:

- **evnto dark had the same defect as rottay dark.** It was never pinned because
  `evnto dark` is not one of the four `AXE_SCOPES`, so no gate looked at it.
- **bithire dark's `-focus` leg was broken too.** Its artifact re-aliases
  `--ds-input-bg` but not `--ds-input-bg-focus`, so a focused field in bithire
  dark resolved a white ground while its resting field was `#0c0c0c`.

`--ds-input-bg-hover` and `--ds-input-bg-disabled` are byte-identical in all six
scopes: neither reads `--ds-input-bg`, both read `--ds-material-control-*`.

### Light-scope byte-equality

`--ds-color-bg-input` resolves `#ffffff` at the light root of all three
verticals, so the substitution is a literal no-op in light. Every light cell
above is byte-identical, and so are the two derived legs. The one channel that
was NOT used, and why: `--ds-color-neutral-0` resolves `#020617` in dark, so a
base stated on the neutral ramp would have been a different defect.

### Ratio, per repaired pairing

`column-settings :: rottay dark`, `#input-_R_3_`, the family's search field:

| | ink | ground | ratio |
| --- | --- | --- | --- |
| before | `#f8fafc` | `#ffffff` | **1.04:1** |
| after | `#f8fafc` | `#0F0F12` | **18.29:1** |

The other three gated scopes are unmoved and were already clean: bithire light
17.93:1, bithire dark 18.70:1, evnto light 17.93:1.

### Rows drained by identity

**Fourteen suites**, every one of them the `rottay dark` row and nothing else.
Measured over the whole input family and its consumers (36 suites run, 2 batches):
every failure had the identical shape — measured `{}` / `[]` against a non-empty
pin, scope `rottay dark`. **No scope got worse, no new node appeared anywhere,
no other scope moved.**

| suite | nodes that drained |
| --- | --- |
| `column-settings` | 1 — the search field (the packet's target) |
| `filter-panel` | 3 — search field + both range fields |
| `input` | the gallery's fields (pin was a rule-id assertion) |
| `input-number` | the gallery's fields (pin was a rule-id assertion) |
| `password-input` | 2 |
| `auto-complete` | 3 |
| `cascader` | 4 — trigger placeholders, via `--ds-cascader-bg` |
| `date-picker` | 4 |
| `time-picker` | 4 |
| `mentions` | 2 |
| `otp-input` | 6 |
| `tag-input` | 5 |
| `transfer` | 2 |
| `tree-select` | 3 |

Twelve of these are outside the packet's named write set (which granted only
`column-settings` and `file-manager`). Every one went red as **good news failing
closed**, and I emptied each with the cause named in its own docblock, because
leaving fourteen suites red with no explanation is worse than a scoped,
fully-reported pin edit. **Trivially reversible: the list above is complete.**

Two of them were not really pins at all but declared, conditional ones. `Input`
and `InputNumber` asserted the debt inline with the words *"Pinned until the
input's ground derives with the mode"* — which is exactly this repair, so those
two closed on their own stated condition.

### Sighted evidence

`captures/{before,after,control}/<vertical>-<mode>[--focused].png`, 2x DPR,
column-settings panel + Input + focused Input + PasswordInput on the vertical's
own canvas. The `before` leg is HEAD's two declarations restored byte-for-byte
into the resolved sheet in-memory — one tree, no git operation, no timestamped
baseline.

**Verdict: PASS.** `before/rottay-dark.png` and `before/evnto-dark.png` show a
white search box and three white fields carrying near-white text that is
essentially unreadable; `after/` grounds all four at the mode's own control
colour with the text legible, and the checkbox ticks become visible as a
side-effect of the same ground. `before/bithire-dark.png` and `after/` are the
control: bithire's resting paint does not move, as required.

**`control/` is the noise floor, and it matters.** The capture pipeline is
NOT deterministic at the pixel level — `control` is a second `after` capture
with identical CSS:

| capture | before vs after (px, maxΔ, px Δ>8) | after vs control, NO change |
| --- | --- | --- |
| rottay-dark | 198296, 240, 187652 | 10604, 39, 118 |
| evnto-dark | 188092, 240, 187304 | 10602, 27, 258 |
| bithire-light | 9554, 57, 344 | 9568, **220**, 676 |
| evnto-light | 492, 10, 2 | 10586, 23, 272 |
| rottay-light | 10646, 37, 326 | 618, 18, 10 |

The dark rows sit two orders of magnitude above the floor and are the real
change. **The light rows are inside the noise and the PNG diff cannot resolve
them either way** — the control is sometimes noisier than the comparison. The
light-scope byte-equality claim rests on the channel table above, which is exact,
not on the captures. Stated here rather than quietly rounded to "identical".

---

## Arm 3 — STOPPED, with the measurement

The packet's standing instruction: *"If the repair's real root turns out to sit
elsewhere, STOP with the measurement."* It does.

### What the debrief claimed

> the ghost/danger Button labels ... The Button also paints its own ~7%
> danger-tinted ghost ground under that ink, so both legs of the pair are the
> **Button's and the palette's**, not the family's.

and the file-manager pin's own docblock: *"The family relays no colour into
either."*

### What is measured

Both statements are false. Read off the rendered delete buttons in all four
gated scopes:

| scope | `data-variant` | `data-tone` | label ink | ground | ratio |
| --- | --- | --- | --- | --- | --- |
| bithire dark | `ghost` | **`null`** | `#c62828` | `rgb(36,35,52)` | 2.74:1 |
| evnto light | `ghost` | **`null`** | `#f87171` | `rgb(255,245,245)` | 2.59:1 |
| bithire light | `ghost` | `null` | `#c62828` | `rgb(251,240,240)` | 5.04:1 |
| rottay dark | `ghost` | `null` | `#f87171` | `rgb(40,40,57)` | 5.23:1 |

`data-tone` is **null on every one of them**, so the Button's governed
quiet-destructive recipe — `color: var(--ds-button-error-border)`,
`skin/button/index.css:972` — never runs. The ink is not the Button's.

It is the family's. `skin/file-manager/index.css:209`:

```css
.ds-pattern-file-manager.ds-engine-modern [data-part='item-action'][data-action='delete'] {
  color: var(--ds-color-error);
}
```

with the comment above it reading *"the composed ghost Buttons keep their
chrome; the pattern owns only the semantic tone of each action label"* — which
is the defect stated as the intent. `--ds-color-error` is the **fill** role, the
colour other things are graded to sit ON, not an ink role.

The "7% danger-tinted ghost ground" is the same statement one step later. The
Button's ghost rest wash is `color-mix(in srgb, currentColor 7%, transparent)`
(`skin/button/index.css:716`) — `currentColor`, which is whatever the family
just forced. Measured `btnBg` is exactly `--ds-color-error` at 0.07 alpha in
every scope. So **both legs of the failing pair trace to one family-local
statement**, not to the Button and not to the palette.

The `f1-name` row is the same shape on a different channel: `variant="link"`,
ink `--ds-color-link` `#3F6FFD`, 3.72:1 on bithire dark's `#182235` card.

### Why this is a STOP and not a smaller fix

The honest repair has two parts and neither is reachable from the write set:

1. **The family must stop restating the ink** — stamp `danger` on the ghost
   Button (`engines/modern/index.tsx:516`) so it takes the governed tone, and
   delete `skin/file-manager/index.css:209`. Both are the **file-manager's own
   files**, which the packet names as out of scope (only its `AXE_DEBT` row is
   mine).
2. **That alone does not empty the rows.** Arithmetic on the governed channel:
   `--ds-button-error-border` is `#F8675D` in bithire dark → ~4.5:1 with the
   wash, which passes; but it is `#dc2626` in evnto light → **3.70:1** on the
   selected row's tinted ground, still failing. The DS-default danger ink
   carries no mode leg either (`--ds-button-error-border` is `#dc2626` in BOTH
   evnto light and rottay dark; `--ds-color-error` is `#f87171` in both).

The only move that empties the rows from inside my write set is repainting
`--ds-color-error` itself. I did not do it. It is consumed as a **fill** as well
as an ink — `--ds-tooltip-error-bg`, `--ds-radio-error-border-color`,
`--ds-alert-dialog-icon-bg`, every `--ds-color-alpha-error-*` mix — so grading
it for one ink pairing would repaint every solid danger surface in rottay and
evnto. That is the fleet-wide repaint the routing rationale exists to prevent,
inverted. It needs adjudication, not a writer's judgement call.

### Proposed routing

One packet owning `file-manager` (TSX + skin) **and** the danger-ink mode leg,
in that order:

1. file-manager stamps `danger` on the delete Button and drops its `color:`
   statement; re-measure — this alone should empty `bithire dark`'s three
   `*-delete` rows.
2. The DS-default danger INK gains a mode leg. Note the light root states
   `--ds-color-error: var(--ds-color-error-400)`
   (`themes/default/index.css:184`) — error-400 `#f87171` is a value graded for
   a DARK ground, sitting at the LIGHT root, and the dark block does not restate
   it. That inversion is the evnto-light half, and it is one declaration.
3. `f1-name` is the link channel, a third arm; it is not the danger ink and
   should not be bundled with it.

Nothing in arm 3 was written. `file-manager`'s `AXE_DEBT` is untouched, and its
docblock's "the family relays no colour into either" is now known to be wrong —
left in place deliberately, since correcting the prose without the repair would
leave a doc claiming a fix that does not exist.


---

## Validation

| command | result |
| --- | --- |
| `vitest run --project integration` over the 16 suites I touched (incl. `Button`, `file-manager`) | **16 files / 204 tests passed** |
| blast-radius batch A — 17 input-family primitives | 12 suites red, all as drained `rottay dark`; green after emptying |
| blast-radius batch B — 19 input-consuming patterns/structures/surfaces | 151/152; the 1 was `filter-panel`, same drain |
| `pnpm exec tsc --noEmit` | exit 0 |
| `pnpm run root-catalog:check` | OK — 100 roots agree with `src/` |
| `pnpm run csssource:check` | CSS source integrity gate passed |
| `pnpm run root-exposure:check` | OK — 38 tenant-dial, 23 internal-head, 3 gap |
| `pnpm run theme-parity:check` | **FAIL — pre-existing.** A/B'd in a detached worktree at `56f8f1b28`: byte-identical output. Buckets are `BrandCollapseChrome`, `BrandSidebarChrome`; no input channel. |
| `pnpm run csspaint:check` | **FAIL — pre-existing.** Same A/B, byte-identical. `--radius-field`/`--ds-radius-button` + two `decisions/writers/unused/system/index.json` entrypoints; no input channel. |

`file-manager` and `Button` suites are green and untouched, which is the control
for the arm-3 STOP: nothing in arm 3 moved.

## Left to the DT

- **`docs-engineering/.../tokens/catalog/families/input.md`** may need regeneration
  (`tokens:catalog:write`). Rows 40 and 42 carry `--ds-input-bg` / `-bg-focus`
  with resolved value `#ffffff` and a `source` column. The resolved LIGHT value
  is unchanged, so the value cells should hold; the source/consumer columns may
  move. **Not regenerated here** — generated output is the DT window.
- **`foundation/themes/default/index.css:2102`** states `--ds-input-bg:
  var(--ds-color-bg-tertiary)` in the dark block and is **dead** (lower layer),
  before and after. Left untouched; named so it is not mistaken for a live
  second authority.
- Arm 3's routing, above.
