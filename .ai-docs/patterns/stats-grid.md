# PatternStatsGrid

**Source**: `ui-design-system/packages/core/src/components/patterns/stats-grid/`
**Component**: `PatternStatsGrid`
**Export**: `import { PatternStatsGrid } from '@rottay/design-system'`

## Purpose

Renders a responsive grid of stat cards, each driven by a `StatDef`. Supports inline D3-powered sparkline charts, animated value counting on mount, trend indicators (increase/decrease/neutral), and multiple visual variants. Commonly used as a dashboard summary row above data tables.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

All three engines are independently implemented.

## Props Interface

```typescript
interface StatsGridProps extends PatternBaseProps {
  /** Array of stat definitions driving individual stat cards. */
  stats: StatDef[];

  /** Custom renderer for individual stat cards. */
  renderStat?: (stat: StatDef, defaultRender: ReactNode) => ReactNode;

  /** Number of columns in the grid layout. Responsive default if omitted. */
  columns?: number;

  /** Whether to render D3-powered sparkline mini-charts. */
  sparkline?: boolean;

  /** Gap between stat cards (px or CSS string). */
  gap?: number | string;

  /** Visual variant applied to each card. */
  variant?: 'default' | 'outlined' | 'filled' | 'glass';

  /** Animate stat values counting up from zero on mount. */
  animate?: boolean;

  /** Click handler fired when a stat card is clicked. */
  onStatClick?: (stat: StatDef) => void;
}
```

## StatDef Type

```typescript
interface StatDef {
  key: string;
  label: string;
  value: number | string;
  previousValue?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  prefix?: string;        // e.g. "$"
  suffix?: string;        // e.g. "%"
  icon?: ReactNode;
  href?: string;
  sparklineData?: number[];
  color?: string;
  description?: string;
}
```

## Usage Example

```tsx
import { PatternStatsGrid } from '@rottay/design-system';

<PatternStatsGrid
  stats={[
    {
      key: 'revenue',
      label: 'Revenue',
      value: 45200,
      prefix: '$',
      change: 12.5,
      changeType: 'increase',
      sparklineData: [30, 35, 42, 45],
    },
    {
      key: 'users',
      label: 'Active Users',
      value: 1280,
      change: -3.2,
      changeType: 'decrease',
    },
    {
      key: 'orders',
      label: 'Orders',
      value: 342,
      suffix: '/mo',
      changeType: 'neutral',
    },
  ]}
  columns={3}
  sparkline
  variant="outlined"
  animate
  onStatClick={(stat) => navigateTo(stat.href)}
/>
```

## Related Patterns

- **StatsHeader** -- Similar purpose but with sparkline dots, gradient glow, and insight text. More premium/operational aesthetic for workbench pages.
- **DataTable** -- StatsGrid is commonly placed above a DataTable to provide summary metrics.
