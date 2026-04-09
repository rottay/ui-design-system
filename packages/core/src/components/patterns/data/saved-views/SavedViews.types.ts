/**
 * @fileoverview Type definitions for the SavedViewsBar pattern. Defines
 * SavedView (config with filters/sort/columns/layout), SavedViewConfig,
 * ViewMenuAction, and the full props for view CRUD, reordering, and duplication.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

/**
 * Configuration snapshot stored within a saved view.
 * Captures the complete UI state (filters, sorting, visible columns,
 * grouping, and layout mode) so it can be restored when the view is selected.
 */
export interface SavedViewConfig {
  /** Active filter values keyed by filter field name */
  filters?: Record<string, any>;
  /** Ordered list of sort criteria applied to the data */
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  /** Ordered list of visible column identifiers */
  columns?: string[];
  /** Field name used to group rows/items */
  groupBy?: string;
  /** Layout mode the view renders in */
  layout?: 'table' | 'board' | 'gallery' | 'calendar';
}

/**
 * A single saved view definition.
 * Represents a named, persisted configuration that users can select
 * from the view bar to instantly apply a set of filters, sorting,
 * column visibility, and layout preferences.
 */
export interface SavedView {
  /** Unique identifier for this view */
  id: string;
  /** User-facing display name shown on the view tab */
  name: string;
  /** Optional icon rendered alongside the view name */
  icon?: ReactNode;
  /** Whether this view is the default selection when no view is active */
  isDefault?: boolean;
  /** The captured configuration state for this view */
  config: SavedViewConfig;
}

/**
 * Describes a single item in a view's right-click or overflow context menu.
 * Used by `getMenuActions` to provide custom per-view actions beyond
 * the built-in rename, duplicate, and delete operations.
 */
export interface ViewMenuAction {
  /** Unique key for list rendering and identification */
  key: string;
  /** Menu item label text */
  label: string;
  /** Optional icon rendered before the label */
  icon?: ReactNode;
  /** Whether to style this item as a destructive/danger action */
  danger?: boolean;
  /** Whether the menu item is disabled */
  disabled?: boolean;
  /** Handler invoked when the menu item is clicked */
  onClick: () => void;
}

/**
 * Props for the SavedViewsBar pattern component.
 * Renders a horizontal tab bar of saved views with support for
 * selecting, creating, renaming, deleting, duplicating, and reordering views.
 *
 * @example
 * ```tsx
 * <SavedViewsBar
 *   views={views}
 *   activeViewId={currentViewId}
 *   onViewSelect={(id) => setCurrentViewId(id)}
 *   onViewSave={(view) => updateView(view)}
 *   onViewDelete={(id) => deleteView(id)}
 *   onViewRename={(id, name) => renameView(id, name)}
 *   onViewCreate={(view) => createView(view)}
 *   allowCreate
 *   maxViews={10}
 * />
 * ```
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
