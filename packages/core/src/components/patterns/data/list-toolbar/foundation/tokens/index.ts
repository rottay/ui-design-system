import type { CSSProperties } from 'react';

export const TOOLBAR_BG = 'var(--ds-toolbar-bg, var(--ds-surface-card, var(--ds-color-bg-primary)))';
export const TOOLBAR_BORDER = 'var(--ds-toolbar-border, var(--ds-color-border))';
export const TOOLBAR_BORDER_BOTTOM = 'var(--ds-toolbar-border-bottom, var(--ds-toolbar-border, var(--ds-color-border)))';
export const TOOLBAR_COLOR = 'var(--ds-toolbar-color, var(--ds-color-text-primary))';
export const TOOLBAR_SHADOW = 'var(--ds-toolbar-shadow, none)';
export const TOOLBAR_RADIUS = 'var(--ds-toolbar-radius, var(--ds-radius-md, 8px))';
export const TOOLBAR_PADDING = 'var(--ds-toolbar-padding, 10px 16px)';
export const TOOLBAR_GAP = 'var(--ds-toolbar-gap, 10px)';
export const TOOLBAR_CONTROL_BG = 'var(--ds-toolbar-control-bg, transparent)';
export const TOOLBAR_CONTROL_BORDER = 'var(--ds-toolbar-control-border, var(--ds-toolbar-border, var(--ds-color-border)))';
export const TOOLBAR_CONTROL_COLOR = 'var(--ds-toolbar-control-color, var(--ds-color-text-secondary))';
export const TOOLBAR_CONTROL_RADIUS = 'var(--ds-toolbar-control-radius, var(--ds-radius-sm, 6px))';
export const TOOLBAR_DIVIDER = 'var(--ds-toolbar-divider, var(--ds-toolbar-border, var(--ds-color-border)))';
export const TOOLBAR_DIVIDER_SPACING = 'var(--ds-toolbar-divider-spacing, 4px)';

export const FILTER_PILL_BG = 'var(--ds-filter-pill-bg, transparent)';
export const FILTER_PILL_BORDER = 'var(--ds-filter-pill-border, transparent)';
export const FILTER_PILL_RADIUS = 'var(--ds-filter-pill-radius, var(--ds-radius-pill, 20px))';
export const FILTER_PILL_COLOR = 'var(--ds-filter-pill-color, var(--ds-color-text-secondary))';
export const FILTER_PILL_SHADOW = 'var(--ds-filter-pill-shadow, none)';
export const FILTER_PILL_FRAME_BG = 'var(--ds-filter-pill-frame-bg, transparent)';
export const FILTER_PILL_FRAME_BORDER = 'var(--ds-filter-pill-frame-border, var(--ds-toolbar-divider, var(--ds-color-border)))';
export const FILTER_PILL_FRAME_SHADOW = 'var(--ds-filter-pill-frame-shadow, none)';
export const FILTER_PILL_HOVER_BG = 'var(--ds-filter-pill-hover-bg, var(--ds-surface-highlight, color-mix(in srgb, var(--ds-color-text-primary) 4%, transparent)))';
export const FILTER_PILL_HOVER_BORDER = 'var(--ds-filter-pill-hover-border, var(--ds-toolbar-control-border, var(--ds-color-border)))';
export const FILTER_PILL_ACTIVE_BG = 'var(--ds-filter-pill-active-bg, color-mix(in srgb, var(--ds-color-primary) 8%, transparent))';
export const FILTER_PILL_ACTIVE_BORDER = 'var(--ds-filter-pill-active-border, var(--ds-color-primary))';
export const FILTER_PILL_ACTIVE_COLOR = 'var(--ds-filter-pill-active-color, var(--ds-color-primary))';
export const FILTER_PILL_ACTIVE_SHADOW = 'var(--ds-filter-pill-active-shadow, var(--ds-filter-pill-shadow, none))';
export const FILTER_PILL_FOCUS_RING = 'var(--ds-filter-pill-focus-ring, 0 0 0 3px color-mix(in srgb, var(--ds-color-primary) 22%, transparent))';
export const FILTER_PILL_COUNT_BG = 'var(--ds-filter-pill-count-bg, color-mix(in srgb, var(--ds-color-text-primary) 6%, transparent))';
export const FILTER_PILL_COUNT_ACTIVE_BG = 'var(--ds-filter-pill-count-active-bg, var(--ds-filter-pill-active-color, var(--ds-color-primary)))';
export const FILTER_PILL_COUNT_BORDER = 'var(--ds-filter-pill-count-border, transparent)';
export const FILTER_PILL_COUNT_ACTIVE_BORDER = 'var(--ds-filter-pill-count-active-border, transparent)';
export const FILTER_PILL_COUNT_RING = 'var(--ds-filter-pill-count-ring, none)';
export const FILTER_PILL_COUNT_ACTIVE_RING = 'var(--ds-filter-pill-count-active-ring, none)';

export const SEARCH_BG = 'var(--ds-search-bg, transparent)';
export const SEARCH_BORDER = 'var(--ds-search-border, var(--ds-toolbar-control-border, var(--ds-color-border)))';
export const SEARCH_COLOR = 'var(--ds-search-color, var(--ds-toolbar-color, var(--ds-color-text-primary)))';
export const SEARCH_SHADOW = 'var(--ds-search-shadow, none)';
export const SEARCH_RADIUS = 'var(--ds-search-radius, var(--ds-toolbar-radius, var(--ds-radius-sm, 6px)))';
export const SEARCH_INPUT_BG = 'var(--ds-search-input-bg, var(--ds-search-bg, var(--ds-surface-control, var(--ds-color-bg-input))))';
export const SEARCH_INPUT_BORDER = 'var(--ds-search-input-border, var(--ds-search-border, var(--ds-color-border)))';
export const SEARCH_INPUT_COLOR = 'var(--ds-search-input-color, var(--ds-search-color, var(--ds-color-text-primary)))';
export const SEARCH_PLACEHOLDER_COLOR = 'var(--ds-search-placeholder-color, var(--ds-color-text-muted))';
export const SEARCH_ICON_COLOR = 'var(--ds-search-icon-color, var(--ds-color-text-muted))';
export const SEARCH_CLEAR_COLOR = 'var(--ds-search-clear-color, var(--ds-color-text-muted))';
export const SEARCH_CLEAR_COLOR_HOVER = 'var(--ds-search-clear-color-hover, var(--ds-color-text-secondary))';

export function searchInputStyle(extra: CSSProperties = {}): CSSProperties {
  return {
    '--ds-input-bg': SEARCH_INPUT_BG,
    '--ds-input-border': SEARCH_INPUT_BORDER,
    '--ds-input-color': SEARCH_INPUT_COLOR,
    '--ds-input-color-placeholder': SEARCH_PLACEHOLDER_COLOR,
    '--ds-input-addon-color': SEARCH_ICON_COLOR,
    '--ds-input-clear-color': SEARCH_CLEAR_COLOR,
    '--ds-input-clear-color-hover': SEARCH_CLEAR_COLOR_HOVER,
    background: SEARCH_BG,
    borderColor: SEARCH_BORDER,
    color: SEARCH_COLOR,
    boxShadow: SEARCH_SHADOW,
    borderRadius: SEARCH_RADIUS,
    ...extra,
  } as CSSProperties;
}
