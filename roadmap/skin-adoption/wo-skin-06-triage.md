# WO-SKIN-06 triage — is the paint migratable?

Read-only triage, 2026-07-13, davila. Scope: the 3582 `fleet.inlinePaint` sites in
`patterns/` + `structures/` + `surfaces/` (158 files, 77 components) — 74% of everything
left in the skin program.

Question answered: how much of WO-06 is STATIC paint that can move to a skin (A), RUNTIME
paint that must legitimately stay inline (B), or paint that needs a custom-property hatch (C)?

---

## 1. Headline

```
WO-06 total                                   3582 sites   158 files   77 components

A  migratable to a skin                       3452   96.4%
   ├─ A-static  copy verbatim                 3020   84.3%
   └─ A-state   static leaves, runtime SELECT   432   12.1%
B  legitimately inline (exempt)                  84    2.3%
C  custom-property hatch                         46    1.3%
```

**WO-06 is exactly as big as 3582 suggests.** The hoped-for outcome — "most of it is chart
paint, so the number is inflated" — is false. 96.4% of the paint is migratable, and the
charts family that was expected to dominate is 113 sites (3.2% of WO-06).

### Confidence

This is a **census, not an extrapolation**. Every one of the 3582 sites was classified
mechanically (a lexer that reproduces `scripts/lib/inline-paint-counter.mjs` exactly — it
re-derives 3582 on the nose), and all 200 sites the machine could not resolve were then read
by hand and reclassified. So:

- A-static / A-state boundary: machine-decided, ±0 on the total, and individual sites may sit
  on either side of the A-internal line without changing the A total.
- **A vs B/C boundary: hand-verified on all 200 machine-flagged sites.** The 130 that survived
  are enumerated in §4 and §5. This is the number the estimate hinges on and it is not sampled.

The one soft spot: A-static assumes a value that resolves to an author-time constant is
*safe* to move, not merely *possible* to move. Cascade/specificity accidents (see the
`ds-select` scope-class collision in the inputs batch) are not visible to any static analysis.

---

## 2. The discriminator that matters

The instinct is to ask "does this value mention a runtime identifier?". That question gives
17.9% runtime and is **wrong**. The right question is *where the runtime identifier lands*:

```tsx
// list-toolbar/engines/modern.tsx:386
background: isActive ? FILTER_PILL_ACTIVE_BG : hovered ? FILTER_PILL_HOVER_BG : FILTER_PILL_BG
```

Every leaf here is a static token. `isActive`/`hovered` do not carry paint — they *select*
among paint that is already static. In CSS that is `:hover` and `[data-active]`. This is
category A, not B. Same shape, three more ways:

| form | example | verdict |
|---|---|---|
| state ternary | `isOpen ? shell.surface : shell.mutedSurface` — `form-sections/index.tsx:257` | A → `[data-open]` |
| enum-switch fn | `getToneShell(tone)` — `form-sections/index.tsx:146`, a `switch` over a fixed `FormSectionTone` returning static `color-mix()` strings | A → `[data-tone=…]` |
| static map index | `STATUS_PILL_STYLES[status.variant]` — `cockpit-header/engines/modern.tsx:193`; `TYPE_CONFIG[item.type]` — `dashboard-insights/activity/timeline/index.tsx:23` | A → `[data-variant=…]` |
| threshold bucket | `getProgressColor(progress)` — `data-terminal-card/index.tsx:194`, 3-way threshold over `DS.success/warning/error` | A → `[data-band=…]` |

Only when a runtime identifier **reaches the paint value itself** is it B or C:

```tsx
// tenant-preview/engines/rustic.tsx:53   ← `base` is the tenant's chosen brand hex
{ step: 50, color: mixColor(base, '#ffffff', 0.92) }
```

That is the entire B category, and it is small.

---

## 3. Per-family breakdown

