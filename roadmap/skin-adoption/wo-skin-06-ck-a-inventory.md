# WO-SKIN-06 CK-A dashboard-widgets paint inventory (read-only)

All paths relative to `packages/core/src/ui/structures/dashboard/`. Same
channel scope and STATIC/STATE-SELECTED/RUNTIME discriminator as the triage
(`wo-skin-06-triage.md` §2) and the WO-SKIN-04 precedent: a "site" is an
object-literal style key named `background*`, `border*`, `outline*`, `color`,
`boxShadow`, `textShadow`, `fill`, `stroke`, `accentColor`, `filter`,
`backdropFilter`, `WebkitBackdropFilter`, or `transform`, or an imperative
`.style.<paint> =` / `.style.setProperty(...)` write — i.e. exactly
`ARC09_PAINT_KEY_RE` from `packages/core/scripts/lib/inline-paint-counter.mjs`.

**Method note**: every site below was located by running an instrumented clone
of the real lexer (`inline-paint-counter.mjs`, reproduced verbatim with a
line-number reporter added) against each file, so the totals are byte-exact
against `node scripts/engine-token-audit.mjs | grep fleet.inlinePaint.composition/structures/dashboard`
(37/36/34/34/33/29/28/28/149/31 = 439), not hand-counted. Every site was then
read in source to classify STATIC / STATE-SELECTED / RUNTIME / C-hatch.

