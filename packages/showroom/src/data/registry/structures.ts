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
];

// ---------------------------------------------------------------------------
// Workspace
// ---------------------------------------------------------------------------

const workspace: StructureEntry[] = [
  { slug: 'action-dock', name: 'ActionDock', group: 'workspace', description: 'Responsive workspace dock for persistent primary actions', engines: allEngines },
  { slug: 'active-filters-bar', name: 'ActiveFiltersBar', group: 'workspace', description: 'Horizontal bar displaying active filter chips with clear action', engines: allEngines },
  { slug: 'column-menu', name: 'ColumnMenu', group: 'workspace', description: 'Column visibility, pinning, width, and group configuration menu', engines: allEngines },
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

const record: StructureEntry[] = [
  { slug: 'record', name: 'Record', group: 'record', description: 'Record detail layout with field grid and sections', engines: allEngines },
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
  { slug: 'loading-overlay', name: 'LoadingOverlay', group: 'feedback', description: 'Full-area loading overlay with spinner and message', engines: allEngines },
];

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

const shell: StructureEntry[] = [
  { slug: 'bottom-tab-bar', name: 'BottomTabBar', group: 'shell', description: 'Mobile shell navigation bar with active, icon, badge, and label states', engines: allEngines },
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
