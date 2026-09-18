# Chart paint and geometry — contract debrief (WO-FAM-09 / F-22, F-83, F-85)

Design packet. No product code is changed by this document.

- **Base** — measured at `3deaf6d4581ff24de63ee3a6fdd64e57df459139`; **re-verified at
  `daa7397885dbbc1d11b245fc3fad8c62eda1cf28`**, which is the tip after two foreign lots
  (`d1973a6d7` tenancy, `daa739788` tree) landed *while this packet was being measured*.
  The chart tree and the component CSS are byte-identical between the two commits (empty
  `git diff --stat`), and all 22 files cited in this packet hash identically at the
  measurement base, at the new HEAD and on disk (leg 0). Nothing here is measured against
  a moving tree. Branch `main`, checkout `/Users/daniel/Developer/Rottay/r4-recon-opus`.
- **Writer** — Opus seat, profile `claude-admin`. **DT / auditor / integrator** — Kimi.
  Codex is retired by owner order; this packet does not wait on it and does not
  record an ACCEPT in its name.
- **Authority** — `roadmap/family-cuts.md` (WO-FAM-09) plus the owner amendment of
  2026-09-17: *"One owner for chart theme/series resolver, shared geometry utilities
  and registration. No 18 competing paint implementations; do not split one chart's
  behavior from its skin/tests."*
- **Shape precedent** — `evidence/dnd-kernel-debrief/index.md`.
- **Base hygiene** — measurement began on a tree dirty with another writer's work
  (8 modified files, none of them a chart file). Those changes are now committed as
  `d1973a6d7` and `daa739788`. The two `family-cut` findings recorded in §6.0 belong to
  that tree lot and **persist at HEAD**: it added a `data-part="drag-handle"` (12 -> 13
  stamped parts) without re-pinning its census baseline in the same commit. Attributed,
  not inherited (leg 25).

> **Reading order for a reviewer.** §0 is the census and it overturns three premises
> that the WO text and the brief both carry. §2 is the contract. If you read only two
> sections, read §0.1 (the resolver that nothing calls), §0.4 (the two hooks that
> cannot see each other) and §2.

---

## 0. Census — measured, with the premises it overturns

Everything in this section was executed or read at the base commit. Reproduction
commands and raw output are in Appendix B; each claim below carries the leg that
produced it.

### 0.0 The shape of the tree, corrected

The brief and the WO both describe "18 chart types ... where the SAME logic is written
more than once" and ask what "the migration of `useChartTheme`'s 18 consumers" looks
like. The tree is not that shape.

```
charts/
  families/<18>/index.tsx              6 013 lines   the public components
  contracts/                             293         public prop contracts
  foundation/palettes/                    78         LEGACY palette arrays
  foundation/geometry/                     4         DEFAULT_MARGIN, one constant
  presentation/{scaffold,tooltip,crosshair,family-frame}
  runtime/
    theming/composition/react/personality/   118     useChartPersonality  (18 consumers)
    theming/presentation/react/color-theme/  332     useChartTheme        (0 consumers)
    chart-engine/
      foundation/grammar/palette/         72         resolveChartSeriesPaint (2 sinks)
      foundation/renderers/geometry/   3 583         17 pure geometry builders
      presentation/react/renderers/<17>            the SVG renderers
    exporting/foundation/file/           560         a 4th CSS-var resolution path
```

`runtime/**` is 27 194 lines against `families/**`'s 6 013. The consolidation the WO
asks for is **largely already built**; what is missing is that nothing forces the
families and the engine to agree, and two of the four paint authorities are not bound
to anything.

### 0.1 `useChartTheme` has zero consumers — the migration has no subjects

`runtime/theming/presentation/react/color-theme/index.ts` (332 lines) is a public
export with **no caller anywhere**.

- In `packages/core/src`: referenced only by the barrel that exports it
  (`charts/index.ts:41`, `charts/runtime/index.ts:25`), by a type-existence assertion
  (`tests/ChartPublicApi.test.tsx:52-54`) and by its own hook suite
  (`tests/ChartTheme.root-scope.test.tsx`). Zero component calls it. (leg 1)
- In `app-bithire`, `app-platform`, `app-evnto` and `packages/showroom`: zero
  references. (leg 2)
- Not one of the 18 families imports it (leg 3); all 18 import `useChartPersonality`.

It is not inert, though — it is a **fourth palette authority kept alive by its own
tests**. It carries 13 hardcoded hex fallbacks (`:108-121`), its own
`MutationObserver` ancestor-chain walk (`:268-279`) duplicating the one in
`css-color-resolution`, and a `categoricalFallback()` (`:123-125`) that reads the
legacy `DEFAULT_COLORS` array rather than the canonical chain.

The frozen governance manifest asserts the opposite in eleven chart family files —
`"noSocketReason": "sin socket propio; useChartTheme re-resuelve los hex contra el
modo activo"` (e.g. `governance/manifest/families/chart/basic/bar-chart/index.json:2582`).
That claim is false at HEAD and has been for as long as no family called the hook.
Per `CLAUDE.md` the manifest is preserved historical evidence and not runtime truth;
this packet records the divergence rather than repairing the frozen artifact.

**Disposition.** There is no 18-consumer migration. There is a public-symbol
retirement, which needs the same authorization class as the `useSortableList`
retirement named in `3deaf6d45`. See lot 7 (§3.2).

### 0.2 The palette table is written four times; two copies are bound, two are not

The same 50 hex values (5 schemes x 10 slots) appear in four places. Byte-equality was
computed, not eyeballed (leg 4) — all five schemes match across all three tabular
copies, and the legacy 10-value array equals the `accessible` row exactly:

| # | copy | values | bound by |
|---|---|---|---|
| 1 | `chart-engine/foundation/grammar/palette/index.ts:5-26` `LIGHT_FALLBACKS` | 50 | parity test, below |
| 2 | `tokens/css/presentation/components/patterns/index.css:668-717` `--ds-chart-{scheme}-N` | 50 light | **nothing** |
| 2b | same file `:931-980`, dark scope | 50 dark | **nothing** |
| 3 | `skin/chart-foundation/index.css:628-697` `--ds-chart-paint-N` bridge tails | 50 | parity test, below |
| 4 | `charts/foundation/palettes/index.ts:9-20` `ACCESSIBLE_COLORS` | 10 | **nothing** |

The parity lock is real and I had to correct my own first reading of it:
`renderers/tests/SvgRenderers.test.tsx:90-91` asserts, for every scheme, that
`chart-foundation/index.css` literally contains
`--ds-chart-paint-${i}: ${resolveChartSeriesPaint(scheme)[i]};`. Copies 1 and 3 cannot
drift.

Copies 2, 2b and 4 are unbound. The only in-repo mentions of `--ds-chart-{scheme}-N`
outside CSS are **test fixtures that inject stub values** to prove the chain reads the
channel above the literal (`ChartPalette.resolution.test.ts:84,91,99` inject
`'--ds-chart-accessible-1': '#7db7e8'`, which is the *dark* value). Nothing asserts
that the 100 values actually registered in `patterns/index.css` equal the 50 the TS
module promises as its light tail, or that the dark row is a legitimate dark rendering
of the light one. (leg 5)

### 0.3 The live external surface: 34 call sites, and the dominant one is the broken branch

Measured across the three apps and the showroom (leg 6):

| value | app-bithire | app-platform | app-evnto | showroom |
|---|---|---|---|---|
| `colorScheme="monochrome"` | 0 | **25** | 0 | 0 |
| `colorScheme="accessible"` | 7 | 0 | 0 | 0 |
| `colorScheme="default"` | 0 | 2 | 0 | 0 |
| `colors={...}` | 3 | 0 | 10 | 0 |

`useChartPersonality` splits on the scheme name
(`runtime/theming/composition/react/personality/index.ts:99-101`):

```ts
const colors = scheme === 'default' || scheme === 'accessible'
  ? LEGACY_SERIES_PAINT                       // the canonical chain
  : COLOR_SCHEME_MAP[scheme] ?? LEGACY_SERIES_PAINT;   // raw ramp reads
```

`COLOR_SCHEME_MAP` resolves `monochrome`/`pastel`/`vibrant` to arrays of
`var(--ds-color-primary-900)`, `var(--ds-color-info-200)` and so on
(`foundation/palettes/index.ts:30-69`) — expressions with **no `--ds-chart-category-N`
and no `--ds-chart-series-N` in them at all. So the 25 app-platform monochrome charts,
the largest single cohort of chart call sites in the estate, are structurally unable
to receive a tenant-authored or compiler-generated chart palette. Confirmed by
execution in §0.5.

### 0.4 Root cause: two personality hooks, and the renderer cannot see the family's props

This is the finding the rest of the contract turns on.

| hook | owner | options-aware | exposes | consumers (non-test) |
|---|---|---|---|---|
| `useChartPersonality(options)` | `charts/runtime/theming/composition/react/personality` | **yes** | `colors`, motion, dots | **the 18 families**, and nothing else |
| `useResolvedChartPersonality()` | `infrastructure/runtime/personality/presentation/resolution/chart-personality` | **no** | `colorScheme`, `lineStyle`, … | **11 renderer/projection owners**, and no family |

