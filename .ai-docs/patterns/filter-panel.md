# PatternFilterPanel

**Source**: `ui-design-system/packages/core/src/components/patterns/filter-panel/`
**Component**: `PatternFilterPanel`
**Export**: `import { PatternFilterPanel } from '@rottay/design-system'`

## Purpose

Renders a configurable panel of filter controls that can be laid out inline (horizontal row), stacked vertically, or as a sidebar. Supports collapsible sections, explicit apply/reset actions, active filter count badge, and seven filter control types (text, select, multi-select, date, date-range, number-range, boolean). Designed for pages where the user needs to narrow down data via multiple criteria.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

## Props Interface

```typescript
interface FilterPanelProps extends PatternBaseProps {
  /** Array of filter definitions describing each filter control. */
  filters: FilterDef[];

  /** Current filter values keyed by filter field name. */
  values: Record<string, unknown>;

  /** Called whenever any filter value changes. */
  onChange: (values: Record<string, unknown>) => void;

  /** Called when the user clicks the reset button. */
  onReset?: () => void;

  /** Layout mode for arranging filter controls. */
  layout?: 'inline' | 'stacked' | 'sidebar';

  /** Whether the filter panel can be collapsed/expanded. */
  collapsible?: boolean;

  /** Initial collapsed state when collapsible is true. */
  defaultCollapsed?: boolean;

  /** Title text displayed at the top of the filter panel. */
  title?: string;

  /** Whether to show the reset button. */
  showReset?: boolean;

  /** Whether to show an explicit apply button (deferred filtering). */
  showApply?: boolean;

  /** Called when the user clicks apply with current filter values. */
  onApply?: (values: Record<string, unknown>) => void;

  /** Number of currently active filters (displayed as badge). */
  activeCount?: number;
}
```

## FilterDef Type

```typescript
interface FilterDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multi-select' | 'date' | 'date-range' | 'number-range' | 'boolean';
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: unknown;
}
```

## Composition Hook

`useFilterPanel(options)` provides filter values state management, active count computation, and reset logic.

## Usage Example

```tsx
import { PatternFilterPanel } from '@rottay/design-system';

<PatternFilterPanel
  filters={[
    { key: 'status', label: 'Status', type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
      ]},
    { key: 'dateRange', label: 'Date Range', type: 'date-range' },
    { key: 'search', label: 'Search', type: 'text', placeholder: 'Filter by name...' },
    { key: 'verified', label: 'Verified Only', type: 'boolean' },
  ]}
  values={filterValues}
  onChange={setFilterValues}
  onReset={() => setFilterValues({})}
  layout="inline"
  showReset
  activeCount={Object.keys(filterValues).length}
/>
```

## Related Patterns

- **FilterBuilder** -- More powerful: nested AND/OR groups, 15 operators, per-field customization. Use FilterBuilder for advanced/power-user scenarios; FilterPanel for standard filtering.
- **ListToolbar** -- Has built-in segmented filter pills for simple cases.
- **DataTable** -- FilterPanel output feeds into DataTable's `filterValues` prop.
