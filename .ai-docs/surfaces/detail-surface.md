# DetailSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/detail/index.tsx`

## Purpose

Reusable detail-page shell for entity show/view pages. Combines adapter mapping, permission-aware actions, tabbed sub-views, sidebar content, and status badges into a standardized detail page layout.

## Config Structure

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

### Visual (DetailSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `sidebarPosition` | `'start' \| 'end'` | -- | Which side the sidebar renders on |
| `sidebarWidth` | `number \| string` | -- | Fixed sidebar width |
| `collapseSidebarOnMobile` | `boolean` | `true` (builder) | Move sidebar below main content on mobile |

### Presentation (DetailSurfacePresentationConfig\<TView\>)

All presentation functions receive the mapped entity `item`, making the UI reactive to data changes.

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `Pick<SurfacePageChrome, 'breadcrumbs' \| 'maxWidth' \| 'back'>` | Partial chrome (title derived from entity) |
| `title` | `(item: TView) => ReactNode` | **Required** -- derives page title from entity |
| `subtitle` | `(item: TView) => ReactNode` | Secondary text |
| `avatar` | `(item: TView) => ReactNode` | Entity avatar |
| `status` | `(item: TView) => { label, color? } \| undefined` | Status badge ("Active", "Archived") |
| `tabs` | `DetailSurfaceTab<TView>[]` | Tabbed sub-views |
| `sidebar` | `(item: TView) => ReactNode` | Sidebar content |
| `headerExtra` | `(item: TView) => ReactNode` | Extra header content after title/status |
| `footer` | `(item: TView) => ReactNode` | Footer content |

### Behavior (DetailSurfaceBehaviorConfig\<TView\>)

| Property | Type | Description |
|----------|------|-------------|
| `actions` | `SurfaceAction<TView>[]` | Header actions (Edit, Delete, Archive) |
| `activeTab` | `string` | Currently active tab key (controlled) |
| `onTabChange` | `(key: string) => void` | Tab navigation callback |

### DetailSurfaceTab\<TView\>

```typescript
interface DetailSurfaceTab<TView> {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string | ((item: TView) => number | string | undefined);
  disabled?: boolean;
  visible?: boolean | ((item: TView) => boolean);
  permissionId?: string;
  content: (item: TView) => ReactNode;  // Lazy-rendered when tab is active
}
```

## Props Interface

```typescript
interface DetailSurfaceProps<TRaw, TView> {
  data?: TRaw | null;
  adapter: EntityAdapter<TRaw, TView>;
  config: DetailSurfaceConfig<TView>;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}
```

## Builder Function

```typescript
function createDetailSurfaceConfig<TView>(
  config: DetailSurfaceConfig<TView>
): DetailSurfaceConfig<TView>
```

Mobile-first defaults:
- `collapseSidebarOnMobile: true`

## Internal Composition

### Patterns Used
- **PatternDetailPanel**: Core detail page pattern with tabs, actions, sidebar, breadcrumbs

### Primitives Used
- `Box`, `Stack`

### Surface Infrastructure
- **SurfaceEmptyState / SurfaceErrorState**: Standard empty/error states
- **FadeIn**: Entrance animation (personality-driven)
- **SurfaceAccentBar**: Accent bar (personality-driven, position: top/left/none)

### Key Internal Logic

1. **Adapter mapping**: `adapter.map(data)` transforms raw data into view model
2. **Action normalization**: Surface actions are translated to `PatternDetailPanel`'s narrower action contract via `resolveSurfaceDetailActionVariant()`
3. **Tab filtering**: `filterDetailSurfaceTabs()` applies both `visible` predicates and permission rules against the mapped item
4. **Active tab resolution**: Falls back to first visible tab if configured `activeTab` was hidden by permissions
5. **Controlled vs uncontrolled tabs**: Passes `activeKey` only when `activeTab` is explicitly set
6. **Sidebar collapse on mobile**: Sidebar content moves to footer area on mobile via `shouldCollapseSidebarOnMobile`
7. **Accent bar**: Rendered at the surface layer so patterns remain presentation-agnostic; supports solid, gradient, and animated styles

## Usage Example

```typescript
const config = createDetailSurfaceConfig<UserView>({
  visual: { sidebarPosition: 'end' },
  presentation: {
    chrome: { breadcrumbs: [{ label: 'Users', href: '/users' }] },
    title: (user) => user.fullName,
    subtitle: (user) => user.email,
    status: (user) => ({ label: user.status, color: user.status === 'active' ? 'green' : 'gray' }),
    tabs: [
      { key: 'overview', label: 'Overview', content: (user) => <UserOverview user={user} /> },
      { key: 'activity', label: 'Activity', badge: (user) => user.activityCount, content: (user) => <UserActivity userId={user.id} /> },
    ],
    sidebar: (user) => <UserSidebar user={user} />,
  },
  behavior: {
    actions: [
      { id: 'edit', label: 'Edit', variant: 'primary', onClick: (user) => router.push(`/users/${user.id}/edit`) },
      { id: 'delete', label: 'Delete', variant: 'danger', onClick: (user) => handleDelete(user.id) },
    ],
  },
});

<DetailSurface data={rawUser} adapter={userAdapter} config={config} loading={isLoading} />
```