**Coverage**: 439 sites, 10 files — `dashboard-insights/activity/{ticker,timeline,compact,cards}`
(37+33+29+28=127), `dashboard-insights/metrics/{minimal,cards,chart,rows}`
(36+34+34+28=132), `data-terminal-card/index.tsx` (149), `stats-header/StatsHeader.tsx`
(31). `dashboard-insights/use-variant/index.ts`, `metrics/tokens.ts`,
`types/index.ts`, and `stats-header/engines/{classic,modern,rustic}.tsx` carry
**zero** counted sites (the engines/*.tsx files are 9-line pass-throughs to the
shared `StatsHeader.tsx` impl via `createEngineComponent` — this whole
checkpoint is engine-free/engine-agnostic, confirmed by header comments in
every file). **Zero `data-part` or any `data-*` attribute anywhere in the
checkpoint** (grep-confirmed across all 10 files) and **zero existing skin
file, zero bridge rule in `theme.css`/`personality.css` for any of these
components** (grep-confirmed) — this is a fully greenfield migration, no
suppression risk, nothing to reconcile against a legacy layer. **Zero DaisyUI
coupling** — every className in the checkpoint is a plain first-party
lowercase-kebab name (`ticker-dot`, `metric-row-v3`, `live-indicator`, …),
none is a bare DaisyUI structural token.

---

## 0. The variant-pinning trap (§7.1) — resolved first, as instructed

Two independent random-variant mechanisms exist in this checkpoint, and they
are **not the same shape** — the triage's framing ("both accept an override")
is directionally right but glosses over a real difference that changes what a
spec needs to do.

### `dashboard-insights` — 8 renderers, no composite wrapper ships

`dashboard-insights/use-variant/index.ts`:

```ts
const METRICS_VARIANTS: MetricsVariant[] = ["rows", "cards", "minimal", "chart"];
const ACTIVITY_VARIANTS: ActivityVariant[] = ["timeline", "compact", "cards", "ticker"];

function getRandomVariants(): StoredVariants {
  return {
    metrics: METRICS_VARIANTS[Math.floor(Math.random() * METRICS_VARIANTS.length)],
    activity: ACTIVITY_VARIANTS[Math.floor(Math.random() * ACTIVITY_VARIANTS.length)],
  };
}

export function useVariant(
  metricsOverride?: MetricsVariant | "auto",
  activityOverride?: ActivityVariant | "auto"
): StoredVariants {
  const [variants] = useState<StoredVariants>(() => getRandomVariants());
  return {
    metrics: metricsOverride && metricsOverride !== "auto" ? metricsOverride : variants.metrics,
    activity: activityOverride && activityOverride !== "auto" ? activityOverride : variants.activity,
  };
}
```

The override API is exactly as the brief describes: `useVariant(metricsOverride,
activityOverride)`, positional hook parameters, `"auto"` or `undefined` falls
through to the random pick. **But grepping the whole repo (`packages/core/src`
and `packages/showroom/src`) for `useVariant(` finds exactly one hit: the
hook's own definition.** Nothing calls it — not a first-party composite
component, not the showroom, not a story. `dashboard-insights/index.ts`
exports `useVariant` plus all 8 leaf renderers (`MetricsRows`, `MetricsCards`,
`MetricsMinimal`, `MetricsChart`, `ActivityTimeline`, `ActivityCompact`,
`ActivityCards`, `ActivityTicker`) individually — there is no `<DashboardInsights>`
wrapper anywhere in this codebase that composes `useVariant` with the 8
renderers. The randomness is a *hook a future consumer could opt into*, not a
live rendering path today.

**Consequence for the spec, and a correction to the brief's framing**: a
torture page does **not** need to "pin an override" for dashboard-insights at
all. It needs to mount all 8 named exports **directly**, exactly as the
showroom already does for 2 of them today
(`packages/showroom/src/app/(docs)/structures/[group]/[structure]/structure-preview-fixtures.tsx:1252-1279`,
`DashboardInsightsFamilyPreview`, which renders `<MetricsMinimal metrics={...} />`
and `<ActivityCompact items={...} />` side by side, never touching `useVariant`).
This is simpler and more robust than threading an override through the hook,
because there is no rendering path that goes through the hook to pin in the
first place. **Today, in the shipped code, only 2 of the 8 renderers
(`MetricsMinimal`, `ActivityCompact`) ever paint anywhere** — the showroom
preview is the only live consumer of any dashboard-insights export, and it
hardcodes those two. The other 6 (`MetricsRows`, `MetricsCards`, `MetricsChart`,
`ActivityTimeline`, `ActivityCards`, `ActivityTicker`) render nowhere in this
repository today; they are live, counted, exported code that is invisible to
every existing sighted check.

**How a spec covers all 8**: import and mount all 8 leaf components directly
with a shared fixture (`metrics: KeyMetric[]`, `items: ActivityItem[]`), one
per torture-page section, bypassing `useVariant` entirely. Each of the 4
activity variants additionally needs its **hover** states captured (see §1-4
below — most of the STATE-SELECTED paint only appears under `isHovered`), and
`ActivityTicker` specifically needs its `setInterval`/`goToNext` auto-rotation
either mocked or the capture taken deterministically at mount
(`currentIndex=0`, `isAnimating=false`) — otherwise the baseline race-conditions
against a 5000ms timer, the same class of hazard as WO-SKIN-02's clock-pinned
date panels, just on a shorter clock.

### `data-terminal-card` — 4 renderers, and the override IS the only path in

`data-terminal-card/index.tsx:104-119, 855-878`:

```ts
function getPageVariant(): 1 | 2 | 3 | 4 {
  if (typeof window === "undefined") return 1;
  let seed = (window as unknown as { __cardVariantSeed?: number }).__cardVariantSeed;
  if (!seed) {
    seed = Math.floor(Math.random() * 4) + 1;
    (window as unknown as { __cardVariantSeed?: number }).__cardVariantSeed = seed;
  }
  return seed as 1 | 2 | 3 | 4;
}

export function DataTerminalCardProvider({ children, variant }: { children: ReactNode; variant?: 1 | 2 | 3 | 4 }) {
  const pageVariant = useMemo(() => variant ?? getPageVariant(), [variant]);
  return <VariantContext.Provider value={pageVariant}>{children}</VariantContext.Provider>;
}

export function DataTerminalCard({ ..., variant: propVariant }: DataTerminalCardProps) {
  const contextVariant = useContext(VariantContext);
  const variant = useMemo(() => {
    if (propVariant) return propVariant;
    if (contextVariant) return contextVariant;
    return getPageVariant();
  }, [propVariant, contextVariant]);
  switch (variant) {
    case 1: return <CommandCard {...props} />;
    case 2: return <HUDCard {...props} />;
    case 3: return <CircuitCard {...props} />;
    case 4: default: return <MatrixCard {...props} />;
  }
}
```

Here the pinning trap is real and unavoidable, unlike dashboard-insights:
`CommandCard`/`HUDCard`/`CircuitCard`/`MatrixCard` are **not exported** —
they are module-private functions. `DataTerminalCard` is the only public
entry point that can render any of the 4 card bodies. **Exact override
priority, verified from source**: `propVariant` (the `variant` prop passed
directly to `<DataTerminalCard variant={1|2|3|4} .../>`) wins over
`contextVariant` (nearest `<DataTerminalCardProvider variant={1|2|3|4}>`
ancestor) wins over `getPageVariant()` (the window-global seed). A spec must
pin via the `variant` prop directly (simplest — no provider needed) to reach
all 4 deterministically: `<DataTerminalCard variant={1} .../>` through
`variant={4}`.

**A second difference from dashboard-insights that matters for a spec**:
`getPageVariant()`'s randomness is scoped to `window.__cardVariantSeed` — a
single seed shared by every unpinned `DataTerminalCard` on the whole page,
memoized once. This is **not** the same mechanism as `useVariant`'s
`useState(() => getRandomVariants())`, which is per-hook-instance (two
`useVariant()` calls on the same page can independently land on different
variants). Concretely: N unpinned `DataTerminalCard`s on one page all render
the **same** one of 4 variants (consistent with each other, inconsistent
across page loads); N components built on top of `useVariant` would each
pick independently. Worth recording precisely rather than treating both
random-variant mechanisms as one trap with one fix.

**A genuine, previously-unflagged defect this uncovered**: `getPageVariant()`
returns `1` unconditionally when `typeof window === "undefined"` (SSR). Any
unpinned `DataTerminalCard` in a server-rendered app will render `CommandCard`
on the server and then re-roll via `Math.random()` on the client after
hydration — a guaranteed hydration mismatch (React will warn, and the visible
card will flicker from Command to whatever the client rolled) for every
unpinned instance in any SSR app. Pinning via `variant` is not just a
testing convenience; it is the only way this component is SSR-safe at all.
Record only, not this checkpoint's job to fix.

**Coverage recipe for the 4**: `<DataTerminalCard variant={1..4} progress={…} trend={…} .../>` —
and because `progress` drives `getProgressColor`'s 3-way threshold bucket
(`>=80` success / `>=50` warning / `<50` error) inside every one of the 4
card bodies, full STATE-SELECTED coverage needs a `progress` sweep across
the 3 bands per variant, not just one fixture — a single "happy path" shot
per variant will miss 2 of the 3 `getProgressColor` branches. `trend`
("up"/"down") is a second, independent binary to sweep. `DataTerminalStat`
(the 5th export, `index.tsx:883-925`) is **not** part of the variant switch
at all — it always renders the same body regardless of `variant` — so it
needs no pinning, just its own `trend` sweep.

---

## 1. `dashboard-insights/activity/*` — 4 files, 127 sites, one shared "list of TYPE_CONFIG-colored rows" shape

### Shared shape and anatomy

All 4 files (`ticker`, `timeline`, `compact`, `cards`) render: a 415px-tall
panel with a header (Bell icon in a tinted box, unread-count badge, title,
optional `view-all-link`), then either a paged single-item ticker (`ticker`)
or a scrollable list of per-item rows (`timeline`/`compact`/`cards`). No
`data-part` anywhere; anatomy is plain classNames used only to scope each
file's own co-located `<style>{...}</style>` block (`:hover` rules,
`@keyframes`, scrollbar styling) — **these classNames are load-bearing**
(unlike WO-SKIN-04's Menu compound BEM classes, which were fully dead): the
per-instance `<style>` block targets them by exact string match, so a skin
migration must either keep the class names or rewrite both the JSX and the
extracted CSS together. Grep-confirmed zero collision with any existing
`foundation/tokens/css/` selector or any other component's className for every one of:
`ticker-dot`, `ticker-container`, `ticker-content-v3`, `nav-button`,
`ticker-progress`, `activity-item-v3`, `activity-compact-item-v3`,
`activity-card-item-v3`, `live-indicator`, `view-all-link`, `activity-scroll`,
`time-dot`.

### The `TYPE_CONFIG` vocabulary — 3 identical hand-rolled copies, 1 diverged

Each of the 4 files defines its **own local, non-imported** `const TYPE_CONFIG`
mapping the bounded 5-value `ActivityItem["type"]` enum
(`success | primary | info | warning | error`) to `{ icons: LucideIcon[],
gradient: string }`. This is the family's own instance of the "DS/TYPE_CONFIG
const-map vocabulary" pattern the brief asked about — and unlike the metrics
family below, **it is not a shared module**, it is copy-pasted 4 times:

| file | `gradient` value | icons array |
|---|---|---|
| `ticker` | `linear-gradient(135deg, var(--ds-color-X), var(--ds-color-X-200))` | identical `[Check,Briefcase,Star,Zap]` / `[Plus,FileText,Users,Briefcase]` / etc., byte-identical across all 4 files |
| `timeline` | `linear-gradient(135deg, ...)` — **identical to ticker** | same |
| `compact` | `linear-gradient(135deg, ...)` — **identical to ticker/timeline** | same |
| `cards` | `linear-gradient(90deg, ...)` — **DIVERGED: 90deg, not 135deg** | same |

3 of 4 copies are byte-identical; `activity/cards` alone uses a 90-degree
gradient angle where the other 3 use 135 degrees. This is real, visible
paint (the accent bar's gradient direction), not a naming difference — a
migration that unifies the 4 into one shared token set must preserve `cards`'
90deg as its own value, exactly the "PRESERVE AS ITS OWN TOKEN SET" law the
CK-C correction established. `TYPE_CONFIG[item.type]` itself is the textbook
§2 "static map index" pattern → STATE-SELECTED, migrates to `[data-type=success|primary|info|warning|error]`.

### The string-concatenated token names (brief item 3)

All 4 files also build `var(--ds-*)` strings by concatenation, **not** by
indexing `TYPE_CONFIG` — a second, independent mechanism for the same
`item.type` enum, present in every file:

```tsx
background: "var(--ds-color-" + item.type + "-100)"
border: "var(--ds-color-" + item.type + ")"        // and "-200)" variants
color: "var(--ds-color-" + item.type + ")"
```

Exact sites: `ticker/index.tsx:96,97,102,114`; `timeline/index.tsx:39,40,42,47,51`
(plus `borderColor: isHovered ? "var(--ds-color-" + item.type + "-200)" : ...`
at :42, a *nested* concat-inside-ternary); `compact/index.tsx:40,41,46,50`;
`cards/index.tsx:40,41,46,50`. None of these will be found by a naive grep
for `var(--ds-` (per triage §7.2) — a token-coverage gate must special-case
them. All are A (the enum is the same bounded 5-value type), migrating to the
same `[data-type=…]` selector family as the `TYPE_CONFIG`-indexed sites.

### Hardcoded, non-token color — a real pre-existing "no hardcoded colors" violation

**All 4 files** hardcode the unread-badge count text to the literal string
`"white"`, not a `var(--ds-*)` token: `ticker:71`, `timeline:66`, `compact:64`,
`cards:64` — `<Text style={{ fontSize: 8, color: "white", fontWeight: 700 }}>`.
STATIC (author-time constant, migrates verbatim), but violates the project's
"No Hardcoded Colors" rule identically in all 4 files — worth a team flag
since it recurs by copy-paste, not independently.

### Per-file paint tables (grouped by rendered part; raw per-key count noted where it exceeds part count, same convention as WO-SKIN-04)

**`ticker` (37 raw sites)** — header block: root panel `background`+`border`
(:65, STATIC bg-secondary/border-secondary), header border (:66 STATIC),
bell-icon box `background`+`border` (:68 STATIC gradient primary-100→secondary-100
/ primary-200), bell icon `color` (:69 STATIC), badge dot `borderRadius`+`background`
(:70 STATIC), badge count `color` (:71 STATIC, hardcoded `"white"`), "Live
Updates" `color` (:75 STATIC), live-indicator dot `borderRadius`+`background`
(:77 STATIC success), STREAMING `color` (:78 STATIC success), view-all-link
box `background`+`border` (:84 STATIC), link text/icon `color`×2 (:85,86
STATIC). Ticker body: container `background`+`border` (:93 STATIC gradient),
current-item icon circle `background`+`border` (:96 **STATE-SELECTED**,
string-concat on `currentItem.type`), icon `color` (:97 **STATE-SELECTED**),
item text `color` (:100 STATIC), small type-dot `background` (:102
**STATE-SELECTED**), time `color` (:103 STATIC). Nav: prev/next buttons
`background`+`border`×2 (:109,118 STATIC), chevron `color`×2 (:110,119
STATIC), counter `color` (:117 STATIC), **`ticker-dot` `background`** (:114
**STATE-SELECTED**, nested — active-index ternary selecting between
`TYPE_CONFIG[item.type].gradient` and a flat `neutral-200`, the richest
single site in the family: two independent runtime identifiers, `i===currentIndex`
and `item.type`, both select among static leaves). Progress track `background`
(:125 STATIC), **progress fill `background`** (:126 **STATE-SELECTED**,
`config.gradient` — textbook §2 map-index). **Totals: 6 STATE-SELECTED
(96×2, 97, 102, 114, 126), 31 STATIC, 0 RUNTIME.**

**`timeline` (33 raw sites)** — same header shape as ticker minus the
paging chrome (STATIC: :60,61,63,64,65,66,70,72,73,79,80,81 = 15 sites, all
background/border/color, identical pattern to ticker's header). Per-item
(`ActivityItem`, rendered once per row): connector line `background` (:38
STATIC), icon circle `background`+`border`+`transform` (:39
**STATE-SELECTED**×3 — background/border are string-concat on `item.type`,
`transform` is `isHovered ? scale(1.1) : scale(1)`), icon `color` (:40
**STATE-SELECTED**), content box `background`+`border` (:42 STATIC base
values) **+ `borderColor`+`transform`** (:42 **STATE-SELECTED**×2 — hover
swaps `borderColor` to a type-tinted `-200` and translates the row 4px),
item text `color` (:45 STATIC), time-dot `borderRadius`+`background` (:47,
borderRadius STATIC / background **STATE-SELECTED**), time `color` (:48
STATIC), chevron `color`+`transform` (:51 **STATE-SELECTED**×2). **Totals:
9 STATE-SELECTED (39×3, 40, 42×2, 47, 51×2), 24 STATIC, 0 RUNTIME.**

**`compact` (29 raw sites)** — header shape identical to timeline's (STATIC:
:58,59,61,62,63,64,68,69,74,75,76 = 13 sites — note `compact` drops the
live-indicator/STREAMING affordance entirely, replacing it with a static
"N UPDATES" counter text, a real asymmetry vs. ticker/timeline, see §"engine
asymmetries" below). Per-item (`CompactItem`): root `background`+`border`
(:37 STATIC), hover-width accent bar `background` (:38 **STATE-SELECTED**,
`config.gradient` map-index), icon circle `background`+`border`+`transform`
(:40 **STATE-SELECTED**×3), icon `color` (:41 **STATE-SELECTED**), text
`color` (:44 STATIC), time-dot `background` (:46 **STATE-SELECTED**,
borderRadius STATIC), time `color` (:47 STATIC), chevron `color`+`transform`
(:50 **STATE-SELECTED**×2). **Totals: 8 STATE-SELECTED (38, 40×3, 41, 46,
50×2), 21 STATIC, 0 RUNTIME.**

**`cards` (28 raw sites)** — near-identical to `compact` (same per-item
shape, smaller header: :58,59,61,62,63,64,67,71,72,73 = 10 STATIC). Per-item
(`ActivityCard`): root `background`+`border` (:37 STATIC), accent bar
`background` (:38 **STATE-SELECTED**, `config.gradient` — the 90deg-diverged
value), icon circle ×3 (:40 **STATE-SELECTED**), icon `color` (:41
**STATE-SELECTED**), text `color` (:44 STATIC), time-dot `background` (:46
**STATE-SELECTED**), time `color` (:47 STATIC), chevron ×2 (:50
**STATE-SELECTED**). **Totals: 8 STATE-SELECTED (38, 40×3, 41, 46, 50×2), 20
STATIC, 0 RUNTIME.**

**Family subtotal: 6+9+8+8 = 31 STATE-SELECTED, 96 STATIC, 0 RUNTIME, 0 C
across the 127 activity sites.**

### Interaction mechanism — 100% React-state, zero imperative writes

Every hover/active treatment in this family (`isHovered`, `isAnimating`,
`currentIndex`) is a React `useState` driving an inline ternary; **zero**
`.style.x =` imperative writes anywhere in the 4 files (grep-confirmed).

### Keyframes / per-instance `<style>` tags — the family's real trap

All 4 files inject their own React-child `<style>{...}</style>` block,
re-rendered (and re-parsed by the browser) on every mount, no dedup guard —
the counter-blind pattern flagged in the brief item 7 and in WO-SKIN-04's
Tabs finding, here at 4x volume:

- `ticker`: `.ticker-content-v3`/`.ticker-in`/`.ticker-out-left`/`.ticker-out-right`,
  `.nav-button`/`.nav-button:hover` (background/border/transform/boxShadow),
  `.ticker-dot`/`.ticker-dot:hover`, `.ticker-progress`, `.view-all-link:hover`,
  `@keyframes liveGlow`, `@keyframes progressFill`.
- `timeline`: `.activity-item-v3` (entrance animation), `.view-all-link:hover`,
  `@keyframes itemSlideIn`, **`@keyframes liveGlow`**, plus `.activity-scroll`
  scrollbar styling (`::-webkit-scrollbar-thumb { background: var(--ds-color-primary-200) }`).
- `compact`: `.activity-compact-item-v3`/`:hover`, `.view-all-link:hover`,
  `@keyframes slideInRight`, plus the same `.activity-scroll` block, byte-identical
  to timeline's.
- `cards`: `.activity-card-item-v3`/`:hover`, `.time-dot` (animation only),
  `.view-all-link:hover` — **missing the `transform: translateX(2px)` that
  ticker/timeline/compact's `.view-all-link:hover` all have** (a real,
  silent asymmetry: 3 of 4 files nudge the view-all link on hover, `cards`
  does not), `@keyframes cardSlideIn`, `@keyframes dotPulse`, plus the same
  `.activity-scroll` block again.

**Same-name/different-content keyframe collision, live today**:
`@keyframes liveGlow` is defined independently in **both** `ticker` and
`timeline`, with **different values**:

```css
/* ticker */   0%,100% { box-shadow: 0 0 4px success, 0 0 8px success; opacity: 1; }  50% { box-shadow: 0 0 8px success, 0 0 16px success; opacity: 0.6; }
/* timeline */ 0%,100% { box-shadow: 0 0 4px success; opacity: 1; }                    50% { box-shadow: 0 0 10px success; opacity: 0.7; }
```

Since `@keyframes` names are document-global (not scoped by the `<style>`
tag's position or the selector using them), if both `ActivityTicker` and
`ActivityTimeline` are ever mounted on the same page simultaneously, **the
later-rendered `<style>` tag's `liveGlow` definition silently wins for both**
`.live-indicator` dots, regardless of which file the dot's own rule came
from — an order-dependent, currently-latent visual bug, exactly the
"clock-pinned date panels" class of hazard from WO-SKIN-02, and the reason
the lane's law requires engine-namespaced (here: component-namespaced)
keyframe names on migration (`ds-ticker-live-glow` / `ds-timeline-live-glow`,
not a shared bare `liveGlow`). `compact`/`cards` do not define `liveGlow` at
all (see next section) so they're not part of this specific collision.

The `.activity-scroll` webkit-scrollbar CSS block is byte-identical across
`timeline`/`compact`/`cards` (not `ticker`, which doesn't scroll) — real,
counter-invisible triplication, safe to collapse to one skin rule.

---

## 2. `dashboard-insights/metrics/*` — 4 files, 132 sites, one genuinely shared token module

### The `../tokens.ts` vocabulary — real adoption, 4/4, unlike CK-C

Unlike the activity family above, all 4 metrics files (`minimal`, `cards`,
`chart`, `rows`) **import** their tokens from a real shared module,
`dashboard-insights/metrics/tokens.ts` (48 exported `const`s: `METRIC_PANEL_*`,
`METRIC_CARD_*`, `METRIC_MONO_FONT`), each a `var(--component-specific,
var(--signal-card-fallback, var(--ds-color-base)))` chain, e.g.:

```ts
export const METRIC_CARD_BG = 'var(--ds-metric-card-bg, var(--ds-compact-card-bg, var(--ds-premium-card-bg, var(--ds-color-bg-primary))))';
```

This is the checkpoint's one clean instance of the "shared vocabulary,
genuinely adopted" story CK-C's correction found to be false for workspace
chrome — verified here by checking actual imports, not by the token file's
existence: `minimal` imports 30 of the 48 exports, `cards` 33, `chart` 30,
`rows` 26, all resolving to the literal constant (no local reinvention, no
divergent recompute) — a clean A-static substitution target. **One
pre-existing defect in the shared file itself**: `METRIC_CARD_METER_FILL_WARNING`
and `METRIC_CARD_METER_FILL_ERROR` are two differently-named exports with the
**byte-identical fallback value** (`linear-gradient(90deg, var(--ds-color-warning), var(--ds-color-error))`)
— and `METRIC_CARD_METER_FILL_WARNING` is never imported by any of the 4
consumers (dead export). Record only.

### The binary `metric.positive` state-selector, used identically everywhere

Every file computes `trendColor = metric.positive ? METRIC_CARD_TREND_COLOR :
METRIC_CARD_TREND_ERROR_COLOR` and `meterFill = metric.positive ?
METRIC_CARD_METER_FILL_SUCCESS : METRIC_CARD_METER_FILL_ERROR` — the family's
one recurring STATE-SELECTED shape, migrating to `[data-positive]`/`[data-trend=up|down]`.
**A real cross-variant asymmetry**: `minimal` and `chart` additionally import
`METRIC_CARD_TREND_WARNING_COLOR` and use a **3-tone** treatment for negative
metrics (the icon color and the "Progress %" text render in WARNING/amber
while the meter bar itself still renders in ERROR/red via `meterFill`) —
`cards` and `rows` do not import the WARNING token at all and use a strict
**2-tone** success/error for every negative-state paint. This is a real,
deliberate-looking design difference between variants, not a bug — preserve
both, do not reconcile to one scheme.

**A second real asymmetry**: `rows`' label text (`metric.label`) uses
`METRIC_CARD_VALUE_COLOR` (bright, text-primary-ish) at `rows/index.tsx:117`,
where `minimal`/`cards`/`chart` all use the dimmer `METRIC_CARD_LABEL_COLOR`
(muted) for the equivalent label. `rows` renders its label at value-brightness
— a visible, not just semantic, difference from its 3 siblings.

**A third, higher-value finding — the hover-value-color-swap uses two
different mechanisms across the family, and one is the "correct" pattern the
others should have used**: `minimal` and `chart` swap the big value's color
on hover via an **inline STATE-SELECTED ternary**
(`color: isHovered ? METRIC_CARD_VALUE_HOVER_COLOR : METRIC_CARD_VALUE_COLOR`,
requiring `isHovered` React state + `onMouseEnter`/`onMouseLeave`). `rows`
achieves the **identical visual effect** with **zero inline state**, purely
via its co-located `<style>` block: `.metric-row-v3:hover .metric-row-value {
color: ${METRIC_CARD_VALUE_HOVER_COLOR}; }` — a real CSS `:hover` rule, the
target shape a migration wants anyway. `rows`' inline value color (:153) is
therefore STATIC in the raw text, but the *true* hover-swap is
counter-invisible (inside the `<style>` string) — worth flagging because a
naive migration of `minimal`/`chart` should adopt `rows`' already-proven
CSS-only pattern rather than transcribing the `isHovered`-ternary mechanism
verbatim.

### Per-file paint tables

**`minimal` (36 raw sites)** — panel chrome: root `background`+`border`+
`borderRadius`+`boxShadow` (:97 STATIC×4), header border (:98 STATIC),
icon box `background`+`border` (:100 STATIC), icon `color` (:101 STATIC),
title/subtitle `color`×2 (:104,105 STATIC), LIVE badge box `background`+
`border` (:108 STATIC), live-dot `borderRadius`+`background` (:110 STATIC),
LIVE text `color` (:111 STATIC) = 16 STATIC. Per-row (`MetricRow`): root
`background`+`border`+`borderRadius`+`boxShadow` (:62 STATIC×4), accent bar
`background` (:64 **STATE-SELECTED**, `meterFill`), icon box `background`+
`border`+`transform` (:67 STATIC×2 + **STATE-SELECTED**×1, `isHovered`),
icon `color` (:68 **STATE-SELECTED**, 3-way `iconColor`), label `color`
(:74 STATIC), trend icon `color`×2 (:76, both ternary branches — **STATE-SELECTED**×2),
change text `color` (:77 **STATE-SELECTED**), value `color` (:80
**STATE-SELECTED**, `isHovered` swap), meter track `background`+`border`
(:82 STATIC×2), meter fill `background` (:83 **STATE-SELECTED**) + `borderRadius`
(999, STATIC), chevron `color` (:87 STATIC). **Totals: 8 STATE-SELECTED (64,
67, 68, 76×2, 77, 80, 83), 28 STATIC, 0 RUNTIME.**

**`cards` (34 raw sites)** — panel chrome: 16 STATIC sites (:186-229, same
pattern as minimal's panel). Per-card (`MetricCard`): root `background`+
`border`+`borderRadius`+`boxShadow` (:60-63 STATIC×4), top accent
`background` (:75 **STATE-SELECTED**), icon box `background`+`border`
(:88,89 STATIC×2, note **2px** border here vs 1px elsewhere — a real visual
difference), icon `color` (:95 STATIC, unconditional — `cards` does not
vary icon color by trend, unlike `minimal`), value `color` (:105 STATIC —
also unconditional; `cards`' value never swaps color on hover, since
`MetricCard` has no `isHovered` state at all: the hover treatment is 100%
CSS-only via `.metric-card-v3:hover .metric-value-v3 { color: ... }`, same
"CSS-only, correct pattern" shape as `rows`), label `color` (:123 STATIC),
change-badge `background`+`border` (:138,139 **STATE-SELECTED**×2, ternary
between success-badge and error-badge tokens — richer than minimal/chart,
which only color the trend text, not a background chip), trend icon `color`×2
(:144,146 **STATE-SELECTED**, two separate JSX lines this time, not a
same-line ternary), change text `color` (:151 **STATE-SELECTED**), mini
meter track `background`+`border`+`borderRadius` (:159 STATIC×3), mini
meter fill `borderRadius`+`background` (:165,166 STATIC + **STATE-SELECTED**).
**Totals: 7 STATE-SELECTED (75, 138, 139, 144, 146, 151, 166), 27 STATIC, 0
RUNTIME.**

**`chart` (34 raw sites)** — panel chrome: 15 STATIC (:96-106, "Performance"
title, smaller LIVE badge). Per-row (`ChartRow`): root ×4 STATIC (:60), accent
bar `background` (:62 **STATE-SELECTED**), icon box ×2 STATIC (:66), icon
`color` STATIC (:67, unconditional), label `color` STATIC (:70), trend icon
`color`×2 same-line ternary (:72 **STATE-SELECTED**×2), change text `color`
(:73 **STATE-SELECTED**), value `color` (:77 **STATE-SELECTED**, `isHovered`
swap), meter track ×3 STATIC (:80), meter fill `background` (:81
**STATE-SELECTED**) + `borderRadius` STATIC, "Progress" label `color` STATIC
(:85), percent text `color` (:86 **STATE-SELECTED**, 2-way `positive ?
TREND_COLOR : TREND_WARNING_COLOR` — the 3-tone treatment noted above).
**Totals: 7 STATE-SELECTED (62, 72×2, 73, 77, 81, 86), 27 STATIC, 0 RUNTIME.**

**`rows` (28 raw sites)** — panel chrome: 12 STATIC (:175-235, incl. the
`live-badge-v3`/`live-dot-v3` pair). Per-row (`MetricRow`, note: same
function name as `minimal`'s but a structurally different implementation —
these are two independent local components, not shared): root ×4 STATIC
(:56-59), accent bar `background` (:71 **STATE-SELECTED**), row-shimmer
`background` (:84 STATIC — `METRIC_CARD_SHEEN`, a fixed sweep gradient;
motion is CSS-only via `.row-shimmer` + `:hover { animation: shimmer }`),
icon box `background`+`border` (:99,100 STATIC×2, 2px border), icon `color`
(:108 STATIC, unconditional — like `cards`, `rows`' icon never varies with
trend), label `color` (:117 STATIC — **but bound to `METRIC_CARD_VALUE_COLOR`,
the asymmetry noted above**), trend icon `color`×2, two separate JSX blocks
not a same-line ternary (:125,130 **STATE-SELECTED**×2), change text `color`
(:137 **STATE-SELECTED**), value `color` (:153 STATIC in the raw text — the
CSS-only hover-swap noted above is counter-invisible). **Totals: 4
STATE-SELECTED (71, 125, 130, 137), 24 STATIC, 0 RUNTIME — the lowest
STATE-SELECTED density in the family, precisely because `rows` moved 2 of
minimal/chart's inline branches (icon color, value hover-color) into
CSS/unconditional-static.**

**Family subtotal: 8+7+7+4 = 26 STATE-SELECTED, 106 STATIC, 0 RUNTIME across
the 132 metrics sites.**

### Keyframes / per-instance `<style>` tags — a second same-name collision

Same shape as the activity family: each of the 4 files injects its own
React-child `<style>` block, no dedup. `minimal` and `chart` **both** define
`@keyframes glow` — **same name, different values**:

```css
/* minimal */ 0%,100% { box-shadow: 0 0 4px badge, 0 0 8px badge; }  50% { box-shadow: 0 0 8px badge, 0 0 16px badge; }
/* chart   */ 0%,100% { box-shadow: 0 0 3px badge, 0 0 6px badge; }  50% { box-shadow: 0 0 6px badge, 0 0 12px badge; }
```

Identical hazard to the activity family's `liveGlow` collision above: if
`MetricsMinimal` and `MetricsChart` are ever mounted together, the
second-rendered `<style>` tag's `glow` silently overwrites the first's for
**both** files' live-dots (different class selectors, `.live-dot` vs.
`.live-dot-chart`, but one shared global keyframe name). `cards` sidesteps
this by naming its equivalent keyframe `dotGlow` (unique name) — but
`dotGlow`'s values are byte-identical to `minimal`'s `glow` (4px/8px →
8px/16px), i.e. a third, differently-named, redundant copy of the same
animation. `minimal` and `chart` **also both** define `@keyframes slideIn`
with byte-identical content (harmless duplication, not a collision, but
still counter-invisible work to de-dup into one skin declaration on
migration). All 4 files repeat the identical `.metrics-scroll` webkit-scrollbar
block verbatim.

---

## 3. `data-terminal-card/index.tsx` — 149 sites, 4 card bodies + 1 stat variant, one `DS` vocabulary

### Anatomy

No `data-part`, no className anywhere in the file except on the 4 card
bodies' subcomponents which need none (pure `Box`/`Text`/`Flex` composition,
no per-instance `<style>` targeting needed for hover — see "interaction"
below). The file's `DS` const map (`index.tsx:88-101`, 12 keys: `primary`,
`success`, `error`, `warning`, `background`, `backgroundSubtle`, `border`,
`borderSubtle`, `textPrimary`, `textSecondary`, `textMuted`, `textSubtle`,
each a `var(--ds-color-*)` string) is this file's instance of the family-wide
"DS/TYPE_CONFIG const-map" pattern — **and it is itself 4 of the 149 counted
sites** (`background`, `backgroundSubtle`, `border`, `borderSubtle` at
:93-96 are the map's own key names, which match `ARC09_PAINT_KEY_RE` exactly
like a JSX style key would — the counter cannot distinguish a vocabulary
*definition* from a vocabulary *use*). Worth noting for any team member
reconciling counted-site totals against "how many places actually paint" —
4 of 149 are the token map declaring its own names, not a render site.

### The `getProgressColor` threshold bucket — used differently per card

```ts
function getProgressColor(progress: number): string {
  if (progress >= 80) return DS.success;
  if (progress >= 50) return DS.warning;
  return DS.error;
}
```

Textbook §2 "threshold bucket" A-state pattern. Grep-verified exact call
sites where `progressColor` reaches a paint key: `CommandCard` (:372
heartbeat-dot `background`, :427 TARGET-stat `color`); `HUDCard` (:526
status-badge `border` via template literal, :528 status-dot `background`,
:529 status-label `color`, :570 COMPLETION-value `color` — the richest use,
4 sites); `CircuitCard` (:647 node-dot `background`, :712 TARGET-stat
`color`, plus `:671 <LiveIndicator color={progressColor} />` — see next
paragraph); `MatrixCard` (:829 TARGET-stat `color` only — Matrix does *not*
use `progressColor` for its `LiveIndicator`, unlike Circuit, see below).
**9 direct sites total: 372, 427, 526, 528, 529, 570, 647, 712, 829.**

### `LiveIndicator` — one shared subcomponent, caller-determined classification

`LiveIndicator({ color = DS.success })` (:201-234) has its own two paint
sites (`background` on the pulsing ring :216 and the static ring :225, both
reading the `color` parameter). `CircuitCard` calls it with `color={progressColor}`
(:671, dynamic — STATE-SELECTED); `MatrixCard` calls it with `color={DS.success}`
explicitly (:788, static). The component's own source text is unconditionally
the same 2 lines either way, so a per-site classification genuinely depends
on the caller, not just the callee — classified STATE-SELECTED here since at
least one live call site drives it dynamically, but flagged explicitly
because a naive "read the function body" pass would call both sites static.

### `trendColor` — the same binary pattern, 5 times, 15 sites exactly

`trendColor = isPositive ? DS.success : DS.error` is recomputed independently
in `CommandCard`, `HUDCard`, `CircuitCard`, `MatrixCard`, and `DataTerminalStat`
(5 near-identical local `const`s, never shared/hoisted). Each of the 5 uses
it at exactly 3 style-key sites (the `TrendingUp`/`TrendingDown` ternary's two
branches, each with its own `color: trendColor`, plus the "change" text's
`color: trendColor`) — **grep-verified 15 occurrences of `color: trendColor`
or `background: trendColor` across the file, 5×3 exactly.** All STATE-SELECTED,
binary on `trend`.

### Category C — the two `borderRadius: height / 2` sites (already in triage §5)

`ProgressBar({ progress, height = 4 })` (:283-310) computes `borderRadius:
height / 2` at both the outer track (:286) and the inner fill (:291-292) —
every current caller passes a static `height` literal (4, 5, 6, or 3), so
the *call sites* are author-time-static, but the component itself receives
`height` as a runtime prop, and the radius is *computed from* it rather than
being one of a bounded set of authored values. Per triage §5's own
recommendation: either a `--ds-progressbar-radius: calc(var(--height) / 2)`
custom-property hatch, or simply hardcode `999px` (the visual result is
identical for every height this component is ever called with — full pill
rounding). **2 C-hatch sites, confirmed at exactly the lines the triage
predicted (:286, :292 in this read — triage cited `:286` as the
representative line).**

### `DataTerminalStat` (:883-925) — the 5th export, not part of the variant switch

12 sites, own root `background`+`border` (:894,895 STATIC), 4 corner-bracket
decorations (:902,903 STATIC ×4, `borderTop`/`borderLeft`/`borderRight` on
`DS.textMuted`), icon `color` (:906 STATIC), label `color` (:907 STATIC),
value `color` (:912 STATIC), trend icon `color`×2 + change `color` (:916,917
**STATE-SELECTED**×3, the same `trendColor` pattern, contributing 3 of the
15 counted above). Always renders — no variant branching at all, and
therefore out of scope for the §0 pinning trap.

### Category totals for this file

**149 = 4 (DS-map definition, STATIC) + 26 STATE-SELECTED (15 trendColor +
9 progressColor-direct + 2 LiveIndicator) + 2 C-hatch (ProgressBar radius) +
117 STATIC (the remaining chrome: 4 card bodies' terminal-window headers,
grid-texture/scan-line/circuit-pattern/dot-matrix decorative backgrounds,
stat-grid layout, actions footers — all fixed `DS.*` tokens, no branching).**
This is the largest single file in the checkpoint by a wide margin (149 of
439, 34%) and the *least* proportionally state-driven (26/149 = 17.4%
STATE-SELECTED, vs. the activity family's 31/127 = 24.4% and the metrics
family's 26/132 = 19.7%) — most of its bulk is the 4 cards' elaborate static
decorative chrome (terminal dots, HUD corner-brackets, circuit nodes, dot-matrix
texture), not interactive state.

### Interaction — zero React hover state, zero imperative writes

No `isHovered`/`onMouseEnter` anywhere in this file — the 4 cards' only
interactivity is the whole-card `NavLinkAnchor` (a real `<a>`/router-link),
no hover-driven paint at all (unlike the activity/metrics families, which
both lean heavily on `isHovered`). `useDsFocusMode()` gates visibility
(`hideOnFocus`), not paint. Zero `.style.x =` imperative writes.

### Keyframes — the checkpoint's largest injection, and its cleanest mechanism

15 `@keyframes` defined in one template literal (:122-181: `dtc-fade-in`,
`dtc-pulse`, `dtc-heartbeat`, `dtc-breathe`, `dtc-scan`, `dtc-glow`,
`dtc-slide`, `dtc-blink`, `dtc-live-pulse`, `dtc-data-tick`, `dtc-wave`,
`dtc-typing`, `dtc-flow`, `dtc-number-glow`), injected via a **module-level**
`if (typeof document !== "undefined")` block (:183-191) guarded by
`document.getElementById(styleId)` with a versioned id
(`data-terminal-card-keyframes-v4`) — this is the checkpoint's one instance
of the *correct* dedup pattern (same shape as WO-SKIN-04's Menu
`ensureGlobalStyles`, better than the activity/metrics families' un-guarded
per-instance `<style>` children): it runs once at module-evaluation time on
the client, not once per mount, so N `DataTerminalCard` instances never
duplicate the block. **3 of the 15 defined keyframes are dead code, never
referenced by any `animation:` value in the file**: `dtc-glow`, `dtc-blink`,
`dtc-number-glow` (grep-verified — every other keyframe name appears in at
least one `animation:` string; these three do not). Record only.

---

## 4. `stats-header/StatsHeader.tsx` — 31 sites, a 4th independent vocabulary, and a real counter blind spot

### Anatomy

`stats-header/engines/{classic,modern,rustic}.tsx` are 9-line pass-throughs
(`export { default } from '../StatsHeader'`) — confirms the "engine-free
structures family" framing; all 31 counted sites live in the shared impl.
No className, no `data-part` anywhere (unlike the other 3 widgets, this one
uses zero classNames at all — its only per-instance `<style>` is a single
`<style dangerouslySetInnerHTML>` injecting 2 keyframes, targeted purely by
`animation:` name, no selector needed).

### `ACCENT_CSS_VAR` / `CHANGE_COLORS` — the checkpoint's 4th, independent vocabulary

```ts
const ACCENT_CSS_VAR: Record<AccentColor, string> = { primary, success, warning, error, info };
const CHANGE_COLORS: Record<'increase'|'decrease'|'neutral', string> = { increase, decrease, neutral };
```

Neither map is shared with `DS` (data-terminal-card), `TYPE_CONFIG` (activity
family), or `METRIC_CARD_*`/`METRIC_PANEL_*` (metrics family) — this file is
its own self-contained fourth vocabulary, same *pattern* (bounded-enum →
static-value map) as the other three, zero *code* sharing. `ACCENT_CSS_VAR[accent]`
(where `accent = stat.accentColor ?? 'primary'`, a consumer-supplied prop
drawn from the 5-value `AccentColor` union, not an arbitrary hex) is the
textbook §2 static-map-index pattern → STATE-SELECTED, `[data-accent=…]`.
`accentAtOpacity(accent, opacity)` (:47-50) wraps the same map in a
`color-mix(in srgb, ${ACCENT_CSS_VAR[accent]} ${pct}%, transparent)` — still
A (the enum is bounded; only the *opacity* argument varies, and every call
site passes a static literal).

### Paint table

Skeleton (loading state, :92-161): `SkeletonBar` `borderRadius`+`background`
(:98,99 STATIC), `SkeletonDots` per-dot `borderRadius`+`background` (:115,116
STATIC), `SkeletonCard` `background`+`border`+`borderRadius` (:133-135
STATIC) + glow `background` (:155 STATIC). `SparklineDots` (:167-205): dot
`borderRadius` (:191 STATIC) + `background` (:192 **STATE-SELECTED**,
`ACCENT_CSS_VAR[accent]`). `ChangeIndicator` (:265-319): period-label `color`
(:310 STATIC) — **plus 2 sites the counter cannot see, below**.
`ProgressBar` (secondary/back-compat, :325-350): track `borderRadius`+
`background` (:333,334 STATIC) + fill `borderRadius`+`background` (:343,344
STATIC+**STATE-SELECTED**). `StatCard` (:356-535): root `cardStyle`
`background`+`border`+`borderRadius` (:374-376 STATIC) + a genuine 3-way
interaction-priority chain — `pressed` (:384,385 `transform`+`boxShadow`
**STATE-SELECTED**) → `hovered` (:389,390 **STATE-SELECTED**) → default
(:393,394 **STATE-SELECTED**), same "priority chain" shape as WO-SKIN-04's
Rate/Steps — label `color` (:415 STATIC), stat-icon-wrapper `color` (:424
STATIC), prefix `color` (:448 STATIC), value `color` (:459 STATIC), suffix
`color` (:471 STATIC), insight `color` (:512 STATIC), bottom glow
`background` (:529 **STATE-SELECTED**, `accentAtOpacity(accent, 0.06)`).
**Totals: 9 STATE-SELECTED (192, 344, 384, 385, 389, 390, 393, 394, 529), 22
STATIC, 0 RUNTIME.**

### The counter blind spot this file surfaces: ES6 object-shorthand `{ color }`

`ChangeIndicator` computes `const color = CHANGE_COLORS[changeType]` (:276)
and then uses it **twice** as bare object-literal shorthand, not `color:
color`:

```tsx
<Flex align="center" gap={3} style={{ color }}>            {/* :289 */}
  <IconComponent size={13} />
  <Text style={{ fontSize: 13, fontWeight: 600, color, ... }}>  {/* :295 */}
```

`ARC09_PAINT_KEY_RE` is `"^(background[A-Za-z]*|...|color|...)\\s*:"` —
it requires a literal `:` immediately (mod whitespace) after the key name.
ES6 shorthand has no colon at all, so **both sites are invisible to the
lexer**: this file's true paint-site count is **33, not 31** — 2 real,
load-bearing STATE-SELECTED sites (the change-indicator icon's `currentColor`
source and its adjacent text color, both driven by `changeType`) that will
never register in `fleet.inlinePaint` and can never drive this file's count
toward a migration-verified 0 by the ratchet alone. **Grep-checked across
the whole CK-A scope (all 10 files) for the same shorthand shape (`{ color
}`, a bare key alone on its own line before a comma) — StatsHeader is the
**only** file in this checkpoint with the defect; the other 9 files always
write the explicit `key: value` form.** This is the same blind-spot class
flagged in memory from WO-SKIN-02 (`.style.x as any=`, `{bg,}`), now located
precisely: `stats-header/StatsHeader.tsx:289` and `:295`.

### Keyframes

2 keyframes (`pulse-card-skeleton`, `pulse-dot-ping`), injected via `<style
dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />` once per `StatsHeaderImpl`
render (:558) — no document-level dedup guard (unlike data-terminal-card's
module-level injection), so N `StatsHeader` instances on one page would each
re-inject an identical block; harmless today only because the content is
byte-identical across instances (same class of latent risk as Tabs'
`rottay-tabs-fade-in` in WO-SKIN-04, lower severity since content can't
diverge — there's only one `StatsHeader` implementation, not 4 variant
files that could drift).

---

## Totals

| file | sites | STATIC | STATE-SELECTED | RUNTIME(B) | C-hatch |
|---|---:|---:|---:|---:|---:|
| `activity/ticker` | 37 | 31 | 6 | 0 | 0 |
| `activity/timeline` | 33 | 24 | 9 | 0 | 0 |
| `activity/compact` | 29 | 21 | 8 | 0 | 0 |
| `activity/cards` | 28 | 20 | 8 | 0 | 0 |
| `metrics/minimal` | 36 | 28 | 8 | 0 | 0 |
| `metrics/cards` | 34 | 27 | 7 | 0 | 0 |
| `metrics/chart` | 34 | 27 | 7 | 0 | 0 |
| `metrics/rows` | 28 | 24 | 4 | 0 | 0 |
| `data-terminal-card` | 149 | 121 | 26 | 0 | 2 |
| `stats-header` | 31 | 22 | 9 | 0 | 0 |
| **Total** | **439** | **345** | **92** | **0** | **2** |

Plus **2 counter-invisible real sites** (`stats-header:289,295`, ES6
shorthand) not in the 439 above. **Zero genuine RUNTIME(B) paint anywhere
in this checkpoint** — every site is either an author-time-static leaf or a
static leaf selected by a bounded enum/boolean/threshold, confirming the
triage's per-family read ("99% A... one `DS`/`TYPE_CONFIG` const-map
vocabulary + one tone enum") and resolving its "2" B/C column as 2 C-hatch
sites, not 2 true-runtime sites (data-terminal-card's `borderRadius: height/2`,
§3 above) — there is no brand-hex/per-datum-color exemption case anywhere in
CK-A, unlike the visualization/misc checkpoints. This split is close to but
not identical to the triage's independently-derived 348/89/2 — expected
variance from two independent manual classification passes, not a
disagreement about scope or method.

### Shared-vocabulary map (brief item 2, consolidated)

| vocabulary | shape | files | adoption |
|---|---|---|---|
| `DS` | single object, ~12 keys (`primary`/`success`/…/`background`/`border`/…) | `data-terminal-card` only | N/A — single-file, not a cross-file sharing question |
| `TYPE_CONFIG` | enum-keyed object, 5 keys → `{icons, gradient}` | `activity/{ticker,timeline,compact,cards}` | **NOT shared** — 4 independent local copies; 3 byte-identical (135deg gradient), 1 diverged (`cards`, 90deg) |
| `METRIC_CARD_*`/`METRIC_PANEL_*` | ~48 individually exported `var(--x, fallback)` consts | `metrics/{minimal,cards,chart,rows}` | **Genuinely shared** — real import from `../tokens.ts`, all 4 consumers clean, no local reinvention (the checkpoint's one CK-C-style "actually adopted" story) |
| `ACCENT_CSS_VAR`/`CHANGE_COLORS` | two small enum-keyed objects, 5 and 3 keys | `stats-header` only | N/A — single-file |

### String-concatenated token names (brief item 3, consolidated)

All in the activity family, all on the bounded `item.type` enum, none
findable by grepping `var(--ds-`:

- `ticker/index.tsx:96,97,102,114`
- `timeline/index.tsx:39,40,42(×2, incl. one nested inside a ternary),47,51`
- `compact/index.tsx:40,41,46,50`
- `cards/index.tsx:40,41,46,50`

### Bridge rules (P-76 disposition)

**None exist.** Grep-confirmed zero hits in `foundation/tokens/css/runtime/engines/{modern,rustic,classic}/theme.css`
and `foundation/tokens/css/runtime/personality.css` for any dashboard/activity/ticker/
metric/stat-card/data-terminal/stats-header selector. This checkpoint has no
suppression risk to classify dead/live under P-76 — there is simply nothing
in the layered CSS reaching for any of these components today. Confirmed
also: **no existing skin file for any of the 10 components** — 100%
greenfield, matching the metrics/status-card precedent from WO-SKIN-03, not
the navigation family's partial-legacy shape from WO-SKIN-04.

### Interaction paint mechanism summary

- Activity family: 100% React `useState` (`isHovered`, `isAnimating`,
  `currentIndex`), zero imperative `.style.x=` writes.
- Metrics family: 3 of 4 (`minimal`, `chart`, and `rows`' accent-bar-width
  only) use React `isHovered` state for *some* channels; `cards` and `rows`'
  value-color both prove the family already has a working CSS-only `:hover`
  pattern that the other files should have used instead of inline state.
- `data-terminal-card`: zero hover-driven paint of any kind, zero imperative
  writes — its only "interaction" is a real anchor link.
- `stats-header`: a genuine 3-way `pressed`/`hovered`/default priority chain,
  all inline React state (`onMouseDown`/`onMouseUp`/`onMouseEnter`/`onMouseLeave`),
  zero CSS pseudo-classes, zero imperative writes. Note `pressed` is
  mouse-only (no keyboard-equivalent `:active` coverage) — a real
  accessibility gap, pre-existing, record only.

**Zero imperative `.style.x =` / `.style.setProperty(...)` writes anywhere
in the entire 439-site, 10-file checkpoint** (grep- and lexer-confirmed) —
the cleanest interaction-mechanism profile of any WO-SKIN checkpoint
inventoried so far.

---

## The three biggest traps

1. **The variant-pinning trap is two different mechanisms with two different
   fixes, not one.** `dashboard-insights` needs no override at all — mount
   all 8 named exports directly, exactly as the showroom already proves is
   safe for 2 of them (today the *only* two of the 8 that render anywhere in
   this repository). `data-terminal-card` has no way around its 4 private,
   unexported card bodies except pinning the `variant` prop directly on the
   public `<DataTerminalCard>` — and that pinning is not just a testing
   convenience, it is the only SSR-safe path (unpinned defaults to `1` on
   the server and a real `Math.random()` roll on the client, a guaranteed
   hydration mismatch on every unpinned instance in any SSR app, a genuine
   pre-existing defect this inventory surfaced).

2. **Two independent same-name/different-content `@keyframes` collisions,
   live today, not hypothetical.** `liveGlow` (`ticker` vs. `timeline`) and
   `glow` (`metrics/minimal` vs. `metrics/chart`) each have two different
   blur/opacity recipes sharing one document-global name; whichever
   component's `<style>` tag renders second silently overwrites the other's
   animation for every element using that name, anywhere on the page. A
   migration must engine/component-namespace every keyframe it extracts
   (`ds-ticker-live-glow`, `ds-timeline-live-glow`, `ds-metrics-minimal-glow`,
   `ds-metrics-chart-glow`) rather than reusing the bare source names — the
   same law WO-SKIN-02 paid for, recurring here at file-pair granularity
   rather than skin-pair.

3. **The counter has a real, previously-undocumented-in-this-checkpoint
   blind spot: ES6 object-literal shorthand.** `ARC09_PAINT_KEY_RE` requires
   a literal `:` after the key name; `{ color }` (shorthand for `{ color:
   color }`) has none, so `stats-header/StatsHeader.tsx:289,295` — two real,
   load-bearing, `changeType`-driven STATE-SELECTED sites — are permanently
   invisible to `fleet.inlinePaint`. Checked across all 10 files; only this
   one has the defect. If a migration script uses "counter reads 0" as its
   completeness gate for this file, it will certify a false 0 with 2 real
   sites still unmigrated. Either exempt-and-hand-verify these 2, or extend
   the lexer to also match a bare identifier at a paint-key position followed
   by `,` or `}` with no colon (mirroring how it already special-cases
   `interface`/`type` bodies) — the fix is small and the risk (silently
   uncounted real paint) is exactly the class of error this whole lane
   exists to prevent.