(leg 7. The split is clean and total: no family calls the token-only hook, no renderer
calls the options-aware one.)

`ChartRendererSurfaceProps` (`renderers/index.tsx:24-46`) has **no `colorScheme`
member**, so a family structurally cannot tell its renderer which scheme it resolved.
The surface therefore stamps the scope from tokens alone:

```
renderers/index.tsx:81          const colorScheme = chartPersonality.colorScheme ?? 'default';
renderers/index.tsx:115         data-chart-color-scheme={colorScheme}
projection/frame/index.tsx:127  const colorScheme = chartPersonality.colorScheme ?? 'default';
```

and `ChartPersonalityTokens.colorScheme` is optional
(`foundation/contracts/kernel/tokens/personality/index.ts:76`) and `undefined` on the
composed baselines (`themes/iso/index.ts:640`; and
`tests/bithire-chart-palette.test.ts:34-36` pins `charts.colorScheme` as undefined for
BitHire, with its docblock recording that **no preset document decides a chart scheme
at all**).

The consequence: **every chart in the estate stamps `data-chart-color-scheme="default"`**,
whatever the app asked for.

Of the 18 families, only 8 even forward `colorScheme` into their own hook — area, bar,
calendar-heat-map, line, pie, radar, sparkline, tree-map. The other 10 call
`useChartPersonality({ animate, tooltip })` and drop it (leg 8). Five of those ten
(funnel, gantt, network-graph, sankey, scatter) declare `ChartColorsProps` without
`ChartColorSchemeProps`, so they cannot be scheme-switched through any public route.

### 0.5 EXECUTED — the divergence, three ways

`BarChart` rendered under `renderSurface`, reading the stamped scope and the mark's
inline paint (leg 9, `/private/tmp/fam09/scheme-divergence.test.tsx`):

```
requested "default"      stamped scope "default"
                         mark inline   var(--ds-chart-category-1, var(--ds-chart-series-1,
                                           var(--ds-chart-accessible-1, #2f6b9a)))
                         scope bridge  var(--ds-chart-category-1, var(--ds-chart-series-1,
                                           var(--ds-chart-default-1,   #0f766e)))

requested "monochrome"   stamped scope "default"        <- prop ignored
                         mark inline   var(--ds-color-primary-900)   <- outside the chain

requested "vibrant"      stamped scope "default"        <- prop ignored
                         mark inline   var(--ds-color-primary-700)   <- outside the chain
```

Three distinct defects in one readout:

1. **The prop never reaches the scope.** monochrome and vibrant both stamp `default`.
2. **`default` paints `accessible`.** `LEGACY_SERIES_PAINT` is
   `resolveChartSeriesPaint('accessible')` (`personality/index.ts:29`), so asking for
   the `default` scheme paints the `accessible` hexes inline while the scope's bridge
   resolves the `default` ones. The module's own docblock (`:18-28`) declares this
   alias deliberate and temporary.
3. **monochrome/vibrant leave the governed chain entirely** — `var(--ds-color-primary-900)`
   has no `--ds-chart-category-N` tier, so a tenant palette cannot reach it.

### 0.6 EXECUTED — two paint authorities on one page

Same page, same configuration, no `colorScheme` prop on either
(leg 10, `/private/tmp/fam09/inline-vs-bridge.test.tsx`):

```
barScope "default"   barMarkInline "--ds-chart-mark-color: var(--ds-chart-category-1,
                                     var(--ds-chart-series-1,
                                     var(--ds-chart-accessible-1, #2f6b9a)));"
pieScope "default"   pieMarkInline null      pieSliceFillAttr null   pieMarkSeriesIndex "0"
```

Bar's mark carries its own inline paint and wins over the skin. Pie's mark carries
none and defers to `chart-foundation/index.css:824-829`, which under
`[data-chart-color-scheme='default']` sets `--ds-chart-paint-1` from
`var(--ds-chart-default-1, #0f766e)` (`:628`). So a bar and a pie on the same
dashboard, with identical props and the same stamped scope, take their first series
colour from **different scheme tables**.

The CSS-cascade half of that conclusion is derived from measured text, not observed in
a browser: happy-dom does not apply the stylesheet. **The browser leg is owed by the
implementation lot** (§6.4), and it is the one claim in this packet that a reviewer
should treat as PLAUSIBLE rather than CONFIRMED.

### 0.7 Paint is written five ways, but the families split into four paint MODELS

Only ten families share the "cycle a categorical palette" problem, and even they
express it five different ways:

```
area-chart:49    areaColor(palette, i)            arrayValueAt(..., i % len) ?? FALLBACK_AREA_COLOR
bar-chart:70     resolvePaletteColor(palette, i)  arrayValueAt(..., i % len) ?? FALLBACK_BAR_COLOR
line-chart:57    lineColor(palette, i)            arrayValueAt(..., i % len) ?? FALLBACK_LINE_COLOR
pie-chart:161    palette[i % palette.length]                       no fallback
sankey:880       palette[i % palette.length]                       no fallback
network-graph:270 palette[idx % palette.length]                    no fallback
scatter:204      palette[index % palette.length] ?? 'var(--ds-color-primary)'
```

Three identically-shaped helpers under three names, plus three raw index expressions
with no fallback, plus one with an inline fallback. And the prop-override line is
byte-identical in **ten** families (leg 11):

```ts
const palette = colors && colors.length > 0 ? colors : chartPersonality.colors;
```

at `area-chart:122`, `bar-chart:167`, `funnel-chart:80`, `gantt-chart:81`,
`line-chart:159`, `pie-chart:108`, `radar-chart:74`, `sankey:574`, `scatter` (absent —
see below), `tree-map:100`, `network-graph:228`.

**But the other eight families do not have this problem at all.** Measured paint model
per family (leg 12):

| model | families | how colour is decided |
|---|---|---|
| **categorical** (11) | area, bar, funnel, gantt, line, network-graph, pie, radar, sankey, scatter, tree-map | cycle N slots by series index |
| **sequential** (2) | heat-map, calendar-heat-map | a 2-stop ramp quantized into steps (`heat-map:28-29`, `calendar-heat-map:34-35`) |
| **semantic** (3) | gauge, waterfall, bullet | tone-bound: `--ds-color-error/warning/success` (`gauge:78-80`), increase/decrease/total (`waterfall:97-99`), a 3-tier range (`bullet:61-71`) |
| **single** (2) | sparkline, histogram | one colour plus an accent (`sparkline:108`, `histogram:94,97`) |

11 + 2 + 3 + 2 = 18. **This taxonomy is the answer to "what moves into the resolver
versus stays per-chart"** and it is why a single flattened resolver would be the
lowest-common-denominator outcome the brief warns against: forcing a gauge's
error/warning/success arcs or a heat map's ramp through a categorical slot machine
would destroy exactly the per-chart detail that carries the premium signature.

### 0.8 `ScatterChart` declares `colors` and silently discards it

`scatter/index.tsx` extends `ChartColorsProps` (`:26`, `:70`) but never destructures
`colors`; `:145` reads `const palette = chartPersonality.colors;` unconditionally. The
file header (`:13-17`) records this as deliberate — per-point `color` and `colors[]`
"were arbitrary hex sinks. They are DROPPED here". Deliberate or not, the prop is in
the public type, so `<ScatterChart colors={['#ff0000']} />` type-checks and does
nothing. Executed (leg 9): scatter `containsSuppliedColor: false`; pie, the control,
`true`. Whatever the contract decides, it must decide it once for all 18 — today two
families with the same declared prop behave oppositely.

### 0.9 `data-series-index`: one attribute, three meanings, three domains

The attribute is load-bearing in four skins. Its stamped domain is decided per family
and its *meaning* differs per family (legs 13, 14):

| family | stamped | CSS keys | what the rule does |
|---|---|---|---|
| pie, scatter | `% 10` (family) / raw (scatter renderer `:308`) | 0..9 | **paint slot** -> `--ds-chart-paint-N` (`chart-foundation:824-891`) |
| line, area | `% 5` | 1..4 | tint / dash cadence |
| radar | **raw, unbounded** (`radar-chart:122`, `renderers/radar:250`) | 1..4 | `stroke-dasharray` cadence |
| bar | `% 10` | 1,3,5,7,9 | hollow/solid alternation, **inside `@media (forced-colors: active)`** |

Executed with 6, 7 and 12 series: radar stamps `0,1,2,3,4,5`; line and area wrap at 5;
scatter wraps at 10; bar stamps 0..6 raw for 7 series.

**Two corrections to my own first reading, recorded because they change the finding.**
I initially wrote up radar's unbounded index and bar's odd-only keys as live paint
defects. Both are wrong. `chart-radar/index.css:17-20` documents the raw stamp
deliberately and a 6th series simply gets no dash — graceful, not broken. Bar's odd
keys are a forced-colors hollow/solid alternation
(`chart-foundation/index.css:1237` opens `@media (forced-colors: active)`, rule at
`:1255-1270`) and are correct by design.

