# Shared Components Inventory

> Auto-generated 2026-03-23. Covers all files in `app-platform/src/components/_shared/`.

## Overview

Total shared component files: **60** (including barrel index.ts files)
Total LOC (tsx only): **10,793**
Categories: Cards, Feedback, Forms, Layout, Layouts, Layout-Parts, Selects, Tables, UI

---

## Cards

### DataTerminalCard (875 LOC)
- **Path**: `_shared/cards/data-terminal-card/index.tsx`
- **Purpose**: Premium dashboard metric card with 4 animated variants. Displays label, value, change/trend indicator, icon, progress bar, and subtitle. Links to detail pages.
- **DS Pattern Equivalent**: No direct equivalent. DS has `PatternStatsGrid` for stat rows, but DataTerminalCard is a standalone card with animated styling.
- **Multi-Engine Compatible**: Yes (uses DS CSS variables exclusively)
- **Used By**: 39 surface screens (all list pages, overview dashboards, analytics)

---

## Feedback

### EmptyState (137 LOC)
- **Path**: `_shared/feedback/empty-state/index.tsx`
- **Purpose**: Data absence feedback with icon, title, description, and action buttons
- **DS Pattern Equivalent**: DS has `Empty` component. This wraps it with consistent platform styling.
- **Multi-Engine Compatible**: Yes

### ErrorBoundary (189 LOC)
- **Path**: `_shared/feedback/error-boundary/index.tsx`
- **Purpose**: React class component error boundary with retry/reload actions and collapsible stack trace
- **DS Pattern Equivalent**: None. App-specific error recovery UI.
- **Multi-Engine Compatible**: Yes

### FeatureGate (150 LOC)
- **Path**: `_shared/feedback/feature-gate/index.tsx`
- **Purpose**: Conditional rendering based on feature flags. Super Admins bypass. Shows upgrade prompts when gated.
- **DS Pattern Equivalent**: None. Integrates with platform's feature flag system.
- **Multi-Engine Compatible**: Yes

### LoadingState (179 LOC)
- **Path**: `_shared/feedback/loading-state/index.tsx`
- **Purpose**: Loading feedback with multiple variants: spinner, skeleton (text/card/table/list), full-page overlay
- **DS Pattern Equivalent**: DS has `Spinner` and `Skeleton`. This provides higher-level composed variants.
- **Multi-Engine Compatible**: Yes

---

## Layout (Command Header System)

### CommandHeader (1,225 LOC)
- **Path**: `_shared/layout/command-header-component/index.tsx`
- **Purpose**: Full-featured page header with icon, title, subtitle, quick actions grid, AI insights, key metrics, recent activity, schedule, system metrics. Integrates with FocusModeProvider for collapsible behavior.
- **DS Pattern Equivalent**: No direct equivalent. DS surfaces have `chrome.title`/`chrome.subtitle` but CommandHeader is a much richer composed component with multiple sub-sections.
- **Multi-Engine Compatible**: Yes (uses DS CSS variables)
- **Used By**: 44 surface screens

### Command Header Sub-Components:

| Component | Lines | Purpose |
|-----------|-------|---------|
| `activity-cards/index.tsx` | 87 | Activity items as cards layout |
| `activity-compact/index.tsx` | 88 | Compact activity list layout |
| `activity-timeline/index.tsx` | 94 | Timeline-style activity display |
| `activity-ticker/index.tsx` | 139 | Auto-scrolling activity ticker |
| `metrics-cards/index.tsx` | 234 | Metrics displayed as cards |
| `metrics-chart/index.tsx` | 103 | Metrics with sparkline charts |
| `metrics-minimal/index.tsx` | 107 | Minimal inline metrics |
| `metrics-rows/index.tsx` | 295 | Metrics in horizontal rows |
| `types/index.ts` | - | TypeScript interfaces for all variants |
| `use-variant/index.ts` | - | Hook to select variant based on config |

### Header (233 LOC)
- **Path**: `_shared/layout/header/index.tsx`
- **Purpose**: Legacy app header with user info, notifications bell, settings link
- **DS Pattern Equivalent**: Replaced by AppTopbar in new layout
- **Multi-Engine Compatible**: Yes

### Sidebar (260 LOC)
- **Path**: `_shared/layout/sidebar/index.tsx`
- **Purpose**: Legacy sidebar navigation with collapsible sections
- **DS Pattern Equivalent**: Replaced by AppSidebar in new layout
- **Multi-Engine Compatible**: Yes

### UserMenu (252 LOC)
- **Path**: `_shared/layout/user-menu/index.tsx`
- **Purpose**: User dropdown menu with profile, settings, logout actions
- **DS Pattern Equivalent**: None. App-specific navigation.
- **Multi-Engine Compatible**: Yes

### NavSection (226 LOC)
- **Path**: `_shared/layout/nav-section/index.tsx`
- **Purpose**: Navigation section with collapsible group header and menu items
- **DS Pattern Equivalent**: None. App-specific navigation.
- **Multi-Engine Compatible**: Yes

