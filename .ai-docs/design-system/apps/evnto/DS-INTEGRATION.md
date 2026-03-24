# Evnto Design System Integration

> Generated 2026-03-23. How app-evnto uses `@rottay/design-system`.

## DS Surface Patterns Used

Evnto uses **7 DS surface types**, each with a distinct config shape:

| DS Surface | Config Type | Used In | Count |
|-----------|-------------|---------|-------|
| `PatternDataTable` + `StatsHeader` | `createListSurfaceConfig<T>()` / `ListSurfaceConfig<T>` | events, staff, bar orders, products, suppliers, venues, artists, purchasing, payroll, staffing, time-tracking | 11 |
| `<DashboardSurface>` | `DashboardSurfaceConfig` | dashboard, bar, inventory, staff command, finance | 5 |
| `<DetailSurface>` | `DetailSurfaceConfig<T>` | staff detail, product detail | 2 |
| `<SchedulerSurface>` | `SchedulerSurfaceConfig` | scheduling calendar | 1 |
| `<OperationalSurface>` | `OperationalSurfaceConfig<T>` | event control room | 1 |
| `<SettingsSurface>` | `SettingsSurfaceConfig` | settings | 1 |
| `<FormSurface>` | `createFormSurfaceConfig()` | venue create (reference impl) | 1 |

### Note on List Pattern

Evnto's list surfaces use a **hybrid approach**: the config factory produces a `ListSurfaceConfig` or uses `createListSurfaceConfig()`, but the screen component renders `<PatternDataTable>` and `<StatsHeader>` from the DS directly rather than a unified `<ListSurface>` component. This gives screens more control over layout while still using DS primitives.

---

## DS Hooks Used

| Hook | Source | Usage |
|------|--------|-------|
| `useListController` | `@/hooks` (app-owned, wraps DS logic) | All list surfaces (12 modules). Manages pagination, sorting, filtering, search. |
| `useSurfacePermissions` | `@/surfaces/_shared/permissions` | 15+ surfaces. Converts auth context + permission maps into `SurfacePermissionsConfig`. |
| `useTenantBranding` | `@rottay/design-system` | Provider layer. 2-step branding (session config -> async DB config). |
| `toSupportedLocale` | `@rottay/design-system` | Provider layer. BCP-47 locale normalization. |

### useListController

App-owned hook at `app-evnto/src/hooks/use-list-controller/index.ts` that provides:
- Pagination state (page, pageSize)
- Sort state (sortBy, sortOrder)
- Filter state (filterValues, onFilterChange)
- Search state (searchQuery, onSearchChange)
- Total count tracking
- `setData()` / `setLoading()` / `setError()` state management

Every list surface screen follows this pattern:
```typescript
const controller = useListController({ defaultPageSize: 20 });
// ... fetch data ...
controller.setData(items, total);
// ... render PatternDataTable with controller state
```

### useSurfacePermissions

App-owned hook at `app-evnto/src/surfaces/_shared/permissions/use-surface-permissions.ts` that:
1. Reads user permissions from `useAuth()` context
2. Evaluates against domain-specific permission maps (from `permission-maps.ts`)
3. Returns `SurfacePermissionsConfig` for config factories

```typescript
const { permissions } = useSurfacePermissions({
  fieldPermissions: EVENT_FIELD_PERMISSIONS,
  actionPermissions: EVENT_ACTION_PERMISSIONS,
  tabPermissions: EVENT_TAB_PERMISSIONS,
});
```

---

## DS Components Used

### Layout & Structure
- `Box`, `Flex`, `Stack`, `Grid` - Core layout primitives (pervasive)
- `Card` - Content containers
- `Show`, `Hide`, `ResponsiveSlot` - Responsive visibility
- `ActionDock` - Mobile quick action bar (dashboard layout)

### Typography & Data Display
- `Text` - All text rendering (with `as` prop for semantic elements)
- `Badge` - Status badges in tables and cards
- `Skeleton` - Loading states

### Interactive
- `Button` - Actions (primary, ghost, danger, secondary variants)
- `Input`, `Select`, `Textarea`, `Switch` - Form controls
- `Tabs` - Tab navigation (settings, detail views)

### Feedback
- `toast` - Toast notifications (`toast.success`, `toast.error`, `toast.info`)
- `Toast.Container` - Toast mount point (in provider tree)

### Data
- `PatternDataTable` - Table rendering with sorting, pagination, row actions
- `StatsHeader` - KPI stat cards row (re-exported via `@/components/_shared/tables/stats-header`)

### Surface Components
- `DashboardSurface` - Dashboard layouts with stats, sections, actions
- `DetailSurface` - Entity detail with sidebar, tabs, status, actions
- `SchedulerSurface` - Calendar-based scheduling
- `OperationalSurface` - Live operations with feed, panels, sections
- `SettingsSurface` - Tabbed settings
- `FormSurface` - Declarative form rendering

### Config Helpers
- `createListSurfaceConfig()` - Type-safe list config builder
- `createFormSurfaceConfig()` - Type-safe form config builder

