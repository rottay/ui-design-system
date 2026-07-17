/**
 * @fileoverview Type definitions for the ListToolbar pattern. Defines
 * FilterPillConfig, ListToolbarProps, and related types for building
 * a professional two-row data-table toolbar with search, filter pills,
 * density control, view mode toggle, and settings dropdown.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import type {
  DensityKey,
  FilterPillConfig,
  ViewMode,
} from '@/foundation/contracts/runtime/components/patterns/data';

export type {
  DensityKey,
  FilterPillConfig,
  ViewMode,
} from '@/foundation/contracts/runtime/components/patterns/data';

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
  /** Placeholder for the search input */
  searchPlaceholder?: string;

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
