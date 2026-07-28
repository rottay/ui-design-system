# Phase 3 migration ledger — bithire static vertical extension (Codex C6.9)

One row per authored region. `destination` ∈ {BrandTheme/Appearance, Modern-DS, app-bithire,
retired-dead, DS-extension-kept, BLOCKED-by-WIP}. No region resolved to BrandTheme/Appearance
(W-B already drained every brand value out of the mode blocks) and none to Modern-DS — every
surviving rule was scoped to a single tenant, so a Modern destination would have repainted the
other verticals. None was BLOCKED-by-WIP: no rule needed a dirty Modern skin file.

| region id | kind | destination | rules | decls | !imp | app tokens | engine tokens |
|---|---|---|---:|---:|---:|---:|---:|
| `capability-gap#04950ac6#1` | capability-gap | **DS-extension-kept** | 1 | 179 | 0 | 0 | 0 |
| `capability-gap#477fb154#1` | capability-gap | **DS-extension-kept** | 1 | 30 | 0 | 0 | 0 |
| `capability-gap#04950ac6#2` | capability-gap | **DS-extension-kept** | 1 | 4 | 0 | 0 | 0 |
| `capability-gap#04950ac6#3` | capability-gap | **DS-extension-kept** | 1 | 29 | 0 | 0 | 0 |
| `capability-gap#04950ac6#4` | capability-gap | **DS-extension-kept** | 1 | 9 | 0 | 0 | 0 |
| `capability-gap#04950ac6#5` | capability-gap | **DS-extension-kept** | 1 | 2 | 0 | 0 | 0 |
| `capability-gap#04950ac6#6` | capability-gap | **DS-extension-kept** | 1 | 156 | 0 | 0 | 0 |
| `structural#b82726b0#1` | structural | **app-bithire** | 2 | 4 | 0 | 0 | 0 |
| `component-local#8c73a7bc#1` | component-local | **app-bithire** | 16 | 38 | 17 | 5 | 0 |
| `media#7e40dadd#1` | media | **app-bithire** | 2 | 4 | 2 | 3 | 0 |
| `component-local#8c73a7bc#2` | component-local | **app-bithire** | 94 | 438 | 9 | 7 | 0 |
| `component-local#8c73a7bc#3` | component-local | **app-bithire** | 82 | 299 | 19 | 3 | 2 |
| `reduced-motion#d1d81419#1` | reduced-motion | **app-bithire** | 2 | 3 | 3 | 1 | 0 |
| `media#7e40dadd#2` | media | **app-bithire** | 14 | 30 | 13 | 2 | 0 |
| `component-local#8c73a7bc#4` | component-local | **retired-dead** | 1 | 10 | 0 | 1 | 1 |
| `component-local#8c73a7bc#5` | component-local | **retired-dead** | 6 | 18 | 0 | 6 | 9 |
| `component-local#8c73a7bc#6` | component-local | **retired-dead** | 1 | 1 | 0 | 1 | 1 |
| `component-local#8c73a7bc#7` | component-local | **app-bithire** (partial) | 1 | 1 | 0 | 1 | 2 |
| `component-local#8c73a7bc#8` | component-local | **app-bithire** | 1 | 1 | 0 | 0 | 0 |
| `component-local#8c73a7bc#9` | component-local | **retired-dead** | 2 | 10 | 0 | 0 | 3 |
| `reduced-motion#d1d81419#2` | reduced-motion | **DS-extension-kept** (partial) | 2 | 4 | 0 | 1 | 1 |
| `component-local#8c73a7bc#10` | component-local | **split** (partial) | 14 | 54 | 0 | 10 | 16 |
| `component-local#8c73a7bc#11` | component-local | **app-bithire** | 97 | 496 | 327 | 56 | 2 |
| `structural#b82726b0#2` | structural | **app-bithire** | 2 | 4 | 0 | 0 | 0 |
| `component-local#8c73a7bc#12` | component-local | **app-bithire** | 7 | 24 | 20 | 9 | 0 |
| `media#7e40dadd#3` | media | **app-bithire** | 11 | 26 | 7 | 12 | 0 |
| `component-local#8c73a7bc#13` | component-local | **app-bithire** | 10 | 32 | 7 | 9 | 0 |
| `component-local#8c73a7bc#14` | component-local | **app-bithire** | 1 | 4 | 0 | 1 | 0 |
| `component-local#8c73a7bc#15` | component-local | **app-bithire** | 13 | 61 | 38 | 10 | 0 |

## Totals by destination

| destination | regions | rules | declarations | !important |
|---|---:|---:|---:|---:|
| DS-extension-kept | 8 | 9 | 413 | 0 |
| app-bithire | 16 | 355 | 1465 | 462 |
| retired-dead | 4 | 10 | 39 | 0 |
| split | 1 | 14 | 54 | 0 |

## Per-region rationale, cascade analysis and selector evidence

### `capability-gap#04950ac6#1` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 179 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]:not([data-theme="dark"]):not(.dark)
```

</details>

### `capability-gap#477fb154#1` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 30 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"][data-theme="dark"], html[data-tenant="bithire"].dark
```

</details>

### `capability-gap#04950ac6#2` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 4 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]
```

</details>

### `capability-gap#04950ac6#3` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 29 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]
```

</details>

### `capability-gap#04950ac6#4` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 9 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]
```

</details>

### `capability-gap#04950ac6#5` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 2 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]
```

</details>

### `capability-gap#04950ac6#6` → DS-extension-kept

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Root-level semantic capability gap: html[data-tenant="bithire"] custom properties only, owner+retire declared. This is the exception class C6.4 still permits.

**Cascade position.** Untouched, in place.

**Volume.** 1 rule(s), 156 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]
```

</details>

### `structural#b82726b0#1` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** @keyframes bithire-preview-enter; its only consumer is the preview-rail rule in region 7, which moves with it. No other definition of that name exists in DS or app (grep).

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 2 rule(s), 4 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
from
to
```

</details>

### `component-local#8c73a7bc#1` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** BitHire collection/table composition: .bithire-data-table-card, .bithire-collection-polish, .bithire-collection-preview*, [data-bithire-preview-focused], plus live DS arms .ds-data-table-card/.ds-collection-enhanced (app-ts 12/1). Product composition, not generic Modern paint.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 16 rule(s), 38 declaration(s), 17 `!important`.

