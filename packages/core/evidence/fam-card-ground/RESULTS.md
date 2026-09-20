# The Card ground follows the mode

Writer lot opened on `cf099081b`; HEAD moved twice during the packet (a foreign
"tree node padding authority" lot), so this sits on **`cef973cc8`**. The working
tree also carries that writer's uncommitted work — `presentation/components/tree/index.css`,
`skin/tree/index.css`, `runtime/engines/modern/theme/index.css`, `roadmap/*`,
`evidence/tree-node-padding-authority/`. **None of it is mine**; read the diff as
a subset. Mine is exactly: `presentation/components/card/index.css`, four
causality suites, `.changeset/fam-card-ground-mode-mirroring.md`, this folder.

Same mechanism as the Input ground repaired in `0d4e4da81`, same owner tier,
same escape hatch. The prior lot (`fam-fm-contrast-close`) measured and routed
it; this lot lands it.

---

## The repair

`presentation/components/card/index.css:24`

```
-  --ds-card-bg: var(--ds-color-white);
+  --ds-card-bg: var(--ds-color-bg-elevated);
```

**Adjudication — why this value and not a chain.** For the Input ground I used a
chained `var(--ds-color-bg-input, var(--ds-surface-control))`, because the
theme's own dark statement named a *different* role (`--ds-color-bg-tertiary`)
and a value had to be chosen. Here the theme already states exactly
`--ds-card-bg: var(--ds-color-bg-elevated)` (`themes/default/index.css:2091`)
and that statement is simply unreachable. The repair is therefore a verbatim
restoration of the theme's own intent into the layer that wins — not a new
opinion. A `var(--ds-color-bg-elevated, var(--ds-surface-card))` chain measures
identically in all six scopes, because `--ds-color-bg-elevated` is defined at
every root; the fallback would be dead code, so it is not written.

**Siblings, measured not assumed.** `card/index.css` holds exactly two
`--ds-color-white` literals. The second is
`--ds-card-cover-content-color` (`:189`), the ink on the cover scrim
(`--ds-card-cover-overlay-bg`, a `rgba(0,0,0,.6)` gradient over an image). It
measures `#ffffff` in all six scopes before and after and is **deliberately**
mode-blind — white on a dark scrim is correct in both modes. Not touched.
`--ds-card-bordered-bg`, `--ds-card-elevated-bg` and `--ds-card-default-bg` are
not literals at all: each reads `var(--ds-card-bg)`, so one declaration carries
them. `--ds-card-flat-bg` reads `--ds-surface-panel` first and is unaffected.

---

## Channel table — six scopes, before vs after

Only nine channels move, and only in the two broken dark scopes.

| channel | rottay dark | evnto dark | bithire dark | 3 light scopes |
| --- | --- | --- | --- | --- |
| `--ds-card-bg` | `#ffffff` → `#182235` | `#ffffff` → `#182235` | = | = |
| `--ds-card-default-bg` | `#ffffff` → `#182235` | `#ffffff` → `#182235` | = | = |
| `--ds-card-bordered-bg` | `#ffffff` → `#182235` | `#ffffff` → `#182235` | = | = |
| `--ds-card-elevated-bg` | `#ffffff` → `#182235` | `#ffffff` → `#182235` | = | = |
| `--ds-breadcrumb-current-bg` | `#ececec` → `#182133` | `#ececec` → `#182133` | = | = |
| `--ds-breadcrumb-bg` | white gradient → `#182235` gradient | idem | = | = |
| `--ds-menu-bg` | `#f8f8f8` → `#182234` | `#f8f8f8` → `#182234` | = | = |
| `--ds-menu-panel-bg` | `#ffffff 72%` → `#182235 72%` | idem | = | = |
| `--ds-pagination-item-bg-hover` | `#efefef` → `#182133` | `#efefef` → `#182133` | = | = |

**19 further channels measured byte-identical in all six scopes**, including
`--ds-card-flat-bg`, `--ds-card-cover-content-color`, `--ds-card-color`,
`--ds-card-border-color`, `--ds-surface-card`, `--ds-color-bg-elevated`, the
hover/active/selected/disabled legs and `--ds-stepper-item-bg` /
`--ds-segmented-item-bg-selected` (both already resolve through
`--ds-material-card-*` or a correct role).

### Light-scope byte-equality

**No light cell moved, in any of the three verticals.** `--ds-color-bg-elevated`
already resolves `#ffffff` at every light root, so the substitution is a literal
no-op in light.

---

## The Card's own pairing — the defect nobody had measured

Body copy inside the card, ink over the card's painted ground:

| scope | before | after |
| --- | --- | --- |
| rottay dark | `#cbd5e1` on `#ffffff` — **1.48:1** | `#cbd5e1` on `#182235` — **10.72:1** |
| evnto dark | `#cbd5e1` on `#ffffff` — **1.48:1** | `#cbd5e1` on `#182235` — **10.72:1** |
| bithire dark | `#cbd5e1` on `#182235` — 10.72:1 | unchanged |
| rottay / bithire / evnto light | `#404040` on `#ffffff` — 10.37:1 | unchanged |