| family | files | sites | A-static | A-state | B/C | %A | dominant category — why |
|---|---:|---:|---:|---:|---:|---:|---|
| `patterns/misc` | 17 | 590 | 500 | 49 | 41 | 93% | A — static chrome, except the three brand-preview components whose job is to render an arbitrary hex |
| `structures/dashboard` | 10 | 439 | 348 | 89 | 2 | **99%** | A — `DS`/`TYPE_CONFIG` const maps of `var(--ds-*)` strings, selected by a bounded tone enum |
| `patterns/data` | 11 | 344 | 285 | 51 | 8 | 98% | A — the `FILTER_PILL_*`/`TOOLBAR_CONTROL_*` tokens are already extracted to `list-toolbar/tokens.ts` |
| `patterns/forms` | 8 | 332 | 299 | 32 | 1 | **99%** | A — filter-builder modern is 78/78 pure static |
| `patterns/visualization` | 30 | 308 | 244 | 16 | 48 | 84% | A for chrome, B at the leaf — per-datum/per-series color is the only real B here |
| `surfaces/pages` | 31 | 295 | 265 | 28 | 2 | 99% | A — surfaces are page recipes; their paint is layout chrome |
| `patterns/navigation` | 10 | 279 | 247 | 12 | 20 | 93% | A, except environment-toggle: caller supplies one accent hex per environment (C) |
| `patterns/communication` | 10 | 272 | 252 | 14 | 6 | 98% | A — only presence (per-user identity color) is B |
| `structures/workspace` | 8 | 261 | 201 | 60 | 0 | **100%** | A — pure state chrome (hover/active/selected/drag-target) |
| `structures/headers` | 5 | 198 | 154 | 44 | 0 | **100%** | A — one `tone` vocabulary duplicated across 5 header files |
| `structures/record` | 3 | 123 | 99 | 24 | 0 | **100%** | A — tone maps + open/closed state |
| `patterns/workflow` | 2 | 64 | 59 | 5 | 0 | **100%** | A — status maps |
| `surfaces/foundation` | 7 | 27 | 25 | 1 | 1 | 96% | A |
| `patterns/_internal` | 1 | 18 | 17 | 0 | 1 | 94% | A |
| `structures/shell` | 1 | 17 | 17 | 0 | 0 | **100%** | A |
| `surfaces/layout` | 3 | 10 | 3 | 7 | 0 | **100%** | A |
| `structures/feedback` | 1 | 5 | 5 | 0 | 0 | **100%** | A |

### Charts — the family the question was really about

`patterns/visualization/charts/**` is **113 sites across 20 files — 3.2% of WO-06**. It is not
the crux and never was. Its split:

- **74 sites are static chrome** (axes, gridlines, tooltip surfaces, brush overlays). Notably
  `charts/hooks/use-chart-brush.ts:106` `BRUSH_COLORS` is a plain `as const` map of
  `var(--ds-*)` strings — 8 sites, pure A-static.
- **39 sites are data-derived** and are the genuine B: `palette[i % palette.length]`
  (`bar-chart/index.tsx:187`, `pie-chart:85`, `treemap:84`, `scatter:167`, `funnel-chart:84`,
  `network-graph:257`, `line-chart:111`, `area-chart:111`, `radar-chart:85`, `sankey:236`),
  `d.color`/`item.color`/`seg.color` caller-supplied per-datum colors, and
  `bullet/index.tsx:176-178` `resolvedRangeColors[0..2]`.
- One true runtime read: `use-chart-theme.ts:291` `resolveName(CSS_VARS.surfaceBg, …)` resolves
  a CSS var to hex via `getComputedStyle` because D3 needs hex for color interpolation. This
  is correct and must stay.

Charts do use `var(--ds-color-*)` natively in SVG `fill`/`stroke` (per `CLAUDE.md`), which is
why their chrome is already static. **The d3 hypothesis is right in kind and wrong in scale.**

---

