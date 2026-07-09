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
 * Map color names to DS token background styles.
 */
const COLOR_STYLE_MAP: Record<string, React.CSSProperties> = {
  blue: { background: 'var(--ds-timeline-color-blue, var(--ds-color-primary))' },
  red: { background: 'var(--ds-timeline-color-red, var(--ds-color-error))' },
  green: { background: 'var(--ds-timeline-color-green, var(--ds-color-success))' },
  gray: { background: 'var(--ds-timeline-color-gray, var(--ds-surface-panel))' },
  primary: { background: 'var(--ds-timeline-color-primary, var(--ds-color-primary))' },
  success: { background: 'var(--ds-timeline-color-success, var(--ds-color-success))' },
  warning: { background: 'var(--ds-timeline-color-warning, var(--ds-color-warning))' },
  error: { background: 'var(--ds-timeline-color-error, var(--ds-color-error))' },
};

const DEFAULT_COLOR_STYLE: React.CSSProperties = { background: 'var(--ds-timeline-color-primary, var(--ds-color-primary))' };

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
      className={`timeline timeline-vertical ${className}`}
      style={{
        fontSize: 'var(--ds-timeline-content-font-size, inherit)',
        lineHeight: 'var(--ds-timeline-content-line-height, normal)',
        color: 'var(--ds-timeline-content-color, inherit)',
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

        const colorStyle = COLOR_STYLE_MAP[itemProps.color as string] || DEFAULT_COLOR_STYLE;

        // Per-item position override takes precedence over the mode-based default
        const positionClass = itemProps.position
          ? itemProps.position === 'left' ? 'timeline-start' : 'timeline-end'
          : getPositionClass(index);

        return (
          <li key={index}>
            {index > 0 && <hr style={{ background: 'var(--ds-timeline-line-color, var(--ds-surface-panel))', width: 'var(--ds-timeline-line-width, 2px)' }} />}
            <div className={positionClass}>
              {itemProps.label && (
                <div
                  className="text-sm mb-1"
                  style={{
                    color: 'var(--ds-timeline-label-color, var(--ds-color-text-secondary))',
                    fontSize: 'var(--ds-timeline-label-font-size, 12px)',
                  }}
                >
                  {itemProps.label}
                </div>
              )}
              <div className={itemProps.className} style={itemProps.style}>
                {itemProps.children}
              </div>
            </div>
            <div className="timeline-middle">
              {itemProps.dot || (
                <div
                  className="rounded-full"
                  style={{
                    width: 'var(--ds-timeline-dot-size, 12px)',
                    height: 'var(--ds-timeline-dot-size, 12px)',
                    borderWidth: 'var(--ds-timeline-dot-border-width, 0)',
                    ...colorStyle,
                  }}
                />
              )}
            </div>
            {index < orderedItems.length - 1 && <hr style={{ background: 'var(--ds-timeline-line-color, var(--ds-surface-panel))', width: 'var(--ds-timeline-line-width, 2px)' }} />}
          </li>
        );
      })}

      {/* Pending item uses DaisyUI's loading spinner + pulse animation
          to visually indicate an in-progress or upcoming event. */}
      {pending && (
        <li>
          <hr style={{ background: 'var(--ds-timeline-line-color, var(--ds-surface-panel))', width: 'var(--ds-timeline-line-width, 2px)' }} />
          <div className="timeline-start">
            <span style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid var(--ds-color-border)', borderTopColor: 'var(--ds-timeline-pending-dot-color, var(--ds-color-primary))', borderRadius: '50%', animation: 'spin 0.6s linear infinite', marginRight: 8, verticalAlign: 'middle' }} />
            {pending}
          </div>
          <div className="timeline-middle">
            <div
              className="rounded-full animate-pulse"
              style={{
                width: 'var(--ds-timeline-dot-size, 12px)',
                height: 'var(--ds-timeline-dot-size, 12px)',
                background: 'var(--ds-timeline-line-color, var(--ds-surface-panel))',
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
