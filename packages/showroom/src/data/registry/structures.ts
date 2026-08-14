/**
 * Structures Registry
 *
 * Catalog of all structure components in the design system.
 * Grouped by: headers, workspace, record, dashboard, feedback.
 */

import type { EngineName } from './primitives';

export type StructureGroup =
  | 'headers'
  | 'workspace'
  | 'record'
  | 'dashboard'
  | 'feedback'
  | 'shell';

export interface StructureEntry {
  slug: string;
  name: string;
  group: StructureGroup;
  description: string;
  engines: EngineName[];
}

const allEngines: EngineName[] = ['classic', 'modern', 'rustic'];

// ---------------------------------------------------------------------------
// Headers
// ---------------------------------------------------------------------------

const headers: StructureEntry[] = [
  { slug: 'mobile-header', name: 'MobileHeader', group: 'headers', description: 'Compact page header adapted to mobile navigation and actions', engines: allEngines },
  { slug: 'collection-header', name: 'CollectionHeader', group: 'headers', description: 'Header for collection/list pages with title, count, and actions', engines: allEngines },
  { slug: 'dashboard-header', name: 'DashboardHeader', group: 'headers', description: 'Header for dashboard pages with date range and refresh', engines: allEngines },
  { slug: 'detail-header', name: 'DetailHeader', group: 'headers', description: 'Header for detail/record pages with breadcrumb and status', engines: allEngines },
  { slug: 'edit-header', name: 'EditHeader', group: 'headers', description: 'Header for edit pages with save/cancel actions', engines: allEngines },
  { slug: 'form-header', name: 'FormHeader', group: 'headers', description: 'Header for form pages with step indicator and submit', engines: allEngines },
  { slug: 'header-surface', name: 'HeaderSurface', group: 'headers', description: 'Title/breadcrumb chrome with optional tabs, for pages that need strong headers without heavier surface mechanics', engines: allEngines },
  { slug: 'section-frame', name: 'SectionFrame', group: 'headers', description: 'Numbered section boundary with a mono [01] marker and a heading level that keeps the document outline correct', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

const workspace: StructureEntry[] = [
  { slug: 'action-dock', name: 'ActionDock', group: 'workspace', description: 'Responsive workspace dock for persistent primary actions', engines: allEngines },
  { slug: 'active-filters-bar', name: 'ActiveFiltersBar', group: 'workspace', description: 'Horizontal bar displaying active filter chips with clear action', engines: allEngines },
  { slug: 'column-menu', name: 'ColumnMenu', group: 'workspace', description: 'Column visibility, pinning, width, and group configuration menu', engines: allEngines },
  { slug: 'connected-command-palette', name: 'ConnectedCommandPalette', group: 'workspace', description: 'Registry-backed command palette that reads its commands from the global command registry', engines: allEngines },
  { slug: 'export-button', name: 'ExportButton', group: 'workspace', description: 'Export data to CSV, JSON, or clipboard', engines: allEngines },
  { slug: 'field-filters-panel', name: 'FieldFiltersPanel', group: 'workspace', description: 'Panel with per-field filter controls', engines: allEngines },
  { slug: 'saved-views-menu', name: 'SavedViewsMenu', group: 'workspace', description: 'Dropdown menu for selecting and managing saved views', engines: allEngines },
  { slug: 'scope-switcher', name: 'ScopeSwitcher', group: 'workspace', description: 'Scope selector for switching data context (team, org, etc.)', engines: allEngines },
  { slug: 'search-command-bar', name: 'SearchCommandBar', group: 'workspace', description: 'Unified search bar with command palette integration', engines: allEngines },
  { slug: 'selection-preview-rail', name: 'SelectionPreviewRail', group: 'workspace', description: 'Side rail previewing selected rows with bulk actions', engines: allEngines },
  { slug: 'table-toolbar', name: 'TableToolbar', group: 'workspace', description: 'Toolbar above the table with search, filters, and view options', engines: allEngines },
  { slug: 'view-mode-switcher', name: 'ViewModeSwitcher', group: 'workspace', description: 'Segmented control for switching collection view modes', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Record
// ---------------------------------------------------------------------------

// This group used to open with a generic entry slugged "record" and named
// "Record", standing in for the whole family. No such component exists: it
// resolved to no family row, and the five real components it stood in front of
// were each missing from the catalog. It is replaced by those five, not
// supplemented by them.
//
// (Spelled out in prose deliberately. The parity gate reads these registries
// with a regex that does not strip comments, so writing the old entry here in
// its literal object form re-registered the phantom slug from inside a comment
// explaining that it was removed.)
const record: StructureEntry[] = [
  { slug: 'record-action-bar', name: 'RecordActionBar', group: 'record', description: 'Action rail that closes a record page, with an optional meta slot and either free-form actions or a structured action list', engines: allEngines },
  { slug: 'record-field', name: 'RecordField', group: 'record', description: 'Single read-only field: label, value, optional helper and copy action, monospace mode for IDs, plus loading and error states', engines: allEngines },
  { slug: 'record-field-grid', name: 'RecordFieldGrid', group: 'record', description: 'CSS-grid wrapper that lays out RecordField cards; grid-template-columns is its only inline value', engines: allEngines },
  { slug: 'record-panel', name: 'RecordPanel', group: 'record', description: 'Generic container record pages use to group unrelated content — frame, padding, and elevation, deliberately no behavior', engines: allEngines },
  { slug: 'record-summary-strip', name: 'RecordSummaryStrip', group: 'record', description: 'Summary card at the top of a record page rendering label/value/helper triples in five visual variants', engines: allEngines },
  { slug: 'form-sections', name: 'FormSections', group: 'record', description: 'Grouped form sections with collapsible panels', engines: allEngines },
  { slug: 'edit-fields', name: 'EditFields', group: 'record', description: 'Single-surface record edit chrome: numbered fields, primary/advanced disclosure, and a save/cancel footer', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

const dashboard: StructureEntry[] = [
  { slug: 'stats-header', name: 'StatsHeader', group: 'dashboard', description: 'Row of key metric cards at the top of a dashboard', engines: allEngines },
  { slug: 'data-terminal-card', name: 'DataTerminalCard', group: 'dashboard', description: 'Terminal-style card for raw data display', engines: allEngines },
  { slug: 'dashboard-insights', name: 'DashboardInsights', group: 'dashboard', description: 'Insights panel with AI-generated observations and metrics', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Feedback
// ---------------------------------------------------------------------------

const feedback: StructureEntry[] = [
  { slug: 'capability-anatomy', name: 'SurfaceCapabilityAnatomy', group: 'feedback', description: 'Renders which capabilities a surface registered and which of them actually resolved, so a misconfigured screen reports itself', engines: allEngines },
  { slug: 'loading-overlay', name: 'LoadingOverlay', group: 'feedback', description: 'Full-area loading overlay with spinner and message', engines: allEngines },
  { slug: 'surface-lifecycle', name: 'SurfaceLifecycle', group: 'feedback', description: 'Everything a surface shows when it is not showing content: the five lifecycle states, the state machine that picks one, and the boundary that catches a crash', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

const shell: StructureEntry[] = [
  { slug: 'app-shell', name: 'AppShell', group: 'shell', description: 'Application shell: sidebar, header, and content with controlled or uncontrolled desktop collapse', engines: allEngines },
  { slug: 'bottom-tab-bar', name: 'BottomTabBar', group: 'shell', description: 'Mobile shell navigation bar with active, icon, badge, and label states', engines: allEngines },
  { slug: 'page-shell-surface', name: 'PageShellSurface', group: 'shell', description: 'Lowest-level page wrapper around PatternPageShell, and the base other surfaces build on', engines: allEngines },
  { slug: 'sidebar-surface', name: 'SidebarSurface', group: 'shell', description: 'Collapsible sidebar layout shell for app shells, admin workspaces, and split-pane pages', engines: allEngines },
  { slug: 'surface-chrome', name: 'SurfaceChrome', group: 'shell', description: 'The small chrome a surface renders inside a shell frame: closing action bar, tabbed label, and section card', engines: allEngines },
  { slug: 'workspace-shell', name: 'WorkspaceShell', group: 'shell', description: 'Continuous atmospheric shell that makes headers, command bars, controls, and table-top read as one tool', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Aggregate
// ---------------------------------------------------------------------------

export const structures: StructureEntry[] = [
  ...headers,
  ...workspace,
  ...record,
  ...dashboard,
  ...feedback,
  ...shell,
];

export const structuresByGroup: Record<StructureGroup, StructureEntry[]> = {
  headers,
  workspace,
  record,
  dashboard,
  feedback,
  shell,
};

export const structureGroups: { slug: StructureGroup; label: string; count: number }[] = [
  { slug: 'headers', label: 'Headers', count: headers.length },
  { slug: 'workspace', label: 'Workspace', count: workspace.length },
  { slug: 'record', label: 'Record', count: record.length },
  { slug: 'dashboard', label: 'Dashboard', count: dashboard.length },
  { slug: 'feedback', label: 'Feedback', count: feedback.length },
  { slug: 'shell', label: 'Shell', count: shell.length },
];