**App selector tokens.** `.bithire-data-table-card`, `[data-bithire-preview-focused`, `.bithire-collection-polish`, `.bithire-collection-preview`, `.bithire-collection-preview-frame`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where( .bithire-data-table-card tbody tr[data-bithire-preview-focused="true"], .ds-data-table-card tbody tr[data-bithire-preview-focused="true"], .ds-collection-enhanced tbody tr[data-bithire-preview-focused="true"] )
html[data-tenant="bithire"] :where( .bithire-data-table-card tbody tr[data-bithire-preview-focused="true"] td, .ds-data-table-card tbody tr[data-bithire-preview-focused="true"] td, .ds-collection-enhanced tbody tr[data-bithire-preview-focused="true"] td )
html[data-tenant="bithire"] :where( .bithire-data-table-card :is(td, th):has([role="tooltip"][aria-hidden="false"]), .ds-data-table-card :is(td, th):has([role="tooltip"][aria-hidden="false"]), .ds-collection-enhanced :is(td, th):has([role="tooltip"][aria-hidden="false"]) )
html[data-tenant="bithire"] :where( .bithire-data-table-card:has([role="tooltip"][aria-hidden="false"]), .ds-data-table-card:has([role="tooltip"][aria-hidden="false"]), .ds-collection-enhanced:has([role="tooltip"][aria-hidden="false"]), .bithire-data-table-card .ds-pattern-data-table:has([role="tooltip"][aria-hidden="false"]) > div, .ds-data-table-card .ds-pattern-data-table:has([role="tooltip"][aria-hidden="false"]) > div, .ds-collection-enhanced .ds-pattern-data-table:has([role="tooltip"][aria-hidden="false"]) > div, .bithire-data-table-card .ds-pattern-data-table:has([role="tooltip"][aria-hidden="false"]) > div > div, .ds-data-table-card .ds-pattern-data-table:has([role="tooltip"][aria-hidden="false"]) > div > div, .ds-collection-enhanced .ds-pattern-data-table:has([role="tooltip"][aria-hidden="false"]) > div > div )
html[data-tenant="bithire"] :where( .bithire-data-table-card tr:has([role="tooltip"][aria-hidden="false"]), .ds-data-table-card tr:has([role="tooltip"][aria-hidden="false"]), .ds-collection-enhanced tr:has([role="tooltip"][aria-hidden="false"]) )
html[data-tenant="bithire"] :where( .bithire-data-table-card [role="tooltip"][aria-hidden="false"], .ds-data-table-card [role="tooltip"][aria-hidden="false"], .ds-collection-enhanced [role="tooltip"][aria-hidden="false"] )
html[data-tenant="bithire"] :where(.bithire-collection-polish)
html[data-tenant="bithire"] :where(.bithire-collection-polish .ds-collection-enhanced)
html[data-tenant="bithire"] :where( .bithire-collection-polish .ds-collection-enhanced [data-ds-collection-body="true"] )
html[data-tenant="bithire"] :where( .bithire-collection-polish .bithire-collection-preview, .bithire-collection-polish .bithire-collection-preview-frame )
html[data-tenant="bithire"] :where( .bithire-collection-polish .bithire-collection-preview [style*="white-space: nowrap"] )
html[data-tenant="bithire"] :where( .bithire-collection-polish .bithire-collection-preview-frame__close-row )
html[data-tenant="bithire"] :where( .bithire-collection-polish button[aria-label], .bithire-collection-polish [role="button"] )
html[data-tenant="bithire"] :where( .bithire-collection-polish .ds-engine-modern tr[data-row-index]:focus, .bithire-collection-polish .ds-engine-modern tr[data-row-index]:focus-within )
html[data-tenant="bithire"] :where( .bithire-collection-polish .ds-engine-modern tr[data-row-index]:focus td, .bithire-collection-polish .ds-engine-modern tr[data-row-index]:focus-within td )
html[data-tenant="bithire"] :where( .bithire-collection-polish .ds-collection-enhanced tbody tr:focus-within, .bithire-collection-polish .ds-collection-enhanced tbody tr:has([role="tooltip"][aria-hidden="false"]) )
```

</details>

### `media#7e40dadd#1` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** @supports/@media gating of the same .bithire-collection-polish family as region 5.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 2 rule(s), 4 declaration(s), 2 `!important`.

**App selector tokens.** `.bithire-collection-polish`, `.bithire-collection-preview`, `.bithire-collection-preview-frame`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where( .bithire-collection-polish div:has(> .bithire-collection-preview), .bithire-collection-polish div:has(> .bithire-collection-preview-frame) )
html[data-tenant="bithire"] :where(.bithire-collection-polish)
```

</details>

### `component-local#8c73a7bc#2` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** Preview rail + .rt-collection-preview__* panel skin (113 app renders) + .rt-expanded-panel (18) + .bithire-preview-rail-close. Pure product composition.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 94 rule(s), 438 declaration(s), 9 `!important`.

