# The danger mode regrade — arm 3b, theme lane

Writer packet opened on `78f2a9ed2` (`git rev-parse HEAD` at start). Two
commits landed **during** this packet: the Card ground lot as `51fd557fc` and a
roadmap trail as `f8bd8ed88` (HEAD at hand-off). Every "before" reading below
was taken with the Card lot applied, so the baseline is the tree as it ships
now, not the tree the packet was written against; the roadmap commit touches no
file on the measurement path. The working tree also carried
other writers' uncommitted files throughout (`resize-handle`, causality test
edits, roadmap) — none of that is mine.

Harness: `tests/support/family-causality` — the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`), the resolved
source stylesheet plus one compiled arm in real Chromium, computed style read
back. Colours resolve through a probe node in the page's own cascade and are
read through a 1x1 canvas, because `color-mix()` serializes as
`color(srgb ...)` and a regex reports near-black for near-white.

Six scopes everywhere: the four gated `AXE_SCOPES` plus `rottay light` and
`evnto dark`.

---

## Headline

| | |
| --- | --- |
| Pairings measured | 40 per scope x 6 scopes = 240 cells |
| **Regressions (passing -> failing)** | **0** |
| Repaired (failing -> passing) | **49** |
| Channels moved, rottay/evnto light | 32 |
| Channels moved, rottay/evnto dark | 27 |
| Channels moved, bithire light / dark | 3 / 7 |
| `--ds-color-error` in DARK | **byte-identical in all three verticals** |

Both write-set extensions were approved on review, so the light-mode regrade of
the `--ds-color-error` ROLE **lands** rather than stopping. §5 keeps the
measurement chain that got it there: the role alone regresses 4 cells, the
`--ds-color-on-error` mode leg takes that to 2, and the tooltip on-ink line
takes it to 0.

---

## 1. What the defect actually is

Three separate statements were conflated under "the error inversion".

**(a) The ramp does not follow the mode.** The DS default restates its whole
NEUTRAL ramp in the dark block (`--ds-color-neutral-900: #171717 -> #f8fafc`)
and does not restate the STATUS ramps at all. So in dark,
`--ds-color-error-50` still resolved `#fef2f2` — a near-white wash — and
`--ds-color-error-700` still resolved `#b91c1c`, a dark ink for a dark ground.

A seeded tenant does not have this problem: bithire's compiler emits a fully
inverted dark error ramp from its own seed (`#1D0001` at 50 ... `#FFF2F0` at
900, artifact line 3142+). The DS default is the only palette in the package
whose status ramp is mode-blind.

**(b) `--ds-color-error: var(--ds-color-error-400)` at the light root** is the
consequence, not the cause: 400 is the dark-graded step, chosen at the light
root because there was no dark leg to state a light-graded one in. Its siblings
`--ds-color-success` and `--ds-color-warning` are both step **600**.

**(c) The Button's danger channels are ramp-relative and therefore correct for
bithire and wrong for the DS default.** `--ds-button-error-border` is the
quiet-danger INK (`skin/button/index.css:973-1024` paints it as `color`), and
it reads step 600. For bithire that is `#9C000F` light / `#F8675D` dark — both
pass. For the DS default it is `#dc2626` in both modes.

### Why (a) has to be repaired for (c) to have any fix at all

bithire's dark ramp is INVERTED and the DS default's is not, so the two
verticals disagree about which end of the ramp is the light end in dark:

| dark step | bithire | DS default (before) |
| --- | --- | --- |
| 300 | `#94000E` (dark) | `#fca5a5` (light) |
| 600 | `#F8675D` (light) | `#dc2626` (dark) |
| 700 | `#FF998E` (light) | `#b91c1c` (dark) |

**No ramp step is ink-correct on a dark ground in both verticals.** And a
literal cannot be used either: a `[data-theme='dark']` literal in the DS sheets
would overwrite bithire's correct compiled value, because bithire's artifact
states the ramp but not `--ds-button-error-*`. Inverting the DS default's dark
ramp is therefore not a nice-to-have — it is the only instrument in which a
dark leg can be written at all.

