/**
 * Patterns Registry
 *
 * Catalog of all pattern components in the design system.
 * Grouped by: commerce, communication, customization, data, feedback, forms,
 * identity, navigation, shell, visualization, workflow.
 */

import { IMPLEMENTED_ENGINE_NAMES } from '@rottay/design-system';
import type { EngineName } from './primitives';

export type PatternGroup =
  | 'commerce'
  | 'communication'
  | 'customization'
  | 'data'
  | 'feedback'
  | 'forms'
  | 'identity'
  | 'navigation'
  | 'shell'
  | 'visualization'
  | 'workflow';

export interface PatternEntry {
  slug: string;
  name: string;
  group: PatternGroup;
  description: string;
  engines: EngineName[];
}

const allEngines: EngineName[] = [...IMPLEMENTED_ENGINE_NAMES];

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const data: PatternEntry[] = [
  { slug: 'data-table', name: 'PatternDataTable', group: 'data', description: 'Full-featured data table with sorting, filtering, pagination, selection, and virtual scrolling', engines: allEngines },
  { slug: 'bulk-select-toggle', name: 'BulkSelectToggle', group: 'data', description: 'Select-all toggle for bulk operations on table rows', engines: allEngines },
  // `cell-renderers` was retired as a catalog entry (owner ruling, 2026-08-12).
  // It never published a component: the public name was a `typeof` alias over a
  // record of render functions, so the page it generated advertised something a
  // reader could not render. The functions stay as support for the data table.
  { slug: 'column-settings', name: 'ColumnSettings', group: 'data', description: 'Column visibility and order configuration panel', engines: allEngines },
  { slug: 'decision-comparison', name: 'DecisionComparison', group: 'data', description: 'Dense aligned comparison table for a human decision, with the domain data owned by the caller', engines: allEngines },
  { slug: 'decision-panorama', name: 'DecisionPanorama', group: 'data', description: 'Balanced context / identity / active-decision composition for a record under review', engines: allEngines },
  { slug: 'detail-panel', name: 'DetailPanel', group: 'data', description: 'Expandable row detail panel for inline record preview', engines: allEngines },
  { slug: 'gallery-view', name: 'PatternGalleryView', group: 'data', description: 'Image-centric grid view with aspect ratio and captions', engines: allEngines },
  { slug: 'grid-view', name: 'PatternGridView', group: 'data', description: 'CSS grid card view with selection and pagination', engines: allEngines },
  { slug: 'file-manager', name: 'FileManager', group: 'data', description: 'File browser with tree navigation and preview', engines: allEngines },
  { slug: 'list-toolbar', name: 'ListToolbar', group: 'data', description: 'Toolbar for list-level actions and search', engines: allEngines },
  { slug: 'mono-stat', name: 'MonoStat', group: 'data', description: 'Single monospace figure that counts up on reveal, with the label supplied by the consumer', engines: allEngines },
  { slug: 'record-facts', name: 'RecordFacts', group: 'data', description: 'Read-only anatomy for dense business records: one section boundary, internal rhythm instead of nested cards', engines: allEngines },
  { slug: 'saved-views', name: 'SavedViews', group: 'data', description: 'Saved filter/sort presets management', engines: allEngines },
  { slug: 'stats-grid', name: 'PatternStatsGrid', group: 'data', description: 'Grid of statistic cards with trend indicators', engines: allEngines },
  { slug: 'status-filter-pills', name: 'StatusFilterPills', group: 'data', description: 'Horizontal pill bar for quick status filtering', engines: allEngines },
  { slug: 'virtual-list', name: 'PatternVirtualList', group: 'data', description: 'Windowed list of arbitrary items with variable heights and end-reached infinite loading', engines: allEngines },
  { slug: 'widget-board', name: 'WidgetBoard', group: 'data', description: 'Resizable widget grid with board-level empty and error states, and per-widget content owned by the caller', engines: allEngines },
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
  { slug: 'ascii-diagram', name: 'AsciiDiagram', group: 'visualization', description: 'Box-drawing diagram laid out on a monospace grid, with nodes placed by (col, row) and connectors routed between them', engines: allEngines },
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
  { slug: 'empty-state', name: 'EmptyState', group: 'feedback', description: 'Illustrated empty state with call-to-action', engines: allEngines },
  { slug: 'terminal-block', name: 'TerminalBlock', group: 'feedback', description: 'Terminal-style panel that streams lines at a token-governed cadence', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Commerce
// ---------------------------------------------------------------------------

const commerce: PatternEntry[] = [
  { slug: 'pricing-table', name: 'PricingTable', group: 'commerce', description: 'Plan comparison table with feature matrix', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Customization
// ---------------------------------------------------------------------------

const customization: PatternEntry[] = [
  { slug: 'pattern-brand-studio', name: 'PatternBrandStudio', group: 'customization', description: 'Bounded BrandTheme editor with a dual-ground live preview and inline WCAG contrast validation', engines: allEngines },
  { slug: 'branding-preview-sandbox', name: 'BrandingPreviewSandbox', group: 'customization', description: 'Live preview sandbox for brand theme changes', engines: allEngines },
  { slug: 'tenant-preview', name: 'TenantPreview', group: 'customization', description: 'Tenant branding preview card', engines: allEngines },
  { slug: 'token-inspector', name: 'TokenInspector', group: 'customization', description: 'Developer tool for inspecting active design tokens', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

const identity: PatternEntry[] = [
  { slug: 'user-profile-card', name: 'UserProfileCard', group: 'identity', description: 'Compact user profile card with avatar and actions', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

const shell: PatternEntry[] = [
  { slug: 'cockpit-header', name: 'CockpitHeader', group: 'shell', description: 'Dense header for operational dashboards', engines: allEngines },
  { slug: 'feature-workspace-frame', name: 'FeatureWorkspaceFrame', group: 'shell', description: 'Feature-level placement only: responsive gutters, a navigation lane, and a stable content boundary', engines: allEngines },
  { slug: 'page-shell', name: 'PatternPageShell', group: 'shell', description: 'Page-level shell with sidebar and header slots', engines: allEngines },
  { slug: 'workbench-header', name: 'WorkbenchHeader', group: 'shell', description: 'Header for workbench-style pages with tabs and actions', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const patterns: PatternEntry[] = [
  ...commerce,
  ...communication,
  ...customization,
  ...data,
  ...feedback,
  ...forms,
  ...identity,
  ...navigation,
  ...shell,
  ...visualization,
  ...workflow,
];

export const patternsByGroup: Record<PatternGroup, PatternEntry[]> = {
  commerce,
  communication,
  customization,
  data,
  feedback,
  forms,
  identity,
  navigation,
  shell,
  visualization,
  workflow,
};

export const patternGroups: { slug: PatternGroup; label: string; count: number }[] = [
  { slug: 'commerce', label: 'Commerce', count: commerce.length },
  { slug: 'communication', label: 'Communication', count: communication.length },
  { slug: 'customization', label: 'Customization', count: customization.length },
  { slug: 'data', label: 'Data', count: data.length },
  { slug: 'feedback', label: 'Feedback', count: feedback.length },
  { slug: 'forms', label: 'Forms', count: forms.length },
  { slug: 'identity', label: 'Identity', count: identity.length },
  { slug: 'navigation', label: 'Navigation', count: navigation.length },
  { slug: 'shell', label: 'Shell', count: shell.length },
  { slug: 'visualization', label: 'Visualization', count: visualization.length },
  { slug: 'workflow', label: 'Workflow', count: workflow.length },
];
