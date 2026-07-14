# WO-SKIN-06 addendum — embedded CSS producer recovery

Status: certified (2026-07-14).

The fail-closed embedded-CSS census exposed 202 paint declarations in productive component sources.
Seven belong to the explicit opt-in `TableCheckboxStyles` injector and are protected by
`SKIN-EXEMPT-EMBEDDED-CSS-CONTRACT`. The other **195 declarations were static stylesheet producers**
that could be loaded once by the canonical design-system bundle.

## Measured result

| cluster                         |  before | after |
| ------------------------------- | ------: | ----: |
| data-table engines              |      22 |     0 |
| Timeline + Tree                 |       8 |     0 |
| Toast keyframes                 |      20 |     0 |
| Input + Select placeholders     |       2 |     0 |
| ScrollArea engines              |      25 |     0 |
| Menu + Tabs                     |       8 |     0 |
| dashboard activity              |      43 |     0 |
| dashboard metrics               |      44 |     0 |
| DataTerminalCard                |      20 |     0 |
| StatsHeader                     |       3 |     0 |
| approved TableCheckbox injector |       7 |     7 |
| **global embedded channel**     | **202** | **7** |

The final census covers 1,047 productive files and reports 7 classified declarations, 0 parse
failures, 0 dynamic-property failures, 0 unknown sinks and 0 other unclassified roots.

## Canonical CSS

The recovered declarations live in ten unlayered files, wired into both canonical entrypoints:

- `components/skin/data-table-interactions.css`;
- `components/skin/primitive-motion.css`;
- `components/skin/toast-animation-keyframes.css`;
- `components/skin/scroll-area.css`;
- `components/skin/navigation-static.css`;
- `components/skin/form-placeholders.css`;
- `components/skin/dashboard-activity-interactions.css`;
- `components/skin/dashboard-metrics-interactions.css`;
- `components/skin/data-terminal-card-keyframes.css`;
- `components/skin/stats-header-keyframes.css`.

Every producer was removed from the component source. Legitimate responsive CSS generators remain;
the census distinguishes their runtime layout/custom-property output from the static paint removed
here.

## Adjudications

- ScrollArea's former per-instance class interpolation is represented by the existing closed
  `thin | normal | wide` enum and `hideScrollbar` boolean on stable component-owned data attributes.
  Widths, radii, paint values and hover states remain exact.
- Tabs' instance-id selector becomes the component-owned `[data-tabs-id]` selector. The keyframe,
  focus priority and values are unchanged; no unrelated component owns that attribute.
- Menu's singleton document mutation is removed. Its `!important` focus rule, marker reset and
  chevron transform retain their original priority in canonical CSS.
- DataTerminalCard and StatsHeader keyframe names/frame bodies remain exact because runtime animation
  values already reference those stable names.
- CK-A documented two live same-name/different-body collisions (`liveGlow` and `glow`) and its
  inherited lane law requires every extracted activity/metrics keyframe to become
  component-namespaced. All 16 activity/metrics names therefore move to variant-owned names while
  their frame bodies and consumers remain exact. This also prevents generic names such as `glow`
  and `shimmer` from colliding with global foundation animations. The namespacing is the previously
  approved collision repair, not a visual redesign. DataTerminalCard and StatsHeader keep their
  already-stable names unchanged.
- DataTable's generic `ds-shimmer` also collided with ShimmerText's live keyframe of the same name
  but a different body (`opacity` versus `background-position`). The extracted table keyframe and
  its consumer are therefore renamed together to `ds-data-table-shimmer`; frame bytes and cadence
  stay exact while coexistence becomes deterministic.
- DataTable's extracted interaction rules are contained by
  `.ds-engine-modern:where(.ds-pattern-data-table)`. The zero-weight root restores the former
  mount-local reach without raising specificity or leaking generic `th`/`td` hooks into other
  modern-engine components.
- `TableCheckboxStyles` remains embedded. Globalizing its seven declarations would broaden an
  explicitly opt-in contract, so its exact declaration identity and mount/unmount behavior stay
  protected by a focused test and channel floor.
- Toast's legacy `injectToastStyles()` export remains as an SSR-safe no-op for API compatibility.
  Its keyframes now arrive through the required public stylesheet contract: consumers import the
  full `@rottay/design-system/styles.css` export or the matching vertical stylesheet. JS-only usage
  was never sufficient for the complete component skin and no longer installs Toast paint as a
  side effect.

## Executable evidence

- `EmbeddedCssRecovery.contract.test.ts` reconciles all 85 primitive/data declarations, state hooks,
  retained responsive producers and animation consumers.
- `DashboardEmbeddedCssRecovery.contract.test.ts` reconciles 110 dashboard declarations, parses and
  hashes all four payloads, and pins the 32 collision-safe keyframe identities.
- Existing DataTable, Toast, Tree, Timeline, Input, Select, Menu, Tabs and StatsHeader suites exercise
  the real component engines.
- The global integration sentinel now requires embedded totals `7 classified / 0 unclassified` and
  exactly one non-zero source file.

## Certification evidence

- core and Showroom production builds are green;
- all five tracked vertical bundles were regenerated and contain the recovered selectors/keyframes;
- the full engine audit is green at fleet inline 634, embedded CSS 7 classified / 0 unclassified,
  and zero skin parse/unwired/exemption/dead-part breaches;
- 78 focused Node audit/recovery assertions and 90 focused Vitest component/contract assertions are
  green;
- the affected 99-case Rottay-dark/BitHire-light visual matrix passed two independent no-update
  runs against the committed baselines;
- adversarial counter review closed the five remaining P2 families: certified-producer argument
  contracts, shorthand/opaque prop bags, style-map slot replacement, React/SVG factory aliases and
  modern CSS sinks.