---

## 2. What landed

### 2.1 `foundation/themes/default/index.css`, dark block: the inverted error ramp

The light ramp read backwards, extended by one stop at the dark end
(`#450a0a`), so every pair that consumed two steps keeps its relationship:

```
--ds-color-error-50:  #450a0a;   --ds-color-error-500: #ef4444;
--ds-color-error-100: #7f1d1d;   --ds-color-error-600: #f87171;
--ds-color-error-200: #991b1b;   --ds-color-error-700: #fca5a5;
--ds-color-error-300: #b91c1c;   --ds-color-error-800: #fecaca;
--ds-color-error-400: #dc2626;   --ds-color-error-900: #fee2e2;
```

Step 500 is the pivot and does not move, which is why
`--ds-button-error-bg`, `--ds-border-color-error`,
`--ds-input-error-border-color` and the whole solid-fill rest state are
byte-identical.

### 2.2 `:root`: the role moves to step 600, and the dark block says nothing

```
:root { --ds-color-error: var(--ds-color-error-600); }   /* was error-400 */
```

Step 600 is what `--ds-color-success` and `--ds-color-warning` already state;
400 was the dark-graded stop sitting at the LIGHT root because there was no
dark leg to put a light-graded one in. The dark block deliberately does **not**
restate the role: against the inverted ramp, step 600 resolves `#f87171` there
— exactly what the role has always painted — so a restatement would be the
"no-op duplicate or silent repaint" this file's own `--ds-color-*-ink` docblock
rules out. Measured: `--ds-color-error` is absent from the dark census diff in
all three verticals, and moves `#f87171 -> #dc2626` in rottay/evnto light only.

`--ds-color-on-error` follows the fill it is graded against: `#ffffff` at
`:root` (the WCAG pick on `#dc2626`, 4.83 vs 3.71) and `#171717` restated in
the dark block (6.48 on the unchanged `#f87171`). §5 shows what happens without
that leg.

### 2.3 `presentation/components/button/index.css`: the danger ink one step deeper

```
--ds-button-error-border:        var(--ds-color-error-700);  /* was 600 */
--ds-button-error-border-hover:  var(--ds-color-error-800);  /* was 700 */
--ds-button-error-border-active: var(--ds-color-error-900);  /* was 800 */
```

These three ARE the quiet-danger ink, and a quiet-danger ink sits on a
tone-tinted wash, not on bare paper. Step 600 measured **4.35:1** on the
file-manager's 7 % ghost wash in rottay/evnto light — the exact row arm 3a
stopped on. Step 700 measures **5.75**. In dark, under the inverted ramp, the
same declaration resolves `#fca5a5` and measures 7.31. One declaration per
state, correct in all six scopes, no literal, no per-vertical branch.

### 2.4 Same file, new dark block: the solid fill keeps its dark-graded steps

```
:where(:root, [data-ds-root]):is([data-theme='dark'], .dark) {
  --ds-button-error-bg-hover:  var(--ds-color-error-400);
  --ds-button-error-bg-active: var(--ds-color-error-300);
}
```

Required by the inversion: 600/700 become the LIGHT end in dark, and
`--ds-button-error-color` is a mode-blind `--ds-color-white`, so without this
the solid danger button's hover would have put a white label on `#f87171`
(2.77:1). For rottay/evnto the new steps resolve `#dc2626`/`#b91c1c` — the
values this recipe has always painted, byte-identical. For bithire they resolve
`#BC1D20`/`#94000E`, which **repairs a pre-existing failure nobody had
measured**: bithire's solid danger hover was white on `#F8675D` at **2.96:1**
and its pressed state white on `#FF998E` at **2.06:1**.

---

## 3. The two declarations outside the packet's literal write set

Both approved on review. §3.1 is the neutral ground the danger ink is painted
on; §3.2 is the tooltip's on-ink. Neither is optional and both are one line.

### 3.1 `--ds-button-default-bg`

```
-  --ds-button-default-bg: var(--ds-color-white);
+  --ds-button-default-bg: var(--ds-material-control-background);
```