## 4. Category B — recommend a named ratchet exemption (84 sites)

These are not pending work. A skin rule cannot hold them, and a custom-property hatch, while
technically possible, would mean emitting one custom property per swatch/datum — strictly
worse code than the inline value. Recommend exempting them by name rather than carrying them
as debt that can never reach 0.

| component | sites | why |
|---|---:|---|
| `patterns/misc/tenant-preview` (modern + rustic) | 32 | `mixColor(base, …)` builds a 10-step palette from the tenant's chosen brand hex and renders it as swatches — `engines/rustic.tsx:53-62`, `engines/modern.tsx:92-101`. The component's entire purpose is to display an arbitrary color. |
| `patterns/visualization/charts/**` per-datum/per-series | 38 | palette cycling by series index and caller-supplied `d.color` — see §3. |
| `patterns/misc/brand-studio` | 7 | `pickHex(vars, backgroundKeys)` / `isHex(value) ? value : 'transparent'` — `index.tsx:229,387,763`. Renders arbitrary hex swatches. |
| `patterns/communication/presence` | 3 | `ringColor` / `cursorColor` — per-user identity color on live cursors (`index.tsx:148,181,373`). |
| `patterns/misc/branding-preview-sandbox` | 2 | `badge.bg` / `badge.color` — `index.tsx:187`. |
| `patterns/visualization/charts/hooks/use-chart-theme.ts` | 1 | `:291` — CSS var → hex for D3 color math. |
| `patterns/forms/form-builder/engines/modern.tsx` | 1 | `:279` `String(val)` — renders a user-entered color value. |

**Proposed exemption name:** `SKIN-EXEMPT-RUNTIME-VALUE` — "the paint value is data supplied at
runtime (a brand hex, a per-datum color, a per-user identity color); the counter counts it and
that is correct."

Note the shape: **B is almost entirely the brand-preview trio + chart leaves.** Three of the
four B components exist specifically to *show the user a color they picked.* That is a coherent
exemption, not a grab-bag.

---

## 5. Category C — custom-property hatch (46 sites)

The rule belongs in the skin; only the value is per-instance. `style={{'--ds-x-fill': color}}`
plus `fill: var(--ds-x-fill)` in the skin. **These do drive the counter to 0** — a `--ds-*` key
does not match `ARC09_PAINT_KEY_RE` — so unlike B they are genuinely completable.

| component | sites | hatch |
|---|---:|---|
| `patterns/navigation/environment-toggle` (modern + rustic) | 20 | `env.color` / `activeEnv.color` — one caller-supplied accent per environment → `--ds-envtoggle-accent` |
| `patterns/data/cell-renderers` | 5 | `options?.color`, `barColor`, `height / 2` |
| `patterns/data/stats-grid` (modern + rustic) | 3 | `stat.color \|\| var(…)` |
| `patterns/visualization/timeline/engines/rustic` | 3 | `color` prop |
| `patterns/communication/assistant` | 3 | `visual.color`, `beforeColor`, `afterColor` |
| `patterns/visualization/kanban-board` (×2), `calendar-view` (×2), `map-view` (×2), `surfaces/pages/operations/kanban` (×1) | 7 | `column.color` / `ev.color` / `marker.color` / `col.color` |
| `structures/dashboard/data-terminal-card` | 2 | `:286` `borderRadius: height / 2` — or just `999px` |
| `surfaces/pages/forms/guided-draft-form` | 1 | `:164` `color` |
| `patterns/_internal/engines/modern/styles.ts` | 1 | `:76` `Math.max(2, size / 10)` border width |
| `surfaces/foundation/personality-helpers.tsx` | 1 | `:77` `thickness`-derived radius shorthand |

---

## 6. Proposed checkpoint decomposition

Grouped by **shared paint vocabulary / skin home**, not by file count — the point is that one
checkpoint writes one skin with one token vocabulary, so the same `--ds-*` names and the same
state selectors get decided once.

