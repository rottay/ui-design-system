# W-R reclassification under tenant-first ownership

Every declaration still standing in the three static vertical extensions, re-owned
under the binding product correction: **visible colour always comes from the tenant**
(static `BrandTheme` for first-party, Appearance DB for customers), Modern consumes
semantic channels and has no light/dark identity of its own, and `themes/default.css`
carries no tenant-specific value.

Inputs are the P1 measurements, which stay valid — only the OWNERSHIP verdict changes.
Counts are one row per declaration (a channel declared in both a dark and a light arm
counts twice); the channel counts beside them are what the work is actually sized in.

## 1. Vertical x new owner

| new owner | rottay | bithire | evnto | total | distinct channels |
|---|---:|---:|---:|---:|---:|
| (a) BrandTheme / Appearance | 223 | 96 | 40 | **359** | 196 |
| (b) Modern semantic derivation | 846 | 62 | 2 | **910** | 467 |
| (c) app `--rt-*` / public hook | 0 | 66 | 16 | **82** | 77 |
| (d) retire | 273 | 177 | 16 | **466** | 285 |
| (e) governed small exception | 0 | 3 | 0 | **3** | 3 |
| **total** | **1342** | **404** | **74** | **1820** | |

## 2. What each old class became

The prior classification measured capability and reality. It did not measure OWNERSHIP,
which is why the same rows move: `component-literal` was read as "the DS owes itself a
dark default layer"; under the correction it is "Modern owes itself a derivation over
tenant channels", and there is no dark layer to build.

| prior class | rottay | bithire | evnto | new owner |
|---|---:|---:|---:|---|
| existing-BrandTheme-field | 57 | 37 | 10 | (a) |
| semantic-vocabulary | 166 | 59 | 30 | (a) |
| component-literal | 843 | 73 | 2 | (b) + (c) |
| unclassified-semantic | 2 | 55 | 16 | (b) + (c) |
| obsolete | 273 | 177 | 16 | (d) |
| legitimate-media-reduced-motion | 0 | 3 | 0 | (e) |
| non-custom-property | 1 | 0 | 0 | (b) |

## 3. Owner (a) — tenant identity

| sub-owner | rottay | bithire | evnto | meaning |
|---|---:|---:|---:|---|
| brandtheme-field | 27 | 24 | 6 | a typed BrandTheme leaf already exists; authoring it in the theme deletes the extension line |
| chrome-field | 30 | 13 | 4 | the chrome emitter can already write it from a typed chrome section |
| brandtheme-derived | 78 | 21 | 15 | the COMPILER should derive it (ramp step, alpha wash, tint ladder, type scale); the tenant must not hand-author it |
| contract-addition | 88 | 38 | 15 | tenant semantic vocabulary with no typed leaf; needs a common-contract field |

**Contract additions the common contract needs (73 distinct channels)** — the full list is in
`pc-reclassification.json`; the families are:

* `--ds-color-*` (31) — --ds-color-bg-canvas, --ds-color-bg-elevated, --ds-color-bg-info, --ds-color-bg-overlay, --ds-color-bg-secondary, --ds-color-bg-surface, …
* `--ds-surface-*` (15) — --ds-surface-border, --ds-surface-border-soft, --ds-surface-border-strong, --ds-surface-card-border-soft, --ds-surface-card-border-strong, --ds-surface-card-grid-bg, …
* `--ds-live-*` (11) — --ds-live-feed-badge-bg, --ds-live-feed-badge-color, --ds-live-feed-bg, --ds-live-feed-border, --ds-live-feed-empty-color, --ds-live-feed-load-more-color, …
* `--ds-border-*` (6) — --ds-border-color, --ds-border-color-default, --ds-border-color-focus, --ds-border-color-hover, --ds-border-color-muted, --ds-border-color-strong
* `--ds-font-*` (3) — --ds-font-family-base, --ds-font-family-display, --ds-font-family-heading
* `--ds-shadow-*` (2) — --ds-shadow-focus-ring, --ds-shadow-focus-ring-error
* `--ds-focus-*` (1) — --ds-focus-ring-color
* `--ds-gradient-*` (1) — --ds-gradient-dark
* `--ds-icon-*` (1) — --ds-icon-tile-border
* `--ds-overlay-*` (1) — --ds-overlay-bg
* `--ds-z-*` (1) — --ds-z-index-tooltip

## 4. Owner (b) — Modern semantic derivation

Each channel gets ONE expression that must hold in every state the extension declares,
because Modern has no mode identity to switch on. The role grammar picks the semantic
FAMILY from the channel name; the tenant's own current value picks the STEP inside it.
Neither alone is trustworthy — the name cannot know a tenant pins `bg-tertiary` where the
grammar says `bg-primary`, and in a near-monochrome palette value equality alone is
collision rather than meaning.