Same file, but a neutral channel rather than an error channel. **It is not
optional, and the control row proves why.**

`default`/`outline` are two of the six quiet variants the danger recipe paints
on, and their ground is that literal white. Any correct dark leg for the danger
ink — ANY light-graded value — fails on it. Measured, with the ground left
alone:

| scope | quiet-danger on the default ground | before | after |
| --- | --- | --- | --- |
| rottay/evnto dark, rest | `#dc2626` -> `#fca5a5` on `#ffffff` | 4.83 ok | **1.90 FAIL** |
| rottay/evnto dark, hover | `#b91c1c` -> `#fecaca` on `#ffffff` | 5.83 ok | **1.30 FAIL** |

And the control, byte-identical before and after, in **every** dark scope
including bithire:

| `btn-default/neutral-label` | before | after |
| --- | --- | --- |
| rottay/evnto/bithire dark | `#f8fafc` on `#ffffff` **1.05** | **1.05** |

The surface this regression lands on is one whose OWN primary label measures
1.05:1 — a white pill carrying near-white text on a dark canvas. The 4.83 it
reported was two mode-blind values agreeing by accident, not a working state.
This is the third instance of one defect class, with two landed precedents:
the Input ground (`0d4e4da81`) and the Card ground (`51fd557fc`, this week).

`--ds-material-control-background` was chosen over a literal or a new dark
block because the channel's own `-hover` and `-active` siblings **already** read
that family, and it measures `#ffffff` in all three light scopes — so the
repair is **byte-identical in every light scope** and moves only the three dark
ones (`#0F0F12` rottay/evnto, `#0c0c0c` bithire). It repairs 5 further cells:
the 1.05 control in three dark scopes and bithire's two already-failing
default-danger cells (2.96 -> 9.50, 1.85 -> 12.53).

**If the DT rejects this declaration, the lot STOPS**: there is then no dark
leg for the quiet-danger ink that holds the floor, for the same reason §1 gives
— the instrument does not exist.

Sighted (`captures/{head,after-landing}/rottay-dark.png`): at HEAD the "Tooltip
anchor" and "Remove" buttons are white pills whose labels are invisible; after,
they are dark pills with legible labels, and the danger label on "Remove" is a
legible pale red instead of a dark red on white.

### 3.2 `--ds-tooltip-error-color`, in the tooltip derivation

```
-  vars["--ds-tooltip-error-color"] = "var(--ds-color-text-on-primary)";
+  vars["--ds-tooltip-error-color"] = "var(--ds-color-on-error)";
```

The ERROR surface was handed the PRIMARY's on-ink. The derivation contradicts
the foundation sheet's own statement two layers down —
`themes/default/index.css:1242` already declares
`--ds-tooltip-error-color: #ffffff` — and the governed channel for that surface,
`--ds-color-on-error`, exists in the catalog (`palette.contrast-posture`
produces it) and in bithire's artifact. The pairing **already fails today**:
white on `#f87171` measures **2.77:1** in rottay dark and evnto dark.

Measured, before -> after this lot: rottay/evnto **dark** 2.77 -> **6.48**
(the ink flips to `#171717`, the WCAG pick on that fill); rottay/evnto
**light** 7.07 -> **4.83** with the ink now `#ffffff` on the regraded
`#dc2626` — above the floor, where every other candidate ink on that fill is
not. Without this line the role regrade regresses that light cell to 4.05
(§5). bithire is byte-identical in both modes: its artifact states
`--ds-color-on-error: #ffffff`, the same value its `--ds-color-text-on-primary`
already resolved.

The sibling lines for `success` and `warning` carry the identical defect and
are **deliberately untouched** — registered as follow-ups, outside this lot.

---

## 4. The table

Full 40-pairing x 6-scope before/after is `probe/table-landing.txt`; the
machine scan is `probe/scan-landing.txt`. The 49 repaired cells, grouped:

**From the ramp + Button legs (27 cells)**

