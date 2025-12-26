/**
 * Timeline - Titan Engine (Ant Design)
 *
 * Renders the Timeline component using Ant Design's Timeline component.
 * Provides enterprise-grade features with full accessibility support.
 *
 * @see https://ant.design/components/timeline
 */

'use client';

import React, { forwardRef } from 'react';
import { Timeline as AntTimeline } from 'antd';
import type { TimelineProps, TimelineItemProps } from '../../types';
import { TIMELINE_DEFAULTS } from '../../types';

/**
 * TitanTimeline - Ant Design implementation of Timeline.
 *
 * Features:
 * - Full Ant Design styling and animations
 * - Support for left, right, and alternate modes
 * - Built-in pending item support
 * - Label support for alternate mode
 *
 * @example
 * ```tsx
 * <Timeline engine="titan" mode="alternate">
 *   <Timeline.Item color="green" label="2024-01-01">
 *     Task completed
 *   </Timeline.Item>
 *   <Timeline.Item color="blue" label="2024-01-02">
 *     In progress
 *   </Timeline.Item>
 * </Timeline>
 * ```
 */
function TitanTimeline(props: TimelineProps): React.ReactElement {
  const {
    mode = TIMELINE_DEFAULTS.mode,
    pending,
    pendingDot,
    reverse = TIMELINE_DEFAULTS.reverse,
    items,
    children,
    className,
    style,
  } = props;

  // Convert items to Ant Design format if provided
  const antItems = items?.map((item, index) => ({
    key: index,
    dot: item.dot,
    color: item.color,
    label: item.label,
    position: item.position,
    children: item.children,
    className: item.className,
    style: item.style,
  }));

  return (
    <AntTimeline
      mode={mode}
      pending={pending}
      pendingDot={pendingDot}
      reverse={reverse}
      items={antItems}
      className={className}
      style={style}
    >
      {!items && children}
    </AntTimeline>
  );
}

TitanTimeline.displayName = 'TitanTimeline';

/**
 * TitanTimelineItem - Ant Design implementation of Timeline.Item.
 *
 * @example
 * ```tsx
 * <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
 *   Task completed successfully
 * </Timeline.Item>
 * ```
 */
const TitanTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (props, ref) => {
    const {
      dot,
      color,
      label,
      position,
      children,
      className,
      style,
    } = props;

    return (
      <AntTimeline.Item
        dot={dot}
        color={color}
        label={label}
        position={position}
        className={className}
        style={style}
      >
        <span ref={ref}>{children}</span>
      </AntTimeline.Item>
    );
  }
);

TitanTimelineItem.displayName = 'TitanTimelineItem';

export default TitanTimeline;
export { TitanTimeline as Timeline, TitanTimelineItem as Item };
