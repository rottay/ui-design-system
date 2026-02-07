'use client';

/**
 * @fileoverview Timeline Component - Rottay Design System
 * @description A component for displaying a sequence of events or activities
 * in chronological order. Supports multiple display modes (left, right, alternate),
 * custom dot elements, color presets, and timestamp labels.
 *
 * @remarks
 * The Timeline component visualizes sequential data with a vertical line connecting
 * chronological events. It's commonly used for:
 * - Activity feeds and logs
 * - Order/delivery tracking
 * - Project milestones and history
 * - Event timelines and schedules
 * - Changelog and version history
 *
 * Key features:
 * - **Multi-engine support**: Classic (Ant Design), Modern (DaisyUI), Rustic (Vanilla)
 * - **Display modes**: Left, right, or alternating item positions
 * - **Color presets**: Blue, red, green, gray, and semantic colors
 * - **Custom dots**: Replace default dots with icons or custom elements
 * - **Labels**: Timestamp or metadata display opposite to content
 * - **Pending state**: Loading indicator for ongoing activities
 * - **Reverse order**: Display newest items first
 *
 * @example Basic timeline with items
 * ```tsx
 * import { Timeline } from '@rottay/design-system';
 *
 * <Timeline>
 *   <Timeline.Item>First event</Timeline.Item>
 *   <Timeline.Item>Second event</Timeline.Item>
 *   <Timeline.Item>Third event</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @example Alternate mode with colors and labels
 * ```tsx
 * <Timeline mode="alternate">
 *   <Timeline.Item color="green" label="2024-01-01">
 *     Task completed
 *   </Timeline.Item>
 *   <Timeline.Item color="blue" label="2024-01-02">
 *     In progress
 *   </Timeline.Item>
 *   <Timeline.Item color="gray" label="2024-01-03">
 *     Pending review
 *   </Timeline.Item>
 * </Timeline>
 * ```
 *
 * @example Using items prop with pending state
 * ```tsx
 * <Timeline
 *   pending="Recording..."
 *   items={[
 *     { children: 'Event 1', color: 'green' },
 *     { children: 'Event 2', color: 'blue' },
 *   ]}
 * />
 * ```
 *
 * @example Multi-engine usage
 * ```tsx
 * // Classic engine (Ant Design - default)
 * <Timeline engine="classic" mode="left">
 *   <Timeline.Item>Event</Timeline.Item>
 * </Timeline>
 *
 * // Modern engine (DaisyUI/Tailwind)
 * <Timeline engine="modern" mode="alternate">
 *   <Timeline.Item color="primary">Event</Timeline.Item>
 * </Timeline>
 *
 * // Rustic engine (Pure HTML/CSS)
 * <Timeline engine="rustic" reverse>
 *   <Timeline.Item>Newest first</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @see {@link TimelineProps} for component props
 * @see {@link TimelineItemProps} for item configuration
 * @see {@link TimelineMode} for display modes
 * @module Timeline
 * @category Display
 * @package @rottay/design-system
 */

import { createEngineComponent } from '../../../../core/engines/factory';
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

// Create engine-aware Timeline component
export const Timeline = Object.assign(
  createEngineComponent<TimelineProps>('Timeline', {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }),
  {
    Item: TimelineItem,
  }
);

export default Timeline;
