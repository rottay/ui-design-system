# Kimi skin worklist — owner (b), grouped by the file that must express the derivation

491 channels (93 owning files) carry the owner-(b) work from
`pc-reclassification.md`. A channel is assigned to ONE owning file — the highest-tier
reader in the repo-wide census — and every other reader is recorded as `alsoRead` in
`pc-kimi-skin-worklist.json`, because a derivation written in one skin has to survive the
others reading the same channel.

## The scope finding, before the file list

**Half of the owner-(b) work is not Modern work.** Grouping by owning file shows where the
tenants have actually been painting:

| scope | files | channels | dirty (WIP) | exact | close | needs-design |
|---|---:|---:|---:|---:|---:|---:|
| Modern skin + shared presentation | 44 | 192 | 9 | 85 | 102 | 5 |
| TS component token maps | 7 | 40 | 0 | 19 | 21 | 0 |
| classic / rustic only — no Modern reader | 30 | 243 | 0 | 96 | 141 | 6 |
| React component source | 8 | 8 | 0 | 3 | 3 | 2 |
| consuming app only | 4 | 4 | 0 | 3 | 1 | 0 |

243 channels have **no Modern reader at all** — they are consumed only by
`engines/classic/theme.css` and `engines/rustic/skin/*.css`. `classic/theme.css` alone owns
95 of them. Writing those derivations into a Modern skin would be writing them
into a file that never reads them.

That is a scope decision, not a mechanical one, and it should be made before Kimi starts:

* if the scope law stays **Modern + BitHire only**, the legacy-engine channels are not
  Modern-derivation work at all. They are a tenant hand-painting engines the product does not
  ship, and their honest disposition is retire-with-the-engine, not re-derive.
* if classic/rustic stay supported, the same derivations have to be written twice, and the
  worklist below is the second half of the job.

## Modern scope — the files Kimi actually edits

`WIP` marks a file already dirty from the concurrent visual wave. Those need a rebase-style
read before editing, never a blind overwrite.

