# The supporting-ink floor — the light ladder is re-graded at its producer

Writer packet opened on `12894ff111d5fe83054a716356d70986d97969d6`
(`git rev-parse HEAD` at start). HEAD did not move during the packet. The
working tree carried another writer's uncommitted `collection-header`
adaptation work throughout (`src/components/structures/headers/collection/`,
`foundation/contracts/kernel/adaptation/composition/families/{registry,collection-header}/`)
— **none of that is mine**; read the diff as a subset.

A second writer's motion-dial work landed in the tree DURING the packet
(`lowering/runtime/derivation/motion/index.ts`,
`tests/integration/motion-vocabulary/`, and the two generated sheets
`foundation/animations/transitions/index.css` and
`runtime/engines/modern/compiled/index.css`, all carrying
`--ds-motion-duration-scale`). Those two generated sheets were briefly
rewritten to HEAD bytes here on the mistaken reading that a gate run had
produced them — the mtimes coincided with a `structure:check` /
`theme-parity:check` pair. They were parked before being touched and are
restored **byte-identical** (`diff -q` clean against the parked copies). No
foreign work was lost and none of it is mine.

Routed from WO-FAM-10's pinned `section-card-description`
(`evidence/wo-fam-10-ledger/RESULTS.md`): the surface could not repair its own
supporting ink because every supporting role resolved into the same failing
grey band. That reading is confirmed below, and the repair is made where the
band is produced.

Harness: `tests/support/family-causality` — the productive door
(`documentThemeIntent -> compileThemeIntent -> emitThemeCss`), the resolved
source stylesheet plus one compiled arm in real Chromium, computed style read
back. Colours resolve through a probe node in the page's own cascade and are
read through a 1x1 canvas, because `color-mix()` serializes as
`color(srgb ...)` and a regex reports near-black for near-white. Six scopes:
three first-party verticals x light/dark.

---

## Headline

| | |
| --- | --- |
| Cells measured | 4 rungs x 15 grounds x 6 scopes = **360** |
| **Repaired (fail -> pass)** | **164** |
| **Regressions (pass -> fail)** | **0 real** (4 probe cells with no consumer, §5) |
| Dark ink cells moved | **0** — byte-identical in all three verticals |
| Family axe pins drained | **12** (6 nodes x bithire light + evnto light) |
| Gate delta vs HEAD | **1** red, the hand-pinned literal map (§7) |

---

## 1. What the defect is

`:root` in `foundation/themes/default/index.css` is the LIGHT scope; `html.dark`
restates the ramp for dark. The three supporting rungs were literals on that
light root:

```
--ds-color-text-secondary: #A0A0A5;
--ds-color-text-tertiary:  #9A9AA2;
--ds-color-text-muted:     #96969E;
--ds-color-text-subtle:    var(--ds-color-text-muted);
```

Measured, not restated: bithire and evnto author **none** of the three
(`grep` over both `document/index.json` and `index.ts` returns nothing), and
the probe reads the identical trio in all three verticals. **One producer.**

Two separate faults, both measured:

**(a) Nothing clears the floor.** Before the change, all 4 rungs failed 4.5:1
on all 15 grounds in all three light scopes — 180 failing cells, worst 2.07:1.

**(b) The ladder is inverted in light.** `secondary` was the LIGHTEST of the
three, so it carried the LEAST contrast. The emphasis order is the opposite,
and the package states it in its own skin —
`runtime/engines/modern/skin/cockpit-header`:

| node | ink |
| --- | --- |
| `[data-part='subtitle']` | secondary |
| `[data-part='crumb'][data-interactive='false'][data-last='true']` (current page) | secondary |
| `[data-part='crumb'][data-interactive='false'][data-last='false']` (ancestor) | muted |
| `[data-part='crumb'][data-interactive='true'][data-state~='hovered']` | secondary |
| `[data-part='eyebrow']`, `[data-part='separator']` | muted |

A breadcrumb goes muted -> secondary **on hover**. Before this lot that hover
made the crumb *lighter* — 2.94:1 -> 2.60:1. The interaction reduced contrast.

**Why.** The W8 comment claimed the ladder was levelled to APCA
`50.9 > 47.9 > 45.8` with `#6B6B72 measured 25.3`. Re-measured on the light
page ground those values are `50.9 < 53.8 < 55.8`, and `#6B6B72` reads Lc 76.3.
Only the first number reproduces. Lc 25.3 for `#6B6B72` reproduces against a
DARK ground — W8 levelled the ladder against the root as it then was and the
values stayed after `:root` became the light scope. APCA Lc 45 is also not a
WCAG 1.4.3 pass; the AA floor is the 4.5:1 ratio, which 45 does not imply.

