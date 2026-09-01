/**
 * @fileoverview Surface barrel exports — the page-level API layer of the
 * Rottay Design System.
 *
 * Surfaces are organized into three dependency-ordered layers:
 *
 * 1. **Foundation** (`foundation/`) — stable surface contracts.
 * 2. **Runtime** (`runtime/`) — builders, helpers, state, responsive and
 *    profile-default behavior that consumes those contracts.
 * 3. **Presentation** (`presentation/`) — complete page surfaces organized
 *    into domain-aligned subgroups.
 *
 * A surface is a whole-screen recipe, so every public component published from
 * here lives under `presentation/pages/`. There is deliberately no
 * `composition/` root: composition is a dependency role inside an owner, not a
 * physical taxonomy for a family, so it may not name the folder a family lives
 * in. Shared internal support belongs in `foundation/`.
 *
 * Page chrome is not a surface. `WorkspaceShell` was briefly published from a
 * `workspace/` family root here; it is a layout shell, so it now lives at
 * `structures/shell/workspace-shell` with the other shells, and the surfaces
 * contract barrel re-exports its config types from that owner.
 *
 * @example
 * ```ts
 * import {
 *   createFormSurfaceConfig,
 *   FormSurface,
 *   type FormSurfaceConfig,
 * } from '@rottay/design-system';
 * ```
 */

// -- Foundation contracts --
export * from './foundation/contracts';

// -- Runtime builders, helpers, hooks, states, and profile defaults --
//
// Several lines below export from `../structures/foundation/chrome/*`. That
// chrome cluster -- profile defaults, responsive posture and translations --
// moved down to the structures tier along with `PageShellSurface`,
// `HeaderSurface` and `SidebarSurface`, which are page chrome rather than page
// recipes and therefore may not import from surfaces. What remains here is
// support vocabulary with no rendered product of its own, so this barrel stays
// its public path and the package exports exactly the names it exported
// before the move. Surfaces consuming a lower tier is the intended dependency
// direction.
//
// `SurfaceActionBar`, `SurfaceTabbedLabel` and `SurfaceSectionCard` are NOT
// re-exported here any more. They were the one renderable product this barrel
// was publishing out of a support owner, which left three public components
// that no taxonomy row could claim. They are now the composite
// `structure/shell/surface-chrome` family and reach the package root through
// `../structures`, like every other structure. The exported names are
// unchanged, so `@rottay/design-system` consumers see no difference.
//
// The lifecycle states, `useSurfaceState` and `SurfaceErrorBoundary` are NOT
// re-exported here any more either. They are the `structure/feedback/
// surface-lifecycle` family and reach the package root through `../structures`
// like every other structure. `runtime/helpers/states` and
// `runtime/error-boundary` are gone -- no shim replaced them, because a
// support path re-exporting a structure is exactly the arrangement that let
// the lifecycle ship twice under two vocabularies.
export * from './runtime/builders';
export * from './runtime/helpers';

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

// Runtime profile defaults + per-surface override hook
export {
  useSurfaceProfileDefaults,
  normalizeSurfaceDensity,
  resolveListCardMinWidth,
  resolveSurfaceTabsType,
} from '../structures/foundation/chrome/runtime/profile-defaults';
export type {
  ResolvedSurfaceProfileDefaults,
  SurfaceDensity,
  SurfaceSectionSpacing,
} from '../structures/foundation/chrome/runtime/profile-defaults';
export { useSurfaceProfileDefaultsWithOverrides } from '../structures/foundation/chrome/runtime/profile-defaults/overrides';

// -- Presentation: all page-level surface configs --
export * from './presentation/pages';
