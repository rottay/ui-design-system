# Pattern Reference

Patterns are composable mid-complexity components (Tier 2) that sit between primitives and surfaces. They encapsulate reusable UI logic with engine support and render slots.

Source: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/patterns/`

Calidad esperada hoy para patterns del core:

- visuales token-driven por defecto
- sensibles a `tenant + productProfile + dark mode`
- sin colores crudos en runtime salvo casos nativos inevitables
- paridad razonable entre `classic`, `modern` y `rustic`
- tests reales de comportamiento, no solo smoke coverage

---

## PatternDataTable

Full-featured data table with sorting, filtering, pagination, row selection, bulk actions, and view switching.

**When to use:** Any page that displays a list of records in tabular form.

**Key props:**
- `columns: ColumnDef<T>[]` - Column definitions with accessor, title, sortable, render
- `data: T[]` - Row data
- `pagination?: PaginationConfig` - Page, pageSize, total, onChange
- `sorting?: SortConfig` - Column key, direction
- `filters?: FilterDef[]` - Filter definitions
- `bulkActions?: BulkAction[]` - Actions for selected rows
- `onRowClick?: (row: T) => void`
- `rowKey?: keyof T | ((row: T) => string)`
- `columnVisibility?: boolean` - Enable column visibility management
- `visibleColumns?: string[]` - Controlled visible column keys
- `lockedColumns?: string[]` - Columns that can't be hidden
- `resizable?: boolean` - Enable column resizing via drag handles
- `columnWidths?: Record<string, number>` - Controlled column widths
- `onColumnResize?: (key: string, width: number) => void`
- `reorderable?: boolean` - Enable column reordering via drag & drop
- `columnOrder?: string[]` - Controlled column order
- `onColumnReorder?: (order: string[]) => void`
- `pinnedColumns?: { left: string[]; right: string[] }` - Controlled column pinning
- `density?: 'compact' | 'comfortable' | 'spacious'` - Row density mode

**Used by surfaces:** ListSurface, AuditSurface, ReportSurface, PremiumListSurfaces (app-evnto)

**Composition example:**
```tsx
<PatternDataTable
  columns={[
    { key: 'name', title: 'Name', sortable: true },
    { key: 'email', title: 'Email' },
  ]}
  data={users}
  pagination={{ page: 1, pageSize: 20, total: 100 }}
  onRowClick={(user) => router.push(`/users/${user.id}`)}