---

## Layout Parts

### PageHeader (126 LOC)
- **Path**: `_shared/layout-parts/page-header/index.tsx`
- **Purpose**: Consistent page header with breadcrumb, title, subtitle, and action buttons
- **DS Pattern Equivalent**: DS surfaces provide their own chrome. This is for non-surface pages.
- **Multi-Engine Compatible**: Yes

---

## Layouts (Application Shells)

### AppLayout (118 LOC)
- **Path**: `_shared/layouts/app-layout/index.tsx`
- **Purpose**: Primary app shell with collapsible sidebar (260px/80px) + responsive topbar + content area. Integrates with @rottay/navigation for dynamic menus.
- **DS Pattern Equivalent**: None. App-specific shell. DS provides theming, not layout shells.
- **Multi-Engine Compatible**: Yes
- **Variants**: `platform` (full), `minimal` (simplified)

### AppSidebar (496 LOC)
- **Path**: `_shared/layouts/app-layout/app-sidebar/index.tsx`
- **Purpose**: Dynamic sidebar with navigation items from NavigationProvider, collapsible groups, active state highlighting
- **Multi-Engine Compatible**: Yes

### AppTopbar (135 LOC)
- **Path**: `_shared/layouts/app-layout/app-topbar/index.tsx`
- **Purpose**: Sticky top bar with breadcrumbs, global search, user menu
- **Multi-Engine Compatible**: Yes

### AppLogo (141 LOC)
- **Path**: `_shared/layouts/app-layout/app-logo/index.tsx`
- **Purpose**: Tenant-aware logo component, collapses to initials when sidebar is collapsed
- **Multi-Engine Compatible**: Yes

### SidebarConfig
- **Path**: `_shared/layouts/app-layout/app-sidebar/sidebar-config/index.ts`
- **Purpose**: Static sidebar navigation item definitions

### DashboardLayout (283 LOC)
- **Path**: `_shared/layouts/dashboard-layout/index.tsx`
- **Purpose**: Legacy dashboard layout with dark sidebar. Being replaced by AppLayout.
- **DS Pattern Equivalent**: None
- **Multi-Engine Compatible**: Yes

### AdminLayout (310 LOC)
- **Path**: `_shared/layouts/admin-layout/index.tsx`
- **Purpose**: Administrative layout with extended navigation, Super Admin badge, permission-filtered menus
- **DS Pattern Equivalent**: None
- **Multi-Engine Compatible**: Yes

### AuthLayout (175 LOC)
- **Path**: `_shared/layouts/auth-layout/index.tsx`
- **Purpose**: Authentication pages layout with tenant-specific branding. Wraps DS AuthLayout.
- **DS Pattern Equivalent**: Wraps `@rottay/design-system` AuthLayout component
- **Multi-Engine Compatible**: Yes (via DS)
- **Presets**: minimal, standard, branded, social, enterprise

---

## Selects

### RoleSelect (159 LOC)
- **Path**: `_shared/selects/role-select/index.tsx`
- **Purpose**: Role selector dropdown with search, fetches roles from server
- **DS Pattern Equivalent**: Uses DS Select component
- **Multi-Engine Compatible**: Yes

### TenantSelect (154 LOC)
- **Path**: `_shared/selects/tenant-select/index.tsx`
- **Purpose**: Tenant selector dropdown
- **DS Pattern Equivalent**: Uses DS Select component
- **Multi-Engine Compatible**: Yes

### TenantSwitcher (260 LOC)
- **Path**: `_shared/selects/tenant-switcher/index.tsx`
- **Purpose**: Tenant switching UI for Super Admins, persists selection
- **DS Pattern Equivalent**: None. App-specific multi-tenant feature.
- **Multi-Engine Compatible**: Yes

### UserSelect (183 LOC)
- **Path**: `_shared/selects/user-select/index.tsx`
- **Purpose**: User selector dropdown with search
- **DS Pattern Equivalent**: Uses DS Select component
- **Multi-Engine Compatible**: Yes

---

## Tables

### TableToolbar (159 LOC)
- **Path**: `_shared/tables/table-toolbar/index.tsx`
- **Purpose**: Standardized toolbar with search input, filter reset, primary action button, secondary actions
- **DS Pattern Equivalent**: ListSurface has built-in toolbar. This is for surfaces that compose their own table UI.
- **Multi-Engine Compatible**: Yes
- **Used By**: 13 surface screens

### StatusFilterPills (118 LOC)
- **Path**: `_shared/tables/status-filter-pills/index.tsx`
- **Purpose**: Horizontal pill buttons for filtering by status (All, Active, Inactive, etc.)
- **DS Pattern Equivalent**: ListSurface has built-in filter support. This is for manual composition.
- **Multi-Engine Compatible**: Yes

### BulkSelectToggle (74 LOC)
- **Path**: `_shared/tables/bulk-select-toggle/index.tsx`
- **Purpose**: Toggle button to enter/exit bulk selection mode
- **DS Pattern Equivalent**: ListSurface has built-in bulk selection. This is for manual composition.
- **Multi-Engine Compatible**: Yes

