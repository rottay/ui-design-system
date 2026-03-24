# Surface Catalog

Surfaces are the page-level API layer of the Rottay Design System. They centralize repeated page mechanics (chrome, loading, filtering, tables, cards, forms, detail shells) while keeping product-specific rendering in the app.

Source contracts: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/types.ts`
Source exports: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/index.ts`
Source builders: `/Users/daniel/Developer/Rottay/ui-design-system/packages/core/src/components/surfaces/builders.ts`

---

## Ownership Model

**The DS owns:**
- Chrome (title, breadcrumbs, back button, badge)
- Layout (sidebar, tabs, split views)
- Loading / empty / error states
- Action placement and permission gating
- Tabs/views switching
- Responsive page mechanics

**The app owns:**
- Data fetching
- Entity adapters
- Custom renderers
- Event handlers
- Business rules

---

## Common Config Structure

Every surface config follows the four-section contract:

```ts
interface SurfaceConfig {
  visual: { ... };        // Layout dimensions, density, responsive breakpoints
  presentation: { ... };  // Chrome, slots, renderers, static content
  behavior: { ... };      // Data, actions, callbacks, state
  permissions?: SurfacePermissionsConfig;  // Field/action/tab permission rules
}
```

### SurfacePageChrome

Most surfaces include a `chrome` field in their `presentation` config:

```ts
interface SurfacePageChrome {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: SurfaceBreadcrumb[];
  badge?: ReactNode;
  maxWidth?: number | string;
  back?: { label?: string; onClick: () => void };
}
```

### SurfacePermissionsConfig

```ts
interface SurfacePermissionsConfig {
  granted?: string[];                                    // Granted permission strings
  fields?: Record<string, SurfacePermissionRule>;        // Per-field rules
  actions?: Record<string, SurfacePermissionRule>;       // Per-action rules
  tabs?: Record<string, SurfacePermissionRule>;          // Per-tab rules
  isAllowed?: (input: { kind; id; permission? }) => boolean;  // Dynamic callback
}
```

### EntityAdapter

The adapter boundary between raw domain data and the shape a surface consumes:

```ts
interface EntityAdapter<TRaw, TView> {
  entity: string;          // Entity name (e.g. 'user')
  version: string;         // Adapter version
  map: (raw: TRaw) => TView;  // Transform function
  fields: EntityFieldMeta<TView>[];  // Field metadata with stable fieldId
}
```

---

## Surface Catalog (28 surfaces)

### 1. PageShellSurface

Base page shell for chrome, title, subtitle, breadcrumbs, actions, and loading.

| Aspect | Details |
|--------|---------|
| **Builder** | None (used internally by other surfaces) |
| **Config structure** | Uses `SurfacePageChrome` directly |
| **Key features** | Title, subtitle, breadcrumbs, badge, back button, actions, loading state |
| **EntityAdapter support** | No |
| **i18n support** | Yes (chrome labels) |
| **Responsive** | Max-width constraint, stacks on mobile |

---

### 2. HeaderSurface