The real finding is narrower and survives: **`data-series-index` has no owner.** Three
different quantities — paint slot, cadence index, forced-colors parity — ride one
attribute name, each family picks its own modulus, and each skin re-states its
expectation in a prose comment that no instrument checks. The contract must separate
the quantities, not merely unify the modulus.

### 0.10 Geometry is already one owner; the remaining debt is locale and two outliers

`chart-engine/foundation/renderers/geometry/index.ts` is 3 583 lines with 116 exports
and **17 pure `buildSvg*Geometry` builders** — bar, barSeries, pie, gauge, radar,
funnel, line, scatter, heatMap, bullet, treeMap, calendarHeatMap, gantt, area,
sparkline, histogram, waterfall. 14 of 18 families import it directly (leg 15). The
brief's premise that "geometry utilities [are] duplicated across chart types" does not
hold for the engine path: the duplication was already retired.

What is left:

1. **Locale inside pure geometry** — exactly what WO step 4 names.
   `geometry/index.ts:2459` `const CALENDAR_DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']`
   and `:2558` `timeMonday.floor(startDate)`. Hardcoded English labels and a hardcoded
   Monday week-start in a module whose contract is "geometry without colour or locale".
2. **Two families outside the engine, and they are outside it twice over.** `sankey`
   (`:55`, `scaleLinear` + `select`) and `network-graph` (`:41-44`, `forceSimulation`
   and friends) are the only non-test modules importing d3 besides geometry itself and
   a type-only import in `crosshair` (leg 16). They are also **the only two families
   that render imperatively**: `sankey:614` `select(mount)` through `:849`, and
   `network-graph:262-283` `select(mount).append('defs')...`, 15 imperative call sites
   between them. The other 16 families render React-owned SVG (leg 27). So these two
   carry two separate debts — a geometry debt and a rendering-model debt — and the
   second is the larger one.

   They are also not the same case as each other. **sankey already has a separable
   pure layout**: `computeLayout` at `:330-470` takes nodes and links to coordinates
   with `scaleLinear` (`:415-416`) and touches no DOM. **network-graph's
   `forceSimulation` is stateful, tick-driven and drag-interactive** (`:305`) and is
   not geometry at all. Treating them alike would be the mistake (§5(c)).
3. **`DEFAULT_MARGIN`** lives alone in `foundation/geometry/index.ts` (4 lines) while
   `DEFAULT_CARTESIAN_INSETS` / `DEFAULT_HEATMAP_INSETS` / `DEFAULT_RADIAL_INSETS` /
   `DEFAULT_FUNNEL_INSETS` live in the engine (`geometry:60-74`, `:1321`). Two owners
   for the same concept.

### 0.11 Accessibility, measured per family

17 of 18 route their accessible description through the one scaffold; `sparkline` is
the single outlier, stamping its own `role="img"` and calling no `describeChart`
(leg 17).

What `ChartScaffold` gives those 17 (`presentation/scaffold/index.tsx`):
`role="img"` with `aria-roledescription="interactive chart"` (`:448-449`),
`aria-labelledby` / `aria-describedby` (`:461-462`), an arrow/Home/End keyboard walk
over summary items with `aria-live="polite"` announcement (`:248`, `:425`),
`aria-keyshortcuts` (`:463`), a visually-hidden `<table data-part="summary-table">`
(`:141`), and `role="alert"`/`aria-live="assertive"` on the error state (`:366-368`).

`ChartDataAccess` (`chart-engine/presentation/react/access/index.tsx`, 314 lines) is
the richer affordance — a disclosure with `role="region"`, a `<caption>`,
`aria-rowcount`/`aria-rowindex`, paging with a `role="status"` live region, and CSV
export. It has **zero in-DS consumers**; it is published at
`entrypoints/charts/access/index.ts` and composed by exactly one app screen
(`app-bithire .../teams/.../performance/index.tsx:43`). That is an intentional
composition boundary, not dead code, and the contract should keep it that way rather
than fold it into the families.

**The zero baselines**, both measured by absence across the whole chart tree (leg 18):

- **RTL / direction: nothing.** No `dir=`, no `useOptionalDirection`, no logical-axis
  handling anywhere under `charts/`.
- **i18n: one string.** `useTranslation` is called by exactly one chart module,
  `personality/index.ts:79`, for `chart.loading`. Every other label is app-supplied —
  except the hardcoded `CALENDAR_DAY_LABELS` of §0.10.
- **Shared kernels: none.** `useInteractionState`, `useFieldOverlay`,
  `resolveSubmitIntent`, `useOptionalDirection` have **0 consumers** in `charts/`.
  Charts run their own `useChartInteraction` controller (918 lines). WO step 3 asks
  for these kernels; two of them (`useFieldOverlay`, `resolveSubmitIntent`) are form
  concepts with no meaning for an SVG mark. This is a reviewer question, §8 Q4.

### 0.12 Skins: 18 roots, 14 files, and 5 families painted from two files

Every family has a `.ds-chart-<family>` root (leg 19). But eleven have their own skin
file while **seven share one 465-line `chart-c/index.css`** — funnel, gauge, histogram,
network-graph, sankey, scatter, sparkline — whose own header calls itself
"visualization chart slice C", a migration-era grouping.

Worse for the WO's "do not split one chart's behavior from its skin": **bar, line,
pie, scatter and heat-map are painted from two files** — their own `chart-<family>`
skin plus `.ds-chart-renderer-<family>` rules inside `chart-foundation/index.css`. Two
class-namespace conventions coexist, `ds-chart-<family>` (family-owned) and
`ds-chart-renderer-<family>` (renderer-owned), against the WO's "one class namespace".

Inline drain surface, for sizing: 40 `style={{` sites across the 18 families and 12
across the renderers (leg 20).

### 0.13 Four independent CSS-var resolution paths

1. `useChartTheme` -> `resolveCssColor` over `getComputedStyle` — **dead** (§0.1).
2. `useChartPersonality` -> `resolveChartSeriesPaint` -> `var()` chains resolved by the
   browser cascade — the families' path.
3. the `--ds-chart-paint-N` bridge in `chart-foundation` — the renderers' path.
4. `exporting/foundation/file/index.ts` -> `resolveCssColor` over computed styles
   (`:109`, `:159-163`, `:176-184`, `:216-221`, `:420`, `:439`) — bakes concrete
   colours into exported SVG/PNG.

Path 4 is the export owner the brief scopes into FAM-09, and it is the reason the
resolver cannot be "CSS only": export must be able to ask the resolver for a
**concrete** colour, not an expression. The contract in §2 gives it a typed door
instead of a second `getComputedStyle` walk.

### 0.14 `ChartFamilyFrame` — WO step 4 says delete it; it is public and unused

`presentation/family-frame/index.tsx` (248 lines) is exported from both
`charts/index.ts` and `entrypoints/charts/index.ts`, and has **zero consumers** in the
DS, in all three apps and in the showroom (leg 21). Deleting it is safe behaviourally
and is a public-API break, so it lands with lot 7, not with a family lot.

### 0.15 The acceptance instrument does not cover charts at all

`scripts/check/family-cut/index.mjs` — the gate WO-FAM-09's acceptance names — has a
**77-family roster containing not one chart** (leg 22). Its per-family arms include
`variantContract`, `stateContract`, `dndKernelDeclared`, `adaptSlot` and
`skeleton.renderer`. Several are meaningless for an SVG family. Adding 18 chart rows
is therefore not a config edit; it needs a per-arm adjudication, and it is the largest
single piece of work in the acceptance story (§6.1).

The one chart-specific gate that does exist is clean at base:
`scripts/check/tokens/contracts/chart-series/index.mjs` reports
`files scanned: 2835 / allowlisted definer occurrences: 10 / violations: 0` (leg 23).
It guards one thing only — that nothing but the compiler *defines*
`--ds-chart-series-N`. It says nothing about who *produces* a paint expression.

---

## 1. What WO-FAM-09 asks, and where this packet diverges from its text

The WO text was written before the engine consolidation landed. Four of its step-4
clauses are still exactly right; three of its premises are not. Recorded here so the
DT adjudicates the delta rather than discovering it mid-implementation.

| WO step 4 clause | status at base | this packet |
|---|---|---|
| "Delete `useChartTheme`" | correct, and cheaper than it sounds — 0 consumers (§0.1) | lot 7, needs public-API authorization |
| "and the personality bifurcation" | correct — the `COLOR_SCHEME_MAP` branch (§0.3) | lot 2, with a declared visual change on 25 call sites |
| "geometry without colour or locale (`'Mon'`, `timeMonday`, `DEFAULT_COLORS` out)" | correct, all three named items exist at the lines the WO implies (§0.10) | lot 6 |
| "`family-frame` deleted" | correct, 0 consumers, but public (§0.14) | lot 7 |
| "rewrite `bithire-chart-palette.test`" | correct — the test pins the branch being deleted (`:38-49`) | lot 2 |
| "series painted by `var(--ds-chart-paint-N)`" | **too narrow.** Only the 11 categorical families have slots; a gauge arc, a heat-map ramp and a waterfall bar do not (§0.7) | §2.3 gives four paint models that share one precedence chain |
| "adopt the shared kernels (`useFieldOverlay`, `resolveSubmitIntent`, listbox/calendar kernels)" | **partly inapplicable** — these are form and overlay concepts; 0 of them have meaning for an SVG mark (§0.11) | §8 Q4 asks the DT to scope step 3 to `useOptionalDirection` and the interaction state |
| "one class namespace `ds-<family>`" | today `ds-chart-<family>` **and** `ds-chart-renderer-<family>` coexist, and 5 families paint from two files (§0.12) | §2.6 |