/>
```

---

## PatternKanbanBoard

Drag-and-drop kanban board with configurable columns and cards.

**When to use:** Workflow visualization, pipeline management, task boards.

**Key props:**
- `columns: KanbanColumnDef<T>[]` - Column definitions
- `items: T[]` - Items to distribute across columns
- `onMove?: (item: T, from: string, to: string) => void`
- `renderCard?: (item: T) => ReactNode`

**Used by surfaces:** OperationalSurface (queue panel)

**Composition example:**
```tsx
<PatternKanbanBoard
  columns={[
    { key: 'todo', title: 'To Do' },
    { key: 'in-progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ]}
  items={tasks}
  onMove={(task, from, to) => updateStatus(task.id, to)}
/>
```

---

## PatternFormBuilder

Dynamic form generator from field definitions. Supports multiple layouts, validation, and step-based forms.

**When to use:** Any form that can be described declaratively. Avoids hand-wiring individual form fields.

**Key props:**
- `fields: FieldDef[]` - Field definitions (type, name, label, rules, options)
- `values?: Record<string, unknown>` - Current form values
- `onChange?: (values: Record<string, unknown>) => void`
- `onSubmit?: (values: Record<string, unknown>) => void`
- `layout?: 'vertical' | 'horizontal' | 'inline' | 'grid' | 'steps'`
- `columns?: number` - Grid column count
- `renderField?: (field: FieldDef, element: ReactNode) => ReactNode`

**Used by surfaces:** FormSurface, DetailFormSurface, WizardSurface, OnboardingSurface

**Composition example:**
```tsx
<PatternFormBuilder
  layout="grid"
  columns={2}
  fields={[
    { name: 'firstName', label: 'First Name', type: 'text', rules: { required: true } },
    { name: 'lastName', label: 'Last Name', type: 'text', rules: { required: true } },
    { name: 'email', label: 'Email', type: 'email', rules: { required: true, pattern: /.+@.+/ } },
  ]}
  values={formValues}
  onChange={setFormValues}
  onSubmit={handleSubmit}
/>
```

---

## PatternStatsGrid

KPI statistics grid with trend indicators and optional click handlers.

**When to use:** Dashboard headers, summary sections, operational overviews.

**Key props:**
- `stats: StatDef[]` - Stat definitions (label, value, change, trend, icon, color)
- `columns?: number` - Grid columns
- `onStatClick?: (stat: StatDef) => void`

**Used by surfaces:** DashboardSurface, OperationalSurface, VisualizationSurface

**Composition example:**
```tsx
<PatternStatsGrid
  columns={4}
  stats={[
    { label: 'Revenue', value: '$12,450', change: '+12%', trend: 'up' },
    { label: 'Users', value: '1,234', change: '+5%', trend: 'up' },
    { label: 'Churn', value: '2.1%', change: '-0.3%', trend: 'down' },
  ]}
/>
```

---

## PatternDetailPanel

Entity detail panel with tabs, sidebar, header, footer, and actions.

**When to use:** Entity detail pages with multi-section content.

**Key props:**
- `title: ReactNode` - Entity title
- `subtitle?: ReactNode`
- `tabs?: DetailTab[]` - Tab definitions with key, label, content
- `actions?: DetailAction[]` - Header actions
- `sidebar?: ReactNode`
- `sidebarPosition?: 'start' | 'end'`

**Used by surfaces:** DetailSurface

**Composition example:**
```tsx
<PatternDetailPanel
  title={user.name}
  subtitle={user.email}
  tabs={[
    { key: 'overview', label: 'Overview', content: <UserOverview user={user} /> },
    { key: 'activity', label: 'Activity', content: <UserActivity userId={user.id} /> },
  ]}
  actions={[{ id: 'edit', label: 'Edit', onClick: () => router.push(`/users/${user.id}/edit`) }]}
  sidebar={<UserSidebar user={user} />}
/>
```

---

## PatternTimeline

Chronological event timeline with customizable items and rendering.

**When to use:** Activity history, change logs, process tracking.

**Key props:**
- `items: TimelineItem[]` - Timeline entries (id, title, description, timestamp, icon, color)
- `mode?: 'left' | 'right' | 'alternate'`
- `renderItem?: (item: TimelineItem) => ReactNode`

**Used by surfaces:** DetailSurface (activity tabs), OperationalSurface

---

## PatternEmptyState

Empty state with icon, title, description, and action buttons.

**When to use:** When a list, table, or section has no data to display.

**Key props:**
- `title: string`
- `description?: string`
- `icon?: ReactNode`
- `primaryAction?: { label: string; onClick: () => void }`
- `secondaryAction?: { label: string; onClick: () => void }`

**Used by surfaces:** EmptyStateSurface, and as `emptyState` slot in most other surfaces

---

## PatternPageShell

Page shell providing breadcrumbs, title, subtitle, badge, actions, and loading state.

**When to use:** Wrap any page that needs standard chrome. Most surfaces use this internally.

**Key props:**
- `title: string`
- `subtitle?: ReactNode`
- `breadcrumbs?: { label: string; href?: string }[]`
- `badge?: ReactNode`
- `actions?: ReactNode`
- `loading?: boolean`
- `back?: { label?: string; onClick: () => void }`

**Used by surfaces:** All page-level surfaces use PageShell internally via `SurfacePageChrome`

---

## PatternFilterPanel

Filter panel with multiple filter types (text, select, date-range, multi-select).

**When to use:** Search pages, list pages with advanced filtering.

**Key props:**
- `filters: FilterDef[]` - Filter definitions
- `values?: Record<string, unknown>`
- `onChange?: (values: Record<string, unknown>) => void`
- `onReset?: () => void`
- `onApply?: (values: Record<string, unknown>) => void`
- `presets?: PresetDef[]` - Saved filter presets

**Used by surfaces:** ListSurface, SearchSurface, AuditSurface, ReportSurface

---

## PatternCommandPalette

Keyboard-driven command palette (Cmd+K / Ctrl+K).

**When to use:** Global navigation shortcut, quick search, action launcher.

**Key props:**
- `items: CommandItem[]` - Available commands (id, label, icon, shortcut, onSelect, group)
- `open?: boolean`
- `onOpenChange?: (open: boolean) => void`
- `placeholder?: string`

**Used by surfaces:** Typically used at app level, not inside a specific surface

---

## PatternCalendarView

Calendar with month/week/day views and event rendering.

**When to use:** Scheduling, event management, date-based data.

**Key props:**
- `events: CalendarEvent[]`
- `view?: 'month' | 'week' | 'day'`
- `currentDate?: Date`
- `onDateChange?: (date: Date) => void`
- `onViewChange?: (view: string) => void`
- `onEventClick?: (event: CalendarEvent) => void`
- `renderEvent?: (event: CalendarEvent) => ReactNode`

**Used by surfaces:** SchedulerSurface

---

## PatternMapView

Map visualization with markers and info popups.

**When to use:** Location-based data, geographic visualization.

**Key props:**
- `markers: MapMarker[]` - Marker definitions (position, title, data)
- `center?: { lat: number; lng: number }`
- `zoom?: number`
- `onMarkerClick?: (marker: MapMarker) => void`

**Used by surfaces:** Not tied to a specific surface; used in custom compositions

---

## PatternApprovalWorkflow

Multi-step approval workflow visualization.

**When to use:** HR approvals, document review processes, purchase orders.

**Key props:**
- `steps: ApprovalStep[]` - Step definitions (label, status, assignee, timestamp)
- `currentStep?: number`
- `onApprove?: (step: number) => void`
- `onReject?: (step: number, reason?: string) => void`

**Used by surfaces:** OperationalSurface, custom workflow pages

---

## PatternStepWizard

Multi-step wizard with progress tracking and navigation.

**When to use:** Multi-step forms, onboarding flows, guided processes.

**Key props:**
- `steps: WizardStep[]` - Step definitions (key, title, content, icon, optional)
- `currentStep?: number`
- `onStepChange?: (step: number) => void`
- `orientation?: 'horizontal' | 'vertical'`

**Used by surfaces:** WizardSurface, OnboardingSurface

---

## PatternLiveFeed

Real-time feed with auto-refresh, new item indicators, and infinite scroll.

**When to use:** Activity streams, notification feeds, real-time updates.

**Key props:**
- `items: FeedItem[]` - Feed entries (id, timestamp, content)
- `renderItem: (item: FeedItem) => ReactNode`
- `onRefresh?: () => void`
- `autoRefresh?: number` - Refresh interval in ms
- `newItemsCount?: number`
- `onShowNewItems?: () => void`
- `onLoadMore?: () => void`
- `hasMore?: boolean`

**Used by surfaces:** OperationalSurface (feed panel)

---

## PatternTreeView

Interactive tree with expand/collapse and selection.

**When to use:** File trees, organizational hierarchies, category navigation.

**Key props:**
- `nodes: TreeNode[]` - Tree node definitions (id, label, children, icon)
- `selectedKeys?: string[]`
- `expandedKeys?: string[]`
- `onSelect?: (keys: string[]) => void`
- `onExpand?: (keys: string[]) => void`

**Used by surfaces:** SettingsSurface (sidebar), custom navigation

---

## PatternFileManager

File/folder browser with navigation, actions, and preview.

**When to use:** Document management, media library, file storage.

**Key props:**
- `items: FileSystemItem[]` - Files and folders
- `currentPath?: string`
- `onNavigate?: (path: string) => void`
- `onSelect?: (item: FileSystemItem) => void`
- `onUpload?: (files: File[]) => void`
- `onDelete?: (items: FileSystemItem[]) => void`

**Used by surfaces:** MediaSurface (alternative to gallery layout)

---

## PatternActivityLog

Filterable activity/audit log.

**When to use:** User activity history, system audit trails.

**Key props:**
- `activities: Activity[]` - Activity entries (id, action, actor, timestamp, resource)
- `filters?: ActivityFilter[]`
- `onFilterChange?: (filters: Record<string, unknown>) => void`

**Used by surfaces:** AuditSurface, DetailSurface (activity tabs)

---

## PatternCommentThread

Threaded comments with replies, reactions, and editing.

**When to use:** Discussion threads, feedback on entities, review comments.

**Key props:**
- `comments: Comment[]` - Comment entries (id, author, body, timestamp, replies, reactions)
- `onReply?: (parentId: string, body: string) => void`
- `onEdit?: (id: string, body: string) => void`
- `onDelete?: (id: string) => void`
- `onReact?: (id: string, reaction: string) => void`

**Used by surfaces:** DetailSurface (comments tab), custom pages

---

## PatternNotificationCenter

Notification list with read/unread state and preference management.

**When to use:** Notification dropdown, notification settings page.

**Key props:**
- `notifications: Notification[]` - Notification entries (id, title, message, timestamp, read, type)
- `onMarkRead?: (ids: string[]) => void`
- `onMarkAllRead?: () => void`
- `onDelete?: (ids: string[]) => void`

**Used by surfaces:** NotificationSurface

---

## PatternUserProfileCard

User profile card with avatar, stats, and action buttons.

**When to use:** User cards in lists, profile previews, team member displays.

**Key props:**
- `user: UserProfile` - User data (name, email, avatar, role, stats)
- `actions?: ProfileAction[]`
- `layout?: 'horizontal' | 'vertical'`

**Used by surfaces:** ProfileSurface (header area)

---

## PatternPricingTable

Pricing plan comparison table.

**When to use:** Pricing pages, plan selection, upgrade flows.

**Key props:**
- `plans: PricingPlan[]` - Plan definitions (name, price, features, popular, cta)
- `features: PricingFeature[]` - Feature definitions for comparison
- `currentPlan?: string` - Currently active plan
- `onSelect?: (plan: PricingPlan) => void`

**Used by surfaces:** BillingSurface (plan section)

---

## PatternInvoiceTemplate

Printable invoice layout.

**When to use:** Invoice generation, receipt display, billing documents.

**Key props:**
- `data: InvoiceData` - Invoice metadata (number, date, due, status)
- `company: InvoiceCompany` - Issuer details
- `client: InvoiceClient` - Recipient details
- `items: InvoiceLineItem[]` - Line items (description, quantity, price, total)

**Used by surfaces:** BillingSurface (invoice detail)

---

## Assistant (Sub-patterns)

AI assistant UI components for chat interfaces with streaming support.

**When to use:** AI chat interfaces, copilot UIs, conversational workflows.

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `StreamingText` | `text: string`, `speed?: number` | Typewriter-style rendering for streamed text |
| `TypingIndicator` | `label?: string` | Animated dots indicating the assistant is typing |
| `ToolCallCard` | `name: string`, `status: AssistantToolStatus`, `args?: Record<string, unknown>` | Status card for tool/function calls |
| `MessageBubble` | `role: AssistantMessageRole`, `children: ReactNode` | Chat bubble with role-based alignment |
| `AssistantStatusBadge` | `status: string` | Connection/status badge for the assistant |

**Used by surfaces:** ChatSurface (message rendering, typing indicator, tool calls)

---

## Charts

See `COMPONENT_INDEX.md` for the full list of 10 chart components. All charts respond to personality tokens for animation, line style, tooltip appearance, and color scheme.
