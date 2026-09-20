# file-manager's last contrast rows — arms 2 and 3a

Writer packet opened on `ff71efc8c` (`git rev-parse HEAD` at start; the working
tree also carried another writer's uncommitted `display/{table,tree}` engines,
their two `*.state-stamp.test.tsx` and the roadmap files — none of that is
mine). Harness: `tests/support/family-causality` — the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`), the resolved
source stylesheet plus one compiled arm in real Chromium, computed style read
back. Colours are read through a 1x1 canvas, because `color-mix()` serializes
as `color(srgb ...)`; a regex reports near-black for near-white.

**Both arms STOP with the measurement.** Neither repair is reachable from this
packet's write set, and the packet's own prescribed repairs were drilled and
refuted — not assumed. `AXE_DEBT` is therefore unchanged; what landed is the
docblock correction Fable made a condition, now carrying the measured truth for
both rows instead of the two wrong attributions it held.

Six scopes are measured everywhere below: the four gated `AXE_SCOPES` plus
`rottay light` and `evnto dark`, because the previous lot found a defect hiding
in `evnto dark` precisely because no gate looks at it.

---

## Arm 2 — the crumb's ground is the Card component base, not the Breadcrumb

### What the crumb actually reads

| scope | `--ds-card-bg` | `--ds-surface-card` | `--ds-color-bg-elevated` | crumb ink / ground | ratio |
| --- | --- | --- | --- | --- | --- |
| rottay dark | **`#ffffff`** | `#182235` | `#182235` | `#f3f4f6` on `#ececec` | **1.07** |
| evnto dark | **`#ffffff`** | `#182235` | `#182235` | `#f3f4f6` on `#ececec` | **1.07** |
| bithire dark | `#182235` | `#182235` | `#182235` | `#f3f4f6` on `#1a2743` | 13.48 |
| rottay light | `#ffffff` | `#ffffff` | `#ffffff` | `#171717` on `#ececec` | 15.18 |
| bithire light | `#ffffff` | `#ffffff` | `#ffffff` | `#171717` on `#eef2fd` | 16.01 |
| evnto light | `#ffffff` | `#ffffff` | `#ffffff` | `#171717` on `#ececec` | 15.18 |

The chip's ground is
`color-mix(in srgb, var(--ds-color-primary) 8%, var(--ds-card-bg, var(--ds-surface-card)))`
(`derivation/chrome/breadcrumb/index.ts:104`). The `--ds-card-bg` leg resolves
**white in two dark scopes** while every mode-following card role beside it
resolves `#182235`. Read in the chip's own context, not only at the root, so
this is not an inheritance artefact.

### Root cause: layer ORDER, one declaration, and it is not this family's

- `presentation/components/card/index.css:24` states `--ds-card-bg: var(--ds-color-white)` — mode-blind, in the `rottay-components` layer.
- `foundation/themes/default/index.css:2091` states `--ds-card-bg: var(--ds-color-bg-elevated)` — correct, in the `rottay-tokens` layer, and therefore **dead**: a later layer wins over an earlier one regardless of specificity.
- bithire escapes because its compiled artifact is unlayered and re-aliases the name (`facade/artifacts/bithire/index.css:411`). rottay's and evnto's artifacts only READ `--ds-card-bg`.

This is byte for byte the defect the input ground was repaired for in
`0d4e4da81` (`--ds-input-bg: var(--ds-color-white)` at `input/index.css:79`,
shadowing the theme's dark restatement by layer order, with bithire escaping
through the same unlayered re-alias). Same owner tier, same escape, same shape.

### The row axe reports is the tip, not the defect

The whole trail paints white in those two scopes:
`--ds-breadcrumb-bg` is `linear-gradient(180deg, color-mix(... var(--ds-card-bg) ...), var(--ds-card-bg))`, measured
`linear-gradient(color(srgb 0.9727 0.9727 0.9727), rgb(255,255,255))` in rottay
dark. axe cannot evaluate a gradient ground, so only the flat current chip is
reported. `--ds-card-elevated-bg` and `--ds-card-bordered-bg` resolve `#ffffff`
in those scopes too — the Modern **Card itself** paints white in rottay dark and
evnto dark, under `--ds-card-color` `#f8fafc`.

Sighted, `captures/head/rottay-dark.png`: a white pill across the toolbar with
"Root" barely legible and "Workspace" invisible inside it.

