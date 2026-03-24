# Platform Shared Components

> Components in `app-platform/src/components/_shared/` with their DS pattern equivalents.

## Component Inventory

### Layout Components

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `layout/sidebar` | `layout/sidebar/index.tsx` | App-owned (permanent) -- uses Box, Flex, Text for structure |
| `layout/header` | `layout/header/index.tsx` | App-owned -- uses Flex, Text, Button |
| `layout/nav-section` | `layout/nav-section/index.tsx` | App-owned -- uses Stack, Text, Box for nav groups |
| `layout/user-menu` | `layout/user-menu/index.tsx` | App-owned -- uses Flex, Text, Avatar, Dropdown |
| `layout/command-header` | `layout/command-header/index.ts` | Barrel for 8 sub-components |
| `layout/command-header/metrics-rows` | `.../metrics-rows/index.tsx` | Uses Grid, Card, Text, Flex |
| `layout/command-header/metrics-minimal` | `.../metrics-minimal/index.tsx` | Uses Flex, Text |
| `layout/command-header/metrics-cards` | `.../metrics-cards/index.tsx` | Uses Grid, Card, Flex, Text |
| `layout/command-header/metrics-chart` | `.../metrics-chart/index.tsx` | Uses Card, Flex, Text |
| `layout/command-header/activity-compact` | `.../activity-compact/index.tsx` | Uses Stack, Flex, Text |
| `layout/command-header/activity-timeline` | `.../activity-timeline/index.tsx` | Uses Stack, Flex, Text, Box |
| `layout/command-header/activity-ticker` | `.../activity-ticker/index.tsx` | Uses Flex, Text |
| `layout/command-header/activity-cards` | `.../activity-cards/index.tsx` | Uses Grid, Card, Flex, Text |
| `layout/command-header-component` | `.../command-header-component/index.tsx` | Orchestrates command header sub-components |

### Layout Presets

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `layouts/dashboard-layout` | `layouts/dashboard-layout/index.tsx` | Wraps sidebar + header + content area |
| `layouts/admin-layout` | `layouts/admin-layout/index.tsx` | Admin variant of dashboard layout |
| `layouts/auth-layout` | `layouts/auth-layout/index.tsx` | Centered card layout for auth pages |
| `layouts/app-layout` | `layouts/app-layout/index.tsx` | Base app layout with sidebar + topbar |
| `layouts/app-layout/app-sidebar` | `.../app-sidebar/index.tsx` | Configurable sidebar component |
| `layouts/app-layout/app-sidebar/sidebar-config` | `.../sidebar-config/index.ts` | Sidebar navigation configuration |
| `layouts/app-layout/app-topbar` | `.../app-topbar/index.tsx` | Top bar with breadcrumbs, search, user menu |
| `layouts/app-layout/app-logo` | `.../app-logo/index.tsx` | Tenant-aware logo component |
| `layouts/app-layout/types` | `.../types/index.ts` | Layout type definitions |

### Layout Parts

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `layout-parts/page-header` | `layout-parts/page-header/index.tsx` | --> Replaceable by Surface `header` config |

### Table Components

| Component | Path | DS Pattern Equivalent |
|-----------|------|----------------------|
| `tables/table-toolbar` | `tables/table-toolbar/index.tsx` | --> `ListSurface` toolbar (search + filters + actions) |
| `tables/table-pagination` | `tables/table-pagination/index.tsx` | --> `ListSurface` pagination controls |
| `tables/table-loading-overlay` | `tables/table-loading-overlay/index.tsx` | --> `ListSurface` loading state |
| `tables/table-empty-state` | `tables/table-empty-state/index.tsx` | --> `ListSurface` emptyState config |
| `tables/filter-select` | `tables/filter-select/index.tsx` | --> `ListSurface` filterConfig |
| `tables/status-filter-pills` | `tables/status-filter-pills/index.tsx` | --> `ListSurface` status filter pills |
| `tables/confirm-action-modal` | `tables/confirm-action-modal/index.tsx` | --> `ListSurface` bulkActions confirm |
| `tables/bulk-select-toggle` | `tables/bulk-select-toggle/index.tsx` | --> `ListSurface` bulkActions toggle |
| `tables/table-checkbox-styles` | `tables/table-checkbox-styles/index.tsx` | --> `ListSurface` checkbox styling |

### Form Components

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `forms` | `forms/index.ts` | Barrel export for form field components |
| `form-header` | `form-header/index.tsx` | Page header for create/edit forms |
| `edit-header` | `edit-header/index.tsx` | Page header for edit pages |
| `detail-header` | `detail-header/index.tsx` | Page header for detail pages |

### Feedback Components

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `feedback/error-boundary` | `feedback/error-boundary/index.tsx` | Error boundary wrapper |
| `feedback/empty-state` | `feedback/empty-state/index.tsx` | --> `ListSurface` emptyState |
| `feedback/loading-state` | `feedback/loading-state/index.tsx` | --> Surface loading indicators |
| `feedback/feature-gate` | `feedback/feature-gate/index.tsx` | Feature flag gate component |

### Selection Components

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `selects/tenant-switcher` | `selects/tenant-switcher/index.tsx` | Tenant context switcher |
| `selects/tenant-select` | `selects/tenant-select/index.tsx` | Tenant dropdown for forms |
| `selects/role-select` | `selects/role-select/index.tsx` | Role dropdown for forms |
| `selects/user-select` | `selects/user-select/index.tsx` | User search/select for forms |

### Card Components

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `cards/data-terminal-card` | `cards/data-terminal-card/index.tsx` | Terminal-style data display card |

### UI Components

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `ui/focus-hideable` | `ui/focus-hideable/index.tsx` | Hides content in focus mode |
| `ui/radial-menu` | `ui/radial-menu/index.tsx` | Radial context menu |

### Other

| Component | Path | DS Pattern |
|-----------|------|-----------|
| `confirm-dialog` | `confirm-dialog/index.tsx` | Confirmation dialog modal |
| `global-search` | `global-search/index.tsx` | Cmd+K global search overlay |
| `bulk-actions-bar` | `bulk-actions-bar/index.tsx` | --> `ListSurface` bulkActions bar |

---

## Migration Status

Components marked with `-->` have DS Surface equivalents. The table components in particular
are being progressively replaced by `ListSurface` configs. The layout components (sidebar,
header, nav) are **intentionally app-owned** and will not be migrated to DS shell surfaces.

### Permanent App-Owned
- All `layout/` components (sidebar, header, nav-section, user-menu, command-header)
- All `layouts/` presets (dashboard-layout, admin-layout, auth-layout, app-layout)
- `selects/` (tenant-switcher, tenant-select, role-select, user-select)
- `global-search/` (Cmd+K)
- `feedback/feature-gate/` (feature flag gate)
- `feedback/error-boundary/` (error boundary)

### Replaced by ListSurface
- `tables/table-toolbar` -> ListSurface toolbar
- `tables/table-pagination` -> ListSurface pagination
- `tables/table-loading-overlay` -> ListSurface loading
- `tables/table-empty-state` -> ListSurface emptyState
- `tables/filter-select` -> ListSurface filterConfig
- `tables/status-filter-pills` -> ListSurface filter pills
- `tables/confirm-action-modal` -> ListSurface bulkActions
- `tables/bulk-select-toggle` -> ListSurface bulkActions
- `bulk-actions-bar` -> ListSurface bulkActions bar
- `feedback/empty-state` -> ListSurface emptyState
- `feedback/loading-state` -> Surface loading