The brief's own framing of "`useChartTheme`'s 18 consumers" and of duplicated geometry
is corrected by §0.1 and §0.10 respectively.

---

## 2. The proposed contract

### 2.0 The proposal in one paragraph

Charts already have one geometry owner and one canonical precedence chain. What they
do not have is **one place where a chart's paint decision is made**, which is why the
family and its own renderer resolve the scheme from two different hooks and disagree
(§0.4, §0.5). The proposal is a single resolver, `useChartPaint`, that resolves the
decision **once per chart** and publishes it on a context that the family, its
renderer, its legend and the export path all read — so they cannot disagree by
construction. The resolver is not a flattening: it resolves a **paint model** declared
per family in a typed registry, and only the `categorical` model is a slot machine.
The `sequential`, `semantic` and `single` models keep their own shapes and share only
the precedence chain, so a tenant palette reaches a heat map's ramp and a gauge's arcs
without a gauge pretending to have ten categorical series. Geometry stays where it is
and loses its locale.

### 2.1 Placement

```
charts/
  foundation/registry/index.ts          NEW  the typed family registry (§2.2)
  runtime/theming/
    foundation/paint/index.ts           NEW  pure resolution, no React (§2.3)
    composition/react/paint/index.ts    NEW  useChartPaint + ChartPaintProvider (§2.4)
    composition/react/personality/      KEEP motion/dots/tooltip only; `colors` removed
    presentation/react/color-theme/     DELETE (lot 7)
  foundation/palettes/index.ts          DELETE (lot 2) — its four arrays are the bifurcation
  foundation/geometry/index.ts          MERGE into the engine geometry owner (lot 6)
```

`chart-engine/foundation/grammar/palette` (`resolveChartSeriesPaint`) **stays exactly
as it is**. It is correct, it is parity-locked to the CSS bridge, and it becomes the
`categorical` model's implementation inside the new resolver. Nothing in this proposal
rewrites the precedence chain; the chain is the one thing in the current tree that is
already right.

### 2.2 The registry — one typed row per family

```ts
export type ChartPaintModel = 'categorical' | 'sequential' | 'semantic' | 'single';

export interface ChartFamilyRow {
  /** Stable id; equals the family folder basename. */
  readonly id: ChartFamilyId;
  /** The single class namespace this family's skin may use. */
  readonly namespace: `ds-chart-${string}`;
  readonly paintModel: ChartPaintModel;
  /**
   * Size of this family's own per-series cadence (dash, tint, hollow/solid).
   * Distinct from the paint slot count. `null` when the family has no cadence.
   */
  readonly cadenceSize: number | null;
  /** Whether the public `colors` prop is honoured. One answer for all 18. */
  readonly honoursColorsProp: boolean;
  readonly geometry: 'engine' | 'family-owned';
  readonly a11y: 'scaffold' | 'own';
}

export const CHART_FAMILY_REGISTRY: Readonly<Record<ChartFamilyId, ChartFamilyRow>>;
```

Measured seed values (from §0.7, §0.9, §0.11, §0.12) — this is a census row, not a
target row; the lots move `family-owned` to `engine` and `own` to `scaffold` where
§3.2 says so:

| id | paintModel | cadenceSize | geometry | a11y |
|---|---|---|---|---|
| area, bar, line | categorical | 5 (area/line), 2 (bar, forced-colors) | engine | scaffold |
| pie, scatter | categorical | null | engine | scaffold |
| radar | categorical | 5 | engine | scaffold |
| funnel, gantt, tree-map | categorical | null | engine | scaffold |
| sankey | categorical | null | family-owned | scaffold |
| network-graph | categorical | null | family-owned | scaffold |
| heat-map, calendar-heat-map | sequential | null | engine | scaffold |
| gauge, waterfall, bullet | semantic | null | engine | scaffold |
| histogram | single | null | engine | scaffold |
| sparkline | single | null | engine | **own** |

**Why a registry rather than a convention.** Six lists describe the 18 families today
and none is derived from another: the `families/index.ts` barrel, `charts/index.ts`,
`entrypoints/charts/`, the showroom `data/registry/charts.ts`, the frozen governance
manifest, and the `family-cut` roster (which omits all 18, §0.15). The registry makes
the roster and the gates projections of one row set, which is the mechanical part of
"no 18 competing implementations".

### 2.3 The pure resolver

No React. This is what export, tests and the gates call.

```ts
export interface ChartPaintRequest {
  readonly family: ChartFamilyId;
  /** The component prop. Highest precedence. */
  readonly scheme?: ChartColorScheme;
  /** The token decision. */
  readonly tokenScheme?: ChartColorScheme;
  /** The public `colors` prop, honoured only when the registry row says so. */
  readonly override?: readonly string[];
}

export interface ChartPaintDecision {
  readonly family: ChartFamilyId;
  readonly model: ChartPaintModel;
  /** prop > token > 'default'. This value is what gets stamped. */
  readonly scheme: ChartColorScheme;
  /** Present only when model === 'categorical'. */
  readonly categorical: ChartCategoricalPaint | null;
  /** Present only when model === 'sequential'. */
  readonly sequential: ChartSequentialPaint | null;
  /** The attributes the family MUST stamp on its renderer root. */
  readonly rootAttributes: ChartPaintRootAttributes;
  /** True when `override` was supplied AND the registry honours it. */
  readonly overridden: boolean;
}

export interface ChartCategoricalPaint {
  /** Exactly CHART_CATEGORICAL_SIZE consumption expressions. */
  readonly slots: readonly string[];
  /** THE modulus. The only place `% n` is written for paint. */
  slotIndexFor(seriesIndex: number): number;
  /** slots[slotIndexFor(i)] — never indexed by hand. */
  paintFor(seriesIndex: number): string;
  /** null when the registry row has cadenceSize === null. */
  cadenceIndexFor(seriesIndex: number): number | null;
}

export interface ChartSequentialPaint {
  readonly stops: readonly [string, string];
  readonly steps: number;
  stopFor(t: number): string;
}

export interface ChartPaintRootAttributes {
  readonly 'data-chart-color-scheme': ChartColorScheme;
  readonly 'data-chart-paint-model': ChartPaintModel;
}

export function resolveChartPaint(request: ChartPaintRequest): ChartPaintDecision;

/** The export door (§0.13 path 4): expressions -> concrete colours, once. */
export function materializeChartPaint(
  decision: ChartPaintDecision,
  owner: Element,
): ChartMaterializedPaint;
```

Four decisions inside that shape, each answering a question the brief asks:

**(a) `slotIndexFor` is the only modulus.** Today seven expressions compute it (§0.7)
and four different domains are stamped (§0.9). One function owns it, at
`CHART_CATEGORICAL_SIZE` (10), for every categorical family.

**(b) Cadence is a separate quantity with a separate attribute.** `cadenceIndexFor`
feeds a new `data-series-cadence`, and `data-series-index` becomes **the paint slot and
nothing else**. This is what lets radar keep its four dashes and bar keep its
forced-colors alternation without either of them redefining what a series index means.
Without this split, unifying the modulus to 10 would silently break line and area,
whose skins key 1..4 (§0.9).

**(c) `semantic` and `single` families get no slot machine.** A gauge's
error/warning/success arcs are a *meaning*, not a category; the resolver returns
`categorical: null` for them and they keep their own typed tone props. What they gain
is the precedence chain — their tone reads go through the same
`category > series > scheme-channel > literal` tiering, so a tenant can restyle them
without the DS inventing ten gauge series. **This is the answer to "how does a chart
opt out of a resolver default when its visual language genuinely differs": it does not
opt out, it declares a different model, and the registry type makes the wrong model a
compile error rather than a silent divergence.**

**(d) `overridden` is one rule for all 18.** Today pie honours `colors` and scatter
discards it while both declare the prop (§0.8). The registry decides per family and the
type system removes the prop from families whose row says `honoursColorsProp: false` —
so the discard becomes a compile error at the call site instead of silence at runtime.

### 2.4 The React door — one decision, one context

```ts
export function useChartPaint(request: Omit<ChartPaintRequest, 'tokenScheme'>): ChartPaintDecision;
export const ChartPaintProvider: React.FC<{ decision: ChartPaintDecision; children: ReactNode }>;
/** Renderers and legends READ; they never resolve. Throws outside a provider. */
export function useChartPaintDecision(): ChartPaintDecision;
```

The law that fixes §0.5:

