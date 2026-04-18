/**
 * @fileoverview Surface barrel exports — the page-level API layer of the
 * Rottay Design System.
 *
 * Surfaces are organized into three tiers:
 *
 * 1. **Foundation** (`foundation/`) — shared types, builders, helpers,
 *    responsive utilities, translation scope, profile default resolution,
 *    hooks, contracts, and surface states.
 * 2. **Layout** (`layout/`) — structural wrappers that provide consistent
 *    page chrome, header navigation, and sidebar layouts.
 * 3. **Pages** (`pages/`) — complete page-level surface configs organized
 *    into 6 domain-aligned subgroups: data, forms, workspace, operations,
 *    admin, experience.
 *
 * @example
 * ```ts
 * import {
 *   createListSurfaceConfig,
 *   ListSurface,
 *   type ListSurfaceConfig,
 * } from '@rottay/design-system';
 * ```
 */

// -- Foundation: types, builders, helpers, hooks, contracts, states --
export * from './foundation/types';
export * from './foundation/builders';
export * from './foundation/helpers';
export * from './foundation/states';
export { SurfaceErrorBoundary } from './foundation/SurfaceErrorBoundary';
export type { SurfaceErrorBoundaryProps } from './foundation/SurfaceErrorBoundary';

// Foundation: collection workspace contract + hook
export type {
  CollectionWorkspaceConfig,
  WorkspaceControlsConfig,
  CollectionBehaviorConfig,
  CollectionPresentationConfig,
  WorkspaceSearchConfig,
  WorkspaceScopesConfig,
  WorkspaceSavedViewsConfig,
  WorkspaceColumnSettingsConfig,
  WorkspaceDensityConfig,
  WorkspaceExportConfig,
  WorkspaceViewModeConfig,
  WorkspaceSelectionConfig,
  WorkspacePreviewRailConfig,
  WorkspaceFocusConfig,
  WorkspaceResponsiveConfig,
  WorkspaceActiveFiltersConfig,
  SmartSelectionSet,
  WorkspaceShellPresentationConfig,
  CollectionViewMode,
  CollectionKanbanConfig,
  CollectionCalendarConfig,
  CollectionGridConfig,
  CollectionGalleryConfig,
  CollectionCardsConfig,
  CollectionViewModeConfigs,
} from './foundation/contracts/collection';
export { useCollectionWorkspace } from './foundation/hooks/useCollectionWorkspace';

// Foundation: adaptive posture contract + hook
export type {
  AdaptiveConfig,
  SurfacePosture,
  CollectionPosture,
  FormSectionLayout,
  PanePosture,
  ActionBarPosture,
  FilterPosture,
  NavPosture,
  Breakpoint,
} from './foundation/contracts/adaptive';
export { resolvePosture, toBreakpoint } from './foundation/contracts/adaptive';
export { useAdaptivePosture } from './foundation/hooks/useAdaptivePosture';
export type { UseAdaptivePostureResult } from './foundation/hooks/useAdaptivePosture';

// -- Layout: page shells, headers, sidebars --
export * from './layout';

// -- Pages: all page-level surface configs --
export * from './pages';
