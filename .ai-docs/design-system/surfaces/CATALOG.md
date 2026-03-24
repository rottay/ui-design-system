# Surface Catalog - Rottay Design System

> Comprehensive reference for every surface in the Design System.
> Last updated: 2026-03-23

## Overview

Surfaces are the **page-level composition layer** of the Rottay Design System. They sit above patterns and primitives, combining them into complete page shells that apps consume declaratively via config objects.

Every surface config follows a **four-section structure**:

| Section | Purpose |
|---------|---------|
| `visual` | How it looks: layout variants, responsive hints, maxWidth, density |
| `presentation` | What the user sees: chrome, titles, renderers, custom slots |
| `behavior` | What it does: data, actions, callbacks, navigation state |
| `permissions?` | Field/action/tab gating via `SurfacePermissionsConfig` |

### Architecture

```
App Page
  |
  v
Surface (config-driven page shell)
  |-- PageShellSurface (shared chrome: title, breadcrumbs, back, badge)
  |-- Patterns (DataTable, FormBuilder, StepWizard, DetailPanel, etc.)
  |-- Primitives (Box, Stack, Grid, Card, Button, Text, Tabs, etc.)
  |-- Helpers (permission filtering, action resolution, responsive layout)
  |-- Profile Defaults (personality-driven visual hints)
  |-- Motion (FadeIn, StaggerChildren, SlideIn)
```

### Engine-Aware Patterns

All surfaces are engine-aware through the personality/profile system:

- **Product Profile** (`useProductProfile`): drives density, default views, scheduler views
- **Personality Tokens** (`useTokens`): drives card variants, accent bars, animation style, heading weight, label transforms, badge shapes
- **`useSurfaceProfileDefaults()`**: merges both into `ResolvedSurfaceProfileDefaults` consumed by all surfaces
- **`useSurfaceResponsiveLayout()`**: resolves breakpoints into `shouldStack` for split layouts
- **`useSurfaceTranslations()`**: scoped i18n under `surfaces.*` namespace

### Builder Functions

Each surface has a `createXSurfaceConfig()` identity builder that:
1. Preserves TypeScript type inference (no explicit generics needed)
2. Injects conservative **mobile-first defaults** into the `visual` section
3. Allows explicit overrides (consumer config spreads after defaults)

---

## Surface Inventory (35 surfaces)

### Layout Shells

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 1 | **PageShellSurface** | -- | Shared page chrome foundation | `PatternPageShell` |
| 2 | **HeaderSurface** | `createHeaderSurfaceConfig` | Page chrome with optional tabbed navigation | `PageShellSurface`, `Tabs` |
| 3 | **SidebarSurface** | `createSidebarSurfaceConfig` | Collapsible sidebar layout (sidebar / main / aside) | CSS Grid, `Card` |

### Data Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 4 | **ListSurface** | `createListSurfaceConfig<TView>` | Filterable list with table/card views and row actions | `PatternDataTable`, `PatternFilterPanel` |
| 5 | **DashboardSurface** | `createDashboardSurfaceConfig` | KPI stats + flexible grid of content sections | `PatternStatsGrid`, `Grid` |
| 6 | **DetailSurface** | `createDetailSurfaceConfig<TView>` | Entity detail page with tabs, sidebar, and actions | `PatternDetailPanel` |

### Form Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 7 | **FormSurface** | `createFormSurfaceConfig` | Schema-driven form page with optional aside | `PatternFormBuilder` |
| 8 | **DetailFormSurface** | `createDetailFormSurfaceConfig` | Form + read-only summary panel (checkout/edit-with-preview) | `PatternFormBuilder`, `Grid` |
| 9 | **WizardSurface** | `createWizardSurfaceConfig` | Multi-step guided flow with step validation | `PatternStepWizard`, `PatternFormBuilder` |

### Content Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 10 | **VisualizationSurface** | `createVisualizationSurfaceConfig` | Tabbed chart/analytics pages with KPI stats | `PatternStatsGrid`, `Tabs` |
| 11 | **SearchSurface** | `createSearchSurfaceConfig` | Search page with query, filters, and preview panel | `PatternFilterPanel`, `Input.Search` |
| 12 | **EditorSurface** | `createEditorSurfaceConfig` | Content authoring with toolbar and preview | `Textarea` (or custom editor) |
| 13 | **MediaSurface** | `createMediaSurfaceConfig` | Gallery/media browser with selection and detail rail | `Image`, `Grid`, `Card` |

### Communication Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 14 | **ChatSurface** | `createChatSurfaceConfig` | Messaging / AI conversation with composer | `MessageBubble`, `TypingIndicator` |
| 15 | **NotificationSurface** | `createNotificationSurfaceConfig` | Notification feed + delivery preferences | `Tabs` |

### Scheduling and Project Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 16 | **SchedulerSurface** | `createSchedulerSurfaceConfig` | Calendar/booking with month/week/day views | Calendar events |
| 17 | **KanbanSurface** | `createKanbanSurfaceConfig` | Board-style project management with drag-and-drop | `PatternKanbanBoard`, `PatternFilterPanel` |
| 18 | **ActivitySurface** | `createActivitySurfaceConfig` | Activity timeline/feed with diff tracking | Timeline, `Card` |

### Comparison and Pricing Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 19 | **CompareSurface** | `createCompareSurfaceConfig` | Side-by-side entity comparison table | Comparison table |
| 20 | **PricingSurface** | `createPricingSurfaceConfig` | Pricing/plan comparison with feature rows | Pricing table |

