# Design System - Pattern Components Catalog

> **Tier 2** of the Rottay Design System. Patterns are generic, composable components with
> engine support and composable slots. They sit above primitives (Tier 1) and below
> surfaces/recipes (Tier 3), packaging recurring UI structures without taking ownership
> of full page chrome.

**Source**: `ui-design-system/packages/core/src/components/patterns/`

---

## Engine System

All patterns extend `PatternBaseProps` which includes an `engine?: EngineName` prop.
Three engines are supported:

| Engine ID | Name    | Backing Library | Description                       |
|-----------|---------|-----------------|-----------------------------------|
| `classic` | Titan   | Ant Design      | Enterprise-grade, feature-rich    |
| `modern`  | Hermes  | Tailwind CSS    | Clean, utility-first aesthetic    |
| `rustic`  | Apollo  | Vanilla CSS     | Lightweight, zero-dependency      |

Patterns use `createEngineComponent()` from the runtime factory to lazy-load the
active engine's implementation. The engine is resolved from the `DesignSystemProvider`
context or overridden per-component via the `engine` prop.

Some newer patterns only have a `classic` implementation (modern/rustic route to classic).

---

## Summary Table

| # | Pattern | Component | Multi-Engine | Purpose |
|---|---------|-----------|:------------:|---------|
| 1 | [DataTable](#1-datatable) | `PatternDataTable` | classic, modern, rustic | Slot-driven data table with sorting, filtering, pagination, selection, responsive mobile cards |
| 2 | [StatsGrid](#2-statsgrid) | `PatternStatsGrid` | classic, modern, rustic | Responsive grid of stat cards with sparklines, animated values, trend indicators |
| 3 | [ListToolbar](#3-listtoolbar) | `PatternListToolbar` | classic, modern, rustic | Two-row toolbar with search, filter pills, density control, view mode toggle |
| 4 | [FilterPanel](#4-filterpanel) | `PatternFilterPanel` | classic, modern, rustic | Configurable filter UI with inline/stacked/sidebar layouts, collapsible sections |
| 5 | [CockpitHeader](#5-cockpitheader) | `PatternCockpitHeader` | classic only* | Rich header for detail pages with breadcrumbs, title + status, back nav, sticky mode |
| 6 | [PageShell](#6-pageshell) | `PatternPageShell` | classic, modern, rustic | Standard page wrapper with title, breadcrumbs, tabs, actions, back button |
| 7 | [DetailPanel](#7-detailpanel) | `PatternDetailPanel` | classic, modern, rustic | Entity detail view with tabs, sidebar, actions, breadcrumbs, status badges |
| 8 | [FormBuilder](#8-formbuilder) | `PatternFormBuilder` | classic, modern, rustic | Schema-driven form renderer with multi-layout, validation, controlled/uncontrolled |
| 9 | [StepWizard](#9-stepwizard) | `PatternStepWizard` | classic, modern, rustic | Multi-step wizard with progress, validation gates, horizontal/vertical orientation |
| 10 | [Timeline](#10-timeline) | `PatternTimeline` | classic, modern, rustic | Chronological event list with left/right/alternate modes, date grouping |
| 11 | [KanbanBoard](#11-kanbanboard) | `PatternKanbanBoard` | classic, modern, rustic | Drag-and-drop kanban with configurable columns, WIP limits, card rendering |
| 12 | [EmptyState](#12-emptystate) | `PatternEmptyState` | classic, modern, rustic | Centered placeholder for empty lists/pages with icon, CTA buttons, size variants |
| 13 | [CommandPalette](#13-commandpalette) | `PatternCommandPalette` | classic, modern, rustic | Modal Cmd+K overlay with search, grouping, keyboard navigation |
| 14 | [CalendarView](#14-calendarview) | `PatternCalendarView` | classic, modern, rustic | Month/week/day calendar with event rendering, navigation, click callbacks |
| 15 | [MapView](#15-mapview) | `PatternMapView` | classic, modern, rustic | Interactive map with typed markers, popup, sidebar, Leaflet/Mapbox-ready |
| 16 | [ApprovalWorkflow](#16-approvalworkflow) | `PatternApprovalWorkflow` | classic, modern, rustic | Sequential approval chain with status indicators, approve/reject/escalate |
| 17 | [Assistant](#17-assistant) | Multiple sub-components | Engine-agnostic | AI chat primitives: StreamingText, TypingIndicator, ToolCallCard, MessageBubble |
| 18 | [LiveFeed](#18-livefeed) | `PatternLiveFeed` | classic, modern, rustic | Auto-refreshing scrollable feed with new-items banner, infinite scroll |
| 19 | [TreeView](#19-treeview) | `PatternTreeView` | classic, modern, rustic | Recursive tree with expand/collapse, checkboxes, drag-drop, search |
| 20 | [FileManager](#20-filemanager) | `PatternFileManager` | classic, modern, rustic | File browser with grid/list views, selection, upload, breadcrumb navigation |
| 21 | [ActivityLog](#21-activitylog) | `PatternActivityLog` | classic, modern, rustic | Chronological user action log with diff rendering, avatar, filtering |
| 22 | [CommentThread](#22-commentthread) | `PatternCommentThread` | classic, modern, rustic | Nested threaded discussion with replies, reactions, inline editing |
| 23 | [NotificationCenter](#23-notificationcenter) | `PatternNotificationCenter` | classic, modern, rustic | Bell-trigger dropdown with notification list, read/dismiss, badge count |
| 24 | [UserProfileCard](#24-userprofilecard) | `PatternUserProfileCard` | classic, modern, rustic | User identity card with avatar, role, status, action buttons |
| 25 | [PricingTable](#25-pricingtable) | `PatternPricingTable` | classic, modern, rustic | Feature-comparison grid with plan columns, billing cycle toggle |
| 26 | [InvoiceTemplate](#26-invoicetemplate) | `PatternInvoiceTemplate` | classic, modern, rustic | Print-ready invoice with company/client info, line items, totals |
| 27 | [ShortcutsOverlay](#27-shortcutsoverlay) | `PatternShortcutsOverlay` | classic, modern, rustic | Modal overlay listing keyboard shortcuts, grouped by category, searchable |
| 28 | [WorkspaceSwitcher](#28-workspaceswitcher) | `PatternWorkspaceSwitcher` | classic, modern, rustic | Workspace/tenant switcher dropdown with badges, role, plan display |
| 29 | [EnvironmentToggle](#29-environmenttoggle) | `PatternEnvironmentToggle` | classic, modern, rustic | Prod/staging/dev environment switcher with safety confirmation, banner |
| 30 | [SavedViewsBar](#30-savedviewsbar) | `PatternSavedViewsBar` | classic, modern, rustic | Tab bar for saved data views with CRUD, reorder, duplicate |
| 31 | [FilterBuilder](#31-filterbuilder) | `PatternFilterBuilder` | classic, modern, rustic | Visual query builder with nested AND/OR groups, per-field operators |
| 32 | [StatsHeader](#32-statsheader) | `StatsHeader` | classic, modern, rustic | Operational stat cards with counter animations, sparkline dots, insights |
| 33 | [ColumnSettings](#33-columnsettings) | `PatternColumnSettings` | classic, modern, rustic | Column visibility, ordering, pinning panel with search and drag handles |
| 34 | [TenantPreview](#34-tenantpreview) | `PatternTenantPreview` | classic, modern, rustic | Live preview of tenant branding/theme during onboarding |
| 35 | [WorkbenchHeader](#35-workbenchheader) | `PatternWorkbenchHeader` | classic only* | Role-home header with briefing, exception badge, saved views, quick actions |
| 36 | [OperationalLedger](#36-operationalledger) | `PatternOperationalLedger` | classic only* | Dense ledger for stock/payroll transactions with signed quantities |
| 37 | [ApprovalInbox](#37-approvalinbox) | `PatternApprovalInbox` | classic only* | Grouped approval items by domain with SLA timers, batch actions |
| 38 | [ShiftMatrix](#38-shiftmatrix) | `PatternShiftMatrix` | classic only* | Role x time slot grid showing coverage gaps with quick-assign |
| 39 | [ModerationGallery](#39-moderationgallery) | `PatternModerationGallery` | classic only* | Media moderation grid with status, triage actions, bulk review |
| 40 | [Charts](#40-charts) | 10 chart components | Engine-agnostic (D3) | BarChart, LineChart, PieChart, AreaChart, FunnelChart, RadarChart, TreeMap, HeatMap, GanttChart, NetworkGraph |

\* "classic only" means modern and rustic engines route to the classic implementation.

---

## Shared Types

All patterns extend `PatternBaseProps`:

```typescript
interface PatternBaseProps {
  engine?: EngineName;     // 'classic' | 'modern' | 'rustic'
  className?: string;
  style?: CSSProperties;
  loading?: boolean;
}
```

Additional shared types: `ColumnDef<T>`, `SortConfig`, `FilterDef`, `PaginationConfig`, `BulkAction<T>`, `StatDef`, `FieldDef`, `KanbanColumnDef<T>`, `PresetDef<P>`.

---

## Composition Hooks

| Hook | Purpose | Related Pattern |
|------|---------|-----------------|
| `useDataTable` | Client-side sort, filter, pagination, selection state | DataTable |
| `useKanban` | Column move, item reorder, collapse state | KanbanBoard |
| `useFormBuilder` | Form values, validation, step navigation | FormBuilder |
| `useFilterPanel` | Filter values, active count, reset logic | FilterPanel |

### Column Builders

- `column(def)` -- type-safe single column definition
- `columns(defs)` -- array of column definitions
- `actionsColumn(renderFn)` -- convenience for trailing actions column

### Recipe Variant Factory

`createRecipeVariant(config)` -- creates preset-based pattern configurations for Tier 3 recipes.

---

## Detailed Pattern Reference

### 1. DataTable

**Component**: `PatternDataTable<T>`
**Engines**: classic, modern, rustic
**Purpose**: Fully-featured data table with composable slots for toolbars, bulk actions, mobile cards, and row expansion. Supports server-side and client-side sorting, filtering, pagination, row selection, column visibility/resize/reorder/pin, and responsive mobile card layout.

**Key Props**: `data`, `columns`, `rowKey`, `toolbar`, `actions`, `bulkActions`, `selectable`, `selectedKeys`, `onSelectionChange`, `sorting`, `onSortChange`, `filters`, `filterValues`, `pagination`, `mobileCard`, `striped`, `bordered`, `compact`, `stickyHeader`, `density`, `columnVisibility`, `resizable`, `reorderable`, `expandedRow`

**Exported Utilities**: `resolveAccessor()`, `resolveRowKey()`

**See**: [data-table.md](./data-table.md)

---

### 2. StatsGrid

**Component**: `PatternStatsGrid`
**Engines**: classic, modern, rustic
**Purpose**: Responsive grid of stat cards driven by `StatDef[]`. Supports D3 sparklines, animated value counting, trend indicators, and multiple visual variants.

**Key Props**: `stats`, `renderStat`, `columns`, `sparkline`, `gap`, `variant` (default|outlined|filled|glass), `animate`, `onStatClick`

**See**: [stats-grid.md](./stats-grid.md)

---

### 3. ListToolbar

**Component**: `PatternListToolbar` (alias: `ListToolbar`)
**Engines**: classic, modern, rustic
**Purpose**: Professional two-row toolbar for data tables with search, filter pills (segmented controls), density control, view mode toggle (list/cards), column settings slot, saved views slot, export, and primary CTA.

**Key Props**: `title`, `icon`, `totalCount`, `search`, `onSearchChange`, `filterPills`, `activeFilters`, `onFilterChange`, `viewMode`, `onViewModeChange`, `density`, `onDensityChange`, `columnSettingsContent`, `savedViewsContent`, `primaryAction`, `onExport`

**See**: [list-toolbar.md](./list-toolbar.md)

---

### 4. FilterPanel

**Component**: `PatternFilterPanel`
**Engines**: classic, modern, rustic
**Purpose**: Configurable filter UI panel with multiple filter control types, three layout modes (inline, stacked, sidebar), collapsible sections, apply/reset actions, and active filter count badge.

**Key Props**: `filters`, `values`, `onChange`, `onReset`, `layout` (inline|stacked|sidebar), `collapsible`, `defaultCollapsed`, `title`, `showReset`, `showApply`, `onApply`, `activeCount`

**See**: [filter-panel.md](./filter-panel.md)

---

### 5. CockpitHeader

**Component**: `PatternCockpitHeader`
**Engines**: classic only (modern/rustic fall back to classic)
**Purpose**: Rich header for detail/workbench pages with back navigation, breadcrumb trail, title + status badges, action buttons, and optional sticky compact mode on scroll.

**Key Props**: `title`, `subtitle`, `breadcrumbs` (CockpitBreadcrumb[]), `status` (CockpitStatus[]), `actions`, `sticky`, `onBack`

**See**: [cockpit-header.md](./cockpit-header.md)

---

### 6. PageShell

**Component**: `PatternPageShell`
**Engines**: classic, modern, rustic
**Purpose**: Standard page layout wrapper with header area (title, breadcrumbs, actions), tab sub-navigation, back button, badge, and max-width content constraint.

**Key Props**: `title`, `subtitle`, `breadcrumbs`, `actions`, `tabs`, `activeTab`, `onTabChange`, `children`, `back`, `badge`, `maxWidth`

**See**: [page-shell.md](./page-shell.md)

---

### 7. DetailPanel

**Component**: `PatternDetailPanel<T>`
**Engines**: classic, modern, rustic
**Purpose**: Generic entity detail view with header (title, subtitle, avatar, status), tabbed content area with badge counts, action buttons, optional sidebar (left or right), breadcrumbs, and footer.

**Key Props**: `data`, `title`, `subtitle`, `avatar`, `status`, `tabs` (DetailTab[]), `activeTab`, `onTabChange`, `actions` (DetailAction[]), `sidebar`, `sidebarPosition`, `sidebarWidth`, `onBack`, `headerExtra`, `footer`, `breadcrumbs`

**See**: [detail-panel.md](./detail-panel.md)

---

### 8. FormBuilder

**Component**: `PatternFormBuilder`
**Engines**: classic, modern, rustic
**Purpose**: Schema-driven form renderer that generates a complete form from a `FieldDef[]` array. Supports four layout modes (vertical, horizontal, grid, steps/wizard), validation feedback, controlled/uncontrolled value management, and custom field rendering.

**Key Props**: `fields`, `layout` (vertical|horizontal|grid|steps), `columns`, `renderField`, `actions`, `onSubmit`, `onValidationChange`, `onChange`, `initialValues`, `values`, `disabled`, `readOnly`, `showLabels`, `showRequired`, `gap`, `title`, `description`, `stepLabels`, `currentStep`, `onStepChange`

**See**: [form-builder.md](./form-builder.md)

---

### 9. StepWizard

**Component**: `PatternStepWizard`
**Engines**: classic, modern, rustic
**Purpose**: Multi-step wizard with progress indicator, per-step async validation gates, horizontal/vertical orientation, optional skip for optional steps, and customizable navigation labels.

**Key Props**: `steps` (WizardStep[]), `currentStep`, `onStepChange`, `onComplete`, `actionsDisabled`, `completeDisabled`, `showCompleteAction`, `allowSkip`, `showProgress`, `orientation` (horizontal|vertical), `nextLabel`, `prevLabel`, `completeLabel`, `skipLabel`, `footer`

**See**: [step-wizard.md](./step-wizard.md)

---

### 10. Timeline

**Component**: `PatternTimeline<T>`
**Engines**: classic, modern, rustic
**Purpose**: Chronological event display with connecting lines and dot markers. Supports left, right, and alternating layout modes, optional date-based grouping, semantic type coloring, and user attribution.

**Key Props**: `items` (TimelineItem<T>[]), `renderItem`, `onItemClick`, `mode` (left|right|alternate), `showTimestamp`, `header`, `footer`, `emptyState`, `groupByDate`

**See**: [timeline.md](./timeline.md)

---

### 11. KanbanBoard

**Component**: `PatternKanbanBoard<T>`
**Engines**: classic, modern, rustic
**Purpose**: Horizontal kanban board with drag-and-drop item movement between columns. Supports custom card rendering, column headers, WIP limits, collapse state, and add-item actions.

**Key Props**: `columns` (KanbanColumnDef<T>[]), `renderCard`, `renderColumnHeader`, `toolbar`, `onItemMove`, `onItemClick`, `emptyColumn`, `itemKey`, `columnGap`, `columnMinWidth`, `onAddItem`, `addItemLabel`

---

### 12. EmptyState

**Component**: `PatternEmptyState`
**Engines**: classic, modern, rustic
**Purpose**: Centered placeholder UI for empty lists, tables, or pages. Includes icon/illustration, title, description, primary and secondary CTA buttons, and size variants.

**Key Props**: `icon`, `title`, `description`, `action`, `secondaryAction`, `image`, `size` (sm|md|lg)

---

### 13. CommandPalette

**Component**: `PatternCommandPalette`
**Engines**: classic, modern, rustic
**Purpose**: Modal Cmd+K / Ctrl+K overlay with search input, filterable command list, keyboard navigation (arrow keys, Enter, Escape), group headings, recent items, and async search.

**Key Props**: `open`, `onOpenChange`, `items` (CommandItem[]), `placeholder`, `emptyMessage`, `onSearch`, `footer`, `recentItems`, `maxHeight`

---

### 14. CalendarView

**Component**: `PatternCalendarView<T>`
**Engines**: classic, modern, rustic
**Purpose**: Calendar grid with month, week, and day views. Renders events with color indicators, supports date/event click callbacks, custom event rendering, and navigation controls.

**Key Props**: `events` (CalendarEvent<T>[]), `view` (month|week|day), `currentDate`, `onDateChange`, `onViewChange`, `onEventClick`, `onDateClick`, `renderEvent`, `toolbar`, `header`

---

### 15. MapView

**Component**: `PatternMapView<T>`
**Engines**: classic, modern, rustic
**Purpose**: Interactive map placeholder with typed markers, popup rendering, sidebar panel, and configurable center/zoom. Designed for Leaflet/Mapbox extension.

**Key Props**: `markers` (MapMarker<T>[]), `center`, `zoom`, `onMarkerClick`, `renderMarker`, `renderPopup`, `selectedMarkerId`, `toolbar`, `height`, `sidebar`, `sidebarWidth`

---

### 16. ApprovalWorkflow

**Component**: `PatternApprovalWorkflow`
**Engines**: classic, modern, rustic
**Purpose**: Sequential approval chain rendering with five status states (pending, approved, rejected, escalated, skipped), approver avatars, comments, timestamps, and action buttons.

**Key Props**: `title`, `entity`, `steps` (ApprovalStep[]), `currentStep`, `onApprove`, `onReject`, `onEscalate`, `actionsDisabled`, `footer`

---

### 17. Assistant

**Components**: `AssistantStatusBadge`, `StreamingText`, `TypingIndicator`, `ToolCallCard`, `MessageBubble`
**Engine**: Engine-agnostic (uses DS primitives directly)
**Purpose**: Composable chat primitives for AI assistant interfaces. Handles streaming text with caret, typing dots, tool call status cards, and multi-part message bubbles with delivery status.

**Key Types**: `AssistantMessageRole`, `AssistantDeliveryStatus`, `AssistantToolStatus`, `AssistantMessagePart` (discriminated union: text, markdown, tool-status, artifact, attachments)

---

### 18. LiveFeed

**Component**: `PatternLiveFeed<T>`
**Engines**: classic, modern, rustic
**Purpose**: Auto-refreshing scrollable feed with new-items banner, infinite scroll / load-more pagination, configurable max items, and pulse animation for new entries.

**Key Props**: `items`, `renderItem`, `onRefresh`, `autoRefresh`, `emptyState`, `newItemsCount`, `onShowNewItems`, `onLoadMore`, `hasMore`, `maxItems`, `maxHeight`, `header`

---

### 19. TreeView

**Component**: `PatternTreeView`
**Engines**: classic, modern, rustic
**Purpose**: Recursive tree hierarchy with expand/collapse, single/multi-selection, tri-state checkboxes, drag-and-drop reordering, and integrated search filtering.

**Key Props**: `data` (TreeNode[]), `renderNode`, `onSelect`, `onExpand`, `expandedKeys`, `selectedKeys`, `defaultExpandedKeys`, `checkable`, `checkedKeys`, `onCheck`, `draggable`, `onDrop`, `searchable`, `multiple`

---

### 20. FileManager

**Component**: `PatternFileManager`
**Engines**: classic, modern, rustic
**Purpose**: File browser with grid/list view toggling, breadcrumb navigation, multi-select, upload (drag-and-drop), delete, rename, and custom file icon rendering.

**Key Props**: `files` (FileItem[]), `folders` (FolderItem[]), `currentPath`, `viewMode` (grid|list), `selectedItems`, `onUpload`, `onDelete`, `onRename`, `onNavigate`, `onSelectionChange`, `onViewModeChange`, `renderFileIcon`

---

### 21. ActivityLog

**Component**: `PatternActivityLog`
**Engines**: classic, modern, rustic
**Purpose**: Chronological list of user activities with built-in filter controls for action type, user, and date range. Supports diff rendering for field-level changes, avatar display, and custom activity renderers.

**Key Props**: `activities` (Activity[]), `filters` (ActivityFilter), `onFilterChange`, `emptyMessage`, `actionTypes`, `users`, `renderActivity`, `onActivityClick`

---

### 22. CommentThread

**Component**: `PatternCommentThread`
**Engines**: classic, modern, rustic
**Purpose**: Nested threaded discussion with recursive replies, emoji reactions (with active state), inline editing, user-aware edit/delete permissions, and configurable max nesting depth.

**Key Props**: `comments` (Comment[]), `onAdd`, `onEdit`, `onDelete`, `onReply`, `onReaction`, `currentUser`, `maxDepth`, `placeholder`, `emptyMessage`

---

### 23. NotificationCenter

**Component**: `PatternNotificationCenter`
**Engines**: classic, modern, rustic
**Purpose**: Bell-icon trigger with dropdown panel listing notifications. Supports severity-based styling, read/unread state, mark-as-read (single/all), dismiss (single/all), custom trigger element, and controlled open state.

**Key Props**: `notifications` (Notification[]), `unreadCount`, `onRead`, `onReadAll`, `onClear`, `onClearAll`, `trigger`, `open`, `onOpenChange`, `emptyMessage`, `maxVisible`

---

### 24. UserProfileCard

**Component**: `PatternUserProfileCard`
**Engines**: classic, modern, rustic
**Purpose**: Compact or full-width card displaying user identity (name, avatar, role, email, department), online status indicator, and contextual action buttons.

**Key Props**: `user` (UserProfile), `actions` (ProfileAction[]), `size` (sm|md|lg), `variant` (compact|full), `online`, `onClick`, `headerExtra`

---

### 25. PricingTable

**Component**: `PatternPricingTable`
**Engines**: classic, modern, rustic
**Purpose**: Feature-comparison grid with plan columns, feature rows, billing cycle toggle (monthly/yearly), highlighted recommended plan, and per-plan CTA buttons.

**Key Props**: `plans` (PricingPlan[]), `features` (PricingFeature[]), `highlightedPlan`, `onSelectPlan`, `billingCycle`, `onBillingCycleChange`, `currency`, `renderPlanHeader`

---

### 26. InvoiceTemplate

**Component**: `PatternInvoiceTemplate`
**Engines**: classic, modern, rustic
**Purpose**: Print-ready invoice layout with company branding, client billing info, line items table, financial summary (subtotal, tax, total), notes, and optional print/export action buttons.

**Key Props**: `invoice` (InvoiceData), `onPrint`, `onExport`, `showActions`

---

### 27. ShortcutsOverlay

**Component**: `PatternShortcutsOverlay`
**Engines**: classic, modern, rustic
**Purpose**: Modal overlay listing registered keyboard shortcuts, organized by category with search filtering. Typically triggered by pressing "?".

**Key Props**: `open`, `onOpenChange`, `shortcuts` (ShortcutDisplayItem[]), `title`, `searchPlaceholder`, `emptyMessage`, `footer`

---

### 28. WorkspaceSwitcher

**Component**: `PatternWorkspaceSwitcher`
**Engines**: classic, modern, rustic
**Purpose**: Dropdown panel for switching between workspaces/tenants. Shows workspace name, logo, user role, plan, unread count, online members, and supports workspace creation and settings.

**Key Props**: `workspaces` (Workspace[]), `activeWorkspaceId`, `onSwitch`, `onCreate`, `onSettings`, `currentUser`, `trigger` (click|hover), `position` (sidebar|header), `showCreateButton`

---

### 29. EnvironmentToggle

**Component**: `PatternEnvironmentToggle`
**Engines**: classic, modern, rustic
**Purpose**: Environment switcher (production/staging/dev) with three visual variants (toggle, dropdown, pills), production switch safety confirmation, and persistent non-production banner.

**Key Props**: `environments` (EnvironmentDef[]), `activeEnvironment`, `onChange`, `variant` (toggle|dropdown|pills), `showBanner`, `bannerMessage`, `productionId`, `confirmProductionSwitch`

---

### 30. SavedViewsBar

**Component**: `PatternSavedViewsBar`
**Engines**: classic, modern, rustic
**Purpose**: Horizontal tab bar for saved data views (Airtable/Linear-style). Supports selecting, creating, renaming, deleting, duplicating, and reordering views. Each view captures filter, sort, column, groupBy, and layout configuration.

**Key Props**: `views` (SavedView[]), `activeViewId`, `onViewSelect`, `onViewSave`, `onViewDelete`, `onViewRename`, `onViewCreate`, `onViewReorder`, `onViewDuplicate`, `allowCreate`, `allowDelete`, `allowRename`, `getMenuActions`, `maxViews`

---

### 31. FilterBuilder

**Component**: `PatternFilterBuilder`
**Engines**: classic, modern, rustic
**Purpose**: Visual query builder for complex filter expressions with nested AND/OR groups. Models a composable filter tree (FilterRule leaves + FilterGroup branches). Supports 15 operators, 6 field types, and configurable nesting depth.

**Key Props**: `fields` (FilterFieldDefinition[]), `value` (FilterGroup), `onChange`, `maxDepth`, `allowGrouping`, `addRuleLabel`, `addGroupLabel`, `showClear`, `onClear`, `compact`

**Exported Utilities**: `isFilterGroup()`, `isFilterRule()`, `generateFilterId()`, `getOperatorsForField()`, `OPERATOR_DEFINITIONS`, `DEFAULT_OPERATORS_BY_TYPE`

---

### 32. StatsHeader

**Component**: `StatsHeader`
**Engines**: classic, modern, rustic
**Purpose**: Operational stat cards with counter animations on mount, sparkline dots (7-value visualization), contextual insight text, gradient glow accents, and per-stat click handlers. Designed for 3-5 cards in a horizontal row above data tables.

**Key Props**: `stats` (StatItem[]), `loading`

---

### 33. ColumnSettings

**Component**: `PatternColumnSettings` (alias: `ColumnSettingsDropdown`)
**Engines**: classic, modern, rustic
**Purpose**: Panel for managing table column visibility (checkboxes), ordering (drag handles), and pinning (left/right toggle). Includes search and a reset-to-defaults action.

**Key Props**: `allColumns` (ColumnSettingItem[]), `visibleColumns`, `lockedColumns`, `columnOrder`, `pinnedColumns`, `onToggleVisibility`, `onReorder`, `onTogglePin`, `onReset`

---

### 34. TenantPreview

**Component**: `PatternTenantPreview`
**Engines**: classic, modern, rustic
**Purpose**: Live preview of UI components under a tenant's visual theme. Shows themed component samples (button, card, input, badge, table), color palette swatch grid, and personality/brand traits panel. Used during tenant creation or branding customization.

**Key Props**: `config` (TenantCreationConfig), `components` (PreviewComponent[]), `showColorPalette`, `showPersonalityInfo`

---

### 35. WorkbenchHeader

**Component**: `PatternWorkbenchHeader`
**Engines**: classic only (modern/rustic fall back to classic)
**Purpose**: Role-home header with briefing title, exception count badge, saved view selector dropdown, and quick action buttons. Top-level entry point for workbench/role-home pages.

**Key Props**: `title`, `subtitle`, `exceptionCount`, `quickActions` (WorkbenchQuickAction[]), `savedViews` (WorkbenchSavedView[]), `activeViewId`, `onViewChange`

---

### 36. OperationalLedger

**Component**: `PatternOperationalLedger`
**Engines**: classic only (modern/rustic fall back to classic)
**Purpose**: Dense ledger table for stock movements, payroll, and transactional data. Shows signed quantities with credit/debit coloring, timestamp, actor attribution, reason codes, reference numbers, and inline filtering by type and date range.

**Key Props**: `entries` (LedgerEntry[]), `filters` (LedgerFilter), `onFilter`, `emptyMessage`

---

### 37. ApprovalInbox

**Component**: `PatternApprovalInbox`
**Engines**: classic only (modern/rustic fall back to classic)
**Purpose**: Grouped approval items organized by domain (Finance, HR, Compliance) with SLA timer indicators, amount/risk badges, individual approve/reject actions, and batch approve capability.

**Key Props**: `groups` (ApprovalGroup[]), `onApprove`, `onReject`, `onBatchApprove`, `emptyMessage`

---

### 38. ShiftMatrix

**Component**: `PatternShiftMatrix`
**Engines**: classic only (modern/rustic fall back to classic)
**Purpose**: Role x time slot grid showing staffing coverage. Cells are colored by coverage status (full = green, gap = yellow, critical = red). Supports quick-assign interaction on cells.

**Key Props**: `roles`, `timeSlots` (ShiftTimeSlot[]), `assignments` (ShiftAssignment[]), `onQuickAssign`

---

### 39. ModerationGallery

**Component**: `PatternModerationGallery`
**Engines**: classic only (modern/rustic fall back to classic)
**Purpose**: Media moderation grid with thumbnail cards, status overlay (pending/approved/rejected), engagement metrics, hover action buttons (approve/reject), selection checkboxes for bulk operations, and uploader attribution.

**Key Props**: `items` (ModerationItem[]), `onApprove`, `onReject`, `onBulkAction`, `selectable`, `emptyMessage`

---

### 40. Charts

**Components**: `BarChart`, `LineChart`, `PieChart`, `AreaChart`, `FunnelChart`, `RadarChart`, `TreeMap`, `HeatMap`, `GanttChart`, `NetworkGraph`
**Engine**: Engine-agnostic (D3-powered with `ChartScaffold` wrapper)
**Purpose**: Full D3-based chart library with 10 chart types. All share `ChartBaseProps` (width, height, title, legend, animate, responsive, tooltip, colors, compact mode). Five named color palettes: default, pastel, vibrant, monochrome, accessible.

**Shared Types**: `ChartBaseProps`, `DataPoint`, `SeriesDataPoint`, `Series`

**Chart-Specific Hooks**: `useChartPersonality` (maps tenant personality to chart styling), `useChartCompact` (responsive compact mode detection)

**Sub-directory**: `charts/` (not engine-based; each chart is a standalone component)
