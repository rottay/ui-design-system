/**
 * @fileoverview Type definitions for the Timeline pattern component.
 * Defines the generic {@link TimelineItem} shape (key, timestamp, title,
 * semantic type, optional user attribution) and {@link TimelinePatternProps}
 * controlling layout mode, date grouping, and custom item rendering.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../foundation/types';

/**
 * Represents a single entry in the timeline.
 *
 * Each item has a timestamp for ordering, a title, and optional metadata
 * including semantic type (for color-coded dots), user attribution, and
 * a generic data payload.
 *
 * @typeParam T - Shape of the optional `data` payload attached to each item.
 */
export interface TimelineItem<T = unknown> {
  /** Unique key identifying this timeline entry. */
  key: string;

  /**
   * When this event occurred. Accepts an ISO 8601 string or a Date object.
   * Used for ordering and optional date-group headers.
   */
  timestamp: string | Date;

  /**
   * Primary title of the timeline entry.
   * Accepts ReactNode for rich formatting (e.g., inline links or emphasis).
   */
  title: ReactNode;

  /** Optional description or body content displayed below the title. */
  description?: ReactNode;

  /** Custom icon rendered on the timeline dot/marker for this entry. */
  icon?: ReactNode;

  /**
   * Color of the timeline dot/connector. Accepts a design-system token
   * or CSS color string. Overrides the color implied by `type`.
   */
  color?: string;

  /**
   * Arbitrary data payload associated with this entry.
   * Passed through to `renderItem` and `onItemClick` for domain logic.
   */
  data?: T;

  /** User who performed or is associated with this timeline event. */
  user?: {
    /** Display name of the user. */
    name: string;
    /** URL to the user's avatar image. */
    avatar?: string;
  };

  /**
   * Semantic type controlling the default dot color and styling.
   * - `'default'`: Neutral appearance.
   * - `'success'`: Green/positive indicator.
   * - `'warning'`: Yellow/caution indicator.
   * - `'error'`: Red/negative indicator.
   * - `'info'`: Blue/informational indicator.
   */
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

/**
 * Props for the Timeline pattern component.
 *
 * Renders a chronological list of events with connecting lines, dot markers,
 * and optional date-based grouping. Supports left-aligned, right-aligned,
 * and alternating layouts.
 *
 * @typeParam T - Shape of the data payload on each {@link TimelineItem}.
 *
 * @example
 * ```tsx
 * <Timeline
 *   items={[
 *     { key: '1', timestamp: '2026-03-15T10:00:00Z', title: 'Order placed',
 *       type: 'info', user: { name: 'Jane' } },
 *     { key: '2', timestamp: '2026-03-15T12:30:00Z', title: 'Payment received',
 *       type: 'success' },
 *   ]}
 *   mode="alternate"
 *   groupByDate
 *   showTimestamp
 *   onItemClick={(item) => openDetail(item.key)}
 * />
 * ```
 */
export interface TimelinePatternProps<T> extends PatternBaseProps {
  /** Ordered list of timeline entries to render. */
  items: TimelineItem<T>[];

  /**
   * Custom renderer for individual timeline entries. Receives the item
   * and the default rendered output for selective overrides.
   */
  renderItem?: (item: TimelineItem<T>, defaultRender: ReactNode) => ReactNode;

  /** Callback fired when a timeline entry is clicked. */
  onItemClick?: (item: TimelineItem<T>) => void;

  /**
   * Layout mode for the timeline rail.
   * - `'left'`: All items on the left side of the rail.
   * - `'right'`: All items on the right side of the rail.
   * - `'alternate'`: Items alternate between left and right sides.
   */
  mode?: 'left' | 'right' | 'alternate';

  /** Whether to display formatted timestamps alongside each entry. */
  showTimestamp?: boolean;

  /** Content rendered above the timeline (e.g., a title or summary). */
  header?: ReactNode;

  /** Content rendered below the timeline (e.g., a "load more" button). */
  footer?: ReactNode;

  /** Content displayed when the `items` array is empty. */
  emptyState?: ReactNode;

  /**
   * Whether to group items under date headers (e.g., "March 15, 2026").
   * Groups are determined by the date portion of each item's `timestamp`.
   */
  groupByDate?: boolean;
}