| ckpt | sites | files | contents | why this grouping |
|---|---:|---:|---|---|
| **CK-A dashboard widgets** | 439 | 10 | dashboard-insights 259, data-terminal-card 149, stats-header 31 | One `DS`/`TYPE_CONFIG` const-map vocabulary + one tone enum. 99% A. **Blocked on the variant-pinning trap (§7.1) — do this first.** |
| **CK-B headers** | 335 | 9 | detail 51, edit 49, cockpit-header 48, collection 48, page-shell 45, workbench-header 44, form 36, dashboard 14 | The `tone` map + dotted-title + `editorialTech` gradient recipe is **literally duplicated** across headers/edit:137-139, headers/form:134-136, headers/detail. One skin kills all copies. 100% A. |
| **CK-C workspace chrome** | 466 | 13 | list-toolbar 94, saved-views 91, column-menu 69, saved-views-menu 61, search-command-bar 54, active-filters-bar 26, export-button 22, status-filter-pills 20, scope-switcher 12, view-mode-switcher 9, table-toolbar 8 | All share `FILTER_PILL_*` / `TOOLBAR_CONTROL_*`, already extracted to `patterns/data/list-toolbar/tokens.ts`. **The single biggest shared-vocabulary cluster and 100% A.** Best value per unit of risk. |
| **CK-D forms + record + workflow** | 591 | 17 | filter-builder 117, form-builder 105, surfaces/pages/forms 72, form-sections 65, approval-workflow 64, step-wizard 62, invoice-template 48, record 34, edit-fields 24 | One form/section/step vocabulary; `getToneShell`/`getToneAccent` tone maps. 99% A. Largest, so split D1 (patterns/forms) / D2 (structures/record + workflow + surfaces/pages/forms) if it runs long. |
| **CK-E visualization** | 308 | 30 | charts 113, kanban-board 48, calendar-view 46, timeline 37, tree-view 35, map-view 29 | The only checkpoint that needs the C hatch and the B exemption. Do it **last** — it is the only one whose gate cannot reach 0 without the exemption landing first. |
| **CK-F communication** | 272 | 10 | comment-thread 81, notification-center 62, activity-log 53, live-feed 44, assistant 16, presence 16 | Feed/thread/bubble vocabulary. 98% A. |
| **CK-G navigation** | 279 | 10 | environment-toggle 95, workspace-switcher 64, command-palette 57, shortcuts-overlay 43, locale-switcher 20 | Menu/palette/switcher vocabulary. 93% A; environment-toggle carries 20 of the 46 C sites. |
| **CK-H brand-preview + misc** | 453 | 13 | tenant-preview 147, file-manager 64, user-profile-card 58, branding-preview-sandbox 54, pricing-table 53, brand-studio 36, empty-state 21, token-inspector 20 | Split: **H1 = brand-preview trio (237 sites, 41 of them exempt-B)** — mostly an exemption exercise; **H2 = the rest (216, ~100% A)**. Do not let H1's B-density contaminate H2's gate. |
| **CK-I data views + surfaces** | 439 | 46 | surfaces/pages/workspace 141, stats-grid 68, cell-renderers 43, admin 35, data 28, + 41 small files | The long tail. 46 files, mostly <20 sites each; behaves like the head (98% A). Mechanical — good sonnet work. |

Ordering recommendation: **C → B → D → A → F → G → H2 → I → H1 → E.** C and B are the highest-A,
highest-duplication clusters (one skin deletes the most repetition); A is high-value but gated on
variant-pinning; E and H1 go last because they need the exemption/hatch machinery decided.

---

## 7. Traps

### 7.1 Randomly-selected variants — 408 sites (11.4% of WO-06) — the biggest one

`structures/dashboard/dashboard-insights/use-variant/index.ts:14`

