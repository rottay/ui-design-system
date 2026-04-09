/**
 * @fileoverview Collection Workspace Kit — a curated re-export of the
 * chrome families that compose a complete collection/list workspace.
 *
 * @description
 * This barrel groups the eight renamed workspace-family chrome components
 * into a single import surface. Consumers building collection screens can
 * import all pieces at once instead of cherry-picking from the flat
 * chrome barrel or from the package root.
 *
 * @example
 * ```ts
 * import {
 *   CollectionHeader,
 *   SearchCommandBar,
 *   ActiveFiltersBar,
 *   FieldFiltersPanel,
 *   ColumnMenu,
 *   SavedViewsMenu,
 *   SelectionPreviewRail,
 *   ScopeSwitcher,
 * } from '@rottay/design-system';
 * ```
 *
 * All eight components are already available from the package root via
 * the chrome barrel. This kit barrel is an editorial convenience — it
 * documents which pieces form one coherent workspace experience so the
 * next contributor composing a list screen knows the full set at a
 * glance.
 */

// Headers
export { CollectionHeader } from '../../collection-header';
export type { CollectionHeaderProps } from '../../collection-header';

// Command and search
export { SearchCommandBar } from '../../search-command-bar';
export type { SearchCommandBarProps } from '../../search-command-bar';

// Filtering
export { ActiveFiltersBar } from '../../active-filters-bar';
export type { ActiveFiltersBarProps } from '../../active-filters-bar';
export { FieldFiltersPanel } from '../../field-filters-panel';
export type { FieldFiltersPanelProps } from '../../field-filters-panel';

// Column management
export { ColumnMenu } from '../../column-menu';
export type { ColumnMenuProps } from '../../column-menu';

// Saved views
export { SavedViewsMenu } from '../../saved-views-menu';
export type { SavedViewsMenuProps } from '../../saved-views-menu';

// Selection
export { SelectionPreviewRail } from '../../selection-preview-rail';
export type { SelectionPreviewRailProps } from '../../selection-preview-rail';

// Scoping
export { ScopeSwitcher } from '../../scope-switcher';
export type { ScopeSwitcherProps } from '../../scope-switcher';
