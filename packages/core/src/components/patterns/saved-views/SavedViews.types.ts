/**
 * SavedViewsBar - Pattern Component Types
 *
 * The Airtable/Linear pattern: save and switch between custom data views.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

/**
 * Configuration for a saved view including filters, sort, columns, etc.
 */
export interface SavedViewConfig {
  filters?: Record<string, any>;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  columns?: string[];
  groupBy?: string;
  layout?: 'table' | 'board' | 'gallery' | 'calendar';
}

/**
 * A single saved view definition.
 */
export interface SavedView {
  id: string;
  name: string;
  icon?: ReactNode;
  isDefault?: boolean;
  config: SavedViewConfig;
}

/**
 * Menu action for a view's context menu.
 */
export interface ViewMenuAction {
  key: string;
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * Props for the SavedViewsBar pattern component.
 */
export interface SavedViewsBarProps extends PatternBaseProps {
  /** List of saved views */
  views: SavedView[];
  /** Currently active view ID */
  activeViewId?: string;
  /** Called when a view tab is selected */
  onViewSelect: (viewId: string) => void;
  /** Called when a view is saved (updated) */
  onViewSave: (view: SavedView) => void;
  /** Called when a view is deleted */
  onViewDelete: (viewId: string) => void;
  /** Called when a view is renamed */
  onViewRename: (viewId: string, name: string) => void;
  /** Called when a new view is created */
  onViewCreate: (view: Omit<SavedView, 'id'>) => void;
  /** Called when views are reordered (receives new ordered array of IDs) */
  onViewReorder?: (viewIds: string[]) => void;
  /** Called when a view is duplicated */
  onViewDuplicate?: (viewId: string) => void;
  /** Whether creating new views is allowed */
  allowCreate?: boolean;
  /** Whether deleting views is allowed */
  allowDelete?: boolean;
  /** Whether renaming views is allowed */
  allowRename?: boolean;
  /** Label for the create button */
  createLabel?: string;
  /** Placeholder for new view name input */
  newViewPlaceholder?: string;
  /** Custom menu actions for each view */
  getMenuActions?: (view: SavedView) => ViewMenuAction[];
  /** Maximum number of views allowed */
  maxViews?: number;
}