| file | channels | exact | close | needs-design | WIP | verticals |
|---|---:|---:|---:|---:|:-:|---|
| `runtime/engines/modern/skin/select.css` | 31 | 15 | 16 | 0 | **WIP** | bithire, rottay |
| `runtime/engines/modern/skin/textarea.css` | 13 | 5 | 8 | 0 |  | rottay |
| `presentation/components/badge.css` | 13 | 3 | 10 | 0 |  | bithire, rottay |
| `runtime/engines/modern/skin/menu.css` | 12 | 3 | 7 | 2 | **WIP** | rottay |
| `runtime/engines/modern/skin/tooltip.css` | 12 | 5 | 7 | 0 |  | rottay |
| `runtime/engines/modern/theme.css` | 9 | 4 | 5 | 0 |  | rottay |
| `runtime/engines/modern/skin/list.css` | 7 | 5 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/avatar.css` | 5 | 3 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/pagination.css` | 5 | 3 | 1 | 1 | **WIP** | rottay |
| `runtime/engines/modern/skin/radio.css` | 5 | 1 | 4 | 0 |  | rottay |
| `runtime/engines/modern/skin/switch.css` | 5 | 2 | 3 | 0 |  | rottay |
| `runtime/engines/modern/skin/toggle.css` | 5 | 1 | 4 | 0 |  | rottay |
| `presentation/components/patterns.css` | 5 | 3 | 2 | 0 | **WIP** | bithire |
| `runtime/engines/modern/skin/checkbox.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/descriptions.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/dropdown.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/popover.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/statistic.css` | 4 | 4 | 0 | 0 |  | rottay |
| `runtime/engines/modern/skin/steps.css` | 4 | 1 | 3 | 0 |  | rottay |
| `runtime/engines/modern/skin/tree.css` | 4 | 2 | 2 | 0 |  | rottay |
| `presentation/components/skin/menu-compounds.css` | 4 | 1 | 3 | 0 |  | rottay |
| `runtime/engines/modern/skin/back-top.css` | 3 | 2 | 1 | 0 |  | rottay |
| `runtime/engines/modern/skin/skeleton.css` | 3 | 1 | 1 | 1 |  | rottay |
| `presentation/components/input.css` | 3 | 2 | 1 | 0 |  | bithire |
| `runtime/engines/modern/skin/form.css` | 2 | 1 | 0 | 1 |  | rottay |
| `runtime/engines/modern/skin/layout.css` | 2 | 0 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/upload.css` | 2 | 0 | 2 | 0 |  | rottay |
| `presentation/components/skin/collection-header.css` | 2 | 2 | 0 | 0 | **WIP** | bithire |
| `runtime/engines/modern/skin/calendar.css` | 1 | 1 | 0 | 0 |  | rottay |
| `runtime/engines/modern/skin/cockpit-header.css` | 1 | 0 | 1 | 0 | **WIP** | bithire |
| `runtime/engines/modern/skin/data-table.css` | 1 | 1 | 0 | 0 |  | bithire |
| `runtime/engines/modern/skin/date-picker.css` | 1 | 1 | 0 | 0 |  | bithire |
| `runtime/engines/modern/skin/empty.css` | 1 | 0 | 1 | 0 | **WIP** | rottay |
| `runtime/engines/modern/skin/pattern-timeline.css` | 1 | 0 | 1 | 0 | **WIP** | rottay |
| `runtime/engines/modern/skin/progress.css` | 1 | 0 | 1 | 0 |  | rottay |
| `runtime/engines/modern/skin/tag.css` | 1 | 1 | 0 | 0 |  | rottay |
| `runtime/engines/modern/skin/time-picker.css` | 1 | 1 | 0 | 0 |  | bithire |
| `runtime/engines/modern/skin/timeline.css` | 1 | 1 | 0 | 0 | **WIP** | rottay |
| `runtime/engines/modern/skin/transfer.css` | 1 | 0 | 1 | 0 |  | rottay |
| `presentation/components/skin/avatar-compounds.css` | 1 | 0 | 1 | 0 |  | rottay |
| `presentation/components/skin/card-compounds.css` | 1 | 0 | 1 | 0 |  | rottay |
| `presentation/components/skin/collection-workspace.css` | 1 | 1 | 0 | 0 |  | rottay |
| `presentation/components/skin/drawer-compounds.css` | 1 | 1 | 0 | 0 |  | rottay |
| `presentation/components/skin/tooltip-compounds.css` | 1 | 0 | 1 | 0 |  | rottay |

### The channels, per Modern file

#### `runtime/engines/modern/skin/select.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-select-arrow-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-select-bg` | bithire | `var(--ds-color-bg-primary)` | exact | none (Δ0) |
| `--ds-select-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ7) |
| `--ds-select-bg-disabled` | rottay | `var(--ds-color-bg-secondary)` | close | none (Δ1) |
| `--ds-select-bg-focus` | bithire | `var(--ds-color-bg-primary)` | exact | none (Δ0) |
| `--ds-select-bg-hover` | bithire | `var(--ds-color-bg-primary)` | exact | none (Δ0) |
| `--ds-select-border-color` | bithire | `var(--ds-color-border-secondary)` | exact | none (Δ0) |
| `--ds-select-border-color-focus` | bithire | `var(--ds-color-border-focus)` | exact | none (Δ0) |
| `--ds-select-border-color-hover` | bithire | `var(--ds-color-border-secondary)` | close | visible (Δ57) |
| `--ds-select-color` | bithire | `var(--ds-color-text-primary)` | exact | none (Δ0) |
| `--ds-select-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-select-color-disabled` | rottay | `var(--ds-color-text-disabled)` | close | small (Δ23) |
| `--ds-select-dropdown-bg` | bithire | `var(--ds-color-bg-primary)` | exact | none (Δ0) |
| `--ds-select-dropdown-bg` | rottay | `var(--ds-color-bg-elevated)` | close | none (Δ3) |
| `--ds-select-dropdown-border-color` | bithire | `var(--ds-color-border-primary)` | exact | none (Δ0) |
| `--ds-select-dropdown-shadow` | bithire | `var(--ds-shadow-popover)` | exact | none (Δ0) |
| `--ds-select-dropdown-shadow` | rottay | `0 4px 16px var(--ds-color-shadow), 0 0 0 1px var(--ds-color-accent-300)` | close | unknown |
| `--ds-select-error-border` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-select-filled-bg` | rottay | `var(--ds-bg-hover)` | close | small (Δ8) |
| `--ds-select-option-bg-hover` | bithire | `var(--ds-color-bg-primary)` | close | small (Δ13) |
| `--ds-select-option-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-select-option-bg-selected` | bithire | `var(--ds-color-bg-tertiary)` | close | small (Δ10) |
| `--ds-select-option-bg-selected` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-select-option-color` | bithire | `var(--ds-color-text-primary)` | exact | none (Δ0) |
| `--ds-select-option-color-selected` | bithire | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-select-option-color-selected` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-select-shadow-focus` | rottay | `0 0 0 2px var(--ds-overlay-heavy)` | close | unknown |
| `--ds-select-success-border` | rottay | `var(--ds-color-success-600)` | close | visible (Δ37) |
| `--ds-select-tag-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-select-tag-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-select-warning-border` | rottay | `var(--ds-color-warning-600)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/textarea.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-textarea-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ7) |
| `--ds-textarea-bg-disabled` | rottay | `var(--ds-color-bg-secondary)` | close | none (Δ1) |
| `--ds-textarea-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-textarea-border-focus` | rottay | `color-mix(in srgb, var(--ds-border-color-focus) 36%, transparent)` | exact | none (Δ1) |
| `--ds-textarea-border-hover` | rottay | `var(--ds-border-color-strong)` | exact | none (Δ0) |
| `--ds-textarea-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-textarea-color-placeholder` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-textarea-count-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-textarea-error-border` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-textarea-filled-bg` | rottay | `var(--ds-bg-hover)` | close | small (Δ8) |
| `--ds-textarea-shadow-focus` | rottay | `0 0 0 2px var(--ds-overlay-heavy)` | close | unknown |
| `--ds-textarea-success-border` | rottay | `var(--ds-color-success-600)` | close | visible (Δ37) |
| `--ds-textarea-warning-border` | rottay | `var(--ds-color-warning-600)` | exact | none (Δ0) |

#### `presentation/components/badge.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-badge-border-color` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-badge-error-bg` | bithire | `color-mix( in srgb, var(--ds-color-error) 12%, var(--ds-control-surfa…` | close | none (Δ0) |
| `--ds-badge-error-bg` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-badge-info-bg` | bithire | `color-mix( in srgb, var(--ds-color-info, var(--ds-color-secondary, va…` | close | none (Δ0) |
| `--ds-badge-info-bg` | rottay | `var(--ds-color-info-500)` | close | visible (Δ40) |
| `--ds-badge-primary-bg` | bithire | `var(--ds-control-brand-tint)` | close | none (Δ0) |
| `--ds-badge-primary-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-badge-secondary-bg` | bithire | `var(--ds-control-surface-raised)` | close | none (Δ0) |
| `--ds-badge-secondary-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-badge-success-bg` | bithire | `color-mix( in srgb, var(--ds-color-success) 12%, var(--ds-control-sur…` | close | none (Δ0) |
| `--ds-badge-success-bg` | rottay | `var(--ds-color-success-600)` | close | visible (Δ37) |
| `--ds-badge-warning-bg` | bithire | `color-mix( in srgb, var(--ds-color-warning) 16%, var(--ds-control-sur…` | close | none (Δ0) |
| `--ds-badge-warning-bg` | rottay | `var(--ds-color-warning-600)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/menu.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-menu-item-bg-active` | rottay | `var(--ds-color-secondary)` | close | visible (Δ306) |
| `--ds-menu-item-bg-hover` | rottay | `color-mix(in srgb, var(--ds-bg-active) 4%, transparent)` | close | none (Δ1) |
| `--ds-menu-item-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-menu-item-color-active` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-menu-item-color-hover` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-sidebar-child-padding-inline` | rottay | `—` | close | none |
| `--ds-sidebar-icon-column-size` | rottay | `—` | needs-design | unknown |
| `--ds-sidebar-item-child-height` | rottay | `—` | close | none |
| `--ds-sidebar-item-font-size-child` | rottay | `—` | needs-design | unknown |
| `--ds-sidebar-item-gap` | rottay | `—` | close | none |
| `--ds-sidebar-item-height` | rottay | `—` | close | none |
| `--ds-sidebar-item-padding-inline` | rottay | `—` | close | none |

#### `runtime/engines/modern/skin/tooltip.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-tooltip-bg` | rottay | `var(--ds-color-primary)` | close | visible (Δ33) |
| `--ds-tooltip-color` | rottay | `var(--ds-color-text-inverse)` | exact | none (Δ0) |
| `--ds-tooltip-error-bg` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-tooltip-error-color` | rottay | `var(--ds-color-error-300)` | close | visible (Δ127) |
| `--ds-tooltip-primary-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-tooltip-primary-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-tooltip-secondary-bg` | rottay | `var(--ds-bg-hover)` | close | visible (Δ28) |
| `--ds-tooltip-secondary-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-tooltip-success-bg` | rottay | `var(--ds-color-success-600)` | close | visible (Δ37) |
| `--ds-tooltip-success-color` | rottay | `var(--ds-color-text-muted)` | close | visible (Δ177) |
| `--ds-tooltip-warning-bg` | rottay | `var(--ds-color-warning-600)` | exact | none (Δ0) |
| `--ds-tooltip-warning-color` | rottay | `var(--ds-color-text-muted)` | close | visible (Δ177) |

#### `runtime/engines/modern/theme.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-checkbox-border-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ254) |
| `--ds-checkbox-checked-border` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-checkbox-focus-ring` | rottay | `0 0 0 2px var(--ds-color-border-focus)` | close | unknown |
| `--ds-collapse-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-collapse-content-bg` | rottay | `var(--ds-color-bg-elevated)` | close | small (Δ9) |
| `--ds-radio-border-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ254) |
| `--ds-radio-checked-border` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-radio-focus-ring` | rottay | `0 0 0 2px var(--ds-color-border-focus)` | close | unknown |
| `--ds-spinner-color` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/list.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-list-background-color` | rottay | `var(--ds-color-surface)` | exact | none (Δ0) |
| `--ds-list-border-color` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-list-item-background-color` | rottay | `var(--ds-color-surface)` | exact | none (Δ0) |
| `--ds-list-item-hover-background-color` | rottay | `var(--ds-color-bg-elevated)` | close | small (Δ17) |
| `--ds-list-meta-description-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-list-split-color` | rottay | `var(--ds-color-text-inverse)` | close | visible (Δ39) |
| `--ds-list-text-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/avatar.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-avatar-default-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-avatar-default-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-avatar-gradient-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-avatar-ring-color` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-avatar-status-border` | rottay | `var(--ds-border-color-muted)` | close | visible (Δ32) |

#### `runtime/engines/modern/skin/pagination.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-pagination-item-bg` | rottay | `—` | needs-design | unknown |
| `--ds-pagination-item-bg-active` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-pagination-item-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-pagination-item-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-pagination-item-color-hover` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/radio.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-radio-border` | rottay | `var(--ds-color-secondary)` | close | visible (Δ267) |
| `--ds-radio-checked-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ7) |
| `--ds-radio-description-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-radio-focus-ring-color` | rottay | `color-mix(in srgb, var(--ds-focus-ring-color) 12%, transparent)` | close | none (Δ1) |
| `--ds-radio-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/switch.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-switch-checked-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-switch-checked-bg-hover` | rottay | `var(--ds-color-primary)` | close | visible (Δ55) |
| `--ds-switch-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-switch-thumb-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ6) |
| `--ds-switch-thumb-shadow` | rottay | `0 1px 2px var(--ds-color-alpha-black-200)` | close | unknown |

#### `runtime/engines/modern/skin/toggle.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-toggle-description-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-toggle-dot-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ6) |
| `--ds-toggle-dot-shadow` | rottay | `0 1px 2px var(--ds-color-alpha-black-200)` | close | unknown |
| `--ds-toggle-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-toggle-track-bg` | rottay | `var(--ds-color-secondary)` | close | visible (Δ272) |

#### `presentation/components/patterns.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-card-side-accent-soft` | bithire | `color-mix( in srgb, var(--ds-color-primary) 7%, transparent )` | exact | none (Δ0) |
| `--ds-chip-bg` | bithire | `var(--ds-control-brand-tint)` | close | none (Δ0) |
| `--ds-chip-border` | bithire | `var(--ds-control-brand-border)` | close | none (Δ0) |
| `--ds-chip-color` | bithire | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-control-surface` | bithire | `var(--ds-surface-card)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/checkbox.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-checkbox-border` | rottay | `var(--ds-color-secondary)` | close | visible (Δ267) |
| `--ds-checkbox-checked-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-checkbox-focus-ring-color` | rottay | `color-mix(in srgb, var(--ds-focus-ring-color) 12%, transparent)` | close | none (Δ1) |
| `--ds-checkbox-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/descriptions.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-descriptions-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ9) |
| `--ds-descriptions-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-descriptions-content-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-descriptions-label-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |

#### `runtime/engines/modern/skin/dropdown.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-dropdown-item-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-dropdown-item-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-dropdown-item-color-hover` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-dropdown-shadow` | rottay | `0 4px 16px var(--ds-color-shadow), 0 0 0 1px var(--ds-color-accent-300)` | close | unknown |

#### `runtime/engines/modern/skin/popover.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-popover-bg` | rottay | `var(--ds-color-bg-elevated)` | close | none (Δ3) |
| `--ds-popover-content-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-popover-shadow` | rottay | `0 4px 16px var(--ds-color-shadow), 0 0 0 1px var(--ds-color-accent-300)` | close | unknown |
| `--ds-popover-title-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/statistic.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-statistic-prefix-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-statistic-suffix-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-statistic-title-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-statistic-value-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `runtime/engines/modern/skin/steps.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-steps-connector-color` | rottay | `var(--ds-color-text-inverse)` | close | visible (Δ54) |
| `--ds-steps-connector-color-active` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-steps-item-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-steps-item-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |

#### `runtime/engines/modern/skin/tree.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-tree-node-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-tree-node-bg-selected` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-tree-node-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-tree-node-color-selected` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

#### `presentation/components/skin/menu-compounds.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-menu-divider-color` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-menu-group-title-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-menu-item-danger-color` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-menu-submenu-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ7) |

#### `runtime/engines/modern/skin/back-top.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-backtop-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-backtop-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-backtop-shadow` | rottay | `0 4px 16px var(--ds-color-alpha-black-200)` | close | unknown |

#### `runtime/engines/modern/skin/skeleton.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-skeleton-bg` | rottay | `var(--ds-bg-tertiary)` | exact | none (Δ0) |
| `--ds-skeleton-highlight` | rottay | `—` | needs-design | unknown |
| `--ds-skeleton-wave-gradient` | rottay | `linear-gradient(90deg, var(--ds-color-accent-200) 25%, var(--ds-color…` | close | unknown |

#### `presentation/components/input.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-input-border-color` | bithire | `var(--ds-color-border-secondary)` | exact | none (Δ0) |
| `--ds-input-border-color-focus` | bithire | `var(--ds-color-border-focus)` | exact | none (Δ0) |
| `--ds-input-border-color-hover` | bithire | `var(--ds-color-border-secondary)` | close | visible (Δ57) |

## Non-Modern scope — for the record

| file | scope | channels | exact | close | needs-design |
|---|---|---:|---:|---:|---:|
| `runtime/engines/classic/theme.css` | legacy-engine-only | 95 | 34 | 60 | 1 |
| `runtime/engines/rustic/skin/upload.css` | legacy-engine-only | 16 | 8 | 8 | 0 |
| `ts/runtime/components/badge/index.ts` | component-token-map | 16 | 8 | 8 | 0 |
| `runtime/engines/rustic/skin/input-number.css` | legacy-engine-only | 14 | 5 | 8 | 1 |
| `runtime/engines/rustic/skin/stats-grid.css` | legacy-engine-only | 13 | 5 | 5 | 3 |
| `ts/runtime/components/avatar/index.ts` | component-token-map | 13 | 6 | 7 | 0 |
| `runtime/engines/rustic/skin/button.css` | legacy-engine-only | 11 | 8 | 3 | 0 |
| `runtime/engines/rustic/skin/date-picker.css` | legacy-engine-only | 11 | 4 | 7 | 0 |
| `runtime/engines/rustic/skin/time-picker.css` | legacy-engine-only | 11 | 4 | 7 | 0 |
| `runtime/engines/rustic/skin/autocomplete.css` | legacy-engine-only | 8 | 3 | 5 | 0 |
| `runtime/engines/rustic/skin/slider.css` | legacy-engine-only | 8 | 1 | 7 | 0 |
| `runtime/engines/rustic/skin/command-palette.css` | legacy-engine-only | 7 | 2 | 5 | 0 |
| `runtime/engines/rustic/skin/float-button.css` | legacy-engine-only | 7 | 4 | 3 | 0 |
| `runtime/engines/rustic/skin/menu.css` | legacy-engine-only | 6 | 2 | 4 | 0 |
| `runtime/engines/rustic/skin/steps.css` | legacy-engine-only | 6 | 2 | 3 | 1 |
| `ts/runtime/components/select/index.ts` | component-token-map | 5 | 2 | 3 | 0 |
| `runtime/engines/rustic/skin/checkbox.css` | legacy-engine-only | 3 | 0 | 3 | 0 |
| `runtime/engines/rustic/skin/form.css` | legacy-engine-only | 3 | 2 | 1 | 0 |
| `runtime/engines/rustic/skin/radio.css` | legacy-engine-only | 3 | 0 | 3 | 0 |
| `runtime/engines/rustic/skin/tag.css` | legacy-engine-only | 3 | 2 | 1 | 0 |
| `ts/runtime/components/toggle/index.ts` | component-token-map | 3 | 2 | 1 | 0 |
| `runtime/engines/rustic/skin/message.css` | legacy-engine-only | 2 | 1 | 1 | 0 |
| `runtime/engines/rustic/skin/pagination.css` | legacy-engine-only | 2 | 2 | 0 | 0 |
| `runtime/engines/rustic/skin/toggle.css` | legacy-engine-only | 2 | 1 | 1 | 0 |
| `runtime/engines/rustic/skin/tooltip.css` | legacy-engine-only | 2 | 1 | 1 | 0 |
| `runtime/engines/rustic/theme.css` | legacy-engine-only | 2 | 1 | 1 | 0 |
| `app-bithire/src/features/candidates/surface/screens/record/detail/view/tabs/screening/styles/index.css` | app-only | 1 | 0 | 1 | 0 |
| `app-bithire/src/features/candidates/surface/screens/record/edit/view/sections/form-controls/styles/index.css` | app-only | 1 | 1 | 0 | 0 |
| `app-bithire/src/ui/insights/styles/index.css` | app-only | 1 | 1 | 0 | 0 |
| `app-bithire/src/ui/tables/collection/preview/render/styles/index.css` | app-only | 1 | 1 | 0 | 0 |
| `runtime/engines/rustic/skin/avatar.css` | legacy-engine-only | 1 | 0 | 1 | 0 |
| `runtime/engines/rustic/skin/form-field.css` | legacy-engine-only | 1 | 0 | 1 | 0 |
| `runtime/engines/rustic/skin/image.css` | legacy-engine-only | 1 | 0 | 1 | 0 |
| `runtime/engines/rustic/skin/list.css` | legacy-engine-only | 1 | 0 | 1 | 0 |
| `runtime/engines/rustic/skin/popover.css` | legacy-engine-only | 1 | 1 | 0 | 0 |
| `runtime/engines/rustic/skin/result.css` | legacy-engine-only | 1 | 1 | 0 | 0 |
| `runtime/engines/rustic/skin/select.css` | legacy-engine-only | 1 | 1 | 0 | 0 |
| `runtime/engines/rustic/skin/transfer.css` | legacy-engine-only | 1 | 1 | 0 | 0 |
| `ts/runtime/components/checkbox/index.ts` | component-token-map | 1 | 0 | 1 | 0 |
| `ts/runtime/components/list/index.ts` | component-token-map | 1 | 1 | 0 | 0 |
| `ts/runtime/components/radio/index.ts` | component-token-map | 1 | 0 | 1 | 0 |
| `ui/patterns/shell/page-shell/engines/classic/index.tsx` | react-component | 1 | 1 | 0 | 0 |
| `ui/primitives/display/Badge/engines/classic/index.tsx` | react-component | 1 | 1 | 0 | 0 |
| `ui/primitives/display/Badge/engines/rustic/index.tsx` | react-component | 1 | 0 | 1 | 0 |
| `ui/primitives/display/Tooltip/engines/rustic/index.tsx` | react-component | 1 | 0 | 0 | 1 |
| `ui/primitives/inputs/Toggle/engines/rustic/index.tsx` | react-component | 1 | 1 | 0 | 0 |
| `ui/primitives/inputs/Upload/engines/rustic/index.tsx` | react-component | 1 | 0 | 0 | 1 |
| `ui/primitives/overlay/Watermark/contracts/index.ts` | react-component | 1 | 0 | 1 | 0 |
| `ui/structures/shell/index.tsx` | react-component | 1 | 0 | 1 | 0 |

## Unassigned

No reader the census can attribute to a file — these are read only through indirection
(another extension channel) or are the raw CSS property:

* `--ds-control-ink-muted` (bithire) — the extension already writes an expression over tenant-governed channels (--ds-color-text-secondary); the same expression moves verbatim into the Modern skin and repaints nothing
* `--ds-control-surface-raised` (bithire) — the extension already writes an expression over tenant-governed channels (--ds-surface-card, --ds-surface-panel); the same expression moves verbatim into the Modern skin and repaints nothing
* `--ds-control-brand-tint-hover` (bithire) — already an expression, but it reads --ds-control-surface — channel(s) that exist only because this same extension declares them. It becomes an exact lift as soon as those land under their own owner
* `color` (rottay) — the extension already writes an expression over tenant-governed channels (--ds-color-text-primary); the same expression moves verbatim into the Modern skin and repaints nothing

## Working rules for this lane

1. One expression per channel, valid in every state the extension declares. Modern has no
   mode identity to branch on, so a channel whose two arms disagree is a design question,
   not two rules.
2. The derivation goes in the skin, and the extension line is deleted in the same change. A
   derivation added while the extension still declares the channel changes nothing — the
   extension wins on specificity — and would read as a green no-op.
3. 209 channels repaint nothing and can land as a batch with a single sighted check.
   The 269 `close` channels each move pixels; they are the sighted-review budget.
4. `needs-design` channels do not get a guessed derivation. They wait for the design call.

