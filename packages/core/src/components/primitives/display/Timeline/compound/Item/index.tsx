/**
 * Timeline.Item - Compound Component
 * Individual item in a timeline
 */

'use client';

import { forwardRef } from 'react';
import type { TimelineItemProps } from '../../types';

/**
 * Timeline.Item component for individual timeline entries.
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