> **The family resolves. Everyone else reads.** `useChartPaint` is callable only from a
> family root. A renderer, a legend, a tooltip or a projection frame calls
> `useChartPaintDecision()`, which reads the context the family published. The renderer
> surface stamps `decision.rootAttributes`, so the stamped scope is by construction the
> scheme the family resolved.

`ChartRendererSurfaceProps` gains no `colorScheme` prop — passing the decision down as
a prop would let a caller pass a different one. The context makes divergence
unrepresentable rather than merely discouraged.

`useResolvedChartPersonality()` keeps its other eleven readers for motion, line style
and dots. It stops being a paint authority: `colorScheme` is read **only** by
`resolveChartPaint` as the `tokenScheme` tier.

### 2.5 What the resolver does NOT model (scope clause)

- It does not decide geometry, scales, ticks or layout. Those stay in the engine
  geometry owner.
- It does not decide motion, dots, curve or tooltip style. Those stay in
  `useChartPersonality`.
- It does not define `--ds-chart-series-N`. The reserved-name law
  (`scripts/check/tokens/contracts/chart-series/index.mjs`) is unchanged and the
  resolver stays a consumer.
- It does not own per-family skins. A family's hover, elevation, dash rhythm, tile
  padding and label posture remain the family's own, which is where the premium
  signature lives.
- It does not touch Classic or Rustic. Charts are engine-agnostic D3; there are no
  chart `engines/{classic,rustic}` directories to freeze or thaw.

### 2.6 Namespace and skin consolidation

One namespace per family, `ds-chart-<family>`, and one skin file per family:

- the `.ds-chart-renderer-<family>` rules in `chart-foundation` move into the owning
  family's skin (bar, line, pie, scatter, heat-map — the five split families of §0.12);
- `chart-foundation` keeps only genuinely shared chrome: the `--ds-chart-paint-N`
  bridge, scaffold, tooltip, brush, frame, data-access;
- `chart-c/index.css` is split into its seven family files.

`.ds-chart-renderer` (the shared surface root) survives as shared chrome; it is not a
family namespace.

### 2.7 Geometry

- `CALENDAR_DAY_LABELS` (`geometry:2459`) and the `timeMonday` week-start (`:2558`)
  become required inputs on `BuildSvgCalendarHeatMapGeometryOptions`:
  `{ weekStart: 0..6; dayLabels: readonly string[] }`. The family supplies them from
  i18n. Geometry stops knowing a language or a calendar convention.
- `DEFAULT_MARGIN` moves from `charts/foundation/geometry` into the engine geometry
  owner beside the four `*_INSETS` constants; `charts/foundation/geometry/` is deleted.
- **sankey**: `computeLayout` (`:330-470`) is already pure and becomes
  `buildSvgSankeyGeometry`, the 18th builder — a lift, not a rewrite. Its **imperative
  render** (`:614-849`) is a separate, larger piece of work and is scoped out of this
  cut: moving the layout does not require converting the renderer, and fusing the two
  would make one lot carry both a mechanical lift and a rendering-model change.
- **network-graph**: its `forceSimulation` is stateful and animated and is **not**
  geometry. It stays in the family as a declared exception with a named reason, and
  only its *paint* joins the resolver. A reviewer who wants it moved should read §5(c)
  first.
- **Both** keep their imperative D3 rendering for now. Converting sankey and
  network-graph to React-owned SVG is a real work order and it is **not** this one;
  §8 Q7 asks whether the DT wants it scheduled behind FAM-09 or folded into it.

---

## 3. Owners and write set

### 3.1 The kernel lot — singleton owner, no family touched

`charts/foundation/registry/**`, `charts/runtime/theming/foundation/paint/**`,
`charts/runtime/theming/composition/react/paint/**`, plus the registry's own tests.
Adds the 18 rows and the resolver; changes no rendering. Lands green with every
existing chart suite untouched, which is the proof that it is additive.

### 3.2 Adoption lots, in order

| lot | scope | pin state |
|---|---|---|
| **0** | kernel (§3.1) | no visual change; all chart suites byte-stable |
| **1** | wire `ChartPaintProvider` into the 18 family roots and make `ChartRendererSurface` stamp `decision.rootAttributes` | **fixes §0.5(1).** Scope stamps now follow the prop. Visual change on the 25 monochrome + 7 accessible + 2 default call sites |
| **2** | delete the bifurcation: `COLOR_SCHEME_MAP`, `PASTEL/VIBRANT/MONOCHROME_COLORS`, `ACCESSIBLE_COLORS`, `DEFAULT_COLORS`; rewrite `bithire-chart-palette.test` | **declared visual change.** monochrome/pastel/vibrant leave the `--ds-color-primary-N` ramp and enter the governed chain. This is the fix that makes a tenant palette reach app-platform at all |
| **3** | de-alias `default` from `accessible` (`personality:29`) | **owner decision, §8 Q1.** Largest blast radius in the programme: every chart with no authored scheme, which per §0.4 is all of them |
| **4a** | bar, line, area onto `paintFor`/`slotIndexFor`; `data-series-cadence` split | per-family baseline re-pin |
| **4b** | pie, scatter, radar | scatter's `colors` prop resolved per §2.3(d) |
| **4c** | funnel, gantt, tree-map, sankey, network-graph | sankey geometry moves in lot 6, not here |
| **5a** | heat-map, calendar-heat-map onto the `sequential` model | |
| **5b** | gauge, waterfall, bullet onto `semantic` | tone reads gain the precedence chain |
| **5c** | histogram, sparkline onto `single`; sparkline adopts the scaffold (§0.11) | sparkline is the one a11y outlier |
| **6** | geometry locale purge; `DEFAULT_MARGIN` merge; `buildSvgSankeyGeometry` | |
| **7** | public retirements: `useChartTheme`, `ChartFamilyFrame`, the palette arrays | **changeset + public-API authorization**, same class as `useSortableList` |
| **8** | skin consolidation (§2.6): split `chart-c`, un-split the five two-file families | |
| **9** | RTL and i18n baselines (§0.11), pending §8 Q3 | |

### 3.3 Why lot 1 is separate from lots 4-5

Lot 1 alone fixes the defect with the widest live blast radius (§0.5) and it touches
no per-family paint expression. Fusing it into the family lots would make each family's
baseline re-pin carry both a mechanical migration and a real visual change, and no
reviewer could tell them apart in a diff. Same reasoning as the DnD packet's split of
transport from operability.

---

## 4. Invariants

1. **Frozen engines are untouched.** Charts are engine-agnostic D3 and have no
   `engines/{classic,rustic}` directories. No work order in this lot adds content,
   tokens or tests to Classic or Rustic.
2. **The precedence chain is not rewritten.**
   `category > series > scheme-channel > literal` stays exactly as
   `resolveChartSeriesPaint` implements it, and the
   `SvgRenderers.test.tsx:90-91` parity lock to `chart-foundation` stays green through
   every lot.
3. **`--ds-chart-series-N` is never defined by the DS.** The reserved-name gate stays
   at 0 violations, with its allowlist unchanged.
4. **Status tokens are never borrowed for a category.** `resolveChartSeriesPaint`'s
   docblock rule holds; the `semantic` model is the only place `--ds-color-error` and
   friends appear, and there they are the meaning, not a slot.
5. **The accessible scheme's audited values do not move.** Whatever §8 Q1 decides
   about `default`, the ten `accessible` hexes and their WCAG 3:1 guarantee
   (`ChartPalette.contrast.test.ts`) are unchanged.
6. **Per-family a11y posture is preserved or improved, never reduced.** The scaffold's
   `role="img"` + `aria-roledescription` + live summary + hidden table survives every
   lot; sparkline gains it in 5c.
7. **`ChartDataAccess` stays app-composed.** Its single external consumer keeps
   working; no lot folds it into a family.
8. **No behaviour change on adoption, per family, except where declared.** Lots 4-5
   are mechanical: same colours, same order, same DOM, with the modulus and the
   attribute split as the only deltas. Lots 1, 2 and 3 carry declared visual changes
   and each names its call sites.
9. **Every extraction leaves a deployable state.** Each lot is independently green.

---

## 5. Alternatives considered

### (a) Keep two hooks; add `colorScheme` to `ChartRendererSurfaceProps`

The minimal fix for §0.5(1): give the surface the prop and let each family pass its
resolved scheme down. **Rejected.** It makes the two authorities agree *by convention*
at 18 call sites, and a 19th family — or a renderer reached through
`projection/frame/index.tsx`, which stamps the same attribute from the same token hook
at `:127` — reintroduces the divergence silently. No gate can distinguish "the family
forgot to pass it" from "the family chose the token scheme". The context in §2.4 makes
the divergence unrepresentable instead, and it costs one provider per family root.

### (b) One flat resolver for all 18 families

What the WO's "series painted by `var(--ds-chart-paint-N)`" reads like literally.
**Rejected**, and this is the brief's own warning made concrete: of the 18 families,
7 have no categorical series at all (§0.7). A gauge would need its
error/warning/success arcs expressed as slots 1-3 of a categorical palette, at which
point a tenant switching to `monochrome` turns a gauge's danger band into a shade of
blue. The four-model registry keeps the shared precedence chain while refusing the
shared *shape*.