```ts
function getRandomVariants(): StoredVariants {
  return {
    metrics:  METRICS_VARIANTS[Math.floor(Math.random() * METRICS_VARIANTS.length)],
    activity: ACTIVITY_VARIANTS[Math.floor(Math.random() * ACTIVITY_VARIANTS.length)],
  };
}
```

`dashboard-insights` picks 1 of 4 metrics renderers and 1 of 4 activity renderers **at random,
per mount**. `structures/dashboard/data-terminal-card/index.tsx:107` does the same across 4
card variants (seeded once on `window.__cardVariantSeed`).

Consequences:
- **Byte-exact screenshot verification is impossible** for 408 sites unless the variant is
  pinned. Both accept an override (`metricsOverride`/`activityOverride`;
  `DataTerminalCardProvider variant`) — the checkpoint must pin them in the harness, or every
  capture is noise. This is the same class as the clock-pinned date panels from WO-SKIN-02.
- On any given render, 6 of 8 dashboard-insights renderers and 3 of 4 data-terminal-card
  variants **do not paint at all**. They are live code, so the ratchet counts them, but they are
  invisible to a sighted check. Cover all 8/4 explicitly or the sighted check certifies nothing.

### 7.2 Paint that is computed and static-looking (and vice versa)

- `getToneShell(tone)` / `getProgressColor(progress)` / `STATUS_PILL_STYLES[status.variant]`
  look dynamic and are static (§2). Migrate them; do not exempt them.
- `"var(--ds-color-" + item.type + "-100)"` (`dashboard-insights/activity/timeline/index.tsx:39`,
  and the same line in `compact`, `cards`, `ticker`) **builds a token name by string concat**.
  It is A (the enum is bounded: success/primary/info/warning/error), but a naive grep for
  `var(--ds-` will not find these tokens, and a token-coverage gate will report them missing.

### 7.3 Per-instance `<style>` tags and keyframes — 41 files

41 WO-06 files inject a `<style>` tag; 37 carry `@keyframes` strings. The counter **skips
string contents by construction**, so these are invisible to the ratchet — a file can reach
`inlinePaint: 0` with a whole stylesheet still inlined in a template literal. Two hazards:

- Moving them is unmeasured work: it will not move the counter, so it must be tracked separately
  or it will silently not happen.
- Same-name/different-content keyframes across skins collide. This already bit WO-SKIN-02; the
  fix (engine-namespaced keyframe names) applies here at ~10× the volume.

### 7.4 Measured DOM

`structures/workspace/column-menu`, `saved-views-menu`, `export-button` and the chart
tooltip/brush hooks call `getBoundingClientRect`/`getComputedStyle`. Their *paint* is static
(column-menu is 66/69 A) — the measurement drives position, not color. Do not reflexively
exempt a file because it measures; check whether the measurement reaches a paint key. In
column-menu it does not.

### 7.5 Counter blind spot: TypeScript interface members

A member named `color`/`fill`/`background` inside an `interface {…}` body has its innermost
bracket = `{`, so the lexer counts it as paint. **7 sites, 0.2%** — negligible for the estimate,
but they are unfixable-by-migration and will block a file from reaching 0:

- `charts/sankey/index.tsx:116,134` · `charts/hooks/use-chart-theme.ts:36,55` ·
  `charts/gauge/index.tsx:37` · `charts/tooltip/crosshair.ts:25` · `structures/headers/edit/index.tsx:104`

The counter's docstring claims type annotations are excluded structurally, but it only handles
the function-parameter case (`(filter: FilterDef)`, innermost bracket `(`). Interfaces are not
covered. Either exempt these 7 by name or teach the lexer to skip `interface`/`type` bodies.

### 7.6 Scope-class collision

Per the WO-SKIN-02/ARC-09 finding: a new `ds-<component>` scope class can collide with an
existing legacy `.ds-<x>` rule (the `ds-select` incident: an inherited `font-size` shrank and
reflowed glyphs). With 77 components landing scope classes, grep `.ds-<name>` before choosing
each one. This is the single most likely source of a non-obvious visual regression in WO-06.