**App selector tokens.** `[data-bithire-preview-rail`, `.bithire-preview-rail-close`, `.rt-expanded-panel`, `.rt-collection-preview`, `.rt-collection-preview--compact`, `.rt-collection-preview--loose`, `.rt-collection-preview--entity`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where(.ds-collection-enhanced > [data-ds-collection-toolbar-row="true"])
html[data-tenant="bithire"] :where(.ds-collection-enhanced > [data-ds-collection-body="true"])
html[data-tenant="bithire"] :where(.ds-collection-enhanced > [data-ds-collection-body="true"] > div)
html[data-tenant="bithire"] :where(.ds-collection-enhanced [data-bithire-preview-rail="true"]), html[data-tenant="bithire"] :where(.ds-collection-enhanced .ds-collection-preview-rail)
html[data-tenant="bithire"] :where(.bithire-preview-rail-close)
html[data-tenant="bithire"] :where(.bithire-preview-rail-close:hover)
html[data-tenant="bithire"] :where(.bithire-preview-rail-close:focus-visible)
html[data-tenant="bithire"] :where(.rt-expanded-panel)
html[data-tenant="bithire"] :where(.rt-expanded-panel__header)
html[data-tenant="bithire"] :where(.rt-expanded-panel__body)
html[data-tenant="bithire"] :where(.rt-expanded-panel__content)
html[data-tenant="bithire"] :where(.rt-expanded-panel__actions)
html[data-tenant="bithire"] :where(.rt-expanded-panel__actions :is(button, a, [role="button"]))
html[data-tenant="bithire"] :where(.rt-expanded-panel__detail-field)
html[data-tenant="bithire"] :where(.rt-expanded-panel__detail-field-label)
html[data-tenant="bithire"] :where(.rt-expanded-panel__detail-field-value)
html[data-tenant="bithire"] :where(.rt-collection-preview)
html[data-tenant="bithire"] :where(.rt-collection-preview--compact)
html[data-tenant="bithire"] :where(.rt-collection-preview--loose)
html[data-tenant="bithire"] :where(.rt-collection-preview__header)
html[data-tenant="bithire"] :where(.rt-collection-preview__header-main)
html[data-tenant="bithire"] :where(.rt-collection-preview__media)
html[data-tenant="bithire"] :where(.rt-collection-preview__identity)
html[data-tenant="bithire"] :where(.rt-collection-preview__eyebrow)
html[data-tenant="bithire"] :where(.rt-collection-preview__title)
html[data-tenant="bithire"] :where(.rt-collection-preview__description)
html[data-tenant="bithire"] :where(.rt-collection-preview__actions)
html[data-tenant="bithire"] :where(.rt-collection-preview__actions :is(button, a, [role="button"]))
html[data-tenant="bithire"] :where(.rt-collection-preview__close)
html[data-tenant="bithire"] :where(.rt-collection-preview__close:hover)
html[data-tenant="bithire"] :where(.rt-collection-preview__close:focus-visible)
html[data-tenant="bithire"] :where(.rt-collection-preview__section)
html[data-tenant="bithire"] :where(.rt-collection-preview__section[data-preview-emphasis="strong"])
html[data-tenant="bithire"] :where(.rt-collection-preview__section[data-preview-emphasis="subtle"])
html[data-tenant="bithire"] :where(.rt-collection-preview__body)
html[data-tenant="bithire"] :where(.rt-collection-preview--entity .rt-collection-preview__body)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-visual)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-main)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-kicker)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-title-row)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-title)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-subtitle)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-description)
html[data-tenant="bithire"] :where( .rt-collection-preview__hero-meta, .rt-collection-preview__hero-badges )
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-aside)
html[data-tenant="bithire"] :where(.rt-collection-preview__section-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__section-identity)
html[data-tenant="bithire"] :where(.rt-collection-preview__section-title)
html[data-tenant="bithire"] :where(.rt-collection-preview__section-description)
html[data-tenant="bithire"] :where(.rt-collection-preview__section-content)
html[data-tenant="bithire"] :where(.rt-collection-preview__section-content > :not(:first-child))
html[data-tenant="bithire"] :where(.rt-collection-preview__badges)
html[data-tenant="bithire"] :where(.rt-collection-preview__summary)
html[data-tenant="bithire"] :where(.rt-collection-preview__summary[data-preview-prominence="strong"])
html[data-tenant="bithire"] :where(.rt-collection-preview__summary[data-preview-prominence="subtle"])
html[data-tenant="bithire"] :where(.rt-collection-preview__summary-icon)
html[data-tenant="bithire"] :where( .rt-collection-preview__summary[data-preview-prominence="strong"] .rt-collection-preview__summary-icon )
html[data-tenant="bithire"] :where(.rt-collection-preview__summary-body)
html[data-tenant="bithire"] :where(.rt-collection-preview__summary-title)
html[data-tenant="bithire"] :where( .rt-collection-preview__summary[data-preview-prominence="strong"] .rt-collection-preview__summary-title )
html[data-tenant="bithire"] :where(.rt-collection-preview__summary-detail)
html[data-tenant="bithire"] :where(.rt-collection-preview__summary-meta)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-grid)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-icon)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-label)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-value)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-detail)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-progress)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-progress-bar)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-list)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-item)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-icon)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-body)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-row)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-label)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-value)
html[data-tenant="bithire"] :where( .rt-collection-preview__detail-item .rt-collection-preview__detail-value )
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-description)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-meta)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-actions)
html[data-tenant="bithire"] :where( .rt-collection-preview__quick-actions :is(button, a, [role="button"]) )
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action:hover)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action:focus-visible)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action[disabled])
html[data-tenant="bithire"] :where( .rt-collection-preview__quick-action[data-preview-action-primary="true"] )
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action-icon)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action-body)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action-title)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action-description)
html[data-tenant="bithire"] :where(.rt-collection-preview__footer)
```

</details>

### `component-local#8c73a7bc#3` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** Decision-cockpit / lane variants of the same .rt-collection-preview panel + BitHire tooltip z-index policy ([role=tooltip], .rottay-tooltip, .ds-tooltip).

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 82 rule(s), 299 declaration(s), 19 `!important`.

**App selector tokens.** `.rt-collection-preview`, `.rt-expanded-panel`, `.rottay-tooltip`