Identical for the `default`, `bordered` and `elevated` variants. The Card's dark
appearance is therefore **different by design after this lot** — it was white,
which was the defect.

One reading correction: a fourth card was mounted as `variant="flat"`, but the
Modern skin keys that rule on `data-variant='filled'` (`skin/card/index.css:117`),
so that card rendered as the base variant and its row is a duplicate of
`default`, not a measurement of the flat recipe. Named rather than quietly
dropped. The naming mismatch is a **sibling finding outside the card base** —
not fixed here.

---

## Every card-ground pairing, enumerated by axe

A gallery of every `--ds-card-bg`-reading family (Card ×4, Breadcrumb, Menu,
Pagination, Segmented, Stepper, Collapse) audited with axe-core, serious+, in
all six scopes, both legs:

| scope | before | after | drained | new |
| --- | --- | --- | --- | --- |
| rottay dark | 4 nodes | **0** | 4 | **0** |
| evnto dark | 4 nodes | **0** | 4 | **0** |
| bithire dark | 2 nodes | 2 nodes | 0 | **0** |
| rottay light | 2 nodes | 2 nodes | 0 | **0** |
| bithire light | 4 nodes | 4 nodes | 0 | **0** |
| evnto light | 2 nodes | 2 nodes | 0 | **0** |

Drained in rottay dark and evnto dark — all four were near-white ink on the
white card ground: the menu row label (1.03:1), a pagination page button
(1.10:1), the page-size `select` (1.10:1) and the quick-jumper `input` (1.10:1).

**Nothing new fails anywhere.** The node sets in the other four scopes are
identical before and after, element for element.

### Findings that STAND — named, not mine

These are unchanged by this lot and are **ink** defects on already-correct
grounds, i.e. the mirror image of the defect repaired here:

- `bithire dark`: menu row label `#111827` on `#19243a`, **1.14:1** — a
  light-mode ink on a correct dark ground; and a segmented/select trigger label
  `#f3f4f6` on `#e2e8f0`, **1.12:1**.
- `bithire light`: the same two inverted (`#f5f5f5` on `#f9fafe`, 1.04:1;
  `#171717` on `#262626`, 1.18:1), plus the quiet pair below. Visible in
  `captures/after/bithire-light.png` as the near-invisible "Billing" row.
- `rottay light` / `evnto light`: `--ds-color-text-muted`-class quiet ink
  `#a0a0a5` on `#fafafa`/`#ffffff`, **2.49:1** / **2.60:1**, on
  `[data-part="pagination-range"]` and the unselected segmented option label.

None is a card-ground defect; none is in this write set.

---

## Rows drained by identity — 9 nodes, 4 suites

| suite | scope | nodes |
| --- | --- | --- |
| `Breadcrumb.causality` | `rottay dark` | 1 — `span[title="Current page"]` |
| `Pagination.causality` | `rottay dark` | 3 — page button, `input`, `select` |
| `Menu.causality` | `rottay dark` | 3 — two row labels + a group label |
| `PatternFileManager.causality` | `rottay dark` | 2 — both `data-current` crumb labels |

Each suite's docblock now names the Card base as the cause. Every one went red
as good news failing closed (measured `{}` against a non-empty pin); no scope
got worse and no new node appeared in any of them.

### Attribution correction for the DT — `Breadcrumb.causality`

