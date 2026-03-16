'use client';

/**
 * @fileoverview Timeline - Chronological event sequence display.
 * Renders a vertical line connecting event nodes with left, right, or
 * alternating layout modes. Supports custom dot elements, color presets,
 * labels, pending indicators, and reverse ordering.
 *
 * @example
 * ```tsx
 * import { Timeline } from '@rottay/design-system';
 *
 * <Timeline mode="alternate">
 *   <Timeline.Item color="green" label="2024-01-01">Completed</Timeline.Item>
 *   <Timeline.Item color="blue" label="2024-01-02">In progress</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @module Timeline
 * @category Display
 */

import { createEngineComponent } from '../../../../engines/factory';
import type { TimelineProps } from './Timeline.types';
import { TimelineItem } from './compound';

export type {
  TimelineProps,
  TimelineItemProps,
  TimelineMode,
  TimelineItemColor,
  TimelineItemPosition,
} from './Timeline.types';

export { TIMELINE_DEFAULTS, TIMELINE_COLOR_MAP, TIMELINE_SIZE_MAP } from './Timeline.types';

export { TimelineItem };
export type { TimelineItemProps as TimelineItemComponentProps } from './compound';

/**
 * Timeline with compound Item sub-component.
 * Each Item represents a single event node on the vertical line and can
 * carry custom dot elements, color, label, and children content.
 */
export const Timeline = Object.assign(
  createEngineComponent<TimelineProps>('Timeline', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    /** A single event node on the timeline with dot, color, and label support. */
    Item: TimelineItem,
  }
);

export default Timeline;
