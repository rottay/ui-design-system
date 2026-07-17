/**
 * @fileoverview Surface barrel exports — the page-level API layer of the
 * Rottay Design System.
 *
 * Surfaces are organized into four dependency-ordered layers:
 *
 * 1. **Foundation** (`foundation/`) — stable surface contracts.
 * 2. **Runtime** (`runtime/`) — builders, helpers, state, responsive and
 *    profile-default behavior that consumes those contracts.
 * 3. **Composition** (`composition/`) — reusable page chrome and layouts.
 * 4. **Presentation** (`presentation/`) — complete page surfaces organized
 *    into domain-aligned subgroups.
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

// -- Foundation contracts --
export * from './foundation/contracts';

// -- Runtime builders, helpers, hooks, states, and profile defaults --
export * from './runtime/builders';
export * from './runtime/helpers';
export * from './runtime/helpers/states';
export { SurfaceErrorBoundary } from './runtime/error-boundary';
export type { SurfaceErrorBoundaryProps } from './runtime/error-boundary';

// Collection workspace contract + runtime hook
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
  WorkspacePreviewRenderContext,
  WorkspaceFocusConfig,
  WorkspaceCellEditingConfig,
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
} from './foundation/contracts/adaptive/collection';
export { useCollectionWorkspace } from './runtime/collection-workspace';

// Adaptive posture contract + runtime hook
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
export { useAdaptivePosture } from './runtime/adaptive-posture';
export type { UseAdaptivePostureResult } from './runtime/adaptive-posture';

// Runtime surface lifecycle state machine hook
export { useSurfaceState } from './runtime/helpers/states/i18n/components/use-surface-state';
export type {
  SurfaceState,
  SurfaceStateRenderConfig,
  UseSurfaceStateOptions,
  UseSurfaceStateReturn,
} from './runtime/helpers/states/i18n/components/use-surface-state';

// Runtime profile defaults + per-surface override hook
export {
  useSurfaceProfileDefaults,
  normalizeSurfaceDensity,
  resolveListCardMinWidth,
  resolveSurfaceTabsType,
} from './runtime/profile-defaults';
export type {
  ResolvedSurfaceProfileDefaults,
  SurfaceDensity,
  SurfaceSectionSpacing,
} from './runtime/profile-defaults';
/**
 * @deprecated Experimental isolated helper. No production surface consumes
 * visual.profileOverrides; DS-IMP-022 owns wiring/removal.
 */
export { useSurfaceProfileDefaultsWithOverrides } from './runtime/profile-defaults/overrides';

// -- Composition: page shells, headers, sidebars --
export * from './composition/layout';

// -- Presentation: all page-level surface configs --
export * from './presentation/pages';
