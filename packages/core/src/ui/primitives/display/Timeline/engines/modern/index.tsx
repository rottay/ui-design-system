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
import type { TimelineProps, TimelineItemProps } from '../../contracts';
import { TIMELINE_DEFAULTS } from '../../contracts';

/**
 * Scope class for the root. Per-item dot fill is selected from the item's
 * `data-tone` by `foundation/tokens/css/runtime/engines/modern/skin/timeline.css`, which resolves an
 * unrecognised tone to the primary fill.
 */
const SCOPE_CLASSES = 'rottay-timeline rottay-timeline--modern';

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
    <ul
      className={`${SCOPE_CLASSES} timeline timeline-vertical ${className}`}
      data-part="root"
      style={{
        fontSize: 'var(--ds-timeline-content-font-size, inherit)',
        lineHeight: 'var(--ds-timeline-content-line-height, normal)',
        ...style,
      }}
    >
      {orderedItems.map((item, index) => {
        // Items can arrive as React elements (JSX children) or plain objects
        // (items prop). Extract props uniformly for consistent rendering.
        const isElement = React.isValidElement(item);
        const itemProps: TimelineItemProps = isElement
          ? (item.props as TimelineItemProps)
          : (item as TimelineItemProps);

        // Per-item position override takes precedence over the mode-based default
        const positionClass = itemProps.position
          ? itemProps.position === 'left' ? 'timeline-start' : 'timeline-end'
          : getPositionClass(index);
        const side = positionClass === 'timeline-start' ? 'start' : 'end';

        return (
          <li key={index} data-part="item" data-side={side} data-tone={itemProps.color || 'primary'}>
            {index > 0 && <hr data-part="connector" style={{ width: 'var(--ds-timeline-line-width, 2px)' }} />}
            <div className={positionClass}>
              {itemProps.label && (
                <div
                  className="text-sm mb-1"
                  data-part="label"
                  style={{ fontSize: 'var(--ds-timeline-label-font-size, 12px)' }}
                >
                  {itemProps.label}
                </div>
              )}
              <div className={itemProps.className} data-part="body" style={itemProps.style}>
                {itemProps.children}
              </div>
            </div>
            <div className="timeline-middle" data-part="dot">
              {itemProps.dot || (
                <div
                  className="rounded-full"
                  data-part="dot-marker"
                  style={{
                    width: 'var(--ds-timeline-dot-size, 12px)',
                    height: 'var(--ds-timeline-dot-size, 12px)',
                  }}
                />
              )}
            </div>
            {index < orderedItems.length - 1 && <hr data-part="connector" style={{ width: 'var(--ds-timeline-line-width, 2px)' }} />}
          </li>
        );
      })}

      {/* Pending item uses DaisyUI's loading spinner + pulse animation
          to visually indicate an in-progress or upcoming event. */}
      {pending && (
        <li data-part="item" data-side="start" data-pending="true">
          <hr data-part="connector" style={{ width: 'var(--ds-timeline-line-width, 2px)' }} />
          <div className="timeline-start" data-part="body">
            <span data-part="spinner" style={{ display: 'inline-block', width: 16, height: 16, animation: 'spin var(--ds-motion-glacial) linear infinite', marginRight: 8, verticalAlign: 'middle' }} />
            {pending}
          </div>
          <div className="timeline-middle" data-part="dot" data-pending="true">
            <div
              className="rounded-full animate-pulse"
              data-part="dot-marker"
              style={{
                width: 'var(--ds-timeline-dot-size, 12px)',
                height: 'var(--ds-timeline-dot-size, 12px)',
                animation: 'var(--ds-timeline-pending-animation, pulse 2s var(--ds-motion-ease-in-out) infinite)',
              }}
            />
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
