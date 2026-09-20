# Routed arms — contrast pairings whose root cause is not family-local

WO-FAM-08 / WO-FAM-10 contrast drain, writer packet. Measured on `3b54a1818`
with the same harness the causality suites use (`tests/support/family-causality`:
productive-door compile → Chromium → axe-core `color-contrast`, serious+).

Three arms stayed pinned. Each is a composed primitive's own ink or a shared
material role; repairing any of them from a family scope would mean one pattern
restating another owner's channel, which hides a fleet defect behind a single
consumer and leaves every other consumer of that primitive still failing.

---

## Arm 1 — the Input base states a mode-blind white that shadows the control chain

**Pin:** `column-settings :: rottay dark` → `#input-_R_3_`
**Measured:** ink `#f8fafc` on ground `#ffffff`, **1.04:1** (floor 4.5).

**Root cause (corrected on review, then sharpened by measurement).** My first
debrief blamed rottay's `surfaceRoles.control.background`. That is wrong: rottay
authors no control role and no `--ds-color-bg-input`. Measured at the root in
each gated scope:

| scope | `--ds-surface-control` | `--ds-color-bg-input` | `--ds-input-bg` |
| --- | --- | --- | --- |
| rottay dark | `#0F0F12` | `#0F0F12` | **`#ffffff`** |
| bithire dark | `#0c0c0c` | `#0c0c0c` | `#0c0c0c` |
| bithire light | `#ffffff` | `#ffffff` | `#ffffff` |
| evnto light | `#ffffff` | `#ffffff` | `#ffffff` |

So the mode chain is NOT broken: the default theme's dark block
(`foundation/themes/default/index.css:2020-2022`, keyed
`:root[data-theme='dark'], html[data-theme='dark'], html.dark`) sets
`--ds-color-bg-input: #0F0F12`, `--ds-surface-control` reads it (`:282`), and
BOTH arrive correctly in rottay dark.

The defect is one rung lower. The Input skin reads
`var(--ds-input-bg, var(--ds-material-control-background, var(--ds-surface-control)))`
— `--ds-input-bg` FIRST — and the Input component base states
`--ds-input-bg: var(--ds-color-white)`
(`presentation/components/input/index.css:79`), mode-blind. That literal shadows
the correctly-dark chain, so the fallback legs never run.

Bithire escapes it only because its compiled artifact re-aliases the name back:
`--ds-input-bg: var(--ds-color-bg-input)` (`facade/artifacts/bithire/index.css:1363`).
Rottay's artifact never states `--ds-input-bg` — it only READS it, at 16 sites —
so the white base default stands in every mode.

Sighted: `after/column-settings--rottay-dark.png`, a white search box in an
otherwise dark panel.

**Blast radius.** Every Modern control reading `--ds-input-bg` in any vertical
whose artifact does not happen to re-alias it — the Input itself plus the 16
downstream channels that read it (auto-complete, cascader, color-picker field,
date-picker, input-number, mentions, otp-input slot, …).

**Proposed contract.** The Input base stops stating a colour and states the
chain: `--ds-input-bg: var(--ds-color-bg-input, var(--ds-surface-control))`, so
the mode leg that already exists reaches every tenant instead of only the ones
that re-alias it. Bithire's artifact statement then becomes redundant rather than
load-bearing.

