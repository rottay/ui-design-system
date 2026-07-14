/**
 * @fileoverview Rustic engine for the Timeline component, using pure HTML/CSS.
 * Renders a fully accessible vertical timeline with zero external CSS
 * dependencies, relying on inline styles and CSS variables for theming.
 *
 * @example
 * ```tsx
 * <Timeline engine="rustic" mode="left">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 * </Timeline>
 * ```
 *
 * @module Timeline/engines/rustic
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { TimelineProps, TimelineItemProps } from '../Timeline.types';
import { TIMELINE_DEFAULTS, TIMELINE_COLOR_MAP, TIMELINE_SIZE_MAP } from '../Timeline.types';

/**
 * Get color value from preset name or return custom color.
 * @param color - Color preset name or custom CSS color
 * @returns CSS color value
 */
function getColorValue(color?: string): string {
  if (!color) return TIMELINE_COLOR_MAP.blue;
  return TIMELINE_COLOR_MAP[color] || color;
}

/**
 * RusticTimeline - Pure HTML/CSS implementation of Timeline.
 *
 * Features:
 * - Zero external dependencies
 * - Fully accessible with semantic HTML
 * - CSS-only styling and animations
 * - Lightweight and performant
 *
 * @example
 * ```tsx
 * <Timeline engine="rustic" mode="left">
 *   <Timeline.Item color="green">Task completed</Timeline.Item>
 *   <Timeline.Item color="blue">In progress</Timeline.Item>
 * </Timeline>
 * ```
 */
function RusticTimeline(props: TimelineProps): React.ReactElement {
  const {
    mode = TIMELINE_DEFAULTS.mode,
    pending,
    pendingDot,
    reverse = TIMELINE_DEFAULTS.reverse,
    items,
    children,
    className = '',
    style,
  } = props;

  // Normalise data source: array prop wins over JSX children
  const timelineItems = items || React.Children.toArray(children);
  const orderedItems = reverse ? [...timelineItems].reverse() : timelineItems;

  // Left padding reserves space for the dot column that sits absolutely positioned
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    padding: `0 0 0 ${TIMELINE_SIZE_MAP.dotOffset}`,
    ...style,
  };

  // The vertical connector line is centred under the dots using calc().
  // When a pending item exists, the line stops short to leave room for it.
  const lineStyle: React.CSSProperties = {
    position: 'absolute',
    left: `calc((${TIMELINE_SIZE_MAP.dotSize} - ${TIMELINE_SIZE_MAP.lineWidth}) / 2)`,
    top: `calc(${TIMELINE_SIZE_MAP.dotSize} / 2)`,
    bottom: pending ? '40px' : `calc(${TIMELINE_SIZE_MAP.dotSize} / 2)`,
    width: TIMELINE_SIZE_MAP.lineWidth,
  };

  return (
    <div
      className={`rottay-timeline rottay-timeline--rustic ${className}`}
      data-part="root"
      style={containerStyle}
      role="list"
      aria-label="Timeline"
    >
      {/* Vertical line */}
      <div style={lineStyle} data-part="connector" aria-hidden="true" />

      {/* Render each timeline entry with its dot, optional label, and content */}
      {orderedItems.map((item, index) => {
        // Extract props uniformly whether item is a React element or plain object
        const isElement = React.isValidElement(item);
        const itemProps: TimelineItemProps = isElement
          ? (item.props as TimelineItemProps)
          : (item as TimelineItemProps);

        const colorValue = getColorValue(itemProps.color);
        const isAlternate = mode === 'alternate';
        const isRight = mode === 'right' || (isAlternate && index % 2 === 1);

        // Right-aligned items flip text direction and padding to the opposite side
        const itemStyle: React.CSSProperties = {
          position: 'relative',
          paddingBottom: TIMELINE_SIZE_MAP.itemPadding,
          textAlign: isRight ? 'right' : 'left',
          paddingLeft: isRight ? '0' : undefined,
          paddingRight: isRight ? TIMELINE_SIZE_MAP.dotOffset : undefined,
          ...itemProps.style,
        };

        // An item's colour can be any CSS colour string (TIMELINE_COLOR_MAP falls
        // through to the raw value), so the fill rides a custom property rather
        // than an enumerable attribute. `data-custom-dot` carries the branch that
        // clears the default circle when the caller supplies its own dot element.
        const dotStyle: React.CSSProperties = {
          position: 'absolute',
          left: `calc(-1 * ${TIMELINE_SIZE_MAP.dotOffset})`,
          top: '4px',
          width: TIMELINE_SIZE_MAP.dotSize,
          height: TIMELINE_SIZE_MAP.dotSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '--ds-timeline-dot-color': colorValue,
        } as React.CSSProperties;

        return (
          <div
            key={index}
            className={itemProps.className}
            data-part="item"
            data-side={isRight ? 'end' : 'start'}
            data-tone={itemProps.color || 'primary'}
            style={itemStyle}
            role="listitem"
          >
            {/* Dot */}
            <div
              style={dotStyle}
              data-part="dot"
              data-custom-dot={itemProps.dot ? 'true' : 'false'}
              aria-hidden="true"
            >
              {itemProps.dot}
            </div>

            {/* Label */}
            {itemProps.label && (
              <div data-part="label" style={{ fontSize: 'var(--ds-timeline-label-font-size, 12px)', marginBottom: '4px' }}>
                {itemProps.label}
              </div>
            )}

            {/* Content */}
            <div data-part="body">{itemProps.children}</div>
          </div>
        );
      })}

      {/* Pending item */}
      {pending && (
        <div
          data-part="item"
          data-side="start"
          data-pending="true"
          style={{ position: 'relative', paddingBottom: TIMELINE_SIZE_MAP.itemPadding }}
          role="listitem"
          aria-label="Pending"
        >
          <div
            data-part="dot"
            data-pending="true"
            style={{
              position: 'absolute',
              left: `calc(-1 * ${TIMELINE_SIZE_MAP.dotOffset})`,
              top: '4px',
              width: TIMELINE_SIZE_MAP.dotSize,
              height: TIMELINE_SIZE_MAP.dotSize,
              animation: 'rottay-timeline-pulse 1.5s ease-in-out infinite',
            }}
            aria-hidden="true"
          >
            {pendingDot}
          </div>
          <div data-part="body">{pending}</div>
        </div>
      )}

      {/* Inline keyframes for the pending dot pulse. Scoped via a unique
          animation name to avoid collisions with other @keyframes on the page. */}
      <style>{`
        @keyframes rottay-timeline-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
}

RusticTimeline.displayName = 'RusticTimeline';

/**
 * RusticTimelineItem - Pure HTML/CSS implementation of Timeline.Item.
 *
 * Note: This is primarily a pass-through component. The actual rendering
 * is handled by the parent Timeline component.
 *
 * @example
 * ```tsx
 * <Timeline.Item color="green" label="2024-01-01">
 *   Task completed successfully
 * </Timeline.Item>
 * ```
 */
const RusticTimelineItem = forwardRef<HTMLDivElement, TimelineItemProps>(
  (props, ref) => {
    const { children } = props;
    return <div ref={ref}>{children}</div>;
  }
);

RusticTimelineItem.displayName = 'RusticTimelineItem';

/**
 * Default export for the rustic Timeline engine.
 *
 * @param props - {@link TimelineProps} controlling mode, items, and pending state.
 * @returns A pure HTML/CSS timeline element with ARIA list semantics.
 */
export default RusticTimeline;
export { RusticTimeline as Timeline, RusticTimelineItem as Item };