| pairing | scopes | before -> after |
| --- | --- | --- |
| `btn-quiet/rest-on-fm-wash` | rottay/evnto **light** | 4.35 -> 5.75 |
| `btn-quiet/rest-on-fm-wash` | rottay/evnto dark | 3.18 -> 7.31 |
| `btn-quiet/rest-on-card` | rottay/evnto dark | 3.30 -> 8.39 |
| `btn-quiet/hover` | rottay/evnto dark | 2.31 -> 10.34 |
| `btn-quiet/pressed` | rottay/evnto dark | 1.67 -> 11.39 |
| `btn-ghost-danger/rest` | rottay/evnto dark | 3.30 -> 8.39 |
| `btn-default-danger/rest` | bithire dark | 2.96 -> 9.50 |
| `btn-default-danger/hover` | bithire dark | 1.85 -> 12.53 |
| `btn-default/neutral-label` | rottay/evnto/bithire dark | 1.05 -> 18.29 / 18.70 |
| `btn-solid/hover` | bithire dark | 2.96 -> 6.30 |
| `btn-solid/active` | bithire dark | 2.06 -> 9.27 |
| `error-ink/on-error-bg` | rottay/evnto dark | 2.53 -> 5.84 |
| `detail-panel/600-on-50` | rottay/evnto dark | 4.41 -> 5.84 |
| `toast-error/700-on-card` | rottay/evnto dark | 2.46 -> 8.39 |
| `modal-icon/role-on-100` | rottay/evnto dark | 2.26 -> 3.62 (3:1 floor) |

**From the role regrade and its two on-ink legs (22 more cells)**

| pairing | scopes | before -> after |
| --- | --- | --- |
| `error-ink/on-canvas` | rottay/evnto **light** | 2.65 -> 4.63 |
| `error-ink/on-card` | rottay/evnto light | 2.77 -> 4.83 |
| `form-error/on-input-bg` | rottay/evnto light | 2.65 -> 4.63 |
| `statistic-negative/on-card` | rottay/evnto light | 2.77 -> 4.83 |
| `menu-danger/on-menu-bg` | rottay/evnto light | 2.60 -> 4.55 |
| `alert-danger/ink-on-well` | rottay/evnto light | 3.67 -> 5.64 |
| `error-fill/white-ink` | rottay/evnto light | 2.77 -> 4.83 |
| `error-fill/vs-canvas` | rottay/evnto light | 2.65 -> 4.63 (3:1 floor) |
| `radio-error-ring/vs-input-bg` | rottay/evnto light | 2.77 -> 4.83 (3:1 floor) |
| `modal-icon/role-on-100` | rottay/evnto light | 2.26 -> 3.95 (3:1 floor) |
| `tooltip-error/ink-on-fill` | rottay/evnto **dark** | 2.77 -> 6.48 |

`tooltip-error/ink-on-fill` in rottay/evnto **light** moves 7.07 -> 4.83: still
above the floor, and the only ink on the regraded fill that stays there (§5).

### Pairs that move but do not cross a floor, reported for honesty

- `activity-icon-box/ink-on-100`: rottay/evnto dark 2.26 -> 3.62 (the ground
  moved under a role that is pinned in dark), rottay/evnto light 2.26 -> 3.95
  (the role moved under a ground that did not). Still under the 4.5 text floor
  in both; the recipe pairs the role ink with the 100 step and needs its own
  packet.
- `tag-subtle/500-on-100` (rottay/evnto dark): 3.08 -> 2.66. Both fail. The tag
  subtle recipe pairs step 500 (the pivot, which does not invert) with step 100
  (which does), so the pair opens slightly. Registered, not repaired: it is the
  Tag family's recipe, not a channel in this write set.
- `card-error/200-rim-on-50` (rottay/evnto dark): 1.32 -> 1.94. Both fail.
- `card-error/50-vs-card` (rottay/evnto dark): 14.55 -> 1.01, no floor. The
  error card's wash stops being a near-white panel on a dark canvas and becomes
  a dark-red one; its rim (1.94) and its 5.84 body ink carry the signal. This
  is the intended direction but it is a real visual change and it is the one
  cell in this lot where "correct" also means "much quieter".