### Auth and Onboarding Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 21 | **AuthSurface** | `createAuthSurfaceConfig` | Login/register/password-reset (no page chrome) | Split/centered layout |
| 22 | **MarketingSurface** | `createMarketingSurfaceConfig` | Public landing/pre-auth pages | Hero sections |
| 23 | **OnboardingSurface** | `createOnboardingSurfaceConfig` | Post-signup onboarding wizard | `WizardSurfaceBehaviorConfig` reuse |
| 24 | **EmptyStateSurface** | `createEmptyStateSurfaceConfig` | No-data CTA page | `PatternEmptyState` |

### Settings and Administration Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 25 | **SettingsSurface** | `createSettingsSurfaceConfig` | Tabbed settings page with optional sidebar | `Tabs`, `Grid` |
| 26 | **AuditSurface** | `createAuditSurfaceConfig` | Compliance audit log viewer with export | `PatternFilterPanel`, severity tags |
| 27 | **BillingSurface** | `createBillingSurfaceConfig` | Subscription management (plan, usage, invoices) | `Card`, `Tabs` |
| 28 | **ProfileSurface** | `createProfileSurfaceConfig` | User profile/account page | Profile sections, avatar |
| 29 | **TeamSurface** | `createTeamSurfaceConfig` | Team management (members, roles, invite) | Table/card views |

### Integration and Data Management Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 30 | **IntegrationSurface** | `createIntegrationSurfaceConfig` | API keys, webhooks, connected apps | `Tabs`/sections |
| 31 | **ImportExportSurface** | `createImportExportSurfaceConfig` | Data import/export with field mapping | Upload, mapping, history |
| 32 | **ReportSurface** | `createReportSurfaceConfig` | Report builder/viewer with templates and filters | `PatternFilterPanel`, chart rendering |
| 33 | **FileBrowserSurface** | `createFileBrowserSurfaceConfig` | File management with grid/list views | Breadcrumbs, file icons |

### Operational Surfaces

| # | Surface | Builder | Purpose | Key Patterns |
|---|---------|---------|---------|--------------|
| 34 | **OperationalSurface** | `createOperationalSurfaceConfig<TFeed>` | Control room / real-time monitoring | `PatternLiveFeed`, `PatternStatsGrid` |

### Cross-Cutting

| # | Surface | Purpose |
|---|---------|---------|
| 35 | **SurfaceErrorBoundary** | Isolates individual surface crashes from the rest of the page |
| -- | **SurfaceLoadingState** | Skeleton-based loading state |
| -- | **SurfaceEmptyState** | Consistent empty state with optional CTA |
| -- | **SurfaceErrorState** | Alert-based error with optional retry |

---

## Shared Infrastructure

### Foundation Files

| File | Purpose |
|------|---------|
| `types.ts` | All config interfaces (102KB, ~2700 lines) |
| `builders.ts` | Identity builders with mobile-first defaults |
| `helpers.ts` | Permission resolution, column/action/tab filtering, value normalization |
| `responsive.ts` | `useSurfaceResponsiveLayout()` + `resolveResponsiveColumnCount()` |
| `i18n.ts` | `useSurfaceTranslations()` -- scoped `tSurface()` function |
| `profile-defaults.ts` | `useSurfaceProfileDefaults()` -- merges product profile + personality tokens |
| `personality-helpers.tsx` | Accent bars, heading weights, label transforms, section spacing |
| `shared.tsx` | `SurfaceActionBar`, `SurfaceTabbedLabel`, `SurfaceSectionCard` |
| `SurfaceErrorBoundary.tsx` | React error boundary scoped to individual surfaces |
| `states/index.tsx` | `SurfaceLoadingState`, `SurfaceEmptyState`, `SurfaceErrorState` |

### Common Patterns Across Surfaces

1. **PageShellSurface wrapping**: All page-level surfaces compose `PageShellSurface` for consistent chrome
2. **Permission filtering**: `filterSurfaceColumns()`, `filterSurfaceActions()`, `filterSurfaceTabbedViews()` run before rendering
3. **Responsive stacking**: `useSurfaceResponsiveLayout()` resolves `shouldStack` for mobile/tablet
4. **Profile-aware defaults**: Card variant, section spacing, heading weight, animation style all come from `useSurfaceProfileDefaults()`
5. **Controlled/uncontrolled duality**: Surfaces support both controlled (app owns state) and uncontrolled (surface manages state) modes for tabs, values, selection, and collapse
6. **Accent bar wrapping**: `SurfaceAccentBarWrapper` conditionally adds accent bars (solid/gradient/animated)
7. **Entrance animation**: `FadeIn`/`StaggerChildren`/`SlideIn` controlled by personality tokens
8. **Error/empty/loading states**: Standardized via `SurfaceErrorState`, `SurfaceEmptyState`, `SurfaceLoadingState`

### Import Example

```typescript
import {
  // Types
  type ListSurfaceConfig,
  type DashboardSurfaceConfig,
  type SurfacePermissionsConfig,

  // Builders
  createListSurfaceConfig,
  createDashboardSurfaceConfig,

  // Components
  ListSurface,
  DashboardSurface,
  SurfaceErrorBoundary,

  // Helpers
  mapSurfaceData,
  resolveSurfacePermission,
} from '@rottay/design-system';
```

---

## Source Location

```
ui-design-system/packages/core/src/components/surfaces/
```
