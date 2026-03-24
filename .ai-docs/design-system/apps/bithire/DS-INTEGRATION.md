# BitHire Design System Integration

> Auto-generated: 2026-03-23
> Source: `app-bithire/src/`

## Overview

BitHire has **deep DS integration**. The entire app builds on `@rottay/design-system`
for both primitives and patterns. 278+ component files import from the DS.
No raw HTML elements in dashboard code. All colors via CSS custom properties.

---

## DS Components Used

### Layout Primitives (universal)

| DS Component | Usage Scope | Notes |
|-------------|-------------|-------|
| `Box` | Everywhere | Generic container, replaces `<div>` |
| `Flex` | Everywhere | Flexbox layout |
| `Grid` | Surfaces, dashboards | Grid layout with responsive columns |
| `Stack` | Forms, detail sections | Vertical spacing |
| `Text` | Everywhere | All text rendering, replaces `<p>`, `<span>`, `<h*>` |

### Interactive Components

| DS Component | Usage Scope | Notes |
|-------------|-------------|-------|
| `Button` | Everywhere | All interactive actions |
| `Badge` | List cells, status indicators | Status, tags, counts |
| `Card` | Detail views, dashboards, settings | Content containers |
| `Input` | Forms, search, settings | Text input fields |
| `Select` | Settings (AI test chat) | Dropdown selections |
| `Textarea` | Settings (AI test chat), rubric forms | Multi-line input |
| `Table` | Settings (AI models) | Data tables |
| `Tooltip` | List row actions | Action button hints |
| `Divider` | Detail views | Section separators |

### Feedback Components

| DS Component | Usage Scope | Notes |
|-------------|-------------|-------|
| `Spinner` | Loading states | Data fetch loading |
| `Modal` | Dialogs, confirms | Overlays |
| `Skeleton` | Loading (analytics) | Content placeholders |
| `toast` | All mutations | Success/error notifications |
| `Toast.Container` | Provider tree | Toast renderer |
| `ToastProvider` | Provider tree, auth layout | Toast configuration |

### Patterns (high-level)

| DS Pattern | Usage Scope | Notes |
|-----------|-------------|-------|
| `PatternDataTable` | 5 list surfaces | Full-featured data table with column management |

---

## DS Types Used

| DS Type | Usage | Files |
|---------|-------|-------|
| `EntityAdapter<TInput, TOutput>` | Surface adapters | 6 adapter files |
| `ColumnDef<T>` | Table column definitions | 5 list surfaces |
| `BadgeVariant` | Status helper return types | 6 helper files |
| `SurfacePermissionsConfig` | Permission system | compute-permissions.ts |
| `SurfacePermissionRule` | Permission maps | permission-maps.ts, use-surface-permissions.ts |
| `TenantBrandingSession` | Provider tenant resolution | providers/index.tsx |
| `ProductProfileKey` | Product profile definition | lib/theme/index.ts |
| `TenantConfig` | Tenant override typing | lib/theme/index.ts |

---

## DS Hooks Used

| DS Hook | Location | Purpose |
|---------|----------|---------|
| `useTenantBranding` | `providers/index.tsx` | Fetches DB-stored tenant branding config |
| `toSupportedLocale` | `providers/index.tsx` | Normalizes locale to DS-supported set |
| `toast.success/error` | All mutation surfaces | Notification feedback |

---

## Engine Flow

The DS theming engine flows through the app as follows:

### 1. Server Layout (Tenant Resolution)

```
layout.tsx (server component)
  |-- reads X-Tenant-ID header or session
  |-- passes tenantSlug to <Providers>
```

### 2. Provider Chain (Theme Application)

```
<Providers tenantSlug="acme">
  |
  +-- resolveThemeTenant("acme") -> "acme" (or "bithire" for "rottay")
  |
  +-- useTenantBranding({ tenantSlug: "acme", vertical: "bithire" })
  |     |-- Returns: tenantConfig (logo, primaryColor, tokenOverrides)
  |
  +-- getBithireTenantOverrides("acme")
  |     |-- Returns app defaults: densityScale: 0.95, tight radii, subtle shadows
  |
  +-- Merge: appDefaults + dbTokenOverrides (DB wins)
  |
  +-- <DesignSystemProvider
  |     tenantSlug="acme"
  |     tenantConfig={...}
  |     tenantOverrides={merged}
  |     vertical="bithire"
  |     productProfile="recruiting.operator"
  |   />
```

### 3. CSS Custom Property Injection

The `DesignSystemProvider` injects CSS custom properties based on:

1. **Product profile** (`recruiting.operator`): compact density, tight borders
2. **Tenant CSS file**: `ui-design-system/.../tokens/css/tenants/bithire/`
3. **DB-stored overrides**: `tenantConfig.tokenOverrides` (per-tenant)