### Pairs that were already failing and this lot does not touch

`error-ink/on-canvas` and `error-ink/on-card` in **bithire dark** (3.52/2.83),
`error-fill/white-ink` in bithire (byte-identical, its own seed),
`btn-solid/rest` (3.76 in rottay/evnto, both modes — the solid label is
`--ds-color-white`, not the governed on-tone ink), `alert-danger/ink-on-well`
in bithire dark. §6 names their owners.

---

## 5. The light regrade of the `--ds-color-error` role, and why it needs both legs

`:root` now states `--ds-color-error: var(--ds-color-error-600)` — the stop
`--ds-color-success` and `--ds-color-warning` already use. The dark block does
NOT restate it: step 600 against the inverted ramp is the same `#f87171` the
role has always painted there, so the role is measured **byte-identical in all
three dark scopes** and the move is a light-mode move only.

### Why it could not land alone

Two pairings constrain `L(--ds-color-error)` in rottay/evnto light in opposite
directions, and **at HEAD both ends are fixed**:

- **tooltip**, ink `#0c0c0e` on the error fill, 7.07:1 -> needs `L >= 0.1872`
- **the 126 bare ink sites**, the same colour as `color` on `#ffffff` -> needs
  `L <= 0.1833`

No value satisfies both. The margin is 0.004 and it is real: a value at
`L = 0.185` measures 4.46 and 4.47, both under 4.5. On the error wash
`#fef2f2` the ink side needs `L <= 0.1633`, so the gap widens rather than
closes. The conflict is not about the red — it is that **one channel was
serving as both the ink and the fill**, with two different inks accidentally
sitting on it.

### The three-arm series, drilled at the same 40 pairings

Arm A is the ramp + Button legs (§2) with the role untouched. Each arm adds one
declaration and is measured through the same door; the JSON and the machine
scans are in `probe/`:

| arm | adds | repaired | regressed |
| --- | --- | --- | --- |
| A -> B (`scan-arm-b-role600.txt`) | `--ds-color-error: error-600` | 20 | **4** — `error-fill/on-tone-ink` 6.48 -> 3.71 and `tooltip-error/ink-on-fill` 7.07 -> 4.05, each in rottay light and evnto light |
| A -> C (`scan-arm-c-plus-on-error.txt`) | + the `--ds-color-on-error` mode leg (`#ffffff` light, `#171717` dark) | 20 | **2** — the tooltip row only |
| A -> landed (`scan-arm-final-plus-tooltip.txt`) | + the tooltip on-ink line (§3.2) | **22** | **0** |

Each regression has exactly one cause and one repair:

- `error-fill/on-tone-ink` fell because `--ds-color-on-error: #171717` was
  graded for the OLD fill `#f87171`. On `#dc2626` the WCAG pick is white
  (4.83 vs 3.71), so the channel owes a mode leg — and in dark, where the fill
  is unchanged, it keeps `#171717` at 6.48. Both declarations are inside this
  write set.
- `tooltip-error/ink-on-fill` fell because the tooltip derivation hands the
  ERROR surface the PRIMARY's on-ink (§3.2). Pointing it at the governed
  `--ds-color-on-error` clears it at 4.83 in light and **repairs the dark row
  it was already failing**, 2.77 -> 6.48.

The last two cells of the A -> landed column are that dark tooltip repair,
which is why the final arm reports 22 rather than 20.

### The evidence defect this round corrected

The previous hand-off shipped `probe/scan-stopped-role-leg.txt` and
`probe/scan-stopped-role-leg-no-on-error.txt`, which were Node `TypeError`
traces rather than scans: the arm JSONs carried 36 pairings and the scanner
indexed a 40-pairing key set. Both files are **deleted**, along with the two
36-pairing arm JSONs that produced them. The replacement series above was
re-measured from scratch at 40 pairings, and the scanner now intersects the two
key sets and prints what is not comparable instead of crashing on it.

---

## 6. What this lot cannot reach, named