### The prescribed paired ink, drilled and refuted

Both candidates applied inline on the real crumb (inline beats every layer) and
re-measured in all six scopes:

| candidate | rottay dark | evnto dark | bithire dark | bithire light | rottay/evnto light |
| --- | --- | --- | --- | --- | --- |
| today (`--ds-color-text-primary`) | 1.07 | 1.07 | 13.48 | 16.01 | 15.18 |
| `primary 72% into the ground` | 6.51 | 6.51 | **2.00** | **3.05** | 6.51 |
| `text-primary 72% into the ground` | **1.05** | **1.05** | 7.64 | 6.76 | 6.51 |

The fleet's governed quiet weight is the wrong instrument here and the numbers
say why: the crumb's ink is ALREADY correct and mode-following; it is the ground
that does not follow the mode. `primary 72%` wrecks bithire in both modes (the
crumb becomes a blue-on-blue chip); `text-primary 72%` does not even repair
rottay dark — mixing a near-white ink into a near-white ground stays near-white —
and moves every light scope off its current value, which the packet forbids.
Generally: any static mix that is byte-identical in the four correct scopes
reduces to `--ds-color-text-primary` itself, which is what the chip already
paints. **No paired ink can repair a ground defect.**

### What does repair it, measured

The one declaration, applied to the Card base in the working tree and measured
through the same door (then reverted — nothing outside the write set is left
changed):

| scope | crumb before | crumb after | moved? |
| --- | --- | --- | --- |
| rottay dark | `#f3f4f6` on `#ececec` **1.07** | `#f3f4f6` on `#182133` **14.63** | yes |
| evnto dark | `#f3f4f6` on `#ececec` **1.07** | `#f3f4f6` on `#182133` **14.63** | yes |
| bithire dark | 13.48 | 13.48 | byte-identical |
| bithire light | 16.01 | 16.01 | byte-identical |
| rottay light | 15.18 | 15.18 | byte-identical |
| evnto light | 15.18 | 15.18 | byte-identical |

The delete rows do not move under it (5.24 / 2.74 / 2.59 unchanged), so the two
arms are independent. Sighted: `captures/arm2-card-ground-fix/rottay-dark.png` —
the trail is dark, both crumbs legible, nothing else in the frame changes.

### Why the leg was NOT swapped inside the deriver

Reading `var(--ds-surface-card)` instead measures identically (the same table:
it is the same value in every scope where `--ds-card-bg` is correct), and it is
inside the write set. It was rejected:

1. it hides a fleet defect behind one family — the Card primitive itself and the
   pagination, segmented, stepper, collapse, menu, search, workspace-switcher,
   data-table-mobile and surface-section-card skins all keep reading the white;
2. it silently drops a governed tenant capability: `chrome.cardComponent.bg`
   compiles to `--ds-card-bg` and nothing else (`chrome-variables/index.ts:2497`),
   so a tenant that re-tints its card would stop carrying the breadcrumb with it.

The leg is therefore correct as written and stays. **Routed to the surfaces
lane**, with the arm-1 precedent as the adjudication: repair at the component
base, which makes bithire's artifact re-alias redundant rather than load-bearing.

### What the one declaration drains, measured across the fleet

The Card base was patched in the working tree, the causality suites run, and the
file restored byte-identically (`cp` backup, no git operation; `git diff` on it
is empty). Every pin went red as **good news failing closed** — a drain by
identity, no scope got worse, no new node appeared anywhere, every drained node
is in `rottay dark`:

| suite | pinned nodes before | measured after |
| --- | --- | --- |
| `Breadcrumb.causality` | `span[title="Current page"]` | `{}` |
| `Pagination.causality` | page button `:nth-child(7)`, `input`, `select` | `{}` |
| `Menu.causality` | horizontal top label, vertical top label, group label | `{}` |
| `PatternFileManager.causality` | both `data-current` crumb labels | key gone |

Nine pinned nodes in four suites, from one declaration. `Card`, `Collapse`,
`Segmented` and `Stepper` stayed green through the same run. `evnto dark` drains
with them and is counted nowhere, because it is not a gated scope.

The follow-up packet therefore has to re-pin those four suites in its own commit,
each with the cause named — the shape the input-ground lot already established.

