# Kimi skin worklist v2 — Modern scope only

**247 entries across 59 owning files** carry the owner-(b) derivation work that is
actually Modern work. v1 listed 491 entries across 93 files; the scope filter in
`pc-scope-decision.md` removed **244 entries (243 distinct channels)** whose every live reader
sits inside Classic or Rustic engine territory, emptying 34 owning files.

A channel is assigned to ONE owning file — the highest-tier reader in the repo-wide census —
and every other reader is recorded as `alsoRead` in `pc-kimi-skin-worklist.v2.json`, because a
derivation written in one skin has to survive the others reading the same channel. Channels
reference `pc-reclassification.v2.json` rows by `(vertical, prop)`; the stable row key there is
`vertical | normalized selector | prop | occurrence-index`.

## What changed from v1

| | v1 | v2 | delta |
|---|---:|---:|---:|
| owning files | 93 | 59 | -34 |
| entries | 491 | 247 | -244 |
| distinct channels | 467 | 224 | — |
| exact | 209 | 115 | -94 |
| close | 269 | 127 | -142 |
| needs-design | 13 | 5 | -8 |
| dirty (WIP) files | 9 | 9 | 0 |
| unassigned (contract-blocked) | 4 | 4 | 0 |

**No Modern file lost a channel.** Every emptied file is a Rustic skin (32) or a Classic/Rustic
React engine implementation (6). That is the check that the filter cut only what it was
aimed at.

## Scope breakdown

| scope | files | channels | dirty (WIP) | exact | close | needs-design |
|---|---:|---:|---:|---:|---:|---:|
| Modern skin + shared presentation | 44 | 192 | 9 | 85 | 102 | 5 |
| TS component token maps | 7 | 40 | 0 | 19 | 21 | 0 |
| React component source | 2 | 2 | 0 | 0 | 2 | 0 |
| consuming app only | 4 | 4 | 0 | 3 | 1 | 0 |
| Classic/Rustic owning file, retained (reader outside both engines) | 2 | 5 | 0 | 5 | 0 | 0 |
| **assigned total** | **59** | **243** | **9** | | | |
| unassigned — contract-blocked, no owning file | — | 4 | — | | | |

By tenant: rottay 193, bithire 53, evnto 1.

### The five retained under a Classic/Rustic owning file

These have no Modern *engine* reader, so v1 filed them as legacy — but each is read outside
both engines, which keeps them in scope. Their owning-file assignment is stale and is flagged
`owningFileNeedsReassignment` in the JSON with the reader that should own it:

| channel | tenant | v1 owning file | reader that keeps it in scope |
|---|---|---|---|
| `--ds-drawer-header-border` | rottay | `runtime/engines/classic/theme.css` | `ui/primitives/feedback/Drawer/compound/Header/index.tsx` |
| `--ds-drawer-footer-border` | rottay | `runtime/engines/classic/theme.css` | `ui/primitives/feedback/Drawer/compound/Footer/index.tsx` |
| `--ds-button-secondary-hover-bg` | bithire | `runtime/engines/rustic/skin/button.css` | `app-bithire/src/styles/detail-chrome.css` |
| `--ds-button-default-hover-bg` | bithire | `runtime/engines/rustic/skin/button.css` | `app-bithire/src/styles/detail-chrome.css` |
| `--ds-button-secondary-hover-bg` | evnto | `runtime/engines/rustic/skin/button.css` | `app-bithire/src/styles/detail-chrome.css` |

## The files Kimi actually edits

`WIP` marks a file already dirty from the concurrent visual wave. Those need a rebase-style
read before editing, never a blind overwrite.

