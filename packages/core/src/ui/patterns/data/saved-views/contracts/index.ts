/**
 * @fileoverview Type definitions for the SavedViewsBar pattern. Defines
 * SavedView (config with filters/sort/columns/layout), SavedViewConfig,
 * ViewMenuAction, and the full props for view CRUD, reordering, and duplication.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';
import type { SavedView } from '@/foundation/contracts/runtime/components/patterns/data';

export type {
  SavedView,
  SavedViewConfig,
} from '@/foundation/contracts/runtime/components/patterns/data';

/**
 * Configuration snapshot stored within a saved view.
 * Captures the complete UI state (filters, sorting, visible columns,
 * grouping, and layout mode) so it can be restored when the view is selected.
 */
// SavedViewConfig is owned by the dependency-free contracts tier.

/**
 * A single saved view definition.
 * Represents a named, persisted configuration that users can select
 * from the view bar to instantly apply a set of filters, sorting,
 * column visibility, and layout preferences.
 */
// SavedView is owned by the dependency-free contracts tier.

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
  /**
   * Mutation handlers. Each is OPTIONAL, and an absent handler means that
   * action is NOT AVAILABLE — the bar renders without it, exactly as the
   * sibling `allowCreate`/`allowDelete`/`allowRename` flags already describe.
   * Requiring them made the read-only bar this contract advertises impossible
   * to express, which was a contradiction between two halves of one interface.
   */
  onViewSave?: (view: SavedView) => void;
  /** Called when a view is deleted */
  onViewDelete?: (viewId: string) => void;
  /** Called when a view is renamed */
  onViewRename?: (viewId: string, name: string) => void;
  /** Called when a new view is created */
  onViewCreate?: (view: Omit<SavedView, 'id'>) => void;
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
