/**
 * @fileoverview Type definitions for the FilterPanel pattern. Defines props
 * for the configurable filter UI with inline/stacked/sidebar layouts,
 * collapsible sections, apply/reset buttons, and active filter count.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps, FilterDef } from '../../types';

/**
 * Props for the FilterPanel pattern component.
 * Renders a configurable panel of filter controls that can be laid out
 * inline, stacked vertically, or as a sidebar. Supports collapsing,
 * explicit apply/reset actions, and an active filter count badge.
 *
 * @example
 * ```tsx
 * <FilterPanel
 *   filters={[
 *     { key: 'status', label: 'Status', type: 'select', options: ['active', 'archived'] },
 *     { key: 'date', label: 'Date Range', type: 'daterange' },
 *   ]}
 *   values={filterValues}
 *   onChange={setFilterValues}
 *   onReset={() => setFilterValues({})}
 *   layout="inline"
 *   showReset
 *   activeCount={Object.keys(filterValues).length}
 * />
 * ```
 */
export interface FilterPanelProps extends PatternBaseProps {
  /** Array of filter definitions describing each filter control */
  filters: FilterDef[];
  /** Current filter values keyed by filter field name */
  values: Record<string, unknown>;
  /** Called whenever any filter value changes, with the full values map */
  onChange: (values: Record<string, unknown>) => void;
  /** Called when the user clicks the reset button to clear all filters */
  onReset?: () => void;
  /** Layout mode for arranging filter controls */
  layout?: 'inline' | 'stacked' | 'sidebar';
  /** Whether the filter panel can be collapsed/expanded */
  collapsible?: boolean;
  /** Initial collapsed state when `collapsible` is true */
  defaultCollapsed?: boolean;
  /** Title text displayed at the top of the filter panel */
  title?: string;
  /** Whether to show the reset button */
  showReset?: boolean;
  /** Whether to show an explicit apply button (deferred filtering) */
  showApply?: boolean;
  /** Called when the user clicks the apply button with current filter values */
  onApply?: (values: Record<string, unknown>) => void;
  /** Number of currently active filters (displayed as a badge count) */
  activeCount?: number;
}

export type { FilterDef } from '../../types';