## 2. Blast radius — the consumer table

Direct source references to the four rungs, by property (`src/**/*.css`,
excluding the generated `facade/artifacts/`):

| rung | `color` | `fill` | `background` | `border-*` | derived `--ds-*` channels |
| --- | --- | --- | --- | --- | --- |
| `--ds-color-text-secondary` | 353 | 14 | 4 | 6 | 33 |
| `--ds-color-text-tertiary` | 50 | 0 | 2 | 0 | 3 |
| `--ds-color-text-muted` | 325 | 0 | 9 | 14 | 13 |
| `--ds-color-text-subtle` | 6 | 0 | 0 | 0 | — |

**734 direct text sites** and **49 derived channels** (channel count identical
before and after: every one still follows its rung, none decoupled). By owner:
`runtime/engines/modern` 305, `presentation/components/skin` 342,
`runtime/engines/rustic` 179, `components/**` ~60.

The 52 non-`color` uses — 14 `fill` (icon foreground), 15 `background`,
23 `border-*` — are all small marks — the activity-log dot, the
data-terminal crop rules, the pricing-table dotted rule, the user-profile and
presence dots, the checkbox hover rim, low-alpha `color-mix` washes in
`form-sections` (14%/22%/24%) and `record` (16%/28%). As non-text objects and icon
foreground they owe 3:1, and each moves from ~2.9:1 to ~5.3:1 on a card —
repaired, not regressed. They do get visually heavier; the sighted pass (§9)
covers the form and table cases.

The generated vertical artifacts **do not declare the rungs** (grep for
`--ds-color-text-{secondary,tertiary,muted,subtle}:` over
`facade/artifacts/*/index.css` returns nothing); the three references they do
carry are `var()` reads that resolve live. **No artifact regeneration is
needed for this change to land.**

## 3. The re-grade

Constant chroma and hue across the three rungs and against the previous
`--ds-color-text-muted`, so the Quiet Premium cool-neutral tint is unchanged;
only lightness moves. `subtle` keeps following `muted`. (The absolute OKLCH
conversion values are deliberately not quoted here: two independent readers
measured different absolute C/h while agreeing the three rungs share one
chroma/hue and the previous muted within noise — the constancy claim is what
holds, and the WCAG tables below carry the verifiable numbers.)

| rung | before | after | OKLCH L | rank |
| --- | --- | --- | --- | --- |
| `--ds-color-text-secondary` | `#A0A0A5` (L 70.7) | **`#5A5A61`** | 47 | strongest |
| `--ds-color-text-tertiary` | `#9A9AA2` (L 68.9) | **`#62626A`** | 50 | |
| `--ds-color-text-muted` | `#96969E` (L 67.6) | **`#6B6B72`** | 53 | weakest |
| `--ds-color-text-subtle` | follows muted | follows muted | 53 | |

`#6B6B72` is the pre-W8 `muted` — the ladder returns to the ray it was levelled
off.

**Rank.** Steps are a uniform 3 OKLCH L, against 1.86 / 1.30 before: the ranks
are 1.6x further apart than they were, not collapsed. The emphasis direction
now matches dark in both modes — `secondary` carries the most contrast in
light (6.84:1) exactly as it does in dark (12.61:1). Read as raw lightness the
two modes are mirrored, which is what a mode flip means; read as emphasis they
agree, which is what the consumers (§1) ask for.

**Hierarchy.** `text-primary` is untouched at `#171717`, 17.93:1 on a card;
secondary at 6.84:1 is 2.6x quieter, 26.5 OKLCH L away. Nothing is close to
collapsing into primary.

## 4. Per-scope proof — before -> after, every rung on every ground

#### bithire light

| ground | secondary | tertiary | muted / subtle |
| --- | --- | --- | --- |
| `canvas` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `card` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `elevated` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `input` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `popover` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `drawer` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `surface` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `menu` #f9fafe | 2.50 -> **6.56** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `bg-secondary` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `bg-subtle` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `bg-hover` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `table-header` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `panel` #e5e5e5 | 2.07 -> **5.43** | 2.22 -> **4.80** | 2.33 -> **4.20** FAIL |
| `bg-tertiary` #e5e5e5 | 2.07 -> **5.43** | 2.22 -> **4.80** | 2.33 -> **4.20** FAIL |
| `sidebar` #171717 | 6.89 -> **2.62** FAIL | 6.42 -> **2.97** FAIL | 6.11 -> **3.39** FAIL |

