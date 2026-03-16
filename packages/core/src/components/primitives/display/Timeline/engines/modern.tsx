/**
 * @fileoverview Modern engine for the Timeline component, powered by DaisyUI/Tailwind.
 * Renders a vertical timeline using DaisyUI's `timeline` utility classes,
 * with automatic alternate positioning and color-coded dots.
 *
 * @example
 * ```tsx
 * <Timeline engine="modern" mode="alternate">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @see https://daisyui.com/components/timeline/
 * @module Timeline/engines/modern
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { TimelineProps, TimelineItemProps } from '../Timeline.types';
import { TIMELINE_DEFAULTS } from '../Timeline.types';

/**
 * Map color names to DaisyUI background classes.
 */
const COLOR_CLASS_MAP: Record<string, string> = {
  blue: 'bg-primary',
  red: 'bg-error',
  green: 'bg-success',
  gray: 'bg-neutral',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-error',
};

/**
 * ModernTimeline - DaisyUI implementation of Timeline.
 *
 * Features:
 * - Uses DaisyUI's timeline component classes
 * - Tailwind CSS utility classes for styling
 * - Responsive and customizable
 *
 * @example
 * ```tsx
 * <Timeline engine="modern" mode="alternate">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 * </Timeline>
 * ```
 */
function ModernTimeline(props: TimelineProps): React.ReactElement {
  const {
    mode = TIMELINE_DEFAULTS.mode,
    pending,
    reverse = TIMELINE_DEFAULTS.reverse,
    items,
    children,
    className = '',
    style,
  } = props;

  // Normalise data source: items array prop takes priority over JSX children.
  // React.Children.toArray strips nulls and assigns stable keys.
  const timelineItems = items || React.Children.toArray(children);
  const orderedItems = reverse ? [...timelineItems].reverse() : timelineItems;

  /**
   * Resolves the DaisyUI position class for a given item index.
   * In 'alternate' mode, even items go left and odd items go right.
   */
  const getPositionClass = (index: number): string => {
    if (mode === 'left') return 'timeline-start';
    if (mode === 'right') return 'timeline-end';
    return index % 2 === 0 ? 'timeline-start' : 'timeline-end';
  };

  return (
    <ul className={`timeline timeline-vertical ${className}`} style={style}>
      {orderedItems.map((item, index) => {
        // Items can arrive as React elements (JSX children) or plain objects
        // (items prop). Extract props uniformly for consistent rendering.
        const isElement = React.isValidElement(item);
        const itemProps: TimelineItemProps = isElement
          ? (item.props as TimelineItemProps)
          : (item as TimelineItemProps);

        const colorClass = COLOR_CLASS_MAP[itemProps.color as string] || 'bg-primary';

        // Per-item position override takes precedence over the mode-based default
        const positionClass = itemProps.position
          ? itemProps.position === 'left' ? 'timeline-start' : 'timeline-end'
          : getPositionClass(index);

        return (
          <li key={index}>
            {index > 0 && <hr className="bg-base-300" />}
            <div className={positionClass}>
              {itemProps.label && (
                <div className="text-sm text-base-content/60 mb-1">
                  {itemProps.label}
                </div>
              )}
              <div className={itemProps.className} style={itemProps.style}>
                {itemProps.children}
              </div>
            </div>
            <div className="timeline-middle">
              {itemProps.dot || (
                <div className={`w-3 h-3 rounded-full ${colorClass}`} />
              )}
            </div>
            {index < orderedItems.length - 1 && <hr className="bg-base-300" />}
          </li>
        );
      })}

      {/* Pending item uses DaisyUI's loading spinner + pulse animation
          to visually indicate an in-progress or upcoming event. */}
      {pending && (
        <li>
          <hr className="bg-base-300" />
          <div className="timeline-start">
            <span className="loading loading-spinner loading-sm mr-2" />
            {pending}
          </div>
          <div className="timeline-middle">
            <div className="w-3 h-3 rounded-full bg-base-300 animate-pulse" />
          </div>
        </li>
      )}
    </ul>
  );
}

ModernTimeline.displayName = 'ModernTimeline';

/**
 * ModernTimelineItem - DaisyUI implementation of Timeline.Item.
 *
 * Note: This is primarily a pass-through component. The actual rendering
 * is handled by the parent Timeline component.
 *
 * @example
 * ```tsx
 * <Timeline.Item color="green" label="Jan 2024">
 *   Task completed successfully
 * </Timeline.Item>
 * ```
 */
const ModernTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (props, ref) => {
    const { children } = props;
    return <div ref={ref}>{children}</div>;
  }
);

ModernTimelineItem.displayName = 'ModernTimelineItem';

/**
 * Default export for the modern Timeline engine.
 *
 * @param props - {@link TimelineProps} controlling mode, items, and pending state.
 * @returns A DaisyUI-styled vertical timeline element.
 */
export default ModernTimeline;
export { ModernTimeline as Timeline, ModernTimelineItem as Item };