| confidence | rottay | bithire | evnto | total | what it means |
|---|---:|---:|---:|---:|---|
| exact | 339 | 39 | 1 | **379** | adopting the derivation repaints nothing — the tenant channel already carries the value, or the extension already writes the expression |
| close | 485 | 22 | 1 | **508** | the semantic target is right and the derivation is mechanical, but adopting it moves pixels; needs a sighted confirm |
| needs-design | 22 | 1 | 0 | **23** | no semantic target can be named without a design decision first |

| derivation kind | rottay | bithire | evnto | form of the proposal |
|---|---:|---:|---:|---|
| semantic-var | 716 | 17 | 2 | `var(--ds-color-…)` over a tenant channel |
| semantic-expression | 1 | 19 | 0 | the extension already writes the expression; verbatim lift |
| chrome-expression | 0 | 7 | 0 | expression over compiler-emitted chrome channels; verbatim lift |
| chained | 0 | 15 | 0 | expression that reads another extension channel; exact once that one lands |
| alpha-wash | 48 | 0 | 0 | `color-mix(in srgb, var(--ds-…) N%, transparent)` |
| structural | 52 | 0 | 0 | compound value, colour tokens replaced, Modern keeps the geometry |
| modern-geometry | 7 | 3 | 0 | not paint — a Modern literal or a `--ds-density-*` derivation, never a tenant channel |
| contract-blocked | 10 | 0 | 0 | the role family is not reachable from the contract for this tenant |
| unresolved | 12 | 1 | 0 | compound effect or unnamed role; a design call comes first |

Repaint magnitude for the `close` set (max ΔRGB between the value the extension pins and
the value the proposed tenant channel carries today):

| magnitude | rottay | bithire | evnto |
|---|---:|---:|---:|
| none | 75 | 18 | 0 |
| small | 104 | 2 | 1 |
| visible | 254 | 2 | 0 |
| unknown | 52 | 0 | 0 |

The whole design queue is 23 declarations over 13 channels:

* `--ds-form-label-font-weight` — dark: `600`, light: `600`
* `--ds-inputnumber-control-bg` — dark: `transparent`, light: `transparent`
* `--ds-pagination-item-bg` — dark: `transparent`, light: `transparent`
* `--ds-pagination-item-border` — dark: `transparent`, light: `transparent`
* `--ds-sidebar-icon-column-size` — dark: `20px`
* `--ds-sidebar-item-font-size-child` — dark: `14.2px`
* `--ds-skeleton-highlight` — dark: `#2A2A2F`, light: `#F4F4F3`
* `--ds-stats-grid-trend-negative` — dark: `#EF4444`, light: `#DC2626`
* `--ds-stats-grid-trend-neutral` — dark: `#6B6B72`, light: `#9C9C9C`
* `--ds-stats-grid-trend-positive` — dark: `#22C55E`, light: `#16A34A`
* `--ds-steps-wait-bg` — dark: `transparent`, light: `transparent`
* `--ds-tooltip-z-index` — default: `2700`
* `--ds-upload-progress-bar` — dark: `#FFFFFF`, light: `#0A0A0A`

## 5. Owner (c) — app hooks

| family | rottay | bithire | evnto | DS readers | verdict |
|---|---:|---:|---:|---:|---|
| `--ds-action-*` | 0 | 3 | 0 | 0 | clean move to the owning app |
| `--ds-breadcrumb-*` | 0 | 4 | 0 | 0 | clean move to the owning app |
| `--ds-card-*` | 0 | 1 | 0 | 0 | clean move to the owning app |
| `--ds-cell-*` | 0 | 3 | 0 | 0 | clean move to the owning app |
| `--ds-chart-*` | 0 | 1 | 0 | 0 | clean move to the owning app |
| `--ds-detail-*` | 0 | 15 | 0 | 0 | clean move to the owning app |
| `--ds-event-*` | 0 | 0 | 10 | 10 | **blocked** — de-productize the DS readers first |
| `--ds-expanded-*` | 0 | 4 | 0 | 0 | clean move to the owning app |
| `--ds-insight-*` | 0 | 3 | 0 | 0 | clean move to the owning app |
| `--ds-list-*` | 0 | 15 | 0 | 0 | clean move to the owning app |
| `--ds-premium-*` | 0 | 14 | 0 | 135 | **blocked** — de-productize the DS readers first |
| `--ds-preview-*` | 0 | 1 | 0 | 0 | clean move to the owning app |
| `--ds-table-*` | 0 | 2 | 0 | 0 | clean move to the owning app |
| `--ds-ticket-*` | 0 | 0 | 6 | 6 | **blocked** — de-productize the DS readers first |

## 6. Owners (d) and (e)

| owner | rottay | bithire | evnto | note |
|---|---:|---:|---:|---|
| (d) retire | 273 | 177 | 16 | zero non-declarer non-test readers anywhere in DS core, showroom or the three apps — the P1 obsolete inventory, unchanged |
| (e) governed small exception | 0 | 3 | 0 | `@media (prefers-reduced-motion: reduce)` overrides; an at-rule cannot be expressed as a channel |

