/**
 * @fileoverview Timeline compound components barrel export.
 * Re-exports TimelineItem for use as Timeline.Item in the compound pattern.
 *
 * @remarks
 * This module exports compound components for the Timeline component:
 *
 * **TimelineItem:**
 * Individual timeline entry for displaying events, activities, or milestones.
 * Acts as a pass-through; the parent Timeline engine handles actual rendering.
 *
 * @example
 * ```tsx
 * import { Timeline } from '@rottay/design-system';
 *
 * <Timeline>
 *   <Timeline.Item color="green">Completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @see {@link Timeline} for the parent component
 * @module Timeline/compound
 * @category Display
 * @package @rottay/design-system
 */

export { TimelineItem } from './Item';

export type { TimelineItemProps } from './Item';