**Engine selector tokens.** `.tooltip`, `.tooltip-content`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where(.rt-collection-preview)
html[data-tenant="bithire"] :where( .rt-collection-preview[data-preview-panel-variant="decision-cockpit"] )
html[data-tenant="bithire"] :where(.rt-collection-preview__body)
html[data-tenant="bithire"] :where(.rt-collection-preview__section)
html[data-tenant="bithire"] :where(.rt-collection-preview__section + .rt-collection-preview__section)
html[data-tenant="bithire"] :where(.rt-collection-preview__section[data-preview-section-variant="band"])
html[data-tenant="bithire"] :where( .rt-collection-preview__section[data-preview-section-variant="callout"] )
html[data-tenant="bithire"] :where( .rt-collection-preview__section[data-preview-section-variant="plain"] )
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-cockpit)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-cockpit-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-cockpit-identity)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-cockpit-body)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-tile)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-tile-icon)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-tile-body)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-tile-label)
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-tile-value)
html[data-tenant="bithire"] :where( .rt-collection-preview__decision-tile-detail, .rt-collection-preview__decision-tile-meta )
html[data-tenant="bithire"] :where(.rt-collection-preview__decision-tile-meta)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-identity)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-title)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-description)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-items)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-marker)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item-body)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item-label)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item-value)
html[data-tenant="bithire"] :where( .rt-collection-preview__lane-item-detail, .rt-collection-preview__lane-item-meta )
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item-meta)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-meter)
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-meter-bar)
html[data-tenant="bithire"] :where( .rt-collection-preview__lane[data-preview-lane-variant="timeline"] .rt-collection-preview__lane-items )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane[data-preview-lane-variant="timeline"] .rt-collection-preview__lane-item:not(:last-child)::before )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane[data-preview-lane-variant="funnel"] .rt-collection-preview__lane-item )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane[data-preview-lane-variant="funnel"] .rt-collection-preview__lane-marker )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane[data-preview-lane-variant="meter"] .rt-collection-preview__lane-item )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane[data-preview-lane-variant="meter"] .rt-collection-preview__lane-marker )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane-item[data-preview-lane-state="complete"] .rt-collection-preview__lane-marker )
html[data-tenant="bithire"] :where( .rt-collection-preview__lane-item[data-preview-lane-state="current"] .rt-collection-preview__lane-marker )
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item[data-preview-lane-state="blocked"])
html[data-tenant="bithire"] :where(.rt-collection-preview__lane-item[data-preview-lane-state="muted"])
html[data-tenant="bithire"] :where(.rt-collection-preview__media, .rt-collection-preview__hero-visual)
html[data-tenant="bithire"] :where( .rt-collection-preview__media > :is(img, svg), .rt-collection-preview__hero-visual > :is(img, svg) )
html[data-tenant="bithire"] :where( .rt-collection-preview__media > img, .rt-collection-preview__hero-visual > img )
html[data-tenant="bithire"] :where( .rt-collection-preview__media > svg, .rt-collection-preview__hero-visual > svg )
html[data-tenant="bithire"] :where(.rt-collection-preview__hero)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-visual)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-main)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-identity)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-title-row)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-title)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-copy)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-meta)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-aside)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-aside :is(button, a, [role="button"]))
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-grid)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-icon)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-label)
html[data-tenant="bithire"] :where(.rt-collection-preview__metric-progress)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-list)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-row)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-row:last-child)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-label)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-value)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-actions)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action-items)
html[data-tenant="bithire"] :where( .rt-collection-preview__quick-actions :is(button, a, [role="button"]) )
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action:hover)
html[data-tenant="bithire"] :where(.rt-collection-preview__quick-action[aria-disabled="true"])
html[data-tenant="bithire"] :where([role="tooltip"][aria-hidden="true"])
html[data-tenant="bithire"] :where([role="tooltip"]:not([aria-hidden="true"]))
html[data-tenant="bithire"] :where( .ds-collection-enhanced [role="tooltip"]:not([aria-hidden="true"]), .rt-collection-preview [role="tooltip"]:not([aria-hidden="true"]), .rt-expanded-panel [role="tooltip"]:not([aria-hidden="true"]) )
html[data-tenant="bithire"] :where(.rottay-tooltip, .ds-tooltip, .tooltip)
html[data-tenant="bithire"] :where( .rottay-tooltip [role="tooltip"], .ds-tooltip__content, .tooltip::before, .tooltip-content )
```

</details>

### `reduced-motion#d1d81419#1` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** prefers-reduced-motion zeroing for .rt-collection-preview* — app selectors, so it cannot stay under the governed reduced-motion exception (which is root-level only).

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 2 rule(s), 3 declaration(s), 3 `!important`.

**App selector tokens.** `.rt-collection-preview`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where(.rt-collection-preview)
html[data-tenant="bithire"] :where( .rt-collection-preview__summary, .rt-collection-preview__quick-action, .rt-collection-preview__lane-meter-bar )
```

</details>

### `media#7e40dadd#2` → app-bithire

Destination file: `app-bithire/src/styles/collection-preview-chrome.css`

**Rationale.** Responsive layout for the same preview families + .ds-collection-enhanced rail. Feature media/layout.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 14 rule(s), 30 declaration(s), 13 `!important`.

**App selector tokens.** `.rt-collection-preview`, `.rt-expanded-panel`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where(.ds-collection-enhanced > [data-ds-collection-body="true"] > div)
html[data-tenant="bithire"] :where(.ds-collection-enhanced .ds-collection-preview-rail)
html[data-tenant="bithire"]
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-header)
html[data-tenant="bithire"] :where(.rt-collection-preview__hero-aside)
html[data-tenant="bithire"] :where(.ds-collection-enhanced > [data-ds-collection-toolbar-row="true"])
html[data-tenant="bithire"] :where(.ds-collection-enhanced > [data-ds-collection-body="true"])
html[data-tenant="bithire"] :where(.rt-collection-preview__header)
html[data-tenant="bithire"] :where(.rt-collection-preview__header-main)
html[data-tenant="bithire"] :where(.rt-collection-preview__actions)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-row)
html[data-tenant="bithire"] :where(.rt-collection-preview__detail-value)
html[data-tenant="bithire"] :where(.rt-expanded-panel__detail-field)
html[data-tenant="bithire"] :where(.rt-expanded-panel__detail-field-value)
```

</details>

### `component-local#8c73a7bc#4` → retired-dead

Destination file: `(deleted)`

**Rationale.** Frozen classic-engine tag vocabulary. app-bithire declares engine:"modern" statically (src/app/layout.tsx:181); antd is imported only under DS ui/**/engines/classic; app-bithire has 0 antd imports. Modern Tag emits "rottay-tag-shell rottay-tag-shell--modern", never bare .rottay-tag (bare is emitted only by Tag/engines/classic and Tag/engines/rustic). Neither arm can appear in a BitHire document.

**Cascade position.** Rule never matched in a BitHire render; removal cannot change any computed value.

**Volume.** 1 rule(s), 10 declaration(s), 0 `!important`.

**App selector tokens.** `.rottay-tag`

**Engine selector tokens.** `.ant-tag`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] .rottay-tag, html[data-tenant="bithire"] .ant-tag
```

</details>

### `component-local#8c73a7bc#5` → retired-dead

Destination file: `(deleted)`

**Rationale.** Same proof as region 12: .rottay-tag--* (classic/rustic only) + .ant-tag-* (antd, classic engine only).

**Cascade position.** Never matched; removal inert.

**Volume.** 6 rule(s), 18 declaration(s), 0 `!important`.

**App selector tokens.** `.rottay-tag--default`, `.rottay-tag--primary`, `.rottay-tag--success`, `.rottay-tag--warning`, `.rottay-tag--error`, `.rottay-tag--secondary`

**Engine selector tokens.** `.ant-tag-blue`, `.ant-tag-success`, `.ant-tag-green`, `.ant-tag-warning`, `.ant-tag-gold`, `.ant-tag-orange`, `.ant-tag-error`, `.ant-tag-red`, `.ant-tag-cyan`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] .rottay-tag--default
html[data-tenant="bithire"] .rottay-tag--primary, html[data-tenant="bithire"] .ant-tag-blue
html[data-tenant="bithire"] .rottay-tag--success, html[data-tenant="bithire"] .ant-tag-success, html[data-tenant="bithire"] .ant-tag-green
html[data-tenant="bithire"] .rottay-tag--warning, html[data-tenant="bithire"] .ant-tag-warning, html[data-tenant="bithire"] .ant-tag-gold, html[data-tenant="bithire"] .ant-tag-orange
html[data-tenant="bithire"] .rottay-tag--error, html[data-tenant="bithire"] .ant-tag-error, html[data-tenant="bithire"] .ant-tag-red
html[data-tenant="bithire"] .rottay-tag--secondary, html[data-tenant="bithire"] .ant-tag-cyan
```

</details>

### `component-local#8c73a7bc#6` → retired-dead