Page header with optional tabs, metadata, header content, and actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createHeaderSurfaceConfig` |
| **Visual** | `maxWidth`, `tabsType`, `centeredTabs` |
| **Presentation** | `chrome`, `description`, `metadata`, `actionsStart`, `headerContent`, `footer` |
| **Behavior** | `actions: SurfaceAction[]`, `tabs: SurfaceTabbedView[]`, `activeTab`, `onTabChange` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (tab labels, action labels) |
| **Responsive** | Max-width constraint, tabs stack on small screens |

---

### 3. SidebarSurface

Main layout with sidebar, content, optional aside, header, and footer. Supports collapsible sidebar.

| Aspect | Details |
|--------|---------|
| **Builder** | `createSidebarSurfaceConfig` |
| **Visual** | `sidebarWidth`, `collapsedWidth`, `asideWidth`, `collapsible`, `bordered`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `sidebar`, `content`, `header`, `footer`, `aside` (all ReactNode) |
| **Behavior** | `collapsed`, `onCollapsedChange`, `toggleLabel`, `actions` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (toggle label) |
| **Responsive** | Sidebar stacks below content on mobile/tablet when enabled |

---

### 4. ListSurface

Toolbar, filters, table/cards view, pagination, row actions, and view switching.

| Aspect | Details |
|--------|---------|
| **Builder** | `createListSurfaceConfig<TView>` |
| **Visual** | `defaultView` ('table' or 'cards'), `allowViewSwitch`, `cardMinWidth`, `compact`, `stickyHeader`, `maxHeight` |
| **Presentation** | `chrome`, `emptyState`, `toolbarStart`, `toolbarEnd`, `renderCard`, `renderCell` |
| **Behavior** | `columns`, `filters`, `filterValues`, `onFilterChange`, `onFilterReset`, `onFilterApply`, `pagination`, `rowKey`, `sorting`, `onSortChange`, `primaryAction`, `rowActions`, `onRowClick` |
| **EntityAdapter support** | Yes (via `SurfaceColumn<TView>.fieldId`) |
| **i18n support** | Yes (filter labels, column headers, action labels, empty state) |
| **Responsive** | Switches to card view on small screens, sticky header, max-height scroll |

---

### 5. DashboardSurface

Stats grid + configurable sections with header actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createDashboardSurfaceConfig` |
| **Visual** | `statsColumns`, `sectionsColumns` (GridColumns) |
| **Presentation** | `chrome`, `headerContent`, `sections: DashboardSurfaceSection[]` |
| **Behavior** | `stats: StatDef[]`, `headerActions`, `onStatClick` |
| **EntityAdapter support** | No (app provides section content directly) |
| **i18n support** | Yes (stat labels, section titles) |
| **Responsive** | Stats and sections reflow based on grid columns |

---

### 6. DetailSurface

Entity detail view with tabs, sidebar, footer, status, and actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createDetailSurfaceConfig<TView>` |
| **Visual** | `sidebarPosition`, `sidebarWidth` |
| **Presentation** | `chrome`, `title(item)`, `subtitle(item)`, `avatar(item)`, `status(item)`, `tabs`, `sidebar(item)`, `headerExtra(item)`, `footer(item)` |
| **Behavior** | `actions`, `activeTab`, `onTabChange` |
| **EntityAdapter support** | Yes (all presentation functions receive `TView`) |
| **i18n support** | Yes (tab labels, action labels, status labels) |
| **Responsive** | Sidebar stacks below content on mobile |

---

### 7. FormSurface

Form page shell built on `PatternFormBuilder`.

| Aspect | Details |
|--------|---------|
| **Builder** | `createFormSurfaceConfig` |
| **Visual** | `layout`, `columns`, `maxWidth`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `description`, `error`, `aside`, `renderField` |
| **Behavior** | `fields: SurfaceFieldDef[]`, `initialValues`, `values`, `onChange`, `onValidationChange`, `submitAction`, `cancelAction`, `disabled`, `readOnly`, `showLabels`, `showRequired`, `stepLabels`, `currentStep`, `onStepChange` |
| **EntityAdapter support** | Yes (via `SurfaceFieldDef.fieldId`) |
| **i18n support** | Yes (field labels, button labels, error messages) |
| **Responsive** | Stacks columns on mobile/tablet when enabled |

---

### 8. DetailFormSurface

Split layout between form and summary/aside.

| Aspect | Details |
|--------|---------|
| **Builder** | `createDetailFormSurfaceConfig` |
| **Visual** | `maxWidth`, `formSpan`, `summarySpan`, `layout` ('split' or 'stacked'), `columns`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `description`, `error`, `summary`, `summaryTitle`, `aside`, `footer`, `renderField` |
| **Behavior** | `fields`, `initialValues`, `values`, `onChange`, `onValidationChange`, `submitAction`, `cancelAction`, `secondaryActions`, `disabled`, `readOnly`, `showLabels`, `showRequired` |
| **EntityAdapter support** | Yes (via `SurfaceFieldDef.fieldId`) |
| **i18n support** | Yes |
| **Responsive** | Stacks to single column on mobile/tablet |

---

### 9. WizardSurface

Multi-step wizard with configurable steps, submit/cancel/draft actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createWizardSurfaceConfig` |
| **Visual** | `maxWidth`, `orientation`, `showProgress`, `allowSkip`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `description`, `error`, `aside`, `emptyState`, `footer`, `renderField` |
| **Behavior** | `steps: WizardSurfaceStepConfig[]`, `initialValues`, `values`, `onChange`, `onValidationChange`, `submitAction`, `currentStep`, `onStepChange`, `nextLabel`, `prevLabel`, `skipLabel`, `cancelAction`, `saveDraftAction`, `disabled`, `readOnly` |
| **EntityAdapter support** | Yes (via step field definitions) |
| **i18n support** | Yes (step labels, button labels) |
| **Responsive** | Vertical orientation on mobile |

