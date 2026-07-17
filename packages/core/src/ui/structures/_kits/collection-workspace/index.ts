/**
 * @fileoverview Collection Workspace Kit — editorial grouping of the
 * chrome families that compose a complete collection/list workspace.
 *
 * @description
 * This barrel is **source-local only**. It is NOT re-exported from the
 * chrome barrel, `components/index.ts`, or `src/index.ts`, and it is
 * NOT part of the published `@rottay/design-system` API. Consumers
 * should import all eight pieces from the package root like any other
 * component:
 *
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
 * The purpose of this file is editorial: it documents which eight chrome
 * families form one coherent workspace experience so the next contributor
 * composing a list screen knows the full set at a glance.
 */

// Headers
export { CollectionHeader } from '../../headers/collection';
export type { CollectionHeaderProps } from '../../headers/collection';

// Command and search
export { SearchCommandBar } from '../../workspace/connected-command-palette/search-command-bar';
export type { SearchCommandBarProps } from '../../workspace/connected-command-palette/search-command-bar';

// Filtering
export { ActiveFiltersBar } from '../../workspace/active-filters-bar';
export type { ActiveFiltersBarProps } from '../../workspace/active-filters-bar';
export { FieldFiltersPanel } from '../../workspace/field-filters-panel';
export type { FieldFiltersPanelProps } from '../../workspace/field-filters-panel';

// Column management
export { ColumnMenu } from '../../workspace/column-menu';
export type { ColumnMenuProps } from '../../workspace/column-menu';

// Saved views
export { SavedViewsMenu } from '../../workspace/saved-views-menu';
export type { SavedViewsMenuProps } from '../../workspace/saved-views-menu';

// Selection
export { SelectionPreviewRail } from '../../workspace/selection-preview-rail';
export type { SelectionPreviewRailProps } from '../../workspace/selection-preview-rail';

// Scoping
export { ScopeSwitcher } from '../../workspace/scope-switcher';
export type { ScopeSwitcherProps } from '../../workspace/scope-switcher';
