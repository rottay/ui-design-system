# Addendum — root-or-read: the missing half of "the family resolves, everyone else reads"

Amends §2.4 of [`index.md`](index.md). Written BEFORE the code it authorizes, per the
lot 1b brief.

- **Base** — `26d2997d6627f4493b87f2e94e39cf2f6673c6c0`, branch `main`, checkout
  `/Users/daniel/Developer/Rottay/r4-recon-opus`. The tree carries lot 1's partial
  delivery (18 family roots) plus a foreign writer's ink lot under
  `infrastructure/compilers/.../derivation/`, `skin/typography/` and `chrome/divider/`;
  no chart file is touched by that lot.
- **Writer** — Opus seat (the writer who stopped lot 1). **DT / auditor / integrator** — Kimi.
- **Authority** — the lot 1b brief, which records the contract delta this file states.

---

## 1. What the law said, and the case it did not cover

§2.4 states:

> **The family resolves. Everyone else reads.** `useChartPaint` is callable only from a
> family root. A renderer, a legend, a tooltip or a projection frame calls
> `useChartPaintDecision()`, which reads the context the family published.

That sentence assumes exactly one mount shape: `family → renderer`. The tree has two.

`ChartFrame` is a published contract whose `renderView` hands the app a
`ChartProjectionView` and expects the app to mount a **renderer** — not a family:

```
entrypoints/charts/renderers/index.ts   "Dedicated D3-geometry/React-SVG renderer
                                         boundary for ChartFrame consumers."
```

Eight renderers are published on `@rottay/design-system/charts/renderers`
(`SvgBarRenderer`, `SvgHeatMapRenderer`, `SvgFunnelRenderer`, `SvgGaugeRenderer`,
`SvgLineRenderer`, `SvgPieRenderer`, `SvgRadarRenderer`, `SvgScatterRenderer`), and five
app-bithire files mount nine instances of them with **no family above**:

| file | renderers |
|---|---|
| `app/(dashboard)/activity/content/widgets/index.tsx` | `SvgBarRenderer` |
| `features/insights/.../reports/builder/chart-preview/index.tsx` | `SvgBarRenderer`, `SvgLineRenderer`, `SvgPieRenderer` |
| `features/insights/.../analytics/source-performance-matrix/index.tsx` | `SvgScatterRenderer` |
| `features/teams/.../sections/performance/index.tsx` | `SvgBarRenderer`, `SvgLineRenderer` |
| `features/governance/.../token-billing/metrics/index.tsx` | `SvgPieRenderer` |

In that shape the renderer **is** the chart root. It has no family above it to read from,
and `ChartFrame` cannot resolve on its behalf: the frame renders the chart as a *child*, so
a decision it published would sit above — and pre-empt — whatever the chart below decides;
and its `rendererId` is an app-owned string (`svg.bar`, `sankey`, or anything an app
invents), not a family id.

Measured consequence of applying item 2 under the §2.4 law as written: **56 tests red
across 12 files, one cause** — `useChartPaintDecision: no chart paint decision in scope`.
That is not a test-fixture problem. It is the contract refusing a mount shape the package
publishes.

## 2. The delta: root-or-read

> A component that renders a chart's root surface reads the decision the family above it
> published; **when there is no family above it, it IS the chart root and resolves for
> itself.**

One new kernel export carries it:

```ts
export function useChartPaintRoot(
  family: ChartPaintFamily,
  request?: Omit<ChartPaintRequest, 'family' | 'tokenScheme'>,
): ChartPaintDecision;
```

- It reads `ChartPaintContext` FIRST. A published decision is returned unchanged.
- With no decision in scope it resolves through the one resolver, with its own family id,
  its own `scheme` prop as the request's prop tier, and the token tier the door reads.
- **The caller publishes.** `useChartPaintRoot` does not itself provide; a renderer wraps
  its surface in `<ChartPaintProvider decision={paint}>`. When a family is above, the value
  published is the identical object the family published, so re-publishing is a no-op by
  value and the provider wins **by construction** — a renderer cannot stamp a scheme its
  family did not resolve, whether or not it also has a prop. Divergence stays
  unrepresentable; it is not merely discouraged.
- `useChartPaint` keeps its family-root-only refusal unchanged: a family that resolves
  below a published decision still throws.
- `useChartPaintDecision` keeps its strict refusal unchanged: a reader with nothing in
  scope still throws. Nothing in this delta weakens an instrument.

### 2.1 The unowned root

`ChartImperativePlot` is published on `@rottay/design-system/charts`. It is the sanctioned
bridge for imperative bodies (d3-sankey, d3-force): the app supplies `rendererId`, `draw`
and an optional `colorScheme`, and the plot hands the body `seriesPaint`. In the DS it is
mounted by `sankey` and `network-graph` — both of which now publish above it. Mounted
standalone by an app it is a chart root **whose family the design system does not own**,
and its own suite mounts it exactly that way, including
`ChartImperativePlot.test.tsx:64` with `colorScheme="vibrant"`.

The resolver therefore admits one more root identity, and only one:

```ts
/** `null` = a chart root the design system does not own: the imperative bridge. */
export type ChartPaintFamily = ChartFamilyId | null;
```

- It adds **no registry row**. `CHART_FAMILY_REGISTRY`, `CHART_FAMILY_IDS` and
  `isChartFamilyId` are untouched, so `chart-family-registry-closure` still measures
  eighteen families and still reddens on a nineteenth folder.
- It adds **no second resolver**. `resolveChartPaint` remains the one door;
  `family: null` selects a frozen unowned row (`paintModel: 'categorical'`,
  `cadenceSize: null`, `honoursColorsProp: false`), because an imperative body's paint is
  categorical by construction of its own public API (`seriesPaint: readonly string[]`).