---

## 8. What changes the program's estimate

1. **WO-06 is not smaller than it looks.** 96.4% migratable. Budget for ~3450 real migrations,
   not for "3582 minus a large chart carve-out". The charts carve-out is 113 sites.

2. **But 408 of those sites (11.4%) may be deletable rather than migratable.** dashboard-insights
   ships 8 alternate renderers of 2 widgets and picks between them *at random*; data-terminal-card
   ships 4. If the product intent is "one dashboard look", ~300 sites get deleted, not migrated —
   and the DS stops shipping a dashboard that looks different on every reload. **This is a product
   question that should be answered before CK-A is scheduled, because the answer changes CK-A from
   the largest checkpoint to a small one.** It is also, independently, worth flagging as a defect.

3. **The A-state share (432 sites, 12.1%) is the real cost driver, not B.** These are cheap to
   *count* and expensive to *migrate*: each one needs a state selector or a data-attribute
   plumbed onto the element, which means touching the JSX, not just moving a string. A migration
   plan that assumes "copy the value into a skin" will underestimate these by a wide margin.
   `structures/workspace` is 60/261 A-state, `structures/headers` 44/198, `structures/dashboard`
   89/439 — the state-heavy families are exactly the workspace/header chrome.

4. **The 46 C sites need the hatch convention decided once, up front.** They are spread across 6
   checkpoints. Decide the `--ds-<component>-<role>` naming before CK-C, or six checkpoints will
   invent six conventions.

5. **41 files carry an inlined `<style>`/keyframes block the ratchet cannot see.** Whatever that
   work is worth, it is not in the 3582 and will not show up as progress.

---

## 9. Method

- Site enumeration re-implements `packages/core/scripts/lib/inline-paint-counter.mjs` exactly
  (same bracket-stack lexer, same `ARC09_PAINT_KEY_RE`, same exemptions) and reproduces its
  3582 total on the census file list (`roadmap/skin-census.json`, `patterns|structures|surfaces`,
  `classic` excluded by construction).
- Each site's value expression was split into **condition-position** and **value-position**
  sub-expressions; local and imported `const`s were substituted recursively (depth 4), and
  functions whose every `return` is static (`getToneShell`, `getProgressColor`) were resolved as
  discrete variants. A site is A iff every value-position leaf is author-time static.
- The 200 sites the resolver could not prove static were **read by hand**; 70 were reclassified
  to A (the resolver cannot see through JSDoc comments inside a const object — that is why
  `BRUSH_COLORS` initially read as runtime — nor through some nested-ternary const chains).
  The surviving 130 are enumerated individually in §4 and §5.

---

## CORRECTION (2026-07-13, orchestrator) — CK-C's shared-vocabulary premise is FALSE

§6 grouped CK-C as "the single biggest shared-vocabulary cluster" on the strength of
`patterns/data/list-toolbar/tokens.ts` EXISTING. The full inventory then checked whether anything ADOPTS it.
**Adoption is 2 of 11 components.** `list-toolbar` (itself) and `status-filter-pills` (a clean,
byte-exact adopter: all 17 imported names used, zero local reinvention). The other NINE hand-roll
their own `color-mix()` recipes — and they do not agree with each other either.

(An earlier revision of this correction said "eight for eight diverge", generalized from the
partial sample before the two adopters had been reached. Recorded rather than quietly overwritten:
an over-corrected claim is as unusable as the original wrong one.)