Destination file: `(deleted)`

**Rationale.** Same proof: .ant-tag[style]:hover + .rottay-tag--clickable:hover.

**Cascade position.** Never matched; removal inert.

**Volume.** 1 rule(s), 1 declaration(s), 0 `!important`.

**App selector tokens.** `.rottay-tag--clickable`

**Engine selector tokens.** `.ant-tag`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] .ant-tag[style*="cursor: pointer"]:hover, html[data-tenant="bithire"] .rottay-tag--clickable:hover
```

</details>

### `component-local#8c73a7bc#7` → app-bithire (partial)

Destination file: `app-bithire/src/styles/tenant-component-defaults.css`

**Rationale.** Split. .rottay-badge IS live under Modern (Badge/engines/modern/index.tsx:291,366 emit "rottay-badge rottay-badge--modern") -> app. .ant-badge-count / .ant-scroll-number are antd-only (classic engine) -> retired with the region-12 proof. All three arms carried the same single declaration, so dropping the dead arms is provably inert.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 1 rule(s), 1 declaration(s), 0 `!important`.

**App selector tokens.** `.rottay-badge`

**Engine selector tokens.** `.ant-badge-count`, `.ant-scroll-number`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] .ant-badge-count, html[data-tenant="bithire"] .ant-scroll-number, html[data-tenant="bithire"] .rottay-badge
```

</details>

### `component-local#8c73a7bc#8` → app-bithire

Destination file: `app-bithire/src/styles/tenant-component-defaults.css`

**Rationale.** .ds-pattern-data-table td/th tabular numerals. The rule is scoped html[data-tenant="bithire"], i.e. one tenant, so it is not generic Modern paint; hoisting it into the Modern table skin would repaint evnto/rottay/platform - a silent visual change C6.9 forbids. Stays BitHire-owned, moves to the app.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 1 rule(s), 1 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where(.ds-pattern-data-table) :where(td, th)
```

</details>

### `component-local#8c73a7bc#9` → retired-dead

Destination file: `(deleted)`

**Rationale.** .ant-tooltip .ant-tooltip-inner / .ant-tooltip-arrow::before. antd unreachable under engine:"modern" (region-12 proof). The canonical home for antd tooltip paint already exists and is unaffected: engines/classic/theme.css:624-637 declares the same properties at html[data-tenant] scope for every tenant.

**Cascade position.** Never matched under Modern; the classic engine keeps its own owner.

**Volume.** 2 rule(s), 10 declaration(s), 0 `!important`.

**Engine selector tokens.** `.ant-tooltip`, `.ant-tooltip-inner`, `.ant-tooltip-arrow`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] .ant-tooltip .ant-tooltip-inner
html[data-tenant="bithire"] .ant-tooltip .ant-tooltip-arrow::before
```

</details>

### `reduced-motion#d1d81419#2` → DS-extension-kept (partial)

Destination file: `ui-design-system/.../artifacts/bithire/_source/extension.css`

**Rationale.** Split. Rule 1 (--ds-motion-instant/calm/deliberate: 0ms at html[data-tenant="bithire"]) is exactly the root-level governed reduced-motion emission C6.4 still permits: no app selector, no engine selector, no !important, no descendant arm. KEPT. Rule 2 (.rottay-tag/.ant-tag { transition: none }) existed only to neutralise region 12, which is retired; both arms are dead by the region-12 proof. RETIRED.

**Cascade position.** Kept rule untouched in place. Retired rule never matched.

**Volume.** 2 rule(s), 4 declaration(s), 0 `!important`.

**App selector tokens.** `.rottay-tag`

**Engine selector tokens.** `.ant-tag`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"]
html[data-tenant="bithire"] .rottay-tag, html[data-tenant="bithire"] .ant-tag
```

</details>

### `component-local#8c73a7bc#10` → split (partial)

Destination file: `app-bithire/src/styles/tenant-component-defaults.css`

**Rationale.** Split. Rules L3446-L3558 paint .btn-*, .ant-btn-*, .badge, .badge-*, .ds-badge, .ds-btn--*, .bithire-form-section__complete-pill, .bithire-form-required-pill. Token-exact grep over every .ts/.tsx in the DS (excluding tests) and in app-bithire returns ZERO emitters for all of them; Modern Badge emits .rottay-badge and Modern Tag .rottay-tag-shell--modern. RETIRED. The final rule (L3560-L3576, color on the surface family) is live: .ds-rich-card 9 / .ds-surface-card 1 / .ds-surface-panel 3 / .ds-surface-hero 3 / .rt-surface-card 3 / .rt-surface-hero 1 / .bithire-surface-card 4 app renders -> app.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 14 rule(s), 54 declaration(s), 0 `!important`.

**App selector tokens.** `.bithire-form-section`, `.bithire-form-required-pill`, `.rt-surface-hero`, `.bithire-surface-hero`, `.rt-rich-card`, `.bithire-premium-card`, `.rt-surface-card`, `.bithire-surface-card`, `.rt-surface-panel`, `.bithire-surface-panel`

**Engine selector tokens.** `.btn-primary`, `.ant-btn-primary`, `.btn-secondary`, `.ant-btn-default`, `.btn-ghost`, `.ant-btn-text`, `.ant-btn-link`, `.btn-link`, `.badge-default`, `.badge-primary`, `.badge-secondary`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-info`, `.badge`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where(.btn-primary, .ds-btn--primary, .ant-btn-primary)
html[data-tenant="bithire"] :where(.btn-secondary, .ds-btn--secondary, .ant-btn-default)
html[data-tenant="bithire"] :where(.btn-ghost, .ds-btn--ghost, .ant-btn-text, .ant-btn-link)
html[data-tenant="bithire"] :where(.btn-link, .ds-btn--link, .ant-btn-link)
html[data-tenant="bithire"] :where( .badge-default, .ds-badge--default, .ds-badge:not(.ds-badge--primary):not(.ds-badge--secondary):not( .ds-badge--success ):not(.ds-badge--warning):not(.ds-badge--error):not(.ds-badge--info) )
html[data-tenant="bithire"] :where(.badge-primary, .ds-badge--primary)
html[data-tenant="bithire"] :where(.badge-secondary, .ds-badge--secondary)
html[data-tenant="bithire"] :where( .badge-success, .ds-badge--success, .bithire-form-section__complete-pill )
html[data-tenant="bithire"] :where(.badge-warning, .ds-badge--warning)
html[data-tenant="bithire"] :where(.badge-error, .ds-badge--error, .bithire-form-required-pill)
html[data-tenant="bithire"] :where(.badge-info, .ds-badge--info)
html[data-tenant="bithire"] :where(.badge, .ds-badge)
html[data-tenant="bithire"] :where(.badge > *, .ds-badge > *)
html[data-tenant="bithire"] :where( .ds-surface-hero, .rt-surface-hero, .bithire-surface-hero, .ds-rich-card, .rt-rich-card, .bithire-premium-card, .ds-surface-card, .rt-surface-card, .bithire-surface-card, .ds-surface-panel, .rt-surface-panel, .bithire-surface-panel )
```