| file | channels | exact | close | needs-design | WIP | verticals |
|---|---:|---:|---:|---:|:-:|---|
| `runtime/engines/modern/skin/select.css` | 31 | 15 | 16 | 0 | **WIP** | bithire, rottay |
| `ts/runtime/components/badge/index.ts` | 16 | 8 | 8 | 0 |  | bithire, rottay |
| `presentation/components/badge.css` | 13 | 3 | 10 | 0 |  | bithire, rottay |
| `runtime/engines/modern/skin/textarea.css` | 13 | 5 | 8 | 0 |  | rottay |
| `ts/runtime/components/avatar/index.ts` | 13 | 6 | 7 | 0 |  | rottay |
| `runtime/engines/modern/skin/menu.css` | 12 | 3 | 7 | 2 | **WIP** | rottay |
| `runtime/engines/modern/skin/tooltip.css` | 12 | 5 | 7 | 0 |  | rottay |
| `runtime/engines/modern/theme.css` | 9 | 4 | 5 | 0 |  | rottay |
| `runtime/engines/modern/skin/list.css` | 7 | 5 | 2 | 0 |  | rottay |
| `presentation/components/patterns.css` | 5 | 3 | 2 | 0 | **WIP** | bithire |
| `runtime/engines/modern/skin/avatar.css` | 5 | 3 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/pagination.css` | 5 | 3 | 1 | 1 | **WIP** | rottay |
| `runtime/engines/modern/skin/radio.css` | 5 | 1 | 4 | 0 |  | rottay |
| `runtime/engines/modern/skin/switch.css` | 5 | 2 | 3 | 0 |  | rottay |
| `runtime/engines/modern/skin/toggle.css` | 5 | 1 | 4 | 0 |  | rottay |
| `ts/runtime/components/select/index.ts` | 5 | 2 | 3 | 0 |  | bithire, rottay |
| `presentation/components/skin/menu-compounds.css` | 4 | 1 | 3 | 0 |  | rottay |
| `runtime/engines/modern/skin/checkbox.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/descriptions.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/dropdown.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/popover.css` | 4 | 2 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/statistic.css` | 4 | 4 | 0 | 0 |  | rottay |
| `runtime/engines/modern/skin/steps.css` | 4 | 1 | 3 | 0 |  | rottay |
| `runtime/engines/modern/skin/tree.css` | 4 | 2 | 2 | 0 |  | rottay |
| `presentation/components/input.css` | 3 | 2 | 1 | 0 |  | bithire |
| `runtime/engines/modern/skin/back-top.css` | 3 | 2 | 1 | 0 |  | rottay |
| `runtime/engines/modern/skin/skeleton.css` | 3 | 1 | 1 | 1 |  | rottay |
| `runtime/engines/rustic/skin/button.css` | 3 | 3 | 0 | 0 |  | bithire, evnto |
| `ts/runtime/components/toggle/index.ts` | 3 | 2 | 1 | 0 |  | rottay |
| `presentation/components/skin/collection-header.css` | 2 | 2 | 0 | 0 | **WIP** | bithire |
| `runtime/engines/classic/theme.css` | 2 | 2 | 0 | 0 |  | rottay |
| `runtime/engines/modern/skin/form.css` | 2 | 1 | 0 | 1 |  | rottay |
| `runtime/engines/modern/skin/layout.css` | 2 | 0 | 2 | 0 |  | rottay |
| `runtime/engines/modern/skin/upload.css` | 2 | 0 | 2 | 0 |  | rottay |
| `app-bithire/src/features/candidates/surface/screens/record/detail/view/tabs/screening/styles/index.css` | 1 | 0 | 1 | 0 |  | bithire |
| `app-bithire/src/features/candidates/surface/screens/record/edit/view/sections/form-controls/styles/index.css` | 1 | 1 | 0 | 0 |  | bithire |
| `app-bithire/src/ui/insights/styles/index.css` | 1 | 1 | 0 | 0 |  | bithire |
| `app-bithire/src/ui/tables/collection/preview/render/styles/index.css` | 1 | 1 | 0 | 0 |  | bithire |
| `presentation/components/skin/avatar-compounds.css` | 1 | 0 | 1 | 0 |  | rottay |
| `presentation/components/skin/card-compounds.css` | 1 | 0 | 1 | 0 |  | rottay |
| `presentation/components/skin/collection-workspace.css` | 1 | 1 | 0 | 0 |  | rottay |
| `presentation/components/skin/drawer-compounds.css` | 1 | 1 | 0 | 0 |  | rottay |
| `presentation/components/skin/tooltip-compounds.css` | 1 | 0 | 1 | 0 |  | rottay |
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
| `ts/runtime/components/checkbox/index.ts` | 1 | 0 | 1 | 0 |  | rottay |
| `ts/runtime/components/list/index.ts` | 1 | 1 | 0 | 0 |  | rottay |
| `ts/runtime/components/radio/index.ts` | 1 | 0 | 1 | 0 |  | rottay |
| `ui/primitives/overlay/Watermark/contracts/index.ts` | 1 | 0 | 1 | 0 |  | rottay |
| `ui/structures/shell/index.tsx` | 1 | 0 | 1 | 0 |  | bithire |

