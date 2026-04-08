/**
 * @fileoverview Pattern Components barrel -- Tier 2 of the design system.
 * Generic, composable components with engine support and composable slots.
 * Patterns sit above primitives and below surfaces: they package recurring
 * UI structures (tables, forms, charts, kanban, etc.) without taking
 * ownership of full page chrome. Used as building blocks for Tier 3 recipes.
 */

// === Shared Types ===
export type {
  PatternBaseProps,
  ColumnDef,
  ColumnResponsiveConfig,
  ResponsiveColumnMode,
  SortConfig,
  FilterDef,
  PaginationConfig,
  BulkAction,
  StatDef,
  FieldDef,
  KanbanColumnDef,
  PresetDef,
} from './types';

// === Core Patterns (with engines) ===

// DataTable
export { PatternDataTable } from './data-table';
export type { DataTablePatternProps } from './data-table';
export { resolveAccessor, resolveRowKey } from './data-table';

// KanbanBoard
export { PatternKanbanBoard } from './kanban-board';
export type { KanbanBoardProps } from './kanban-board';

// FormBuilder
export { PatternFormBuilder } from './form-builder';
export type { FormBuilderProps } from './form-builder';

// StatsGrid
export { PatternStatsGrid } from './stats-grid';
export type { StatsGridProps } from './stats-grid';

// DetailPanel
export { PatternDetailPanel } from './detail-panel';
export type { DetailPanelProps, DetailTab, DetailAction } from './detail-panel';

// Timeline
export { PatternTimeline } from './timeline';
export type { TimelinePatternProps, TimelineItem } from './timeline';

// EmptyState
export { PatternEmptyState } from './empty-state';
export type { EmptyStateProps } from './empty-state';

// PageShell
export { PatternPageShell } from './page-shell';
export type { PageShellProps } from './page-shell';

// FilterPanel
export { PatternFilterPanel } from './filter-panel';
export type { FilterPanelProps } from './filter-panel';

// CommandPalette
export { PatternCommandPalette } from './command-palette';
export type { CommandPaletteProps, CommandItem } from './command-palette';

// CalendarView
export { PatternCalendarView } from './calendar-view';
export type { CalendarViewProps, CalendarEvent } from './calendar-view';

// MapView
export { PatternMapView } from './map-view';
export type { MapViewProps, MapMarker } from './map-view';

// ApprovalWorkflow
export { PatternApprovalWorkflow } from './approval-workflow';
export type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from './approval-workflow';

// StepWizard
export { PatternStepWizard } from './step-wizard';
export type { StepWizardProps, WizardStep } from './step-wizard';

// Assistant UI
export {
  AssistantStatusBadge,
  StreamingText,
  TypingIndicator,
  ToolCallCard,
  MessageBubble,
} from './assistant';
export type {
  AssistantMessageRole,
  AssistantDeliveryStatus,
  AssistantToolStatus,
  AssistantMessagePart,
  AssistantStatusBadgeProps,
  StreamingTextProps,
  TypingIndicatorProps,
  ToolCallCardProps,
  MessageBubbleProps,
} from './assistant';

// LiveFeed
export { PatternLiveFeed } from './live-feed';
export type { LiveFeedProps, FeedItem } from './live-feed';

// TreeView
export { PatternTreeView } from './tree-view';
export type { TreeViewProps, TreeNode } from './tree-view';

// FileManager
export { PatternFileManager } from './file-manager';
export type { FileManagerProps, FileItem, FolderItem, FileSystemItem } from './file-manager';

// ActivityLog
export { PatternActivityLog } from './activity-log';
export type { ActivityLogProps, Activity, ActivityFilter } from './activity-log';

// CommentThread
export { PatternCommentThread } from './comment-thread';
export type { CommentThreadProps, Comment, CommentReaction } from './comment-thread';

// NotificationCenter
export { PatternNotificationCenter } from './notification-center';
export type { NotificationCenterProps, Notification } from './notification-center';

// UserProfileCard
export { PatternUserProfileCard } from './user-profile-card';
export type { UserProfileCardProps, UserProfile, ProfileAction } from './user-profile-card';

// PricingTable
export { PatternPricingTable } from './pricing-table';
export type { PricingTableProps, PricingPlan, PricingFeature } from './pricing-table';

// InvoiceTemplate
export { PatternInvoiceTemplate } from './invoice-template';
export type { InvoiceTemplateProps, InvoiceData, InvoiceCompany, InvoiceClient, InvoiceLineItem } from './invoice-template';

// ShortcutsOverlay
export { PatternShortcutsOverlay } from './shortcuts-overlay';
export type { ShortcutsOverlayProps, ShortcutDisplayItem } from './shortcuts-overlay';

// WorkspaceSwitcher
export { PatternWorkspaceSwitcher } from './workspace-switcher';
export type { WorkspaceSwitcherProps, Workspace } from './workspace-switcher';

// EnvironmentToggle
export { PatternEnvironmentToggle } from './environment-toggle';
export type { EnvironmentToggleProps, EnvironmentDef } from './environment-toggle';