</details>

### `component-local#8c73a7bc#11` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** The [data-bithire-detail-*] inline-editor suite. 96 of its 97 rules already have a twin in app-bithire/src/styles/detail-chrome.css under :root[data-ds-root] (specificity 0,2,0) vs the extension (0,1,1) - the app twin already wins today. 139 declarations differ in value and 27 have no twin, so the extension copy is NOT redundant and is migrated verbatim rather than deleted.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration. Additionally the app twin at :root[data-ds-root] outranks the moved rule on specificity, so its wins are order-independent and unchanged.

**Volume.** 97 rule(s), 496 declaration(s), 327 `!important`.

**App selector tokens.** `[data-bithire-detail-editor-suite`, `[data-bithire-detail-edit-panel`, `[data-bithire-detail-edit-panel-embedded`, `[data-bithire-detail-coverage-panel`, `[data-bithire-detail-edit-header`, `[data-bithire-detail-advanced-toggle-placement`, `[data-bithire-detail-editor-header-actions`, `.rottay-flex`, `.rottay-stack`, `[data-bithire-detail-inline-editor`, `[data-bithire-detail-editor-icon`, `[data-bithire-detail-editor-section-icon`, `[data-bithire-detail-editor-eyebrow`, `[data-bithire-detail-editor-section-number`, `[data-bithire-detail-editor-title`, `[data-bithire-detail-editor-description`, `[data-bithire-detail-primary-fields`, `[data-bithire-detail-advanced-fields`, `.rt-form-section`, `[data-bithire-form-section`, `[data-bithire-detail-editor-section`, `[data-bithire-detail-editor-section-header`, `[data-bithire-detail-editor-section-title`, `[data-bithire-detail-editor-section-description`, `[data-bithire-detail-editor-section-content`, `.rottay-grid`, `[data-bithire-detail-more-divider`, `[data-bithire-detail-more-sticky`, `[data-bithire-detail-more-fields-divider`, `[data-bithire-detail-more-fields-sticky`, `.rt-form-field-label-root`, `.rottay-box`, `[data-bithire-detail-field-span`, `[data-bithire-detail-field`, `[data-bithire-detail-edit-section`, `[data-bithire-detail-edit-band`, `[data-bithire-detail-field-icon`, `[data-bithire-detail-field-control`, `[data-bithire-detail-inline-control-row`, `[data-bithire-detail-read-panel`, `.rt-detail-section`, `.rt-form-field-number`, `.rt-form-requirement-pill`, `.rottay-text`, `[data-bithire-detail-field-control-wrapper`, `.rottay-input`, `.rottay-select`, `[data-bithire-detail-field-control-width`, `[data-bithire-detail-field-control-kind`, `[data-bithire-detail-smart-control`, `[data-bithire-detail-advanced-toggle`, `[data-bithire-detail-coverage-toggle`, `[data-bithire-detail-advanced-toggle-slot`, `[data-bithire-detail-advanced-toggle-dock`, `[data-bithire-detail-more-fields-state`, `[data-bithire-detail-advanced-toggle-label`