## Unassigned — contract-blocked

4 entries have no owning file because their derivation target does not exist yet. They
unblock with the wave-ii contract additions, not with skin work.

| channel | tenant | blocked on | confidence |
|---|---|---|---|
| `--ds-control-ink-muted` | bithire | `--ds-color-text-secondary` | exact |
| `--ds-control-surface-raised` | bithire | `--ds-surface-card + --ds-surface-panel` | exact |
| `--ds-control-brand-tint-hover` | bithire | `--ds-control-surface` | close |
| `color` | rottay | `--ds-color-text-primary` | exact |

## The channels, per file

### `runtime/engines/modern/skin/select.css`  — **dirty from the concurrent visual WIP**

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
| `--ds-select-dropdown-shadow` | rottay | `0 4px 16px var(--ds-color-shadow), 0 0 0 1px var(--ds-color-accent-3…` | close | unknown |
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

### `ts/runtime/components/badge/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-badge-default-bg` | bithire | `var(--ds-control-surface-raised)` | close | none (Δ0) |
| `--ds-badge-default-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-badge-default-color` | bithire | `var(--ds-control-ink-muted)` | close | none (Δ0) |
| `--ds-badge-default-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-badge-error-color` | bithire | `var(--ds-color-error)` | exact | none (Δ0) |
| `--ds-badge-error-color` | rottay | `var(--ds-color-error-300)` | close | visible (Δ127) |
| `--ds-badge-info-color` | bithire | `var( --ds-color-info, var(--ds-color-secondary, var(--ds-color-prima…` | exact | none (Δ0) |
| `--ds-badge-info-color` | rottay | `var(--ds-color-info-300)` | close | visible (Δ123) |
| `--ds-badge-primary-color` | bithire | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-badge-primary-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-badge-secondary-color` | bithire | `var(--ds-control-ink-muted)` | close | none (Δ0) |
| `--ds-badge-secondary-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-badge-success-color` | bithire | `var(--ds-color-success)` | exact | none (Δ0) |
| `--ds-badge-success-color` | rottay | `var(--ds-color-text-muted)` | close | visible (Δ177) |
| `--ds-badge-warning-color` | bithire | `var( --ds-color-warning-900, var(--ds-color-warning) )` | exact | none (Δ0) |
| `--ds-badge-warning-color` | rottay | `var(--ds-color-text-muted)` | close | visible (Δ177) |

### `presentation/components/badge.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-badge-border-color` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-badge-error-bg` | bithire | `color-mix( in srgb, var(--ds-color-error) 12%, var(--ds-control-surf…` | close | none (Δ0) |
| `--ds-badge-error-bg` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-badge-info-bg` | bithire | `color-mix( in srgb, var(--ds-color-info, var(--ds-color-secondary, v…` | close | none (Δ0) |
| `--ds-badge-info-bg` | rottay | `var(--ds-color-info-500)` | close | visible (Δ40) |
| `--ds-badge-primary-bg` | bithire | `var(--ds-control-brand-tint)` | close | none (Δ0) |
| `--ds-badge-primary-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-badge-secondary-bg` | bithire | `var(--ds-control-surface-raised)` | close | none (Δ0) |
| `--ds-badge-secondary-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-badge-success-bg` | bithire | `color-mix( in srgb, var(--ds-color-success) 12%, var(--ds-control-su…` | close | none (Δ0) |
| `--ds-badge-success-bg` | rottay | `var(--ds-color-success-600)` | close | visible (Δ37) |
| `--ds-badge-warning-bg` | bithire | `color-mix( in srgb, var(--ds-color-warning) 16%, var(--ds-control-su…` | close | none (Δ0) |
| `--ds-badge-warning-bg` | rottay | `var(--ds-color-warning-600)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/textarea.css`

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

### `ts/runtime/components/avatar/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-avatar-error-bg` | rottay | `var(--ds-color-error-600)` | close | visible (Δ157) |
| `--ds-avatar-error-color` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-avatar-gradient-bg` | rottay | `linear-gradient(135deg, var(--ds-color-accent-900) 0%, var(--ds-colo…` | close | unknown |
| `--ds-avatar-group-overflow-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-avatar-group-overflow-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-avatar-primary-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-avatar-primary-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-avatar-secondary-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-avatar-secondary-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-avatar-success-bg` | rottay | `color-mix(in srgb, var(--ds-color-success) 14%, transparent)` | close | none (Δ1) |
| `--ds-avatar-success-color` | rottay | `var(--ds-color-success)` | exact | none (Δ0) |
| `--ds-avatar-warning-bg` | rottay | `color-mix(in srgb, var(--ds-color-warning) 14%, transparent)` | close | none (Δ1) |
| `--ds-avatar-warning-color` | rottay | `var(--ds-color-warning)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/menu.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-menu-item-bg-active` | rottay | `var(--ds-color-secondary)` | close | visible (Δ306) |
| `--ds-menu-item-bg-hover` | rottay | `color-mix(in srgb, var(--ds-bg-active) 4%, transparent)` | close | none (Δ1) |
| `--ds-menu-item-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-menu-item-color-active` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-menu-item-color-hover` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-sidebar-child-padding-inline` | rottay | — | close | none (Δnull) |
| `--ds-sidebar-icon-column-size` | rottay | — | needs-design | unknown |
| `--ds-sidebar-item-child-height` | rottay | — | close | none (Δnull) |
| `--ds-sidebar-item-font-size-child` | rottay | — | needs-design | unknown |
| `--ds-sidebar-item-gap` | rottay | — | close | none (Δnull) |
| `--ds-sidebar-item-height` | rottay | — | close | none (Δnull) |
| `--ds-sidebar-item-padding-inline` | rottay | — | close | none (Δnull) |

### `runtime/engines/modern/skin/tooltip.css`

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

### `runtime/engines/modern/theme.css`

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

### `runtime/engines/modern/skin/list.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-list-background-color` | rottay | `var(--ds-color-surface)` | exact | none (Δ0) |
| `--ds-list-border-color` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-list-item-background-color` | rottay | `var(--ds-color-surface)` | exact | none (Δ0) |
| `--ds-list-item-hover-background-color` | rottay | `var(--ds-color-bg-elevated)` | close | small (Δ17) |
| `--ds-list-meta-description-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-list-split-color` | rottay | `var(--ds-color-text-inverse)` | close | visible (Δ39) |
| `--ds-list-text-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `presentation/components/patterns.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-card-side-accent-soft` | bithire | `color-mix( in srgb, var(--ds-color-primary) 7%, transparent )` | exact | none (Δ0) |
| `--ds-chip-bg` | bithire | `var(--ds-control-brand-tint)` | close | none (Δ0) |
| `--ds-chip-border` | bithire | `var(--ds-control-brand-border)` | close | none (Δ0) |
| `--ds-chip-color` | bithire | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-control-surface` | bithire | `var(--ds-surface-card)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/avatar.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-avatar-default-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-avatar-default-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-avatar-gradient-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-avatar-ring-color` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-avatar-status-border` | rottay | `var(--ds-border-color-muted)` | close | visible (Δ32) |

### `runtime/engines/modern/skin/pagination.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-pagination-item-bg` | rottay | — | needs-design | unknown |
| `--ds-pagination-item-bg-active` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-pagination-item-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-pagination-item-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-pagination-item-color-hover` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/radio.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-radio-border` | rottay | `var(--ds-color-secondary)` | close | visible (Δ267) |
| `--ds-radio-checked-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ7) |
| `--ds-radio-description-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-radio-focus-ring-color` | rottay | `color-mix(in srgb, var(--ds-focus-ring-color) 12%, transparent)` | close | none (Δ1) |
| `--ds-radio-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/switch.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-switch-checked-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-switch-checked-bg-hover` | rottay | `var(--ds-color-primary)` | close | visible (Δ55) |
| `--ds-switch-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-switch-thumb-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ6) |
| `--ds-switch-thumb-shadow` | rottay | `0 1px 2px var(--ds-color-alpha-black-200)` | close | unknown |

### `runtime/engines/modern/skin/toggle.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-toggle-description-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-toggle-dot-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ6) |
| `--ds-toggle-dot-shadow` | rottay | `0 1px 2px var(--ds-color-alpha-black-200)` | close | unknown |
| `--ds-toggle-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-toggle-track-bg` | rottay | `var(--ds-color-secondary)` | close | visible (Δ272) |

### `ts/runtime/components/select/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-select-clear-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-select-clear-color-hover` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-select-color-placeholder` | bithire | `var(--ds-color-text-muted)` | exact | none (Δ0) |
| `--ds-select-color-placeholder` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-select-option-color-disabled` | rottay | `var(--ds-color-text-disabled)` | close | small (Δ23) |

### `presentation/components/skin/menu-compounds.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-menu-divider-color` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-menu-group-title-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |
| `--ds-menu-item-danger-color` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-menu-submenu-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ7) |

### `runtime/engines/modern/skin/checkbox.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-checkbox-border` | rottay | `var(--ds-color-secondary)` | close | visible (Δ267) |
| `--ds-checkbox-checked-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-checkbox-focus-ring-color` | rottay | `color-mix(in srgb, var(--ds-focus-ring-color) 12%, transparent)` | close | none (Δ1) |
| `--ds-checkbox-label-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/descriptions.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-descriptions-bg` | rottay | `var(--ds-color-bg-input)` | close | small (Δ9) |
| `--ds-descriptions-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-descriptions-content-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-descriptions-label-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |

### `runtime/engines/modern/skin/dropdown.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-dropdown-item-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-dropdown-item-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-dropdown-item-color-hover` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |
| `--ds-dropdown-shadow` | rottay | `0 4px 16px var(--ds-color-shadow), 0 0 0 1px var(--ds-color-accent-3…` | close | unknown |

### `runtime/engines/modern/skin/popover.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-popover-bg` | rottay | `var(--ds-color-bg-elevated)` | close | none (Δ3) |
| `--ds-popover-content-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-popover-shadow` | rottay | `0 4px 16px var(--ds-color-shadow), 0 0 0 1px var(--ds-color-accent-3…` | close | unknown |
| `--ds-popover-title-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/statistic.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-statistic-prefix-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-statistic-suffix-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-statistic-title-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-statistic-value-color` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/steps.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-steps-connector-color` | rottay | `var(--ds-color-text-inverse)` | close | visible (Δ54) |
| `--ds-steps-connector-color-active` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-steps-item-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-steps-item-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ68) |

### `runtime/engines/modern/skin/tree.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-tree-node-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |
| `--ds-tree-node-bg-selected` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |
| `--ds-tree-node-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-tree-node-color-selected` | rottay | `var(--ds-color-text)` | exact | none (Δ0) |

### `presentation/components/input.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-input-border-color` | bithire | `var(--ds-color-border-secondary)` | exact | none (Δ0) |
| `--ds-input-border-color-focus` | bithire | `var(--ds-color-border-focus)` | exact | none (Δ0) |
| `--ds-input-border-color-hover` | bithire | `var(--ds-color-border-secondary)` | close | visible (Δ57) |

### `runtime/engines/modern/skin/back-top.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-backtop-bg` | rottay | `var(--ds-color-primary)` | exact | none (Δ0) |
| `--ds-backtop-color` | rottay | `var(--ds-color-text-on-primary)` | exact | none (Δ0) |
| `--ds-backtop-shadow` | rottay | `0 4px 16px var(--ds-color-alpha-black-200)` | close | unknown |

### `runtime/engines/modern/skin/skeleton.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-skeleton-bg` | rottay | `var(--ds-bg-tertiary)` | exact | none (Δ0) |
| `--ds-skeleton-highlight` | rottay | — | needs-design | unknown |
| `--ds-skeleton-wave-gradient` | rottay | `linear-gradient(90deg, var(--ds-color-accent-200) 25%, var(--ds-colo…` | close | unknown |

### `runtime/engines/rustic/skin/button.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-button-default-hover-bg` | bithire | `var(--ds-button-default-bg-hover)` | exact | none (Δ0) |
| `--ds-button-secondary-hover-bg` | bithire | `var(--ds-button-secondary-bg-hover)` | exact | none (Δ0) |
| `--ds-button-secondary-hover-bg` | evnto | `var(--ds-color-bg-secondary)` | exact | none (Δ0) |

### `ts/runtime/components/toggle/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-toggle-error-bg` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |
| `--ds-toggle-success-bg` | rottay | `var(--ds-color-success)` | exact | none (Δ0) |
| `--ds-toggle-warning-bg` | rottay | `var(--ds-color-warning)` | exact | none (Δ0) |

### `presentation/components/skin/collection-header.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-button-default-border-color` | bithire | `var(--ds-button-default-border)` | exact | none (Δ0) |
| `--ds-button-primary-border-color` | bithire | `var(--ds-button-primary-bg)` | exact | none (Δ0) |

### `runtime/engines/classic/theme.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-drawer-footer-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |
| `--ds-drawer-header-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/form.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-form-label-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |
| `--ds-form-label-font-weight` | rottay | — | needs-design | unknown |

### `runtime/engines/modern/skin/layout.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-sidebar-shell-padding-collapsed` | rottay | — | close | none (Δnull) |
| `--ds-sidebar-shell-padding-inline` | rottay | — | close | none (Δnull) |

### `runtime/engines/modern/skin/upload.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-upload-preview-backdrop` | rottay | `color-mix(in srgb, var(--ds-color-bg-overlay) 70%, transparent)` | close | none (Δ1) |
| `--ds-upload-preview-overlay` | rottay | `color-mix(in srgb, var(--ds-color-bg-overlay) 50%, transparent)` | close | none (Δ1) |

### `app-bithire/src/features/candidates/surface/screens/record/detail/view/tabs/screening/styles/index.css`  — **file does not exist yet**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-control-brand-tint` | bithire | `color-mix( in srgb, var(--ds-color-primary) 10%, var(--ds-control-su…` | close | none (Δ0) |

### `app-bithire/src/features/candidates/surface/screens/record/edit/view/sections/form-controls/styles/index.css`  — **file does not exist yet**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-control-brand-border` | bithire | `color-mix( in srgb, var(--ds-color-primary) 30%, var(--ds-color-bord…` | exact | none (Δ0) |

### `app-bithire/src/ui/insights/styles/index.css`  — **file does not exist yet**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-control-ink` | bithire | `var(--ds-color-text-primary)` | exact | none (Δ0) |

### `app-bithire/src/ui/tables/collection/preview/render/styles/index.css`  — **file does not exist yet**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-control-on-brand` | bithire | `var( --ds-color-text-on-primary, var(--ds-color-text-inverse) )` | exact | none (Δ0) |

### `presentation/components/skin/avatar-compounds.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-avatar-group-border` | rottay | `var(--ds-border-color-muted)` | close | visible (Δ32) |

### `presentation/components/skin/card-compounds.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-card-cover-overlay-bg` | rottay | `linear-gradient( to bottom, transparent 0%, transparent 50%, color-m…` | close | unknown |

### `presentation/components/skin/collection-workspace.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-popover-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |

### `presentation/components/skin/drawer-compounds.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-drawer-body-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |

### `presentation/components/skin/tooltip-compounds.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-tooltip-shadow` | rottay | `0 4px 16px var(--ds-color-shadow)` | close | unknown |

### `runtime/engines/modern/skin/calendar.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-calendar-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/cockpit-header.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-badge-padding-x` | bithire | — | close | none (Δnull) |

### `runtime/engines/modern/skin/data-table.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-table-row-focus-shadow` | bithire | `inset 0 0 0 1px color-mix(in srgb, var(--ds-color-primary) 28%, tran…` | exact | none (Δ0) |

### `runtime/engines/modern/skin/date-picker.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-datepicker-panel-shadow` | bithire | `var(--ds-shadow-popover)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/empty.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-empty-icon-color` | rottay | `var(--ds-color-text-disabled)` | close | visible (Δ28) |

### `runtime/engines/modern/skin/pattern-timeline.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-timeline-line-color` | rottay | `var(--ds-color-text-inverse)` | close | visible (Δ54) |

### `runtime/engines/modern/skin/progress.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-progress-bg` | rottay | `var(--ds-color-surface-muted)` | close | small (Δ14) |

### `runtime/engines/modern/skin/tag.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-tag-border` | rottay | `var(--ds-border-color-default)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/time-picker.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-timepicker-panel-shadow` | bithire | `var(--ds-shadow-popover)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/timeline.css`  — **dirty from the concurrent visual WIP**

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-timeline-content-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |

### `runtime/engines/modern/skin/transfer.css`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-transfer-item-bg-hover` | rottay | `var(--ds-color-secondary)` | close | visible (Δ285) |

### `ts/runtime/components/checkbox/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-checkbox-error-border` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |

### `ts/runtime/components/list/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-list-secondary-text-color` | rottay | `var(--ds-color-secondary)` | exact | none (Δ0) |

### `ts/runtime/components/radio/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-radio-error-border` | rottay | `var(--ds-color-error-500)` | close | visible (Δ46) |

### `ui/primitives/overlay/Watermark/contracts/index.ts`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-watermark-color` | rottay | `var(--ds-color-text-inverse)` | close | visible (Δ39) |

### `ui/structures/shell/index.tsx`

| channel | tenant | proposed derivation | confidence | repaint |
|---|---|---|---|---|
| `--ds-shell-topbar-height` | bithire | — | close | none (Δnull) |

## Removed for scope

244 entries left this worklist. They are not deleted — the full set with derivation
proposals intact is `removedForScope` in `pc-kimi-skin-worklist.v2.json`, and their rows are
marked `modernScope: "classic-rustic-only"` in `pc-reclassification.v2.json`. Their
disposition is the open owner question in `pc-drain-plan.v2.md` wave vi.

| emptied owning file | entries |
|---|---:|
| `runtime/engines/rustic/skin/upload.css` | 16 |
| `runtime/engines/rustic/skin/input-number.css` | 14 |
| `runtime/engines/rustic/skin/stats-grid.css` | 13 |
| `runtime/engines/rustic/skin/date-picker.css` | 11 |
| `runtime/engines/rustic/skin/time-picker.css` | 11 |
| `runtime/engines/rustic/skin/autocomplete.css` | 8 |
| `runtime/engines/rustic/skin/slider.css` | 8 |
| `runtime/engines/rustic/skin/command-palette.css` | 7 |
| `runtime/engines/rustic/skin/float-button.css` | 7 |
| `runtime/engines/rustic/skin/menu.css` | 6 |
| `runtime/engines/rustic/skin/steps.css` | 6 |
| `runtime/engines/rustic/skin/checkbox.css` | 3 |
| `runtime/engines/rustic/skin/form.css` | 3 |
| `runtime/engines/rustic/skin/radio.css` | 3 |
| `runtime/engines/rustic/skin/tag.css` | 3 |
| `runtime/engines/rustic/skin/message.css` | 2 |
| `runtime/engines/rustic/skin/pagination.css` | 2 |
| `runtime/engines/rustic/skin/toggle.css` | 2 |
| `runtime/engines/rustic/skin/tooltip.css` | 2 |
| `runtime/engines/rustic/theme.css` | 2 |
| `runtime/engines/rustic/skin/avatar.css` | 1 |
| `runtime/engines/rustic/skin/form-field.css` | 1 |
| `runtime/engines/rustic/skin/image.css` | 1 |
| `runtime/engines/rustic/skin/list.css` | 1 |
| `runtime/engines/rustic/skin/popover.css` | 1 |
| `runtime/engines/rustic/skin/result.css` | 1 |
| `runtime/engines/rustic/skin/select.css` | 1 |
| `runtime/engines/rustic/skin/transfer.css` | 1 |
| `ui/patterns/shell/page-shell/engines/classic/index.tsx` | 1 |
| `ui/primitives/display/Badge/engines/classic/index.tsx` | 1 |
| `ui/primitives/display/Badge/engines/rustic/index.tsx` | 1 |
| `ui/primitives/display/Tooltip/engines/rustic/index.tsx` | 1 |
| `ui/primitives/inputs/Toggle/engines/rustic/index.tsx` | 1 |
| `ui/primitives/inputs/Upload/engines/rustic/index.tsx` | 1 |
