# Surface Type System - Rottay Design System

> Complete reference for the surface type layer defined in `types.ts`.
> Source: `ui-design-system/packages/core/src/components/surfaces/types.ts` (~2700 lines)

## Architecture

The type system defines the **contract layer above patterns**. Each surface config interface follows a three-section structure (`visual`, `presentation`, `behavior`) plus optional `permissions`.

---

## Shared Foundation Types

### EntityFieldMeta\<TView\>

Canonical field metadata published by an adapter. The `fieldId` is the stable identifier that connects adapters, permissions, and surface configs.

```typescript
interface EntityFieldMeta<TView> {
  key: keyof TView & string;
  fieldId: string;
  label?: string;
  description?: string;
}
```

### EntityAdapter\<TRaw, TView\>

Adapter boundary between raw domain data and the shape a surface consumes. Surfaces use adapters to decouple from backend shapes.

```typescript
interface EntityAdapter<TRaw, TView> {
  entity: string;
  version: string;
  map: (raw: TRaw) => TView;
  fields: EntityFieldMeta<TView>[];
}
```

### SurfacePageChrome

Shared page-level chrome used by surfaces that render a full page shell. Passed to `PageShellSurface` which delegates to `PatternPageShell`.

```typescript
interface SurfacePageChrome {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: SurfaceBreadcrumb[];
  badge?: ReactNode;
  maxWidth?: number | string;
  back?: { label?: string; onClick: () => void };
}
```

### SurfaceBreadcrumb

```typescript
interface SurfaceBreadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}
```

### SurfaceAction\<TView\>

Declarative action descriptor used across all surfaces. Apps own handlers; surfaces own placement, permissions gating, and rendering.

```typescript
interface SurfaceAction<TView = void> {
  id: string;                                        // Stable identifier for permission gating and test selectors
  label: string;                                     // Human-readable button label
  icon?: ReactNode;                                  // Leading icon
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: (item: TView) => void | Promise<void>;  // Handler (receives item for row actions)
  visible?: (item: TView) => boolean;                // Predicate controlling render visibility
  disabled?: boolean;
  loading?: boolean;
}
```

### SurfacePermissionsConfig

Permission configuration accepted by every surface's `permissions` field. Lightweight and RBAC-agnostic.

```typescript
interface SurfacePermissionsConfig {
  granted?: string[];                                // Flat list of granted permission strings
  fields?: Record<string, SurfacePermissionRule | undefined>;   // Per-field rules by fieldId
  actions?: Record<string, SurfacePermissionRule | undefined>;  // Per-action rules by action id
  tabs?: Record<string, SurfacePermissionRule | undefined>;     // Per-tab rules by tab key
  isAllowed?: (input: {                              // Dynamic callback escape hatch
    kind: 'field' | 'action' | 'tab';
    id: string;
    permission?: string;
  }) => boolean;
}
```

### SurfacePermissionRule

```typescript
interface SurfacePermissionRule {
  permission: string;    // Must be present in `granted` or pass `isAllowed`
  reason?: string;       // Human-readable denial reason (tooltip text)
}
```

### SurfaceTabbedView

Shared tabbed view descriptor used by Settings, Visualization, Header surfaces.

```typescript
interface SurfaceTabbedView {
  key: string;
  label: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
  permissionId?: string;
}
```

---

## Per-Surface Config Interfaces

### ListSurfaceConfig\<TView\>

