/**
 * @fileoverview Type definitions for the ListToolbar pattern. Defines
 * FilterPillConfig, ListToolbarProps, and related types for building
 * a professional two-row data-table toolbar with search, filter pills,
 * density control, view mode toggle, and settings dropdown.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import type {
  ActiveFilterState,
  DensityKey,
  FilterPillConfig,
  ViewMode,
} from '@/foundation/contracts/runtime/components/patterns/data';

export type {
  ActiveFilterState,
  DensityKey,
  FilterPillConfig,
  ViewMode,
} from '@/foundation/contracts/runtime/components/patterns/data';

/** Localizable copy owned by the toolbar chrome, rather than by its data. */
export interface ListToolbarMessages {
  compact: string;
  comfortable: string;
  spacious: string;
  densitySuffix: string;
  rowDensity: string;
  viewMode: string;
  listView: string;
  cardView: string;
  columns: string;
  density: string;
  views: string;
  noColumnSettings: string;
  noSavedViews: string;
  columnSettings: string;
  settings: string;
  moreOptions: string;
  export: string;
  active: string;
  clearAll: string;
  /**
   * Accessible name for the search input. Optional; both engines fall back to
   * `searchPlaceholder` so existing callers keep their current behavior.
   */
  searchLabel?: string;
  /**
   * Supporting copy under each density option in the classic engine's
   * radio-style density list. Optional; the modern engine renders no
   * descriptions, so it ignores these keys.
   */
  compactDescription?: string;
  comfortableDescription?: string;
  spaciousDescription?: string;
  /**
   * Accessible state name announced inside a draft filter chip (chosen but
   * not yet applied). Optional; resolves through the catalog when present,
   * with an English floor.
   */
  draft?: string;
  /**
   * Accessible state name announced inside an invalid filter chip (the value
   * no longer resolves against the filter's options). Same resolution law as
   * `draft`.
   */
  invalid?: string;
}

/** Props for the ListToolbar pattern component. */
export interface ListToolbarProps extends PatternBaseProps {
  // Title section
  /** Toolbar heading */
  title: string;
  /** When false, hides the title/count cluster and lets search lead the bar. */
  showTitleSection?: boolean;
  /** Optional icon preceding the title */
  icon?: ReactNode;
  /** Total item count displayed beside the title */
  totalCount: number;

  // Search
  /** Current search value (controlled) */
  search: string;
  /** Search value change handler */
  onSearchChange: (value: string) => void;
  /** Placeholder for the search input. Defaults to the i18n catalog value
   * `components.listToolbar.searchPlaceholder` (English floor: 'Search...'). */
  searchPlaceholder?: string;
  /** Localized toolbar chrome. Defaults preserve the historical English copy.
   * In the modern engine each entry resolves through the i18n catalogs
   * (`components.listToolbar.*`, landed for en/es/ar; fr/pt use the
   * documented partial-locale fallback chain) — these overrides still win. */
  messages?: Partial<ListToolbarMessages>;

  // Filters
  /** Segmented filter pill definitions */
  filterPills?: FilterPillConfig[];
  /** Currently active filter values keyed by filter key */
  activeFilters?: Record<string, unknown>;
  /** Handler when a filter value changes */
  onFilterChange?: (key: string, value: unknown) => void;
  /** Handler to clear all active filters */
  onClearFilters?: () => void;
  /** Number of currently active filters */
  activeFilterCount?: number;
  /**
   * Per-filter lifecycle state, keyed by filter key (see `ActiveFilterState`).
   * Optional; a filter without an entry renders as `applied`. Independently of
   * this map, the modern engine marks a chip `invalid` when its active value
   * no longer exists among the pill's options (orphaned value).
   */
  filterStates?: Record<string, ActiveFilterState>;
  /**
   * The collection below the toolbar is refreshing. The bar keeps its full
   * footprint (no layout shift), marks the root `aria-busy` and renders the
   * governed busy hairline; controls stay operable so a slow refresh never
   * strands the search the user is typing into.
   */
  loading?: boolean;

  // View controls
  /** Current view mode */
  viewMode: ViewMode;
  /** View mode change handler */
  onViewModeChange: (mode: ViewMode) => void;
  /** Current row density */
  density: DensityKey;
  /** Density change handler */
  onDensityChange: (density: DensityKey) => void;

  // Column settings (rendered inside settings dropdown)
  /** Column settings content rendered as a slot */
  columnSettingsContent?: ReactNode;
  // Saved views (rendered inside settings dropdown)
  /** Saved views content rendered as a slot */
  savedViewsContent?: ReactNode;

  // Primary action
  /** Primary CTA button configuration */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };

  // Export
  /** Export handler */
  onExport?: () => void;
}