Its `CONTRAST_GAP` docblock attributes the row to **WO-DER-06** ("the chrome
pair this family paints on loses its authored half under neutral+preset, so ink
and ground come from opposite ends of the ramp"). That is **wrong**: the ink was
always correct and mode-following; only the ground was white, and it was white
because of `card/index.css:24`, not because of any breadcrumb derivation. The
same WO-DER-06 paragraph appears verbatim in `Pagination.causality` and
`Menu.causality` and is equally wrong for their drained `rottay dark` rows.

**I did not rewrite that prose in any of the three** — per the packet, the
attribution is the DT's to route. I appended a factual drain note beneath it and
removed the row.

> **Scope flag.** The packet says both *"empty the 9 pinned rows ... in the 4
> suites"* (and lists the 4 suites' emptied rows in the write set) and *"do not
> edit that file"* of `Breadcrumb.causality`. I read the second clause as
> attaching to the **attribution prose**, which I left intact, and emptied the
> row because the lot is not green otherwise and the row is named in the write
> set. If the DT meant the file was untouchable outright, the Breadcrumb hunk is
> one contiguous change and reverts on its own.

---

## Sighted evidence

`captures/{before,after,control}/<vertical>-<mode>.png`, 2x DPR. The `before`
leg restores the old declaration byte-for-byte into the resolved sheet
in-memory — one tree, no git operation.

> **A trap worth recording.** `themes/default/index.css:2091` contains the
> *identical declaration text* `--ds-card-bg: var(--ds-color-bg-elevated);`, and
> it is imported before the card component CSS. A first-occurrence string
> replace therefore patched the dead theme line and left the repair in place, so
> the first "before" leg silently measured after-vs-after and reported "nothing
> changed anywhere". Both the axe sweep and the ink table were re-run with the
> substitution anchored on the card file's unique comment+declaration block. The
> numbers above are from the corrected run.

**Verdict: PASS.** `before/rottay-dark.png` and `before/evnto-dark.png` show
three white cards whose titles are essentially invisible, a white breadcrumb
bar, a white menu whose "Billing" row cannot be read, and white pagination with
invisible page numbers — all floating on the dark canvas. `after/` grounds every
one of them at `#182235` with all text legible. `after/bithire-light.png` is a
correct light card stack (and shows the standing bithire-light menu ink defect
named above).

**Pixel control.** Unlike the Input lot, this gallery renders deterministically:
`control/` (a second `after` capture, identical CSS) differs from `after/` by
**0 pixels** in every scope. So the unchanged scopes are literally pixel-identical,
not merely within noise:

| capture | before vs after | after vs control (noise floor) |
| --- | --- | --- |
| rottay-dark | 740354 px, maxΔ 231 | **0** |
| evnto-dark | 740354 px, maxΔ 231 | **0** |
| bithire-dark | **0** | 0 |
| bithire-light | **0** | 0 |
| rottay-light | **0** | 0 |
| evnto-light | **0** | 0 |

---

## Validation

| command | result |
| --- | --- |
| `vitest --project integration` over Breadcrumb, Pagination, Menu, PatternFileManager, Card, Segmented, Stepper, Collapse | **8 files / 95 tests passed** |
| the same 4 drilled suites before emptying the rows | 4 failed, each `rottay dark: expected {} to deeply equal {...}` — the drain |
| `vitest --project integration` over all of `primitives/{display,navigation,layout,overlay,feedback}` | **841 tests passed, 0 failed** |
| `pnpm exec tsc --noEmit` | exit 0 |
| `root-catalog:check` | OK — 100 roots agree with `src/` |
| `csssource:check` | CSS source integrity gate passed |
| `root-exposure:check` | OK — 38 tenant-dial, 23 internal-head, 3 gap |

### The unit sweep's 11 failures — none of them mine

A unit sweep over `display/card`, `patterns/customization`, `structures/shell/navigation`
and all of `foundation/tokens` finished **11 failed / 755 passed**. Every one was
isolated in a detached worktree at `cef973cc8`:

| configuration | failures |
| --- | --- |
| plain HEAD | **10** |
| HEAD + only this card change | **10** (identical set, 81 passed both ways) |
| the working tree (HEAD + this lot + the foreign tree lot) | 11 |

So this change adds **zero**. The 10 pre-existing at HEAD are
`reduced-motion-guard` (command-palette), `first-party-artifacts-generated`
(all three tenants, "matches the committed artifact byte-for-byte"),
`first-party-artifacts-parity` (all three tenants), `channel-contract` (×2) and
`bulk-select-toggle-motion-contract`. The 11th,
`customization.contract.test.tsx`, passes at HEAD **and** at HEAD+this change,
and fails only alongside the foreign `tree/index.css` + `modern/theme/index.css`
edits.

Worth flagging: the first-party **artifacts are already stale at HEAD** on all
three tenants, before this lot. Regenerating them is the DT window, and this
change does not feed them — `compileTheme` reads the authored theme document,
not `presentation/components/*`.

`theme-parity:check` and `csspaint:check` remain red for the reasons A/B'd in
the Input lot; this change moves neither.

## Left to the DT

- The **WO-DER-06 attribution** in `Breadcrumb`, `Pagination` and `Menu`, above.
- `docs-engineering/.../tokens/catalog/families/card.md` may need
  `tokens:catalog:write`; the resolved LIGHT value is unchanged, the source
  column may move. **Not regenerated** — generated output is the DT window.
- `themes/default/index.css:2091` is now a duplicate of the component base
  rather than a dead override. Harmless, and a themes file is not in this write
  set — named so it is not mistaken for a second authority.
- The Modern card skin keys its flat recipe on `data-variant='filled'` while the
  token layer names it `--ds-card-flat-*`; a `variant="flat"` card silently
  takes the base recipe. Named, not fixed.


## Reproducing

`probe/_probe-card-*.test.{ts,tsx}` are the four probes, with their raw output
(`roots-{before,after}.json`, `axe-pairings.json`, `card-ink.json`). Drop any of
them into `tests/integration/` and run with `--project integration`. The `before`
leg is an in-memory substitution anchored on the comment+declaration block, not
a git operation; see the trap note above before re-anchoring it.