### Not this family's row alone

`Breadcrumb.causality.integration.test.tsx` already pins the SAME node in the
same scope (`CONTRAST_GAP['rottay dark'] = { 'color-contrast': ['span[title="Current page"]'] }`),
registered under WO-DER-06 with a different and also incorrect attribution
("the chrome pair loses its authored half under neutral+preset"). The primitive
reproduces the defect with no file-manager in the page, which is the independent
confirmation that the owner is neither family.

---

## Arm 3a — the danger ink IS family-local; the governed replacement is not usable yet

### The premise, confirmed

`data-tone` measured **null** on every delete Button in all six scopes, so the
Button's governed quiet-destructive recipe never ran. The ink came from this
family: `skin/file-manager/index.css:209`, `color: var(--ds-color-error)` — the
FILL role used as an ink — and the ghost rest wash is
`color-mix(in srgb, currentColor 7%, transparent)`, so the same statement also
tinted the ground it is measured against. The pin's docblock claim that "the
family relays no colour into either" is false and is corrected in this packet.

### The prescribed repair, written and measured

`danger` on the delete Button (keeping `variant="ghost"`, which is what stamps
`data-tone='danger'` rather than the solid recipe) plus deletion of the skin
statement:

| scope | before | after | verdict |
| --- | --- | --- | --- |
| bithire dark | `#c62828` on `#242334` **2.74** | `#f8675d` on `#282738` **4.94** | repaired |
| bithire light | `#c62828` on `#fbf0f0` 5.04 | `#9c000f` on `#f8edee` 7.58 | improved |
| evnto light | `#f87171` on `#fff5f5` **2.59** | `#dc2626` on `#fdf0f0` **4.35** | still failing |
| rottay dark | `#f87171` on `#282839` 5.24 | `#dc2626` on `#262334` **3.18** | **regressed** |
| evnto dark | `#f87171` on `#282839` 5.24 | `#dc2626` on `#262334` **3.18** | **regressed** |
| rottay light | `#f87171` on `#fff5f5` 2.59 | `#dc2626` on `#fdf0f0` 4.35 | still failing |

Controls held: `rename`, `folderName` and the crumb are byte-identical in all
six scopes under this change.

### Why it cannot land alone

`--ds-button-error-border` is `var(--ds-color-error-600)` `#dc2626`
(`presentation/components/button/index.css:233`) and the DS default never
restates the error ramp or `--ds-color-error` in its dark block: the same value
serves both modes. bithire passes both modes only because it authors a status
seed that grades per mode (`#9C000F` light / `#F8675D` dark).

The impossibility is exact, not a judgement call. To clear 4.5:1 on the dark
ghost ground `#262334` (L = 0.0183) an ink needs L >= 0.257; to clear it on the
light ghost ground `#fdf0f0` (L = 0.897) it needs L <= 0.160. **No single value
satisfies both**, so no choice of ink at the call site, in the skin or in the
family deriver can empty these rows. The family's wrong statement was accidental
cover: `--ds-color-error` resolves to error-400 `#f87171` — a dark-graded red
sitting at the LIGHT root — which is why the dark scopes passed at HEAD.