Each step has: `key`, `title`, `description`, `icon`, `optional`, `fields`, `content` (ReactNode or render function with context), `validate`, `layout`, `columns`.

---

### 10. VisualizationSurface

Tabs/views for dashboards or analytics with stats, intro, and footer.

| Aspect | Details |
|--------|---------|
| **Builder** | `createVisualizationSurfaceConfig` |
| **Visual** | `maxWidth`, `tabsType`, `centeredTabs`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `intro`, `emptyState`, `aside`, `footer` |
| **Behavior** | `actions`, `stats: StatDef[]`, `views: SurfaceTabbedView[]`, `activeView`, `onViewChange` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (view labels, stat labels) |
| **Responsive** | Views stack on mobile |

---

### 11. SearchSurface

Query + filters + result list + preview/detail.

| Aspect | Details |
|--------|---------|
| **Builder** | `createSearchSurfaceConfig` |
| **Visual** | `layout` ('stack' or 'split'), `maxWidth`, `resultMinWidth`, `minQueryLength`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `placeholder`, `emptyQueryState`, `emptyResultsState`, `resultPreview`, `renderResult`, `footer` |
| **Behavior** | `query`, `onQueryChange`, `onQuerySubmit`, `results: SearchSurfaceResult[]`, `selectedResultId`, `onSelectResult`, `filters`, `filterValues`, `onFilterChange`, `onFilterReset`, `onFilterApply`, `actions`, `resultActions` |
| **EntityAdapter support** | Yes (results have stable `id`) |
| **i18n support** | Yes (placeholder, empty states) |
| **Responsive** | Split layout stacks on mobile |

---

### 12. EditorSurface

Editor shell with toolbar, preview, helper text, and save/publish actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createEditorSurfaceConfig` |
| **Visual** | `maxWidth`, `layout` ('stack' or 'split'), `editorMinHeight`, `previewWidth`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `description`, `toolbar`, `preview`, `helperText`, `statusBar`, `renderEditor` |
| **Behavior** | `value`, `initialValue`, `onChange`, `placeholder`, `saveAction`, `publishAction`, `cancelAction`, `disabled`, `readOnly`, `saving` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (action labels, placeholder) |
| **Responsive** | Preview stacks below editor on mobile |

---

### 13. OperationalSurface

Stats + queue + panels + live feed for operational workflows.

| Aspect | Details |
|--------|---------|
| **Builder** | `createOperationalSurfaceConfig<TFeed>` |
| **Visual** | `maxWidth`, `sectionsColumns`, `feedHeight`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `intro`, `queue`, `primaryPanel`, `secondaryPanel`, `sections`, `emptyState`, `footer` |
| **Behavior** | `stats`, `actions`, `refreshAction`, `feed: OperationalSurfaceFeedConfig<TFeed>` |
| **EntityAdapter support** | Yes (feed items via generic TFeed) |
| **i18n support** | Yes |
| **Responsive** | Panels and feed stack on mobile |

Feed config includes: `items`, `renderItem`, `onRefresh`, `autoRefresh`, `emptyState`, `newItemsCount`, `onShowNewItems`, `onLoadMore`, `hasMore`, `maxItems`, `maxHeight`, `header`.

---

### 14. MediaSurface

Gallery/detail view with preview, metadata, and item actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createMediaSurfaceConfig` |
| **Visual** | `maxWidth`, `columns`, `layout` ('gallery' or 'detail'), `previewHeight`, `detailsWidth`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `emptyState`, `renderGridItem`, `renderPreview`, `renderDetails`, `footer` |
| **Behavior** | `items: MediaSurfaceItem[]`, `selectedItemId`, `onSelectItem`, `actions`, `itemActions` |
| **EntityAdapter support** | Yes (items have stable `id` and typed fields) |
| **i18n support** | Yes |
| **Responsive** | Gallery grid reflows, detail stacks on mobile |

MediaSurfaceItem: `id`, `src`, `alt`, `thumbnailSrc`, `title`, `description`, `meta`, `type` ('image'|'video'|'audio'|'document'), `data`.

---

### 15. ChatSurface

Transcript + composer + sidebar. Supports streaming, tool status blocks, attachments, and typing indicator.

