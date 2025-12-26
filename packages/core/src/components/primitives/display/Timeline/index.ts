/**
 * Timeline - Engine Router
 *
 * A component for displaying a sequence of events or activities
 * in chronological order. Supports multiple display modes, custom
 * dot elements, and labels.
 *
 * @example
 * ```tsx
 * import { Timeline } from '@es-rottay/designsystem-core';
 *
 * // Basic usage
 * <Timeline>
 *   <Timeline.Item>First event</Timeline.Item>
 *   <Timeline.Item>Second event</Timeline.Item>
 * </Timeline>
 *
 * // With colors and labels
 * <Timeline mode="alternate">
 *   <Timeline.Item color="green" label="2024-01-01">
 *     Task completed
 *   </Timeline.Item>
 *   <Timeline.Item color="blue" label="2024-01-02">
 *     In progress
 *   </Timeline.Item>
 * </Timeline>
 *
 * // Using items prop
 * <Timeline items={[
 *   { children: 'Event 1', color: 'green' },
 *   { children: 'Event 2', color: 'blue' },
 * ]} />
 * ```
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { TimelineProps } from './types';
import { TimelineItem } from './compound';

// Export types
export type {
  TimelineProps,
  TimelineItemProps,
  TimelineMode,
  TimelineItemColor,
  TimelineItemPosition,
} from './types';

export { TIMELINE_DEFAULTS, TIMELINE_COLOR_MAP, TIMELINE_SIZE_MAP } from './types';

// Export compound components
export { TimelineItem };
export type { TimelineItemProps as TimelineItemComponentProps } from './compound';

// Export base component
export { BaseTimeline, BaseTimelineItem } from './base';

// Create engine-aware Timeline component
export const Timeline = Object.assign(
  createEngineComponent<TimelineProps>('Timeline', {
    titan: () => import('./engines/titan'),
    hermes: () => import('./engines/hermes'),
    apollo: () => import('./engines/apollo'),
  }),
  {
    Item: TimelineItem,
  }
);

export default Timeline;
