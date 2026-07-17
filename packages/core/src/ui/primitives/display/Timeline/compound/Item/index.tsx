/**
 * @fileoverview Timeline.Item Compound Component - Rottay Design System
 * @description Individual timeline entry component for displaying events,
 * activities, or milestones within a Timeline.
 *
 * @remarks
 * The Timeline.Item component provides:
 * - Color customization: Preset colors or custom CSS values
 * - Custom dot elements: Replace default dot with icons
 * - Label support: Display timestamps or metadata
 * - Position override: Force left/right in alternate mode
 *
 * This is a pass-through component - the actual rendering is
 * handled by the parent Timeline engine implementation.
 *
 * @example Basic usage
 * ```tsx
 * <Timeline>
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @example With custom dot and label
 * ```tsx
 * <Timeline.Item
 *   dot={<ClockIcon />}
 *   color="primary"
 *   label="10:30 AM"
 * >
 *   Meeting started
 * </Timeline.Item>
 * ```
 *
 * @see {@link Timeline} for parent component
 * @module Timeline/Compound/Item
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import type { TimelineItemProps } from '../../contracts';

/**
 * Timeline.Item component for individual timeline entries.
 *
 * @param props - TimelineItemProps including color, dot, label, position, and children
 * @param ref - Forwarded ref to the root div element
 * @returns A pass-through div whose actual rendering is delegated to the parent Timeline engine
 *
 * @example
 * ```tsx
 * <Timeline>
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 *   <Timeline.Item color="gray">Pending</Timeline.Item>
 * </Timeline>
 * ```
 */
export const TimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (props, ref) => {
    const { children, ...rest } = props;

    // This is a pass-through component that will be rendered by the parent Timeline
    // The actual rendering logic is handled by the engine implementations
    return (
      <div ref={ref} {...rest}>
        {children}
      </div>
    );
  }
);

TimelineItem.displayName = 'Timeline.Item';

export type { TimelineItemProps };