1. **bithire's status seed has no dark leg, and cannot get one today.**
   `--ds-color-error` is the RAW seed `#C62828` in bithire dark (the seeds cross
   modes as brand identity), measuring 3.52 on its canvas and 2.83 on a card.
   The compiler's own docblock states the bar:
   *"the document door refuses per-mode seeds by name, because the kit opens
   per-mode adjustment only as `SanctionedOverrides`, which carry chrome and
   nothing else"* (`derivation/modes/index.ts`). The catalog has no row for it
   (`palette.dark-mode` writes `backgroundMode` and nothing else), and the
   catalog is the DT window. So the packet's "bithire/evnto vertical presets
   (dark legs only)" half is **not expressible** and no preset file was touched.
   The structural fix is that `derivePaletteSemanticChannels` assigns the raw
   seed to `--ds-color-error` while the ramp beside it is ground-checked per
   mode — a compiler row, not a preset row.
2. **evnto authors no palette at all.** Its document carries no
   `palette.seeds` and no `palette.status-seeds`, so it inherits the DS default
   wholesale and the theme edit above IS its fix. No preset edit was needed or
   made.
3. **The ink/fill conflation is still live in the name, if no longer in the
   numbers.** `--ds-button-error-border` is a border name doing ink duty, and
   `--ds-color-error` is a role that is both an ink and a fill. Both are why
   §5 needed three arms rather than one. Giving the quiet-danger ink its own
   channel means touching the Modern button skin's three `color:` sites, which
   is outside this write set; the grades chosen here hold every measured
   pairing without it.
4. **`--ds-button-error-color: var(--ds-color-white)`** ignores the governed
   `--ds-color-on-error` and keeps the solid danger label at 3.76:1 in
   rottay/evnto, both modes, unchanged by this lot. It is the same defect the
   tooltip line (§3.2) repairs, in a channel this lot does not open.
5. **`--ds-tooltip-{success,warning}-color`** carry the identical defect to
   §3.2 — both read `var(--ds-color-text-on-primary)` for a non-primary tone
   surface — and were deliberately left alone under the review's instruction.
   Registered as follow-ups; neither tone's fill is mode-graded yet, so neither
   is urgent in the way error was.

---

## 7. Regeneration owed (DT window)

**One channel, three files.** The tooltip derivation change (§3.2) makes the
committed artifacts stale, and the artifact oracle says so by name:

```
--ds-tooltip-error-color: artifact=var(--ds-color-text-on-primary)
                          compiled=var(--ds-color-on-error)
```

identically for rottay, bithire and evnto
(`facade/artifacts/<vertical>/index.css`, line 2868 / 2707 / 2707). That single
line is the whole delta — the oracle reports an array of length 1 per vertical
and nothing else. Generated artifacts are outside this write set, so they were
not regenerated here; `pnpm -C packages/core` artifact regeneration clears the
three `the lowering reproduces the committed artifact channels` rows counted in
§8.

The CSS half owes nothing: `facade/artifacts/{rottay,evnto}/index.css` READ
`--ds-color-error` and the ramp without stating either, so they follow the
sheet; `facade/artifacts/bithire/index.css` states its own ramp, its own
`--ds-color-error` and its own `--ds-color-on-error`, and is untouched by every
CSS declaration in this lot.

---

## 8. Validation

| command | result |
| --- | --- |
| `pnpm exec tsc --noEmit` | **exit 0** |
| `vitest run` over `button`, `tooltip`, `alert-dialog`, `radio`, `alert`, `foundation/tokens` — with this lot | **10 failed / 968 passed** (91 files) |
| the same suites with the write set restored to HEAD (`cp` backup, no git operation) | **10 failed / 968 passed — the identical ten test names** |
| `vitest run` over `src/infrastructure/compilers/runtime/theme` — with this lot | **8 failed / 2709 passed** (122 files) |
| the same, with only the tooltip line reverted to HEAD | **5 failed / 2712 passed** |
| `vitest run --project integration` over `file-manager` + `button` | 6 files / 57 tests passed, incl. the file-manager `AXE_DEBT` pin and `Button.causality` |
| `vitest run --project integration` over `axe-debt-identity`, `cascade`, `customization-fields` | **3 files / 61 tests passed** |