### TableCheckboxStyles (137 LOC)
- **Path**: `_shared/tables/table-checkbox-styles/index.tsx`
- **Purpose**: Global CSS injection for styled table checkboxes
- **DS Pattern Equivalent**: None (CSS override helper)
- **Multi-Engine Compatible**: Yes

### ConfirmActionModal (181 LOC)
- **Path**: `_shared/tables/confirm-action-modal/index.tsx`
- **Purpose**: Modal for confirming bulk actions (delete, deactivate, etc.) with item count
- **DS Pattern Equivalent**: None. App-specific bulk action confirmation.
- **Multi-Engine Compatible**: Yes

### TablePagination (159 LOC)
- **Path**: `_shared/tables/table-pagination/index.tsx`
- **Purpose**: Pagination controls with page size selector and page navigation
- **DS Pattern Equivalent**: ListSurface has built-in pagination. This is for manual composition.
- **Multi-Engine Compatible**: Yes

### TableEmptyState (118 LOC)
- **Path**: `_shared/tables/table-empty-state/index.tsx`
- **Purpose**: Empty state specifically for tables with optional search query context
- **DS Pattern Equivalent**: ListSurface has built-in empty state. This is for manual composition.
- **Multi-Engine Compatible**: Yes

### TableLoadingOverlay (125 LOC)
- **Path**: `_shared/tables/table-loading-overlay/index.tsx`
- **Purpose**: Semi-transparent overlay with spinner for table loading states
- **DS Pattern Equivalent**: ListSurface has built-in loading. This is for manual composition.
- **Multi-Engine Compatible**: Yes

### FilterSelect (155 LOC)
- **Path**: `_shared/tables/filter-select/index.tsx`
- **Purpose**: Dropdown filter for table columns (e.g., role, status)
- **DS Pattern Equivalent**: ListSurface has built-in filter support
- **Multi-Engine Compatible**: Yes

---

## UI

### FocusHideable (29 LOC)
- **Path**: `_shared/ui/focus-hideable/index.tsx`
- **Purpose**: Wrapper that animates children to hidden when FocusMode is active. Uses CSS transitions for smooth collapse.
- **DS Pattern Equivalent**: None. App-specific FocusMode integration.
- **Multi-Engine Compatible**: Yes
- **Used By**: 18 surface screens (wraps CommandHeader/DataTerminalCard sections)

### RadialMenu (366 LOC)
- **Path**: `_shared/ui/radial-menu/index.tsx`
- **Purpose**: Floating radial action menu (Rottay Bull logo trigger) with quick navigation links, focus mode toggle, debug tools. Renders as a portal.
- **DS Pattern Equivalent**: None. App-specific power-user feature.
- **Multi-Engine Compatible**: Yes

---

## Other Top-Level Components

### FormHeader (237 LOC)
- **Path**: `_shared/form-header/index.tsx`
- **Purpose**: Header for create/edit form pages with back navigation, breadcrumb, mode indicator (Create/Edit), action buttons
- **DS Pattern Equivalent**: None. App-specific form chrome.
- **Multi-Engine Compatible**: Yes
- **Used By**: 11 surface create screens

### DetailHeader (333 LOC)
- **Path**: `_shared/detail-header/index.tsx`
- **Purpose**: Header for detail/view pages with tabs, status badge, back navigation, action buttons
- **DS Pattern Equivalent**: DetailSurface has built-in header. This is for manual composition.
- **Multi-Engine Compatible**: Yes

### EditHeader (383 LOC)
- **Path**: `_shared/edit-header/index.tsx`
- **Purpose**: Premium edit header with animated gradient backgrounds, save/cancel actions, loading states
- **DS Pattern Equivalent**: None. App-specific premium styling.
- **Multi-Engine Compatible**: Yes
- **Used By**: 11 surface edit screens

### ConfirmDialog (161 LOC)
- **Path**: `_shared/confirm-dialog/index.tsx`
- **Purpose**: Modal dialog for confirming destructive actions with danger/warning/info variants
- **DS Pattern Equivalent**: DS has `Modal` and `Popconfirm`. This adds pre-styled variants.
- **Multi-Engine Compatible**: Yes

### BulkActionsBar (156 LOC)
- **Path**: `_shared/bulk-actions-bar/index.tsx`
- **Purpose**: Sticky toolbar for bulk operations (delete, export, status change) with selection count badge
- **DS Pattern Equivalent**: None. App-specific bulk action bar.
- **Multi-Engine Compatible**: Yes

### GlobalSearch (489 LOC)
- **Path**: `_shared/global-search/index.tsx`
- **Purpose**: Platform-wide search dropdown with entity-type-aware results (users, tenants, companies), keyboard navigation, recent searches
- **DS Pattern Equivalent**: None. App-specific search feature.
- **Multi-Engine Compatible**: Yes