### (c) Move network-graph's force simulation into the geometry owner

Superficially symmetric with sankey. **Rejected.** `buildSvg*Geometry` is a pure
function from data to coordinates; `forceSimulation` is a stateful, tick-driven,
animated process with drag interaction (`network-graph:305`, and `d3.drag()` per its
own header). Putting it behind a `build*` name would make the geometry owner's one
honest property — purity, which is what makes its 3 583 lines testable — false. Sankey
moves because `scaleLinear` layout genuinely is pure. Asymmetry here is correctness,
not inconsistency.

### (d) Adopt a third-party chart library

Out of scope for a family cut, and it would discard the one asset this tree already
has: a tenant-aware, mode-aware, contrast-audited precedence chain that no chart
library ships.

---

## 6. Executable acceptance

### 6.0 Base state, recorded before any lot

| instrument | base result |
|---|---|
| `node scripts/check/tokens/contracts/chart-series/index.mjs` | 2 835 scanned, 10 allowlisted, **0 violations** (leg 23) |
| `vitest run` on `ChartPalette.personality` + `grammar/palette/tests/` | **3 files, 9 tests, 9 passed** (leg 24) |
| `node scripts/check/family-cut/index.mjs --json` | 77 families, **0 chart rows**, 2 findings — both `tree`, both from the foreign lot `daa739788`, which added `data-part="drag-handle"` (12 -> 13 stamped parts, exactly the delta the findings name) without re-pinning its baseline. **Red at HEAD before this packet starts**; not caused by it, and not this packet's to fix (leg 25) |
| contract type-check, both directions | **0 diagnostics** with the eight `@ts-expect-error` legs; **exactly 8 errors at the 8 declared positions** with every directive stripped (leg 26) |

### 6.1 The instrument gap, and what closes it

WO-FAM-09's acceptance names `family-cut` arms, and the roster has no chart (§0.15).
Adding 18 rows requires a per-arm adjudication, proposed here for the DT to rule on:

| arm | chart disposition |
|---|---|
| `inlineStyleViolations` | **applies**, with a declared exception: a runtime-computed `--ds-*` custom property on a mark is the sanctioned inline (the pattern `renderers/bar:303-304` already uses). A literal colour is a violation |
| `visualLiterals`, `antReads` | applies unchanged |
| `owners`, `stampsAnatomy`, `skinReadsAnatomy` | applies; §2.6 is what makes `owners: 1` reachable for the five two-file families |
| `variantContract` | **does not apply.** Charts have no variant axis. Owed as `N/A` with a written reason, not baselined as a pass |
| `stateContract`, `stateGoverned` | **partially.** Charts have loading/empty/error via the scaffold, and no hover/press `[data-state]` on marks. Scope to the scaffold states |
| `a11yProbes`, `a11yAssertions` | applies, and is the arm with real content (§0.11) |
| `dndKernelDeclared`/`Wired` | **does not apply** |
| `adaptSlot` | applies — the R4 amendment's clause 1. Charts are layout-sensitive; `compact-mode` (`runtime/responsive/compact-mode`) is the existing behaviour to reconcile with `adapt`/`data-posture` |
| `skeleton` | applies — the R4 amendment's clause 2. **WO-FAM-14 must be done before this cut may close**; until then the arm stays OWED |

### 6.2 Per lot, three legs

1. **Focal suites** — the family's own tests plus every directly affected consumer,
   commands and results recorded. Never represented as a full pass.
2. **Type refusals** — the negative legs of §6.3 must error; a contract that stopped
   refusing reddens the same run on an unused directive, so the check cannot pass by
   being permissive.
3. **The applicable gates** — `chart-series` at 0 violations, the parity lock green,
   `family-cut` for the rows the lot touches, `structure:check` for any physical move.

### 6.3 New instruments the contract needs

**(i) `chart-paint-single-door`** — an AST gate in the shape of the existing
`chart-series` gate (`scripts/check/tokens/contracts/chart-series/index.mjs` is the
model to copy: postcss for CSS, the TypeScript AST for TS/TSX, a lossless text
prefilter that never adjudicates). It reports, as violations:

- any expression matching `var(--ds-chart-category-` or `var(--ds-chart-paint-` built
  outside `runtime/theming/foundation/paint/**` and the allowlisted
  `grammar/palette/**`;
- any `% ` applied to a `palette`/`colors`-named binding outside the resolver — the
  seven expressions of §0.7 are its planted preimage;
- any `data-series-index={...}` whose expression is not a call to `slotIndexFor`.

**(ii) `chart-palette-table-parity`** — extends the existing lock
(`SvgRenderers.test.tsx:90-91`) to the two unbound copies of §0.2: the 50 light
`--ds-chart-{scheme}-N` in `patterns/index.css` must equal `LIGHT_FALLBACKS`, and the
50 dark values must exist for every light name. This is the copy nothing checks today.

**(iii) `chart-family-registry-closure`** — the `families/` folder set, the public
barrel, the entrypoints, the showroom registry and the `family-cut` roster must each
equal the registry's key set. Planting a 19th folder, or removing a row, reddens it.

**(iv) `chart-scheme-scope-causality`** — a render-level probe asserting, for every
categorical family and every scheme, that
`root[data-chart-color-scheme] === decision.scheme` and that the first mark's paint
comes from that scheme's chain. This is the executable form of §0.5 and it is red at
base for every family and every non-default scheme.

### 6.4 The browser leg, owed

§0.6's conclusion — that a bar and a pie on one page take their first colour from
different scheme tables — is derived from two measured facts (the marks' inline
attributes, executed; the CSS text, read) because happy-dom applies no stylesheet.
**A Playwright leg from this package, on a built `dist/`, is required before lot 1 is
accepted**, per the execution policy's rule that browser/first-paint claims need
browser evidence. It must capture the computed `fill` of a bar mark and a pie slice in
one page at each of the five schemes, in light and dark.

### 6.5 Planted negatives

Each must redden its instrument; a lot that cannot make them red has not proven its
gate works.

| # | plant | reddens |
|---|---|---|
| P1 | restore `palette[i % palette.length]` in one family | `chart-paint-single-door` (ii) |
| P2 | change one hex in `patterns/index.css` light block | `chart-palette-table-parity` |
| P3 | change one hex in `chart-foundation` bridge | the existing `SvgRenderers` parity lock |
| P4 | add a 19th folder under `families/` with no registry row | `chart-family-registry-closure` |
| P5 | revert `ChartRendererSurface` to the token hook | `chart-scheme-scope-causality` |
| P6 | stamp `data-series-index={i % 5}` by hand in a migrated family | `chart-paint-single-door` (iii) |
| P7 | define `--ds-chart-series-3` anywhere in `src/` | `chart-series` reserved-name gate |
| P8 | give `gauge` a `categorical` row in the registry | the contract type-check (`categorical` handling) + the gauge suite |
| P9 | delete a `data-part` from a migrated chart skin | `family-cut` anatomy arms for that row |

P3 and P7 are the two that already work at base; the other seven are the new
instruments' proof obligations.

---

## 7. Migration risk register

| # | risk | mitigation |
|---|---|---|
| R1 | **Lot 3's blast radius is every chart in the estate.** Because no preset authors `charts.colorScheme` (§0.4), *all* charts resolve `default`, which today paints `accessible`. De-aliasing repaints everything | Owner decision Q1 before the lot is scheduled; a baseline re-pin plus the browser leg of §6.4 across all five schemes |
| R2 | Lot 2 changes 25 app-platform screens' chart colours | Declared, not hidden. The change is a fix: those screens currently cannot receive a tenant palette. Coordinate with the app-platform roadmap before landing |
| R3 | The `data-series-index` domain change would silently break line/area/radar cadence if done without §2.3(b)'s split | The cadence split lands in the same lot as the modulus unification (4a), never after it |
| R4 | `family-cut` arms baselined as passes for charts where they are meaningless | §6.1 rules each arm `applies` / `N/A with reason` / `OWED`. Never baseline a new finding |
| R5 | WO-FAM-14 is not done, so the skeleton arm cannot close | Stated in the R4 amendment; this cut cannot close until FAM-14 lands. Plan the lots to finish everything else |
| R6 | Parallel writers move the tree mid-packet | This already happened during measurement: two foreign lots landed mid-packet. Discharged by leg 0 (22 cited files byte-identical at base, HEAD and disk) and leg 25 (the one red gate attributed to its real author). Re-anchor at dispatch |
| R7 | Public retirements (lot 7) break an unknown external consumer | Measured: zero consumers for all three symbols across three apps and the showroom (§0.1, §0.14). Still needs a changeset and owner authorization |
| R8 | The showroom's chart pages exercise props the registry may remove (`colors` on scatter) | `chart-family-registry-closure` (iii) includes the showroom registry, so a removed prop is caught there rather than at the showroom build |

---

## 8. Questions for reviewers