The ten focal-suite failures are byte-identical in both arms and none of them
names a file in this write set: the command-palette reduce guard, three
`artifact is a generated build output`, three `artifact to neutral-preset
compile parity`, two `responsive channel sheet`, one `BulkSelectToggle stable
motion contract`.

The compiler suites are the one place this lot moves a count, and the A/B
isolates it exactly: **5 -> 8**, and the three new rows are
`the lowering reproduces the committed artifact channels > {rottay,bithire,evnto}`,
each asserting an array of length **1** naming `--ds-tooltip-error-color` and
nothing else. That is the regeneration §7 hands to the DT, not a defect. The
five that fail in both arms (`classic/surfaces.elevation-posture`, three
`emitThemeCss ... byte-identical to the reference grammar`, and the corpus
guard) are pre-existing.

**The file-manager's `AXE_DEBT` map does not move and is not supposed to.** Its
delete ink is still the family's own `color: var(--ds-color-error)` statement
until the FOLLOW-UP family half lands — though that statement now reads
`#dc2626` rather than `#f87171` in light, which is itself part of the repair.
`btn-quiet/rest-on-fm-wash` in §4 is the post-family-half reading, measured
here so the family half is mechanical: 5.75 / 7.31 / 10.69 / 6.82 / 5.75 / 7.31
across the six scopes, all clear.

---

## 9. Captures

`captures/{head,after-landing}/<vertical>-<mode>.png`, 2x DPR, full page:
solid danger at rest/hover/pressed, quiet danger at rest/hover/pressed, an
outline danger, an error Alert, and the file-manager twice — as it ships, and
with the FOLLOW-UP family half emulated in the page (`data-tone='danger'`
stamped on the delete Button and the skin's fill-role-as-ink statement
neutralised), clearly the right-hand section in every frame.
`captures/*/readings.json` carries the computed values behind each frame.

**Looked at, both folders, all twelve frames. Verdict: the measurements and the
pixels agree.** rottay dark: the quiet "Delete (hover)" and "Delete (pressed)"
labels go from unreadable dark-red-on-dark to legible pale pink; the white
"Tooltip anchor" and "Remove" pills become dark pills with legible labels; the
emulated family-half delete labels become pale pink. bithire dark: the solid
hover/pressed fills go from pale coral with white labels to dark red with white
labels. bithire light is unchanged apart from the quiet-danger label deepening one
ramp step. rottay light and evnto light carry that same step plus the role
regrade: the file-manager's own "Delete" labels — the LEFT-hand, as-it-ships
panel — go from the pale coral `#f87171` to a solid `#dc2626`
(`captures/after-landing/readings.json`, `fmTodayInk`), and the error Alert's
glyph and wash strengthen with them. The capture pipeline is not
pixel-deterministic (established in a previous lot), so no PNG diff is claimed;
every ratio above comes from the computed-style path, which is exact.

The error Tooltip bubble does **not** appear in the frames — `open` on a
top-layer popover does not render into the SSR string. Its two channels are
covered numerically instead (`tooltip-error/ink-on-fill`, §3.2 and §4): the
dark row is repaired 2.77 -> 6.48 and the light row stays above the floor at
4.83.

## 10. Probe

`probe/*.json` are the raw readings — `before.json` (HEAD), `arm-a-ramp-button`,
`arm-b-plus-role600`, `arm-c-plus-on-error` and `after-landing` (the landed
set) — all five at the same 40 pairings, so every `scan-*.txt` beside them is a
like-for-like comparison. `probe/_probe-error-regrade.test.tsx` and
`probe/_probe-error-capture.test.tsx` are the scratch suites that produced them
(run from `tests/integration/`, removed from the tree afterwards). The channel
census reads every `--ds-*` name the resolved source sheet declares — 4180-4209
per scope — computed at `:root`, so the blast-radius table is the sheet's own
vocabulary rather than a hand-kept list.