All components reference these via `var(--ds-color-*)`, `var(--ds-space-*)`, etc.

### 4. Surface Consumption

```
Surface component
  |-- Uses DS primitives: Box, Flex, Text, Badge, Button, Card, etc.
  |-- All colors via: var(--ds-color-primary), var(--ds-color-text-muted), etc.
  |-- All spacing via: inline style numbers (mapped by DS density scale)
  |-- Never hardcoded hex colors in dashboard surfaces
```

---

## What is App-Owned vs DS-Owned

### DS-Owned (from `@rottay/design-system`)

| Category | Components/Features |
|----------|-------------------|
| Layout primitives | Box, Flex, Grid, Stack, Text |
| Interactive | Button, Badge, Card, Input, Select, Textarea, Table, Tooltip |
| Feedback | Spinner, Modal, Skeleton, Toast, Divider |
| Patterns | PatternDataTable (table rendering engine) |
| Types | EntityAdapter, ColumnDef, BadgeVariant, SurfacePermissionRule |
| Theming | DesignSystemProvider, I18nProvider, ToastProvider, useTenantBranding |
| Tokens | All CSS custom properties (colors, spacing, radii, shadows) |

### App-Owned (in `app-bithire/src/`)

| Category | Components/Features |
|----------|-------------------|
| Provider stack | AuthProvider, FocusModeProvider, BreadcrumbProvider |
| List infrastructure | useListController, ListToolbar, ColumnSettingsDropdown, SavedViewsDropdown, StatsHeader |
| Permission system | useSurfacePermissions, permission maps, RouteGuard, compute-permissions |
| Surface adapters | 6 EntityAdapter implementations (candidates, applications, interviews, jobs, offers, recruiters) |
| Cell renderers | renderAvatarNameCell, renderStatusDot, renderTagsCell, renderDateCell, renderContactCell, renderScoreCell |
| Filter UI | FilterPills segmented buttons |
| Form framework | FormPageHeader, FormAccordionSection, FormFieldLabel, FormStatusBar, FormSubmitBar |
| Feedback | Skeleton variants (9 types), card skeletons (5 types), CompletenessBar, ConfirmDialog, EmptyState |
| Cards | StatsCard, SummaryCard (composable), DataTerminalCard |
| Layout | PageHeader, PageTransition, AnimatedContent |
| UI utilities | CheckItem, FocusHideable, SortDropdown, AnimatedGridBackground |
| Theme config | BITHIRE_PRODUCT_PROFILE, getBithireTenantOverrides |

### Boundary Rules

1. **DS provides rendering primitives** -- the atomic building blocks
2. **App provides orchestration** -- how primitives are composed into surfaces
3. **DS provides the data table engine** -- PatternDataTable handles columns, sort, select, resize, reorder, pin, density, pagination
4. **App provides the chrome around it** -- ListToolbar, StatsHeader, ColumnSettings, SavedViews, FilterPills
5. **DS provides theming engine** -- DesignSystemProvider injects CSS vars
6. **App provides tenant resolution** -- resolves slug, fetches branding, merges overrides
7. **DS provides permission types** -- SurfacePermissionRule, SurfacePermissionsConfig
8. **App provides permission logic** -- permission maps, RBAC computation, route guards

---

## Integration Quality Assessment

| Aspect | Rating | Notes |
|--------|--------|-------|
| Primitive usage | Strong | 278 component files use DS imports; no raw HTML in dashboard |
| Color tokens | Strong | All colors via `var(--ds-color-*)` -- no hardcoded hex |
| Pattern adoption | Moderate | Only PatternDataTable used; no PatternDetailLayout/FormLayout/KanbanLayout |
| Type integration | Strong | EntityAdapter, ColumnDef, BadgeVariant, SurfacePermissionRule all used |
| Theming flow | Strong | Full tenant branding pipeline (server -> DB -> merge -> CSS vars) |
| Hook adoption | Light | Only useTenantBranding + toast from DS; most hooks are app-owned |
| Missing patterns | Gap | Detail views, forms, kanban all use custom layouts instead of DS patterns |

### Potential DS Migration Targets

These app-owned components could potentially migrate to DS patterns if they exist:

- `ListToolbar` -> potential DS `PatternListToolbar`
- `StatsHeader` -> potential DS `PatternStatsBar`
- `FormAccordionSection` -> potential DS `PatternFormSection`
- `ExpandedPanelLayout` -> potential DS `PatternDetailPanel`
- `ConfirmDialog` -> potential DS `ConfirmDialog` pattern
- Skeleton variants -> potential DS `PatternSkeleton` system