**Write set (not this packet's):** `presentation/components/input/index.css:79`
(and its `--ds-input-bg-focus` sibling on `:81`, the same white literal), or the
emitter that decides whether a tenant artifact re-aliases the name.

**Invariants:** every light scope must stay byte-identical (`--ds-color-bg-input`
already resolves `#ffffff` there, so the substitution is a no-op in light); a
tenant statement of `--ds-input-bg` must keep outranking the base.

**Acceptance:** `column-settings`'s `AXE_DEBT` empties by identity; the `input`,
`password-input`, `otp-input` and `select` axe scopes stay clean in both modes;
no light-scope pairing moves.

---

## Arm 2 — `--ds-breadcrumb-current-bg` resolves light in a dark scope

**Pin:** `file-manager :: rottay dark` → the two `data-current="true"` crumb
labels (one per mounted view mode).
**Measured:** ink `#f3f4f6` on ground `#ececec`, **1.07:1**.

**Root cause.** The file-manager owns only the breadcrumb SLOT
(`skin/file-manager/index.css:105`, `min-inline-size: 0`); the composed
Breadcrumb paints the crumb. Its current crumb reads
`var(--ds-breadcrumb-current-bg, …)`, produced by the breadcrumb deriver as
`color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card)))`
(`derivation/chrome/breadcrumb/index.ts:104`). In rottay dark that chain resolves
to a near-white `#ececec` chip, under the dark mode's near-white ink. Visible in
`after/file-manager--rottay-dark.png` as a white pill reading "Workspace".

**Blast radius.** Every Breadcrumb consumer in that scope.

**Proposed contract.** The crumb chip states its ground AND the ink measured
against it, as the data-table phone bars now do: the deriver emits
`--ds-breadcrumb-current-bg` and a paired `--ds-breadcrumb-current-color` mixed
into that ground, and the `--ds-card-bg` leg of the chain is audited for whether
it should mirror at all.

**Write set (not this packet's):** `derivation/chrome/breadcrumb/`, the
breadcrumb Modern skin, and whatever produces `--ds-card-bg` in that scope.

**Acceptance:** `file-manager`'s `rottay dark` entry empties by identity;
breadcrumb's own axe scopes stay clean; light scopes byte-identical.

---

## Arm 3 — the danger INK carries no mode leg (two different reasons)

**Pins:**
- `file-manager :: bithire dark` → three `*-delete` ghost-Button labels **2.57–2.75:1**
  (ink `#c62828`), plus the `f1-name` folder-link Button label **3.71:1** (ink `#3f6ffd`).
- `file-manager :: evnto light` → three `*-delete` labels **2.19–2.58:1** (ink `#f87171`).

**Root cause (corrected on review).** My first debrief said "each vertical states
one danger literal". That is true for bithire and FALSE for evnto. Measured
`--ds-color-error` at the root — which is the ink the rendered labels resolve to
in both cases:

| scope | `--ds-color-error` | origin | `--ds-button-error-border` |
| --- | --- | --- | --- |
| bithire light | `#C62828` | vertical-authored `palette.status-seeds.error` | `#9C000F` |
| bithire dark | `#C62828` | same seed, **no dark leg** | `#F8675D` |
| evnto light | `#f87171` | **DS default** (error-400 at the light root) | `#dc2626` |
| rottay dark | `#f87171` | same DS default | `#dc2626` |

So the two halves fail for opposite reasons:

- **bithire** authors a status seed with no dark leg, so its light-graded
  `#C62828` is carried unchanged onto a dark ground: 4.52:1 light → **2.58:1** dark.
- **evnto** authors nothing. It inherits the DS default `--ds-color-error`, which
  resolves to error-400 `#f87171` at the light root — a value graded for a dark
  ground. It reads 5.29:1 on rottay dark and **2.22:1** on evnto light.

Note that `--ds-button-error-border` DOES mirror for bithire (`#9C000F` light →
`#F8675D` dark), which shows the mode leg exists for some danger channels and is
simply missing on the ink one. The Button also paints its own ~7% danger-tinted
ghost ground beneath that ink (measured `#262742` over the selected row's
`#1a2743` in bithire dark), so both legs of the failing pair are the Button's and
the palette's, not the family's. The `f1-name` case is the same shape on the
link/primary channel (`#3f6ffd` on the card at 3.71:1).

This is the class of defect the divider's overline ink was already routed for in
`3b5d11262`.

**Proposed contract (unchanged by the correction).** `--ds-color-error` gains a
mode leg on BOTH paths — a dark-root value for the DS default, and a derived dark
leg for a vertical-authored status seed — and the Button's ghost/danger ink is
graded against the ghost tint it paints rather than taking the raw role.

**Write set (not this packet's):** the DS default error rung's dark block, the
status-seed derivation, the Button deriver/skin, and bithire's vertical preset.

**Acceptance:** `file-manager`'s `bithire dark` and `evnto light` entries empty by
identity; the Button's own axe scopes stay clean in both modes on all three
verticals.

## What did land

The family-local arms all drained. See `RESULTS.md` for the per-pairing
before→after ratio table, the weight drill and the capture index.