The packet routes the mode-leg question to the theme lane (arm 3b) and asks for
the residual. The residual is: **evnto light 4.35 and rottay light 4.35 fail,
and rottay dark / evnto dark drop to 3.18**, all four for the same cause. Note
for that packet: mirroring the rung alone is not sufficient either — a dark leg
of error-400 fixes the dark scopes, but `#dc2626` on the light ghost wash is
still 4.35. The DS default's quiet-danger INK needs grading in BOTH modes
(bithire's authored `#9C000F` measures 7.58 on the same light ground). The
family half is ready and measured; it lands in the same packet, after.

Sighted: `captures/head/bithire-dark.png` (a dark red "DELETE" that reads as
disabled) vs `captures/arm3a-danger-stamp/bithire-dark.png` (legible), and
`captures/arm3a-danger-stamp/rottay-dark.png`, where the same change makes the
label visibly worse — the regression in a scope the packet fixed as an invariant.

---

## `f1-name`

Untouched and still registered, in both the map and the corrected docblock:
`variant="link"`, ink `--ds-color-link` `#3f6ffd` on bithire dark's card,
3.72:1. It is the link channel and belongs to neither arm.

---

## Captures

`captures/{head,arm3a-danger-stamp,arm2-card-ground-fix}/<vertical>-<mode>.png`,
2x DPR, the toolbar (trail + bulk action) and the first row's actions. The two
arm folders are the working tree with exactly that arm applied; `head` is the
tree with neither. **Looked at, all three folders. Verdict: the measurements and
the pixels agree** — the white trail in rottay/evnto dark, its repair under the
card-base arm with no other visible change, the bithire-dark delete label going
from unreadable to legible under the danger stamp, and the same stamp visibly
darkening the rottay-dark label. The capture pipeline is not pixel-deterministic
(established in the previous lot), so no PNG diff is claimed; every ratio above
comes from the computed-style path, which is exact.

## Probe

`probe/*.json` are the raw readings; `probe/_probe-fm-contrast.test.tsx` and
`probe/_probe-fm-capture.test.tsx` are the scratch suites that produced them
(run from `tests/integration/`, removed from the tree afterwards). The ground
arms carry a non-vacuity flag: `applied` is true in exactly the two broken
scopes and false in the four where the new ground is byte-identical. An earlier
pass of that drill read the arm mid-transition — Chromium serializes an
interpolated colour as `oklab(...)`, which looked like "the arm did nothing";
the drill now pins `transition: none` before reading.

---

## Validation

| command | result |
| --- | --- |
| `vitest run src/components/patterns/data/file-manager src/components/primitives/navigation/breadcrumb` (unit) | **12 files / 116 tests passed** |
| `vitest run --project integration` over the same two families | **3 files / 28 tests passed** (incl. the file-manager axe pin and `Breadcrumb.causality`) |
| `pnpm exec tsc --noEmit` | exit 0 |
| card-base drill: `--project integration` over `Breadcrumb`, `PatternFileManager`, `Menu`, `Pagination` **with the one declaration patched** | 4 files / 4 tests failed — all four the drain above, `41 passed` |
| the same four suites after restoring the file | **4 files / 45 tests passed** — the control: nothing of mine is left in the tree but the docblock |

## What landed, and what did not

Landed: the corrected docblock on `AXE_DEBT` in
`PatternFileManager.causality.integration.test.tsx`. Nothing else. No deriver,
no skin, no call site, no map entry, no changeset — a changeset would have named
a channel this packet did not add.

Written, measured and reverted (kept here so the follow-up packets are
mechanical rather than re-derived):

- arm 3a's family half — `danger` on the delete `ModernButton` in
  `file-manager/engines/modern/index.tsx` and the deletion of
  `skin/file-manager/index.css`'s `color: var(--ds-color-error)` — with the
  six-scope table above. It belongs in the same packet as the danger-ink mode
  leg, after it.
- arm 2's ground — `--ds-card-bg: var(--ds-color-bg-elevated)` at
  `presentation/components/card/index.css:24` — with its six-scope table and its
  four-suite drain.

## Left to the DT

1. **Surfaces lane, arm 2.** One declaration at the Card component base; the
   theme already states the correct value one layer down and it is dead. Blast
   radius: the Card primitive plus the pagination, segmented, stepper, collapse,
   menu, search, workspace-switcher, data-table-mobile and surface-section-card
   skins — every reader of `--ds-card-bg` in rottay and evnto. Four causality
   pins must be re-pinned in the same commit.
2. **Theme lane, arm 3b, now with a sharper brief than "add a dark leg".** The
   DS default's quiet-danger INK needs grading in BOTH modes: a dark leg for the
   dark scopes AND a darker light rung, because `--ds-color-error-600` `#dc2626`
   measures 4.35:1 on the light ghost wash it has to sit on. bithire's authored
   `#9C000F` measures 7.58:1 on the same ground and is the shape to copy.
   `--ds-color-error` itself is also consumed as a FILL (`--ds-tooltip-error-bg`,
   `--ds-radio-error-border-color`, `--ds-alert-dialog-icon-bg`, every
   `--ds-color-alpha-error-*` mix), so the ink and the fill need separating
   before either is regraded.
3. `Breadcrumb.causality`'s `CONTRAST_GAP` carries a wrong attribution for the
   same node ("the chrome pair loses its authored half under neutral+preset",
   WO-DER-06). It is the Card base. Not corrected here: that pin is another
   family's file and outside this write set.