| Aspect | Details |
|--------|---------|
| **Builder** | `createChatSurfaceConfig` |
| **Visual** | `maxWidth`, `sidebarWidth`, `composerRows`, `transcriptHeight`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `headerContent`, `sidebar`, `emptyState`, `composerPlaceholder`, `renderMessage`, `renderPart`, `footer` |
| **Behavior** | `messages: ChatSurfaceMessage[]`, `draft`, `onDraftChange`, `onSend`, `sendLabel`, `sending`, `assistantTyping`, `typingLabel`, `actions` |
| **EntityAdapter support** | Yes (messages have stable `id`, typed `parts`) |
| **i18n support** | Yes (composer placeholder, send label, typing label) |
| **Responsive** | Sidebar collapses on mobile |

ChatSurfaceMessage: `id`, `author`, `body`, `parts: AssistantMessagePart[]`, `timestamp`, `avatar`, `meta`, `attachments`, `status`, `align`, `role`, `deliveryStatus`, `streaming`.

---

### 16. SchedulerSurface

Calendar shell with month/week/day views, toolbar, and sidebar.

| Aspect | Details |
|--------|---------|
| **Builder** | `createSchedulerSurfaceConfig` |
| **Visual** | `maxWidth`, `height`, `sidebarWidth`, `defaultView` ('month'|'week'|'day'), `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `toolbarStart`, `toolbarEnd`, `sidebar`, `emptyState`, `renderEvent`, `footer` |
| **Behavior** | `events: CalendarEvent[]`, `currentDate`, `activeView`, `onDateChange`, `onViewChange`, `onEventClick`, `onDateClick`, `actions` |
| **EntityAdapter support** | Yes (events use CalendarEvent interface) |
| **i18n support** | Yes (day/month names, view labels) |
| **Responsive** | Falls back to day view on mobile, sidebar collapses |

---

### 17. CompareSurface

Side-by-side comparison by sections, subjects, and rows.

| Aspect | Details |
|--------|---------|
| **Builder** | `createCompareSurfaceConfig` |
| **Visual** | `maxWidth`, `compact` |
| **Presentation** | `chrome`, `intro`, `emptyState`, `footer` |
| **Behavior** | `subjects: CompareSurfaceSubject[]`, `sections: CompareSurfaceSection[]`, `actions` |
| **EntityAdapter support** | No (app provides rendered values) |
| **i18n support** | Yes (section/row labels) |
| **Responsive** | Horizontal scroll on mobile for comparison table |

---

### 18. AuthSurface

Auth layouts with split and centered modes, hero, legal, and footer.

| Aspect | Details |
|--------|---------|
| **Builder** | `createAuthSurfaceConfig` |
| **Visual** | `maxWidth`, `layout` ('split' or 'centered'), `heroPosition` ('start' or 'end'), `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `title`, `subtitle`, `form`, `hero`, `footer`, `legal`, `topBar` |
| **Behavior** | `actions` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (title, subtitle, legal text) |
| **Responsive** | Split layout stacks on mobile, hero hidden on small screens |

---

### 19. OnboardingSurface

Guided onboarding flow based on WizardSurface with hero/checklist support.

| Aspect | Details |
|--------|---------|
| **Builder** | `createOnboardingSurfaceConfig` |
| **Visual** | `maxWidth`, `heroPosition`, `orientation`, `showProgress`, `allowSkip`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `description`, `hero`, `checklist`, `footer`, `renderField`, `emptyState` |
| **Behavior** | Inherits from `WizardSurfaceBehaviorConfig` (steps, values, onChange, submit, etc.) |
| **EntityAdapter support** | Yes (via step field definitions) |
| **i18n support** | Yes |
| **Responsive** | Vertical orientation on mobile, hero stacks |

---

### 20. EmptyStateSurface

Standalone empty state page with primary/secondary actions.

| Aspect | Details |
|--------|---------|
| **Builder** | `createEmptyStateSurfaceConfig` |
| **Visual** | `maxWidth` |
| **Presentation** | `chrome` (optional), `title`, `description`, `icon`, `content` |
| **Behavior** | `primaryAction`, `secondaryAction` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (title, description, action labels) |
| **Responsive** | Centered layout, scales naturally |

---

### 21. SettingsSurface

Tabs/config sections for settings pages.

