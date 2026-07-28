# P2 routing ledger — the 142 grandfathered `--ds-*` writes

Generated 2026-07-27. Every row is one write in app-bithire that the gate fenced as `UNKNOWN_HOOK`.

## Totals by category and resolution

Codex recorded the split as 63 tenant-channel / 58 foundation-token / 21 undeclared. Correcting the
derivation defect (interpolated emission keys, see p2-state.md) moves 38 writes from foundation-token
to tenant-channel without changing the total.

| corrected category | RENAME | PROMOTE | DELETE | total |
|---|---|---|---|---|
| foundation-token | 5 | 15 | 0 | 20 |
| tenant-channel | 0 | 100 | 1 | 101 |
| undeclared | 21 | 0 | 0 | 21 |
| **total** | **26** | **115** | **1** | **142** |

## Rows


### app/(dashboard)/activity/content/styles/index.css

- `--ds-chart-plot-bg` (line 1237, scope `.activity-chart-panel`)
  - category: foundation-token
  - resolution: **PROMOTE** → `chart-plot-surface`
  - value preservation: Declared a public slot (family chart-plot-surface). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/applications/surface/components/listing/styles/index.css

- `--ds-listing-grid-gap` (line 237, scope `.rt-flow-collection--applications`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `listing-grid-geometry`
  - value preservation: Declared a public slot (family listing-grid-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/candidates/surface/components/feature-tabs/styles.css

- `--ds-tabs-md-height` (line 18, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-list-padding` (line 19, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-gap` (line 20, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-list-radius` (line 21, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-item-radius` (line 22, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-list-border` (line 23, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-list-bg` (line 28, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-active-bg` (line 41, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-active-shadow` (line 50, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tab-bg-hover` (line 55, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tab-color` (line 60, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tab-color-hover` (line 61, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tab-color-active` (line 62, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-icon-bg` (line 63, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-icon-bg-active` (line 68, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-list-width` (line 73, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-tabs-list-max-width` (line 74, scope `.rt-candidates-feature-tabs__tabs`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `tabs-chrome`
  - value preservation: Declared a public slot (family tabs-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/candidates/surface/screens/record/create/view/sections/form-primitives/styles/index.css

- `--ds-radius-button` (line 132, scope `.rt-candidate-create-field-date__clear`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-sm-padding-x` (line 133, scope `.rt-candidate-create-field-date__clear`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-radius-button` (line 148, scope `.rt-candidate-create-field-date__quick.rt-candidate-create-field-date__quick.rt-candidate-`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-sm-padding-x` (line 149, scope `.rt-candidate-create-field-date__quick.rt-candidate-create-field-date__quick.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-radius-button` (line 173, scope `.rt-candidate-create-field-prompt`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-radius-button` (line 186, scope `.rt-candidate-create-field-suggestion`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-color` (line 187, scope `.rt-candidate-create-field-suggestion`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 188, scope `.rt-candidate-create-field-suggestion`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 192, scope `.rt-candidate-create-field-suggestion`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-radius-button` (line 246, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-color` (line 247, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 248, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 249, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 253, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 258, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 266, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 271, scope `.rt-candidate-create-field-toggle-chip.rt-candidate-create-field-toggle-chip.rt-candidate-`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-radius-button` (line 528, scope `.rt-candidate-create-field-choice-option.rt-candidate-create-field-choice-option.rt-candid`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-color` (line 529, scope `.rt-candidate-create-field-choice-option.rt-candidate-create-field-choice-option.rt-candid`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 530, scope `.rt-candidate-create-field-choice-option.rt-candidate-create-field-choice-option.rt-candid`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 531, scope `.rt-candidate-create-field-choice-option.rt-candidate-create-field-choice-option.rt-candid`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 540, scope `.rt-candidate-create-field-choice-option.rt-candidate-create-field-choice-option.rt-candid`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 545, scope `.rt-candidate-create-field-choice-option.rt-candidate-create-field-choice-option.rt-candid`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/candidates/surface/screens/record/create/wiring/styles/index.css

- `--ds-button-sm-padding-x` (line 433, scope `.rt-candidate-create-icon-button`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-radius-button` (line 434, scope `.rt-candidate-create-icon-button`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `control-geometry`
  - value preservation: Declared a public slot (family control-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/candidates/surface/screens/record/detail/wiring/styles/index.css

- `--ds-button-secondary-color` (line 6, scope `.rt-candidate-detail__theme-scope`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 7, scope `.rt-candidate-detail__theme-scope`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg-hover` (line 12, scope `.rt-candidate-detail__theme-scope`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg-active` (line 18, scope `.rt-candidate-detail__theme-scope`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 23, scope `.rt-candidate-detail__theme-scope`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border-color` (line 28, scope `.rt-candidate-detail__theme-scope`)
  - category: foundation-token
  - resolution: **RENAME** → `--rt-candidate-detail-button-secondary-border-color`
  - value preservation: DS declares it once but never reads it; the app never reads it. Inert before and after. Value var(--ds-button-secondary-border) untouched - reads are legal, only writes are governed.
- `--ds-button-disabled-color` (line 29, scope `.rt-candidate-detail__theme-scope`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-disabled-bg` (line 30, scope `.rt-candidate-detail__theme-scope`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-disabled-border` (line 35, scope `.rt-candidate-detail__theme-scope`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-disabled-border-color` (line 40, scope `.rt-candidate-detail__theme-scope`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-disabled-opacity` (line 41, scope `.rt-candidate-detail__theme-scope`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/clients/surface/screens/record/listing/wiring/styles/index.css

- `--ds-button-ghost-bg` (line 420, scope `.rt-clients-collection .rt-client-preview-command`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-ghost-bg` (line 428, scope `.rt-clients-collection .rt-client-preview-command:hover`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/insights/surface/components/dashboard/activity/heatmap/styles/index.css

- `--ds-chart-plot-bg` (line 4, scope `.rt-heatmap`)
  - category: foundation-token
  - resolution: **PROMOTE** → `chart-plot-surface`
  - value preservation: Declared a public slot (family chart-plot-surface). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/insights/surface/components/dashboard/activity/team-activity-chart/styles/index.css

- `--ds-chart-plot-bg` (line 4, scope `.rt-team-activity-chart`)
  - category: foundation-token
  - resolution: **PROMOTE** → `chart-plot-surface`
  - value preservation: Declared a public slot (family chart-plot-surface). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/interviews/surface/screens/workflows/ai/view/sections/mobile-card/styles/index.css

- `--ds-command-grid-opacity` (line 2, scope `.rt-ai-mobile-card`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/interviews/surface/screens/workflows/ai/wiring/styles/index.css

- `--ds-listing-grid-gap` (line 78, scope `.rt-flow-collection--ai-interviews`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `listing-grid-geometry`
  - value preservation: Declared a public slot (family listing-grid-geometry). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/interviews/surface/screens/workflows/debrief/wiring/styles/index.css

- `--ds-command-grid-opacity` (line 2, scope `.rt-debrief-hero`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.
- `--ds-command-grid-opacity` (line 78, scope `.rt-debrief-matrix`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/interviews/surface/screens/workflows/feedback/queue/wiring/styles/index.css

- `--ds-card-side-accent` (line 143, scope `.rt-feedback-mobile-card`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.

### features/interviews/surface/screens/workflows/panel/wiring/styles/index.css

- `--ds-command-grid-opacity` (line 279, scope `.rt-interview-panel-hero`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.
- `--ds-command-grid-opacity` (line 356, scope `.rt-interview-panel-matrix`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/interviews/surface/screens/workflows/preparation/wiring/styles/index.css

- `--ds-command-grid-opacity` (line 2, scope `.rt-interview-preparation__card`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.
- `--ds-command-grid-opacity` (line 15, scope `.rt-interview-preparation__frame`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.
- `--ds-command-grid-opacity` (line 307, scope `.rt-interview-preparation__question-card`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.
- `--ds-card-side-accent` (line 314, scope `.rt-interview-preparation__question-card[data-question-tone="primary"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 322, scope `.rt-interview-preparation__question-card[data-question-tone="warning"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-command-grid-opacity` (line 333, scope `.rt-interview-preparation__ai-question-card`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/offers/surface/screens/record/detail/view/sections/onboarding-collection/styles/index.css

- `--ds-progress-fill` (line 65, scope `.rt-offer-onboarding-progress[data-progress-tone="primary"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-offer-onboarding-progress-fill`
  - value preservation: Zero readers anywhere: the DS Progress reads --ds-progress-fill-primary/-success/-warning/-error, which are different properties. The declaration was inert before and is inert after. Deliberately NOT repointed at the -primary channel, which would have been a visual change and a fresh violation.

### features/offers/surface/screens/record/listing/view/sections/styles/index.css

- `--ds-command-grid-opacity` (line 121, scope `.rt-offer-card`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### features/settings/surface/components/signal-card/styles/index.css

- `--ds-signal-card-accent` (line 8, scope `.rt-signal-card`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 9, scope `.rt-signal-card`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 20, scope `:is(.rt-signal-card, .rt-signal-option-card)[data-signal-tone="primary"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 31, scope `:is(.rt-signal-card, .rt-signal-option-card)[data-signal-tone="success"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 42, scope `:is(.rt-signal-card, .rt-signal-option-card)[data-signal-tone="warning"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 50, scope `:is(.rt-signal-card, .rt-signal-option-card)[data-signal-tone="info"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 61, scope `:is(.rt-signal-card, .rt-signal-option-card)[data-signal-tone="error"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 72, scope `:is(.rt-signal-card, .rt-signal-option-card)[data-signal-tone="secondary"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### features/settings/surface/screens/workflows/security/wiring/styles/index.css

- `--ds-card-side-accent` (line 165, scope `.rt-security__section`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 606, scope `.rt-security__passkey-card`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 665, scope `.rt-security__passkey-card[data-security-passkey-kind="cross-platform"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 672, scope `.rt-security__passkey-card[data-security-passkey-kind="platform"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.

### features/teams/surface/screens/record/overview/view/sections/signal-card/styles/index.css

- `--ds-card-side-accent` (line 2, scope `.rt-team-overview-signal-card[data-signal-tone="primary"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 9, scope `.rt-team-overview-signal-card[data-signal-tone="secondary"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 16, scope `.rt-team-overview-signal-card[data-signal-tone="info"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 23, scope `.rt-team-overview-signal-card[data-signal-tone="success"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 30, scope `.rt-team-overview-signal-card[data-signal-tone="warning"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.
- `--ds-card-side-accent` (line 37, scope `.rt-team-overview-signal-card[data-signal-tone="error"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-card-side-accent`
  - value preservation: The DS never declares or reads this name (only the different property --ds-card-side-accent-soft). All 13 writers and all 6 app CSS readers plus 3 TSX inline writers moved in one pass, so every chain resolves to the same value. Writes on scopes with no reader were inert before and remain inert.

### styles/cards-surfaces.css

- `--ds-command-grid-opacity` (line 649, scope `:where(.rt-stat-card)`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### styles/detail-chrome.css

- `--ds-button-default-bg` (line 2001, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-default-bg-hover` (line 2011, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-default-border` (line 2012, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-default-border-hover` (line 2017, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg` (line 2022, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-bg-hover` (line 2032, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border` (line 2033, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-secondary-border-hover` (line 2038, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-error-bg` (line 2043, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-error-bg-hover` (line 2048, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-button-error-border` (line 2053, scope `:root[data-ds-root] :where(.rt-detail-actions, .rt-detail-actions)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `button-variant-chrome`
  - value preservation: Declared a public slot (family button-variant-chrome). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### styles/surfaces.css

- `--ds-workspace-shell-overlay` (line 31, scope `:where(.ds-workspace-frame--detail)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `workspace-shell-overlay`
  - value preservation: Declared a public slot (family workspace-shell-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-command-grid-opacity` (line 130, scope `:where(.rt-page-header, .rt-page-header)`)
  - category: foundation-token
  - resolution: **PROMOTE** → `command-grid-overlay`
  - value preservation: Declared a public slot (family command-grid-overlay). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=not-tenant-emitted.

### styles/tables-collections.css

- `--ds-table-bg` (line 40, scope `:where(:where(.ds-surface-table-card), .ds-collection-enhanced) :where(.ds-engine-modern)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.
- `--ds-table-border` (line 41, scope `:where(:where(.ds-surface-table-card), .ds-collection-enhanced) :where(.ds-engine-modern)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.
- `--ds-table-row-bg` (line 42, scope `:where(:where(.ds-surface-table-card), .ds-collection-enhanced) :where(.ds-engine-modern)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.
- `--ds-table-cell-color` (line 43, scope `:where(:where(.ds-surface-table-card), .ds-collection-enhanced) :where(.ds-engine-modern)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.

### ui/cards/metric-signal-card/styles/index.css

- `--ds-signal-card-top-line-display` (line 2, scope `:where(.rt-metric-card, .rt-metric-stat)`)
  - category: tenant-channel
  - resolution: **DELETE**
  - value preservation: Nothing in the DS or the app reads it (whole-file scan, not line-based). The DS root default at patterns.css:363 is `none` - byte-identical to the app value. Removal is a no-op on two independent grounds, and it retires a latent override of a tenant channel.
- `--ds-signal-card-accent` (line 6, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="primary"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 7, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="primary"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-accent` (line 13, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="success"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 14, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="success"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-accent` (line 20, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="warning"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 21, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="warning"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-accent` (line 27, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="info"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 28, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="info"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-accent` (line 34, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="secondary"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 35, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="secondary"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-accent` (line 41, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="error"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-signal-card-soft` (line 42, scope `:where(.rt-metric-card, .rt-metric-stat)[data-metric-tone="error"]`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `signal-card-tone`
  - value preservation: Declared a public slot (family signal-card-tone). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### ui/charts/styles/index.css

- `--ds-chart-accent` (line 11, scope `.ds-chart-panel[data-chart-tone="default"]`)
  - category: foundation-token
  - resolution: **RENAME** → `--rt-chart-accent`
  - value preservation: The DS root-declares it (patterns.css:640) but never reads it; only the app reads it, 36 times. Writers renamed and every reader became var(--rt-chart-accent, var(--ds-chart-accent, ORIGINAL)). Inside the four .ds-chart-panel tone scopes the app value still wins; outside them the read still falls through to the DS root default. Both branches identical to before.
- `--ds-chart-accent` (line 22, scope `.ds-chart-panel[data-chart-tone="info"]`)
  - category: foundation-token
  - resolution: **RENAME** → `--rt-chart-accent`
  - value preservation: The DS root-declares it (patterns.css:640) but never reads it; only the app reads it, 36 times. Writers renamed and every reader became var(--rt-chart-accent, var(--ds-chart-accent, ORIGINAL)). Inside the four .ds-chart-panel tone scopes the app value still wins; outside them the read still falls through to the DS root default. Both branches identical to before.
- `--ds-chart-accent` (line 33, scope `.ds-chart-panel[data-chart-tone="success"]`)
  - category: foundation-token
  - resolution: **RENAME** → `--rt-chart-accent`
  - value preservation: The DS root-declares it (patterns.css:640) but never reads it; only the app reads it, 36 times. Writers renamed and every reader became var(--rt-chart-accent, var(--ds-chart-accent, ORIGINAL)). Inside the four .ds-chart-panel tone scopes the app value still wins; outside them the read still falls through to the DS root default. Both branches identical to before.
- `--ds-chart-accent` (line 44, scope `.ds-chart-panel[data-chart-tone="warning"]`)
  - category: foundation-token
  - resolution: **RENAME** → `--rt-chart-accent`
  - value preservation: The DS root-declares it (patterns.css:640) but never reads it; only the app reads it, 36 times. Writers renamed and every reader became var(--rt-chart-accent, var(--ds-chart-accent, ORIGINAL)). Inside the four .ds-chart-panel tone scopes the app value still wins; outside them the read still falls through to the DS root default. Both branches identical to before.

### ui/surfaces/styles/index.css

- `--ds-surface-tone` (line 116, scope `.rt-surface-detail-section[data-surface-tone="primary"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-surface-tone` (line 121, scope `.rt-surface-detail-section[data-surface-tone="secondary"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-surface-tone` (line 129, scope `.rt-surface-detail-section[data-surface-tone="success"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-surface-tone` (line 134, scope `.rt-surface-detail-section[data-surface-tone="warning"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-surface-tone` (line 139, scope `.rt-surface-detail-section[data-surface-tone="error"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-surface-tone` (line 144, scope `.rt-surface-detail-section[data-surface-tone="info"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-surface-tone` (line 152, scope `.rt-surface-detail-section[data-surface-tone="neutral"]`)
  - category: undeclared
  - resolution: **RENAME** → `--rt-surface-tone`
  - value preservation: DS never declares or reads it. 7 writers moved with all 3 readers (2 multi-line var() chains in ui/surfaces/styles/index.css plus ui/surfaces/index.tsx:378). Fallback chains kept byte-identical.
- `--ds-metric-card-bg` (line 575, scope `[data-anatomy-card="underline"] :where(.rt-metric-card, .rt-metric-stat)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `metric-card-anatomy`
  - value preservation: Declared a public slot (family metric-card-anatomy). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-metric-card-shadow` (line 576, scope `[data-anatomy-card="underline"] :where(.rt-metric-card, .rt-metric-stat)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `metric-card-anatomy`
  - value preservation: Declared a public slot (family metric-card-anatomy). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-metric-card-shadow-hover` (line 577, scope `[data-anatomy-card="underline"] :where(.rt-metric-card, .rt-metric-stat)`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `metric-card-anatomy`
  - value preservation: Declared a public slot (family metric-card-anatomy). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-metric-card-padding` (line 595, scope `[data-anatomy-layout="floating"] :where(.rt-metric-card, .rt-metric-stat)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `metric-card-anatomy`
  - value preservation: Declared a public slot (family metric-card-anatomy). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.
- `--ds-metric-card-min-height` (line 596, scope `[data-anatomy-layout="floating"] :where(.rt-metric-card, .rt-metric-stat)`)
  - category: foundation-token → corrected to **tenant-channel**
  - resolution: **PROMOTE** → `metric-card-anatomy`
  - value preservation: Declared a public slot (family metric-card-anatomy). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=derives-from-palette.

### ui/tables/data-table/styles/index.css

- `--ds-card-bg` (line 2, scope `.rt-data-table-card`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.
- `--ds-card-border` (line 6, scope `.rt-data-table-card`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.
- `--ds-card-body-color` (line 7, scope `.rt-data-table-card`)
  - category: tenant-channel
  - resolution: **PROMOTE** → `table-in-card-bridge`
  - value preservation: Declared a public slot (family table-in-card-bridge). The declaration legalises the existing write unchanged, so the computed value is identical by construction - not one character of the declaration or its value was edited. whiteLabelCompat=propagates-channel.