// SavedViewsBar
export { PatternSavedViewsBar } from './saved-views';
export type { SavedViewsBarProps, SavedView, SavedViewConfig, ViewMenuAction } from './saved-views';

// FilterBuilder
export { PatternFilterBuilder } from './filter-builder';
export type {
  FilterBuilderProps,
  FilterRule,
  FilterGroup,
  FilterFieldDefinition,
  FilterFieldType,
  FilterOperator,
  OperatorDefinition,
} from './filter-builder';
export {
  isFilterGroup,
  isFilterRule,
  generateFilterId,
  getOperatorsForField,
  OPERATOR_DEFINITIONS,
  DEFAULT_OPERATORS_BY_TYPE,
} from './filter-builder';

// StatsHeader
export { StatsHeader } from './stats-header';
export type { StatItem, StatsHeaderProps } from './stats-header';

// ListToolbar
export { PatternListToolbar, ListToolbar } from './list-toolbar';
export type { ListToolbarProps, FilterPillConfig, DensityKey, ViewMode } from './list-toolbar';

// ColumnSettings
export { PatternColumnSettings, ColumnSettingsDropdown } from './column-settings';
export type { ColumnSettingsProps, ColumnSettingItem } from './column-settings';

// TenantPreview
export { PatternTenantPreview } from './tenant-preview';
export type { TenantPreviewProps, PreviewComponent } from './tenant-preview';

// WorkbenchHeader
export { PatternWorkbenchHeader } from './workbench-header';
export type { WorkbenchHeaderProps, WorkbenchQuickAction, WorkbenchSavedView } from './workbench-header';

// CockpitHeader
export { PatternCockpitHeader } from './cockpit-header';
export type { CockpitHeaderProps, CockpitBreadcrumb, CockpitStatus } from './cockpit-header';

// BulkSelectToggle -- toggle button for entering/exiting bulk-selection mode
export { BulkSelectToggle } from './bulk-select-toggle';
export type { BulkSelectToggleProps } from './bulk-select-toggle';

// StatusFilterPills -- horizontal pill bar for single/multi-select status filters
export { StatusFilterPills } from './status-filter-pills';
export type { StatusFilterPillsProps, StatusFilterPillOption, FilterPill } from './status-filter-pills';

// TableCheckboxStyles -- shared CSS animations and hover styles for table flows
export { TableCheckboxStyles } from './table-checkbox-styles';
export type { TableCheckboxStylesProps } from './table-checkbox-styles';

// LoadingOverlay -- engine-free loading shell with brand-mark slot
export { LoadingOverlay } from './loading-overlay';
export type { LoadingOverlayProps } from './loading-overlay';

// === D3 Charts ===
export { BarChart } from './charts/bar-chart';
export type { BarChartProps } from './charts/bar-chart';

export { LineChart } from './charts/line-chart';
export type { LineChartProps } from './charts/line-chart';

export { PieChart } from './charts/pie-chart';
export type { PieChartProps } from './charts/pie-chart';

export { AreaChart } from './charts/area-chart';
export type { AreaChartProps } from './charts/area-chart';

export { FunnelChart } from './charts/funnel-chart';
export type { FunnelChartProps } from './charts/funnel-chart';

export { RadarChart } from './charts/radar-chart';
export type { RadarChartProps } from './charts/radar-chart';

export { TreeMap } from './charts/treemap';
export type { TreeMapProps } from './charts/treemap';

export { HeatMap } from './charts/heatmap';
export type { HeatMapProps } from './charts/heatmap';

export { GanttChart } from './charts/gantt-chart';
export type { GanttChartProps } from './charts/gantt-chart';

export { NetworkGraph } from './charts/network-graph';
export type { NetworkGraphProps } from './charts/network-graph';

export type {
  ChartBaseProps,
  DataPoint,
  SeriesDataPoint,
  Series,
} from './charts/Charts.types';
export { DEFAULT_COLORS, DEFAULT_MARGIN } from './charts/Charts.types';

// === Hooks & Utilities ===
export {
  useDataTable,
  useKanban,
  useFormBuilder,
  useFilterPanel,
  column,
  columns,
  actionsColumn,
  createRecipeVariant,
} from './hooks';

export type {
  UseDataTableOptions,
  UseDataTableReturn,
  UseKanbanOptions,
  UseKanbanReturn,
  UseFormBuilderOptions,
  UseFormBuilderReturn,
  UseFilterPanelOptions,
  UseFilterPanelReturn,
  RecipeVariantConfig,
} from './hooks';

// ---------------------------------------------------------------------------
// Legacy / Domain-Kit Patterns -- INTERNAL ONLY
// Classic-only, domain-specific patterns (ApprovalInbox, ModerationGallery,
// OperationalLedger, ShiftMatrix) are NOT exported from this barrel and have
// no public subpath export. They are internal-only and will move to
// components/kits/ in a future restructuring.
// ---------------------------------------------------------------------------
