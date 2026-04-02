/**
 * @fileoverview Surface barrel exports -- the page-level API layer of the Rottay Design System.
 *
 * @description Apps should prefer surfaces for page composition instead of pushing
 * vertical-specific components into `custom/`. Surfaces combine patterns, primitives,
 * profile defaults, and permission helpers so app pages stay mostly declarative.
 *
 * The surface layer is organized into three tiers of exports:
 *
 * 1. **Foundation** (types, builders, helpers, responsive, i18n, profile-defaults):
 *    Shared types, identity builders for type inference, permission helpers,
 *    responsive layout utilities, translation scope, and profile default resolution.
 *
 * 2. **Layout shells** (page-shell, header, sidebar):
 *    Structural wrappers that provide consistent page chrome, header navigation,
 *    and sidebar layouts used by other surfaces.
 *
 * 3. **Page surfaces** (list, dashboard, detail, form, wizard, chat, etc.):
 *    Complete page-level components. Each surface accepts a strongly-typed config
 *    object following the visual/presentation/behavior/permissions structure.
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

// -- Foundation: types, builders, helpers --
export * from './types';
export * from './builders';
export * from './helpers';

// -- Layout shells: page chrome, header, sidebar --
export * from './page-shell';
export * from './header';
export * from './sidebar';

// -- Data surfaces: lists, dashboards, details --
export * from './list';
export * from './dashboard';
export * from './detail';

// -- Form surfaces: forms, wizards, detail-forms --
export * from './form';
export * from './detail-form';
export * from './wizard';

// -- Content surfaces: visualization, search, editor, media --
export * from './visualization';
export * from './search';
export * from './editor';
export * from './media';

// -- Communication surfaces: chat, notification --
export * from './chat';
export * from './notification';

// -- Scheduling & project surfaces: scheduler, kanban, activity --
export * from './scheduler';
export * from './kanban';
export * from './activity';

// -- Comparison & pricing surfaces --
export * from './compare';
export * from './pricing';

// -- Auth & onboarding surfaces --
export * from './auth';
export * from './marketing';
export * from './onboarding';
export * from './empty-state';

// -- Decision & triage surfaces --
export { DecisionInboxSurface } from './decision-inbox';
export type { DecisionInboxSurfaceProps, DecisionAction } from './decision-inbox';

// -- Command & dashboard surfaces --
export { CommandCenterSurface } from './command-center';
export type { CommandCenterSurfaceProps, QuickAction, CommandSection, InsightItem } from './command-center';
export type { StatItem as CommandStatItem } from './command-center';

// -- Record & detail surfaces --
export { RecordWorkbenchSurface } from './record-workbench';
export type { RecordWorkbenchSurfaceProps, RecordTab, RecordAction, MetadataField } from './record-workbench';

// -- Form & draft surfaces --
export { GuidedDraftFormSurface } from './guided-draft-form';
export type { GuidedDraftFormSurfaceProps, FormSection, FormTemplate, ValidationIssue, DraftStatus } from './guided-draft-form';

// -- Settings & administration surfaces --
export * from './settings';
export * from './audit';
export * from './billing';
export * from './profile';
export * from './team';

// -- Integration & data management surfaces --
export * from './integration';
export * from './import-export';
export * from './report';
export * from './file-browser';

// -- Collection workspace: unified collection screen with shared spine --
export { CollectionWorkspaceSurface } from './collection-workspace';
export type { CollectionWorkspaceSurfaceProps } from './collection-workspace';
export type {
  CollectionWorkspaceConfig,
  WorkspaceControlsConfig,
  CollectionBehaviorConfig,
  CollectionPresentationConfig,
  WorkspaceSearchConfig,
  WorkspaceSavedViewsConfig,
  WorkspaceColumnSettingsConfig,
  WorkspaceDensityConfig,
  WorkspaceExportConfig,
  WorkspaceViewModeConfig,
  WorkspaceSelectionConfig,
  WorkspacePreviewRailConfig,
  WorkspaceResponsiveConfig,
} from './contracts/collection';
export { useCollectionWorkspace } from './hooks/useCollectionWorkspace';

// -- Operational surfaces: control rooms, monitoring --
export * from './operational';

// -- Shared surface states (loading, error, etc.) --
export * from './states';

// -- Surface error boundary (isolates individual surface crashes) --
export { SurfaceErrorBoundary } from './SurfaceErrorBoundary';
export type { SurfaceErrorBoundaryProps } from './SurfaceErrorBoundary';