**Q1 (blocking lot 3, owner decision).** `default` currently paints the `accessible`
table (§0.5(2)), deliberately per `personality/index.ts:18-28`. Three options:
(a) de-alias — `default` paints `--ds-chart-default-N`; largest visual change in the
programme, and the only option that makes the inline paint and the CSS scope agree;
(b) keep the alias and rename the scheme honestly, so `default` *is* `accessible` and
the `--ds-chart-default-N` channel is retired; (c) keep both and accept that the scope
attribute and the inline paint name different tables forever. **Recommendation: (a)**,
scheduled after lots 1-2 so its re-pin is the only change in its diff.

**Q2.** `ScatterChart` declares `colors` and discards it; `PieChart` honours it
(§0.8, executed). Should `honoursColorsProp` be `true` for every categorical family
(restore scatter's), or `false` for all of them (retire the prop, since the governed
chain is the point)? **Recommendation: `false` for all categorical families**, with the
prop removed from the type per §2.3(d) — an arbitrary hex array is precisely the sink
the tenant palette chain exists to replace. This is a public-API break and needs Q2's
answer before lot 4b.

**Q3.** RTL is a zero baseline (§0.11). For a chart, "RTL" is not one decision: the
legend and category labels should mirror, the numeric axis convention varies by locale,
and a time axis arguably should not mirror at all. Is a chart RTL posture in scope for
FAM-09, or does it belong to a separate work order with its own design? **Recommendation:
separate WO.** Lot 9 as scoped here only adds direction *awareness* (`useOptionalDirection`
and logical-axis plumbing), not a mirroring policy.

**Q4.** WO step 3 asks charts to adopt `useFieldOverlay`, `resolveSubmitIntent` and the
listbox/calendar kernels. None has meaning for an SVG mark (§0.11). Confirm step 3 is
scoped for charts to `useOptionalDirection` plus reconciling the existing 918-line
`useChartInteraction` controller with `useInteractionState`'s `pointerType` — or say
what the other kernels are meant to do here.

**Q5.** `chart-c/index.css` holds seven families in one file (§0.12). Splitting it is
mechanical but touches seven families' skins at once, which cuts against "one lot per
family". Split it in lot 8 as one mechanical lot (proposed), or split each family's
slice inside its own family lot?

**Q7.** sankey and network-graph are the last two imperative-D3 renderers in the tree
(§0.10, leg 27); the other 16 families render React-owned SVG. Converting them is the
single largest remaining architectural difference inside the chart catalog, and it is
not paint work. Schedule it as a separate work order behind FAM-09 (proposed), or fold
it into lot 4c and accept a much larger family lot?

**Q6.** Is `--ds-chart-paint-N`, a private bridge defined per scheme scope, the right
final shape — or should the resolver emit the slot expressions and the bridge be
retired, leaving one authority instead of two that a parity test keeps in step?
**Recommendation: keep the bridge.** It is what lets a family paint without an inline
style, which is what pie and scatter already do and what the skin-first pattern asks
for. But it should be *generated* from `LIGHT_FALLBACKS` rather than hand-maintained,
which turns the parity test from a lock into a tautology.

---

## Appendix A — decisions this revision takes, and the reviewer may reverse

1. **Four paint models, not one resolver.** §2.3. The alternative (b) flattening is
   explicitly rejected; a reviewer who wants one model must answer what a gauge's
   `--ds-color-error` arc becomes.
2. **Cadence is split from the paint slot** into `data-series-cadence`. §2.3(b).
   Without it, unifying the modulus breaks line, area and radar. A reviewer may instead
   extend every cadence skin to 1..9 and keep one attribute; that is more CSS and fewer
   concepts.
3. **Context, not prop, carries the decision.** §2.4. Reversible to a prop at the cost
   of §5(a)'s convention problem.
4. **`resolveChartSeriesPaint` and the precedence chain are untouched.** The one part
   of the current tree that is correct.
5. **sankey moves into geometry, network-graph does not.** §5(c). The asymmetry is
   deliberate and argued.
6. **`useChartTheme`, `ChartFamilyFrame` and the palette arrays are retired in one
   public-API lot**, not folded into family lots.
7. **The `--ds-chart-paint-N` bridge is kept but generated.** §8 Q6.
8. **`default` de-aliasing is escalated, not decided.** §8 Q1. It is the single
   largest visual change available in this programme and it is an owner call.

### Corrections this packet makes to its own first readings

Recorded because each would have been a false finding:

- **radar's unbounded `data-series-index`** — first written up as a paint defect. It is
  a documented dash cadence and a 6th series degrades gracefully
  (`chart-radar/index.css:17-20`). Withdrawn.
- **bar's odd-only index keys** — first written up as half-missing paint rules. They
  are a hollow/solid alternation inside `@media (forced-colors: active)`
  (`chart-foundation/index.css:1237`, rule `:1255-1270`). Withdrawn.
- **"no gate binds the palette copies"** — first written that way. A parity lock does
  exist (`SvgRenderers.test.tsx:90-91`) and binds two of the four copies. Narrowed to
  the two that really are unbound (§0.2).
- **`ChartDataAccess` as dead code** — first read as unused. It is published at
  `entrypoints/charts/access` and composed by one app screen. Reclassified as an
  intentional boundary (§0.11).
- **the `family-cut` findings as a dirty-file artifact** — first attributed to an
  uncommitted foreign edit. They persist at HEAD after that work landed, so the real
  statement is an un-repinned census in `daa739788` (§6.0).

---

## Appendix B — measurement reproduction

All commands from `/Users/daniel/Developer/Rottay/r4-recon-opus` unless stated.
`C=packages/core/src/components/patterns/visualization/charts`.

