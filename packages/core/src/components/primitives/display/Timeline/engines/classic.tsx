/**
 * @fileoverview Classic engine for the Timeline component, powered by Ant Design.
 * Wraps `antd/Timeline` to provide enterprise-grade chronological displays
 * with left, right, and alternate layout modes.
 *
 * @example
 * ```tsx
 * <Timeline engine="classic" mode="alternate">
 *   <Timeline.Item color="green" label="2024-01-01">Done</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @see https://ant.design/components/timeline
 * @module Timeline/engines/classic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import { Timeline as AntTimeline } from 'antd';
import type { TimelineProps, TimelineItemProps } from '../Timeline.types';
import { TIMELINE_DEFAULTS } from '../Timeline.types';

/**
 * ClassicTimeline - Ant Design implementation of Timeline.
 *
 * Features:
 * - Full Ant Design styling and animations
 * - Support for left, right, and alternate modes
 * - Built-in pending item support
 * - Label support for alternate mode
 *
 * @example
 * ```tsx
 * <Timeline engine="classic" mode="alternate">
 *   <Timeline.Item color="green" label="2024-01-01">
 *     Task completed
 *   </Timeline.Item>
 *   <Timeline.Item color="blue" label="2024-01-02">
 *     In progress
 *   </Timeline.Item>
 * </Timeline>
 * ```
 */
function ClassicTimeline(props: TimelineProps): React.ReactElement {
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

  // Re-map our DS item shape to Ant Design's expected format.
  // We add a numeric key since Ant internally requires unique keys for each item.
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
      {/* When items are provided as an array prop, Ant renders them directly.
          Otherwise fall back to children (JSX composition pattern). */}
      {!items && children}
    </AntTimeline>
  );
}

ClassicTimeline.displayName = 'ClassicTimeline';

/**
 * ClassicTimelineItem - Ant Design implementation of Timeline.Item.
 *
 * @example
 * ```tsx
 * <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
 *   Task completed successfully
 * </Timeline.Item>
 * ```
 */
const ClassicTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
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

ClassicTimelineItem.displayName = 'ClassicTimelineItem';

/**
 * Default export for the classic Timeline engine.
 *
 * @param props - {@link TimelineProps} controlling mode, items, and pending state.
 * @returns An Ant Design Timeline element configured with the DS API.
 */
export default ClassicTimeline;
export { ClassicTimeline as Timeline, ClassicTimelineItem as Item };