**Engine selector tokens.** `.ant-input`, `.ant-select`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where([data-bithire-detail-editor-suite="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-edit-panel="true"][data-bithire-detail-edit-panel-embedded="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-editor-suite="true"] > [data-bithire-detail-edit-panel="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-edit-panel="true"]:has( + [data-bithire-detail-coverage-panel="true"] ) )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where(form, [role="form"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-edit-header="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-edit-panel="true"]:has( [data-bithire-detail-advanced-toggle-placement="header-right"] ) ) :where([data-bithire-detail-edit-header="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-editor-header-actions="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-header="true"]) > :where(.rottay-flex:first-child)
html[data-tenant="bithire"] :where([data-bithire-detail-edit-header="true"]) > :where(.rottay-flex:first-child) > :where(.rottay-stack:last-child)
html[data-tenant="bithire"] :where([data-bithire-detail-inline-editor="true"]) :where( [data-bithire-detail-editor-icon="true"], [data-bithire-detail-editor-section-icon="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-inline-editor="true"]) :where( [data-bithire-detail-editor-eyebrow="true"], [data-bithire-detail-editor-section-number="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-inline-editor="true"]) :where([data-bithire-detail-editor-title="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-inline-editor="true"]) :where([data-bithire-detail-editor-description="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where( .rt-form-section, .rt-form-section, [data-bithire-form-section="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section-header="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section-header="true"]) > :where(.rottay-flex:first-child)
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section-header="true"]) > :where(.rottay-flex:first-child) > :where(.rottay-stack:last-child)
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section="true"]:first-child) :where([data-bithire-detail-editor-section-header="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section-title="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section-description="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section-content="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-editor-section="true"]:first-child)
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-advanced-fields="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-grid)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) )::after
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) ) :where(.rt-form-field-label-root)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) ) :where(.rt-form-field-label-root > .rottay-flex:first-child)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) ) :where(input, select, textarea, [role="combobox"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) ) :where(.rottay-box, .rottay-stack, .rottay-flex)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where([data-bithire-detail-field-span="2"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where([data-bithire-detail-field-span="3"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where([data-bithire-detail-field-span="full"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where([data-bithire-detail-field="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where([data-bithire-detail-field="true"])::after
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where( [data-bithire-detail-field="true"][data-bithire-detail-field-span="2"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where( [data-bithire-detail-field="true"][data-bithire-detail-field-span="3"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where( [data-bithire-detail-field="true"][data-bithire-detail-field-span="full"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where([data-bithire-detail-edit-section])::before, html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where([data-bithire-detail-edit-section])::after
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( [data-bithire-detail-edit-section], [data-bithire-detail-edit-band] )
html[data-tenant="bithire"] :where([data-bithire-detail-field-icon="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-field-control="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-field-control="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-flex):has(:where(input, textarea, select, [role="combobox"])), html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-stack):has(> .rt-form-field-label-root):has( :where(input, textarea, select, [role="combobox"]) )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-box):has(> :where(input, textarea, select, [role="combobox"])), html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-box):has(> .rottay-flex:first-child):has( > :where(input, textarea, select, [role="combobox"]) )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-flex):has(:where(input, textarea, select, [role="combobox"]))
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-flex:not([data-bithire-detail-inline-control-row="true"])):has( :where(input, textarea, select, [role="combobox"]) ) > *
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-flex:not([data-bithire-detail-inline-control-row="true"])):has( :where(input, textarea, select, [role="combobox"]) ) > :not(:first-child)
html[data-tenant="bithire"] :where([data-bithire-detail-inline-control-row="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-inline-control-row="true"]) > *
html[data-tenant="bithire"] :where([data-bithire-detail-inline-control-row="true"]) > :first-child
html[data-tenant="bithire"] :where([data-bithire-detail-inline-control-row="true"]) > :not(:first-child)
html[data-tenant="bithire"] :where([data-bithire-detail-inline-control-row="true"]) :where(input, textarea, select, [role="combobox"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-flex):has(:where([role="switch"]))
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where([data-bithire-detail-field-control="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-edit-panel="true"], [data-bithire-detail-read-panel="true"], [data-testid$="read-panel"], .rt-detail-section ) :where(.rt-form-field-number)
html[data-tenant="bithire"] :where( [data-bithire-detail-edit-panel="true"], [data-bithire-detail-read-panel="true"], [data-testid$="read-panel"], .rt-detail-section ) :where(.rt-form-requirement-pill)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rottay-flex):has(:where(input, textarea, select, [role="combobox"])) > :where(.rottay-text:first-child, label:first-child)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(input, textarea, select, [role="combobox"])
html[data-tenant="bithire"] :where([data-bithire-detail-field-control-wrapper="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-field-control-wrapper="true"]) :where( input, textarea, select, [role="combobox"], .ant-input, .ant-select, .rottay-input, .rottay-select, [data-radix-select-trigger] )
html[data-tenant="bithire"] :where( [data-bithire-detail-field-control-wrapper="true"]:has( [data-bithire-detail-inline-control-row="true"] ) ) :where( [data-bithire-detail-inline-control-row="true"] :is(input, textarea, select, [role="combobox"]) )
html[data-tenant="bithire"] :where( [data-bithire-detail-field-control-width="compact"], [data-bithire-detail-field-control-kind="number-stepper"], [data-bithire-detail-field-control-kind="date"], [data-bithire-detail-field-control-kind="duration"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-field-control-width="wide"], [data-bithire-detail-field-control-kind="phone"], [data-bithire-detail-field-control-kind="currency"], [data-bithire-detail-field-control-kind="date-range"], [data-bithire-detail-field-control-kind="media"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where([data-bithire-detail-field-control-kind="phone"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where([data-bithire-detail-field-control-kind="phone"]) :where(input, select)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where( [data-bithire-detail-smart-control="number-stepper"], [data-bithire-detail-field-control-kind="number-stepper"] [data-bithire-detail-field-control="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-smart-control="date-control"])
html[data-tenant="bithire"] :where([data-bithire-detail-smart-control="segmented-choice"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(input:hover, textarea:hover, select:hover, [role="combobox"]:hover)
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where( input:focus, textarea:focus, select:focus, [role="combobox"]:focus, input:focus-visible, textarea:focus-visible, select:focus-visible, [role="combobox"]:focus-visible )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(textarea)
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-field-control-width="natural"]) :where(input, select, [role="combobox"])
html[data-tenant="bithire"] :where([data-bithire-detail-smart-control="number-stepper"]) :where(button, input)
html[data-tenant="bithire"] :where([data-bithire-detail-smart-control="number-stepper"]) > :where(:not(:first-child))
html[data-tenant="bithire"] :where( [data-bithire-detail-advanced-toggle="true"], [data-bithire-detail-coverage-toggle="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"], [data-bithire-detail-advanced-toggle-slot="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where( [data-bithire-detail-primary-fields], [data-bithire-detail-advanced-fields] ) > :where([data-bithire-detail-advanced-toggle-slot="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] )::before
html[data-tenant="bithire"] :where( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"], [data-bithire-detail-advanced-toggle-slot="true"] ) > :where([data-bithire-detail-advanced-toggle="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) > :where([data-bithire-detail-coverage-toggle="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-more-divider="true"][data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-sticky="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-sticky="true"], [data-bithire-detail-advanced-toggle-slot="true"][data-bithire-detail-advanced-toggle-dock="floating"] )::before
html[data-tenant="bithire"] :where( [data-bithire-detail-more-fields-divider="true"][data-bithire-detail-more-fields-state="collapsed"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-more-fields-divider="true"][data-bithire-detail-more-fields-state="collapsed"] )::before
html[data-tenant="bithire"] :where([data-bithire-detail-advanced-toggle-placement="header-right"])
html[data-tenant="bithire"] :where( [data-bithire-detail-advanced-toggle-placement="header-right"] )::before
html[data-tenant="bithire"] :where([data-bithire-detail-advanced-toggle-placement="bottom-center"])
html[data-tenant="bithire"] :where( [data-bithire-detail-advanced-toggle-placement="bottom-center"] )::before
html[data-tenant="bithire"] :where( [data-bithire-detail-advanced-toggle-placement="bottom-center"][data-bithire-detail-advanced-toggle-label="show-more"] )
html[data-tenant="bithire"] :where([data-bithire-detail-advanced-toggle-placement="floating-top"])
```

</details>

### `structural#b82726b0#2` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** @keyframes rt-detail-floating-toggle-in. app-bithire/src/styles/detail-chrome.css:1446 already defines the same keyframe with identical steps; detail-chrome.css is imported after the drained file, so the app definition stays the last one - the same outcome as today.

**Cascade position.** Keyframes resolve by document order, not specificity. detail-chrome.css keeps loading after, so the winning @keyframes is the same one as before.

**Volume.** 2 rule(s), 4 declaration(s), 0 `!important`.

<details><summary>Selectors</summary>

```css
from
to
```

</details>

### `component-local#8c73a7bc#12` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** Advanced-toggle + edit-footer of the same detail suite; 5/7 rules fully shadowed by the detail-chrome twin, 8 declarations differ.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 7 rule(s), 24 declaration(s), 20 `!important`.

**App selector tokens.** `[data-bithire-detail-more-fields-divider`, `[data-bithire-detail-more-fields-sticky`, `[data-bithire-detail-advanced-toggle`, `[data-bithire-detail-edit-footer`, `[data-bithire-detail-action-kind`, `[data-bithire-detail-edit-panel`, `[data-bithire-detail-edit-footer-actions`, `[data-bithire-detail-edit-footer-summary`, `[data-bithire-detail-edit-footer-state`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where( [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) > :where([data-bithire-detail-advanced-toggle="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer="true"]) :where( [data-bithire-detail-action-kind="inline-cancel"], :is(button, a, [role="button"]):first-of-type )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer="true"]) :where( [data-bithire-detail-action-kind="inline-save"], :is(button, a, [role="button"]):last-of-type )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-edit-footer="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer-actions="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer-summary="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer-state="error"])
```

</details>

### `media#7e40dadd#3` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** Responsive layout for the detail suite; 7/11 rules fully shadowed, 2 declarations differ, 2 missing.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 11 rule(s), 26 declaration(s), 7 `!important`.

**App selector tokens.** `[data-bithire-detail-edit-panel`, `[data-bithire-detail-edit-footer`, `[data-bithire-detail-edit-footer-actions`, `[data-bithire-detail-primary-fields`, `[data-bithire-detail-advanced-fields`, `[data-bithire-detail-field-span`, `[data-bithire-detail-field`, `[data-bithire-detail-more-divider`, `[data-bithire-detail-more-sticky`, `[data-bithire-detail-more-fields-divider`, `[data-bithire-detail-more-fields-sticky`, `.rt-form-field-label-root`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-edit-footer="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer-actions="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-footer-actions="true"]) :where(:is(button, a, [role="button"]))
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( [data-bithire-detail-field-span="2"], [data-bithire-detail-field-span="3"], [data-bithire-detail-field-span="full"] ), html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where( [data-bithire-detail-field="true"][data-bithire-detail-field-span="2"], [data-bithire-detail-field="true"][data-bithire-detail-field-span="3"], [data-bithire-detail-field="true"][data-bithire-detail-field-span="full"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) > :where( :not( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] ) ), html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where([data-bithire-detail-field="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-primary-fields="true"], [data-bithire-detail-advanced-fields="true"] ) :where(.rt-form-field-label-root)
html[data-tenant="bithire"] :where( [data-bithire-detail-more-divider="true"], [data-bithire-detail-more-sticky="true"], [data-bithire-detail-more-fields-divider="true"], [data-bithire-detail-more-fields-sticky="true"] )::before
```

</details>

### `component-local#8c73a7bc#13` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** Dictation host/button + tags/workflow-card of the detail suite; 7/10 fully shadowed, 6 differ.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 10 rule(s), 32 declaration(s), 7 `!important`.

**App selector tokens.** `[data-bithire-detail-edit-panel`, `[data-bithire-dictation-target`, `.rt-detail-dictation-host`, `.rt-detail-dictation-button`, `[data-bithire-detail-advanced-fields`, `[data-bithire-detail-advanced-fields-state`, `[data-bithire-detail-tags-structured`, `[data-bithire-detail-tag-chip`, `[data-bithire-workflow-card`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where(textarea[data-bithire-dictation-target="true"])
html[data-tenant="bithire"] :where(.rt-detail-dictation-host)
html[data-tenant="bithire"] :where(.rt-detail-dictation-button)
html[data-tenant="bithire"] :where(.rt-detail-dictation-button:hover:not(:disabled))
html[data-tenant="bithire"] :where(.rt-detail-dictation-button[data-listening="true"])
html[data-tenant="bithire"] :where(.rt-detail-dictation-button:disabled)
html[data-tenant="bithire"] :where([data-bithire-detail-advanced-fields][hidden]), html[data-tenant="bithire"] :where( [data-bithire-detail-advanced-fields][data-bithire-detail-advanced-fields-state="collapsed"] )
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-tags-structured="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-detail-tag-chip="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-edit-panel="true"]) :where([data-bithire-workflow-card="detail"])
```

</details>

### `component-local#8c73a7bc#14` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** [data-bithire-detail-nav-item] active state; 4 declarations differ from the detail-chrome twin.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 1 rule(s), 4 declaration(s), 0 `!important`.

**App selector tokens.** `[data-bithire-detail-nav-item`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where([data-bithire-detail-nav-item="true"][data-active="true"])
```

</details>

### `component-local#8c73a7bc#15` → app-bithire

Destination file: `app-bithire/src/styles/detail-editor-chrome.css`

**Rationale.** Coverage panel of the detail suite; 5/13 fully shadowed, 13 differ, 6 missing.

**Cascade position.** Extension section is unlayered and sits inside the artifact, which app globals.css imports at line 21 before every other app stylesheet. The drained file is imported immediately after that same line, so it occupies the identical document position; selectors are byte-identical (html[data-tenant="bithire"] kept), so specificity is unchanged. Same specificity + same document position = identical winner for every declaration.

**Volume.** 13 rule(s), 61 declaration(s), 38 `!important`.

**App selector tokens.** `[data-bithire-detail-coverage-panel`, `[data-bithire-detail-coverage-embedded`, `[data-bithire-detail-editor-suite`, `[data-bithire-detail-edit-panel`, `[data-bithire-detail-coverage-header`, `[data-bithire-detail-coverage-body`, `[data-bithire-detail-coverage-group`, `[data-bithire-detail-coverage-group-header`, `[data-bithire-detail-coverage-grid`, `[data-bithire-detail-coverage-field`

<details><summary>Selectors</summary>

```css
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-panel="true"])
html[data-tenant="bithire"] :where( [data-bithire-detail-coverage-panel="true"]:not( [data-bithire-detail-coverage-embedded="true"] ) )
html[data-tenant="bithire"] :where( [data-bithire-detail-editor-suite="true"] > [data-bithire-detail-coverage-panel="true"] )
html[data-tenant="bithire"] :where( [data-bithire-detail-edit-panel="true"] + [data-bithire-detail-coverage-panel="true"] )
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-panel="true"]) :where([data-bithire-detail-coverage-header="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-body="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-group="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-group-header="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-grid="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-field="true"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-field="true"])::after
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-field="true"][data-populated="false"])
html[data-tenant="bithire"] :where([data-bithire-detail-coverage-field="true"]) :where(pre)
```

</details>
