/**
 * Surfaces Registry
 *
 * Catalog of all surface page recipes in the design system.
 * Surfaces are grouped by domain: admin, data, experience, forms, operations, workspace.
 */

import type { EngineName } from './primitives';

export type SurfaceGroup =
  | 'admin'
  | 'data'
  | 'experience'
  | 'forms'
  | 'operations'
  | 'workspace';

export interface SurfaceEntry {
  slug: string;
  name: string;
  group: SurfaceGroup;
  description: string;
  engines: EngineName[];
}

const allEngines: EngineName[] = ['classic', 'modern', 'rustic'];

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

const admin: SurfaceEntry[] = [
  { slug: 'audit', name: 'AuditSurface', group: 'admin', description: 'Audit log viewer with filtering and export', engines: allEngines },
  { slug: 'billing', name: 'BillingSurface', group: 'admin', description: 'Billing dashboard with subscription and invoice management', engines: allEngines },
  { slug: 'file-browser', name: 'FileBrowserSurface', group: 'admin', description: 'File system browser with tree navigation', engines: allEngines },
  { slug: 'import-export', name: 'ImportExportSurface', group: 'admin', description: 'Data import and export wizard', engines: allEngines },
  { slug: 'integration', name: 'IntegrationSurface', group: 'admin', description: 'Third-party integration catalog and configuration', engines: allEngines },
  { slug: 'profile', name: 'ProfileSurface', group: 'admin', description: 'User profile page with settings and activity', engines: allEngines },
  { slug: 'settings', name: 'SettingsSurface', group: 'admin', description: 'Settings page with grouped form sections', engines: allEngines },
  { slug: 'team', name: 'TeamSurface', group: 'admin', description: 'Team management with roles and invitations', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const data: SurfaceEntry[] = [
  { slug: 'compare', name: 'CompareSurface', group: 'data', description: 'Side-by-side comparison of records or versions', engines: allEngines },
  { slug: 'dashboard', name: 'DashboardSurface', group: 'data', description: 'Metrics dashboard with charts and stat cards', engines: allEngines },
  { slug: 'detail', name: 'DetailSurface', group: 'data', description: 'Single record detail view with tabs and related data', engines: allEngines },
  { slug: 'list', name: 'ListSurface', group: 'data', description: 'Paginated list view with search, filter, sort, and bulk actions', engines: allEngines },
  { slug: 'report', name: 'ReportSurface', group: 'data', description: 'Report page with charts, tables, and export', engines: allEngines },
  { slug: 'search', name: 'SearchSurface', group: 'data', description: 'Full-text search results page with faceted filters', engines: allEngines },
  { slug: 'visualization', name: 'VisualizationSurface', group: 'data', description: 'Data visualization page with chart configurator', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Experience
// ---------------------------------------------------------------------------

const experience: SurfaceEntry[] = [
  { slug: 'auth', name: 'AuthSurface', group: 'experience', description: 'Authentication pages (login, register, forgot password)', engines: allEngines },
  { slug: 'chat', name: 'ChatSurface', group: 'experience', description: 'Chat interface with message history and input', engines: allEngines },
  { slug: 'editor', name: 'EditorSurface', group: 'experience', description: 'Rich content editor with toolbar and preview', engines: allEngines },
  { slug: 'empty-state', name: 'EmptyStateSurface', group: 'experience', description: 'Full-page empty state with illustration and CTA', engines: allEngines },
  { slug: 'marketing', name: 'MarketingSurface', group: 'experience', description: 'Marketing landing page layout', engines: allEngines },
  { slug: 'media', name: 'MediaSurface', group: 'experience', description: 'Media gallery with lightbox and metadata', engines: allEngines },
  { slug: 'notification', name: 'NotificationSurface', group: 'experience', description: 'Notification center page with preferences', engines: allEngines },
  { slug: 'onboarding', name: 'OnboardingSurface', group: 'experience', description: 'Guided onboarding flow with checklist', engines: allEngines },
  { slug: 'pricing', name: 'PricingSurface', group: 'experience', description: 'Pricing page with plan comparison and checkout', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

const forms: SurfaceEntry[] = [
  { slug: 'detail-form', name: 'DetailFormSurface', group: 'forms', description: 'Combined detail view with inline editable form', engines: allEngines },
  { slug: 'form', name: 'FormSurface', group: 'forms', description: 'Full-page form with sections and validation', engines: allEngines },
  { slug: 'guided-draft-form', name: 'GuidedDraftFormSurface', group: 'forms', description: 'Step-by-step draft creation form with AI assistance', engines: allEngines },
  { slug: 'wizard', name: 'WizardSurface', group: 'forms', description: 'Multi-step wizard with progress and review', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

const operations: SurfaceEntry[] = [
  { slug: 'activity', name: 'ActivitySurface', group: 'operations', description: 'Activity feed page with filters and timeline', engines: allEngines },
  { slug: 'kanban', name: 'KanbanSurface', group: 'operations', description: 'Kanban board page with lane management', engines: allEngines },
  { slug: 'operational', name: 'OperationalSurface', group: 'operations', description: 'Operational dashboard with real-time metrics', engines: allEngines },
  { slug: 'scheduler', name: 'SchedulerSurface', group: 'operations', description: 'Calendar/schedule management page', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

const workspace: SurfaceEntry[] = [
  { slug: 'collection-workspace', name: 'CollectionWorkspaceSurface', group: 'workspace', description: 'Multi-view collection workspace with table, cards, kanban, gallery, and calendar modes', engines: allEngines },
  { slug: 'command-center', name: 'CommandCenterSurface', group: 'workspace', description: 'Operator command center with panels and quick actions', engines: allEngines },
  { slug: 'decision-inbox', name: 'DecisionInboxSurface', group: 'workspace', description: 'Decision queue with review and approve/reject workflow', engines: allEngines },
  { slug: 'record-workbench', name: 'RecordWorkbenchSurface', group: 'workspace', description: 'Record editing workbench with tools and preview', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const surfaces: SurfaceEntry[] = [
  ...admin,
  ...data,
  ...experience,
  ...forms,
  ...operations,
  ...workspace,
];

export const surfacesByGroup: Record<SurfaceGroup, SurfaceEntry[]> = {
  admin,
  data,
  experience,
  forms,
  operations,
  workspace,
};

export const surfaceGroups: { slug: SurfaceGroup; label: string; count: number }[] = [
  { slug: 'admin', label: 'Admin', count: admin.length },
  { slug: 'data', label: 'Data', count: data.length },
  { slug: 'experience', label: 'Experience', count: experience.length },
  { slug: 'forms', label: 'Forms', count: forms.length },
  { slug: 'operations', label: 'Operations', count: operations.length },
  { slug: 'workspace', label: 'Workspace', count: workspace.length },
];
