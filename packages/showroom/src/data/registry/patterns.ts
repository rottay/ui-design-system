/**
 * Patterns Registry
 *
 * Catalog of all pattern components in the design system.
 * Grouped by: data, forms, visualization, communication, workflow, navigation, misc.
 */

import type { EngineName } from './primitives';

export type PatternGroup =
  | 'data'
  | 'forms'
  | 'visualization'
  | 'communication'
  | 'workflow'
  | 'navigation'
  | 'feedback'
  | 'misc';

export interface PatternEntry {
  slug: string;
  name: string;
  group: PatternGroup;
  description: string;
  engines: EngineName[];
}

const allEngines: EngineName[] = ['classic', 'modern', 'rustic'];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const data: PatternEntry[] = [
  { slug: 'data-table', name: 'PatternDataTable', group: 'data', description: 'Full-featured data table with sorting, filtering, pagination, selection, and virtual scrolling', engines: allEngines },
  { slug: 'bulk-select-toggle', name: 'BulkSelectToggle', group: 'data', description: 'Select-all toggle for bulk operations on table rows', engines: allEngines },
  { slug: 'cell-renderers', name: 'CellRenderers', group: 'data', description: 'Typed cell renderers for common column types (text, number, date, status, actions)', engines: allEngines },
  { slug: 'column-settings', name: 'ColumnSettings', group: 'data', description: 'Column visibility and order configuration panel', engines: allEngines },
  { slug: 'detail-panel', name: 'DetailPanel', group: 'data', description: 'Expandable row detail panel for inline record preview', engines: allEngines },
  { slug: 'gallery-view', name: 'PatternGalleryView', group: 'data', description: 'Image-centric grid view with aspect ratio and captions', engines: allEngines },
  { slug: 'grid-view', name: 'PatternGridView', group: 'data', description: 'CSS grid card view with selection and pagination', engines: allEngines },
  { slug: 'list-toolbar', name: 'ListToolbar', group: 'data', description: 'Toolbar for list-level actions and search', engines: allEngines },
  { slug: 'saved-views', name: 'SavedViews', group: 'data', description: 'Saved filter/sort presets management', engines: allEngines },
  { slug: 'stats-grid', name: 'PatternStatsGrid', group: 'data', description: 'Grid of statistic cards with trend indicators', engines: allEngines },
  { slug: 'status-filter-pills', name: 'StatusFilterPills', group: 'data', description: 'Horizontal pill bar for quick status filtering', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

const forms: PatternEntry[] = [
  { slug: 'form-builder', name: 'PatternFormBuilder', group: 'forms', description: 'Declarative form generator from field configuration', engines: allEngines },
  { slug: 'filter-builder', name: 'FilterBuilder', group: 'forms', description: 'Dynamic filter rule builder with custom operators', engines: allEngines },
  { slug: 'filter-panel', name: 'FilterPanel', group: 'forms', description: 'Collapsible panel housing filter controls', engines: allEngines },
  { slug: 'invoice-template', name: 'InvoiceTemplate', group: 'forms', description: 'Structured invoice form with line items and totals', engines: allEngines },
  { slug: 'step-wizard', name: 'StepWizard', group: 'forms', description: 'Multi-step form wizard with validation per step', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Visualization
// ---------------------------------------------------------------------------

const visualization: PatternEntry[] = [
  { slug: 'calendar-view', name: 'PatternCalendarView', group: 'visualization', description: 'Month/week/day calendar view for scheduling data', engines: allEngines },
  { slug: 'kanban-board', name: 'PatternKanbanBoard', group: 'visualization', description: 'Drag-and-drop kanban board with configurable lanes', engines: allEngines },
  { slug: 'map-view', name: 'PatternMapView', group: 'visualization', description: 'Geographic map view with markers and clusters', engines: allEngines },
  { slug: 'timeline', name: 'PatternTimeline', group: 'visualization', description: 'Horizontal or vertical timeline of events', engines: allEngines },
  { slug: 'tree-view', name: 'PatternTreeView', group: 'visualization', description: 'Interactive tree view with expand, collapse, and selection', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Communication
// ---------------------------------------------------------------------------

const communication: PatternEntry[] = [
  { slug: 'activity-log', name: 'ActivityLog', group: 'communication', description: 'Chronological feed of user and system activity', engines: allEngines },
  { slug: 'assistant', name: 'Assistant', group: 'communication', description: 'AI chat assistant panel with message history', engines: allEngines },
  { slug: 'comment-thread', name: 'CommentThread', group: 'communication', description: 'Threaded comment discussion with replies', engines: allEngines },
  { slug: 'live-feed', name: 'LiveFeed', group: 'communication', description: 'Real-time event feed with streaming updates', engines: allEngines },
  { slug: 'notification-center', name: 'NotificationCenter', group: 'communication', description: 'Notification inbox with read/unread and categories', engines: allEngines },
  { slug: 'presence', name: 'Presence', group: 'communication', description: 'Online presence indicators and typing status', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Workflow
// ---------------------------------------------------------------------------

const workflow: PatternEntry[] = [
  { slug: 'approval-inbox', name: 'ApprovalInbox', group: 'workflow', description: 'Inbox for pending approval requests', engines: allEngines },
  { slug: 'approval-workflow', name: 'ApprovalWorkflow', group: 'workflow', description: 'Visual approval chain with status tracking', engines: allEngines },
  { slug: 'moderation-gallery', name: 'ModerationGallery', group: 'workflow', description: 'Content moderation gallery with approve/reject actions', engines: allEngines },
  { slug: 'operational-ledger', name: 'OperationalLedger', group: 'workflow', description: 'Tabular ledger for operational transactions', engines: allEngines },
  { slug: 'shift-matrix', name: 'ShiftMatrix', group: 'workflow', description: 'Staff scheduling matrix with drag assignment', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

const navigation: PatternEntry[] = [
  { slug: 'command-palette', name: 'CommandPalette', group: 'navigation', description: 'Keyboard-driven command launcher (Cmd+K)', engines: allEngines },
  { slug: 'environment-toggle', name: 'EnvironmentToggle', group: 'navigation', description: 'Dev/staging/production environment switcher', engines: allEngines },
  { slug: 'locale-switcher', name: 'PatternLocaleSwitcher', group: 'navigation', description: 'Language and locale selector with flag icons', engines: allEngines },
  { slug: 'shortcuts-overlay', name: 'ShortcutsOverlay', group: 'navigation', description: 'Full-screen keyboard shortcuts reference overlay', engines: allEngines },
  { slug: 'workspace-switcher', name: 'WorkspaceSwitcher', group: 'navigation', description: 'Multi-workspace or multi-tenant switcher', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

const feedback: PatternEntry[] = [
  { slug: 'adaptive-overlay', name: 'AdaptiveOverlay', group: 'feedback', description: 'Responsive feedback flow that selects modal, drawer, or sheet posture', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

const misc: PatternEntry[] = [
  { slug: 'branding-preview-sandbox', name: 'BrandingPreviewSandbox', group: 'misc', description: 'Live preview sandbox for brand theme changes', engines: allEngines },
  { slug: 'cockpit-header', name: 'CockpitHeader', group: 'misc', description: 'Dense header for operational dashboards', engines: allEngines },
  { slug: 'empty-state', name: 'EmptyState', group: 'misc', description: 'Illustrated empty state with call-to-action', engines: allEngines },
  { slug: 'file-manager', name: 'FileManager', group: 'misc', description: 'File browser with tree navigation and preview', engines: allEngines },
  { slug: 'page-shell', name: 'PageShell', group: 'misc', description: 'Page-level shell with sidebar and header slots', engines: allEngines },
  { slug: 'pricing-table', name: 'PricingTable', group: 'misc', description: 'Plan comparison table with feature matrix', engines: allEngines },
  { slug: 'tenant-preview', name: 'TenantPreview', group: 'misc', description: 'Tenant branding preview card', engines: allEngines },
  { slug: 'token-inspector', name: 'TokenInspector', group: 'misc', description: 'Developer tool for inspecting active design tokens', engines: allEngines },
  { slug: 'user-profile-card', name: 'UserProfileCard', group: 'misc', description: 'Compact user profile card with avatar and actions', engines: allEngines },
  { slug: 'workbench-header', name: 'WorkbenchHeader', group: 'misc', description: 'Header for workbench-style pages with tabs and actions', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const patterns: PatternEntry[] = [
  ...data,
  ...forms,
  ...visualization,
  ...communication,
  ...workflow,
  ...navigation,
  ...feedback,
  ...misc,
];

export const patternsByGroup: Record<PatternGroup, PatternEntry[]> = {
  data,
  forms,
  visualization,
  communication,
  workflow,
  navigation,
  feedback,
  misc,
};

export const patternGroups: { slug: PatternGroup; label: string; count: number }[] = [
  { slug: 'data', label: 'Data', count: data.length },
  { slug: 'forms', label: 'Forms', count: forms.length },
  { slug: 'visualization', label: 'Visualization', count: visualization.length },
  { slug: 'communication', label: 'Communication', count: communication.length },
  { slug: 'workflow', label: 'Workflow', count: workflow.length },
  { slug: 'navigation', label: 'Navigation', count: navigation.length },
  { slug: 'feedback', label: 'Feedback', count: feedback.length },
  { slug: 'misc', label: 'Misc', count: misc.length },
];