### Types (from DS)
- `EntityAdapter<Raw, View>` - Adapter contract
- `ListSurfaceConfig<T>` - List surface config shape
- `DashboardSurfaceConfig` - Dashboard config shape
- `DetailSurfaceConfig<T>` - Detail config shape
- `SchedulerSurfaceConfig` - Scheduler config shape
- `OperationalSurfaceConfig<T>` - Operational config shape
- `SettingsSurfaceConfig` - Settings config shape
- `SurfacePermissionsConfig` - Permission config for any surface
- `SurfacePermissionRule` - Individual permission rule
- `SurfaceAction<T>` - Action button definition
- `StatDef` - KPI stat definition
- `DashboardSurfaceSection` - Dashboard section definition
- `CalendarEvent` - Calendar event item
- `FeedItem` - Live feed item
- `BadgeVariant` - Badge color variants
- `SurfaceTabbedView` - Tab definition

---

## How Surfaces Compose DS Components

### List Surface Composition

```
SurfaceScreen (index.tsx)
  -> useSurfacePermissions()          // auth -> SurfacePermissionsConfig
  -> useListController()              // state management
  -> fetch data via server actions
  -> createXxxListConfig(deps)        // config factory
  -> <StatsHeader stats={...} />      // KPI row
  -> <PatternDataTable config={...} /> // data table
```

### Dashboard Surface Composition

```
SurfaceScreen (index.tsx)
  -> useSurfacePermissions()
  -> fetch data via server actions
  -> build DashboardSurfaceSection[] (section builder functions)
  -> createXxxDashboardConfig(deps)
  -> <DashboardSurface config={config} loading={loading} />
```

### Detail Surface Composition

```
SurfaceScreen (index.tsx)
  -> useSurfacePermissions()
  -> fetch data via server actions
  -> adapter.map(rawData)             // raw -> view
  -> createXxxDetailConfig(deps)      // with tabs, sidebar, actions
  -> <DetailSurface config={config} data={view} adapter={adapter} />
```

---

## StatsHeader Usage

`StatsHeader` is Evnto's most widely used DS component. It is a re-export:

```typescript
// app-evnto/src/components/_shared/tables/stats-header/index.tsx
export { StatsHeader, StatsHeader as default } from '@rottay/design-system';
export type { StatItem, StatsHeaderProps } from '@rottay/design-system';
```

Used in **30+ screens** across all modules. Typical usage:

```typescript
const stats: StatItem[] = [
  { label: "Total", value: totalCount, icon: Package },
  { label: "Active", value: activeCount, icon: CheckCircle, variant: "success" },
  { label: "Revenue", value: `$${revenue}`, icon: DollarSign, variant: "primary" },
];
<StatsHeader stats={stats} loading={loading} />
```

---

## What's Unique to Evnto vs Shared with BitHire

### Evnto-Only Patterns

1. **OperationalSurface** - Only used in Evnto's Event Control Room (live operations feed, 3-panel layout). BitHire has no real-time operational monitoring equivalent.

2. **SchedulerSurface** - Only used in Evnto's scheduling calendar. BitHire does not have shift scheduling.

3. **Dashboard Presets** - 5 role-based presets (executive, operations, bar-manager, staffing, finance) with KPI definitions and widget layouts. This preset system is Evnto-specific.

4. **FormSurface** - Evnto has a reference implementation (venue create). BitHire may have its own usage pattern.

5. **ActionDock** - Mobile quick actions in dashboard layout (Create Event, Add Staff, Add Product). Domain-specific to Evnto's three modules.

6. **Permission Maps** - Evnto has 15 domains of permission maps covering events, staff, bar, inventory, finance, analytics, season-passes, check-in, artists, venues, purchasing, suppliers, scheduling, payroll, time-tracking, staffing, credentials, VIP tables, and control room. BitHire's permission maps cover recruiting-specific domains.

7. **Domain Adapters** - Evnto has 25 EntityAdapters for its event/staff/bar domains. BitHire has adapters for recruiting-specific entities (candidates, jobs, pipelines, etc.).

### Shared Patterns (Same DS Integration)

1. **Config Factory Pattern** - Both apps use the same `create*Config(deps)` factory pattern to produce surface configs.

2. **Adapter Pattern** - Both use `EntityAdapter<Raw, View>` from the DS.

3. **PatternDataTable + StatsHeader** - Both apps use this hybrid for list views.

4. **DashboardSurface** - Both apps use `<DashboardSurface>` for dashboard pages.

5. **DetailSurface** - Both apps use `<DetailSurface>` for entity detail pages.

6. **SettingsSurface** - Both apps use `<SettingsSurface>` for settings.

7. **useSurfacePermissions** - Both apps have the same hook pattern for converting auth context to surface permissions.

8. **Cell Renderers** - Both share the same render utility pattern (`renderNameWithInitials`, `renderStatusDot`, etc.).

9. **Provider Tree** - Both apps use the same provider nesting: QueryClient -> SessionProvider -> AuthProvider -> I18nProvider -> DesignSystemProvider -> ToastProvider.

10. **Thin Page Pattern** - Both apps keep `page.tsx` files as thin wrappers that delegate to surface screens.

---

## DS Color Token Usage

Evnto strictly uses DS CSS variables per the CLAUDE.md rules:

- `var(--ds-color-primary)`, `var(--ds-color-primary-50)` .. `var(--ds-color-primary-900)`
- `var(--ds-color-success)`, `var(--ds-color-warning)`, `var(--ds-color-error)`, `var(--ds-color-info)`
- `var(--ds-color-text-primary)`, `var(--ds-color-text-secondary)`, `var(--ds-color-text-muted)`
- `var(--ds-color-bg-primary)`, `var(--ds-color-bg-secondary)`
- `var(--ds-color-border)`, `var(--ds-color-neutral-*)`

No hardcoded color values in surface files. This enables per-tenant white-labeling through the `DesignSystemProvider`.
