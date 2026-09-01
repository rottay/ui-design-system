/**
 * @fileoverview TableToolbar contracts — the structures-tier one-row toolbar.
 *
 * @description
 * Split out of the family entrypoint so the entrypoint and the rendering
 * owner share one contract instead of importing each other.
 */

import type { ReactNode } from 'react';

/** Primary (forward) action of the toolbar; `href` and `onClick` are both valid. */
export interface TableToolbarPrimaryAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
}

export interface TableToolbarProps {
  /** Search input value */
  search?: string;
  /** Search input change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /**
   * Accessible name for the search landmark and its field. Defaults to the
   * localized "Search" floor; a `role='search'` region without a name is
   * indistinguishable from every other search region on the page.
   */
  searchLabel?: string;
  /** Whether filters are active */
  isFiltered?: boolean;
  /** Reset filters handler */
  onResetFilters?: () => void;
  /** Primary action button config */
  primaryAction?: TableToolbarPrimaryAction;
  /** Additional filter components rendered between the spacer and the actions */
  filters?: ReactNode;
  /** Additional action buttons rendered before the primary action */
  actions?: ReactNode;
  /** Left side content (rendered after the search input) */
  leftContent?: ReactNode;
  /** Accessible name for the control cluster; defaults to the localized floor. */
  actionsLabel?: string;
}