| file | imports `list-toolbar/tokens.ts`? | verdict |
| --- | --- | --- |
| column-menu | no | **DIVERGED** — hand-rolls a gradient language (18 of ~27 parts use `linear-gradient(180deg, …)`); the canonical `FILTER_PILL_*` is a flat `color-mix()` fill. A different recipe, not a renamed copy. |
| export-button | no | **DIVERGED** — invents a third independent hover-background token (`--ds-color-bg-hover`), alongside the canonical `FILTER_PILL_HOVER_BG` and column-menu's own. |
| scope-switcher | no | **DIVERGED** — active pill is a two-stop gradient at 14%/9% primary vs the canonical flat 8%; its border is a 42% mix vs the canonical full-opacity token; and its pills are NEVER transparent at rest, where the canonical default is `transparent`. A "glass pill" language, not a variant. |
| view-mode-switcher | no | **DIVERGED** (narrowly) — same SHAPE as the canonical active fill (a primary-tinted `color-mix` over a surface) at a different percentage (14% vs 8%) and a different base (`--ds-surface-card` vs `transparent`), plus an active `boxShadow` the canonical default does not have. |
| table-toolbar | no | **DIVERGED** — its divider is a fading gradient line with a highlight shadow; the canonical `TOOLBAR_DIVIDER` is a flat color. Its search input has a solid fill where the canonical search recipe defaults to transparent. |
| saved-views-menu | no | **DIVERGED** — an ad hoc "primary-tinted vertical gradient" language whose opacities are an unstructured spread (4, 8, 9, 12, 14, 16, 18, 20, 26, 28, 34%): every primary-tinted surface in the file picked its own percentage. Its closest cousin to the canonical token differs at 12% vs 8%. Also carries a real (invisible) CSS defect: `borderColor` is assigned the full `border` SHORTHAND string in its false branch (index.tsx:344-346), which the browser drops as invalid; the base shorthand's color happens to win, so nothing looks wrong today, but any reorder of the spread breaks the closed-state border silently. |
| saved-views (91 sites — 20% of CK-C) | no | **DIVERGED, and worse: its own three engines disagree on the SHAPE.** modern renders a pill with a SOLID `var(--ds-color-primary)` fill; the canonical `FILTER_PILL_ACTIVE_BG` is an 8% TINT. rustic and classic do not render a pill at all — they render a 2px bottom-border TAB accent. So saved-views does not merely fail to import the shared vocabulary: modern independently reinvented a pill, rustic/classic independently reinvented a tab, and the three do not agree on which the concept even IS. Unifying this onto the canonical tokens requires a PRODUCT decision (pill or tab), which a byte-exact migration cannot make. Also: rustic hand-rolls five near-identical menu-item style objects where modern shares one factory (that duplication, not a feature difference, is most of the 35-vs-56 site gap), and every rustic hover is an imperative `.style.background =` write. |
| search-command-bar, active-filters-bar, list-toolbar, status-filter-pills | not yet inventoried | — |

**Consequence for the contract.** CK-C is not one skin with one vocabulary. It is several
components that sit next to each other and independently reinvented the same concepts with
different values. Every divergent recipe must be PRESERVED as its own token set: pointing a
gradient pill at the canonical flat token flattens it, and that is a visual change — exactly
what a byte-exact migration may not do, however much the cleanup is warranted. Unifying them
is a real and probably worthwhile piece of work, but it is a DESIGN decision with its own
baselines, not a migration.

**The methodological lesson, which is the reason this correction is written down.** The
triage inferred adoption from the existence of a token file. Nobody grepped for its
importers. An assumption that cheap is exactly the kind a contract then gets built on. The
same shape recurred three times today: `--ds-steps-line-color` was assumed live and is
defined nowhere (P-73); the `personality.css` accent bar was assumed to be painting and never
renders (P-76); the `theme.css` bridge layer was assumed to be a tenant's theming surface and
is defeated by preflight (P-76). **Existence is not adoption, and a declaration is not a
render.** Measure, then contract.

**Cost note.** Six of these files were inventoried by sub-agents that burned ~1.5M tokens
between them (one file cost 523k). The remaining seven are not inventoried and CK-C's contract
is not blocked on them. Whoever resumes this: one agent, one file at a time, no delegation.