| Aspect | Details |
|--------|---------|
| **Builder** | `createSettingsSurfaceConfig` |
| **Visual** | `maxWidth`, `tabsType`, `centeredTabs`, `stackOnMobile`, `stackOnTablet` |
| **Presentation** | `chrome`, `intro`, `sidebar`, `footer` |
| **Behavior** | `tabs: SurfaceTabbedView[]`, `activeTab`, `onTabChange`, `actions` |
| **EntityAdapter support** | No |
| **i18n support** | Yes (tab labels) |
| **Responsive** | Tabs switch to accordion on mobile |

---

### 22. AuditSurface

Audit log with columns, filters, pagination, and export.

| Aspect | Details |
|--------|---------|
| **Builder** | `createAuditSurfaceConfig` |
| **Visual** | `density` ('compact' or 'comfortable'), `maxHeight` |
| **Presentation** | `chrome`, `renderEntry` |
| **Behavior** | `columns: AuditColumn[]`, `entries: AuditEntry[]`, `filters: AuditFilter[]`, `filterValues`, `onFilterChange`, `pagination`, `onExport` (csv/json/pdf) |
| **EntityAdapter support** | Yes (entries have typed structure) |
| **i18n support** | Yes (column headers, filter labels) |
| **Responsive** | Horizontal scroll on small screens |

AuditEntry: `id`, `timestamp`, `actor`, `action`, `resource`, `details`, `severity` ('info'|'warning'|'critical'), `metadata`.

---

### 23. BillingSurface

Billing page with plan details, usage, invoices, and payment methods.

| Aspect | Details |
|--------|---------|
| **Builder** | `createBillingSurfaceConfig` |
| **Visual** | `layout` ('tabs' or 'sections') |
| **Presentation** | `chrome`, `renderPlan` |
| **Behavior** | `currentPlan: BillingPlan`, `usage: BillingUsage[]`, `invoices: BillingInvoice[]`, `paymentMethods: BillingPaymentMethod[]`, `onUpgrade`, `onCancel`, `onDownloadInvoice` |
| **EntityAdapter support** | Yes (typed plan, usage, invoice, payment structures) |
| **i18n support** | Yes (plan names, feature labels, status labels) |
| **Responsive** | Sections stack on mobile |

---

### 24. ProfileSurface

User profile with sections, avatar, password change, and account deletion.

| Aspect | Details |
|--------|---------|
| **Builder** | `createProfileSurfaceConfig` |
| **Visual** | `layout` ('sidebar' or 'stacked') |
| **Presentation** | `chrome`, `avatar`, `header` |
| **Behavior** | `sections: ProfileSection[]`, `onSave`, `onAvatarChange`, `onPasswordChange`, `onDeleteAccount` |
| **EntityAdapter support** | Yes (sections and fields are typed) |
| **i18n support** | Yes (section labels, field labels) |
| **Responsive** | Sidebar layout stacks on mobile |

ProfileSection: `key`, `label`, `icon`, `description`, `fields: ProfileField[]`.

---

### 25. NotificationSurface

Notification center with preferences management.

| Aspect | Details |
|--------|---------|
| **Builder** | `createNotificationSurfaceConfig` |
| **Visual** | `layout` ('tabs' or 'sections') |
| **Presentation** | `chrome`, `emptyState` |
| **Behavior** | `notifications: SurfaceNotificationItem[]`, `preferences: NotificationPreference[]`, `onPreferenceChange`, `onMarkRead`, `onMarkAllRead`, `onDelete`, `pagination` |
| **EntityAdapter support** | Yes (typed notification and preference structures) |
| **i18n support** | Yes (notification types, preference labels) |
| **Responsive** | Sections stack on mobile |

---

### 26. ImportExportSurface

Data import/export with field mapping, templates, and history.

| Aspect | Details |
|--------|---------|
| **Builder** | `createImportExportSurfaceConfig` |
| **Visual** | `maxWidth` |
| **Presentation** | `chrome`, `emptyState` |
| **Behavior** | `mode` ('import'|'export'|'both'), `importConfig` (acceptedFormats, templateUrl, onUpload, onConfirm), `exportConfig` (formats, fields, onExport), `history` |
| **EntityAdapter support** | Yes (field mappings reference entity fields) |
| **i18n support** | Yes (format labels, field labels, status labels) |
| **Responsive** | Single-column layout |

---

### 27. ReportSurface

Report builder with templates, filters, generation, and export.