#### evnto light

| ground | secondary | tertiary | muted / subtle |
| --- | --- | --- | --- |
| `canvas` #fafafa | 2.49 -> **6.55** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `card` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `elevated` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `input` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `popover` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `drawer` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `surface` #fafafa | 2.49 -> **6.55** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `menu` #f8f8f8 | 2.45 -> **6.44** | 2.63 -> **5.69** | 2.76 -> **4.98** |
| `bg-secondary` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `bg-subtle` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `bg-hover` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `table-header` #fafafa | 2.49 -> **6.55** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `panel` #e5e5e5 | 2.07 -> **5.43** | 2.22 -> **4.80** | 2.33 -> **4.20** FAIL |
| `bg-tertiary` #e5e5e5 | 2.07 -> **5.43** | 2.22 -> **4.80** | 2.33 -> **4.20** FAIL |
| `sidebar` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |

#### rottay light

| ground | secondary | tertiary | muted / subtle |
| --- | --- | --- | --- |
| `canvas` #fafafa | 2.49 -> **6.55** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `card` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `elevated` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `input` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `popover` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `drawer` #ffffff | 2.60 -> **6.84** | 2.79 -> **6.04** | 2.94 -> **5.29** |
| `surface` #fafafa | 2.49 -> **6.55** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `menu` #f8f8f8 | 2.45 -> **6.44** | 2.63 -> **5.69** | 2.76 -> **4.98** |
| `bg-secondary` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `bg-subtle` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `bg-hover` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |
| `table-header` #fafafa | 2.49 -> **6.55** | 2.68 -> **5.79** | 2.81 -> **5.07** |
| `panel` #e5e5e5 | 2.07 -> **5.43** | 2.22 -> **4.80** | 2.33 -> **4.20** FAIL |
| `bg-tertiary` #e5e5e5 | 2.07 -> **5.43** | 2.22 -> **4.80** | 2.33 -> **4.20** FAIL |
| `sidebar` #f5f5f5 | 2.39 -> **6.27** | 2.56 -> **5.54** | 2.69 -> **4.85** |

Dark, all three verticals: `secondary #cbd5e1`, `tertiary`/`muted`/`subtle`
`#94a3b8` — **the same bytes before and after**. The dark block restates the
three rungs against its own ramp, so a light-root literal cannot reach it; the
probe confirms 0 of 180 dark ink cells moved. The four dark `popover #ffffff`
and `table-header #fafafa` failures in the table are mode-blind GROUND channels
(`--ds-popover-bg`, `--ds-table-header-bg` are not restated in the dark block),
pre-existing and unchanged. Not this lot's; named in §8.

## 5. The four "regressions" have no consumer

The only pass -> fail cells in 360 are `bithire light / sidebar #171717`:
6.89 -> 2.62, 6.42 -> 2.97, 6.11 -> 3.39, 6.11 -> 3.39. bithire inverts its
sidebar (a dark rail in light mode), so a darker ink loses contrast there.

No supporting rung paints on that ground:

- `--ds-sidebar-bg` is used as a background in exactly one skin,
  `presentation/components/skin/app-shell` (plus the artifacts).
- `app-shell/index.css` contains **zero** references to the four rungs. Its
  navigation ink comes from the sidebar's own channels, `--ds-sidebar-text`
  and `--ds-sidebar-text-muted: var(--ds-color-neutral-400)` — untouched here.
- `sidebar-surface`, `navigation-static` and `page-shell-surface` contain zero
  references to the four rungs.
- The one `collection-shell` hit (line 125) is a 24% particle in an
  `ambient-field` decoration, not text and not on the sidebar ground.

The cells are a cross-product of the probe, which multiplies every rung by
every ground by design so the blast radius is complete rather than sampled.
**Real regressions: 0.**

## 6. The pins drain — measured by axe, not asserted

`GuidedDraftForm.causality.integration.test.tsx` pins its debt by node
IDENTITY. Running it on this tree:

| scope | pinned before | measured after | drained |
| --- | --- | --- | --- |
| bithire light | 7 | **1** | 6 |
| evnto light | 7 | **1** | 6 |
| bithire dark | 2 | 2 | 0 |
| rottay dark | 1 | 1 | 0 |

