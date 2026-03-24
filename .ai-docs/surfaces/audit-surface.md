# AuditSurface

> Source: `ui-design-system/packages/core/src/components/surfaces/audit/index.tsx`

## Purpose

Config-driven audit log viewer for compliance frameworks (HIPAA, SOC2, GDPR). Renders a filterable, exportable audit trail with severity indicators and customizable entry rendering. The surface owns the table mechanics and filter layout while the app owns the data fetching and domain-specific renderers.

## Config Structure

### AuditSurfaceConfig

```typescript
interface AuditSurfaceConfig {
  visual: AuditSurfaceVisualConfig;
  presentation: AuditSurfacePresentationConfig;
  behavior: AuditSurfaceBehaviorConfig;
  permissions?: SurfacePermissionsConfig;
}
```

### Visual (AuditSurfaceVisualConfig)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `density` | `'compact' \| 'comfortable'` | -- | Table density (affects padding) |
| `maxHeight` | `string` | -- | Constrain table height, enable scrolling |
| `stackOnMobile` | `boolean` | `true` (builder) | Stack sections on mobile |
| `compactEntriesOnMobile` | `boolean` | `true` (builder) | Compact entries on mobile |

### Presentation (AuditSurfacePresentationConfig)

| Property | Type | Description |
|----------|------|-------------|
| `chrome` | `SurfacePageChrome` | Page title, breadcrumbs, back button |
| `renderEntry` | `(entry: AuditEntry) => ReactNode` | Custom entry renderer (overrides default) |

### Behavior (AuditSurfaceBehaviorConfig)

| Property | Type | Description |
|----------|------|-------------|
| `columns` | `AuditColumn[]` | Column definitions for table |
| `entries` | `AuditEntry[]` | **Required** -- audit log entries |
| `filters` | `AuditFilter[]` | **Required** -- filter definitions for toolbar |
| `filterValues` | `Record<string, unknown>` | Current filter state |
| `onFilterChange` | `(filters) => void` | Filter change callback |
| `pagination` | `PaginationConfig` | Pagination config |
| `onExport` | `(format: 'csv' \| 'json' \| 'pdf') => void` | Export callback |

### Supporting Types

```typescript
interface AuditEntry {
  id: string;
  timestamp: string;           // ISO timestamp
  actor: string;               // Who performed the action
  action: string;              // Action verb ("created", "updated", "deleted")
  resource: string;            // Target resource
  details?: string;            // Human-readable description
  severity?: 'info' | 'warning' | 'critical';
  metadata?: Record<string, unknown>;  // Drill-down inspection data
}

interface AuditColumn {
  key: string;
  label: string;
  width?: number | string;
  sortable?: boolean;
  render?: (value: unknown, entry: AuditEntry) => ReactNode;
}

interface AuditFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date-range' | 'multi-select';
  options?: { label: string; value: string }[];
  placeholder?: string;
}
```

## Props Interface

```typescript
interface AuditSurfaceProps {
  config: AuditSurfaceConfig;
  loading?: boolean;
}
```

## Builder Function

```typescript
function createAuditSurfaceConfig(
  config: AuditSurfaceConfig
): AuditSurfaceConfig
```

Mobile-first defaults:
- `stackOnMobile: true`
- `compactEntriesOnMobile: true`

## Internal Composition

### Patterns Used
- **PatternFilterPanel**: Filter bar with active count badge (downcasts date-range to text, multi-select to select)

### Primitives Used
- `Badge`, `Box`, `Button`, `Card`, `Flex`, `Stack`, `Table`, `Tag`, `Text`

### Surface Infrastructure
- **PageShellSurface**: Page chrome wrapper
- **SurfaceEmptyState**: Empty state when no entries match filters

### Key Internal Logic

1. **Severity color mapping**: Maps `critical` to error-500, `warning` to warning-500, `info`/undefined to text-muted
2. **Export buttons**: Renders CSV/JSON/PDF export buttons only when `onExport` is provided
3. **Default entry renderer**: Compact layout with severity Tag + action text + actor/resource when no custom `renderEntry` is provided
4. **Filter type downcasting**: The audit surface supports richer filter types (date-range, multi-select) than `PatternFilterPanel` natively handles; it downcasts to closest supported primitive type while still passing raw values to `onFilterChange`
5. **Scrollable audit log**: `maxHeight` enables overflow scrolling for compliance dashboards with thousands of entries
6. **Density control**: Compact density reduces padding from 12px to 8px per entry
7. **Pagination display**: Simple "Page X - N total entries" text aligned to end

## Usage Example

```typescript
const config = createAuditSurfaceConfig({
  visual: { density: 'compact', maxHeight: '600px' },
  presentation: {
    chrome: { title: 'Audit Log', breadcrumbs: [{ label: 'Compliance' }] },
  },
  behavior: {
    columns: [
      { key: 'timestamp', label: 'Time', width: 180 },
      { key: 'actor', label: 'User', width: 200 },
      { key: 'action', label: 'Action' },
      { key: 'resource', label: 'Resource' },
    ],
    entries: auditEntries,
    filters: [
      { key: 'actor', label: 'User', type: 'text', placeholder: 'Search by user...' },
      { key: 'action', label: 'Action', type: 'select', options: actionOptions },
      { key: 'severity', label: 'Severity', type: 'multi-select', options: severityOptions },
      { key: 'dateRange', label: 'Date Range', type: 'date-range' },
    ],
    filterValues: currentFilters,
    onFilterChange: setFilters,
    pagination: { current: 1, total: 1500, pageSize: 50 },
    onExport: (format) => exportAuditLog(format),
  },
});

<AuditSurface config={config} loading={isLoading} />
```