| Aspect | Details |
|--------|---------|
| **Builder** | `createReportSurfaceConfig` |
| **Visual** | `layout` ('sidebar-filters' or 'top-filters'), `maxWidth` |
| **Presentation** | `chrome`, `renderChart`, `emptyState` |
| **Behavior** | `templates: ReportTemplate[]`, `selectedTemplate`, `onTemplateSelect`, `filters: ReportFilter[]`, `filterValues`, `onFilterChange`, `onGenerate`, `onExport` (pdf/excel/csv), `onSchedule`, `reportData`, `generating` |
| **EntityAdapter support** | No (app provides report data directly) |
| **i18n support** | Yes (template names, filter labels, format labels) |
| **Responsive** | Sidebar filters switch to top layout on mobile |

---

## Builder Functions

Builder functions are identity functions that exist solely for TypeScript inference. They have zero runtime cost.

```ts
// All available builders
createListSurfaceConfig<TView>(config)
createDashboardSurfaceConfig(config)
createChatSurfaceConfig(config)
createDetailSurfaceConfig<TView>(config)
createFormSurfaceConfig(config)
createWizardSurfaceConfig(config)
createHeaderSurfaceConfig(config)
createSidebarSurfaceConfig(config)
createDetailFormSurfaceConfig(config)
createVisualizationSurfaceConfig(config)
createSearchSurfaceConfig(config)
createEditorSurfaceConfig(config)
createOperationalSurfaceConfig<TFeed>(config)
createMediaSurfaceConfig(config)
createSchedulerSurfaceConfig(config)
createCompareSurfaceConfig(config)
createAuthSurfaceConfig(config)
createOnboardingSurfaceConfig(config)
createEmptyStateSurfaceConfig(config)
createSettingsSurfaceConfig(config)
createAuditSurfaceConfig(config)
createBillingSurfaceConfig(config)
createProfileSurfaceConfig(config)
createNotificationSurfaceConfig(config)
createImportExportSurfaceConfig(config)
createReportSurfaceConfig(config)
```

---

## Summary Table

| # | Surface | Builder | EntityAdapter | i18n | Responsive |
|---|---------|---------|---------------|------|------------|
| 1 | PageShell | - | No | Yes | Yes |
| 2 | Header | Yes | No | Yes | Yes |
| 3 | Sidebar | Yes | No | Yes | stackOnMobile/Tablet |
| 4 | List | Yes | Yes (fieldId) | Yes | Card fallback |
| 5 | Dashboard | Yes | No | Yes | Grid reflow |
| 6 | Detail | Yes | Yes (TView) | Yes | Sidebar stacks |
| 7 | Form | Yes | Yes (fieldId) | Yes | stackOnMobile/Tablet |
| 8 | DetailForm | Yes | Yes (fieldId) | Yes | stackOnMobile/Tablet |
| 9 | Wizard | Yes | Yes (fieldId) | Yes | Vertical on mobile |
| 10 | Visualization | Yes | No | Yes | Tabs stack |
| 11 | Search | Yes | Yes (id) | Yes | Split stacks |
| 12 | Editor | Yes | No | Yes | Preview stacks |
| 13 | Operational | Yes | Yes (TFeed) | Yes | stackOnMobile/Tablet |
| 14 | Media | Yes | Yes (id) | Yes | Grid reflow |
| 15 | Chat | Yes | Yes (parts) | Yes | Sidebar collapses |
| 16 | Scheduler | Yes | Yes (events) | Yes | Day view fallback |
| 17 | Compare | Yes | No | Yes | Horizontal scroll |
| 18 | Auth | Yes | No | Yes | Split stacks |
| 19 | Onboarding | Yes | Yes (fieldId) | Yes | Vertical on mobile |
| 20 | EmptyState | Yes | No | Yes | Centered |
| 21 | Settings | Yes | No | Yes | Accordion on mobile |
| 22 | Audit | Yes | Yes (entries) | Yes | Horizontal scroll |
| 23 | Billing | Yes | Yes (typed) | Yes | Sections stack |
| 24 | Profile | Yes | Yes (sections) | Yes | Sidebar stacks |
| 25 | Notification | Yes | Yes (typed) | Yes | Sections stack |
| 26 | ImportExport | Yes | Yes (mappings) | Yes | Single column |
| 27 | Report | Yes | No | Yes | Sidebar to top |
