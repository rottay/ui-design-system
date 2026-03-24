# DashboardSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/dashboard/index.tsx`

## Purpose

Reusable dashboard shell for KPI grids, section cards, charts, and header actions. Packages the recurring "overview page" structure while leaving each widget's content and meaning in app-level config. Used for admin dashboards, analytics overviews, and summary pages.

## Config Structure

### DashboardSurfaceConfig

```typescript
interface DashboardSurfaceConfig {
  visual: DashboardSurfaceVisualConfig;
  presentation: DashboardSurfacePresentationConfig;
  behavior: DashboardSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (DashboardSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `statsColumns` | `number` | `4` | Desktop KPI stat columns |
| `mobileStatsLimit` | `number` | `2` (builder) | Max visible stats on mobile |
| `sectionsColumns` | `GridColumns` | `12` | Grid columns for sections area |
| `mobileSectionsColumns` | `GridColumns` | `1` | Mobile sections columns |
| `stackSectionsOnMobile` | `boolean` | `true` (builder) | Stack sections to single column on mobile |

### Presentation (DashboardSurfacePresentationConfig)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs, back button |
| `headerContent` | `ReactNode` | Content between title and stats row |
| `sections` | `DashboardSurfaceSection[]` | Grid sections making up the dashboard body |

### DashboardSurfaceSection

```typescript
interface DashboardSurfaceSection {
  key: string;                      // Unique key for React reconciliation
  title?: ReactNode;
  description?: ReactNode;
  content: ReactNode;               // The section body (chart, table, widget)
  span?: number;                    // Grid column span
  chrome?: 'card' | 'plain';       // 'card' adds elevation/border, 'plain' renders inline
  actions?: ReactNode;              // Section header actions
  mobilePriority?: number;          // Lower = renders earlier on mobile
  hideOnMobile?: boolean;           // Hide section on mobile
  mobileSpan?: number;              // Span override for mobile
}
```

### Behavior (DashboardSurfaceBehaviorConfig)

| Property | Type | Description |
|----------|------|-------------|
| `stats` | `StatDef[]` | KPI cards in the top stats row |
| `headerActions` | `SurfaceAction<void>[]` | Header actions ("Export", "Refresh") |
| `onStatClick` | `(stat: StatDef) => void` | KPI stat card click handler |

## Props Interface

```typescript
interface DashboardSurfaceProps {
  config: DashboardSurfaceConfig;
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}
```

## Builder Function

```typescript
function createDashboardSurfaceConfig(
  config: DashboardSurfaceConfig
): DashboardSurfaceConfig
```

Mobile-first defaults:
- `mobileStatsLimit: 2`
- `stackSectionsOnMobile: true`

## Internal Composition

### Patterns Used
- **PatternStatsGrid**: KPI stat row with glass variant and responsive columns

### Primitives Used
- `Button`, `Card`, `Grid`, `Stack`, `Text`, `Flex`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceErrorState**: Error state with retry
- **FadeIn / StaggerChildren**: Entrance animations (personality-driven)
- **SurfaceAccentBarWrapper**: Accent bar (personality-driven)

### Key Internal Logic

1. **Permission filtering**: `filterSurfaceActions()` runs on header actions before rendering
2. **Personality-driven spacing**: Section spacing and heading weight resolve from personality tokens via `resolveStackSpacing()` and `resolveHeadingFontWeight()`
3. **Mobile section prioritization**: Sections are sorted by `mobilePriority` on mobile, with lower values rising to the top
4. **Mobile stats limiting**: Stats array is sliced to `mobileStatsLimit` on mobile
5. **Responsive column count**: `resolveResponsiveColumnCount()` adapts stats columns across breakpoints
6. **Section chrome**: Sections with `chrome: 'plain'` skip the Card wrapper; `chrome: 'card'` (default) adds elevation/border
7. **Grid sections**: Use the 12-column CSS grid with per-section `span` and `mobileSpan` overrides
8. **Error state preserves chrome**: Error state renders inside `PageShellSurface` so header actions remain accessible

## Usage Example

```typescript
const config = createDashboardSurfaceConfig({
  visual: { statsColumns: 4, sectionsColumns: 12 },
  presentation: {
    chrome: { title: 'Dashboard', breadcrumbs: [{ label: 'Home' }] },
    sections: [
      { key: 'revenue', title: 'Revenue', content: <RevenueChart />, span: 8 },
      { key: 'activity', title: 'Recent Activity', content: <ActivityList />, span: 4 },
      { key: 'orders', title: 'Orders', content: <OrdersTable />, span: 12, mobilePriority: 1 },
    ],
  },
  behavior: {
    stats: [
      { label: 'Total Revenue', value: '$12,450', change: '+12%' },
      { label: 'Active Users', value: '1,234', change: '+5%' },
      { label: 'Orders', value: '89', change: '-2%' },
      { label: 'Conversion', value: '3.2%', change: '+0.5%' },
    ],
    headerActions: [
      { id: 'export', label: 'Export', variant: 'secondary' },
      { id: 'refresh', label: 'Refresh', variant: 'primary' },
    ],
  },
});

<DashboardSurface config={config} loading={isLoading} />
```