Drained in both light scopes — `p[data-part="section-card-description"]` (the
routed node) plus the five siblings named in the brief:
`p[data-part="subtitle"]`, `span[data-part="progress-count"]`,
`span[data-part="section-nav-label"]`,
`span[data-part="submit-bar-progress"]`, and
`span[data-part="section-nav-item-label"][data-active="false"]`.

`section-card-description` reads `--ds-color-text-secondary` on the ledger
ground: bithire light **2.60 -> 6.84**, evnto light **2.49 -> 6.55**.

The suite is RED because a repaired node is a pinned node that no longer
reports. That red IS the drain. **The pin map is the DT's write set** — I
report the measurement, the DT follows the pins down.

**One node survives**, in both light scopes:
`span[data-part="draft-status-label"]`. Its chip ground is
`background: var(--ds-color-bg-tertiary)` — `#e5e5e5`
(`skin/guided-draft-form/index.css:104`). That is §8's residual, and axe
naming exactly the node the ratio table predicts is the residual's proof.

## 7. Gate delta, isolated against HEAD

Shared gates are red at HEAD from other writers, so each suite was run twice:
once on this tree, once with my two files rewritten to their HEAD bytes
(`git show HEAD:./<path> > <path>` — no `checkout`, no `restore`, no `stash`,
nothing outside my write set touched), then restored from a parked copy.

| suite | HEAD | mine | delta |
| --- | --- | --- | --- |
| `tsc --noEmit` | clean | **clean** | 0 |
| `src/foundation/tokens` + `kernel/accessibility` (488 tests) | 9 failed | 10 failed | **+1** |
| `structure:check` | — | **passed** (4525 files, 0 findings) | 0 |
| `theme-parity:check` | failed, 3 rows | failed, **the same 3 rows** | **0** |

`theme-parity:check` is red on both arms with byte-identical output —
`declared-but-unemitted.BrandCollapseChrome=1`, `BrandSidebarChrome=4`,
`total=28 vs baseline 23`. Brand-chrome channels, not text rungs; the
`emitted-but-unconsumed` sample it prints is all `--ds-collection-card-*`,
i.e. the concurrent `collection-header` writer's surface. Not mine.

The nine pre-existing reds, unchanged and byte-unmodified by this lot:
`first-party-artifacts-parity` (all three verticals),
`tone-ink-authority` LIGHT (rottay, evnto), `channel-contract` (x2),
`reduced-motion-guard`, `bulk-select-toggle-motion-contract`.

My single red is
`themes/tests/default-theme-neutral-derivation.test.ts`, which hand-pins the
three literals (`expected '#5A5A61' to be '#A0A0A5'`). It carries the W8
justification comment in its own body. **Pinned test map — DT window.**

### Registered for the DT window

1. `default-theme-neutral-derivation.test.ts:77-85` — re-pin the three
   literals and replace the W8 comment; the measured basis is §1 and §3.
2. `GuidedDraftForm.causality.integration.test.tsx` `AXE_DEBT` — drop the six
   drained nodes from `bithire light` and `evnto light`, keep
   `draft-status-label` with §8's reason.
3. `scripts/check/tokens/customization/visual-worklist/index.json` and
   `src/foundation/tokens/data/decisions/writers/unused/{cards,system}/index.json`
   carry resolved `#96969E` / `#A0A0A5` values in evidence prose and worklist
   rows; regenerate with the official producer.
4. `docs-engineering/engineering/design-system/tokens/catalog/families/*.md`
   — **128 rows across 53 family docs** carry a resolved `#A0A0A5` /
   `#9A9AA2` / `#96969E`. Generated catalog views; regenerate with
   `pnpm -C packages/core tokens:catalog:write` (the gate needs a
   `docs-engineering` sibling beside the worktree or it reports phantom stale
   views). `foundations/tokens/README.md` names the three rungs but quotes no
   value, so it needs no edit.
5. Comments quoting the old values, informational only:
   `Typography.causality.integration.test.tsx:80`,
   `lowering/runtime/derivation/chrome/{divider,section-frame}/index.ts`,
   `tokens/tests/modern-tenant-value-free.test.ts:175`,
   `lowering/tests/premium-regression.test.ts:440`.
   `kernel/accessibility/.../apca-oracle.test.ts:28` is a literal fixture pair,
   not a token read, and stays green.