```typescript
interface ListSurfaceConfig<TView> {
  visual: ListSurfaceVisualConfig;
  presentation: ListSurfacePresentationConfig<TView>;
  behavior: ListSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `defaultView`, `mobileDefaultView`, `allowViewSwitch`, `hideViewSwitchOnMobile`, `cardMinWidth`, `compact`, `stickyHeader`, `maxHeight`, `mobileFiltersLayout`

**Presentation**: `chrome`, `emptyState`, `toolbarStart`, `toolbarEnd`, `renderCard`, `renderCell`

**Behavior**: `columns` (SurfaceColumn\<TView\>[]), `filters`, `filterValues`, `onFilterChange`, `onFilterReset`, `onFilterApply`, `pagination`, `rowKey`, `sorting`, `onSortChange`, `primaryAction`, `rowActions`, `onRowClick`

Supporting types: `ListSurfaceView` ('table' | 'cards'), `SurfaceColumn<TView>` (extends ColumnDef with fieldId, hideInCards, hideInTable)

### DashboardSurfaceConfig

```typescript
interface DashboardSurfaceConfig {
  visual: DashboardSurfaceVisualConfig;
  presentation: DashboardSurfacePresentationConfig;
  behavior: DashboardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `statsColumns`, `mobileStatsLimit`, `sectionsColumns`, `mobileSectionsColumns`, `stackSectionsOnMobile`

**Presentation**: `chrome`, `headerContent`, `sections` (DashboardSurfaceSection[])

**Behavior**: `stats` (StatDef[]), `headerActions`, `onStatClick`

Supporting types: `DashboardSurfaceSection` (key, title, description, content, span, chrome, actions, mobilePriority, hideOnMobile, mobileSpan)

### DetailSurfaceConfig\<TView\>

```typescript
interface DetailSurfaceConfig<TView> {
  visual: DetailSurfaceVisualConfig;
  presentation: DetailSurfacePresentationConfig<TView>;
  behavior: DetailSurfaceBehaviorConfig<TView>;
  permissions?: SurfacePermissionsConfig;
  emptyState?: ReactNode;
}
```

**Visual**: `sidebarPosition`, `sidebarWidth`, `collapseSidebarOnMobile`

**Presentation**: `chrome` (partial: breadcrumbs, maxWidth, back), `title(item)`, `subtitle(item)`, `avatar(item)`, `status(item)`, `tabs` (DetailSurfaceTab\<TView\>[]), `sidebar(item)`, `headerExtra(item)`, `footer(item)`

**Behavior**: `actions`, `activeTab`, `onTabChange`

Supporting types: `DetailSurfaceTab<TView>` (key, label, icon, badge, disabled, visible, permissionId, content(item))

### FormSurfaceConfig

```typescript
interface FormSurfaceConfig {
  visual: FormSurfaceVisualConfig;
  presentation: FormSurfacePresentationConfig;
  behavior: FormSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `layout`, `columns`, `maxWidth`, `stackOnMobile`, `stackOnTablet`, `hideAsideOnMobile`, `mobileActionsSticky`

**Presentation**: `chrome`, `description`, `error`, `aside`, `renderField`

**Behavior**: `fields` (SurfaceFieldDef[]), `initialValues`, `values`, `onChange`, `onValidationChange`, `submitAction`, `cancelAction`, `disabled`, `readOnly`, `showLabels`, `showRequired`, `stepLabels`, `currentStep`, `onStepChange`

Supporting types: `SurfaceFieldDef` (extends FieldDef with optional fieldId)

### WizardSurfaceConfig

```typescript
interface WizardSurfaceConfig {
  visual: WizardSurfaceVisualConfig;
  presentation: WizardSurfacePresentationConfig;
  behavior: WizardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `maxWidth`, `orientation`, `showProgress`, `allowSkip`, `stackOnMobile`, `stackOnTablet`, `compactStepsOnMobile`

**Presentation**: `chrome`, `description`, `error`, `aside` (static or context-aware), `emptyState`, `footer` (static or context-aware), `renderField`

**Behavior**: `steps` (WizardSurfaceStepConfig[]), `initialValues`, `values`, `onChange`, `onValidationChange`, `submitAction`, `currentStep`, `onStepChange`, `nextLabel`, `prevLabel`, `skipLabel`, `cancelAction`, `saveDraftAction`, `disabled`, `readOnly`, `showLabels`, `showRequired`

Supporting types: `WizardSurfaceStepConfig` (key, title, description, icon, optional, fields, content, validate, layout, columns), `WizardSurfaceStepRenderContext` (values, currentStep, stepIndex, isLastStep, setValues, goToStep)

### ChatSurfaceConfig

```typescript
interface ChatSurfaceConfig {
  visual: ChatSurfaceVisualConfig;
  presentation: ChatSurfacePresentationConfig;
  behavior: ChatSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `maxWidth`, `sidebarWidth`, `composerRows`, `transcriptHeight`, `stackOnMobile`, `stackOnTablet`, `hideListOnMobile`, `stickyInputOnMobile`

**Presentation**: `chrome`, `headerContent`, `sidebar`, `emptyState`, `composerPlaceholder`, `renderMessage`, `renderPart`, `footer`

**Behavior**: `messages` (ChatSurfaceMessage[]), `draft`, `onDraftChange`, `onSend`, `sendLabel`, `sending`, `assistantTyping`, `typingLabel`, `actions`

Supporting types: `ChatSurfaceMessage` (id, author, body, parts, timestamp, avatar, meta, attachments, status, align, role, deliveryStatus, streaming)

### SettingsSurfaceConfig

```typescript
interface SettingsSurfaceConfig {
  visual: SettingsSurfaceVisualConfig;
  presentation: SettingsSurfacePresentationConfig;
  behavior: SettingsSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `maxWidth`, `tabsType`, `centeredTabs`, `stackOnMobile`, `stackOnTablet`, `collapseSidebarOnMobile`

**Presentation**: `chrome`, `intro`, `sidebar`, `footer`

**Behavior**: `tabs` (SurfaceTabbedView[]), `activeTab`, `onTabChange`, `actions`

### AuditSurfaceConfig

```typescript
interface AuditSurfaceConfig {
  visual: AuditSurfaceVisualConfig;
  presentation: AuditSurfacePresentationConfig;
  behavior: AuditSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `density` ('compact' | 'comfortable'), `maxHeight`, `stackOnMobile`, `compactEntriesOnMobile`

**Presentation**: `chrome`, `renderEntry`

**Behavior**: `columns` (AuditColumn[]), `entries` (AuditEntry[]), `filters` (AuditFilter[]), `filterValues`, `onFilterChange`, `pagination`, `onExport`

Supporting types: `AuditEntry` (id, timestamp, actor, action, resource, details, severity, metadata), `AuditColumn` (key, label, width, sortable, render), `AuditFilter` (key, label, type, options, placeholder)

### KanbanSurfaceConfig

```typescript
interface KanbanSurfaceConfig {
  visual: KanbanSurfaceVisualConfig;
  presentation: KanbanSurfacePresentationConfig;
  behavior: KanbanSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

**Visual**: `maxWidth`, `columnMinWidth`, `columnGap`, `mobileColumnsLimit`, `stackColumnsOnMobile`

**Presentation**: `chrome`, `emptyState`, `renderCard`, `renderColumnHeader`

**Behavior**: `columns` (KanbanSurfaceColumn[]), `onCardMove`, `onCardCreate`, `onCardClick`, `filters`, `filterValues`, `onFilterChange`, `actions`

Supporting types: `KanbanSurfaceCard` (id, title, description, meta, tags, assignee, priority, data), `KanbanSurfaceColumn` (id, title, items, limit, color)

---

## Additional Surface Configs (abbreviated)

### HeaderSurfaceConfig
Visual: `maxWidth`, `tabsType`, `centeredTabs`, `compactOnMobile`, `hideSecondaryActionsOnMobile`. Presentation: `chrome`, `description`, `metadata`, `actionsStart`, `headerContent`, `footer`. Behavior: `actions`, `tabs` (SurfaceTabbedView[]), `activeTab`, `onTabChange`.

### SidebarSurfaceConfig
Visual: `sidebarWidth`, `collapsedWidth`, `asideWidth`, `collapsible`, `bordered`, `stackOnMobile`, `stackOnTablet`, `collapseOnMobile`. Presentation: `sidebar`, `content`, `header`, `footer`, `aside`. Behavior: `collapsed`, `onCollapsedChange`, `toggleLabel`, `actions`.

### DetailFormSurfaceConfig
Visual: `maxWidth`, `formSpan`, `summarySpan`, `layout` ('split' | 'stacked'), `columns`, `stackOnMobile`, `stackOnTablet`, `hideAsideOnMobile`. Presentation: `chrome`, `description`, `error`, `summary`, `summaryTitle`, `aside`, `footer`, `renderField`. Behavior: form fields + `secondaryActions`.

### VisualizationSurfaceConfig
Visual: `maxWidth`, `tabsType`, `centeredTabs`, `stackOnMobile`, `stackOnTablet`, `compactChartsOnMobile`. Presentation: `chrome`, `intro`, `emptyState`, `aside`, `footer`. Behavior: `actions`, `stats`, `views` (SurfaceTabbedView[]), `activeView`, `onViewChange`.

### SearchSurfaceConfig
Visual: `layout` ('stack' | 'split'), `maxWidth`, `resultMinWidth`, `minQueryLength`, `stackOnMobile`, `stackOnTablet`, `stickySearchOnMobile`. Presentation: `chrome`, `placeholder`, `emptyQueryState`, `emptyResultsState`, `resultPreview`, `renderResult`, `footer`. Behavior: `query`, `onQueryChange`, `onQuerySubmit`, `results`, `selectedResultId`, `onSelectResult`, filters, `resultActions`.

### EditorSurfaceConfig
Visual: `maxWidth`, `layout` ('stack' | 'split'), `editorMinHeight`, `previewWidth`, `stackOnMobile`, `stackOnTablet`, `hideToolbarOnMobile`, `compactToolbarOnMobile`. Presentation: `chrome`, `description`, `toolbar`, `preview`, `helperText`, `statusBar`, `renderEditor`. Behavior: `value`, `initialValue`, `onChange`, `placeholder`, `saveAction`, `publishAction`, `cancelAction`, `disabled`, `readOnly`, `saving`.

### OperationalSurfaceConfig\<TFeed\>
Visual: `maxWidth`, `sectionsColumns`, `mobileSectionsColumns`, `feedHeight`, `stackOnMobile`, `stackOnTablet`, `mobileStatsLimit`, `mobileQueuePosition`, `mobileFeedPosition`, `hideSecondaryPanelOnMobile`, `stackSectionsOnMobile`. Presentation: `chrome`, `intro`, `queue`, `primaryPanel`, `secondaryPanel`, `sections`, `emptyState`, `footer`. Behavior: `stats`, `actions`, `refreshAction`, `feed` (OperationalSurfaceFeedConfig).

### MediaSurfaceConfig
Visual: `maxWidth`, `columns`, `layout` ('gallery' | 'detail'), `previewHeight`, `detailsWidth`, `stackOnMobile`, `stackOnTablet`, `mobileColumnsLimit`. Presentation: `chrome`, `emptyState`, `renderGridItem`, `renderPreview`, `renderDetails`, `footer`. Behavior: `items`, `selectedItemId`, `onSelectItem`, `actions`, `itemActions`.

### SchedulerSurfaceConfig
Visual: `maxWidth`, `height`, `sidebarWidth`, `defaultView`, `stackOnMobile`, `stackOnTablet`, `mobileView`, `hideTimelineOnMobile`. Presentation: `chrome`, `toolbarStart`, `toolbarEnd`, `sidebar`, `emptyState`, `renderEvent`, `footer`. Behavior: `events`, `currentDate`, `activeView`, `onDateChange`, `onViewChange`, `onEventClick`, `onDateClick`, `actions`.

### CompareSurfaceConfig
Visual: `maxWidth`, `compact`, `stackOnMobile`, `mobileCompareLimit`. Presentation: `chrome`, `intro`, `emptyState`, `footer`. Behavior: `subjects`, `sections`, `actions`.

### AuthSurfaceConfig
Visual: `maxWidth`, `layout` ('split' | 'centered'), `heroPosition`, `stackOnMobile`, `stackOnTablet`, `compactFormOnMobile`. Presentation: `eyebrow`, `title`, `subtitle`, `form`, `hero`, `mobileHero`, `footer`, `legal`, `topBar`. Behavior: `actions`. NOTE: No SurfacePageChrome (renders outside app shell).

### MarketingSurfaceConfig
Visual: `maxWidth`, `heroPosition`, `stackOnMobile`, `stackOnTablet`. Presentation: `topBar`, `eyebrow`, `badge`, `title`, `description`, `supporting`, `mobileSupporting`, `hero`, `mobileHero`, `sections`, `footer`. Behavior: `actions`.

### OnboardingSurfaceConfig
Visual: `maxWidth`, `heroPosition`, `orientation`, `showProgress`, `allowSkip`, `stackOnMobile`, `stackOnTablet`, `hideIllustrationOnMobile`. Presentation: `chrome`, `description`, `hero`, `checklist`, `footer`, `renderField`, `emptyState`. Behavior: reuses `WizardSurfaceBehaviorConfig`.

### EmptyStateSurfaceConfig
Visual: `maxWidth`, `compactOnMobile`, `hideIllustrationOnMobile`. Presentation: `chrome?`, `title`, `description`, `icon`, `content`. Behavior: `primaryAction`, `secondaryAction`.

### BillingSurfaceConfig
Visual: `layout` ('tabs' | 'sections'), `stackOnMobile`, `collapseSidebarOnMobile`. Presentation: `chrome`, `renderPlan`. Behavior: `currentPlan`, `usage`, `invoices`, `paymentMethods`, `onUpgrade`, `onCancel`, `onDownloadInvoice`.

### ProfileSurfaceConfig
Visual: `layout` ('sidebar' | 'stacked'), `stackOnMobile`, `collapseSidebarOnMobile`. Presentation: `chrome`, `avatar`, `header`. Behavior: `sections`, `onSave`, `onAvatarChange`, `onPasswordChange`, `onDeleteAccount`.

### NotificationSurfaceConfig
Visual: `layout` ('tabs' | 'sections'), `stackOnMobile`, `compactItemsOnMobile`. Presentation: `chrome`, `emptyState`. Behavior: `notifications`, `preferences`, `onPreferenceChange`, `onMarkRead`, `onMarkAllRead`, `onDelete`, `pagination`.

### TeamSurfaceConfig
Visual: `maxWidth`, `layout` ('table' | 'cards'), `stackOnMobile`, `mobileDefaultView`. Presentation: `chrome`, `emptyState`, `renderMember`. Behavior: `members`, `roles`, `onInvite`, `onRemove`, `onRoleChange`, `onEditMember`, `actions`.

### IntegrationSurfaceConfig
Visual: `maxWidth`, `layout` ('tabs' | 'sections'), `stackOnMobile`, `compactCardsOnMobile`. Presentation: `chrome`, `emptyState`. Behavior: `apiKeys`, `webhooks`, `connectedApps`, CRUD callbacks, `actions`.

### ImportExportSurfaceConfig
Visual: `maxWidth`, `stackOnMobile`. Presentation: `chrome`, `emptyState`. Behavior: `mode` ('import' | 'export' | 'both'), `importConfig`, `exportConfig`, `history`.

### ReportSurfaceConfig
Visual: `layout` ('sidebar-filters' | 'top-filters'), `maxWidth`, `stackSectionsOnMobile`, `compactChartsOnMobile`. Presentation: `chrome`, `renderChart`, `emptyState`. Behavior: `templates`, `selectedTemplate`, filters, `onGenerate`, `onExport`, `onSchedule`, `reportData`, `generating`.

### FileBrowserSurfaceConfig
Visual: `maxWidth`, `viewMode` ('grid' | 'list'), `mobileView`, `stackOnMobile`. Presentation: `chrome`, `emptyState`, `renderFileIcon`. Behavior: `files`, `folders`, `currentPath`, `selectedItems`, `onUpload`, `onDelete`, `onNavigate`, `onSelectionChange`, `onViewModeChange`, `onRename`, `actions`.

### PricingSurfaceConfig
Visual: `maxWidth`, `stackOnMobile`, `compactColumnsOnMobile`. Presentation: `chrome`, `intro`, `footer`, `renderPlanHeader`. Behavior: `plans`, `features`, `currentPlan`, `onSelectPlan`, `billingCycle`, `onBillingCycleChange`, `currency`, `actions`.

### ActivitySurfaceConfig
Visual: `maxWidth`, `compactEntriesOnMobile`, `stackOnMobile`. Presentation: `chrome`, `emptyState`, `renderActivity`. Behavior: `activities`, `filters`, `onFilterChange`, `actionTypes`, `users`, `onActivityClick`, `pagination`, `actions`.

---

## Source Location

```
ui-design-system/packages/core/src/components/surfaces/types.ts
```