```
# leg 0 -- base stability across the two commits (§Base)
  git diff --stat 3deaf6d45..HEAD -- $C \
      packages/core/src/foundation/tokens/css/presentation/components
  -> empty
  22 cited files hashed at 3deaf6d45, at daa739788 and on disk
  -> identical across base/HEAD/disk: 22 ; moved: 0

# leg 1 -- useChartTheme consumers inside core/src (§0.1)
  grep -rn 'useChartTheme' packages/core/src --include=*.ts --include=*.tsx \
    | grep -v 'theming/presentation/react/color-theme/index.ts'
  -> 2 barrel re-exports, 1 type-existence test, 1 hook suite, 1 unrelated JSDoc
     mention in infrastructure/.../deferred-pending. ZERO component calls.

# leg 2 -- useChartTheme outside the package (§0.1)
  grep -rn 'useChartTheme' app-bithire/src app-platform/src app-evnto/src \
       ui-design-system/packages/showroom/src
  -> no matches. (Also present in frozen artifacts/ and governance/manifest/ only.)

# leg 3 -- per-family hook usage (§0.1, §0.4)
  for f in $C/families/*/index.tsx; do grep -c useChartTheme $f; done
  -> 0 in all 18.  useChartPersonality -> 2 occurrences in all 18.

# leg 4 -- the four palette copies, byte-compared (§0.2)
  node -e '<parse LIGHT_FALLBACKS, patterns.css --ds-chart-<scheme>-N,
           chart-foundation paint-bridge tails; compare lowercased>'
  -> scheme      tsLen patLen fndLen  ts==pat  ts==fnd  pat==fnd
     accessible    10     10     10     true     true     true
     default       10     10     10     true     true     true
     monochrome    10     10     10     true     true     true
     pastel        10     10     10     true     true     true
     vibrant       10     10     10     true     true     true
     ACCESSIBLE_COLORS == LIGHT_FALLBACKS.accessible : true
                       == patterns.css chart-accessible-N : true

# leg 5 -- what binds them (§0.2)
  grep -n 'resolveChartSeriesPaint\|chart-paint' \
    $C/runtime/chart-engine/presentation/react/renderers/tests/SvgRenderers.test.tsx
  -> :21 readFileSync(chart-foundation/index.css)
     :90-91 expect(CSS).toContain(`--ds-chart-paint-${i+1}: ${paint};`)   PARITY LOCK
  grep -rn 'ds-chart-accessible-\|ds-chart-default-\|ds-chart-vibrant-' \
    packages/core/{src,tests,scripts} --include=*.ts --include=*.tsx --include=*.mjs
  -> only test FIXTURES that INJECT stub values (ChartPalette.resolution.test.ts:84,91,99
     inject the DARK hexes) + the chart-series gate's own fixture. Nothing asserts
     patterns/index.css's 100 values.

# leg 6 -- live external call sites (§0.3)
  grep -rhno 'colorScheme="[a-z]*"' <app>/src | sed 's/.*=//' | sort | uniq -c
  -> app-bithire   7 "accessible"
     app-platform 25 "monochrome"   2 "default"
     app-evnto     0                showroom 0
  grep -rn 'colors={' <app>/src --include=*.tsx | wc -l
  -> bithire 3, platform 0, evnto 10

# leg 7 -- the two personality hooks, consumer sets (§0.4)
  grep -rln 'useChartPersonality'        packages/core/src | grep -v tests
  -> 2 barrels + personality itself + color-theme.  Plus all 18 families.
  grep -rln 'useResolvedChartPersonality' packages/core/src | grep -v tests
  -> 11 renderer/projection owners + the infrastructure owner + its facade.
     NO family. The split is total.

# leg 8 -- colorScheme forwarding per family (§0.4)
  grep -o 'useChartPersonality({[^}]*}' $C/families/*/index.tsx
  -> forwards colorScheme: area, bar, calendar-heat-map, line, pie, radar,
     sparkline, tree-map                                   (8)
     drops it:  bullet, funnel, gantt, gauge, heat-map, histogram,
                network-graph, sankey, scatter, waterfall  (10)

# leg 9 -- EXECUTED: the scheme divergence (§0.5, §0.8)
  /private/tmp/fam09/scheme-divergence.test.tsx via
  npx vitest run --config /private/tmp/fam09/vitest.probe.config.ts
  -> requested default    stamped "default"  inline var(...--ds-chart-accessible-1, #2f6b9a)
     requested monochrome stamped "default"  inline var(--ds-color-primary-900)
     requested vibrant    stamped "default"  inline var(--ds-color-primary-700)
     ScatterChart colors={['#ff0000']} -> containsSuppliedColor false
     PieChart    colors={['#ff0000']} -> containsSuppliedColor true   (control)
     5 passed

# leg 10 -- EXECUTED: two paint authorities on one page (§0.6)
  /private/tmp/fam09/inline-vs-bridge.test.tsx
  -> barScope "default"  pieScope "default"
     barMarkInline "--ds-chart-mark-color: var(--ds-chart-category-1,
                    var(--ds-chart-series-1, var(--ds-chart-accessible-1, #2f6b9a)));"
     pieMarkInline null   pieSliceFillAttr null   pieMarkSeriesIndex "0"
     -> pie defers to chart-foundation:824-829, whose bridge under the 'default'
        scope is var(--ds-chart-default-1, #0f766e) (:628).
     CSS-cascade half is DERIVED from measured text; browser leg owed (§6.4).

# leg 11 -- the verbatim override line (§0.7)
  grep -n 'colors && colors.length > 0 ? colors : chartPersonality.colors' \
    $C/families/*/index.tsx
  -> 10 families: area:122 bar:167 funnel:80 gantt:81 line:159 pie:108
     radar:74 tree-map:100 sankey:574 network-graph:228

# leg 12 -- paint model per family (§0.7)
  read of each family's colour decision lines
  -> categorical 11 | sequential 2 | semantic 3 | single 2   = 18

# leg 13 -- data-series-index, CSS key domain vs JSX modulus (§0.9)
  node -e '<walk skin/*.css for [data-part=X][data-series-index=N];
           walk charts/**.tsx for data-series-index={expr}>'
  -> CSS  chart-area area-series 1-4 | chart-line legend-swatch,line-series 1-4
          chart-radar series 1-4     | chart-foundation pie/scatter-mark 0-9,
          bar-mark 1,3,5,7,9 (odd)   | chart-foundation line-series 1-4
     JSX  area %5 | bar %10 | line %5 | pie %10 | radar RAW | scatter %10 (legend),
          RAW (renderer :308)

# leg 14 -- EXECUTED: stamped domains at 6/7/12 series (§0.9)
  /private/tmp/fam09/series-index-domain.test.tsx
  -> radar   0,1,2,3,4,5                      (raw)
     scatter 0..9,0,1                         (mod 10)
     line    0..4,0,1  legend identical       (mod 5)
     area    0..4,0,1  legend identical       (mod 5)
     bar     0..6      legend identical

# leg 15 -- geometry owner (§0.10)
  grep -c '^export ' $C/runtime/chart-engine/foundation/renderers/geometry/index.ts
  -> 116 exports, 17 buildSvg*Geometry builders
  grep -rln 'renderers/geometry' $C/families -> 14 of 18

# leg 16 -- d3 imports, non-test (§0.10)
  grep -rn "from 'd3" $C --include=*.ts --include=*.tsx | grep -v /tests/
  -> geometry:34 | crosshair:16 (type-only) | sankey:55 | network-graph:44

# leg 17 -- a11y per family (§0.11)
  per-family counts of describeChart / role="img" / aria-label
  -> describeChart in 17 of 18; sparkline is the only family with its own
     role="img" and no describeChart

# leg 18 -- the zero baselines (§0.11)
  grep -rn 'useOptionalDirection\|dir=\|rtl' $C | grep -v /tests/   -> EMPTY
  grep -rl 'useTranslation' $C | grep -v tests -> 1 (personality/index.ts:79)
  useInteractionState / useFieldOverlay / resolveSubmitIntent in $C -> 0 / 0 / 0

# leg 19 -- skin ownership (§0.12)
  per-skin '.ds-chart-*' root extraction
  -> 11 per-family files; chart-c holds 7 roots (funnel, gauge, histogram,
     network-graph, sankey, scatter, sparkline); chart-foundation additionally
     holds .ds-chart-renderer-{bar,heatmap,line,pie,scatter}

# leg 20 -- inline drain surface (§0.12)
  grep -c 'style={{' per family / per renderer
  -> 40 across the 18 families, 12 across the renderers

# leg 21 -- ChartFamilyFrame consumers (§0.14)
  grep -rln 'ChartFamilyFrame' <3 apps>/src showroom/src packages/core/src
  -> apps 0, showroom 0; in-package only its own file, the two barrels and its test

# leg 22 -- the family-cut roster (§0.15)
  node scripts/check/family-cut/index.mjs --json | <list families>
  -> 77 families, none of them a chart

# leg 23 -- the chart-series gate (§0.15, §6.0)
  node packages/core/scripts/check/tokens/contracts/chart-series/index.mjs
  -> files scanned: 2835 | allowlisted: 10 | violations: 0     (at base AND at HEAD)

# leg 24 -- focal chart suites at base (§6.0)
  npx vitest run --project unit \
    $C/tests/ChartPalette.personality.test.tsx \
    $C/runtime/chart-engine/foundation/grammar/palette/tests/
  -> 3 files, 9 tests, 9 passed

# leg 25 -- family-cut findings, attributed (§6.0, base hygiene)
  base (dirty): 2 findings, tree partsStamped 12->13, partsConsumed 13->14
  HEAD (clean): THE SAME 2 findings
  git show HEAD:.../tree/engines/modern/index.tsx vs 3deaf6d45: adds data-part="drag-handle"
  -> the delta the findings name, landed by daa739788 without a baseline re-pin.
     Red at HEAD before this packet begins.

# leg 27 -- the two imperative renderers (§0.10, §2.7, §8 Q7)
  grep -ln 'select(' $C/families/*/index.tsx
  -> sankey, network-graph.  ONLY these two of 18.
  grep -n 'select(\|\.append(' -> sankey :614,663,666,716,726,774,778,849
                                   network-graph :262,277,280,... (15 sites total)
  sankey's pure part: computeLayout :330-470, scaleLinear at :415-416, no DOM.

# leg 26 -- TYPE-CHECKING the proposed contract, both directions (§2.2-§2.4)
  /private/tmp/fam09/ts/{contract.ts, adapters.tsx, refusals.tsx}
  tsc --strict, 8 negative legs each @ts-expect-error
  -> EXIT=0, zero diagnostics.
  Then every directive stripped:
  -> EXACTLY 8 errors at the 8 declared positions:
     R-1 TS2322 '"pie"' is not assignable to 'ChartFamilyId'
     R-2 TS2322 '"rainbow"' is not assignable to 'ChartColorScheme | undefined'
     R-3 TS2353 'tokenScheme' does not exist in Omit<ChartPaintRequest,"tokenScheme">
     R-4 TS2540 Cannot assign to ''data-chart-color-scheme'' (read-only)
     R-5 TS18047 'd.categorical' is possibly 'null'
     R-6 TS2542 Index signature in 'readonly string[]' only permits reading
     R-7 TS2540 Cannot assign to 'scheme' (read-only)
     R-8 TS2353 'palette' does not exist in type 'ChartPaintRequest'
  Because every leg is an @ts-expect-error, a contract that STOPPED refusing one of
  the eight reddens the same run on the unused directive: the check cannot pass by
  being permissive.
```

### B.0 Probe harness

Every probe and the type-check harness are preserved beside this document in
`probes/`, with their own README. They run against the real package through a
self-locating config that mirrors `packages/core/vitest.config.ts`'s alias map with
`root` pinned at `packages/core`:

```
cd packages/core
npx vitest run --config ../../evidence/chart-paint-debrief/probes/vitest.probe.config.ts
-> 3 files, 11 tests, 11 passed        (re-verified from the preserved location)

cd evidence/chart-paint-debrief/probes/ts
<repo>/packages/core/node_modules/.bin/tsc -p tsconfig.json
-> exit 0; with every @ts-expect-error stripped, exactly 8 errors at 8 positions
```

Two harness constraints are worth recording because both fail while looking like a
missing file. `/tmp` is a symlink to `/private/tmp` on this host and Vite resolves the
realpath, so `include` and `server.fs.allow` must agree with the realpath or every
probe reports `ERR_MODULE_NOT_FOUND` on a file that exists. And bare specifiers do not
resolve by directory walk from outside the package root, so `@testing-library/react`
is pinned by an explicit alias rather than by a symlinked `node_modules`.
