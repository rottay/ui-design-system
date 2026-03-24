# PatternListToolbar

**Source**: `ui-design-system/packages/core/src/components/patterns/list-toolbar/`
**Component**: `PatternListToolbar` (alias: `ListToolbar`)
**Export**: `import { PatternListToolbar, ListToolbar } from '@rottay/design-system'`

## Purpose

Professional two-row toolbar designed for data tables and list views. The first row contains the title with item count, search input, and primary CTA. The second row provides filter pills (segmented controls), view mode toggle (list/cards), density control (compact/comfortable/spacious), column settings, saved views, and export action. Designed as the companion toolbar for `PatternDataTable`.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

## Props Interface

```typescript
interface ListToolbarProps extends PatternBaseProps {
  // Title section
  title: string;
  icon?: ReactNode;
  totalCount: number;

  // Search
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filterPills?: FilterPillConfig[];
  activeFilters?: Record<string, unknown>;
  onFilterChange?: (key: string, value: unknown) => void;
  onClearFilters?: () => void;
  activeFilterCount?: number;

  // View controls
  viewMode: ViewMode;                    // 'list' | 'cards'
  onViewModeChange: (mode: ViewMode) => void;
  density: DensityKey;                   // 'compact' | 'comfortable' | 'spacious'
  onDensityChange: (density: DensityKey) => void;

  // Slot: column settings (rendered inside settings dropdown)
  columnSettingsContent?: ReactNode;
  // Slot: saved views (rendered inside settings dropdown)
  savedViewsContent?: ReactNode;

  // Primary action
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };

  // Export
  onExport?: () => void;
}
```

## Companion Types

```typescript
interface FilterPillConfig {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
}

type DensityKey = 'compact' | 'comfortable' | 'spacious';
type ViewMode = 'list' | 'cards';
```

## Usage Example

```tsx
import { PatternListToolbar } from '@rottay/design-system';

<PatternListToolbar
  title="Team Members"
  totalCount={members.length}
  search={searchQuery}
  onSearchChange={setSearchQuery}
  searchPlaceholder="Search members..."
  filterPills={[
    { key: 'status', label: 'Status', value: statusFilter,
      options: [{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }] },
    { key: 'role', label: 'Role', value: roleFilter,
      options: [{ label: 'Admin', value: 'admin' }, { label: 'Member', value: 'member' }] },
  ]}
  activeFilters={activeFilters}
  onFilterChange={(key, value) => updateFilter(key, value)}
  onClearFilters={() => resetFilters()}
  viewMode={viewMode}
  onViewModeChange={setViewMode}
  density={density}
  onDensityChange={setDensity}
  primaryAction={{ label: 'Invite Member', onClick: openInviteDialog, icon: <PlusIcon /> }}
  onExport={exportToCsv}
  columnSettingsContent={<ColumnSettingsDropdown {...columnSettingsProps} />}
/>
```

## Related Patterns

- **DataTable** -- ListToolbar is typically passed to DataTable's `toolbar` slot.
- **ColumnSettings** -- Rendered inside the toolbar's settings dropdown via `columnSettingsContent`.
- **SavedViewsBar** -- Can be embedded via `savedViewsContent` slot.
- **FilterPanel** -- More advanced filtering; ListToolbar's pills handle simple segmented filters.