- It refuses exactly what it refused before: `resolveChartPaint({ family: 'pie' })` — an
  unregistered *string* — is still a type error (contract leg R-1), and an unknown family
  at runtime is still refused by name.
- It is strictly better than the state it replaces. Today a standalone
  `ChartImperativePlot` stamps `data-chart-color-scheme` from the personality alone, so it
  stamps `default` however the app set `colorScheme` — §0.5(1)'s defect, in the one place
  lot 1 would otherwise not reach. After this it stamps prop > token > default, the same
  precedence every other chart root gets.

### 2.2 The token tier, and the frame

§2.4's other half — "`colorScheme` is read **only** by `resolveChartPaint` as the
`tokenScheme` tier" — is item 3. Two changes carry it:

1. The door's token tier moves from `useTokens().personality.chart.colorScheme` to
   `useResolvedChartPersonality().colorScheme`. These are the **same value by
   construction**: both are `resolveChartPersonality({ compiled, productProfile })` over the
   same two contexts (`EngineVisualDeclarationContext.runtime.personality`,
   `ProductProfileContext.profile`); the tenant context is not an input to chart
   personality at all. The difference is that `useTokens()` additionally calls
   `useTenantContext()`, which **throws** outside a `TenantProvider` — and renderers are
   explicitly valid standalone (`useResolvedChartPersonality`'s own docblock: "chart
   renderers are valid standalone (for SSR, tests, embeds, and progressive adoption)").
   A paint door that cannot be called from a standalone renderer cannot implement
   root-or-read. The equivalence is pinned by an executable assertion, not asserted here.
2. `ChartFrame` is chrome that sits ABOVE a chart root, so it can neither read a decision
   nor publish one without pre-empting the chart below. Its direct
   `chartPersonality.colorScheme ?? 'default'` read becomes the resolver's token tier
   through a narrow export that resolves and never publishes:

   ```ts
   export function useChartTokenScheme(): ChartColorScheme;
   ```

   Same stamped value as today (`resolveChartPaint({ family: null, tokenScheme }).scheme`
   is `tokenScheme ?? 'default'` by definition), one fewer paint authority.

After lot 1b, `useResolvedChartPersonality().colorScheme` has exactly **one** reader in the
package: the paint door's token tier. (`useChartPersonality`'s `colors`, the options-aware
family hook, is a separate authority that lot 2 deletes; it is out of this lot's scope and
§2.4 does not claim otherwise.)

## 3. Why the other two resolutions lose

The STOP report offered three. (a) is the delta above. The other two are recorded here with
the reason each fails, so neither is re-proposed.

### (b) Publish `ChartPaintProvider` / `useChartPaint` and adopt them at the `ChartFrame` call sites

Shape: add both symbols to the public API; every app that mounts a renderer under
`ChartFrame` wraps it in `<ChartPaintProvider decision={useChartPaint({family})}>`.

It loses on four counts, in increasing order of severity:

1. **It exports the divergence door.** The decision would become something an app
   constructs and hands down. `useChartPaint({ family: 'bar-chart', scheme: 'vibrant' })`
   wrapped around `<SvgPieRenderer>` is well-typed, compiles, and is exactly the
   "chart paints from one table while its scope names another" defect §0.5 exists to
   remove. The contract's whole claim is that this is *unrepresentable*, not merely
   discouraged; (b) makes it a documented public pattern.
2. **It moves the DS's invariant into app code.** Nine call sites in app-bithire today, and
   every future one, would have to remember to wrap. A law enforced by remembering is not
   an invariant, and no gate in this package can measure another repository.
3. **It is a public API addition plus cross-repo coordination** — changeset, contract-diff
   rows, and an app-bithire lot — for a defect whose fix is otherwise entirely inside this
   package. That is the R2 class of work, and it would block lot 1 behind a repo the lot
   does not own.
4. **It still does not cover `ChartImperativePlot`.** An app mounting the published bridge
   standalone has no family id to hand `useChartPaint`, so (b) leaves §2.1's case open and
   would need (a) anyway.

### (c) Retire the `charts/renderers` subpath

Shape: delete the published renderer boundary; `ChartFrame` consumers mount families
instead.

1. **It is a public retirement** — the same class as `useChartTheme` and
   `ChartFamilyFrame`, which the debrief itself scheduled as **lot 7**, gated on a
   changeset and explicit public-API authorization. Doing it inside lot 1 would smuggle a
   lot-7 decision into a lot-1 diff.
2. **It breaks nine live call sites** across five app-bithire files, with no deprecation
   window, to fix a defect that has an in-package fix.
3. **It is not obviously correct on the merits.** The subpath exists because `ChartFrame`'s
   projection model deliberately separates the semantic frame from the renderer that fills
   it; families carry their own scaffold, header and state chrome, which is precisely what
   a frame consumer does not want twice. Retiring it is a real design question that
   deserves its own packet, not a side effect.
4. **It deletes the evidence.** `SvgRenderers.test.tsx`'s "mounts as the declared full
   renderer inside `ChartFrame`" is the executable statement of that contract, and the lot
   1b validation slot requires it green.

## 4. What this addendum does NOT authorize

- No public prop is widened. The twenty scheme-scope rows belonging to the five
  categorical families that declare no `colorScheme` prop at all (`funnel-chart`,
  `gantt-chart`, `network-graph`, `sankey`, `scatter`) stay red and stay the registered
  owner question from lot 1's report.
- No `colorScheme` prop is added to `ChartRendererSurfaceProps`. §2.4's refusal stands: the
  decision travels by context, never by prop.
- No registry row, no second resolver, no second personality hook, and no change to
  `resolveChartSeriesPaint` or the parity lock.
- No baseline is re-pinned and no gate threshold is moved.
