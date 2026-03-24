# PatternTimeline

**Source**: `ui-design-system/packages/core/src/components/patterns/timeline/`
**Component**: `PatternTimeline<T>`
**Export**: `import { PatternTimeline } from '@rottay/design-system'`

## Purpose

Renders a chronological list of events with connecting lines, dot markers, and optional date-based grouping. Supports left-aligned, right-aligned, and alternating layouts. Each timeline entry has a semantic type controlling dot color (default, success, warning, error, info), optional user attribution with avatar, and an arbitrary data payload for domain-specific logic.

## Engine Support

| Engine | Implementation |
|--------|---------------|
| classic (Titan) | `engines/classic.tsx` |
| modern (Hermes) | `engines/modern.tsx` |
| rustic (Apollo) | `engines/rustic.tsx` |

All three engines are independently implemented.

## Props Interface

```typescript
interface TimelinePatternProps<T> extends PatternBaseProps {
  /** Ordered list of timeline entries to render. */
  items: TimelineItem<T>[];

  /** Custom renderer for individual timeline entries. */
  renderItem?: (item: TimelineItem<T>, defaultRender: ReactNode) => ReactNode;

  /** Callback fired when a timeline entry is clicked. */
  onItemClick?: (item: TimelineItem<T>) => void;

  /** Layout mode for the timeline rail. */
  mode?: 'left' | 'right' | 'alternate';

  /** Whether to display formatted timestamps. */
  showTimestamp?: boolean;

  /** Content rendered above the timeline. */
  header?: ReactNode;

  /** Content rendered below the timeline. */
  footer?: ReactNode;

  /** Content displayed when items array is empty. */
  emptyState?: ReactNode;

  /** Whether to group items under date headers. */
  groupByDate?: boolean;
}
```

## TimelineItem Type

```typescript
interface TimelineItem<T = unknown> {
  /** Unique key identifying this entry. */
  key: string;

  /** When this event occurred (ISO 8601 string or Date). */
  timestamp: string | Date;

  /** Primary title. Accepts ReactNode. */
  title: ReactNode;

  /** Optional description below the title. */
  description?: ReactNode;

  /** Custom icon for the timeline dot/marker. */
  icon?: ReactNode;

  /** Color of the timeline dot/connector. Overrides type color. */
  color?: string;

  /** Arbitrary data payload for domain logic. */
  data?: T;

  /** User attribution for this event. */
  user?: { name: string; avatar?: string };

  /** Semantic type controlling default dot color. */
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}
```

## Usage Example

```tsx
import { PatternTimeline } from '@rottay/design-system';

<PatternTimeline<OrderEvent>
  items={[
    {
      key: '1',
      timestamp: '2026-03-15T10:00:00Z',
      title: 'Order placed',
      description: 'Customer submitted order #4521',
      type: 'info',
      user: { name: 'Jane Doe', avatar: '/avatars/jane.png' },
      data: { orderId: '4521', action: 'placed' },
    },
    {
      key: '2',
      timestamp: '2026-03-15T12:30:00Z',
      title: 'Payment received',
      type: 'success',
      data: { orderId: '4521', action: 'paid' },
    },
    {
      key: '3',
      timestamp: '2026-03-16T09:15:00Z',
      title: 'Shipped',
      description: 'Tracking: ABC123',
      type: 'default',
    },
  ]}
  mode="alternate"
  groupByDate
  showTimestamp
  onItemClick={(item) => openDetail(item.data?.orderId)}
  footer={<Button onClick={loadMore}>Load more</Button>}
/>
```

## Related Patterns

- **ActivityLog** -- For structured user-action history with filtering. Timeline is for general chronological events.
- **LiveFeed** -- For real-time auto-refreshing feeds. Timeline is for static/paginated event lists.
- **DetailPanel** -- Timeline is commonly rendered as content within a DetailPanel tab (e.g., "Activity" tab).