### A foreign drain in my diff, named

`src/foundation/tokens/ts/foundation/base/declared-defaults/index.ts` is
GENERATED from the CSS I own (`node scripts/generate/tokens/foundation-defaults/index.mjs`,
stated in its own header) and the compiler resolves references through it, so
it had to be regenerated. It was **already stale at HEAD**: the CSS at HEAD
declares `--ds-color-error: var(--ds-color-error-600)` and
`--ds-color-on-error: #ffffff` (lines 187 / 441, verified with `git show`)
while the generated mirror still said `error-400` / `#171717`. The official
regeneration therefore also drains the error-regrade lot's un-regenerated
debt: `--ds-color-error`, `--ds-color-on-error` and ten dark `--ds-color-error-*`
ramp steps. **Not mine, not hand-edited, split it out if the DT prefers.**

## 8. STOP-adjacent residual: the `#e5e5e5` well (a GROUND, not an ink)

After the re-grade one ground still fails, in all three light scopes:

| ground | channels | secondary | tertiary | muted / subtle |
| --- | --- | --- | --- | --- |
| `#e5e5e5` | `--ds-surface-panel-bg`, `--ds-color-bg-tertiary` (both `neutral-200`) | 5.43 | 4.80 | **4.20** |

It is a real text ground, not a hypothetical: 33 background declarations,
including `guided-draft-form [data-part='draft-status']` (the one node §6
leaves pinned) and `widget-board [data-part='empty-state']`.

**I did not close it, and closing it from the ink side is the rank problem the
brief says to stop on.** Measured: `muted` must reach OKLCH L 49 (`#606067`,
4.95) to clear 4.5 there. Holding the 3-L step, `tertiary` goes to L 46 and
`secondary` to L 43 (`#4F4F56`, 8.12:1) — 2 OKLCH L from
`--ds-color-text-disabled` `#4A4A50` (L 41.1, 8.79:1). Disabled copy and the
strongest supporting copy would become indistinguishable. That is a design-floor
adjudication, not a writer's call.

**The cheaper exit is the ground, and it is outside my write set.** Moving
`--ds-surface-panel-bg` / `--ds-color-bg-tertiary` from `#e5e5e5` to `#ededed`
puts `muted` at **4.52** and `tertiary` at **5.16** with the ladder untouched —
one ramp half-step on a well, against a collapsed ink ladder. Recommended.

### Adjacent, measured, not repaired here

- **`--ds-color-text-disabled` `#4A4A50` is the darkest ink in the light
  ladder** (8.79:1), stronger than every supporting rung before AND after.
  The direction is unchanged by this lot and WCAG 1.4.3 exempts inactive
  components, so I left it; it is still the wrong way round.
- **Dark `tertiary` and `muted` are the same value** (`#94a3b8`), so the dark
  ladder has two rungs where light now has three. Out of scope: dark had to
  stay byte-identical.
- **Mode-blind grounds**: `--ds-popover-bg` (`#ffffff`) and
  `--ds-table-header-bg` (`#fafafa`) are not restated in the dark block and
  are near-white on a dark page. Pre-existing, unchanged, ground channels.
- **`app-shell/index.css:177`** paints `--ds-color-text-primary` inside the
  navigation rail; on bithire's `#171717` sidebar that is 1:1. Pre-existing,
  untouched, and a sidebar-channel question.

## 9. Sighted

`captures/{before,after}/{evnto,bithire}-light.png`, 2x, 1180px, full page:
`GuidedDraftFormSurface` in scroll mode (the quiet form section) above a
`PatternDataTable` (the data cells), rendered from the same server markup with
only the producer swapped.

**Looked at. Verdict: PASS.**

- Every supporting line goes from washed-out to legible: the page subtitle,
  the `SECTIONS` eyebrow, the three section-nav labels, the three section
  descriptions, the validation-issue field, `Sections complete: 1 of 3`, and
  the table column headers.
- Headings, body values, the semantic dot/rail colours, spacing, rhythm and
  layout are unchanged in both verticals.
- The quiet hierarchy holds by eye: supporting copy still reads clearly
  subordinate to the h1/h2 and to the field values — it is quieter, not
  invisible. bithire keeps its serif vertical identity and its blue locus rail;
  evnto keeps its sans identity and black rail.
- The `Saved 12:30` chip is the one place the residual is visible: its ground
  is the `#e5e5e5` well of §8.
